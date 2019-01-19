// const { updateDb } = require('./tools/update-db');
const methodProps = {
  state: 'open',
  base: 'master',
  sort: 'created',
  direction: 'asc',
  page: 1,
  // eslint-disable-next-line camelcase
  per_page: 100
};
const { PR } = require('./models/index');

class Presolver {
  constructor(context, { owner, repo, ...config }) {
    this.context = context;
    this.github = context.github;
    this.config = {
      ...require('../../lib/defaults'),
      ...(config || {}),
      ...{
        owner,
        repo
      }
    };
    this.pullRequest = {};
    this.conflictingFiles = [];
		// this._updateDb = updateDb;
    this.firstPR = null;
    this.lastPR = null;
    this.prPropsToGet = ['number', 'user', 'title', 'updated_at'];
    this.methodProps = methodProps;
    this.methodProps.owner = this.config.owner;
    this.methodProps.repo = this.config.repo;
  }

  async presolve(pullRequest) {
    Object.assign(this.pullRequest, pullRequest);
    // await this._updateDb(this.context);
    console.log(this.methodProps);
    await this._ensurePresolverLabelExists();
    await this._getState();
    const labelObj = this.config.labelPRConflict;
    if (this.conflictingFiles.length) {
      await this._addLabel(labelObj);
    }
  }
/*
  async _getPRs() {

    const Pr = require('../lib/get-prs/index-probot')
    (this.context, totalPRs, firstPR, lastPR, prPropsToGet);

  }
*/
  async getCount() {
    const config = this.config;
    const { owner, repo } = config;
    const {
      data: { total_count: count }
    } = await this.github.search
      .issues({
        q: `repo:${owner}/${repo}+is:open+type:pr+base:master`,
        sort: 'created',
        order: 'asc',
        page: 1,
        // eslint-disable-next-line camelcase
        per_page: 1
      })
      .catch(err => {
        console.log(err);
      });
    return count;
  }

  async getRange() {
    // eslint-disable-next-line camelcase
    this.methodProps.per_page = 1;
    let response = await this.github.pullRequests.list(this.methodProps);
    const firstPR = response.data[0].number;
    this.methodProps.direction = 'desc';
    response = await this.github.pullRequests.list(this.methodProps);
    const lastPR = response.data[0].number;
    this.firstPR = firstPR;
    this.lastPR = lastPR;
    return [firstPR, lastPR];
  }

  async getFirst() {
    // eslint-disable-next-line camelcase
    this.methodProps.per_page = 1;
    this.methodProps.direction = 'asc';
    let response = await this.github.pullRequests.list(this.methodProps);
    return response.data[0].number;
  }

  async getFirstAndLast() {
    const [ { firstPR, lastPR }] = await PR.aggregate(
      [{
        $group: {
          _id: null,
          firstPR: { $min: '$_id' },
          lastPR: { $max: '$_id' }
        }
      }]
    );
    this.firstPR = firstPR;
    this.lastPR = lastPR;
    this.totalPRs = await this.getCount().then(data => data);
  }

  async prsPaginate() {
    const prFilter = (prs, first, last, prPropsToGet) => {
      const filtered = [];
      for (let pr of prs) {
        if (pr.number >= first && pr.number <= last) {
          const propsObj = prPropsToGet.reduce((obj, prop) => {
            obj[prop] = pr[prop];
            return obj;
          }, {});
          filtered.push(propsObj);
        }
        if (pr.number >= last) {
          done = true;
          return filtered;
        }
      }
      return filtered;
    };

    // will be true when lastPR is seen in paginated results
    let done = false;
    let response = await this.github.pullRequests.list(this.methodProps);
    let { data } = response;
    data = prFilter(data, this.firstPR, this.lastPR, this.prPropsToGet);
    while (this.github.hasNextPage(response) && !done) {
      response = await this.github.getNextPage(response);
      let dataFiltered = prFilter(
        response.data, this.firstPR, this.lastPR, this.prPropsToGet);
      data = data.concat(dataFiltered);
      this.progressBar.increment(dataFiltered.length);
    }
    return data;
  }

  async getUserInput(rangeType = '', start, end) {
    let data, firstPR, lastPR;
    if (rangeType === 'all') {
      data = await this.getRange().then(data => data);
      firstPR = data[0];
      lastPR = data[1];
    } else {
      // let [type, start, end] = process.argv.slice(2);
      data = await this.getRange().then(data => data);
      firstPR = data[0];
      lastPR = data[1];
      if (rangeType !== 'all' && rangeType !== 'range') {
        throw 'Please specify either all or range for 1st arg.';
      }
      if (rangeType === 'range') {
        start = parseInt(start, 10);
        end = parseInt(end, 10);
        if (!start || !end) {
      throw 'Specify both a starting PR # (2nd arg) and ending PR # (3rd arg).';
        }
        if (start > end) {
          throw 'Starting PR # must be less than or equal to end PR #.';
        }
        if (start < firstPR) {
      throw `Starting PR # can not be less than first open PR # (${firstPR})`;
        }
        firstPR = start;
        if (end > lastPR) {
      throw `Ending PR # can not be greater than last open PR # (${lastPR})`;
        }
        lastPR = end;
      }
    }
    const totalPRs = await this.getCount().then(data => data);
    this.totalPRs = totalPRs;
    this.firstPR = firstPR;
    this.lastPR = lastPR;
    // return { totalPRs, firstPR, lastPR };
  }

  async getPRs() {
    if (!this.firstPR) {
      await this.getFirstAndLast();
    }
  //  this.progressBar.start(this.totalPRs, 0);
    let openPRs = await this.prsPaginate(
      // this.github.pullRequests.list
    );
    // this.progressBar.update(this.totalPRs);
    // this.progressBar.stop();
    console.log(`# of PRs retrieved: ${openPRs.length}`);
    return openPRs;
  }

  async getFiles(number) {
    let response = await this.github.pullRequests.listFiles({
      number, ...this.methodProps
    });

    let { data } = response;
    while (this.github.hasNextPage(response)) {
      response = await this.github.getNextPage(response);
      let { data: moreData } = response;
      data = data.concat(moreData);
    }
    return data;
  }

  async getFilenames(number) {
    const files = await this.getFiles(number);
    const filenames = files.map(({ filename }) => filename);
    return filenames;
  }
  async _getState() {
    // const { owner, repo } = this.config;

    // Object.assign(this.context, context);
    // console.log(context, this.context);
    // const getInfo = await INFO.find({}).sort({lastUpdate: -1});
    // const lastUpdate = JSON.parse(JSON.stringify(getInfo))[0].lastUpdate;
    // const count = await this.github.search({
    //   q: `repo:${owner}/${repo}+is:open+type:pr+base:master`,
    //   since: lastUpdate,
    //   sort: 'created',
    //   order: 'asc',
    //   page: 1,
    //   // eslint-disable-next-line camelcase
    //   per_page: 1
    // })
    // .catch(err => {
    //    console.log(err);
    // });
    // this.context.log(count);
    // return count;
    // console.log(count);
    // console.log(JSON.parse(JSON.stringify(lastUpdate))[0]);
    // console.log(this.context)
    // console.log(this.context.issue())
    const files = await
      this.github.pullRequests.listFiles(this.context.issue());
    // console.log(files)
    const { owner, repo } = this.config;
    const prs =
      (await this.github.pullRequests.list({ owner, repo }).data) || [];
    // console.log(prs)
    await this._getConflictingFiles(prs, files);
  }

  async _getConflictingFiles(prs, files) {
    const { owner, repo } = this.config;
    const github = this.github;
    const conflictingFiles = this.conflictingFiles;
    console.log(prs, files);
    prs.forEach(pr => {
      const prIssue = {
        number: pr.number,
        owner: owner,
        repo: repo
      };
      const prFiles = github.pullRequests.listFiles(prIssue);
      prFiles.data.forEach(file => {
        files.data.forEach(f => {
          if (f.filename === file.filename) {
            conflictingFiles.push(file.filename);
          }
        });
      });
    });
  }

  async _ensurePresolverLabelExists() {
    const label = this.config.labelPRConflict;
    await this._createLabel(label);
  }

  async _createLabel(labelObj) {
    const { owner, repo } = this.config;
    const github = this.github;
    return this.github.issues
      .getLabel({ owner, repo, name: labelObj.name })
      .catch(() => {
        return github.issues.createLabel({
          owner,
          repo,
          name: labelObj.name,
          color: labelObj.color
        });
      });
  }

  _getLabel(labelObj) {
    return new Promise((resolve, reject) => {
      for (const label of this.pullRequest.labels) {
        if (labelObj && labelObj.name && label.name === labelObj.name) {
          resolve(labelObj);
        }
      }
      reject(new Error('Not found'));
    });
  }
  async _addLabel(labelObj) {
    const { owner, repo } = this.config;
    const number = this.pullRequest.number;
    const label = this.config.labelPRConflict;
    const github = this.github;
    // Check if a label does not exist. If it does, it addes the label.
    return this._getLabel(label).catch(() => {
      // console.log(labelObj)
      return github.issues.addLabels({
        owner,
        repo,
        number,
        labels: [labelObj.name]
      });
    });
  }
}

module.exports = Presolver;

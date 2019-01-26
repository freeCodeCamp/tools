// Adapted from ../get-prs for probot
// TODO favor database
// const { PR } = require('../../probot/server/models');

const methodProps = {
  state: 'open',
  base: 'master',
  sort: 'created',
  direction: 'asc',
  page: 1,
  // eslint-disable-next-line camelcase
  per_page: 100
};

class PrInfo {
  constructor(github, owner, repo) {
    this.github = github;
    this.config = { owner, repo };
    this.firstPR = null;
    this.lastPR = null;
    this.prPropsToGet = ['number', 'user', 'title', 'updated_at'];
    this.methodProps = methodProps;
    this.methodProps.owner = this.config.owner;
    this.methodProps.repo = this.config.repo;
  }

  async getCount() {
    const config = this.config;
    const { owner, repo } = config;
    const {
      data: { total_count: count }
    } = await this.github.search
      .issuesAndPullRequests({
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
    // TODO query db if it's available
    // const numPRs = await PR.countDocuments();
    let firstPR, lastPR;
    // if (numPRs.length > 0) {
    //   [ { firstPR, lastPR }] = await PR.aggregate(
    //     [{
    //       $group: {
    //         _id: null,
    //         firstPR: { $min: '$_id' },
    //         lastPR: { $max: '$_id' }
    //       }
    //     }]
    //   );
    // } else {
      // eslint-disable-next-line camelcase
      this.methodProps.per_page = 1;
      let response = await this.github.pullRequests.list(this.methodProps);
      firstPR = response.data[0].number;
      this.methodProps.direction = 'desc';
      response = await this.github.pullRequests.list(this.methodProps);
      lastPR = response.data[0].number;
    // }
    this.firstPR = firstPR;
    this.lastPR = lastPR;
    this.totalPRs = await this.getCount().then(data => data);
    return [this.firstPR, this.lastPR];
  }

  async getFirst() {
    // TODO query db if it's available
    // eslint-disable-next-line camelcase
    this.methodProps.per_page = 1;
    this.methodProps.direction = 'asc';
    let response = await this.github.pullRequests.list(this.methodProps);
    return response.data[0].number;
  }
  // eslint-disable-next-line consistent-return
  async prFilter(prs, first, last, prPropsToGet) {
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
        return filtered;
      }
    }
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
    return { totalPRs, firstPR, lastPR };
  }

  async getPRs(totalPRs, firstPR, lastPR, prPropsToGet) {
    // TODO query db if it's available
    if (totalPRs === 'all') {
      this.firstPR = await this.getRange()[0];
      this.lastPR = await this.getRange()[1];
      this.totalPRs = await this.getCount();
      // eslint-disable-next-line camelcase
      this.methodProps.per_page = 100;
    } else {
      this.firstPR = firstPR;
      this.lastPR = lastPR;
      this.totalPRs = totalPRs;
    }
    const getAll = await this.github.paginate(
      await this.github.pullRequests.list(this.methodProps));
    const openPRs = await this.prFilter(
      getAll,
      this.firstPR, this.lastPR, prPropsToGet
    );
    console.log(`# of PRs retrieved: ${openPRs.length}`);
    return openPRs;
  }

  async getFiles(number) {
    let response = await this.github.paginate(
      await this.github.pullRequests.listFiles(
        { number, ...methodProps }
      ));
    let { data } = response;
    return data;
  }

  async getFilenames(number) {
    const files = await this.getFiles(number);
    const filenames = files.map(({ filename }) => filename);
    return filenames;
  }
}

module.exports = PrInfo;

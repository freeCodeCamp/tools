const { probotUpdateDb } = require('./tools/update-db-probot');
const PrInfo = require('../../lib/get-prs/index-probot.js');

const methodProps = {
  state: 'open',
  base: 'master',
  sort: 'created',
  direction: 'asc',
  page: 1,
  // eslint-disable-next-line camelcase
  per_page: 100
};
// const { PR } = require('./models/index');

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
    this._updateDb = probotUpdateDb;
    this.firstPR = null;
    this.lastPR = null;
    this.prPropsToGet = ['number', 'user', 'title', 'updated_at'];
    this.methodProps = methodProps;
    this.methodProps.owner = this.config.owner;
    this.methodProps.repo = this.config.repo;
    this.prInfo = new PrInfo(this.github, owner, repo);
  }

  async presolve(pullRequest) {
    Object.assign(this.pullRequest, pullRequest);
    await this._updateDb(this.context);
    // console.log(this.methodProps);
    await this._ensurePresolverLabelExists();
    await this._getState();
    const labelObj = this.config.labelPRConflict;
    if (this.conflictingFiles.length) {
      await this._addLabel(labelObj);
    }
  }
  async _getState() {
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

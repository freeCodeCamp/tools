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
  async getContext() {
    return this.context;
  }

  async presolve(pullRequest) {
    Object.assign(this.pullRequest, pullRequest);
    await this._updateDb(this.context);
  }
}

module.exports = Presolver;

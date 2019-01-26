const expect = require('expect');
const { Probot } = require('probot');
const path = require('path');
const nock = require('nock');

const nockBack = nock.back;
nockBack.fixtures = path.join(__dirname, '.', '__nock-fixtures__');
const { owner, repo, octokitConfig } = require('../../lib/constants');

const GitHubApi = require('@octokit/rest');

const MockGH = require('./fixtures/github_mock');
const prExisting = require('./fixtures/events/pullRequests.existing');
const prOpened = require('./fixtures/events/pullRequests.opened');
const prClosed = require('./fixtures/events/pullRequests.closed');
const prReopened = require('./fixtures/events/pullRequests.closed');
const probotPlugin = require('..');
const { PRtest } = require('./utils/testmodels');

const PrInfo = require('../../lib/get-prs/index-probot.js');
const Presolver = require('../server/presolver.js');

const recording = process.env.RECORD_ENV;

// It's unclear whether we need to disconnect mongoose because there
// is a conditional connector in the app itself, which these tests start via
// probot.load(probotPlugin). Forum discussions mention mongoose connections
// as the reason jest tests don't exit after success, but neither
// mongoose.disconnect() nor mongoose.connection.close() fix it.
// const mongoose = require('mongoose');

const prPropsToGet = ['number', 'user', 'title', 'updated_at'];
// const mockSnapshotsExist = fs.existsSync(
//   path.join(__dirname, '.', '__snapshots__', 'index.test.js.snap'));
// let mockSnapshots, mockGithub;
// if (mockSnapshotsExist) {
//   mockSnapshots = require('./__snapshots__/index.test.js.snap');
// }

nockBack.setMode('record');

describe('PrInfo API calls', async () => {
  let methodProps, github, prInfo, key;
  beforeEach(async() => {
    nockBack.setMode('record');
    methodProps = {
      state: 'open',
      base: 'master',
      sort: 'created',
      page: 1,
      owner: owner,
      repo: repo
    };
  });
  afterEach(async() => {
    // this ensures that consecutive tests don't use the snapshot created
    // by a previous test
    nockBack.setMode('wild');
    nock.cleanAll();
  });

  key = 'should get all PRs';
  test(key, async() => {
    const { nockDone } = await nockBack(
      'prInfo.getAll.json'
    );
    github = (
      recording ? await new GitHubApi(octokitConfig) :
      await new MockGH(key).gh
    );

    nock.enableNetConnect(/(api\.github\.com)/);
    prInfo = await new PrInfo(github, owner, repo);
    // eslint-disable-next-line camelcase
    methodProps.per_page = 100;
    const all = await prInfo.getPRs('all', null, null, prPropsToGet);
    expect(all).toMatchSnapshot();
    nockDone();
    if (!recording) {
      expect(github.pullRequests.list)
      .toHaveBeenCalledWith(methodProps);
    }
  }, 5000);

  key = 'should get an accurate count of open PRs';
  test(key, async () => {
    const { nockDone } = await nockBack(
      'prInfo.getCount.json'
    );
    github = (
      recording ? await new GitHubApi(octokitConfig) :
      await new MockGH(key).gh
    );
    nock.enableNetConnect(/(api\.github\.com)/);
    prInfo = await new PrInfo(github, owner, repo);
    methodProps.q = `repo:${owner}/${repo}+is:open+type:pr+base:master`;
    // eslint-disable-next-line camelcase
    methodProps.per_page = 1;
    methodProps.order = 'asc';
    // search endpoint doesn't require these parameters
    delete methodProps.base;
    delete methodProps.owner;
    delete methodProps.repo;
    delete methodProps.state;
    const count = await prInfo.getCount();
    expect(count).toMatchSnapshot();
    nockDone();
    if (!recording) {
      expect(github.search.issuesAndPullRequests)
      .toHaveBeenCalledWith(methodProps);
    }
  });

  key = `should get an Array with two Numbers that represent the range
  of open PRs`;
  test(key, async() => {
    const { nockDone } = await nockBack(
      'prInfo.getRange.json'
    );
    github = (recording ? await new GitHubApi(octokitConfig) :
      await new MockGH(key).gh
    );
    nock.enableNetConnect(/(api\.github\.com)/);
    prInfo = await new PrInfo(github, owner, repo);
    // eslint-disable-next-line camelcase
    methodProps.direction = 'desc';
    const range = await prInfo.getRange();
    expect(range).toMatchSnapshot();
    nockDone();
    if (!recording) {
      expect(github.pullRequests.list).toHaveBeenCalledWith(methodProps);
    }
  });

  key = 'should get the Number of first PR';
  test(key, async () => {
    const { nockDone } = await nockBack(
      'prInfo.getFirstPRNumber.json'
    );
    github = (recording ? await new GitHubApi(octokitConfig) :
      await new MockGH(key).gh
    );
    nock.enableNetConnect(/(api\.github\.com)/);
    prInfo = await new PrInfo(github, owner, repo);
    // eslint-disable-next-line camelcase
    methodProps.per_page = 1;
    methodProps.direction = 'asc';
    const first = await prInfo.getFirst();
    expect(first).toMatchSnapshot();
    nockDone();
    if (!recording) {
      expect(github.pullRequests.list).toHaveBeenCalledWith(methodProps);
    }
  });

  key = 'should get an Array of PRs by count and range';
  test(key, async() => {
    const { nockDone } = await nockBack(
      'prInfo.getSpecificRange.json'
    );
    github = (recording ? await new GitHubApi(octokitConfig) :
      await new MockGH(key).gh
    );
    nock.enableNetConnect(/(api\.github\.com)/);
    prInfo = await new PrInfo(github, owner, repo);
    methodProps.direction = 'desc';
    // eslint-disable-next-line camelcase
    methodProps.per_page = 100;
    const specificRange = await prInfo.getPRs(2, 3, 7, prPropsToGet);
    expect(specificRange).toMatchSnapshot();
    nockDone();
    if (!recording) {
      expect(github.pullRequests.list).toHaveBeenCalledWith(methodProps);
    }
  });

  key = 'should get an Array of files for a given PR';
  test(key, async() => {
    const { nockDone } = await nockBack(
      'prInfo.getFiles.json'
    );
    github = (recording ? await new GitHubApi(octokitConfig) :
      await new MockGH(key).gh
    );
    nock.enableNetConnect(/(api\.github\.com)/);
    prInfo = await new PrInfo(github, owner, repo);
    methodProps.number = prExisting.number;
    const files = await prInfo.getFiles(methodProps.number);
    expect(files).toMatchSnapshot();
    nockDone();
    if (!recording) {
      expect(github.pullRequests.listFiles)
        .toHaveBeenCalledWith(methodProps);
    }
  });
});

describe('PrInfo accessed via the probot', () => {
  let methodProps, probot,
    // eslint-disable-next-line no-unused-vars
    app,
    key, presolver, context, prInfo, github;
  afterEach(async() => {
    nockBack.setMode('wild');
    nock.cleanAll();
  });

  beforeEach(async() => {
    nockBack.setMode('record');
    probot = new Probot({});
    app = await probot.load(probotPlugin);
    methodProps = {
      sort: 'created',
      page: 1,
      q: `repo:${owner}/${repo}+is:open+type:pr+base:master`,
      // eslint-disable-next-line camelcase
      per_page: 1,
      order: 'asc'
    };
  });

  key = 'should get an accurate count of open PRs';
  test(key, async () => {
    if (!recording) {
      github = await new MockGH(key).gh;
      probot.receive({
        name: 'pull_request',
        payload: prClosed
      });
      expect(github.search.issuesAndPullRequests)
        .toHaveBeenCalledWith(methodProps);
    } else {
      github = await new GitHubApi(octokitConfig);
      context = { github };
      const { nockDone } = await nockBack(
        'probot_prInfo.GetCount.json'
      );
      nock.enableNetConnect(/(api\.github\.com)/);
      presolver = await new Presolver(context, { owner, repo });
      prInfo = await presolver.prInfo;
      const count = await prInfo.getCount();
      expect(count).toMatchSnapshot();
      nockDone();
    }
  });
});

describe('UpdateDB MongoDB methods', async() => {
  let probot, app, key, github;
  afterEach(async () => {
    await PRtest.deleteMany({}).catch(err => console.log(err));
  });

  beforeEach( async() => {
    probot = new Probot({});
    app = await probot.load(probotPlugin);
  });

  key = 'db should update if the action is opened';
  test(key, async () => {
    github = await new MockGH(key).gh;
    app.auth = () => github;
    await probot.receive({
      name: 'pull_request',
      payload: prOpened
    });
    const results = await PRtest.find({}).then(data => data);
    expect(results).toMatchSnapshot();
      // .toBeGreaterThan(0);
    expect(github.pullRequests.listFiles).toHaveBeenCalled();
  });

  key = 'db should update if the action is reopened';
  test(key, async () => {
    github = await new MockGH(key).gh;
    app.auth = () => Promise.resolve(github);
    await probot.receive({
      name: 'pull_request',
      payload: prReopened
    });
    const results = await PRtest.find({}).then(data => data);
    expect(results).toMatchSnapshot();
      // .toBeGreaterThan(0);
    expect(github.pullRequests.listFiles).toHaveBeenCalled();
  });

  key = 'db should have removed document if action is closed';
  test(key, async () => {
    github = await new MockGH(key).gh;
    app.auth = () => Promise.resolve(github);
    await probot.receive({
      name: 'pull_request',
      payload: prClosed
    });
    const result = await PRtest.findOne(
      { _id: prClosed.number }).then(doc => doc)
      .catch(err => console.log(err));
    expect(result).toBe(null);
      // .toMatchSnapshot();
  });
});

// // For more information about testing with Jest see:
// // https://facebook.github.io/jest/

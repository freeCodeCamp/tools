const config = require('../../config');
const expect = require('expect');
const { Probot } = require('probot');
const prOpened = require('./fixtures/events/pullRequests.opened');
const prClosed = require('./fixtures/events/pullRequests.closed');
// const prOpenedFiles = require('./fixtures/files/files.opened');
// const prExistingFiles = require('./fixtures/files/files.existing');
// const prUnrelatedFiles = require('./fixtures/files/files.unrelated');
const probotPlugin = require('..');
const { PRtest } = require('./utils/testmodels');

// Was using the Octokit API to get the fixture json, `./fixtures/github_mock`,
// after unsuccessfully attempting to use nock-record to get output from these
// API calls made in tests
// const { owner, repo, octokitConfig } = require('../../lib/constants.js');
const github = require('./fixtures/github_mock.js');

// PrInfo can be called from Presolver because it's imported there. The problem
// is currently that I can't access the probot Context directly. I must use i.e.
// probot.receive({ name: 'pull_request', payload: '...'}), achieved in practice
// via an Event. Passing the `app` itself doesn't work. ;) We need an Event.
// const Presolver = require('../server/presolver');
const PrInfo = require('../../lib/get-prs/index-probot.js');

// It's unclear whether we need to disconnect mongoose because there
// is a conditional connector in the app itself, which these tests start via
// probot.load(probotPlugin). Forum discussions mention mongoose connections
// as the reason jest tests don't exit after success, but neither
// mongoose.disconnect() nor mongoose.connection.close() fix it.
// const mongoose = require('mongoose');

const { owner, repo } = config.github;

describe('PrInfo accessed directly', () => {
  let methodProps, prInfo;
  afterEach(async() => {

  });

  beforeEach(async() => {
    methodProps = {
      state: 'open',
      base: 'master',
      sort: 'created',
      page: 1,
      owner: owner,
      repo: repo
    };
    prInfo = await new PrInfo(github, owner, repo);
    // const cxconfig = { owner, repo };
    // presolver = await new Presolver(prOpened, cxconfig);
    // prInfo = presolver.prInfo(github, owner, repo);
  });
  test('should receive repo info', async() => {
  });

  test('should get the number of first PR', async () => {
    // eslint-disable-next-line camelcase
    methodProps.per_page = 1;
    methodProps.direction = 'asc';
    const first = await prInfo.getFirst();
    expect(github.pullRequests.list).toHaveBeenCalledWith(methodProps);
    expect(first).toBe(9);
  });

  test('should get a count of PRs', async () => {
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
    expect(github.search.issues).toHaveBeenCalledWith(methodProps);
    expect(count).toBe(1);
  });

  test('should get a range of PRs', async () => {
    // eslint-disable-next-line camelcase
    methodProps.per_page = 1;
    methodProps.direction = 'desc';
    const range = await prInfo.getRange();
    expect(github.pullRequests.list).toHaveBeenCalledWith(methodProps);
    // fsr I can only test the second pullRequests.list call that uses
    // direction: 'desc'
    // methodProps.direction = 'desc';
    // expect(github.pullRequests.list).toHaveBeenCalledWith(methodProps);
    expect(range).toEqual([9, 9]);
  });

  test('should get list of PRs within a range', async () => {
    methodProps.direction = 'desc';
    // eslint-disable-next-line camelcase
    methodProps.per_page = 1;
    const prPropsToGet = ['number', 'user', 'title', 'updated_at'];
    const getPRs = await prInfo.getPRs(1, 9, 9, prPropsToGet);
    expect(github.pullRequests.list).toHaveBeenCalledWith(methodProps);
    expect(getPRs).not.toEqual(prOpened);
  });
});

describe('PrInfo accessed via the probot', () => {
  let methodProps, probot, app;
  afterEach(async() => {

  });

  beforeEach(async() => {
    probot = new Probot({});
    app = await probot.load(probotPlugin);
    app.auth = () => Promise.resolve(github);

    methodProps = {
      state: 'open',
      base: 'master',
      sort: 'created',
      page: 1,
      owner: owner,
      repo: repo
    };
  });

  test('should get a count of PRs using context.github in probot', async () => {
    probot.receive({
      name: 'pull_request',
      payload: prClosed
    });
    methodProps.q = `repo:${owner}/${repo}+is:open+type:pr+base:master`;
    // eslint-disable-next-line camelcase
    methodProps.per_page = 1;
    methodProps.order = 'asc';
    // search endpoint doesn't require these parameters
    delete methodProps.base;
    delete methodProps.owner;
    delete methodProps.repo;
    delete methodProps.state;

    expect(github.search.issues).toHaveBeenCalledWith(methodProps);
  });
});

describe('Presolver', () => {
  let probot, app;
  afterEach(async () => {
    await PRtest.deleteMany({}).catch(err => console.log(err));
    // TODO
    // Nothing seems to exit the tests. Also see commands in package.json
    // await mongoose.disconnect();
    // app = null;
  });

  beforeEach( async() => {
    probot = new Probot({});
    app = await probot.load(probotPlugin);
    app.auth = () => Promise.resolve(github);
  });

  test('db should update if the action is opened', async () => {
    await probot.receive({
      name: 'pull_request.opened',
      payload: prOpened
    });
    const results = await PRtest.find({}).then(data => data);
    expect(results.length).toBeGreaterThan(0);
  });

  test('db should update if the action is reopened', async () => {
    await probot.receive({
      name: 'pull_request.reopened',
      payload: prOpened
    });
    const results = await PRtest.find({}).then(data => data);
    expect(results.length).toBeGreaterThan(0);
  });

  test('db should update if the action is synchronize', async () => {
    await probot.receive({
      name: 'pull_request.synchronize',
      payload: prOpened
    });
    const results = await PRtest.find({}).then(data => data);
    expect(results.length).toBeGreaterThan(0);
  });

  test('db should update if the action is edited', async () => {
    await probot.receive({
      name: 'pull_request.edited',
      payload: prOpened
    });
    const results = await PRtest.find({}).then(data => data);
    expect(results.length).toBeGreaterThan(0);
  });

  test('db should have removed document if action is closed', async () => {
    await probot.receive({
      name: 'pull_request.closed',
      payload: prClosed
    });
    const result = await PRtest.findOne(
      { _id: prClosed.number }).then(doc => doc)
      .catch(err => console.log(err));
    expect(result).toBe(null);

  });
});

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

const config = require('../../config');
const expect = require('expect');
const { Probot } = require('probot');
// const fetch = require('node-fetch');
const nock = require('nock');
const MockGH = require('./fixtures/github_mock');
// const prOpenedFiles = require('./payloads/files/files.opened');
// const prExistingFiles = require('./payloads/files/files.existing');
// const prUnrelatedFiles = require('./payloads/files/files.unrelated');
// const fs = require('fs');
// const path = require('path');
const prOpened = require('./fixtures/events/pullRequests.opened');
const prClosed = require('./fixtures/events/pullRequests.closed');
const prReopened = require('./fixtures/events/pullRequests.closed');
// const prOpenedFiles = require('./fixtures/files/files.opened');
// const prExistingFiles = require('./fixtures/files/files.existing');
// const prUnrelatedFiles = require('./fixtures/files/files.unrelated');
const probotPlugin = require('..');
const { PRtest } = require('./utils/testmodels');

// const GitHubApi = require('@octokit/rest');

const PrInfo = require('../../lib/get-prs/index-probot.js');

// It's unclear whether we need to disconnect mongoose because there
// is a conditional connector in the app itself, which these tests start via
// probot.load(probotPlugin). Forum discussions mention mongoose connections
// as the reason jest tests don't exit after success, but neither
// mongoose.disconnect() nor mongoose.connection.close() fix it.
// const mongoose = require('mongoose');

const { owner, repo } = config.github;
// const prPropsToGet = ['number', 'user', 'title', 'updated_at'];

describe('PrInfo API calls', async () => {
  let methodProps, github, prInfo;
  beforeEach(async() => {
    // github = await new GitHubApi();
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
    nock.cleanAll();
  });

  test('should get an accurate count of open PRs', async () => {
    github = await new MockGH(
            'should get an accurate count of open PRs')
    .gh;
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
    expect(github.search.issuesAndPullRequests)
    .toHaveBeenCalledWith(methodProps);
    expect(count).toMatchSnapshot();
  });

  test(`should get an Array with two Numbers that represent the range
  of open PRs`, async() => {
    github = await new MockGH(
            `should get an Array with two Numbers that represent the range
    of open PRs`)
    .gh;

    prInfo = await new PrInfo(github, owner, repo);
    // eslint-disable-next-line camelcase
    methodProps.per_page = 1;
    methodProps.direction = 'desc';
    const range = await prInfo.getRange();
    expect(github.pullRequests.list).toHaveBeenCalledWith(methodProps);
    expect(range).toMatchSnapshot();
  });

  test('should get the Number of first PR', async () => {
    github = await new MockGH(
            'should get the Number of first PR')
    .gh;
    prInfo = await new PrInfo(github, owner, repo);
    // eslint-disable-next-line camelcase
    methodProps.per_page = 1;
    methodProps.direction = 'asc';
    const first = await prInfo.getFirst();
    expect(github.pullRequests.list).toHaveBeenCalledWith(methodProps);
    expect(first).toMatchSnapshot();
  });

  test('should get an Array of PRs by count and range', async() => {
    github = await new MockGH(
            'should get an Array of PRs by count and range')
      .gh;
    prInfo = await new PrInfo(github, owner, repo);
    methodProps.direction = 'desc';
    // eslint-disable-next-line camelcase
    methodProps.per_page = 1;
    const keys = Object.keys(prOpened.pull_request);
    const specificRange = await prInfo.getPRs(2, 3, 7, keys);
    expect(github.pullRequests.list).toHaveBeenCalledWith(methodProps);
    expect(specificRange).toMatchSnapshot();
  });
});

// describe('PrInfo accessed directly', () => {
//   const github = require('./fixtures/github_mock.js');
//   let methodProps, prInfo;
//   afterEach(async() => {
//
//   });
//
//   beforeEach(async() => {
//     methodProps = {
//       state: 'open',
//       base: 'master',
//       sort: 'created',
//       page: 1,
//       owner: owner,
//       repo: repo
//     };
//     prInfo = await new PrInfo(github, owner, repo);
//     // const cxconfig = { owner, repo };
//     // presolver = await new Presolver(prOpened, cxconfig);
//     // prInfo = presolver.prInfo(github, owner, repo);
//   });
//   test('should receive repo info', async() => {
//   });
//
//   test('should get the number of first PR', async () => {
//     // eslint-disable-next-line camelcase
//     methodProps.per_page = 1;
//     methodProps.direction = 'asc';
//     const first = await prInfo.getFirst();
//     expect(github.pullRequests.list).toHaveBeenCalledWith(methodProps);
//     expect(first).toBe(9);
//   });
//
//   test('should get a count of PRs', async () => {
//     methodProps.q = `repo:${owner}/${repo}+is:open+type:pr+base:master`;
//     // eslint-disable-next-line camelcase
//     methodProps.per_page = 1;
//     methodProps.order = 'asc';
//     // search endpoint doesn't require these parameters
//     delete methodProps.base;
//     delete methodProps.owner;
//     delete methodProps.repo;
//     delete methodProps.state;
//
//     const count = await prInfo.getCount();
//     expect(github.search.issuesAndPullRequests)
//  .toHaveBeenCalledWith(methodProps);
//     expect(count).toBe(1);
//   });
//
//   test('should get a range of PRs', async () => {
//     // eslint-disable-next-line camelcase
//     methodProps.per_page = 1;
//     methodProps.direction = 'desc';
//     const range = await prInfo.getRange();
//     expect(github.pullRequests.list).toHaveBeenCalledWith(methodProps);
//     // fsr I can only test the second pullRequests.list call that uses
//     // direction: 'desc'
//     // methodProps.direction = 'desc';
//     // expect(github.pullRequests.list).toHaveBeenCalledWith(methodProps);
//     expect(range).toEqual([9, 9]);
//   });
//
//   test('should get list of PRs within a range', async () => {
//     methodProps.direction = 'desc';
//     // eslint-disable-next-line camelcase
//     methodProps.per_page = 1;
//     const getPRs = await prInfo.getPRs(1, 9, 9, prPropsToGet);
//     expect(github.pullRequests.list).toHaveBeenCalledWith(methodProps);
//     expect(getPRs.title).toEqual(prOpened.title);
//   });
// });

describe('PrInfo accessed via the probot', () => {
  const github = require('./fixtures/github_mock.js');
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

    expect(github.search.issuesAndPullRequests)
    .toHaveBeenCalledWith(methodProps);
  });
});

describe('Presolver', () => {
  const github = require('./fixtures/github_mock.js');
  let probot, app;
  afterEach(async () => {
    await PRtest.deleteMany({}).catch(err => console.log(err));
    await PRtest.dropIndexes();
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
      name: 'pull_request',
      payload: prOpened
    });
    const results = await PRtest.find({}).then(data => data);
    expect(results.length).toBeGreaterThan(0);
  });

  test('db should update if the action is reopened', async () => {
    await probot.receive({
      name: 'pull_request',
      payload: prReopened
    });
    const results = await PRtest.find({}).then(data => data);
    expect(results.length).toBeGreaterThan(0);
  });

  test('db should have removed document if action is closed', async () => {
    await probot.receive({
      name: 'pull_request',
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

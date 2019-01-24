const config = require('./config');
const expect = require('expect');
const nock = require('nock');
const path = require('path');
const { setupRecorder } = require('nock-record');
const GitHubApi = require('@octokit/rest');

const PrInfo = require('./lib/get-prs/index-probot.js');

const { owner, repo } = config.github;

const prOpened = require('./fixtures/events/pullRequests.opened');

const recorderOptions = {
  fixturePath: path.join(__dirname, '.', 'probot', 'test', '__nock-fixtures__')
};

const record = setupRecorder(recorderOptions);

describe('PrInfo API calls', async() => {
  let github, prInfo;
  beforeEach(async() => {
    github = await new GitHubApi();

    prInfo = await new PrInfo(github, owner, repo);

  });
  afterEach(async() => {
    nock.cleanAll();
  });

  test('should get an accurate count of open PRs', async() => {
    const { completeRecording } = await record('prInfo_getCount');
    const count = await prInfo.getCount();
    completeRecording();
    expect(count).toMatchSnapshot();
  });

  test(`should get an Array with two Numbers that represent the range of
  open PRs`, async() => {
    const { completeRecording } = await record('prInfo_getRange');
    const range = await prInfo.getRange();
    completeRecording();
    expect(range).toMatchSnapshot();
  });

  test('should get the Number of first PR', async() => {
    const { completeRecording } = await record('prInfo_getFirstPRNumber');
    const first = await prInfo.getFirst();
    completeRecording();
    expect(first).toMatchSnapshot();
  });

  test('should get an Array of PRs by count and range', async() => {
    const keys = Object.keys(prOpened.pull_request);
    const { completeRecording } = await record('prInfo_getSpecificRange');
    const specificRange = await prInfo.getPRs(2, 3, 7, keys);
    completeRecording();
    expect(specificRange).toMatchSnapshot();
  });
});

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

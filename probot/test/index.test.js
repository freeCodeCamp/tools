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
// const jwt = require('jsonwebtoken');
// const { setupRecorder } = require('nock-record');
// const fs = require('fs').promises;
// const path = require('path');
const { owner, repo, octokitConfig } = require('../../lib/constants.js');
const PrInfo = require('../../lib/get-prs/index-probot.js');

describe('Presolver', () => {
  let probot, app, github, prInfo;

  afterEach(async (done) => {
    await PRtest.deleteMany({}).catch(err => console.log(err));
    done();
  });

  beforeEach( async() => {
    probot = new Probot({});
    app = await probot.load(probotPlugin);
    github = require('./fixtures/github_mock.js');

    app.auth = () => Promise.resolve(github);
    prInfo = await new PrInfo(github, owner, repo);
    // const dir =
    //   path.join(__dirname, '..', config.github.probot.privateKeyPath);
    // const k = await fs.readFile(dir).then((data) => data);
    // // Load our app into probot
    // await PRtest.deleteMany({}).catch(err => console.log(err));
    //
    // let octoConfig = octokitConfig;
    // const App = require('@octokit/app');
    // // // const request = require('@octokit/request');
    // app = new App({
    //   id: config.github.probot.appID,
    //   privateKey: k
    //   // Buffer.from(k, 'base64').toString()
    // });
    // const token = await app.getSignedJsonWebToken();
    // const token = await app.getInstallationAccessToken({ id: 585398 });
    // console.log(token);
    // const createApp = async (options) => {
    //   const payload = {
    //     exp: Math.floor(Date.now() / 1000) + 60,
    //     iat: Math.floor(Date.now() / 1000),
    //     iss: options.id
    //   };
    //   // Sign with RSA SHA256
    //   const sig =
    //     await jwt.sign(payload, options.cert, { algorithm: 'RS256' });
    //   return sig;
    // };
    // const token = await createApp({
    //   id: config.github.probot.appID,
    //   cert: Buffer.from(k, 'base64').toString()
    // });
    // octoConfig.headers.authorization = `token ${token}`;
    // github =
    // require('@octokit/rest')(octoConfig);
    // await github.authenticate({
    //   type: 'app',
    //   token: token
    // });
    // console.log(github);
    // const issue = await request(`GET /repos/${owner}/${repo}/issues/9`, octoConfig);
    // console.log(issue);
  });

  test('should receive repo info', async() => {
    //     const octokit = require('@octokit/rest')(octokitConfig);
    //         //   console.log(k);
    //     const createApp = async (options) => {
    //       const payload = {
    //         exp: Math.floor(Date.now() / 1000) + 60,
    //         iat: Math.floor(Date.now() / 1000),
    //         iss: options.id
    //       };
    //       // Sign with RSA SHA256
    //       const sig =
    // await jwt.sign(payload, options.cert, { algorithm: 'RS256' });
    //       return sig;
    //     };
    //     const token = await createApp({
    //       id: config.github.probot.appID,
    //       cert: Buffer.from(k, 'base64').toString()
    //     });
    //     console.log(token);
    //     const octokitAuth = {
    //       type: 'app',
    //       token: token
    //     };
    //     await octokit.authenticate(octokitAuth);

    // await probot.receive({
    //   name: 'pull_request',
    //   payload: prOpened
    // });

    /*
    expect()
    */
    /* app.on('pull_request.opened', async (robot) => {
      const { completeRecording } = await record('pr-stats');
      const result = getState.bind(app);
      completeRecording();
      console.log(result);
      expect(result).not.toBe(null);
    });
    // const result = app;//await getState(null, app);
    */
    /* / expect(github.)*/
    // expect(github.search.issues).toHaveBeenCalled()
    /* .toHaveBeenCalledWith({
      state: 'open',
      base: 'master',
      sort: 'created',
      direction: 'asc',
      page: 1,
      // eslint-disable-next-line camelcase
      per_page: 100
    });*/
  });

  // test(`adds a label if a PR has changes to files targeted by an
  //   existing PR`, async () => {
  //   // Receive a webhook event
  //   await probot.receive({
  //     name: 'pull_request',
  //     payload: prOpened
  //   });
  //   expect(github.issues.addLabels).toHaveBeenCalled();
  // });
/*
  test('does not add a label when files do not coincide', async () => {
    await probot.receive({
      name: 'pull_request.opened',
      payload: prUnrelated
    });
    expect(github.issues.addLabels).toHaveBeenCalledTimes(0);
  });
*/
  test('should get number of first PR', async () => {
    const first = await prInfo.getFirst();
    console.log(first);
    expect(first).toBe(9);
  });

  test('should get a count of PRs', async () => {
    const count = await prInfo.getCount();
    console.log(count);
    expect(count).toBe(1);
  });

  test('should get a range of PRs', async () => {
    const range = await prInfo.getRange();
    console.log(range);
    expect(range).toEqual([9, 9]);
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

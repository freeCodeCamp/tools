// const debug = require('debug')('probot:presolver');
const config = require('../config');
// config should be imported before importing any other file
const Presolver = require('./server/presolver');
const mongoose = require('mongoose');
const path = require('path');

async function probotPlugin(robot) {
  const events = [
    'pull_request.opened',
    'pull_request.edited',
    'pull_request.synchronize',
    'pull_request.reopened',
    'pull_request.labeled',
    'pull_request.closed'
  ];
  robot.on(events, presolve.bind(robot));
  // Using the 'pull_request.closed' event arbitrarily for now to test
  // the PrInfo module called via the probot.
  // robot.on(['pull_request.closed'], prinfo.bind(robot));

  const redirect = robot.route('/');

  // Note that probot uses this method for logging:
  // robot.log , context.log , req.log
  // robot.log(robot.router);
  redirect.get('/', async(req, res) => res.redirect('/home'));
  const landingPage = robot.route('/home');
  landingPage.use(require('express').static('public'));
  const app = robot.route('/dashboard');
  const { pareto, pr, search, info } = require('./server/routes');

  const staticPath = path.join(__dirname, '.', 'client', 'build');
  app.use(require('express').static(staticPath));

  app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    response.header('Access-Control-Allow-Methods', 'GET');
    response.header(
      'Accept', 'application/vnd.github.machine-man-preview+json');
    next();
  });

  const landingHtml = path.join(__dirname, './public/index.html');
  landingPage.get('/', (req, res) => res.sendFile(landingHtml));

  const htmlpath = path.join(__dirname, './client/build/index.html');
  app.get('/', (request, response) => response.sendFile(htmlpath));

  app.use('/pr', pr);
  app.use('/search', search);
  app.use('/pareto', pareto);
  app.use('/info', info);

  app.use(function(err, req, res) {
    res.status(err.status || 500).send(err.message);
  });
  if (mongoose.connection.readyState === 0) {
    // connect to mongo db
    const mongoUri = config.mongo.host;

    const promise = mongoose.connect(
      mongoUri, { useNewUrlParser: true }
    );
    promise
      .then(() => {
        console.log('MongoDB is connected');
      })
      .catch(err => {
        console.log(err);
        console.log('MongoDB connection unsuccessful');
      });
  }
}

async function presolve(context) {
  const presolver = forRepository(context);
  const pullRequest = getPullRequest(context);
  return presolver.presolve(pullRequest);
}

function forRepository(context) {
  const config = { ...context.repo() };
  return new Presolver(context, config);
}

function getPullRequest(context) {
  return context.payload.pull_request || context.payload.review.pull_request;
}

module.exports = probotPlugin;

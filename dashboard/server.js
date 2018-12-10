const mongoose = require('mongoose');
const fs = require('fs');
const express = require('express');
const path = require('path');
// config should be imported before importing any other file
const config = require('./config/config');
// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

const app = express();
const { 
  catchAll,
  pareto,
  pr,
  search,
  info,
  getCurrData,
  probot
} = require('./routes');

/*
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
*/
app.use(express.static(path.resolve(__dirname, 'public')));
app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  response.header('Access-Control-Allow-Methods', 'GET');
  next();
});

app.get('/', (request, response) => response.status(200).sendFile(path.join(__dirname + 'index.html')));

app.use('/pr', pr);
app.use('/search', search);
app.use('/pareto', pareto);
app.use('/info', info);
app.use('/getCurrData', getCurrData);
//app.use('/probot', probot);
app.use('*', catchAll);

// connect to mongo db
const mongoUri = config.mongo.host;
mongoose.connect(mongoUri, { useNewUrlParser: true });
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
});

const listener = app.listen(config.port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

module.exports = app;
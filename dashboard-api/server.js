const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const config = require('../config/config');
const passport = require('../config/passport');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongo')(session);

const app = express();
const { 
  catchAll,
  pareto,
  pr,
  search,
  info,
  getCurrData,
  updateData,
  auth,
  user
} = require('./routes');

const store = new MongoDBStore({
  mongooseConnection: mongoose.connection,
  collection: 'fccsess'
});
store.on('error', (error) => {
  console.log(error);
});
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.cookieSecret));
app.use(session({
  secret: config.cookieSecret,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, '../dashboard-client/build')));
app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  response.header('Access-Control-Allow-Methods', 'GET');
  next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  /* eslint-disable no-param-reassign */
  res.locals.session = req.session;
  /* eslint-enable no-param-reassign */
  next();
});

const htmlpath = path.join(__dirname, '../dashboard-client/build/index.html');

app.get('/home', (request, response) => response.sendFile(htmlpath));

app.use('/pr', pr);
app.use('/search', search);
app.use('/pareto', pareto);
app.use('/info', info);
app.use('/getCurrData', getCurrData);
app.use('/update', updateData);
app.use('/auth', auth);
app.use('/user', user);
app.get('*', catchAll);
// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// connect to mongo db
const mongoUri = config.mongo.host;
mongoose.connect(mongoUri, { useNewUrlParser: true });
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

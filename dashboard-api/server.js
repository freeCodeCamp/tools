const fs = require('fs');
const express = require('express');
const config = require('../config/config');
const passport = require('../config/passport');
const mongoose = require('mongoose');
const put = require('pug');
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
  auth
} = require('./routes');

const store = new MongoDBStore({
  mongooseConnection: mongoose.connection,
  collection: 'mySessions'
});
store.on('error', (error) => {
  console.log(error);
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.cookieSecret));
app.use(session({
  secret: config.cookieSecret,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(express.static('../dashboard-client/build'));
app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  response.header('Access-Control-Allow-Methods', 'GET');
  next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  // eslint-disable-next-line no-param-reassign
  res.locals.session = req.session;
  res.locals.githubClientId = config.github.id;
  next();
});

app.get('/', (request, response) => response.sendFile(pug.render(__dirname + '/dashboard-client/build/index.pug', {
  githubClientId: config.github.id,
  ind: 1,
  no1: '23268a10',
  no2: '27b1982a'

<<<<<<< HEAD
=======
})));

>>>>>>> cookie secret unrecognized
app.use('/pr', pr);
app.use('/search', search);
app.use('/pareto', pareto);
app.use('/info', info);
app.use('/getCurrData', getCurrData);
app.use('/update', updateData);
app.use('/auth', auth);
app.use('/user', user);
app.use('*', catchAll);

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

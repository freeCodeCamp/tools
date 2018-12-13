const mongoose = require('mongoose');
const fs = require('fs');
const express = require('express');
const path = require('path');
const cors = require('cors');
const logger = require('morgan');
// config should be imported before importing any other file
const config = require('./config/config');

const provideErrorMiddleware = require('./routes/error');
// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

const app = express();
const { catchAll, pareto, pr, search, info, updateData } = require('./routes');

 // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, '../dashboard-client/build')));
app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  response.header('Access-Control-Allow-Methods', 'GET');
  next();
});

app.get('/health-check', (req, res) => res.send('OK'));
app.use('/pr', pr);
app.use('/search', search);
app.use('/pareto', pareto);
app.use('/info', info);
app.use('/update', updateData);
app.get('/', (request, response) => {
  response.render('index')
})
app.get('/', (request, response) => response.sendFile(path.resolve(__dirname, '..', '/dashboard-client/build/index.html')));
//app.use('*', catchAll);
provideErrorMiddleware(app);

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;
// connect to mongo db
const mongoUri = config.mongo.host;
const promise = mongoose.connect(mongoUri, { useNewUrlParser: true });
promise.then(function(db){
  console.log('MongoDB is connected')
}).catch(function(err){
  console.log(err)
  console.log('MongoDB connection unsuccessful')
});

const listener = app.listen(config.port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

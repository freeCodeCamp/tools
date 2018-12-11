const mongoose = require('mongoose');
const PR = new mongoose.Schema({
  action: String,
  number: Number,
  pull_request: {},
  repository: {},
  sender: {},
  installation: {}
}, {collection: 'fcc-github-tools'});

module.exports = mongoose.model('PR', PR);
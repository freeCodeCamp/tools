const PR = require('../models/pr.js');
const router = require('express').Router();

router.get('/', (request, response) => {
  PR.find({}, (err, prs) => {
    if (err) {
      // TODO: better err handler
      console.log(err)
    }
    response.json(prs);
  });
});

module.exports = router;
const PR = require('../models/pr.js');
// TODO: get startTime from (which?) mongoose model
const startTime = new Date()
const router = require('express').Router();

router.get('/', (request, response) => {
  PR.find({}, (err, prs) => {
    if (err) {
      // TODO: better err handler
      console.log(err)
    }
    const firstPR = prs[0].number;
    const lastPR = prs[prs.length - 1].number;

    response.json({
      ok: true,
      lastUpdate: startTime,
      numPRs: prs.length,
      prRange: `${firstPR}-${lastPR}`
    });
  });
});

module.exports = router;
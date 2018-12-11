const router = require('express').Router();
const PR = require('../models/pr.js');
// TODO: where / how is startTime stored?
const startTime = new Date()

function getPareto(prs, cb) {
  const reportObj = prs.reduce((obj, pr) => {
    const { number, filenames, username } = pr;
    
    filenames.forEach((filename) => {
      if (obj[filename]) {
        const { count, prs } = obj[filename];
        obj[filename] = { count: count + 1, prs: prs.concat({ number, username } ) };
      }
      else {
        obj[filename] = { count: 1, prs: [ { number, username } ] };
      }
    });
    return obj;
  }, {});
  const pareto = Object.keys(reportObj)
    .map((filename) => {
      const { count, prs } = reportObj[filename];
      return { filename, count, prs };
    })
    .sort((a, b) => b.count - a.count);
  cb(pareto);
}

router.get('/', (reqeust, response) => {
  PR.find({}, (err, prs) => {
    if (err) {
      // TODO: better err handler
      console.log(err)
    }
    getPareto(prs, function(pareto) {
      response.json({ ok: true, pareto });
    })
  });
  
});

module.exports = router;
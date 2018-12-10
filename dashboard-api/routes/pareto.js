const router = require('express').Router();

const container = require ('../data');

router.get('/', (reqeust, response) => {
  const { indices, prs } = container.data;

  const reportObj = prs.reduce((obj, pr) => {
    const { number, filenames, username, title } = pr;

    filenames.forEach((filename) => {
      if (obj[filename]) {
        const { count, prs } = obj[filename];
        obj[filename] = { count: count + 1, prs: prs.concat({ number, username, title } ) };
      }
      else {
        obj[filename] = { count: 1, prs: [ { number, username, title } ] };
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

  response.json({ ok: true, pareto });
});

module.exports = router;

const router = require('express').Router();
const shell = require('shelljs');
router.get('/', (request, response) => {
  shell.exec('cd ../probot && nodemon').then(function(){
    response.status(200).send('ok')
  }).catch(function(err){
    //console.log(err)
  })
})

module.exports = router;
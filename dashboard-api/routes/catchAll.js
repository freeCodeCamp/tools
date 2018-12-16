const router = require('express').Router();
const { ifNoUserRedirect } = require('../middleware/auth');
router
  .route('/')
  .get(ifNoUserRedirect);

module.exports = router;

const config = require('../../config/config');
const router = require('express').Router();
const express = require('express');
const expressJwt = require('express-jwt');
const { ifNoUserRedirect } = require('../middleware/auth');
function handlePassportLogin(req, res) {
  // eslint-disable-next-line no-param-reassign
  req.session.userId = req.user._id;
  return res.redirect('/home');
}

function handleSignout(req, res) {
  if (req.session) {
    req.session.destroy();
  }
  req.logout();
  return res.redirect('/home');
}
/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

const passport = require('../../config/passport');

/** GET /api/auth/random-number - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
router
  .route('/random-number')
  .get(expressJwt({ secret: config.jwtSecret }), getRandomNumber);

router
  .route('/github/callback')
  .get(
    passport.authenticate('github', { failureRedirect: '/home' }),
    handlePassportLogin
  );
router.route('/signin').get(ifNoUserRedirect);
router.route('/signout').get(handleSignout);

module.exports = router;

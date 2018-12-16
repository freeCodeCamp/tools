const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const debug = require('debug');

const log = debug('fcc:config:passport');
const { host, isOpenForRegistrations } = require('./config');
const {
  github: { id, secret }
} = require('./config');

const User = require('../dashboard-api/models/user.js');

passport.use(
  new GitHubStrategy(
    {
      clientID: id,
      clientSecret: secret,
      callbackURL: `${host}api/auth/github/callback`
    },
    (accessToken, refreshToken, profile, cb) => {
      const {
        id: githubId,
        _json: { login: username, html_url: githubProfile, email, avatar_url: avatar }
      } = profile;
      const githubUser = {
        username,
        githubId,
        email,
        avatar,
        githubProfile
      };
      log(githubUser);
      // TODO: Check if user is a collaborator
      const isOpenForRegistrations = true;
      return isOpenForRegistrations ?
        User.findOrCreate(githubUser, (err, user) => cb(err, user)) :
        User.findOne(githubUser, (err, user) => cb(err, user));
    }
  )
);

// used to serialize the user for the session
passport.serializeUser((user, done) => {
  log('serialize', user);
  done(null, user._id);
});

// used to deserialize the user
passport.deserializeUser((userId, done) => {
  User.get(userId)
    .then(user => done(null, user))
    .catch(e => done(e));
});

module.exports = passport;

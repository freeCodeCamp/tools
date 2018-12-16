const config = require('../../config/config');
exports.ifNoUserRedirect = (redirect = `https://github.com/login/oauth/authorize?scope=user:email&client_id=${config.github.id}`) => (req, res, next) => {
  if (req.user) {
		req.session.githubClientId = config.github.id;
    return next();
  }
  return res.redirect(redirect);
};;
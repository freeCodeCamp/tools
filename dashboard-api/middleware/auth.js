const config = require('../../config/config');
const redirect =
	`https://github.com/login/oauth/authorize?scope=user:email&client_id=${
		config.github.id
	}`;

exports.ifNoUserRedirect = (req, res, next) => {
  if (req.user) {
    req.session.githubClientId = config.github.id;
    return next();
  }
  return res.status(301).redirect(
    //'/home'
    redirect
  );
}

/* function ifNoUserRedirect(req, res, next) {
  
}
module.exports = ifNoUserRedirect
*/
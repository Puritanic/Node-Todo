const User = require('../models/user');

const authenticate = (req, res, next) => {
	const token = req.header('X-Auth');

	return User.findByToken(token)
		.then(user => {
			if (!user) return Promise.reject();

			req.user = user;
			req.token = token;
			next();
		})
		.catch(err => res.status(401).send());
};

module.exports = {
	authenticate,
};

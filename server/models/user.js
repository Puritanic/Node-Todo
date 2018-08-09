const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		validate: {
			validator: value => validator.isEmail(value),
			message: '{VALUE} is not a valid email',
			isAsync: false,
		},
		unique: true,
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
	},
	tokens: [
		{
			access: {
				type: String,
				required: true,
			},
			token: {
				type: String,
				required: true,
			},
		},
	],
});

UserSchema.methods.toJSON = function() {
	const user = this;
	const userObj = user.toObject();

	return _.pick(userObj, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function() {
	const user = this;
	const access = 'auth';
	const token = jwt.sign({ _id: user._id.toHexString(), access }, 'salt hash').toString();

	user.tokens.push({ access, token });

	return user.save().then(() => token);
};

UserSchema.statics.findByToken = function(token) {
	const User = this;
	let decoded;

	try {
		decoded = jwt.verify(token, 'salt hash');
		return User.findOne({
			_id: decoded._id,
			'tokens.token': token,
			'tokens.access': 'auth',
		});
	} catch (err) {
		return Promise.reject();
	}
};

UserSchema.statics.findByCredentials = function(email, password) {
	const User = this;

	return User.findOne({ email }).then(user => {
		if (!user) return Promise.reject();

		return new Promise((resolve, reject) => {
			const authenticated = bcrypt.compare(password, user.password, (err, result) => {
				if (err) return reject(err);
				if (!result) return reject();

				return resolve(user);
			});
		});
	});
};

UserSchema.methods.removeToken = function(token) {
	const user = this;
	// $pull removes item that match criteria from the document
	return user.update({
		$pull: {
			tokens: { token },
		},
	});
};

UserSchema.pre('save', function(next) {
	const user = this;

	if (user.isModified('password')) {
		bcrypt.genSalt(10, (err, salt) => {
			if (err) return Promise.reject(err);

			return bcrypt.hash(user.password, salt, (err, hash) => {
				if (err) return Promise.reject(err);

				user.password = hash;
				return next();
			});
		});
	} else {
		next();
	}
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

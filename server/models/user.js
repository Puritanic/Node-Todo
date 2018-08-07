const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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

const User = mongoose.model('User', UserSchema);

module.exports = User;

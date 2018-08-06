const mongoose = require('mongoose');
const validator = require('validator');

const User = mongoose.model('User', {
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

module.exports = User;

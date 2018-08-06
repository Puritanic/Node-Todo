const mongoose = require('mongoose');
const validator = require('validator');

const User = mongoose.model('User', {
	email: {
		type: String,
		required: true,
		trim: true,
		validate: {
			validator: validator.isEmail,
			message: 'Please enter a valid email',
			isAsync: false,
		},
	},
});

module.exports = User;

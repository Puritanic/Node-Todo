const mongoose = require('mongoose');

const Todo = mongoose.model('Todo', {
	text: {
		type: String,
		minlength: 1,
		trim: true,
		required: true,
	},
	completed: {
		type: Boolean,
		default: false,
	},
	completedAt: {
		type: Date,
	},
	_author: {
		required: true,
		type: mongoose.Schema.Types.ObjectId,
	},
});

module.exports = Todo;

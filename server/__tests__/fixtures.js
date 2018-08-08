const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Todo = require('../models/todo');

const todos = [
	{ text: '1st Test Todo Text', _id: new ObjectID() },
	{ text: '2nd Test Todo Text', _id: new ObjectID() },
	{ text: '3rd Test Todo Text', _id: new ObjectID() },
];

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [
	{
		email: 'user1@mail.com',
		password: 'testPassword',
		tokens: [
			{
				access: 'auth',
				token: jwt.sign({ _id: userOneId, access: 'auth' }, 'salt hash').toString(),
			},
		],
		_id: userOneId,
	},
	{ email: 'user2@mail.com', password: 'test1password', tokens: [], _id: userTwoId },
];

const populateTodos = done => {
	// Wipe all todos
	Todo.remove({})
		.then(() => {
			return Todo.insertMany(todos);
		})
		.then(() => done());
};

const populateUsers = done => {
	// Wipe all users
	User.remove({})
		.then(() => {
			const userOne = new User(users[0]).save();
			const userTwo = new User(users[1]).save();

			return Promise.all([userOne, userTwo]);
		})
		.then(() => done());
};

module.exports = {
	todos,
	users,
	populateTodos,
	populateUsers,
};

require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
var morgan = require('morgan');

const { mongoose } = require('./db/mongoose');
const Todo = require('./models/todo');
const User = require('./models/user');
const { authenticate } = require('./middlewares/auth');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(morgan('combined'));

app.get('/todos', authenticate, (req, res) => {
	Todo.find({ _author: req.user._id })
		.then(todos => res.json({ todos }))
		.catch(err => res.status(400).send(err));
});

app.get('/todos/:todo_id', authenticate, (req, res) => {
	return Todo.findOne({
		_id: req.params.todo_id,
		_author: req.user._id,
	})
		.then(todo => {
			if (!todo) return Promise.reject();

			return res.json({ todo });
		})
		.catch(err => res.status(404).json(err));
});

app.post('/todos', authenticate, (req, res) => {
	const todo = new Todo({
		text: req.body.text,
		_author: req.user._id,
	});

	todo.save()
		.then(todo => {
			res.json(todo);
		})
		.catch(err => res.status(400).send(err));
});

app.delete('/todos/:todo_id', authenticate, (req, res) => {
	const id = req.params.todo_id;

	if (!ObjectID.isValid(id)) return res.status(404).send();

	return Todo.findOneAndRemove({
		_id: id,
		_author: req.user._id,
	})
		.then(response => {
			if (!response) return res.status(404).send();

			return res.status(200).json(response);
		})
		.catch(err => res.status(400).json(err));
});

app.patch('/todos/:id', authenticate, (req, res) => {
	var id = req.params.id;
	var body = _.pick(req.body, ['text', 'completed']);

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findOneAndUpdate(
		{
			_id: id,
			_author: req.user._id,
		},
		{ $set: body },
		{ new: true }
	)
		.then(todo => {
			if (!todo) return res.status(404).send();

			return res.send({ todo });
		})
		.catch(e => {
			res.status(400).send();
		});
});

app.get('/users/me', authenticate, (req, res) => {
	const token = req.header('X-Auth');

	User.findByToken(token)
		.then(user => {
			if (!user) return Promise.reject();

			return res.send(user).catch(err => res.status(401).send());
		})
		.catch(err => res.status(401).send());
});

app.post('/users', (req, res) => {
	const body = _.pick(req.body, ['email', 'password']);
	const user = new User(body);

	user.save()
		.then(user => {
			return user.generateAuthToken();
		})
		.then(token => {
			res.header('X-Auth', token).send(user);
		})
		.catch(err => res.status(400).json(err));
});

app.post('/users/login', (req, res) => {
	// const { email, password } = req.body;
	const body = _.pick(req.body, ['email', 'password']);

	return User.findByCredentials(body.email, body.password)
		.then(user => {
			if (!user) return res.status(404).json({ message: 'User not found' });
			return user.generateAuthToken().then(token => res.header('X-Auth', token).json(user));
		})
		.catch(err => res.status(400).json(err));
});

app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(
		() => {
			res.status(200).send();
		},
		() => {
			res.status(400).send();
		}
	);
});

app.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));

module.exports = { app };

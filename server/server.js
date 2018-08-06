const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const Todo = require('./models/todo');
const User = require('./models/user');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());

app.get('/todos', (req, res) => {
	Todo.find()
		.then(todos => res.json({ todos }))
		.catch(err => res.status(400).send(err));
});

app.get('/todos/:todo_id', (req, res) => {
	return Todo.findById(req.params.todo_id)
		.then(todo => res.json({ todo }))
		.catch(err => res.status(400).json(err));
});

app.post('/todos', (req, res) => {
	const todo = new Todo({
		text: req.body.text,
	});

	todo.save()
		.then(todo => {
			res.json(todo);
		})
		.catch(err => res.status(400).send(err));
});

app.delete('/todos/:todo_id', (req, res) => {
	const id = req.params.todo_id;

	if (!ObjectID.isValid(id)) return res.status(404).send();

	return Todo.findByIdAndDelete(id)
		.then(response => {
			if (!response) return res.status(404).send();

			return res.status(200).json(response);
		})
		.catch(err => res.status(400).json(err));
});

app.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));

module.exports = { app };

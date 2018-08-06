const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const Todo = require('./models/todo');
const User = require('./models/user');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.post('/todos', (req, res) => {
	const todo = new Todo({
		text: req.body.text,
	});

	todo.save()
		.then(todo => {
			res.send(todo);
		})
		.catch(err => res.status(400).send(err));
});

app.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));

module.exports = { app };

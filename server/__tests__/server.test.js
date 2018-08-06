const expect = require('expect');
const request = require('supertest');

const { app } = require('../server');
const Todo = require('../models/todo');
const User = require('../models/user');

const todos = [
	{ text: ' 1st Test Todo Text' },
	{ text: ' 2nd Test Todo Text' },
	{ text: ' 3rd Test Todo Text' },
];

beforeEach(done => {
	// Wipe all todos
	Todo.remove({})
		.then(() => {
			return Todo.insertMany(todos);
		})
		.then(() => done());
});

describe('POST /todos', () => {
	it('should create a new todo', done => {
		const text = 'Test Todo Text';

		request(app)
			.post('/todos')
			.send({
				text,
			})
			.expect(200)
			.expect(res => {
				expect(res.body.text).toBe(text);
			})
			.end((err, res) => {
				if (err) return done(err);

				Todo.find({ text })
					.then(todos => {
						expect(todos.length).toBe(1);
						expect(todos[0].text).toBe(text);
						done();
					})
					.catch(err => done(err));
			});
	});

	it('should not create todo if body data is invalid', done => {
		request(app)
			.post('/todos')
			.send({})
			.expect(400)
			.end((err, res) => {
				if (err) return done(err);

				Todo.find()
					.then(todos => {
						expect(todos.length).toBe(3);
						done();
					})
					.catch(err => done(err));
			});
	});
});

describe('GET /todos', () => {
	it('should get all todos', done => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect(res => expect(res.body.todos.length).toBe(3))
			.end(done);
	});
});

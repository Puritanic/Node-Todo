const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { app } = require('../server');
const Todo = require('../models/todo');
const User = require('../models/user');

const { todos, populateTodos, users, populateUsers } = require('./fixtures');

beforeEach(populateUsers);
beforeEach(populateTodos);

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

describe('GET /todos/:todo_id', () => {
	it('should get todo by id', done => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect(res => expect(res.body.todo.text).toBe(todos[0].text))
			.end(done);
	});
});

describe('DELETE /todos/:todos_id', () => {
	const id = new ObjectID().toHexString();

	it('should remove a todo', done => {
		request(app)
			.delete(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect(res => expect(res.body.text).toBe(todos[0].text))
			.end(done);
	});

	it('should return 404 if todo not found', done => {
		request(app)
			.delete(`/todos/${id}`)
			.expect(404)
			.end(done);
	});
});

describe('PATCH /todos/:id', () => {
	it('should update the todo', done => {
		var hexId = todos[0]._id.toHexString();
		var text = 'This should be the new text';

		request(app)
			.patch(`/todos/${hexId}`)
			.send({
				completed: true,
				text,
			})
			.expect(200)
			.expect(res => {
				expect(res.body.todo.text).toBe(text);
				expect(res.body.todo.completed).toBe(true);
				expect(typeof res.body.todo.completedAt).toBe('string');
			})
			.end(done);
	});

	it('should clear completedAt when todo is not completed', done => {
		var hexId = todos[1]._id.toHexString();
		var text = 'This should be the new text!!';

		request(app)
			.patch(`/todos/${hexId}`)
			.send({
				completed: false,
				text,
			})
			.expect(200)
			.expect(res => {
				expect(res.body.todo.text).toBe(text);
				expect(res.body.todo.completed).toBe(false);
				expect(res.body.todo.completedAt).toBeFalsy();
			})
			.end(done);
	});
});

describe('GET /users/me', () => {
	it('should return user if authenticated', done => {
		request(app)
			.get('/users/me')
			.set('X-Auth', users[0].tokens[0].token)
			.expect(res => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
			})
			.end(done);
	});

	it('should return 401 if not authenticated', done => {
		request(app)
			.get('/users/me')
			.set('X-Auth', '')
			.expect(401)
			.end(done);
	});
});

describe('POST /users', () => {
	it('should create a user', done => {
		const data = {
			email: 'test@mail.com',
			password: '$pass$!!',
		};

		request(app)
			.post('/users/')
			.send(data)
			.expect(200)
			.expect(res => {
				expect(res.headers['x-auth']).toBeTruthy();
				expect(res.body._id).toBeTruthy();
				expect(res.body.email).toBe(data.email);
			})
			.end(done);
	});

	it('should return validation errors if request is invalid', done => {
		const data = {
			email: 'test@mail.com',
			password: '',
		};

		request(app)
			.post('/users/')
			.send(data)
			.expect(400)
			.expect(res => {
				expect(res.body.errors).toBeTruthy();
			})
			.end(done);
	});
});

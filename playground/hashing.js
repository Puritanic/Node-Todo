const { SHA256 } = require('crypto-js');

const message = 'User No. 3';
const hash = SHA256(message).toString();

console.log(hash);

const jwt = require('jsonwebtoken');

var data = {
	id: 10,
};

const token = jwt.sign(data, 'secret - salt');
const decodedToken = jwt.verify(token, 'secret - salt');
console.log('decodedToken', decodedToken);
console.log('token:', token);

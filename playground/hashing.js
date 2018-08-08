const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const password = '123abc!';

// Generate salt
// The higher the number of the rounds, the longer it takes to finish the algorithm,
// but the password is harder to brute force too
bcrypt.genSalt(10, (err, salt) => {
	bcrypt.hash(password, salt, (err, hash) => {
		console.log(hash);
	});
});

const hashedPassword = '$2a$10$Cofk7Odl906tr.9NReckxO3yjHwSfpF8KhNcGaALL4dmZiKYtlo6S';

bcrypt.compare(password, hashedPassword, (err, result) => {
	console.log(result);
});

// const message = 'User No. 3';
// const hash = SHA256(message).toString();

// console.log(hash);

// const jwt = require('jsonwebtoken');

// var data = {
// 	id: 10,
// };

// const token = jwt.sign(data, 'secret - salt');
// const decodedToken = jwt.verify(token, 'secret - salt');
// console.log('decodedToken', decodedToken);
// console.log('token:', token);

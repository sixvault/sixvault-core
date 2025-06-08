const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: [
        'http://localhost:80',
        'http://localhost:8080',
        'http://localhost:3000',
        'http://localhost:4173',
        'http://localhost:5173',
        'https://sixvault.xyz',
        'https://api.sixvault.xyz'
    ],
    credentials: true
}));

const verifyAccessToken = require('./utils/auth/jwt/verify');

const userRouter = require('./domains/users/user.router');
app.use('/user', userRouter);

// const serviceRouter = require('./domains/services/services.router');
// app.use('/service', serviceRouter);

app.get('/protected', verifyAccessToken, (req, res) => {
    console.log(req.user);
    res.status(200).json({
      status: 'success',
      message: 'Protected route',
      data: req.user
    });
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'templates/pages/index.html'));
});

module.exports = app;
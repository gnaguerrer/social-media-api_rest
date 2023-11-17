const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const middleware = require('../middlewares');

router.post('/test', middleware.auth, UserController.testingAuth);
router.post('/user', UserController.createUser);
router.post('/login', UserController.login);

module.exports = router;

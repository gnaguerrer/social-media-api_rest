const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const middleware = require('../middlewares');

router.post('/login', UserController.login);
router.post('/user', UserController.createUser);
router.put('/user/:id?/', middleware.auth, UserController.updateUser);
router.get('/user/:id', middleware.auth, UserController.getUser);
router.get('/users/', middleware.auth, UserController.getUsers);

module.exports = router;

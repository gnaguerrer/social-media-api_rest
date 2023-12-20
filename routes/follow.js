const express = require('express');
const router = express.Router();
const middleware = require('../middlewares');
const FollowController = require('../controllers/follow');

module.exports = router;

router.post('/save', middleware.auth, FollowController.userFollow);

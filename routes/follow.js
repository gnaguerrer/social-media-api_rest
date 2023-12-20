const express = require('express');
const router = express.Router();
const middleware = require('../middlewares');
const FollowController = require('../controllers/follow');

module.exports = router;

router.post('/', middleware.auth, FollowController.userFollow);
router.delete('/:id', middleware.auth, FollowController.userUnfollow);

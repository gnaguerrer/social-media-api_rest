const express = require('express');
const router = express.Router();
const middleware = require('../middlewares');
const PublicationController = require('../controllers/publications');

router.post('/', middleware.auth, PublicationController.createPublication);

router.get(
  '/detail/:id',
  middleware.auth,
  PublicationController.getPublicationById
);
router.get(
  '/user',
  middleware.auth,
  PublicationController.getPublicationsByUserId
);
router.get('/feed', middleware.auth, PublicationController.getPublications);

router.delete('/:id', middleware.auth, PublicationController.removePublication);

module.exports = router;

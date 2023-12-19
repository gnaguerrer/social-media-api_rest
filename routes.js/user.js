const express = require('express');
const multer = require('multer');
const router = express.Router();
const UserController = require('../controllers/user');
const middleware = require('../middlewares');

// Upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/avatars');
  },
  filename: (req, file, cb) => {
    cb(null, `avatar_${file.originalname}_${Date.now()}`);
  }
});

const uploads = multer({ storage });

router.post('/login', UserController.login);
router.post('/user', UserController.createUser);

// Update
router.put('/user/:id?/', middleware.auth, UserController.updateUser);
router.post(
  '/user/image',
  [middleware.auth, uploads.single('file')],
  UserController.updateImage
);

// Get
router.get('/user/:id', middleware.auth, UserController.getUser);
router.get('/users/', middleware.auth, UserController.getUsers);

module.exports = router;

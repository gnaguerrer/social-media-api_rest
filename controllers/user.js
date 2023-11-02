const bcrypt = require('bcrypt');
const User = require('../models/user');

const createUser = async (req, res) => {
  let params = req.body;

  if (
    !params?.name ||
    !params?.email ||
    !params?.password ||
    !params?.nickname
  ) {
    return res.status(400).json({
      error: true,
      message: 'Data is missing',
      data: null
    });
  }
  try {
    let newUser = new User(params);

    const users = await User.find({
      $or: [
        {
          email: newUser.email.toLowerCase()
        },
        {
          nickname: newUser.nickname
        }
      ]
    }).exec();

    if (users?.length) {
      return res.status(200).json({
        error: true,
        message: 'User already exists',
        data: null
      });
    }

    const pwd = await bcrypt.hash(newUser.password, 10);
    newUser.password = pwd;
    params.password = pwd;

    const savedUser = await newUser.save();

    if (savedUser) {
      const userData = newUser;
      delete userData.password;
      return res.status(200).json({
        message: 'User created',
        data: userData
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Unable to create an user',
      data: null
    });
  }
};

module.exports = {
  createUser
};

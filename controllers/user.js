const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('../services/jwt');
const mongoosePagination = require('mongoose-pagination');

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
      return res.status(200).json({
        message: 'User created',
        data: savedUser
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

const login = async (req, res) => {
  let params = req.body;
  if (!params?.email || !params?.password) {
    return res.status(400).json({
      error: true,
      message: 'Data is missing',
      data: null
    });
  }
  try {
    const user = await User.findOne({ email: params?.email }).exec();
    if (user) {
      const pwd = bcrypt.compareSync(params.password, user.password);
      if (!pwd) {
        return res.status(400).json({
          error: true,
          message: 'Incorrect email or password.',
          data: null
        });
      }
      const token = jwt.createToken(user);
      return res.status(200).json({
        message: 'Login successfully',
        data: {
          user,
          token
        }
      });
    } else {
      return res.status(404).json({
        message: 'User not register',
        data: null
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Unable to login',
      data: null
    });
  }
};

const getUser = async (req, res) => {
  const id = req?.params?.id;
  try {
    const user = await User.findById(id)
      .select({ password: 0, role: 0 })
      .exec();
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found',
        data: null
      });
    }
    return res.status(200).json({
      message: 'User found successfully',
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Unable to get user',
      data: null
    });
  }
};

const getUsers = async (req, res) => {
  let page = req?.params?.query ?? 1;
  page = parseInt(page) - 1;
  let itemsPerPage = req?.params?.query ?? 5;
  itemsPerPage = parseInt(itemsPerPage);
  try {
    const users = await User.find()
      .select({ password: 0, role: 0 })
      .sort('_id')
      .limit(itemsPerPage)
      .skip(itemsPerPage * page)
      .exec();

    return res.status(200).json({
      data: users,
      page
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Unable to get user list',
      data: null
    });
  }
};

module.exports = {
  createUser,
  login,
  getUser,
  getUsers
};

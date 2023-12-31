const bcrypt = require('bcrypt');
const fs = require('fs');
const User = require('../models/user');
const jwt = require('../services/jwt');
const followService = require('../services/followService');

const createUser = async (req, res) => {
  const params = req.body;

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
    const newUser = new User(params);

    const users = await User.find({
      $or: [
        {
          email: newUser.email.toLowerCase()
        },
        {
          nickname: newUser.nickname.toLowerCase()
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
  const params = req.body;
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
    console.log('user :>> ', user);
    const followInfo = await followService.userFollowTracker(req.user.id, id);
    return res.status(200).json({
      message: 'User found successfully',
      data: {
        ...user._doc,
        following: followInfo.following,
        follwer: followInfo.followers
      }
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
  let pageQuery = req?.params?.query ?? 1;
  pageQuery = parseInt(pageQuery) - 1;
  let itemsPerPage = req?.params?.query ?? 5;
  itemsPerPage = parseInt(itemsPerPage);
  try {
    const users = await User.paginate(
      {},
      { page: pageQuery, limit: itemsPerPage, select: { password: 0, role: 0 } }
    );
    if (!users) {
      return res.status(400).json({
        error: true,
        message: 'Unable to get user list',
        data: null
      });
    }
    const { docs, limit, totalDocs, ...rest } = users;
    return res.status(200).json({
      data: docs,
      itemsPerPage: limit,
      total: totalDocs,
      ...rest
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Unable to get user list',
      data: null
    });
  }
};

const updateUser = async (req, res) => {
  const id = req?.params?.id ?? req.user.id;
  const newData = req.body;

  let userIdentity = null;
  if (!req?.params?.id) {
    userIdentity = req.user;
    delete userIdentity.image;
    delete userIdentity.iat;
    delete userIdentity.exp;
    delete userIdentity.role;
  }

  try {
    let userIsset = false;

    const users = await User.find({
      $or: [
        {
          email: newData.email.toLowerCase()
        },
        {
          nickname: newData.nickname.toLowerCase()
        }
      ]
    }).exec();

    users.forEach((user) => {
      if (user?._id.toString() !== userIdentity.id) {
        userIsset = true;
      }
    });

    if (userIsset) {
      return res.status(400).json({
        error: true,
        message: 'Unable to update user. Email or nickname already exist',
        data: null
      });
    }

    if (newData?.password) {
      const pwd = await bcrypt.hash(newData.password, 10);
      newData.password = pwd;
    }

    const user = await User.findByIdAndUpdate(id, newData, {
      new: true
    }).select({
      password: 0,
      role: 0
    });

    if (!user) {
      return res.status(400).json({
        error: true,
        message: 'Unable to update user',
        data: userIdentity
      });
    }

    return res.status(200).json({
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Unable to update user',
      data: null
    });
  }
};

const updateImage = async (req, res) => {
  try {
    if (!req?.file) {
      return res.status(400).send({
        message: 'Image is missing',
        error: true,
        data: null
      });
    }

    const image = req.file.originalname;
    const imageSplit = image?.split?.('.');
    const extension = imageSplit[1];
    if (extension !== 'png' && extension !== 'jpg' && extension !== 'jpeg') {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        error: true,
        message: 'Extension not allowed',
        data: null
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        image: req.file.filename
      },
      { new: true }
    ).select({
      password: 0,
      role: 0
    });

    if (!updatedUser) {
      return res.status(500).send({
        message: 'Unable to upload image',
        user: updatedUser
      });
    }

    return res.status(200).send({
      message: 'Image uploaded successfully',
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Unable to upload image',
      data: null
    });
  }
};

module.exports = {
  createUser,
  login,
  getUser,
  getUsers,
  updateUser,
  updateImage
};

const Follow = require('../models/follow');
const User = require('../models/user');

const userFollow = async (req, res) => {
  const followed = req?.body?.followed;
  const currentUser = req?.user;

  try {
    const existFollow = await Follow.find({
      user: currentUser.id,
      followed
    });

    if (!existFollow) {
      const userToFollow = new Follow({
        user: currentUser.id,
        followed
      });
      const followSave = await userToFollow.save();
      if (followSave) {
        return res.status(200).json({
          message: 'User followed successfully',
          data: userToFollow
        });
      } else {
        return res.status(400).json({
          message: 'Unable to follow user',
          error: true,
          data: null
        });
      }
    }

    return res.status(400).json({
      message: 'You already follow this user or user not exist',
      error: true,
      data: null
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to follow user',
      error: true,
      data: null
    });
  }
};

const userUnfollow = async (req, res) => {
  const unfollowId = req?.params?.id;
  const currentUser = req?.user;

  try {
    const currentFollow = await Follow.findOneAndDelete({
      user: currentUser.id,
      followed: unfollowId
    });
    if (currentFollow) {
      return res.status(200).json({
        message: 'Unfollow user successfully',
        data: currentFollow
      });
    }
    return res.status(500).json({
      message: 'Unable to unfollow user',
      error: true,
      data: null
    });
  } catch (error) {
    console.log('error :>> ', error);
    return res.status(500).json({
      message: 'Unable to unfollow user',
      error: true,
      data: null
    });
  }
};

module.exports = {
  userFollow,
  userUnfollow
};

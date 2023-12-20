const Follow = require('../models/follow');
const User = require('../models/user');

const userFollow = async (req, res) => {
  const followed = req?.body?.followed;
  const authUser = req?.user;

  try {
    const userToFollow = new Follow({
      user: authUser.id,
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
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to follow user',
      error: true,
      data: null
    });
  }
};

module.exports = {
  userFollow
};

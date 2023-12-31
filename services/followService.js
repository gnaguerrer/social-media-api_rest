const Follow = require('../models/follow');

const getFollowsIds = async (userId) => {
  let following = [];
  let followers = [];
  try {
    following = await Follow.find({ user: userId })
      .select({
        followed: 1,
        _id: 0
      })
      .exec();
    followers = await Follow.find({ followed: userId })
      .select({
        user: 1,
        _id: 0
      })
      .exec();
  } catch (error) {
    following = [];
    followers = [];
  }

  return {
    following: following.map((item) => item.followed),
    followers: followers.map((item) => item.user)
  };
};

const userFollowTracker = async (currentUserId, awayUserId) => {
  let following = false;
  let followers = false;
  try {
    following = await Follow.findOne({
      user: currentUserId,
      followed: awayUserId
    })
      .select({
        followed: 1,
        _id: 0
      })
      .exec();
    followers = await Follow.findOne({
      user: awayUserId,
      followed: currentUserId
    })
      .select({
        user: 1,
        _id: 0
      })
      .exec();
  } catch (error) {
    following = false;
    followers = false;
  }

  return {
    following,
    followers
  };
};

module.exports = {
  getFollowsIds,
  userFollowTracker
};

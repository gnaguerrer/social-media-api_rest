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
  } catch (error) {
    following = [];
  }

  return {
    following,
    followers
  };
};

module.exports = {
  getFollowsIds
};

const mongoose = require('mongoose');
const Follow = require('../models/follow');
const User = require('../models/user');
const followService = require('../services/followService');

const userFollow = async (req, res) => {
  const followed = req?.body?.followed;
  const currentUser = req?.user;

  try {
    const existFollow = await Follow.find({
      user: currentUser.id,
      followed
    });
    if (!existFollow?.length) {
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
    return res.status(500).json({
      message: 'Unable to unfollow user',
      error: true,
      data: null
    });
  }
};

const getFollowing = async (req, res) => {
  const userId = req?.query?.userId ?? req.user.id;
  const page = parseInt(req?.query?.page) > 0 ? parseInt(req?.query?.page) : 1;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({
      message: 'Invalid id',
      data: null,
      error: true
    });
  }

  try {
    const following = await Follow.paginate(
      { user: userId },
      {
        page,
        limit: 5,
        select: { _id: 0, __v: 0, created_at: 0 },
        populate: {
          path: 'followed',
          select: { password: 0, role: 0, __v: 0 }
        }
      }
    );
    const follows = await followService.getFollowsIds(userId);

    const { docs, limit, totalDocs, ...rest } = following;

    return res.status(200).json({
      data: docs.map((item) => ({
        ...item._doc,
        isFollowing: !!follows.following.find((follows) =>
          follows.followed.equals(item._doc.followed._id)
        )
      })),
      itemsPerPage: limit,
      total: totalDocs,
      ...rest
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to get following',
      error: true,
      data: null
    });
  }
};

const getFollowers = async (req, res) => {
  return res.status(200).json({
    message: 'Follower list',
    data: []
  });
};

module.exports = {
  userFollow,
  userUnfollow,
  getFollowing,
  getFollowers
};

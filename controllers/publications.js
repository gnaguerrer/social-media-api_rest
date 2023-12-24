const mongoose = require('mongoose');
const Publication = require('../models/publication');
const followService = require('../services/followService');

const createPublication = async (req, res) => {
  const data = req?.body;
  if (!data?.text) {
    return res.status(400).json({
      message: 'Missing text field',
      error: true,
      data: null
    });
  }
  try {
    const newPublication = new Publication({ ...data, user: req.user.id });
    const savePublication = await newPublication.save();
    if (!savePublication) {
      return res.status(500).json({
        message: 'Unable to create a publication',
        error: true,
        data: null
      });
    }
    return res.status(200).json({
      message: 'Publication created successfully',
      data: newPublication
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to create a publication',
      error: true,
      data: null
    });
  }
};

const getPublicationById = async (req, res) => {
  const publicationId = req?.params?.id;

  if (!mongoose.isValidObjectId(publicationId)) {
    return res.status(400).json({
      message: 'Invalid id',
      data: null,
      error: true
    });
  }
  try {
    const selectedPublication = await Publication.findById(publicationId);
    console.log('object :>> ', selectedPublication);
    if (!selectedPublication) {
      return res.status(404).json({
        message: 'Publication not found',
        error: true,
        data: null
      });
    }

    return res.status(200).json({
      message: 'Publication found successfully',
      data: selectedPublication
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to get publication',
      error: true,
      data: null
    });
  }
};

const removePublication = async (req, res) => {
  const publicationId = req?.params?.id;

  if (!mongoose.isValidObjectId(publicationId)) {
    return res.status(400).json({
      message: 'Invalid id',
      data: null,
      error: true
    });
  }
  try {
    const selectedPublication = await Publication.findByIdAndDelete(
      publicationId
    );

    if (!selectedPublication) {
      return res.status(404).json({
        message: 'Publication not exist',
        error: true,
        data: null
      });
    }

    return res.status(200).json({
      message: 'Publication deleted successfully',
      data: selectedPublication
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to find and remove publication',
      error: true,
      data: null
    });
  }
};

const getPublicationsByUserId = async (req, res) => {
  const userId = req?.query?.userId ?? req.user.id;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({
      message: 'Invalid user id',
      data: null,
      error: true
    });
  }

  try {
    const publications = await Publication.find({ user: userId }).sort(
      'created_at'
    );

    if (!publications) {
      return res.status(404).json({
        message: 'Unable to get publications',
        error: true,
        data: null
      });
    }
    return res.status(200).json({
      message: 'Publications found successfully',
      data: publications
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to get publications',
      error: true,
      data: null
    });
  }
};

const getPublications = async (req, res) => {
  const page = req?.query?.page ?? 1;
  console.log('req?.user :>> ', req?.user);
  try {
    const userFollows = await followService.getFollowsIds(req?.user.id);
    console.log('userFollows :>> ', userFollows);
    const publications = await Publication.paginate(
      { user: { $in: userFollows.following } },
      {
        page,
        limit: 5,
        select: { __v: 0 },
        populate: {
          path: 'user',
          select: { password: 0, role: 0, __v: 0, email: 0, created_at: 0 }
        }
      }
    );

    if (!publications) {
      return res.status(404).json({
        message: 'Unable to get publications',
        error: true,
        data: null
      });
    }

    const { docs, limit, totalDocs, ...rest } = publications;
    return res.status(200).json({
      message: 'Publications found successfully',
      data: docs,
      itemsPerPage: limit,
      total: totalDocs,
      ...rest
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to get publications',
      error: true,
      data: null
    });
  }
};

module.exports = {
  createPublication,
  getPublicationById,
  removePublication,
  getPublicationsByUserId,
  getPublications
};

const Books = require('../models/Book');
const User = require('../models/User');            // ✅ make sure this exists
const mongoose = require('mongoose');              // ✅ for GridFSBucket
const { Readable } = require('stream');            // ✅ to stream Buffer
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const getAllBooks = async (req, res) => {
  try {
    const { text, genre, author, condition } = req.query;

    // Build a dynamic filter object
    let filter = {};

    // Search by text (title OR description OR author)
    if (text && text.trim() !== "") {
      filter.$or = [
        { title: { $regex: text, $options: "i" } },
        { description: { $regex: text, $options: "i" } },
        { author: { $regex: text, $options: "i" } }
      ];
    }

    // Filter by genre
    if (genre && genre !== "All Genres") {
      filter.genre = genre;
    }

    // Filter by author
    if (author && author !== "All Authors") {
      filter.author = author;
    }

    // Filter by condition
    if (condition && condition !== "Condition") {
      filter.condition = condition;
    }

    console.log("Book filter:", filter); // Debugging

    const data = await Books.find(filter);

    if (!data || data.length === 0) {
      return res.status(StatusCodes.OK).json([]); // Return empty array instead of error
    }

    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Server error' });
  }
};


const postBook = async (req, res) => {
  try {
    const { title, author, genre, description, condition } = req.body;

    if (!req.file) throw new BadRequestError('Photo file is required');
    if (!title || !author || !genre || !condition) {
      throw new BadRequestError('Please provide all required fields');
    }

    // ✅ Always trust the JWT, not the client-sent ownerID
    console.log(req.body);
    const ownerID = req.user.userId;
    const user = await User.findById(ownerID);
    if (!user) throw new NotFoundError('User not found');

    // ✅ Upload to GridFS manually
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'bookImages',
    });

    const filename = `${Date.now()}-${req.file.originalname}`;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
      metadata: { ownerID },
    });

    // Stream the in-memory buffer to GridFS
    const readable = Readable.from(req.file.buffer);

    await new Promise((resolve, reject) => {
      readable
        .pipe(uploadStream)
        .on('error', reject)
        .on('finish', resolve);
    });

    // The filename we used is what we’ll serve by name later
    const photoUrl = `/api/v1/books/image/${uploadStream.filename}`;

    const newBook = await Books.create({
      title,
      author,
      genre,
      description: description || null,
      condition,
      location: user.location || null, // ✅ pulled from user profile
      ownerID,
      photo: photoUrl,
    });

    res.status(StatusCodes.CREATED).json(newBook);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Server error' });
  }
};

const getBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestError('Invalid Book ID');
    }

    const book = await Books.findById(id);
    if (!book) throw new NotFoundError(`Book with id ${id} not found`);
    res.status(StatusCodes.OK).json(book);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Server error' });
  }
};

const postImage = async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'bookImages',
    });

    // Optional: set Content-Type from file doc
    const fileDoc = await mongoose.connection.db
      .collection('bookImages.files')
      .findOne({ filename: req.params.filename });

    if (!fileDoc) return res.status(404).json({ msg: 'No file found' });
    if (fileDoc.contentType) res.set('Content-Type', fileDoc.contentType);

    bucket
      .openDownloadStreamByName(req.params.filename)
      .on('error', () => res.status(404).json({ msg: 'Stream error' }))
      .pipe(res);
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Server error' });
  }
};

module.exports = { getBook, getAllBooks, postBook, postImage };

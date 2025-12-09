const SwapRequest = require("../models/swapRequest");
const {StatusCodes} = require('http-status-codes')
const {BadRequestError,NotFoundError}=require('../errors')
const Chat = require("../models/chatSchema")
const Book = require("../models/Book");
const User = require("../models/User")

const sendSwapRequest = async(req,res)=>{
    try {
        const {bookId} = req.body;
        const requesterId = req.user.userId;

        const book = await Book.findById(bookId);
        if(!book) return res.status(StatusCodes.NotFoundError).json({error:"Book Not Found"});

        const owner = await User.findById(book.ownerID);
        if (!owner) throw new NotFoundError('User not found');

    if (owner._id.toString() === requesterId.toString()) {
      return res.status(400).json({ error: "You cannot request your own book" });
    }

    const newSwapRequest = new SwapRequest({
        bookId,
        requester: requesterId,
        owner: owner,
    })

    await newSwapRequest.save();
    res.status(StatusCodes.OK).json({msg:"Swap Request Sent", newSwapRequest})

    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
        console.log(error);
    }
}

const getSentRequests = async (req, res) => {
  try {
    const requesterId = req.user.userId;
    const requests = await SwapRequest.find({ requester: requesterId })
      .populate("bookId", "title author")
      .populate("owner", "name email");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getIncomingRequests = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const requests = await SwapRequest.find({ owner: ownerId, status: "pending" }).populate("bookId", "title author").populate("requester", "name email");
    res.status(StatusCodes.OK).json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // "accept" or "reject"
    const ownerId = req.user.userId;

    const swapRequest = await SwapRequest.findById(requestId);
    const requesterUser= swapRequest.requester;
    if (!swapRequest) return res.status(404).json({ error: "Request not found" });

    // Ensure only the book owner can respond
    if (swapRequest.owner.toString() !== ownerId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (action === "accept") {
      swapRequest.status = "accepted";
      await swapRequest.save();

      // Create a chat document if not exists
      let chat = await Chat.findOne({ swapRequest: swapRequest._id });
      if (!chat) {
        chat = new Chat({ swapRequest: swapRequest._id, messages: [],  participants:[ownerId, requesterUser]});
        await chat.save();
      }

      return res.json({ message: "Request accepted", swapRequest, chat });
    } else if (action === "reject") {
      swapRequest.status = "rejected";
      await swapRequest.save();
      return res.json({ message: "Request rejected", swapRequest });
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {sendSwapRequest,getSentRequests,getIncomingRequests,respondToRequest}
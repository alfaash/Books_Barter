const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authentication");

const {sendSwapRequest,getSentRequests,getIncomingRequests,respondToRequest} = require("../controllers/swap");

router.get("/sent", authMiddleware, getSentRequests);
router.post("/",authMiddleware,sendSwapRequest)
router.get("/incoming",authMiddleware,getIncomingRequests)
router.post("/:requestId/respond", authMiddleware,respondToRequest);

module.exports=router;
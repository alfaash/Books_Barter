const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    swapRequest: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "SwapRequest",
        required: true 
    },
    messages: [
        {
            sender: { 
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true 
            },
            message: { 
                type: String,
                required: true 
            },
            timestamp: { 
                type: Date,
                default: Date.now 
            },
            readBy: [
                { 
                    type: mongoose.Schema.Types.ObjectId, ref: "User" 
                }
            ],
        }
    ],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model("Chat",chatSchema);
const mongoose=require('mongoose');

const swapRequestSchema= mongoose.Schema({
    bookId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Books",
        required:true
    },
    requester:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    status:{
        type:String,
        enum:["pending","accepted","rejected"],
        default:"pending"
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model("SwapRequest",swapRequestSchema);
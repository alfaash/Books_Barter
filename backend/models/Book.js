const mongoose = require('mongoose')

const BooksSchema= new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    genre:{
        type:String,
        enum:['Fiction','Non-Fiction','Romance','Science Fiction','Fantasy','Mystery'],
        required:true
    },
    description:{
        type:String
    },
    condition:{
        type:String,
        enum:['New','Like New','Used'],
        default:'Used',
        required:true
    },
    photo:{
        type:String,
        required:true
    },
    location:{
        type:String,
        trim:true,
        default:null
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    ownerID:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('Books',BooksSchema);
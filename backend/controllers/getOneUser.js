const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError,NotFoundError}=require('../errors')

const getUser = async(req,res)=>{
    try {
        console.log(req.params.id);
        const user = await User.findById(req.params.id).select('-password');
        console.log(user);
        if (!user) {
            throw new NotFoundError(`No user found with ${req.params.id}`)
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ msg:err });
    }
}

module.exports={getUser} ;
const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError,NotFoundError}=require('../errors')

const getUser = async(req,res)=>{
    try {
        const user = await User.findById(req.user.userId).select('-password');
        console.log(user);
        if (!user) {
            throw new NotFoundError(`No user found with ${req.user.userId}`)
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
}

module.exports={getUser} ;
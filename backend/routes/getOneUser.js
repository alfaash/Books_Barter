const express=require('express');
const router = express.Router({ mergeParams: true });
const{getUser}=require('../controllers/getOneUser');

router.route('/').get(getUser);

module.exports=router;
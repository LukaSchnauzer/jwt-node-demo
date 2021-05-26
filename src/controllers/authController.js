const { Router } = require('express');
const router = Router();
const User = require('../models/User');
const config = require('../config');
const verifyToken = require('./verifyToken');

router.post('/singup', async (req, res, next) => {
    const { username, email, password} = req.body;
    const user = new User({
        username,
        email,
        password
    });

    user.password = await user.encryptPassword(user.password);
    await user.save();
    const token = jwt.sign({id : user._id}, config.secret, {
        expiresIn : 60 * 60 * 24
    });
    res.json({auth:true, token});
});

router.post('/singin', async (req, res, next) => {
    const { email, password} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.status(404).send('Email not found');
    }
    
    const validPswrd = await user.validatePassword(password);
    
    if(!validPswrd){
        return res.status(401).json({
            auth:false,
            token:null
        });
    }

    const token = jwt.sign({id : user._id}, config.secret, {
        expiresIn : 60 * 60 * 24
    });

    res.json({
        auth:false,
        token
    });
});

router.get('/me', verifyToken, async (req, res, next) => {
    //Authenticate

    const user = await User.findById(req.userId, {password : 0});
    if(!user){
        return res.status(404).send('No user found');
    }

    res.json(user);
});

module.exports = router;
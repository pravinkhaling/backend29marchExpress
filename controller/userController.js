const User = require('../model/UserModel')
const sendEmail = require('../utils/setEmail')
const Token = require('../model/TokenModel')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const {expressjwt} = require('express-jwt')


//register
exports.register = async (req, res) => {
    // destructuring to get info from user
    const {username, email, password} = req.body


    //check if email already exists
    const user = await User.findOne({email: email})
    if(user){
        return res.status(400).json({error:"Email already exists. Try another email."})
    }

    //register if email does not exits
    let userToRegister = new User({
        username: username,
        email: email,
        password: password
    })
    userToRegister = await userToRegister.save()

    if(!userToRegister){
        return res.status(400).json({error: "Something went wrong/ failed to register"})
    }
    //generate token
    let token = new Token({
        token: crypto.randomBytes(16).toString('hex'),
        user: userToRegister._id
    })
    token = await token.save()
    if(!token){
        return res.status(400).json({error:"Failed to generate token"})
    }
    //send email verification 
    const url = `http://localhost:5000/user/verification/${token.token}`
    sendEmail({
        from: 'noreply@something.com',
        to: email,
        Subject: 'Email verification',
        text: 'Click on the following link or copy paste it in browser.' + url,
        html: `<a href =${url}><button>Verify Email</button></a>`
        })
    res.send(userToRegister)
}

//to verify user
exports.verifyUser = async (req,res) => {
    // check token 
    let token = await Token.findOne({token: req.params.token})
    if(!token){
        return res.status(400).json({error:"Invalid token or token may have expired "})
    }
    // find user
    let userToVerify = await  User.findById(token.user)
    if(!userToVerify){
        return res.status(400).json({error:"User associated with token not found"})
    }
    // check if already verified
    if(userToVerify.isVerified){
        return res.status(400).json({error:"User already verified"})
    }
    // verify user
    userToVerify.isVerified = true
    userToVerify = await userToVerify.save()
    if(!userToVerify){
        return res.status(400).json({error:"Failed to verify"})
    }
    res.send({msg: "User verified successfully"})

}

//to resend verification email
exports.resendVerification = async (req,res) =>{
    //check  email
    let user = await User.findOne({email: req.body.email})
    if(!user){
        return res.status(400).json({error:"User not registered"})
    }
    // check if already verified
    if(user.isVerified){
        return res.status(400).json({error:"User already verified. Login to continue "})
    }
    // generate token 
     let token = new Token ({
        token: crypto.randomBytes(16).toString('hex'),
        user: user._id
     })
     token = await token.save()
     if(!token){
        return res.status(400).json({error:"Failed to generate token"})
     }
    // send email
    const url = `http://localhost:5000/user/verification/${token.token}`
    sendEmail({
        from: "noreply@something.com",
        to: user.email,
        subject: "Verification email",
        text: `Click on the following link or copy paste it in browser to verify. ${url}`,
        html: `<a href='${url}'><button>Verify Email</button></a>`
    })

    res.send({msg:"Verification link has been sent to your email."})

}

// sign in process 
exports.signIn = async (req, res) => {
    //destructing object to get email and password from body
    const {email, password} =req.body
    // check email
    const user = await User.findOne({email:email})
    if(!user){
        return res.status(400).json({error:"Email not registerd"})
    }
    // check password
    if(!user.authenticate(password)){
        return res.status(400).json({error:"Email and password do not match"})
    }
    // check if verified or not 
     if(!user.isVerified){
        return res.status(400).json({error:"User not verified."})
     }
    // generate login token 
    let token = jwt.sign({user: user._id, role: user.role}, process.env.JWT_SECRET)
    //set cookie
    res.cookie('myCookie', token,{expire: Date.now()+86400})
    // return information to user
    const {_id, username, role} = user 
    res.send({token, user: {_id, username,email, role }})
}
//signout process
exports.signOut = (req,res) =>{
    res.clearCookie('myCookie')
    res.send({msg:"Signed  out"})
}

//authentication authorization 
/*
authentication - to identify user 
 to authenticate, we use email, password, username, phone number, etc
 package: jsonwebtoken (jwt)

authorization - to allow user to access routes
 to authorize we use special authorization tokens 
 package: jsonwebtoken, expressJWT
*/

//forget password
exports.forgetPassword = async (req, res) =>{
    //find email
    let user = await User.findOne({email: req.body.email})
    if(!user){
        return res.status(400).json({error:"User not registered"})
    }
    //generate token
    let token = new Token({
        token: crypto.randomBytes(16).toString('hex'),
        user: user._id
    })
    token = await token.save()
    if(!token){
        return res.status(400).json({error:"Something went wrong"})
    }
    //send token in email
    const url = `http://localhost:5000/user/resetpassword/${token.token}`
    sendEmail({
        from: "noreply@something.com",
        to: user.email,
        subject:"Password Reset Link",
        text: `Click on the following link or copy paste it in browser to reset password. ${url}`,
        html: `<a href='${url}'><button>Reset Password</button></a>`
    })
    res.send({msg:"Password reset link has been sent to your email."})

}
//to reset password
exports.resetPassword = async (req, res) =>{
    //check token 
    let token = await Token.findOne({token: req.params.token})
    if(!token){
        return res.status(400).json({error:"Token not found or may have expired."})
    }
    //find user
    let user = await User.findById(token.user)
    if(!user){
        return res.status(400).json({error:"User not found"})
    }
    //reset password
    user.password = req.body.password
    user = await user.save()
    if(!user){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send({msg:"password reset successful."})

}

//to get user details
exports.getUserDetails = async (req, res) => {
    let user = await User.findById(req.params.id).select(['email','role','username'])
    if(!user){
        return res.status(400).json({error:"Something went wrong"})

    }
    res.send(user)
}

//authorization
exports.authorize = expressjwt({
    algorithms: ['HS256'],
    secret: process.env.JWT_SECRET
})
const express = require('express')
const {register, verifyUser, resendVerification, signIn, signOut, forgetPassword, resetPassword, getUserDetails} = require('../controller/userController')
const router = express.Router()
 
router.post('/register', register)
// router.get('/verification/:token ', verifyUser)
router.get('/verification/:token', verifyUser)
router.post('/resendverification', resendVerification)
router.post('/signin', signIn)
router.get('/signout', signOut)
router.post('/forgetpassword', forgetPassword)
router.post('/resetpassword/:token', resetPassword)
router.get('/getuserdetails/:id', getUserDetails)

//userList
//userdetail
//finduserbyemail
//finduserbyusername
//updateuser
//deleteuser



module.exports = router
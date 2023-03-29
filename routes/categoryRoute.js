const express = require('express')
const { addCategory, getAllCategories, getCategoryDetails } = require('../controller/categoryController')
const { authorize } = require('../controller/userController')
const router = express.Router()

router.post('/addcategory',authorize, addCategory)
router.get('/getall', getAllCategories)
router.get('/getCategoryDetails/:id', getCategoryDetails)
//router.get('/updatecategory/:id', updateCategory)
//router.get('/deletecategory/:id', deleteCategory) 


module.exports = router
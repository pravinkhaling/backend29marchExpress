const express = require('express')
const { addProduct, getAllProducts, getProductsByCategory, updateProduct, deleteProduct } = require('../controller/productController')
const { authorize } = require('../controller/userController')
const upload = require('../utils/fileUpload')
const router = express.Router()

router.post('/addproduct', upload.single('product_image'),authorize, addProduct)
router.get('/getallproducts', getAllProducts)
router.get('/productdetails', getAllProducts)
router.get('/getproductbycategory/:id', getProductsByCategory)
router.put('/updateproduct/:id', updateProduct)
router.delete('/deleteproduct/:id', deleteProduct)

module.exports = router

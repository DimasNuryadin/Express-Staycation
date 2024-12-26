const router = require('express').Router();
const adminController = require('../controller/adminController');
const { upload } = require('../middlewares/multer');

router.get('/dashboard', adminController.viewDashboard);

// Category
router.get('/category', adminController.viewCategory);
router.post('/category', adminController.addCategory);
router.put('/category', adminController.editCategory);
router.delete('/category/:id', adminController.deleteCategory);

// Bank
router.get('/bank', adminController.viewBank);
router.post('/bank', upload, adminController.addBank);
router.put('/bank', upload, adminController.editBank);
router.delete('/bank/:id', upload, adminController.deleteBank);

// Item
router.get('/item', adminController.viewItem);

// Booking
router.get('/booking', adminController.viewBooking);

module.exports = router;
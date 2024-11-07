// routes/categoryRoutes.js
const express = require('express');
const { addCategory, getCategories } = require('../controllers/categoryController');

const router = express.Router();

// Route to add a new category
router.post('/add', addCategory);

// Route to get all categories
router.get('/list', getCategories);

module.exports = router;

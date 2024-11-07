// controllers/categoryController.js
const { insertCategory, getAllCategories,findCategoryByIdOrName } = require('../models/categoryModel');

// Controller to handle adding a new category
const addCategory = async (req, res) => {
  const { categoryId, categoryName } = req.body;

  if (!categoryId || !categoryName) {
    return res.status(400).json({ error: 'Category Id and Name are required' });
  }

  try {
    // Check if a category with the same id or name already exists
    const existingCategory = await findCategoryByIdOrName(categoryId, categoryName);

    if (existingCategory) {
      return res.status(400).json({ error: 'Category with the same ID or Name already exists' });
    }

    // Insert new category if no duplicate found
    await insertCategory({ category_id: categoryId, category_name: categoryName });
    return res.status(200).json({ message: 'Category added successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Error adding category' });
  }
};

// Controller to fetch all categories
const getCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching categories' });
  }
};

module.exports = {
  addCategory,
  getCategories,
};

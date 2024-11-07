// models/categoryModel.js
const { getDB } = require('../config');

// Find category by ID or Name to prevent duplicates
const findCategoryByIdOrName = async (categoryId, categoryName) => {
  const db = getDB();
  const collection = db.collection('categories');

  // Query to find a category by either category_id or category_name
  const query = {
    $or: [
      { category_id: categoryId },
      { category_name: categoryName }
    ]
  };

  return await collection.findOne(query); // Return the first matching document
};

// Insert a new category
const insertCategory = async (categoryData) => {
  const db = getDB();
  const collection = db.collection('categories');
  await collection.insertOne(categoryData); // Insert the new category
  return categoryData;
};
// Find a category by Category Id
const findCategoryById = async (categoryId) => {
  const db = getDB();
  const collection = db.collection('categories');
  return await collection.findOne({ 'category_id': categoryId });
};


// Get all categories
const getAllCategories = async () => {
  const db = getDB();
  const collection = db.collection('categories');
  return await collection.find({}).toArray();
};
const getCategoryNameById = async (db, category_id) => {
    try {
      console.log("Fetching category for ID:", category_id); // Debugging log
      const category = await db.collection('categories').findOne({ category_id: parseInt(category_id) });
      console.log("Fetched category:", category); // Debugging log
      return category ? category.category_name : null;
    } catch (err) {
      console.error('Error fetching category name:', err); // Add debug log
      throw new Error('Error fetching category name');
    }
  };

module.exports = {
  findCategoryByIdOrName,
  getCategoryNameById,
  insertCategory,
  findCategoryById,
  getAllCategories,
};

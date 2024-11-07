// models/questionModel.js
const { getDB } = require('../config');
const { findCategoryById, insertCategory } = require('./categoryModel'); // Import both find and insert functions for categories
const { insertQuiz } = require('./quizModel'); // Import the insertQuiz function

// Insert questions and map category
// const insertQuestions = async (questionData) => {
//   const db = getDB();
//   const collection = db.collection(process.env.COLLECTION_NAME || 'questions');

//   // Insert the quiz data
//   const quizData = {
//     quiz_id: questionData[0].quiz_id,
//     quiz_name: questionData[0].quiz_name,
//     quiz_description: questionData[0].quiz_description,
//     created_at: new Date(),
//   };

//   await insertQuiz(quizData); // Insert the quiz data into the quizzes collection

//   for (const question of questionData) {
//     // Check if the category exists in the 'categories' collection
//     let category = await findCategoryById(question['category_id']);
//     if (!category) {
//       // If category doesn't exist, insert a new one
//       const newCategory = {
//         category_id: question['category_id'], // Use the provided category_id from question data
//         category_name: question['category_name'] || 'Default Category', // Set a default category name if not provided
//       };
//       category = await insertCategory(newCategory); // Insert the new category
//     }
//     // Map the category_name from the inserted or existing category to the question
//     question['category_name'] = category['category_name']; // Add category name to question data
//   }
//   // Insert the question data into the 'questions' collection
//   return await collection.insertMany(questionData);
// };

// Insert questions and map category
const insertQuestions = async (quizData, questionData) => {
  const db = getDB();
  const questionsCollection = db.collection(process.env.COLLECTION_NAME || 'questions');
  const quizzesCollection = db.collection('quizzes'); // Ensure you have a 'quizzes' collection

  // Insert the quiz data into the 'quizzes' collection
  await quizzesCollection.insertOne(quizData);

  for (const question of questionData) {
    // Check if the category exists in the 'categories' collection
    let category = await findCategoryById(question['category_id']);
    if (!category) {
      // If category doesn't exist, insert a new one
      const newCategory = {
        category_id: question['category_id'], // Use the provided category_id from question data
        category_name: question['category_name'] || 'Default Category', // Set a default category name if not provided
      };
      category = await insertCategory(newCategory); // Insert the new category
    }
    // Map the category_name from the inserted or existing category to the question
    question['category_name'] = category['category_name']; // Add category name to question data
  }

  // Insert the question data into the 'questions' collection
  return await questionsCollection.insertMany(questionData);
};


// Fetch question by date and category
const findQuestionsByDateAndCategory = async (categoryId, questionDate) => {
  const db = getDB();
  const collection = db.collection(process.env.COLLECTION_NAME || 'questions');

  // MongoDB query to find questions by category id and question date
  const query = {
    'category_id': categoryId,
    'question_date': questionDate
  };

  return await collection.find(query).toArray(); // Return all matching quizzes
};

const findQuestionsByQuizId = async (quizId) => {
  const db = getDB();
  const collection = db.collection(process.env.COLLECTION_NAME || 'questions');
  return await collection.find({ quiz_id: quizId }).toArray(); // Ensure quizId is a number
};

// Function to find questions by quiz_name
const findQuestionsByQuizName = async (quizName) => {
  const db = getDB();
  const collection = db.collection(process.env.COLLECTION_NAME || 'questions');
  return await collection.find({ quiz_name: quizName }).toArray();
};

// Function to find questions by both quiz_id and quiz_name
const findQuestionsByQuizIdAndQuizName = async (quizId, quizName) => {
  const db = getDB();
  const collection = db.collection(process.env.COLLECTION_NAME || 'questions');
  return await collection.find({ quiz_id: quizId, quiz_name: quizName }).toArray();
};
// Delete questions by quiz ID
const deleteQuestionsByQuizId = async (quizId) => {
  const db = getDB();
  const collection = db.collection(process.env.COLLECTION_NAME || 'questions');
  return await collection.deleteMany({ quiz_id: quizId });
};
// Update question by unique_id
const updateQuestionByUniqueId = async (uniqueId, updates) => {
  const db = getDB();
  const collection = db.collection(process.env.QUESTIONS_COLLECTION_NAME || 'questions');
  
  // Use $set to update only provided fields in updates
  return await collection.updateOne(
    { unique_id: uniqueId },
    { $set: updates }
  );
};
// Delete question by unique_id
const deleteQuestionByUniqueId = async (uniqueId) => {
  const db = getDB();
  const collection = db.collection(process.env.QUESTIONS_COLLECTION_NAME || 'questions');
  
  // Delete the document with the matching unique_id
  return await collection.deleteOne({ unique_id: uniqueId });
};
const findQuizIdByUniqueId = async (uniqueId) => {
  const db = getDB();
  const collection = db.collection(process.env.QUESTIONS_COLLECTION_NAME || 'questions');
  return await collection.findOne({ unique_id: uniqueId }, { projection: { quiz_id: 1 } }); // Only return quiz_id
};
module.exports = {
  findQuestionsByDateAndCategory,
  insertQuestions,
  findQuestionsByQuizId, // Export the new function
  findQuestionsByQuizName,
  findQuestionsByQuizIdAndQuizName,
  deleteQuestionsByQuizId, // Export the delete function
  updateQuestionByUniqueId, // Export the update function
  deleteQuestionByUniqueId, // Export delete function
  findQuizIdByUniqueId,
};

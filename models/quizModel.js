const { getDB } = require('../config');

// Insert a new quiz
const insertQuiz = async (quizData) => {
  const db = getDB();
  const collection = db.collection(process.env.QUIZZES_COLLECTION_NAME || 'quizzes');
  return await collection.insertOne(quizData);
};

// Fetch quizzes by quiz ID
const findQuizById = async (quizId) => {
  const db = getDB();
  const collection = db.collection(process.env.QUIZZES_COLLECTION_NAME || 'quizzes');
  return await collection.findOne({ quiz_id: quizId });
};
// Fetch all quizzes
const findAllQuizzes = async () => {
    const db = getDB();
    const collection = db.collection(process.env.QUIZZES_COLLECTION_NAME || 'quizzes');
    return await collection.find({}).toArray();  // Return all quizzes as an array
};

// Delete a quiz by quiz ID
const deleteQuizById = async (quizId) => {
  const db = getDB();
  const collection = db.collection(process.env.QUIZZES_COLLECTION_NAME || 'quizzes');
  return await collection.deleteOne({ quiz_id: quizId });
};

// Update quiz name and/or description by quiz ID
const updateQuizById = async (quizId, updates) => {
  const db = getDB();
  const collection = db.collection(process.env.QUIZZES_COLLECTION_NAME || 'quizzes');
  return await collection.updateOne(
    { quiz_id: quizId },
    { $set: updates }
  );
};

module.exports = {
  insertQuiz,
  findQuizById,
  findAllQuizzes,
  deleteQuizById, // Export the delete function
  updateQuizById, // Export the update function
};

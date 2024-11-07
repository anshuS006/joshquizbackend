const XLSX = require('xlsx');
const fs = require('fs');
const { getFromCache, setToCache,deleteFromCache } = require('./cache'); // Import the cache functions
const {
  insertQuestions,
  findQuestionsByDateAndCategory,
  findQuestionsByQuizId,
  findQuestionsByQuizName,
  findQuestionsByQuizIdAndQuizName,
  deleteQuestionsByQuizId,
  updateQuestionByUniqueId,
  deleteQuestionByUniqueId,
  findQuizIdByUniqueId,
} = require('../models/questionModel');
const { findAllQuizzes,deleteQuizById, updateQuizById} = require('../models/quizModel'); // Import the new function
const winston = require('winston');


// Setup logging using Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console(),
  ],
});

// Function to convert an Excel numeric date (e.g., 45565) to a formatted date string (YYYY-MM-DD)
const excelDateToFormattedDate = (excelDate) => {
  // Excel's epoch starts on December 30, 1899
  // Due to the leap year bug, dates >= March 1, 1900 are offset by one day
  const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // December 30, 1899

  // Calculate the number of days since the Excel epoch
  let days = Math.floor(excelDate);

  // Adjust for Excel's leap year bug
  if (excelDate >= 60) {
    days -= 0;
  }

  // Calculate the date by adding the days to the epoch
  const date = new Date(excelEpoch.getTime() + days * 86400000);

  // Extract the year, month, and day
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`; // Return the formatted date string
};


// Function to generate a unique long numeric ID


const generateUniqueId = () => {
  const timestamp = Date.now(); // Current timestamp in milliseconds
  const randomNum = Math.floor(Math.random() * 100); // Random number between 0-99
  const uniqueId = (timestamp + randomNum) % 1000000; // Ensure it's a 6-digit number using modulo
  return parseInt(uniqueId.toString().padStart(6, '0')); // Pad with leading zeros if needed
};

// const uploadQuestion = async (req, res) => {
//   if (!req.file) {
//     logger.error('No file uploaded');
//     return res.status(400).json({ error: 'No file uploaded' });
//   }

//   const { quiz_name, quiz_description } = req.body;

//   if (!quiz_name) {
//     logger.error('Quiz name is required');
//     return res.status(400).json({ error: 'Quiz name is required' });
//   }

//   const quiz_id = generateUniqueId();
//   const filePath = req.file.path;

//   try {
//     const workbook = XLSX.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     let questionData = XLSX.utils.sheet_to_json(worksheet);

//     questionData = questionData.map((question) => {
//       question.quiz_name = quiz_name;
//       question.quiz_description = quiz_description || '';
//       question.quiz_id = quiz_id;
//       if (!question.unique_id) {
//         question.unique_id = generateUniqueId();
//       }

//       if (question.question_date && typeof question.question_date === 'number') {
//         question.question_date = excelDateToFormattedDate(question.question_date);
//       } else if (!question.question_date) {
//         const today = new Date();
//         question.question_date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
//       }
//       return question;
//     });

//     const savedData = await insertQuestions(questionData); // Call the modified insertQuestions function

//     if (savedData && savedData.insertedCount > 0) {
//       fs.unlink(filePath, (err) => {
//         if (err) {
//           logger.error('Error deleting file:', err);
//           return res.status(500).json({ error: 'Failed to delete file after upload' });
//         }
//         logger.info('File uploaded and deleted successfully');
//       });
//       return res.status(200).json({ message: 'Success', quiz_id });
//     } else {
//       return res.status(500).json({ error: 'Failed to save data' });
//     }
//   } catch (err) {
//     logger.error('Error processing the Excel file:', err);
//     return res.status(500).json({ error: 'Error processing the Excel file' });
//   }
// };

const uploadQuestion = async (req, res) => {
  if (!req.file) {
    logger.error('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { quiz_name, quiz_description } = req.body;

  if (!quiz_name) {
    logger.error('Quiz name is required');
    return res.status(400).json({ error: 'Quiz name is required' });
  }

  const quiz_id = generateUniqueId();
  const filePath = req.file.path;

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    let questionData = XLSX.utils.sheet_to_json(worksheet);

    // Prepare quizData separately
    const quizData = {
      quiz_id: quiz_id,
      quiz_name: quiz_name,
      quiz_description: quiz_description || '',
      created_at: new Date(),
    };

    // Map only quiz_id and handle question_date
    questionData = questionData.map((question) => {
      question.quiz_id = quiz_id; // Assign only quiz_id

      if (!question.unique_id) {
        question.unique_id = generateUniqueId();
      }

      if (question.question_date && typeof question.question_date === 'number') {
        question.question_date = excelDateToFormattedDate(question.question_date);
      } else if (!question.question_date) {
        const today = new Date();
        question.question_date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      }
      return question;
    });

    const savedData = await insertQuestions(quizData, questionData); // Pass quizData and questionData separately

    if (savedData && savedData.insertedCount > 0) {
      fs.unlink(filePath, (err) => {
        if (err) {
          logger.error('Error deleting file:', err);
          return res.status(500).json({ error: 'Failed to delete file after upload' });
        }
        logger.info('File uploaded and deleted successfully');
      });
      return res.status(200).json({ message: 'Success', quiz_id });
    } else {
      return res.status(500).json({ error: 'Failed to save data' });
    }
  } catch (err) {
    logger.error('Error processing the Excel file:', err);
    return res.status(500).json({ error: 'Error processing the Excel file' });
  }
};


// Controller for fetching questions by category and date
const getQuestionsByDateAndCategory = async (req, res) => {
  const { categoryId, questionDate } = req.query; // Extract parameters from query

  if (!categoryId || !questionDate) {
    return res.status(400).json({ error: 'Category Id and Question Date are required' });
  }
  try {
    const questions = await findQuestionsByDateAndCategory(parseInt(categoryId), questionDate); // Ensure correct types
    if (questions.length > 0) {
      return res.status(200).json(questions);
    } else {
      return res.status(404).json({ message: 'No questions found for the specified category and date' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching quizzes' });
  }
};
// Controller for fetching all quizzes
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await findAllQuizzes(); // Call the new model function
    if (quizzes.length > 0) {
      return res.status(200).json(quizzes);
    } else {
      return res.status(404).json({ message: 'No quizzes found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching quizzes' });
  }
};
// Function to get questions by quiz ID with in-memory caching
const getQuestionsByQuizIdController = async (req, res) => {

  const { quiz_id } = req.params; // Extract quiz_id from URL parameters

  if (!quiz_id) {
      return res.status(400).json({ error: 'Quiz ID is required' });
  }

  // Convert quiz_id to a number
  const parsedQuizId = Number(quiz_id);
  if (isNaN(parsedQuizId)) {
      return res.status(400).json({ error: 'Quiz ID must be a valid number' });
  }

  // Check the cache first
  const cachedQuestions = getFromCache(`quiz_questions:${parsedQuizId}`);
  if (cachedQuestions) {
    console.log("getFromCache");
      // If found in cache, return the cached questions
      return res.status(200).json(cachedQuestions);
  }

  try {
      // If not found in cache, query the database
      const questions = await findQuestionsByQuizId(parsedQuizId);
      if (questions.length > 0) {
          // Cache the questions before responding (cache for 1 hour)
          console.log("setToCache");

          setToCache(`quiz_questions:${parsedQuizId}`, questions, 3600000); // Duration in milliseconds

          return res.status(200).json(questions);
      } else {
          return res.status(404).json({ message: 'No questions found for the specified quiz ID' });
      }
  } catch (error) {
      console.error('Error fetching questions by quiz_id:', error);
      return res.status(500).json({ error: 'Error fetching questions' });
  }
};

const searchQuestions = async (req, res) => {
  const { quiz_id, quiz_name } = req.query;

  if (!quiz_id && !quiz_name) {
    return res.status(400).json({ error: 'At least one of quiz_id or quiz_name must be provided' });
  }

  try {
    let questions = [];

    if (quiz_id && quiz_name) {
      // Both quiz_id and quiz_name provided
      const parsedQuizId = Number(quiz_id);
      if (isNaN(parsedQuizId)) {
        return res.status(400).json({ error: 'quiz_id must be a valid number' });
      }
      questions = await findQuestionsByQuizIdAndQuizName(parsedQuizId, quiz_name);
    } else if (quiz_id) {
      // Only quiz_id provided
      const parsedQuizId = Number(quiz_id);
      if (isNaN(parsedQuizId)) {
        return res.status(400).json({ error: 'quiz_id must be a valid number' });
      }
      questions = await findQuestionsByQuizId(parsedQuizId);
    } else if (quiz_name) {
      // Only quiz_name provided
      questions = await findQuestionsByQuizName(quiz_name);
    }

    if (questions.length > 0) {
      return res.status(200).json(questions);
    } else {
      return res.status(404).json({ message: 'No questions found for the specified criteria' });
    }
  } catch (error) {
    logger.error('Error searching questions:', error);
    return res.status(500).json({ error: 'Error searching questions' });
  }
};

const deleteQuiz = async (req, res) => {
  const { quiz_id } = req.params;

  if (!quiz_id) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }

  const parsedQuizId = Number(quiz_id);
  if (isNaN(parsedQuizId)) {
    return res.status(400).json({ error: 'Quiz ID must be a valid number' });
  }

  try {
    // Delete the quiz from the quizzes collection
    const quizResult = await deleteQuizById(parsedQuizId);

    if (quizResult.deletedCount === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Cascade delete: delete all questions associated with this quiz_id
    await deleteQuestionsByQuizId(parsedQuizId);
    return res.status(200).json({ message: 'Quiz and associated questions deleted successfully' });
  } catch (error) {
    logger.error('Error deleting quiz and associated questions:', error);
    return res.status(500).json({ error: 'Error deleting quiz and associated questions' });
  }
};

const updateQuiz = async (req, res) => {
  const { quiz_id } = req.params; // Extract quiz_id from URL parameters
  const { quiz_name, quiz_description } = req.body; // Get the fields to update

  if (!quiz_id) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }

  const parsedQuizId = Number(quiz_id);
  if (isNaN(parsedQuizId)) {
    return res.status(400).json({ error: 'Quiz ID must be a valid number' });
  }

  // Prepare the update object
  const updates = {};
  if (quiz_name) updates.quiz_name = quiz_name;
  if (quiz_description) updates.quiz_description = quiz_description;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'At least one of quiz_name or quiz_description must be provided' });
  }

  try {
    const result = await updateQuizById(parsedQuizId, updates); // Call the model update function

    if (result.modifiedCount > 0) {
      return res.status(200).json({ message: 'Quiz updated successfully' });
    } else {
      return res.status(404).json({ error: 'Quiz not found or no changes made' });
    }
  } catch (error) {
    logger.error('Error updating quiz:', error);
    return res.status(500).json({ error: 'Error updating quiz' });
  }
};


const updateQuestion = async (req, res) => {
  const { unique_id } = req.params;
  const updates = req.body; 

  if (!unique_id) {
    return res.status(400).json({ error: 'Unique ID is required' });
  }

  const parsedUniqueId = Number(unique_id);
  if (isNaN(parsedUniqueId)) {
    return res.status(400).json({ error: 'Unique ID must be a valid number' });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'At least one field must be provided to update' });
  }

  try {
    const result = await updateQuestionByUniqueId(parsedUniqueId, updates);

    // Fetch the quiz_id based on unique_id
    const question = await findQuizIdByUniqueId(parsedUniqueId); // Assuming this function exists
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const quizId = question.quiz_id; // Retrieve the quiz_id

    if (result.modifiedCount > 0) {
      deleteFromCache(`quiz_questions:${quizId}`);
      return res.status(200).json({ message: 'Question updated successfully' });
    } else {
      return res.status(404).json({ error: 'Question not found or no changes made' });
    }
  } catch (error) {
    logger.error('Error updating question:', error);
    return res.status(500).json({ error: 'Error updating question' });
  }
};
const deleteQuestion = async (req, res) => {
  const { unique_id } = req.params;

  if (!unique_id) {
    return res.status(400).json({ error: 'Unique ID is required' });
  }

  const parsedUniqueId = Number(unique_id);
  if (isNaN(parsedUniqueId)) {
    return res.status(400).json({ error: 'Unique ID must be a valid number' });
  }

  try {
    // Fetch the quiz_id based on unique_id
    const question = await findQuizIdByUniqueId(parsedUniqueId); // Assuming this function exists
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const quizId = question.quiz_id; // Retrieve the quiz_id

    // Delete the question from the database
    const result = await deleteQuestionByUniqueId(parsedUniqueId);
    if (result.deletedCount > 0) {
      // Clear the cache for the quiz_id
      deleteFromCache(`quiz_questions:${quizId}`);

      return res.status(200).json({ message: 'Question deleted successfully' });
    } else {
      return res.status(404).json({ error: 'Question not found' });
    }
  } catch (error) {
    logger.error('Error deleting question:', error);
    return res.status(500).json({ error: 'Error deleting question' });
  }
};
module.exports = {
  uploadQuestion,
  getQuestionsByDateAndCategory,
  getAllQuizzes, // Export the new controller function
  getQuestionsByQuizId: getQuestionsByQuizIdController, // Export the new controller function
  searchQuestions,
  deleteQuiz,
  updateQuiz,
  updateQuestion,
  deleteQuestion
};

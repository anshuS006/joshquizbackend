const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadQuestion,
  getQuestionsByDateAndCategory,
  getAllQuizzes,
  getQuestionsByQuizId,
  searchQuestions,
  deleteQuiz,
  updateQuiz,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/questionController');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath); // Ensure the folder exists
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Add timestamp to avoid conflicts
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /xlsx|xls/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    if (extName) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) files are allowed!'));
    }
  },
});

// Route for uploading question
router.post('/upload', upload.single('file'), uploadQuestion);

// Route to get questions by category and date
router.get('/findByDateAndCategory', getQuestionsByDateAndCategory);

// Route to get all quizzes
router.get('/quizzes', getAllQuizzes); // New route for getting all quizzes

// New route for fetching questions by quiz_id
router.get('/:quiz_id', getQuestionsByQuizId); // New route

// New route for searching questions by quiz_id or quiz_name
router.get('/search', searchQuestions);

router.delete('/quizzes/:quiz_id', deleteQuiz);
router.put('/quizzes/:quiz_id', updateQuiz);
router.put('/:unique_id', updateQuestion);
router.delete('/:unique_id', deleteQuestion);



module.exports = router;

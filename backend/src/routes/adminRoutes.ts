import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/exams', adminController.getAllExams);
router.get('/exams/:id', adminController.getExamById);
router.post('/exams', adminController.createExam);
router.put('/exams/:id', adminController.updateExam);
router.delete('/exams/:id', adminController.deleteExam);
router.post('/questions', adminController.addQuestions);
router.put('/questions', adminController.updateQuestions);
router.get('/results', adminController.getResults);
router.get('/students', adminController.getAllStudents);
router.post('/students', adminController.createStudent);
router.get('/analytics', adminController.getAnalytics);

export default router;

import { Router } from 'express';
import { studentController } from '../controllers/studentController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['student']));

router.get('/dashboard', studentController.getDashboard);
router.get('/exams/available', studentController.getAvailableExams);
router.get('/history', studentController.getExamHistory);
router.post('/attempt/start', studentController.startAttempt);
router.post('/attempt/save-answer', studentController.autoSaveAnswer);
router.post('/attempt/run-code', studentController.runCode);
router.post('/attempt/submit', studentController.submitAttempt);
router.get('/results/:examId', studentController.getAttemptResult);
router.get('/leaderboard/:examId', studentController.getLeaderboard);

export default router;

import { Router } from 'express';
import {
  autoReschedule,
  improveDescription,
  generateSummary,
  naturalLanguageQuery,
} from '../controllers/ai.controller.js';

const router = Router();

router.route('/auto-reschedule/:id').post(autoReschedule);
router.route('/improve-description/:id').get(improveDescription);
router.route('/generate-summary').get(generateSummary);
router.route('/natural-language-query').post(naturalLanguageQuery);

export default router;

import { Router } from 'express';
import {
  sendMessageHandler,
  listConversationsHandler,
  listMessagesHandler,
  deleteMessageHandler,
  streamConversationHandler,
  markConversationSeenHandler,
} from './controller.js';

const router: Router = Router();

router.post('/messages', ...sendMessageHandler);
router.get('/conversations', ...listConversationsHandler);
router.get('/conversations/:id/messages', ...listMessagesHandler);
router.get('/conversations/:id/stream', ...streamConversationHandler);
router.post('/conversations/:id/seen', ...markConversationSeenHandler);
router.delete('/messages/:id', ...deleteMessageHandler);

export default router;

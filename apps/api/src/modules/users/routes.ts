import { Router } from 'express';
import { getMe, updateMe, getUserById } from './controller.js';

const router: Router = Router();

// IMPORTANT: specific routes MUST come before parameterized routes
// /users/me must be registered before /users/:id or Express captures 'me' as the :id param

router.get('/users/me',  ...getMe);     // GET  /api/v1/users/me  (authenticated own profile)
router.put('/users/me',  ...updateMe);  // PUT  /api/v1/users/me  (update own profile)
router.get('/users/:id', ...getUserById); // GET /api/v1/users/:id (public profile by DB UUID)

export default router;

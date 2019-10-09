import { Router } from 'express';
import multer from 'multer';

// Configs
import multerConfig from './config/multer';

// Controllers
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
// import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';
import OrganizingController from './app/controllers/OrganizingController';
// Middlewares
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Routes POST without autentication
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware); // Middleware de autenticação

// From here all routes needs autentication

// Routes GET
routes.get('/meetups', MeetupController.index);
routes.get('/organizing', OrganizingController.index);
routes.get('/subscriptions', SubscriptionController.index);

// Routess PUT
routes.put('/users', UserController.update);
routes.put('/meetups/:id', MeetupController.update);

// Routes POST
routes.post('/meetups', upload.single('banner'), MeetupController.store);
routes.post('/meetups/:meetupId/subscriptions', SubscriptionController.store);

// Routes DELETE
routes.delete('/meetups/:id', MeetupController.delete);

export default routes;

import express from 'express';
import { errorHandler } from '../middlewares/errorHandler';
import user from '../routes/user';

const app = express();

app.use(express.json());
app.use('/user', user);

app.use(errorHandler);

export default app;

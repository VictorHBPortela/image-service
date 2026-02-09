import express from 'express';
import cors from 'cors';
import { errorHandler } from '../middlewares/errorHandler';
import user from '../routes/user';
import image from '../routes/image';

const app = express();

app.use(express.json());
app.use(cors());
app.use('/user', user);
app.use('/image', image);

app.use(errorHandler);

export default app;

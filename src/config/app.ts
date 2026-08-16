import express from 'express';
import cors from 'cors';
import { errorHandler } from '../middlewares/errorHandler';
import { limiter } from '../middlewares/rateLimit';
import user from '../routes/user';
import image from '../routes/image';
import transform from '../routes/transform';

const app = express();

app.use(express.json());
app.use(cors());
app.use(limiter);
app.use('/user', user);
app.use('/image', image);
app.use('/image', transform);

app.use(errorHandler);

export default app;

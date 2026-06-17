import express from 'express';
import cors from 'cors';

import { env } from './config/env';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'success', message: 'IntruSense API is running', data: null });
});

app.use('/api', routes);

app.use(errorMiddleware);

export default app;

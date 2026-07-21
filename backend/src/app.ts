import express from 'express';
import cors from 'cors';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import routes from './routes';

export const createApp = (): express.Application => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.use(loggerMiddleware);
  app.use(routes);
  app.use(errorMiddleware);

  return app;
};

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  dataDir: process.env.DATA_DIR || path.join(__dirname, '../../../'),
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://rijanregmi8_db_user:Nz71yfNWRZDJqmBE@qr.r1aggs9.mongodb.net/pppfootball?retryWrites=true&w=majority&appName=Qr',
};

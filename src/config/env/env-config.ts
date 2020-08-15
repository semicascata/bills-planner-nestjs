import * as dotenv from 'dotenv';
dotenv.config();

// env
const NODE_ENV: string = process.env.NODE_ENV || 'development';

// db
const MONGO_URI: string = process.env.MONGO_URI;

// jwt
const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_EXPIREINS: number = +process.env.JWT_EXPIRESIN;
const JWT_REFRESH: string = process.env.JWT_REFRESH;
const JWT_REFRESH_EXPIRESIN: number = +process.env.JWT_REFRESH_EXPIRESIN;

export {
  NODE_ENV,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIREINS,
  JWT_REFRESH,
  JWT_REFRESH_EXPIRESIN,
};

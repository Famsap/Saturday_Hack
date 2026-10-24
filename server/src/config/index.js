const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'hackathon_default_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  THRESHOLDS: {
    ATTENDANCE_WARN: parseFloat(process.env.ATTENDANCE_WARN || '75'),
    ATTENDANCE_CRITICAL: parseFloat(process.env.ATTENDANCE_CRITICAL || '65'),
    MARKS_LOW: parseFloat(process.env.MARKS_LOW || '40'),
  }
};


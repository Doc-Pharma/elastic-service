const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    keepAlive: true,
    statement_timeout: 60000, // optional, cancel long-running queries
  },
  pool: {
    max: 7,
    min: 1,
    acquire: 20000,
    idle: 10000,
    evict: 15000,
  },
  logging: false,
});

// Initialize models using absolute path
const initModels = require('../models/init-models');
const models = initModels(sequelize);

module.exports = {
  sequelize,
  models,
  ...models,
};

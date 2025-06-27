// app.js
const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./config/database');
const packageJson = require('../package.json');
const elasticRoute = require('./routes/elasticRoute');;
const { logger } = require('./utils/logging');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', elasticRoute);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'UP',
    version: packageJson.version,
    message: 'Server is running smoothly!',
    timestamp: new Date().toISOString(),
  });
});

// Start the server
sequelize
  .sync()
  .then(() => {
    logger.info('All models synchronized successfully.');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to sync database:', err);
  });

const axios = require('axios');
const { logger } = require('./logging');

const apiCaller = async (
  method,
  url,
  data = {},
  headers = {},
  params = {},
  timeout = 120000,
  isWebhook = false
) => {
  try {
    if (isWebhook) {
      // For webhooks, we don't wait for response
      axios({ method, url, data, headers, params, timeout }).catch((error) => {
        logger.error(`Error in Webhook Call to ${url}:`, error.message);
      });
      return { status: 'webhook_sent' };
    } else {
      // For regular API calls, wait for response
      const response = await axios({ method, url, data, headers, params, timeout });
      return response.data;
    }
  } catch (error) {
    logger.error(`Error in API Call to ${url}:`, error.message);
    throw error;
  }
};

module.exports = { apiCaller };

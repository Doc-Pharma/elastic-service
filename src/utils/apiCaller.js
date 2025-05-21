const axios = require('axios');
const { logger } = require('./logging');

const apiCaller = async (
  method,
  url,
  data = {},
  headers = {},
  params = {},
  timeout = 120000,
  is_webhook = false
) => {
  try {
    const config = {
      method,
      url,
      headers,
      params,
      timeout,
    };

    if (data) {
      config.data = data;
    }

    if (is_webhook) {
      axios(config)
        .then((response) => {
          logger.info(`Response from Webhook Call to ${url}:`, response.data);
        })
        .catch((error) => {
          logger.error(`Error in Webhook Call to ${url}:`, error.message);
        });
      return { status: 'webhook_sent' };
    } else {
      const response = await axios(config);
      return response.data;
    }
  } catch (error) {
    logger.error(`Error in API Call to ${url}:`, error?.response?.data || error);
    throw error;
  }
};

module.exports = { apiCaller };

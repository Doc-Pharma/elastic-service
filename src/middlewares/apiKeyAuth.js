const { getPartnerByApiKey } = require('../handler/partnerOrderHandler');
const { LRUCache } = require('../utils/LRUCache');
const { logger } = require('../utils/logging');
const { setUnauthorizedError, setBadRequestError } = require('../utils/responseStatus');

const API_KEY_CACHE = new LRUCache(10, 30 * 60 * 1000);

// middleware/webhookAuth.js
const setApiKeyRecordHeader = async (req, res, next) => {
  let api_key = '';
  if (req.headers['x-api-key']) {
    api_key = req.headers['x-api-key'];
  }
  if (req.query['api_key']) {
    api_key = req.query['api_key'];
  }
  if (api_key && api_key != '') {
    let partner_data;
    let get_cache_data = API_KEY_CACHE.get(api_key);
    if (get_cache_data) {
      partner_data = get_cache_data;
    } else {
      partner_data = await getPartnerByApiKey(api_key);
    }
    if (partner_data) {
      API_KEY_CACHE.set(api_key, partner_data);
      req.partner_data = partner_data;
      next(); // Pass control to the next middleware or route
    } else {
      logger.info(`Api Key not found for the partner: ${api_key}`);
      setBadRequestError(res, 'Api Key not found for the partner');
    }
  } else {
    logger.error(`Error in setApiKeyRecordHeader : API key is required`);
    return setUnauthorizedError(res, 'API key is required');
  }
};

module.exports = { setApiKeyRecordHeader };

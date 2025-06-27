const axios = require('axios');
const { apiCaller } = require('../utils/apiCaller');
const { logger } = require('../utils/logging');

//function to get invetory details from erp service
const createBulkOrderInElasticsearch = async (data) => {
  try {
    const BULK_ES_URL = `${process.env.ES_BASE_URL}/_bulk`;
    const response = await axios.post(BULK_ES_URL, data,
      {
        headers: { 'Content-Type': 'application/x-ndjson' },
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD
        }
      }
    );
    return response;
  } catch (error) {
    logger.error(
      `Error while creating bulk on elastic-search`,
      error?.response?.data
    );
    throw new Error(JSON.stringify(error?.response?.data));
  }
};

const getDocumentByIdInElasticSearch = async (payload) => {
  try {
    const response = await axios.get(`${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_doc/${payload.id}`, {
      auth: {
        username: process.env.ES_USERNAME,
        password: process.env.ES_PASSWORD
      }
    });
    return response;
  } catch (error) {
    logger.error(
      `Error while creating bulk on elastic-search`,
      error?.response?.data
    );
    throw new Error(JSON.stringify(error?.response?.data));
  }
};

const createSingleDocumentInElasticSearch = async (payload) => {
  try {

    const BULK_ES_URL = `${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_doc/${payload.id}`;
    const response = await apiCaller('POST', BULK_ES_URL, payload.data, {
      auth: {
        username: process.env.ES_USERNAME,
        password: process.env.ES_PASSWORD
      }
    });
    return response;
  } catch (error) {
    logger.error(
      `Error while creating bulk on elastic-search`,
      error?.response?.data
    );
    throw new Error(JSON.stringify(error?.response?.data));
  }
};

const updateSingleDocumentInElasticSearch = async () => {
  try {
    const BULK_ES_URL = `${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_update/${payload.id}`;
    const response = await apiCaller('POST', BULK_ES_URL, payload.data,
      {
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD
        }
      }
    );
    return response;
  } catch (error) {
    logger.error(
      `Error while creating bulk on elastic-search`,
      error?.response?.data
    );
    throw new Error(JSON.stringify(error?.response?.data));
  }
};

const deleteSingleDocumentInElasticSearch = async (payload) => {
  try {
    const response = await axios.delete(`${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_doc/${payload.id}`,
      {
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD
        }
      }
    );
    return response;
  } catch (error) {
    logger.error(
      `Error while creating bulk on elastic-search`,
      error?.response?.data
    );
    throw new Error(JSON.stringify(error?.response?.data));
  }
};

async function fuzzySearch(payload) {
  try {
    let elasticQuery = {
      "query": {
        "bool": {
          "should": [
            {
              "match": {
                "name": {
                  "query": payload.searchTerm,
                  "fuzziness": "AUTO"
                }
              }
            },
            {
              "match_phrase_prefix": {
                "name": payload.searchTerm
              }
            },
            {
              "wildcard": {
                "name": {
                  "value": `*${payload.searchTerm.toLowerCase()}*`  // This ensures that it can match "medi" anywhere in the name.
                }
              }
            }
          ],
          "minimum_should_match": 1,
          filter: []
        }
      }
    }
    if (payload.filter && payload.filter.is_filter_active) {
      if (payload.filter.brandName.length > 0) {
        elasticQuery.query.bool.filter.push({
          terms: {
            "brand.keyword": payload.filter.brandName
          }
        });
      }
    }

    console.log("elasticQuery", JSON.stringify(elasticQuery, null, 2))
    const response = await axios.post(
      `${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_search`,
      {
        ...elasticQuery,
        "size": 10
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD
        }
      }
    );

    logger.info('Search results:', JSON.stringify(response.data.hits.hits, null, 2));
    return response.data.hits.hits
  } catch (error) {
    logger.error('Search error:', error.response?.data || error.message);
  }
}


module.exports = {
  createBulkOrderInElasticsearch,
  createSingleDocumentInElasticSearch,
  updateSingleDocumentInElasticSearch,
  getDocumentByIdInElasticSearch,
  deleteSingleDocumentInElasticSearch,
  fuzzySearch
};

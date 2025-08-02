const axios = require('axios');
const { apiCaller } = require('../utils/apiCaller');
const { logger } = require('../utils/logging');
const { SKU_ABBREVIATIONS } = require('../constant/sku_abv');

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

async function advancedFuzzySearch(payload) {
  try {

    const words = payload.searchTerm.toLowerCase().split(" ");
    const shouldClauses = words.flatMap(word => {
      let modified_word;
      const mg_match = word.match(/^(\d+)(mg)$/i);
      const ml_match = word.match(/^(\d+)(ml)$/i);
      if (mg_match) {
        modified_word = `${mg_match[1]} ${mg_match[2]}`
      }
      if (ml_match) {
        modified_word = `${ml_match[1]} ${ml_match[2]}`
      }
      return [
        { match: { name: { query: modified_word ? modified_word : word, fuzziness: "AUTO" } } },
        { match: { pack_size: { query: modified_word ? modified_word : word, fuzziness: "AUTO" } } },
        { match: { strength: { query: word, fuzziness: "AUTO" } } },
        { match: { brand: { query: modified_word ? modified_word : word, fuzziness: "AUTO" } } },
        { wildcard: { name: { value: `*${word}*` } } }
      ]
    });
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
            ...shouldClauses,
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

async function advancedFuzzySearchV2(payload) {
  try {
    const words = payload.searchTerm.toLowerCase().split(" ");
    const shouldClauses = words.flatMap(word => {
      if (SKU_ABBREVIATIONS[word]) {
        word = SKU_ABBREVIATIONS[word]
      }
      word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      let modified_word;
      const match = word.match(/^(\d+)(ml|gm|mg|mcg|kg|l|s|`s|'s)$/i);
      if (match) {
        modified_word = `${match[1]} ${match[2]}`
      }
      return [
        { match: { name: { query: modified_word ? modified_word : word, fuzziness: "AUTO" } } },
        { match: { pack_size: { query: modified_word ? modified_word : word, fuzziness: "AUTO" } } },
        { match: { strength: { query: word, fuzziness: "AUTO" } } },
        { match: { brand: { query: modified_word ? modified_word : word, fuzziness: "AUTO" } } },
        { wildcard: { name: { value: `*${word}*` } } }
      ]
    });
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
            ...shouldClauses,
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
    return response.data.hits.hits

  } catch (error) {
    logger.error('Search error:', error.response?.data || error.message);
  }
}

async function advancedFuzzySearchV3(payload) {
  try {
    const words = payload.searchTerm.toLowerCase().split(" ");
    const shouldClauses = words.flatMap(word => {
      if (SKU_ABBREVIATIONS[word]) {
        word = SKU_ABBREVIATIONS[word]
      }
      word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      let modified_word;
      const match = word.match(/^(\d+)(ml|gm|mg|mcg|kg|l|s|`s|'s)$/i);
      if (match) {
        modified_word = `${match[1]} ${match[2]}`
      }
      return [
        { match: { name: { query: modified_word ? modified_word : word, fuzziness: "AUTO" } } },
        { match: { pack_size: { query: modified_word ? modified_word : word, fuzziness: "AUTO" } } },
        { match: { strength: { query: word, fuzziness: "AUTO" } } },
        { match: { brand: { query: modified_word ? modified_word : word, fuzziness: "AUTO" } } },
        { wildcard: { name: { value: `*${word}*` } } }
      ]
    });
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
            ...shouldClauses,
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
    if (response.data.hits.hits && response.data.hits.hits.length > 0) {
      console.log("payload.searchTerm", payload)
      const regex = /^(\d+)(ml|gm|s|`s|'s)$/i;
      const words = payload.searchTerm.toLowerCase().split(" ");
      let modified_word;

      for (let i = 0; i < words.length; ++i) {
        const match = words[i].match(regex);

        if (!!match) {
          const unit = match[2].toLowerCase();
          if (unit === 's' || unit === "`s" || unit === "'s") {
            modified_word = `${match[1]}`
          } else {
            modified_word = `${match[1]} ${unit}`;
          }
          break;
        }
      }

      if (!modified_word) {
        return []
      }
      let result = []
      let elastic_result = response.data.hits.hits
      for (let i = 0; i < elastic_result.length; ++i) {
        if (elastic_result[i] && elastic_result[i]["_source"]) {
          let source_data = elastic_result[i]["_source"]
          let transformed_pack_size = source_data.pack_size
            .replace(source_data.product_form, '')
            .trim()
            .toLowerCase();
          const input_pack_size = modified_word.split(/\s+/);
          const output_pack_size = transformed_pack_size.split(/\s+/);

          const isContained = input_pack_size.every(word => output_pack_size.includes(word));
          if (isContained) {
            result.push(elastic_result[i])
          }
        }
      }
      return result
    } else {
      return []
    }

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
  fuzzySearch,
  advancedFuzzySearch,
  advancedFuzzySearchV2,
  advancedFuzzySearchV3
};

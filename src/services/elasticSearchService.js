const axios = require("axios");
const { apiCaller } = require("../utils/apiCaller");
const { logger } = require("../utils/logging");
const { SKU_ABBREVIATIONS } = require("../constant/sku_abv");

//function to get invetory details from erp service
const createBulkOrderInElasticsearch = async (data) => {
  try {
    const BULK_ES_URL = `${process.env.ES_BASE_URL}/_bulk`;
    const response = await axios.post(BULK_ES_URL, data, {
      headers: { "Content-Type": "application/x-ndjson" },
      auth: {
        username: process.env.ES_USERNAME,
        password: process.env.ES_PASSWORD,
      },
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

const getDocumentByIdInElasticSearch = async (payload) => {
  try {
    const response = await axios.get(
      `${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_doc/${payload.id}`,
      {
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD,
        },
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

const createSingleDocumentInElasticSearch = async (payload) => {
  try {
    const BULK_ES_URL = `${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_doc/${payload.id}`;
    const response = await apiCaller("POST", BULK_ES_URL, payload.data, {
      auth: {
        username: process.env.ES_USERNAME,
        password: process.env.ES_PASSWORD,
      },
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
    const response = await apiCaller("POST", BULK_ES_URL, payload.data, {
      auth: {
        username: process.env.ES_USERNAME,
        password: process.env.ES_PASSWORD,
      },
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

const deleteSingleDocumentInElasticSearch = async (payload) => {
  try {
    const response = await axios.delete(
      `${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_doc/${payload.id}`,
      {
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD,
        },
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

/*
  Basic Search:
  Matches the fuzzy searchTerm, prefix and wilcard for the name
*/
async function fuzzySearch(payload) {
  try {
    let elasticQuery = {
      query: {
        bool: {
          should: [
            {
              match: {
                name: {
                  query: payload.searchTerm,
                  fuzziness: "AUTO",
                },
              },
            },
            {
              match_phrase_prefix: {
                name: payload.searchTerm,
              },
            },
            {
              wildcard: {
                name: {
                  value: `*${payload.searchTerm.toLowerCase()}*`, // This ensures that it can match "medi" anywhere in the name.
                },
              },
            },
          ],
          minimum_should_match: 1,
          filter: [],
        },
      },
    };
    if (payload.filter && payload.filter.is_filter_active) {
      if (payload.filter.brandName.length > 0) {
        elasticQuery.query.bool.filter.push({
          terms: {
            "brand.keyword": payload.filter.brandName,
          },
        });
      }
    }

    console.log("elasticQuery", JSON.stringify(elasticQuery, null, 2));
    const response = await axios.post(
      `${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_search`,
      {
        ...elasticQuery,
        size: 10,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD,
        },
      }
    );

    logger.info(
      "Search results:",
      JSON.stringify(response.data.hits.hits, null, 2)
    );
    return response.data.hits.hits;
  } catch (error) {
    logger.error("Search error:", error.response?.data || error.message);
  }
}

/*
  Advanced Search v1:
  Separates "mg" and "ml" from the search term (e.g., "5mg" → "5 mg"),
  Splits the search term into words and searches each word in name, strength, brand, and pack_size
  then performs a basic search using the cleaned term.
*/
async function advancedFuzzySearch(payload) {
  try {
    const words = payload.searchTerm.toLowerCase().split(" ");
    const shouldClauses = words.flatMap((word) => {
      let modified_word;
      const mg_match = word.match(/^(\d+)(mg)$/i);
      const ml_match = word.match(/^(\d+)(ml)$/i);
      if (mg_match) {
        modified_word = `${mg_match[1]} ${mg_match[2]}`;
      }
      if (ml_match) {
        modified_word = `${ml_match[1]} ${ml_match[2]}`;
      }
      return [
        {
          match: {
            name: {
              query: modified_word ? modified_word : word,
              fuzziness: "AUTO",
            },
          },
        },
        {
          match: {
            pack_size: {
              query: modified_word ? modified_word : word,
              fuzziness: "AUTO",
            },
          },
        },
        { match: { strength: { query: word, fuzziness: "AUTO" } } },
        { match: { brand: { query: word, fuzziness: "AUTO" } } },
        { wildcard: { name: { value: `*${word}*` } } },
      ];
    });
    let elasticQuery = {
      query: {
        bool: {
          should: [
            {
              match: {
                name: {
                  query: payload.searchTerm,
                  fuzziness: "AUTO",
                },
              },
            },
            ...shouldClauses,
          ],
          minimum_should_match: 1,
          filter: [],
        },
      },
    };
    if (payload.filter && payload.filter.is_filter_active) {
      if (payload.filter.brandName.length > 0) {
        elasticQuery.query.bool.filter.push({
          terms: {
            "brand.keyword": payload.filter.brandName,
          },
        });
      }
    }

    console.log("elasticQuery", JSON.stringify(elasticQuery, null, 2));
    const response = await axios.post(
      `${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_search`,
      {
        ...elasticQuery,
        size: 10,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD,
        },
      }
    );

    logger.info(
      "Search results:",
      JSON.stringify(response.data.hits.hits, null, 2)
    );
    return response.data.hits.hits;
  } catch (error) {
    logger.error("Search error:", error.response?.data || error.message);
  }
}

/*
Advanced Search v2:
Splits the search term into words and searches each word in name, strength, brand, and pack_size
Separates units like ml, gm, mg, mcg, kg, l, s, `'s`, and `s` from the search term 
(e.g., "1's" → "1 's"), then performs a basic search.
*/
async function advancedFuzzySearchV2(payload) {
  try {
    const words = payload.searchTerm.toLowerCase().split(" ");
    const shouldClauses = words.flatMap((word) => {
      if (SKU_ABBREVIATIONS[word]) {
        word = SKU_ABBREVIATIONS[word];
      }
      word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      let modified_word;
      const match = word.match(/^(\d+)(ml|gm|mg|mcg|kg|l|s|`s|'s)$/i);
      if (match) {
        modified_word = `${match[1]} ${match[2]}`;
      }
      return [
        {
          match: {
            name: {
              query: modified_word ? modified_word : word,
              fuzziness: "AUTO",
            },
          },
        },
        {
          match: {
            pack_size: {
              query: modified_word ? modified_word : word,
              fuzziness: "AUTO",
            },
          },
        },
        { match: { strength: { query: word, fuzziness: "AUTO" } } },
        { match: { brand: { query: word, fuzziness: "AUTO" } } },
        { wildcard: { name: { value: `*${word}*` } } },
      ];
    });
    let elasticQuery = {
      query: {
        bool: {
          should: [
            {
              match: {
                name: {
                  query: payload.searchTerm,
                  fuzziness: "AUTO",
                },
              },
            },
            ...shouldClauses,
          ],
          minimum_should_match: 1,
          filter: [],
        },
      },
    };
    if (payload.filter && payload.filter.is_filter_active) {
      if (payload.filter.brandName.length > 0) {
        elasticQuery.query.bool.filter.push({
          terms: {
            "brand.keyword": payload.filter.brandName,
          },
        });
      }
    }

    console.log("elasticQuery", JSON.stringify(elasticQuery, null, 2));
    const response = await axios.post(
      `${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_search`,
      {
        ...elasticQuery,
        size: 10,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD,
        },
      }
    );
    return response.data.hits.hits;
  } catch (error) {
    logger.error("Search error:", error.response?.data || error.message);
  }
}

/*
Advanced Search v3:
Separates units like ml, gm, mg, mcg, kg, l, s, `'s`, and `s` from the search term,
performs a basic search, and filters results to match the pack_size mentioned in the search term.
*/
async function advancedFuzzySearchV3(payload) {
  try {
    const words = payload.searchTerm.toLowerCase().split(" ");
    const shouldClauses = words.flatMap((word) => {
      if (SKU_ABBREVIATIONS[word]) {
        word = SKU_ABBREVIATIONS[word];
      }
      word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      let modified_word;
      const match = word.match(/^(\d+)(ml|gm|mg|mcg|kg|l|s|`s|'s)$/i);
      if (match) {
        modified_word = `${match[1]} ${match[2]}`;
      }
      return [
        {
          match: {
            name: {
              query: modified_word ? modified_word : word,
              fuzziness: "AUTO",
            },
          },
        },
        {
          match: {
            pack_size: {
              query: modified_word ? modified_word : word,
              fuzziness: "AUTO",
            },
          },
        },
        { match: { strength: { query: word, fuzziness: "AUTO" } } },
        { match: { brand: { query: word, fuzziness: "AUTO" } } },
        { wildcard: { name: { value: `*${word}*` } } },
      ];
    });
    let elasticQuery = {
      query: {
        bool: {
          should: [
            {
              match: {
                name: {
                  query: payload.searchTerm,
                  fuzziness: "AUTO",
                },
              },
            },
            ...shouldClauses,
          ],
          minimum_should_match: 1,
          filter: [],
        },
      },
    };
    if (payload.filter && payload.filter.is_filter_active) {
      if (payload.filter.brandName.length > 0) {
        elasticQuery.query.bool.filter.push({
          terms: {
            "brand.keyword": payload.filter.brandName,
          },
        });
      }
    }

    console.log("elasticQuery", JSON.stringify(elasticQuery, null, 2));
    const response = await axios.post(
      `${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_search`,
      {
        ...elasticQuery,
        size: 10,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD,
        },
      }
    );

    logger.info(
      "Search results:",
      JSON.stringify(response.data.hits.hits, null, 2)
    );
    if (response.data.hits.hits && response.data.hits.hits.length > 0) {
      console.log("payload.searchTerm", payload);
      const regex = /^(\d+)(ml|gm|s|`s|'s)$/i;
      const words = payload.searchTerm.toLowerCase().split(" ");
      let modified_word;

      for (let i = 0; i < words.length; ++i) {
        const match = words[i].match(regex);

        if (!!match) {
          const unit = match[2].toLowerCase();
          if (unit === "s" || unit === "`s" || unit === "'s") {
            modified_word = `${match[1]}`;
          } else {
            modified_word = `${match[1]} ${unit}`;
          }
          break;
        }
      }

      if (!modified_word) {
        return [];
      }
      let result = [];
      let elastic_result = response.data.hits.hits;
      for (let i = 0; i < elastic_result.length; ++i) {
        if (elastic_result[i] && elastic_result[i]["_source"]) {
          let source_data = elastic_result[i]["_source"];
          let transformed_pack_size = source_data.pack_size
            .replace(source_data.product_form, "")
            .trim()
            .toLowerCase();
          const input_pack_size = modified_word.split(/\s+/);
          const output_pack_size = transformed_pack_size.split(/\s+/);

          const isContained = input_pack_size.every((word) =>
            output_pack_size.includes(word)
          );
          if (isContained) {
            result.push(elastic_result[i]);
          }
        }
      }
      return result;
    } else {
      return [];
    }
  } catch (error) {
    logger.error("Search error:", error.response?.data || error.message);
  }
}

/*
Advanced Search v4:
Splits the search term into words and searches each word in name, strength, brand, and pack_size
Separates dosage forms and units like tablet, tablets, capsule, capsules, ml, gm, kg, piece, strip, strips
from the search term, performs a basic search, and filters results by matching pack_size.
*/
async function advancedFuzzySearchV4(payload) {
  try {
    const words = payload.searchTerm.toLowerCase().split(" ");
    const shouldClauses = words.flatMap((word) => {
      if (SKU_ABBREVIATIONS[word]) {
        word = SKU_ABBREVIATIONS[word];
      }
      word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      let modified_word;
      const match = word.match(/^(\d+)(ml|gm|mg|mcg|kg|l|s|`s|'s)$/i);
      if (match) {
        modified_word = `${match[1]} ${match[2]}`;
      }
      return [
        {
          match: {
            name: {
              query: modified_word ? modified_word : word,
              fuzziness: "AUTO",
            },
          },
        },
        {
          match: {
            pack_size: {
              query: modified_word ? modified_word : word,
              fuzziness: "AUTO",
            },
          },
        },
        { match: { strength: { query: word, fuzziness: "AUTO" } } },
        { match: { brand: { query: word, fuzziness: "AUTO" } } },
        { wildcard: { name: { value: `*${word}*` } } },
      ];
    });
    let elasticQuery = {
      query: {
        bool: {
          should: [
            {
              match: {
                name: {
                  query: payload.searchTerm,
                  fuzziness: "AUTO",
                },
              },
            },
            ...shouldClauses,
          ],
          minimum_should_match: 1,
          filter: [],
        },
      },
    };
    if (payload.filter && payload.filter.is_filter_active) {
      if (payload.filter.brandName.length > 0) {
        elasticQuery.query.bool.filter.push({
          terms: {
            "brand.keyword": payload.filter.brandName,
          },
        });
      }
    }

    console.log("elasticQuery", JSON.stringify(elasticQuery, null, 2));
    const response = await axios.post(
      `${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_search`,
      {
        ...elasticQuery,
        size: 10,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD,
        },
      }
    );

    logger.info(
      "Search results:",
      JSON.stringify(response.data.hits.hits, null, 2)
    );

    if (response.data.hits.hits && response.data.hits.hits.length > 0) {
      console.log("payload.searchTerm", payload);
      const extractPackSize = (text) => {
        const regex =
          /(\d+)\s*(tablet|tablets|capsule|capsules|ml|gm|kg|piece|strip|strips)/gi;
        const matches = [];
        let match;
        while ((match = regex.exec(text.toLowerCase())) !== null) {
          let quantity = match[1];
          let unit = match[2].toLowerCase();
          if (unit.endsWith("s")) {
            unit = unit.slice(0, -1);
          }
          matches.push(`${quantity} ${unit}`);
        }
        return matches;
      };

      const payloadPackSizes = extractPackSize(payload.filter.pack_size);
      if (payloadPackSizes.length === 0) {
        return [];
      }
      let result = [];
      let elastic_result = response.data.hits.hits;
      for (let i = 0; i < elastic_result.length; ++i) {
        if (elastic_result[i] && elastic_result[i]["_source"]) {
          let source_data = elastic_result[i]["_source"];
          const responsePackSizes = extractPackSize(source_data.pack_size);
          const isMatch = payloadPackSizes.some((pSize) => {
            return responsePackSizes.includes(pSize);
          });
          if (isMatch) {
            result.push(elastic_result[i]);
          }
        }
      }
      return result;
    } else {
      return [];
    }
  } catch (error) {
    logger.error("Search error:", error.response?.data || error.message);
  }
}

async function multiParamElasticSearch(payload) {
  try {
    const { name, manufacturer, pack_size } = payload.searchParams;

    let shouldClauses = [];

    // BOOST STRATEGY 1: Exact matches get highest boost
    if (name && name.trim()) {
      // High boost for exact name matches
      shouldClauses.push({
        match_phrase: {
          name: {
            query: name,
            boost: 5.0, // Highest boost for exact phrase
          },
        },
      });

      // Medium boost for fuzzy name matches
      shouldClauses.push({
        match: {
          name: {
            query: name,
            fuzziness: "AUTO",
            boost: 3.0, // High boost for fuzzy match
          },
        },
      });

      // Lower boost for word-level matching
      const nameWords = name.toLowerCase().split(" ");
      nameWords.forEach((word) => {
        if (SKU_ABBREVIATIONS[word]) {
          word = SKU_ABBREVIATIONS[word];
        }
        word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

        shouldClauses.push({
          match: {
            name: {
              query: word,
              fuzziness: "AUTO",
              boost: 1.5, // Lower boost for individual words
            },
          },
        });
      });
    }

    // BOOST STRATEGY 2: Manufacturer gets medium priority
    if (manufacturer && manufacturer.trim()) {
      // Exact manufacturer match
      shouldClauses.push({
        match_phrase: {
          manufacturer: {
            query: manufacturer,
            boost: 3.0,
          },
        },
      });

      // Fuzzy manufacturer match
      shouldClauses.push({
        match: {
          manufacturer: {
            query: manufacturer,
            fuzziness: "AUTO",
            boost: 2.0,
          },
        },
      });
    }

    // BOOST STRATEGY 3: Pack size gets contextual boost
    if (pack_size && pack_size.trim()) {
      // Exact pack size phrase
      shouldClauses.push({
        match_phrase: {
          pack_size: {
            query: pack_size,
            boost: 2.5,
          },
        },
      });

      // Fuzzy pack size match
      shouldClauses.push({
        match: {
          pack_size: {
            query: pack_size,
            fuzziness: "AUTO",
            boost: 1.8,
          },
        },
      });
    }

    // BOOST STRATEGY 4: Add cross-field matching (like your V4)
    const allTerms = [name, manufacturer, pack_size].filter(Boolean).join(" ");

    if (allTerms) {
      // Add strength and brand matching like V4
      const words = allTerms.toLowerCase().split(" ");
      words.forEach((word) => {
        if (SKU_ABBREVIATIONS[word]) {
          word = SKU_ABBREVIATIONS[word];
        }
        word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

        // Match V4's field coverage with appropriate boosts
        shouldClauses.push(
          {
            match: { strength: { query: word, fuzziness: "AUTO", boost: 1.5 } },
          },
          { match: { brand: { query: word, fuzziness: "AUTO", boost: 1.5 } } }
        );
      });
    }

    let elasticQuery = {
      query: {
        bool: {
          should: shouldClauses,
          minimum_should_match: 1,
        },
      },
    };

    console.log(
      "Enhanced multiParamElasticQuery",
      JSON.stringify(elasticQuery, null, 2)
    );

    const response = await axios.post(
      `${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_search`,
      {
        ...elasticQuery,
        size: 20,
      },
      {
        headers: { "Content-Type": "application/json" },
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD,
        },
      }
    );

    logger.info(
      "Multi-param search results:",
      JSON.stringify(response.data.hits.hits, null, 2)
    );

    if (response.data.hits.hits && response.data.hits.hits.length > 0) {
      let result = [];
      let elastic_result = response.data.hits.hits;

      // Apply pack size filtering if specified (similar to your V4 logic)
      if (pack_size && pack_size.trim()) {
        const extractPackSize = (text) => {
          const regex =
            /(\d+)\s*(tablet|tablets|capsule|capsules|ml|gm|kg|piece|strip|strips)/gi;
          const matches = [];
          let match;
          while ((match = regex.exec(text.toLowerCase())) !== null) {
            let quantity = match[1];
            let unit = match[2].toLowerCase();
            if (unit.endsWith("s")) {
              unit = unit.slice(0, -1);
            }
            matches.push(`${quantity} ${unit}`);
          }
          return matches;
        };

        const payloadPackSizes = extractPackSize(pack_size);

        for (let i = 0; i < elastic_result.length; ++i) {
          if (elastic_result[i] && elastic_result[i]["_source"]) {
            let source_data = elastic_result[i]["_source"];

            if (payloadPackSizes.length > 0) {
              const responsePackSizes = extractPackSize(source_data.pack_size);
              const isMatch = payloadPackSizes.some((pSize) => {
                return responsePackSizes.includes(pSize);
              });
              if (isMatch) {
                result.push({
                  ...source_data,
                  _id: elastic_result[i]._id,
                  _score: elastic_result[i]._score,
                });
              }
            } else {
              result.push({
                ...source_data,
                _id: elastic_result[i]._id,
                _score: elastic_result[i]._score,
              });
            }
          }
        }
      } else {
        for (let i = 0; i < elastic_result.length; ++i) {
          if (elastic_result[i] && elastic_result[i]["_source"]) {
            result.push({
              ...elastic_result[i]["_source"],
              _id: elastic_result[i]._id,
              _score: elastic_result[i]._score,
            });
          }
        }
      }

      return {
        products: result,
        total: result.length,
        took: response.data.took,
      };
    } else {
      return {
        products: [],
        total: 0,
        took: response.data.took || 0,
      };
    }
  } catch (error) {
    logger.error(
      "Multi-param search error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/*
Advanced Search v5:
Separates units and abbreviations like ml, gm, mg, mcg, kg, l, tab, cap from the search term,
performs a basic search, and returns results that match the specified pack_size.
*/
async function advancedFuzzySearchV5(payload) {
  try {
    const words = payload.searchTerm.toLowerCase().split(" ");
    const shouldClauses = words.flatMap((word) => {
      if (SKU_ABBREVIATIONS[word]) {
        word = SKU_ABBREVIATIONS[word];
      }
      word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      console.log(word)
      let modified_word;
      const match = word.match(/^(\d+)(ml|gm|mg|mcg|kg|l|tab|cap)$/i);
      if (match) {
        modified_word = `${match[1]} ${match[2]}`;
      }
      return [
        {
          match: {
            name: {
              query: modified_word ? modified_word : word,
              fuzziness: "AUTO",
            },
          },
        },
        {
          match: {
            pack_size: {
              query: modified_word ? modified_word : word,
              fuzziness: "AUTO",
            },
          },
        },
        { match: { strength: { query: word, fuzziness: "AUTO" } } },
        { match: { brand: { query: word, fuzziness: "AUTO" } } },
        { wildcard: { name: { value: `*${word}*` } } },
      ];
    });
    let elasticQuery = {
      query: {
        bool: {
          should: [
            {
              match: {
                name: {
                  query: payload.searchTerm,
                  fuzziness: "AUTO",
                },
              },
            },
            ...shouldClauses,
          ],
          minimum_should_match: 1,
          filter: [],
        },
      },
    };
    if (payload.filter && payload.filter.is_filter_active) {
      if (payload.filter.brandName.length > 0) {
        elasticQuery.query.bool.filter.push({
          terms: {
            "brand.keyword": payload.filter.brandName,
          },
        });
      }
    }

    console.log("elasticQuery", JSON.stringify(elasticQuery, null, 2));
    const response = await axios.post(
      `${process.env.ES_BASE_URL}/${process.env.ES_DB}-${payload.index}/_search`,
      {
        ...elasticQuery,
        size: 10,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD,
        },
      }
    );

    logger.info(
      "Search results:",
      JSON.stringify(response.data.hits.hits, null, 2)
    );
    if (response.data.hits.hits && response.data.hits.hits.length > 0) {
      const regex = /^(\d+)(ml|gm|s|tab|cap)$/i;
      const words = payload.searchTerm.toLowerCase().split(" ");
      let modified_word;

      for (let i = 0; i < words.length; ++i) {
        const match = words[i].match(regex);

        if (!!match) {
          const unit = match[2].toLowerCase();
          if (unit === "s" || unit === "`s" || unit === "cap" || unit === "tab") {
            modified_word = `${match[1]}`;
          } else {
            modified_word = `${match[1]} ${unit}`;
          }
          break;
        }
      }

      if (!modified_word) {
        return [];
      }
      let result = [];
      let elastic_result = response.data.hits.hits;
      for (let i = 0; i < elastic_result.length; ++i) {
        if (elastic_result[i] && elastic_result[i]["_source"]) {
          let source_data = elastic_result[i]["_source"];
          let transformed_pack_size = source_data.pack_size
            .replace(source_data.product_form, "")
            .trim()
            .toLowerCase();
          const input_pack_size = modified_word.split(/\s+/);
          const output_pack_size = transformed_pack_size.split(/\s+/);

          const isContained = input_pack_size.every((word) =>
            output_pack_size.includes(word)
          );
          if (isContained) {
            result.push(elastic_result[i]);
          }
        }
      }
      return result;
    } else {
      return [];
    }
  } catch (error) {
    logger.error("Search error:", error.response?.data || error.message);
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
  advancedFuzzySearchV3,
  advancedFuzzySearchV4,
  advancedFuzzySearchV5,
  multiParamElasticSearch,
};

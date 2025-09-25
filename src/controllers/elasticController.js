const { addBulkRecordForProductInElasticHandler, addSingleRecordOfProductInElasticHandler, getSingleRecordOfProductInElasticHandler, updateSingleRecordOfProductInElasticHandler, deleteSingleRecordOfProductInElasticHandler, searchInProductForData, advancedSearchInProductForData, multiParamProductSearch } = require('../handler/elasticHandler');
const { logger } = require('../utils/logging');
const { setBadRequestError, setInternalServerError, setSuccessStatus } = require('../utils/responseStatus');

const addBulkDocElasticController = async (req, res) => {
  try {
    await addBulkRecordForProductInElasticHandler();
    return setSuccessStatus(res,"Success")
  } catch (error) {
    logger.error(`Error in addBulkRecordForProductInElasticHandler : ${error.message || error}`);
    return setInternalServerError(res, error.message || error);
  }
};

const addSingleDocElasticController = async (req, res) => {
  try {
    let id = req.body.id
    if(!id){
      return setBadRequestError(res,{message:"Please provide id in the body"})
    }
    const response = await addSingleRecordOfProductInElasticHandler(id);
    return setSuccessStatus(res,{response})
  } catch (error) {
    logger.error(`Error in addSingleDocElasticController : ${error.message || error}`);
    return setInternalServerError(res, error.message || error);
  }
};

const getSingleDocElasticController = async (req, res) => {
  try {
    let id = req.body.id
    if(!id){
      return setBadRequestError(res,{message:"Please provide id in the body"})
    }
    const response = await getSingleRecordOfProductInElasticHandler(id);
    return setSuccessStatus(res,{response})
  } catch (error) {
    logger.error(`Error in getSingleDocElasticController : ${error.message || error}`);
    return setInternalServerError(res, error.message || error);
  }
};

const updateSingleDocElasticController = async (req, res) => {
  try {
    let id = req.body.id
    if(!id){
      return setBadRequestError(res,{message:"Please provide id in the body"})
    }
    const response = await updateSingleRecordOfProductInElasticHandler(id);
    return setSuccessStatus(res,{response})
  } catch (error) {
    logger.error(`Error in updateSingleDocElasticController : ${error.message || error}`);
    return setInternalServerError(res, error.message || error);
  }
};

const deleteSingleDocElasticController = async (req, res) => {
  try {
    let id = req.body.id
    if(!id){
      return setBadRequestError(res,{message:"Please provide id in the body"})
    }
    const response = await deleteSingleRecordOfProductInElasticHandler(id);
    return setSuccessStatus(res,{response})
  } catch (error) {
    logger.error(`Error in deleteSingleDocElasticController : ${error.message || error}`);
    return setInternalServerError(res, error.message || error);
  }
};

const searchElasticController = async (req, res) => {
  try {
    let searchTerm = req.query.searchTerm
    if(!searchTerm){
      searchTerm = ""
    }
    let filterData = req.body
    const response = await searchInProductForData(searchTerm,filterData);
    return setSuccessStatus(res,{response})
  } catch (error) {
    logger.error(`Error in searchElasticController : ${error.message || error}`);
    return setInternalServerError(res, error.message || error);
  }
};

const advancedSearchElasticController = async (req, res) => {
  try {
    let searchTerm = req.query.searchTerm
    if(!searchTerm){
      searchTerm = ""
    }
    let filterData = req.body
    const response = await searchInProductForData(searchTerm,filterData,true);
    return setSuccessStatus(res,{response})
  } catch (error) {
    logger.error(`Error in advancedSearchElasticController : ${error.message || error}`);
    return setInternalServerError(res, error.message || error);
  }
};

const advancedSearchV2ElasticController = async (req, res) => {
  try {
    let searchTerm = req.query.searchTerm
    if(!searchTerm){
      searchTerm = ""
    }
    let filterData = req.body
    const response = await advancedSearchInProductForData(searchTerm,filterData,"V2");
    return setSuccessStatus(res,{response})
  } catch (error) {
    logger.error(`Error in advancedSearchElasticController : ${error.message || error}`);
    return setInternalServerError(res, error.message || error);
  }
};

const advancedSearchV3ElasticController = async (req, res) => {
  try {
    let searchTerm = req.query.searchTerm
    if(!searchTerm){
      searchTerm = ""
    }
    let filterData = req.body
    const response = await advancedSearchInProductForData(searchTerm,filterData,"V3");
    return setSuccessStatus(res,{response})
  } catch (error) {
    logger.error(`Error in advancedSearchElasticController : ${error.message || error}`);
    return setInternalServerError(res, error.message || error);
  }
};

const advancedSearchV4ElasticController = async (req, res) => {
  try {
    let searchTerm = req.query.searchTerm
    if(!searchTerm){
      searchTerm = ""
    }
    let filterData = req.body
    const response = await advancedSearchInProductForData(searchTerm,filterData,"V4");
    return setSuccessStatus(res,{response})
  } catch (error) {
    logger.error(`Error in advancedSearchV4ElasticController : ${error.message || error}`);
    return setInternalServerError(res, error.message || error);
  }
};

const advancedSearchV5ElasticController = async (req, res) => {
  try {
    let searchTerm = req.query.searchTerm
    if(!searchTerm){
      searchTerm = ""
    }
    let filterData = req.body
    const response = await advancedSearchInProductForData(searchTerm,filterData,"V5");
    return setSuccessStatus(res,{response})
  } catch (error) {
    logger.error(`Error in advancedSearchV4ElasticController : ${error.message || error}`);
    return setInternalServerError(res, error.message || error);
  }
};

const multiParamProductSearchElasticController = async (req, res) => {
  try {
    const { name, manufacturer, pack_size } = req.body;
    const response = await multiParamProductSearch({ name, manufacturer, pack_size });
    console.log(response)
    return setSuccessStatus(res, { response });
  } catch (error) {
    logger.error(`Error in multiParamProductSearchElasticController : ${error.message || error}`);
    return setInternalServerError(res, error.message || error);
  }
};





module.exports = {
    searchElasticController,
    deleteSingleDocElasticController,
    updateSingleDocElasticController,
    getSingleDocElasticController,
    addSingleDocElasticController,
    addBulkDocElasticController,
    advancedSearchElasticController,
    advancedSearchV2ElasticController,
    advancedSearchV3ElasticController,
    advancedSearchV4ElasticController,
    advancedSearchV5ElasticController,
    multiParamProductSearchElasticController
};

const { addBulkRecordForProductInElasticHandler, addSingleRecordOfProductInElasticHandler, getSingleRecordOfProductInElasticHandler, updateSingleRecordOfProductInElasticHandler, deleteSingleRecordOfProductInElasticHandler, searchInProductForData } = require('../handler/elasticHandler');
const { logger } = require('../utils/logging');
const { setBadRequestError, setInternalServerError, setSuccessStatus } = require('../utils/responseStatus');

const addBulkDocElasticController = async (req, res) => {
  try {
    const response = await addBulkRecordForProductInElasticHandler();
    return setSuccessStatus(res,{response})
  } catch (error) {
    logger.error(`Error in etaController : ${error.message || error}`);
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
    logger.error(`Error in etaController : ${error.message || error}`);
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
    logger.error(`Error in etaController : ${error.message || error}`);
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
    logger.error(`Error in etaController : ${error.message || error}`);
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
    logger.error(`Error in etaController : ${error.message || error}`);
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
    logger.error(`Error in etaController : ${error.message || error}`);
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
    logger.error(`Error in etaController : ${error.message || error}`);
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
    advancedSearchElasticController
};

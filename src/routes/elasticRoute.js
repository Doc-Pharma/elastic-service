const { addBulkDocElasticController, addSingleDocElasticController, getSingleDocElasticController, updateSingleDocElasticController, deleteSingleDocElasticController, searchElasticController, advancedSearchElasticController, advancedSearchV2ElasticController, advancedSearchV3ElasticController, advancedSearchV4ElasticController, multiParamProductSearchElasticController, advancedSearchV5ElasticController } = require('../controllers/elasticController');

const router = require('express').Router();

router.post('/elastic/add-bulk', addBulkDocElasticController);
router.post('/elastic/add', addSingleDocElasticController);
router.get('/elastic/get', getSingleDocElasticController);
router.post('/elastic/update', updateSingleDocElasticController);
router.post('/elastic/delete', deleteSingleDocElasticController);
router.post('/elastic/search', searchElasticController);
router.post('/elastic/advanced-search', advancedSearchElasticController);
router.post('/elastic/advanced-search-v2', advancedSearchV2ElasticController);
router.post('/elastic/advanced-search-v3', advancedSearchV3ElasticController);
router.post('/elastic/advanced-search-v4', advancedSearchV4ElasticController);
router.post('/elastic/advanced-search-v5', advancedSearchV5ElasticController);
router.post('/elastic/multi-param-product-search', multiParamProductSearchElasticController);


module.exports = router;

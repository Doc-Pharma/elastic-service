const { addBulkDocElasticController, addSingleDocElasticController, getSingleDocElasticController, updateSingleDocElasticController, deleteSingleDocElasticController, searchElasticController } = require('../controllers/elasticController');

const router = require('express').Router();

router.post('/elastic/add-bulk', addBulkDocElasticController);
router.post('/elastic/add', addSingleDocElasticController);
router.get('/elastic/get', getSingleDocElasticController);
router.post('/elastic/update', updateSingleDocElasticController);
router.post('/elastic/delete', deleteSingleDocElasticController);
router.post('/elastic/search', searchElasticController);

module.exports = router;

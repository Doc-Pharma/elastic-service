const productHelper = require("../helper/productHelper");
const { createBulkOrderInElasticsearch, createSingleDocumentInElasticSearch, updateSingleDocumentInElasticSearch, getDocumentByIdInElasticSearch, deleteSingleDocumentInElasticSearch, fuzzySearch, advancedFuzzySearch, advancedFuzzySearchV2, advancedFuzzySearchV3 } = require("../services/elasticSearchService");

const PRODUCT_TRANFORMATION_KEYS = ["drug_name","name","strength","pack_size","manufacturer","diseases","dp_id","sku_pack_form","sub_category","brand","product_form","transformed_pack_size","global_price","tax_definition","sub_category"]

const addBulkRecordForProductInElasticHandler = async () => {
  try {let model = {}
  model.data_length = 1
  while(model.data_length){
    console.log("model.data_length",model.data_length)
    let inputData = {
      sortBy : [["id", "ASC"]],
      page_size : 100,
      page : model.data_length,
  }
    model.products = await productHelper.findAll(inputData)
    if(model.products.length === 0){
      model.data_length = 0
    } else{
      const bulkBody = model.products.map(product => {
        let product_data = {}
        PRODUCT_TRANFORMATION_KEYS.map((key) => {
          if(key === "transformed_pack_size"){
            product_data[key] = `${product.pack_size.replace(product.product_form, '').trim()}`  
          }else{
            product_data[key] = product[key]
          }
        })
        return [
          JSON.stringify({ index: { _index: `${process.env.ES_DB}-product`, _id: product.id } }),
          JSON.stringify({
            ...product_data
          })
        ];
      }).flat().join('\n') + '\n';
    model.result = await createBulkOrderInElasticsearch(bulkBody)
    model.data_length = model.data_length + 1
    }
  }
  
  return model.result
}catch (err){
  console.log(err)
}
};

const addSingleRecordOfProductInElasticHandler = async (id) => {
  let model = {}
  let inputData = {
    query : { id : id}
}
  model.product = await productHelper.findOne(inputData)
  let product_data = {}
        PRODUCT_TRANFORMATION_KEYS.map((key) => {
          product_data[key] = model.product[key]
        })
  let elasticData = {
    index : "product",
    id : id,
    data : product_data
  }
  model.response = await createSingleDocumentInElasticSearch(elasticData)
  
  return model.response
};

const updateSingleRecordOfProductInElasticHandler = async (id) => {
  let model = {}
  let inputData = {
    query : { id : id}
}
  model.product = await productHelper.findOne(inputData)
  let product_data = {}
        PRODUCT_TRANFORMATION_KEYS.map((key) => {
          product_data[key] = model.product[key]
        })
  let elasticData = {
    index : "product",
    id : id,
    data : {doc : {...product_data}}
  }
  model.response = await updateSingleDocumentInElasticSearch(elasticData)
  
  return model.response
};

const getSingleRecordOfProductInElasticHandler = async (id) => {
  let model = {}
  let elasticData = {
    index : "product",
    id : id,
  }
  model.response = await getDocumentByIdInElasticSearch(elasticData)
  return model.response
};

const deleteSingleRecordOfProductInElasticHandler = async (id) => {
  let model = {}
  let inputData = {
    query : { id : id}
}
  model.product = await productHelper.findOne(inputData)
  if(model.product){
    throw new Error(`Please delete this id : ${id} from SQL`)
  }
  let elasticData = {
    index : "product",
    id : id,
  }
  model.response = await deleteSingleDocumentInElasticSearch(elasticData)
  
  return model.response
};

const searchInProductForData = async(searchTerm,filterData,isAdvancedSearch = false) => {
  let model = {}
  let elasticData = {
    index : "product",
    searchTerm : searchTerm,
    filter : filterData
  }
  if(isAdvancedSearch){
    model.response = await advancedFuzzySearch(elasticData)
  }
  else{
    model.response = await fuzzySearch(elasticData)
  }
  
  if(model.response && model.response.length > 0){
    model.response.forEach((item) => {
    delete item._index;
    });
  }
  
  return model.response
}

const advancedSearchInProductForData = async(searchTerm,filterData,whichSearch = "V2") => {
  let model = {}
  let elasticData = {
    index : "product",
    searchTerm : searchTerm,
    filter : filterData
  }
  if(whichSearch === "V2"){
    model.response = await advancedFuzzySearchV2(elasticData)
  }
  else if(whichSearch === "V3"){
    model.response = await advancedFuzzySearchV3(elasticData)
  }
  
  
  return model.response
}

module.exports = {
  addBulkRecordForProductInElasticHandler,
  addSingleRecordOfProductInElasticHandler,
  updateSingleRecordOfProductInElasticHandler,
  getSingleRecordOfProductInElasticHandler,
  deleteSingleRecordOfProductInElasticHandler,
  searchInProductForData,
  advancedSearchInProductForData
};

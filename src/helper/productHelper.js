// orderHelper.js
const BaseHelper = require('./baseHelper');
const { products } = require('../config/database');

class ProductHelper extends BaseHelper {
  constructor() {
    super(products);
  }

  // Function specific to this helper can be specified here
}
const productHelper = new ProductHelper();
module.exports = productHelper;

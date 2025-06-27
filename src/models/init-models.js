const { Sequelize, DataTypes } = require('sequelize');

var _partner = require('./partner');
var _products = require('./products');


function initModels(sequelize) {
  if (!sequelize || !(sequelize instanceof Sequelize)) {
    throw new Error('Sequelize instance is undefined or invalid. Check your database connection.');
  }
 
  var partner = _partner(sequelize, DataTypes);
  var products = _products(sequelize, DataTypes);
  


  return {
    partner,
    products
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;

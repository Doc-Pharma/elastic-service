const { DataTypes } = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'products',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sku_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sku_pack_form: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dp_sku_pack_form: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sub_category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dp_sub_category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      product_form: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dp_product_form: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      drug_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      strength: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      schedule: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      discounted_price: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
      },
      pack_size: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      global_price: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
      },
      tax_definition: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      manufacturer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dp_manufacturer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      manufacturer_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      marketer_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rx_validity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      therapeutic_class: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      uses: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      diseases: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      images: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      restricted_states: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      saleable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      storage_temperature: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      dp_co: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      dp_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      presigned_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'products',
      timestamps: false, // or true if you have createdAt/updatedAt columns
    }
  );
};

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'partner',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      phone_number: DataTypes.STRING,
      partner_type: DataTypes.STRING,
      is_shopify_store: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      is_logistic_service_allowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      partner_code: {
        type: DataTypes.STRING,
        unique: true,
      },
      service_type: {
        type: DataTypes.ENUM('HL', 'BATCH', 'SDD_NDD', 'COURIER'),
        allowNull: true,
      },
      is_split_allowed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_inventory_check_required: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_pharmacy_mapping_required: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_discount_partner_configurable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_shipping_charges_partner_configurable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: 'partner',
      schema: 'public',
      timestamps: false,
      indexes: [
        {
          name: 'ix_partner_email',
          unique: true,
          fields: [{ name: 'email' }],
        },
        {
          name: 'ix_partner_id',
          fields: [{ name: 'id' }],
        },
        {
          name: 'ix_partner_name',
          fields: [{ name: 'name' }],
        },
        {
          name: 'partner_pkey',
          unique: true,
          fields: [{ name: 'id' }],
        },
      ],
    }
  );
};

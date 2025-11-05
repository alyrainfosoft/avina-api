
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('birthstone_products', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      name: {
  allowNull: false,
  type: 'character varying(200)',
},
      sku: {
  allowNull: false,
  type: 'character varying(200)',
},
      sort_description: {
  allowNull: true,
  type: 'character varying(400)',
},
      long_description: {
  allowNull: true,
  type: 'character varying(2000)',
},
     is_active: {
  default:'1',
  type: 'bit(1)',
},
      is_deleted: {
  default:'0',
  type: 'bit(1)',
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      tag: {
  allowNull: true,
  type: 'character varying(200)',
},
      size: {
  allowNull: true,
  type: 'character varying(200)',
},
      length: {
  allowNull: true,
  type: 'character varying(200)',
},
      making_charge: {
  allowNull: true,
  type: 'numeric',
},
      finding_charge: {
  allowNull: true,
  type: 'numeric',
},
      other_charge: {
  allowNull: true,
  type: 'numeric',
},
      is_featured: {
  allowNull: false,
  type: 'bit(1)',
},
      is_trending: {
  allowNull: false,
  type: 'bit(1)',
},
      slug: {
  allowNull: false,
  type: 'character varying',
},
      gender: {
  allowNull: true,
  type: 'character varying',
},
      product_number: {
  allowNull: true,
  type: 'character varying',
},
      engraving_count: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      gemstone_count: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      product_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      style_no: {
  allowNull: true,
  type: 'character varying',
},
      discount_type: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      discount_value: {
  allowNull: true,
  type: 'character varying',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('birthstone_products');
  }
};

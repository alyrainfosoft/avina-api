
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
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
      setting_style_type: {
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
  type:'bit(1)',
},
      is_trending: {
  allowNull: false,
  type:'bit(1)',
},
      slug: {
  allowNull: false,
  type: 'character varying',
},
      gender: {
  allowNull: true,
  type: 'character varying',
},
      product_type: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      retail_price: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      compare_price: {
  allowNull: true,
  type: Sequelize.DOUBLE,
},
      discount_type: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      discount_value: {
  allowNull: true,
  type: 'character varying',
},
      quantity: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      id_brand: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_collection: {
  allowNull: true,
  type: 'character varying',
},
      is_quantity_track: {
  allowNull: false,
  default:false,
  type: Sequelize.BOOLEAN,
},
      is_choose_setting: {
  allowNull: false,
  type: 'bit(1)',
},
      is_single: {
  allowNull: false,
  type: 'bit(1)',
},
      setting_diamond_shapes: {
  allowNull: true,
  type: 'character varying',
},
      additional_detail: {
  allowNull: true,
  type: 'character varying',
},
      certificate: {
  allowNull: true,
  type: 'character varying',
},
      shipping_day: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_customization: {
  default:'0',
  type: 'bit(1)',
},
      parent_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
meta_title: {
  allowNull: true,
  type:Sequelize.STRING
},
meta_tag: {
  allowNull: true,
  type:Sequelize.STRING
},
meta_description: {
  allowNull: true,
  type:Sequelize.STRING
},
setting_diamond_sizes: {
  allowNull: true,
  type:Sequelize.STRING
},
setting_diamond_sizes: {
  allowNull: true,
  type:Sequelize.STRING
},
is_band: {
  allowNull: true,
 type:'bit(1)',
},
is_3d_product: {
  type:Sequelize.BOOLEAN,
  default:false
}
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('products');
  }
};

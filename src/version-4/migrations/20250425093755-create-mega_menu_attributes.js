
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
// Create an ENUM type
await queryInterface.sequelize.query(`
 CREATE TYPE public.mega_menu_type AS ENUM
    ('url', 'setting_type', 'category', 'brand', 'collection', 'diamond_shape', 'metal', 'metal_tone', 'gender', 'page', 'static_page', 'text');
  `);

  // Create an ENUM type
  await queryInterface.sequelize.query(`
    CREATE TYPE public.mega_menu_target_type AS ENUM
    ('same_tab', 'new_tab');  `);

    await queryInterface.createTable('mega_menu_attributes', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      title: {
  allowNull: false,
  type: 'character varying',
},
      id_parent: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      menu_type: {
  allowNull: false,
  type:'mega_menu_type',
},
      target_type: {
  allowNull: true,
  type: 'mega_menu_target_type',
},
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_category: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_collection: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      url: {
  allowNull: true,
  type: 'character varying',
},
      id_brand: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_setting_type: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_diamond_shape: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_gender: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_metal_tone: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_metal: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_page: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_active: {
  allowNull: true,
  type: 'bit(1)'
},
      is_deleted: {
  allowNull: true,
  type: 'bit(1)'
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
      sort_order: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_menu: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_static_page: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('mega_menu_attributes');

    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE mega_menu_type;
    `);

    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE mega_menu_target_type;
    `);
  }
};

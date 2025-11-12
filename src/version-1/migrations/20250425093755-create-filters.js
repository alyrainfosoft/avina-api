
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
     // Create an ENUM type
     await queryInterface.sequelize.query(`
CREATE TYPE public.filter_select_type AS ENUM
    ('single', 'multiple', 'range');    `);

      // Create an ENUM type
      await queryInterface.sequelize.query(`
        CREATE TYPE public.filter_item_scope AS ENUM
    ('product', 'diamond', 'both', 'none');    `);
        
    await queryInterface.createTable('filters', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      name: {
  allowNull: true,
  type: 'character varying',
},
      key: {
  allowNull: false,
  type: 'character varying',
},
      filter_select_type: {
  allowNull: true,
  type: 'filter_select_type',
},
      selected_value: {
  allowNull: true,
  type: 'character varying',
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
     is_active: {
  default:'1',
  type: 'bit(1)',
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      company_info_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      item_scope: {
  allowNull: true,
  default:'product',
  type: 'filter_item_scope',
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('filters');
      // Drop the ENUM type
      await queryInterface.sequelize.query(`
        DROP TYPE filter_select_type;
      `);

        // Drop the ENUM type
        await queryInterface.sequelize.query(`
          DROP TYPE filter_item_scope;
        `);
  }
};

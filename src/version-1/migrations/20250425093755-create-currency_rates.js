
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
      // Create an ENUM type
      await queryInterface.sequelize.query(`
CREATE TYPE public.currency_symbol_placement AS ENUM
    ('left', 'right');      `);
    // Create an ENUM type
    await queryInterface.sequelize.query(`
      CREATE TYPE public.currency_rate_find_type AS ENUM
    ('manually', 'free-api');   `);
        
    await queryInterface.createTable('currency_rates', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      currency: {
  allowNull: false,
  type: 'character varying(191)',
},
      rate: {
  allowNull: false,
  type: 'numeric',
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
     is_active: {
      allowNull: false,
      type: 'bit(1)',
},
      is_deleted: {
        allowNull: false,
        type: 'bit(1)',
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      is_default: {
  allowNull: false,
  type: 'bit(1)',
},
      symbol_placement: {
  allowNull: true,
  type: 'currency_symbol_placement',
},
      symbol: {
  allowNull: true,
  type: 'character varying',
},
      code: {
  allowNull: true,
  type: 'character varying',
},
      decimal_token: {
  allowNull: false,
  type: 'character varying',
},
      thousand_token: {
  allowNull: false,
  type: 'character varying',
},
      is_use_api: {
  allowNull: false,
  type: 'bit(1)',
},
      exchange_rate_type: {
  allowNull: false,
  default:'manually',
  type: 'currency_rate_find_type',
},
      api_url: {
  allowNull: true,
  type: 'character varying',
},
      api_key: {
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
    await queryInterface.dropTable('currency_rates');
     // Drop the ENUM type
     await queryInterface.sequelize.query(`
      DROP TYPE currency_symbol_placement;
    `);
     // Drop the ENUM type
     await queryInterface.sequelize.query(`
      DROP TYPE currency_rate_find_type;
    `);
  }
};

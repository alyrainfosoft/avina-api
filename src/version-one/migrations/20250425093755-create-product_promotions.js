
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_promotions', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      title: {
  allowNull: false,
  type: 'character varying(30)',
},
      subtitle: {
  allowNull: false,
  type: 'character varying(100)',
},
      target_url: {
  allowNull: false,
  type: 'character varying(2048)',
},
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      active_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      expiry_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
     is_active: {
  default:'0',
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
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('product_promotions');
  }
};

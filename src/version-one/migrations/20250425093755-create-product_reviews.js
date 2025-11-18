
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_reviews', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      reviewer_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      product_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
      rating: {
  allowNull: false,
  type: Sequelize.DOUBLE,
},
      reviewer_name: {
  allowNull: false,
  type: 'character varying',
},
      comment: {
  allowNull: false,
  type: 'character varying',
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      is_approved: {
  allowNull: true,
  type: 'bit(1)',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('product_reviews');
  }
};

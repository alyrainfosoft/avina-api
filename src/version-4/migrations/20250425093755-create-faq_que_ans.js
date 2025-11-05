
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('faq_que_ans', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.BIGINT,
},
      id_parent: {
  allowNull: true,
  type: Sequelize.BIGINT,
},
      category_name: {
  allowNull: true,
  type: 'character varying',
},
      question: {
  allowNull: true,
  type: 'character varying',
},
      answer: {
  allowNull: true,
  type: 'character varying',
},
     is_active: {
      allowNull: false,
      type: 'bit(1)',
},
      is_deleted: {
        allowNull: false,
        type: 'bit(1)',
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      slug: {
  allowNull: true,
  type: 'character varying',
},
      sort_order: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('faq_que_ans');
  }
};

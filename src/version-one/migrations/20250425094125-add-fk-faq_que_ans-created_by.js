
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('faq_que_ans', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_faq_que_ans_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('faq_que_ans', 'fk_faq_que_ans_created_by');
  }
};

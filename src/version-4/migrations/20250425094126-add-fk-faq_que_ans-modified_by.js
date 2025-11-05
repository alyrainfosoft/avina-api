
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('faq_que_ans', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_faq_que_ans_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('faq_que_ans', 'fk_faq_que_ans_modified_by');
  }
};

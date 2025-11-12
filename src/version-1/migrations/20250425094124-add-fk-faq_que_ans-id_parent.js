
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('faq_que_ans', {
      fields: ['id_parent'],
      type: 'foreign key',
      name: 'fk_faq_que_ans_id_parent',
      references: {
        table: 'faq_que_ans',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('faq_que_ans', 'fk_faq_que_ans_id_parent');
  }
};

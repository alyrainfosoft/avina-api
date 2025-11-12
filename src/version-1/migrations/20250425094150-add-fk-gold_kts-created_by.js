
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('gold_kts', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_gold_kts_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('gold_kts', 'fk_gold_kts_created_by');
  }
};

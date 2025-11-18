
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('stock_change_logs', {
      fields: ['changed_by'],
      type: 'foreign key',
      name: 'fk_stock_change_logs_changed_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('stock_change_logs', 'fk_stock_change_logs_changed_by');
  }
};

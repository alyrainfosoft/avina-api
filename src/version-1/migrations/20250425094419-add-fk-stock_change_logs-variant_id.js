
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('stock_change_logs', {
      fields: ['variant_id'],
      type: 'foreign key',
      name: 'fk_stock_change_logs_variant_id',
      references: {
        table: 'product_metal_options',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('stock_change_logs', 'fk_stock_change_logs_variant_id');
  }
};

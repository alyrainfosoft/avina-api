
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_price_histories', {
      fields: ['changed_by'],
      type: 'foreign key',
      name: 'fk_product_price_histories_changed_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_price_histories', 'fk_product_price_histories_changed_by');
  }
};


'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('order_details', {
      fields: ['order_id'],
      type: 'foreign key',
      name: 'fk_order_details_order_id',
      references: {
        table: 'orders',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('order_details', 'fk_order_details_order_id');
  }
};

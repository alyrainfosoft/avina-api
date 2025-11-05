
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_order_details', {
      fields: ['order_id'],
      type: 'foreign key',
      name: 'fk_config_order_details_order_id',
      references: {
        table: 'orders',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_order_details', 'fk_config_order_details_order_id');
  }
};

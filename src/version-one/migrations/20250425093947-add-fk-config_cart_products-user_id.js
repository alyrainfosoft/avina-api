
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_cart_products', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_config_cart_products_user_id',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_cart_products', 'fk_config_cart_products_user_id');
  }
};

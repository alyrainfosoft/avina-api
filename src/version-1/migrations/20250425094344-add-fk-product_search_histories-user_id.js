
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_search_histories', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_product_search_histories_user_id',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_search_histories', 'fk_product_search_histories_user_id');
  }
};

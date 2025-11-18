
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('birthstone_product_diamond_options', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_birthstone_product_diamond_options_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('birthstone_product_diamond_options', 'fk_birthstone_product_diamond_options_modified_by');
  }
};

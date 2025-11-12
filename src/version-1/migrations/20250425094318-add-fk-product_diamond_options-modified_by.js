
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_diamond_options', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_product_diamond_options_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_diamond_options', 'fk_product_diamond_options_modified_by');
  }
};

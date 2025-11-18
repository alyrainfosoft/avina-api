
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('birthstone_product_metal_options', {
      fields: ['id_metal_group'],
      type: 'foreign key',
      name: 'fk_birthstone_product_metal_options_id_metal_group',
      references: {
        table: 'metal_group_masters',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('birthstone_product_metal_options', 'fk_birthstone_product_metal_options_id_metal_group');
  }
};

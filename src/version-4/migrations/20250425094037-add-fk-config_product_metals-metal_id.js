
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_product_metals', {
      fields: ['metal_id'],
      type: 'foreign key',
      name: 'fk_config_product_metals_metal_id',
      references: {
        table: 'metal_masters',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_product_metals', 'fk_config_product_metals_metal_id');
  }
};

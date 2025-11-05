
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_bracelet_product_metals', {
      fields: ['id_metal'],
      type: 'foreign key',
      name: 'fk_config_bracelet_product_metals_id_metal',
      references: {
        table: 'metal_masters',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_bracelet_product_metals', 'fk_config_bracelet_product_metals_id_metal');
  }
};

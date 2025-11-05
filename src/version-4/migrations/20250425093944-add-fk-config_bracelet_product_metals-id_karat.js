
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_bracelet_product_metals', {
      fields: ['id_karat'],
      type: 'foreign key',
      name: 'fk_config_bracelet_product_metals_id_karat',
      references: {
        table: 'gold_kts',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_bracelet_product_metals', 'fk_config_bracelet_product_metals_id_karat');
  }
};

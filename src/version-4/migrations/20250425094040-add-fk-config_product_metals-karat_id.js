
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_product_metals', {
      fields: ['karat_id'],
      type: 'foreign key',
      name: 'fk_config_product_metals_karat_id',
      references: {
        table: 'gold_kts',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_product_metals', 'fk_config_product_metals_karat_id');
  }
};

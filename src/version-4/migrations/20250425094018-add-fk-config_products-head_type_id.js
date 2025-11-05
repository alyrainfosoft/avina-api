
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_products', {
      fields: ['head_type_id'],
      type: 'foreign key',
      name: 'fk_config_products_head_type_id',
      references: {
        table: 'heads',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_products', 'fk_config_products_head_type_id');
  }
};

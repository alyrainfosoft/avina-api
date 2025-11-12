
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_product_diamonds', {
      fields: ['id_diamond_group'],
      type: 'foreign key',
      name: 'fk_config_product_diamonds_id_diamond_group',
      references: {
        table: 'diamond_group_masters',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_product_diamonds', 'fk_config_product_diamonds_id_diamond_group');
  }
};

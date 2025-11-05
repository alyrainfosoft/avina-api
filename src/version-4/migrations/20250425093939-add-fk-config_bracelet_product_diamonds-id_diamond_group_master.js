
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('config_bracelet_product_diamonds', {
      fields: ['id_diamond_group_master'],
      type: 'foreign key',
      name: 'fk_config_bracelet_product_diamonds_id_diamond_group_master',
      references: {
        table: 'diamond_group_masters',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('config_bracelet_product_diamonds', 'fk_config_bracelet_product_diamonds_id_diamond_group_master');
  }
};

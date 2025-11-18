
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('metal_group_masters', {
      fields: ['id_kt'],
      type: 'foreign key',
      name: 'fk_metal_group_masters_id_kt',
      references: {
        table: 'gold_kts',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('metal_group_masters', 'fk_metal_group_masters_id_kt');
  }
};


'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('diamond_group_masters', {
      fields: ['id_stone'],
      type: 'foreign key',
      name: 'fk_diamond_group_masters_id_stone',
      references: {
        table: 'gemstones',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('diamond_group_masters', 'fk_diamond_group_masters_id_stone');
  }
};

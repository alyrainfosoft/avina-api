
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('diamond_group_masters', {
      fields: ['id_shape'],
      type: 'foreign key',
      name: 'fk_diamond_group_masters_id_shape',
      references: {
        table: 'diamond_shapes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('diamond_group_masters', 'fk_diamond_group_masters_id_shape');
  }
};


'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('system_configurations', {
      fields: ['id_metal'],
      type: 'foreign key',
      name: 'fk_system_configurations_id_metal',
      references: {
        table: 'metal_masters',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('system_configurations', 'fk_system_configurations_id_metal');
  }
};


'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('gold_kts', {
      fields: ['id_metal'],
      type: 'foreign key',
      name: 'fk_gold_kts_id_metal',
      references: {
        table: 'metal_masters',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('gold_kts', 'fk_gold_kts_id_metal');
  }
};

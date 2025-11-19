
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('gold_kts', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_gold_kts_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('gold_kts', 'fk_gold_kts_id_image');
  }
};

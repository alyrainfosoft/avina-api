
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('template_six', {
      fields: ['id_collection'],
      type: 'foreign key',
      name: 'fk_template_six_id_collection',
      references: {
        table: 'collections',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('template_six', 'fk_template_six_id_collection');
  }
};

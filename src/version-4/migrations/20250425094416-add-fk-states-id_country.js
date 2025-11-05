
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('states', {
      fields: ['id_country'],
      type: 'foreign key',
      name: 'fk_states_id_country',
      references: {
        table: 'contries',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('states', 'fk_states_id_country');
  }
};

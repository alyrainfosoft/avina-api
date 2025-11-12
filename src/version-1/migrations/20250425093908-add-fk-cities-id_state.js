
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('cities', {
      fields: ['id_state'],
      type: 'foreign key',
      name: 'fk_cities_id_state',
      references: {
        table: 'states',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('cities', 'fk_cities_id_state');
  }
};

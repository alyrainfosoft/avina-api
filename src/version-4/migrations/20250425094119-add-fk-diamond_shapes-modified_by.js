
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('diamond_shapes', {
      fields: ['modified_by'],
      type: 'foreign key',
      name: 'fk_diamond_shapes_modified_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('diamond_shapes', 'fk_diamond_shapes_modified_by');
  }
};

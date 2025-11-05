
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('heads', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_heads_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('heads', 'fk_heads_created_by');
  }
};

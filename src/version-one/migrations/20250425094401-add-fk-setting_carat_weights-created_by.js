
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('setting_carat_weights', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_setting_carat_weights_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('setting_carat_weights', 'fk_setting_carat_weights_created_by');
  }
};


'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('coupons', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_coupons_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('coupons', 'fk_coupons_created_by');
  }
};

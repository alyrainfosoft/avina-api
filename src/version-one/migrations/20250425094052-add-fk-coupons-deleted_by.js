
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('coupons', {
      fields: ['deleted_by'],
      type: 'foreign key',
      name: 'fk_coupons_deleted_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('coupons', 'fk_coupons_deleted_by');
  }
};

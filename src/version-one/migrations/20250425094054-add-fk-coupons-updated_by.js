
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('coupons', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'fk_coupons_updated_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('coupons', 'fk_coupons_updated_by');
  }
};

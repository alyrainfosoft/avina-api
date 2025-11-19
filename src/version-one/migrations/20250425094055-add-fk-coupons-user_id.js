
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('coupons', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_coupons_user_id',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('coupons', 'fk_coupons_user_id');
  }
};

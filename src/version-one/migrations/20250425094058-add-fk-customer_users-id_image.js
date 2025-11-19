
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('customer_users', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_customer_users_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('customer_users', 'fk_customer_users_id_image');
  }
};

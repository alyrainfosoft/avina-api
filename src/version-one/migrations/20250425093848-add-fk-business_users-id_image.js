
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('business_users', {
      fields: ['id_image'],
      type: 'foreign key',
      name: 'fk_business_users_id_image',
      references: {
        table: 'images',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('business_users', 'fk_business_users_id_image');
  }
};

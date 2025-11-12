
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product_videos', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_product_videos_created_by',
      references: {
        table: 'app_users',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('product_videos', 'fk_product_videos_created_by');
  }
};

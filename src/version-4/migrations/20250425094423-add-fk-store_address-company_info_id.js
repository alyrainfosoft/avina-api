
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('store_address', {
      fields: ['company_info_id'],
      type: 'foreign key',
      name: 'fk_store_address_company_info_id',
      references: {
        table: 'company_infoes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('store_address', 'fk_store_address_company_info_id');
  }
};


'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('mega_menus', {
      fields: ['company_info_id'],
      type: 'foreign key',
      name: 'fk_mega_menus_company_info_id',
      references: {
        table: 'company_infoes',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('mega_menus', 'fk_mega_menus_company_info_id');
  }
};

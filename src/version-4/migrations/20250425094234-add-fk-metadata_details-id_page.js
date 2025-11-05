
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('metadata_details', {
      fields: ['id_page'],
      type: 'foreign key',
      name: 'fk_metadata_details_id_page',
      references: {
        table: 'pages',
        field: 'id'
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('metadata_details', 'fk_metadata_details_id_page');
  }
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
//     await queryInterface.bulkInsert('theme_attribute_customers', [

//   {
//     "id": 2,
//     "id_company_info": 1,
//     "id_theme": 1,
//     "id_theme_attribute": "2",
//     "value": "HOME",
//     "id_image": 4896,
//     "link": "/",
//     "created_date": new Date(),
//     "created_by": 1,
//     "modified_date": null,
//     "modified_by": null
//   }
// ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('theme_attribute_customers', null, {});
  }
};

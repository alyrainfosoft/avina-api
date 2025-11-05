'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const value = await queryInterface.sequelize.query(`SELECT * FROM metal_tones`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) { 
      await queryInterface.bulkInsert('metal_tones', [
        {
          "id": 1,
          "name": "Rose Gold",
          "slug": "rose-gold",
          "is_band": "1",
          "id_image": null,
          "id_metal": 1,
          "is_active": "1",
          "is_config": "1",
          "sort_code": "RG",
          "created_by": 1,
          "is_deleted": "0",
          "is_earring": null,
          "is_pendant": null,
          "is_bracelet": "1",
          "modified_by": 1,
          "created_date": new Date(),
          "modified_date": new Date(),
          "is_three_stone": "1",
          "company_info_id": 1
        },
        {
          "id": 2,
          "name": "Yellow Gold",
          "slug": "yellow-gold",
          "is_band": "1",
          "id_image": null,
          "id_metal": 1,
          "is_active": "1",
          "is_config": "1",
          "sort_code": "YG",
          "created_by": 1,
          "is_deleted": "0",
          "is_earring": null,
          "is_pendant": null,
          "is_bracelet": "1",
          "modified_by": 1,
          "created_date": new Date(),
          "modified_date": new Date(),
          "is_three_stone": "1",
          "company_info_id": 1
        },
        {
          "id": 3,
          "name": "White Gold",
          "slug": "white-gold",
          "is_band": "1",
          "id_image": null,
          "id_metal": 1,
          "is_active": "1",
          "is_config": "1",
          "sort_code": "WG",
          "created_by": 1,
          "is_deleted": "0",
          "is_earring": null,
          "is_pendant": null,
          "is_bracelet": "1",
          "modified_by": 1,
          "created_date": new Date(),
          "modified_date": new Date(),
          "is_three_stone": "1",
          "company_info_id": 1
        },
        {
          "id": 5,
          "name": "Silver",
          "slug": "silver",
          "is_band": "0",
          "id_image": null,
          "id_metal": 2,
          "is_active": "1",
          "is_config": "0",
          "sort_code": "silver",
          "created_by": 1,
          "is_deleted": "0",
          "is_earring": "0",
          "is_pendant": "0",
          "is_bracelet": "0",
          "modified_by": 1,
          "created_date": new Date(),
          "modified_date": new Date(),
          "is_three_stone": "0",
          "company_info_id": 1
        },
        {
          "id": 6,
          "name": "Platinum",
          "slug": "platinum",
          "is_band": "0",
          "id_image": null,
          "id_metal": 3,
          "is_active": "1",
          "is_config": "0",
          "sort_code": "platinum",
          "created_by": 1,
          "is_deleted": "0",
          "is_earring": "0",
          "is_pendant": "0",
          "is_bracelet": "0",
          "modified_by": 1,
          "created_date": new Date(),
          "modified_date": new Date(),
          "is_three_stone": "0",
          "company_info_id": 1
        }
      ]);
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};

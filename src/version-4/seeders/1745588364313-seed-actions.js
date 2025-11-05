'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
     const value = await queryInterface.sequelize.query(`SELECT * FROM actions`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) {
      await queryInterface.bulkInsert('actions', [
        {
          "id": 6,
          "action_name": "View",
          "is_active": "0",
          "is_deleted": "0",
          "created_by": 1,
          "created_date": new Date(),
          "modified_by": null,
          "modified_date": null,
          "company_info_id": 1
        },
        {
          "id": 7,
          "action_name": "Add",
          "is_active": "0",
          "is_deleted": "0",
          "created_by": 1,
          "created_date": new Date(),
          "modified_by": null,
          "modified_date": null,
          "company_info_id": 1
        },
        {
          "id": 8,
          "action_name": "Edit",
          "is_active": "0",
          "is_deleted": "0",
          "created_by": 1,
          "created_date": new Date(),
          "modified_by": null,
          "modified_date": null,
          "company_info_id": 1
        },
        {
          "id": 9,
          "action_name": "Delete",
          "is_active": "0",
          "is_deleted": "0",
          "created_by": 1,
          "created_date": new Date(),
          "modified_by": null,
          "modified_date": null,
          "company_info_id": 1
        }
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('actions', null, {});
  }
};

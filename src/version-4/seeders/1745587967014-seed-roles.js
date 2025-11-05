'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("--------------------", queryInterface.sequelize.config)
    const value = await queryInterface.sequelize.query(`SELECT * FROM roles`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if((!value) || value.length == 0){
       await queryInterface.bulkInsert('roles', [
      {
        "id" : 0,
        "role_name": "Super Admin",
        "is_active": "1",
        "is_deleted": "0",
        "created_by": null,
        "created_date": new Date(),
        "modified_by": null,
        "modified_date": null,
        "company_info_id": 1
      }
    ]);
    }
   
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};

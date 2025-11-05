'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   const value = await queryInterface.sequelize.query(`SELECT * FROM configurator_setting`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) { 
      await queryInterface.bulkInsert('configurator_setting', [
  {
    "id": 2,
    "key": "eternity-band",
    "link": "/create-eternity-band-pricing",
    "name": "Eternity Band",
    "id_image": null,
    "is_active": "1",
    "created_by": 1,
    "is_deleted": "0",
    "description": "",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date()
  },
  {
    "id": 24,
    "key": "bracelete",
    "link": "/create-bracelet-3d-pricing",
    "name": "Bracelet Configurator",
    "id_image": null,
    "is_active": "1",
    "created_by": 1,
    "is_deleted": "0",
    "description": "",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date()
  },
  {
    "id": 1,
    "key": "ring-configurator",
    "link": "/ring-config-product",
    "name": "Engagement Ring",
    "id_image": null,
    "is_active": "1",
    "created_by": 1,
    "is_deleted": "0",
    "description": "",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date()
  },
  {
    "id": 3,
    "key": "three-stone",
    "link": "/create-threestone-3d-pricing",
    "name": "Three stone ring",
    "id_image": null,
    "is_active": "1",
    "created_by": 1,
    "is_deleted": "0",
    "description": "",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date()
  },
  {
    "id": 4,
    "key": "birth-stone",
    "link": "/royale-birthstone-product",
    "name": "Birthstone configurator",
    "id_image": null,
    "is_active": "1",
    "created_by": 1,
    "is_deleted": "0",
    "description": "",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date()
  },
  {
    "id": 20,
    "key": "Pendant",
    "link": "/pendant",
    "name": "Pendant Configurator",
    "id_image": null,
    "is_active": "1",
    "created_by": 1,
    "is_deleted": "0",
    "description": null,
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date()
  }
])
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

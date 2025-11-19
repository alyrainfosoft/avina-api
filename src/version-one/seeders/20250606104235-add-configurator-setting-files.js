'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
       const value = await queryInterface.sequelize.query(`SELECT * FROM configurator_setting`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) { 
      await queryInterface.bulkInsert('configurator_setting', [
  {
    "id": 10,
    "key": "ygPmat",
    "file_path": "files/configurator/ygPmat.pmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 74,
    "key": "UV",
    "file_path": "files/configurator/ring-configurator/UV.glb",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date()
  },
  {
    "id": 68,
    "key": "UV",
    "file_path": "files/configurator/three-stone/UV.glb",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": 3
  },
  {
    "id": 71,
    "key": "vjsonBirthstone",
    "file_path": "files/configurator/birth-stone/vjsonBirthstone.vjson",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": 4
  },
  {
    "id": 81,
    "key": "configJson",
    "file_path": "files/configurator/bracelete/configJson.json",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": 24
  },
  {
    "id": 40,
    "key": "hand5",
    "file_path": "files/configurator/hand5.pmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 11,
    "key": "wgPmat",
    "file_path": "files/configurator/wgPmat.pmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 67,
    "key": "configJson",
    "file_path": "files/configurator/eternity-band/configJson.json",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": 2
  },
  {
    "id": 36,
    "key": "hand1",
    "file_path": "files/configurator/hand1.pmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 12,
    "key": "dmat",
    "file_path": "files/configurator/dmat.dmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 29,
    "key": "june",
    "file_path": "files/configurator/june.dmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 37,
    "key": "hand2",
    "file_path": "files/configurator/hand2.pmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 31,
    "key": "august",
    "file_path": "files/configurator/august.dmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 38,
    "key": "hand3",
    "file_path": "files/configurator/hand3.pmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 34,
    "key": "november",
    "file_path": "files/configurator/november.dmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 39,
    "key": "hand4",
    "file_path": "files/configurator/hand4.pmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 21,
    "key": "cameraView",
    "file_path": "files/configurator/cameraView.json",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 33,
    "key": "october",
    "file_path": "files/configurator/october.pmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 30,
    "key": "july",
    "file_path": "files/configurator/july.dmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 28,
    "key": "may",
    "file_path": "files/configurator/may.dmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 32,
    "key": "september",
    "file_path": "files/configurator/september.dmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 35,
    "key": "december",
    "file_path": "files/configurator/december.dmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 27,
    "key": "march",
    "file_path": "files/configurator/march.dmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 24,
    "key": "january",
    "file_path": "files/configurator/january.dmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 25,
    "key": "february",
    "file_path": "files/configurator/february.dmat",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": null
  },
  {
    "id": 70,
    "key": "vjson",
    "file_path": "files/configurator/three-stone/vjson.vjson",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": 3
  },
  {
    "id": 75,
    "key": "vjson",
    "file_path": "files/configurator/ring-configurator/vjson.vjson",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date()
  },
  {
    "id": 76,
    "key": "configJson",
    "file_path": "files/configurator/ring-configurator/configJson.json",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date()
  },
  {
    "id": 49,
    "key": "vjson",
    "file_path": "files/configurator/birth-stone/vjson.vjson",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": 4
  },
  {
    "id": 17,
    "key": "vjson",
    "file_path": "files/configurator/eternity-band/vjson.vjson",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": 2
  },
  {
    "id": 69,
    "key": "configJson",
    "file_path": "files/configurator/three-stone/configJson.json",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": 3
  },
  {
    "id": 80,
    "key": "vjson",
    "file_path": "files/configurator/bracelete/vjson.vjson",
    "created_by": 1,
    "is_deleted": "0",
    "modified_by": 1,
    "created_date": new Date(),
    "modified_date": new Date(),
    "id_config_setting": 24
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

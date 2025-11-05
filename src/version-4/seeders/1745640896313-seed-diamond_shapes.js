'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
//     await queryInterface.bulkInsert('diamond_shapes', [
//   {
//     "id": 4,
//     "name": "Pear",
//     "slug": "pear",
//     "id_image": null,
//     "is_active": "1",
//     "created_date": new Date(),
//     "modified_date": null,
//     "created_by": 1,
//     "modified_by": null,
//     "is_deleted": "0",
//     "sort_code": "PE",
//     "is_config": "1",
//     "is_band": "1",
//     "is_three_stone": "0",
//     "is_bracelet": "0",
//     "is_pendant": "0",
//     "is_earring": "0",
//     "is_diamond": JSON.stringify({
//       "RING_CONFIGURATOR": 3,
//       "ETERNITY_BAND_CONFIGURATOR": 3
//     }),
//     "sort_order": JSON.stringify({
//       "RING_CONFIGURATOR": 4,
//       "ETERNITY_BAND_CONFIGURATOR": 9
//     }),
//     "diamond_size_id": JSON.stringify({
//       "RING_CONFIGURATOR": [
//         46,
//         39,
//         6,
//         4,
//         8,
//         5,
//         120
//       ],
//       "ETERNITY_BAND_CONFIGURATOR": [
//         109,
//         27,
//         108,
//         72,
//         107
//       ]
//     }),
//     "company_info_id": 1
//   },
//   {
//     "id": 10,
//     "name": "Marquise",
//     "slug": "marquise",
//     "id_image": null,
//     "is_active": "1",
//     "created_date": new Date(),
//     "modified_date": null,
//     "created_by": 1,
//     "modified_by": null,
//     "is_deleted": "0",
//     "sort_code": "MQ",
//     "is_config": "1",
//     "is_band": "1",
//     "is_three_stone": "0",
//     "is_bracelet": "0",
//     "is_pendant": "0",
//     "is_earring": "0",
//     "is_diamond": JSON.stringify({
//       "RING_CONFIGURATOR": 3,
//       "ETERNITY_BAND_CONFIGURATOR": 3
//     }),
//     "sort_order": JSON.stringify({
//       "RING_CONFIGURATOR": 7,
//       "ETERNITY_BAND_CONFIGURATOR": 8
//     }),
//     "diamond_size_id": JSON.stringify({
//       "RING_CONFIGURATOR": [
//         6,
//         4,
//         8,
//         5
//       ],
//       "ETERNITY_BAND_CONFIGURATOR": [
//         109,
//         27,
//         108,
//         72,
//         107
//       ]
//     }),
//     "company_info_id": 1
//   },
//   {
//     "id": 8,
//     "name": "Radiant",
//     "slug": "radiant",
//     "id_image": null,
//     "is_active": "1",
//     "created_date": new Date(),
//     "modified_date": null,
//     "created_by": 1,
//     "modified_by": null,
//     "is_deleted": "0",
//     "sort_code": "RT",
//     "is_config": "1",
//     "is_band": "1",
//     "is_three_stone": "0",
//     "is_bracelet": "0",
//     "is_pendant": "0",
//     "is_earring": "0",
//     "is_diamond": JSON.stringify({
//       "RING_CONFIGURATOR": 3,
//       "ETERNITY_BAND_CONFIGURATOR": 3,
//       "BRACELET_CONFIGURATOR": 3,
//       "THREE_STONE_CONFIGURATOR": 3
//     }),
//     "sort_order": JSON.stringify({
//       "RING_CONFIGURATOR": 6,
//       "BRACELET_CONFIGURATOR": 5,
//       "ETERNITY_BAND_CONFIGURATOR": 5,
//       "THREE_STONE_CONFIGURATOR": 4
//     }),
//     "diamond_size_id": JSON.stringify({
//       "RING_CONFIGURATOR": [
//         120,
//         46,
//         39,
//         6,
//         5,
//         8,
//         4
//       ],
//       "ETERNITY_BAND_CONFIGURATOR": [
//         109,
//         27,
//         108,
//         72,
//         107
//       ],
//       "BRACELET_CONFIGURATOR": [
//         120,
//         46,
//         39,
//         4
//       ],
//       "THREE_STONE_CONFIGURATOR": [
//         39,
//         6,
//         4
//       ]
//     }),
//     "company_info_id": 1
//   },
//   {
//     "id": 5,
//     "name": "Oval",
//     "slug": "oval",
//     "id_image": null,
//     "is_active": "1",
//     "created_date": new Date(),
//     "modified_date": null,
//     "created_by": 1,
//     "modified_by": null,
//     "is_deleted": "0",
//     "sort_code": "OV",
//     "is_config": "1",
//     "is_band": "1",
//     "is_three_stone": "1",
//     "is_bracelet": "0",
//     "is_pendant": "0",
//     "is_earring": "0",
//     "is_diamond": JSON.stringify({
//       "RING_CONFIGURATOR": 3,
//       "THREE_STONE_CONFIGURATOR": 3,
//       "ETERNITY_BAND_CONFIGURATOR": 3,
//       "BRACELET_CONFIGURATOR": 3
//     }),
//     "sort_order": JSON.stringify({
//       "RING_CONFIGURATOR": 3,
//       "THREE_STONE_CONFIGURATOR": 3,
//       "BRACELET_CONFIGURATOR": 2,
//       "ETERNITY_BAND_CONFIGURATOR": 2
//     }),
//     "diamond_size_id": JSON.stringify({
//       "RING_CONFIGURATOR": [
//         120,
//         46,
//         6,
//         39,
//         5,
//         8,
//         4
//       ],
//       "THREE_STONE_CONFIGURATOR": [
//         39,
//         6,
//         4
//       ],
//       "ETERNITY_BAND_CONFIGURATOR": [
//         107,
//         72,
//         108,
//         27,
//         109
//       ],
//       "BRACELET_CONFIGURATOR": [
//         120,
//         46,
//         39,
//         4
//       ]
//     }),
//     "company_info_id": 1
//   },
//   {
//     "id": 1,
//     "name": "Round",
//     "slug": "round",
//     "id_image": null,
//     "is_active": "1",
//     "created_date": new Date(),
//     "modified_date": null,
//     "created_by": 1,
//     "modified_by": null,
//     "is_deleted": "0",
//     "sort_code": "RD",
//     "is_config": "1",
//     "is_band": "1",
//     "is_three_stone": "1",
//     "is_bracelet": "1",
//     "is_pendant": "0",
//     "is_earring": "0",
//     "is_diamond": JSON.stringify({
//       "RING_CONFIGURATOR": 3,
//       "THREE_STONE_CONFIGURATOR": 3,
//       "ETERNITY_BAND_CONFIGURATOR": 3,
//       "BRACELET_CONFIGURATOR": 3
//     }),
//     "sort_order": JSON.stringify({
//       "RING_CONFIGURATOR": 1,
//       "THREE_STONE_CONFIGURATOR": 1,
//       "BRACELET_CONFIGURATOR": 1,
//       "ETERNITY_BAND_CONFIGURATOR": 1
//     }),
//     "diamond_size_id": JSON.stringify({
//       "RING_CONFIGURATOR": [
//         120,
//         46,
//         39,
//         6,
//         5,
//         8,
//         4
//       ],
//       "THREE_STONE_CONFIGURATOR": [
//         39,
//         6,
//         4
//       ],
//       "ETERNITY_BAND_CONFIGURATOR": [
//         107,
//         72,
//         108,
//         27,
//         109
//       ],
//       "BRACELET_CONFIGURATOR": [
//         120,
//         46,
//         39,
//         4
//       ]
//     }),
//     "company_info_id": 1
//   },
//   {
//     "id": 3,
//     "name": "Emerald",
//     "slug": "emerald",
//     "id_image": null,
//     "is_active": "1",
//     "created_date": new Date(),
//     "modified_date": null,
//     "created_by": 1,
//     "modified_by": null,
//     "is_deleted": "0",
//     "sort_code": "EM",
//     "is_config": "1",
//     "is_band": "1",
//     "is_three_stone": "1",
//     "is_bracelet": "0",
//     "is_pendant": "0",
//     "is_earring": "0",
//     "is_diamond": JSON.stringify({
//       "RING_CONFIGURATOR": 3,
//       "THREE_STONE_CONFIGURATOR": 3,
//       "ETERNITY_BAND_CONFIGURATOR": 3,
//       "BRACELET_CONFIGURATOR": 3
//     }),
//     "sort_order": JSON.stringify({
//       "RING_CONFIGURATOR": 5,
//       "THREE_STONE_CONFIGURATOR": 2,
//       "BRACELET_CONFIGURATOR": 3,
//       "ETERNITY_BAND_CONFIGURATOR": 3
//     }),
//     "diamond_size_id": JSON.stringify({
//       "RING_CONFIGURATOR": [
//         120,
//         46,
//         39,
//         6,
//         5,
//         8,
//         4
//       ],
//       "THREE_STONE_CONFIGURATOR": [
//         4,
//         6,
//         39
//       ],
//       "ETERNITY_BAND_CONFIGURATOR": [
//         109,
//         27,
//         108,
//         72,
//         107
//       ],
//       "BRACELET_CONFIGURATOR": [
//         120,
//         46,
//         39,
//         4
//       ]
//     }),
//     "company_info_id": 1
//   }
// ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('diamond_shapes', null, {});
  }
};

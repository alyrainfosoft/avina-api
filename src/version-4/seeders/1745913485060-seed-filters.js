'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const value = await queryInterface.sequelize.query(`SELECT * FROM system_configurations`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) {
      await queryInterface.bulkInsert('filters', [
        {
          "id": 24,
          "key": "metal-tone",
          "name": "Metal Tone",
          "is_active": "1",
          "created_by": null,
          "item_scope": "both",
          "modified_by": 1,
          "created_date": "2025-04-18T10:02:14.509+00:00",
          "modified_date": "2025-04-29T06:34:02.137+00:00",
          "selected_value": JSON.stringify([]),
          "company_info_id": 1,
          "filter_select_type": "multiple"
        },
        {
          "id": 23,
          "key": "side-setting",
          "name": "Side Setting",
          "is_active": "1",
          "created_by": null,
          "item_scope": "product",
          "modified_by": 419,
          "created_date": "2025-04-18T10:01:46.202+00:00",
          "modified_date": "2025-06-02T05:36:04.761+00:00",
          "selected_value": JSON.stringify([]),
          "company_info_id": 1,
          "filter_select_type": "multiple"
        },
        {
          "id": 26,
          "key": "collection",
          "name": "collection",
          "is_active": "1",
          "created_by": null,
          "item_scope": "product",
          "modified_by": 1,
          "created_date": "2025-04-18T10:02:46.562+00:00",
          "modified_date": "2025-04-29T06:29:32.432+00:00",
          "selected_value": JSON.stringify([]),
          "company_info_id": 1,
          "filter_select_type": "multiple"
        },
        {
          "id": 27,
          "key": "gender",
          "name": "gender",
          "is_active": "1",
          "created_by": null,
          "item_scope": "product",
          "modified_by": 1,
          "created_date": "2025-04-18T10:02:59.67+00:00",
          "modified_date": "2025-04-29T06:30:28.47+00:00",
          "selected_value": JSON.stringify([]),
          "company_info_id": 1,
          "filter_select_type": "multiple"
        },
        {
          "id": 28,
          "key": "brand",
          "name": "brand",
          "is_active": "1",
          "created_by": null,
          "item_scope": "product",
          "modified_by": 1,
          "created_date": "2025-04-18T10:03:08.019+00:00",
          "modified_date": "2025-04-29T06:30:42.199+00:00",
          "selected_value": JSON.stringify([]),
          "company_info_id": 1,
          "filter_select_type": "multiple"
        },
        {
          "id": 35,
          "key": "diamond-size",
          "name": "diamond weight",
          "is_active": "1",
          "created_by": null,
          "item_scope": "product",
          "modified_by": 1,
          "created_date": "2025-04-18T10:05:37.208+00:00",
          "modified_date": "2025-04-29T06:32:27.225+00:00",
          "selected_value": [],
          "company_info_id": 1,
          "filter_select_type": "range"
        },
        {
          "id": 36,
          "key": "product-price",
          "name": "price",
          "is_active": "1",
          "created_by": null,
          "item_scope": "product",
          "modified_by": 1,
          "created_date": "2025-04-18T10:05:56.828+00:00",
          "modified_date": "2025-04-29T06:33:25.124+00:00",
          "selected_value": [],
          "company_info_id": 1,
          "filter_select_type": "range"
        },
        {
          "id": 22,
          "key": "category",
          "name": "Category",
          "is_active": "1",
          "created_by": null,
          "item_scope": "product",
          "modified_by": 1,
          "created_date": "2025-04-17T12:17:08.702+00:00",
          "modified_date": "2025-05-15T08:53:00.349+00:00",
          "selected_value": JSON.stringify([]),
          "company_info_id": 1,
          "filter_select_type": "multiple"
        },
        {
          "id": 29,
          "key": "diamond-color",
          "name": "diamond color",
          "is_active": "1",
          "created_by": null,
          "item_scope": "product",
          "modified_by": 1,
          "created_date": "2025-04-18T10:03:21.892+00:00",
          "modified_date": "2025-05-20T07:00:04.561+00:00",
          "selected_value": JSON.stringify([]),
          "company_info_id": 1,
          "filter_select_type": "range"
        },
        {
          "id": 32,
          "key": "cut",
          "name": "cut",
          "is_active": "1",
          "created_by": null,
          "item_scope": "product",
          "modified_by": 1,
          "created_date": "2025-04-18T10:03:55.275+00:00",
          "modified_date": "2025-05-21T11:15:25.413+00:00",
          "selected_value": JSON.stringify([]),
          "company_info_id": 1,
          "filter_select_type": "multiple"
        },
        {
          "id": 25,
          "key": "diamond-shape",
          "name": "Diamond Shape",
          "is_active": "1",
          "created_by": null,
          "item_scope": "both",
          "modified_by": 1,
          "created_date": "2025-04-18T10:02:33.248+00:00",
          "modified_date": "2025-05-09T05:45:40.786+00:00",
          "selected_value": JSON.stringify([]),
          "company_info_id": 1,
          "filter_select_type": "multiple"
        },
        {
          "id": 30,
          "key": "diamond-clarity",
          "name": "diamond clarity",
          "is_active": "1",
          "created_by": null,
          "item_scope": "product",
          "modified_by": 1,
          "created_date": "2025-04-18T10:03:36.842+00:00",
          "modified_date": "2025-05-20T07:00:08.04+00:00",
          "selected_value": JSON.stringify([]),
          "company_info_id": 1,
          "filter_select_type": "range"
        }
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('filters', null, {});
  }
  
};

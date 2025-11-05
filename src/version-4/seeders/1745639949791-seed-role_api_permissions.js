'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const value = await queryInterface.sequelize.query(`SELECT * FROM role_api_permissions`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) {
      await queryInterface.bulkInsert('role_api_permissions', [
        {
          "id": 2,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/user-access-menu-items",
          "id_menu_item": 30,
          "company_info_id": 1
        },
        {
          "id": 3,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/dashboard",
          "id_menu_item": 30,
          "company_info_id": 1
        },
        {
          "id": 4,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "product/list/user",
          "id_menu_item": 30,
          "company_info_id": 1
        },
        {
          "id": 5,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/enquiries/product",
          "id_menu_item": 30,
          "company_info_id": 1
        },
        {
          "id": 6,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/order/list/admin",
          "id_menu_item": 31,
          "company_info_id": 1
        },
        {
          "id": 7,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/product/list/user",
          "id_menu_item": 31,
          "company_info_id": 1
        },
        {
          "id": 8,
          "id_action": 6,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/order/details/admin",
          "id_menu_item": 31,
          "company_info_id": 1
        },
        {
          "id": 9,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/order/status/update",
          "id_menu_item": 31,
          "company_info_id": 1
        },
        {
          "id": 10,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/order/delivery/status",
          "id_menu_item": 31,
          "company_info_id": 1
        },
        {
          "id": 11,
          "id_action": 6,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/invoice/details",
          "id_menu_item": 31,
          "company_info_id": 1
        },
        {
          "id": 12,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/product/add/data",
          "id_menu_item": 32,
          "company_info_id": 1
        },
        {
          "id": 13,
          "id_action": 8,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/product/variant",
          "id_menu_item": 33,
          "company_info_id": 1
        },
        {
          "id": 14,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/product/birth-stone/featured/status",
          "id_menu_item": 34,
          "company_info_id": 1
        },
        {
          "id": 15,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/product/birth-stone/trending/status",
          "id_menu_item": 34,
          "company_info_id": 1
        },
        {
          "id": 16,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/product",
          "id_menu_item": 34,
          "company_info_id": 1
        },
        {
          "id": 17,
          "id_action": 8,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/product/edit/data",
          "id_menu_item": 34,
          "company_info_id": 1
        },
        {
          "id": 18,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/product/:id",
          "id_menu_item": 34,
          "company_info_id": 1
        },
        {
          "id": 19,
          "id_action": 8,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/active-inactive-product",
          "id_menu_item": 34,
          "company_info_id": 1
        },
        {
          "id": 20,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/product",
          "id_menu_item": 34,
          "company_info_id": 1
        },
        {
          "id": 21,
          "id_action": 8,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/product/trending/status",
          "id_menu_item": 34,
          "company_info_id": 1
        },
        {
          "id": 22,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/product-imagezip",
          "id_menu_item": 35,
          "company_info_id": 1
        },
        {
          "id": 23,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/product-csv",
          "id_menu_item": 36,
          "company_info_id": 1
        },
        {
          "id": 24,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/product/variant/product-csv",
          "id_menu_item": 36,
          "company_info_id": 1
        },
        {
          "id": 25,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/product/birth-stone/add",
          "id_menu_item": 37,
          "company_info_id": 1
        },
        {
          "id": 26,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/product/birth-stone/add/price-add",
          "id_menu_item": 38,
          "company_info_id": 1
        },
        {
          "id": 27,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/product/birth-stone/list-birthstone-products/",
          "id_menu_item": 38,
          "company_info_id": 1
        },
        {
          "id": 28,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/product/birth-stone/list",
          "id_menu_item": 38,
          "company_info_id": 1
        },
        {
          "id": 29,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/product/birth-stone/status",
          "id_menu_item": 38,
          "company_info_id": 1
        },
        {
          "id": 30,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/product/birth-stone/delete",
          "id_menu_item": 38,
          "company_info_id": 1
        },
        {
          "id": 31,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/product/birth-stone/image/add",
          "id_menu_item": 38,
          "company_info_id": 1
        },
        {
          "id": 32,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/product/list/admin",
          "id_menu_item": 39,
          "company_info_id": 1
        },
        {
          "id": 33,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/all/config/product/add",
          "id_menu_item": 39,
          "company_info_id": 1
        },
        {
          "id": 34,
          "id_action": 9,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/product/config/delete",
          "id_menu_item": 39,
          "company_info_id": 1
        },
        {
          "id": 35,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/admin/config/product/:id",
          "id_menu_item": 39,
          "company_info_id": 1
        },
        {
          "id": 36,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/product/list/admin",
          "id_menu_item": 40,
          "company_info_id": 1
        },
        {
          "id": 37,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/all/config/product/add",
          "id_menu_item": 40,
          "company_info_id": 1
        },
        {
          "id": 38,
          "id_action": 9,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/product/config/delete",
          "id_menu_item": 40,
          "company_info_id": 1
        },
        {
          "id": 39,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/admin/config/product/:id",
          "id_menu_item": 40,
          "company_info_id": 1
        },
        {
          "id": 40,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/eternity-band",
          "id_menu_item": 41,
          "company_info_id": 1
        },
        {
          "id": 41,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/eternity-band-csv",
          "id_menu_item": 41,
          "company_info_id": 1
        },
        {
          "id": 42,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/eternity-band/:product_id",
          "id_menu_item": 41,
          "company_info_id": 1
        },
        {
          "id": 43,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "fluorescence_intensity_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 42,
          "company_info_id": 1
        },
        {
          "id": 44,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "fluorescence_intensity_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 42,
          "company_info_id": 1
        },
        {
          "id": 45,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "fluorescence_intensity_master",
          "api_endpoint": "/master",
          "id_menu_item": 42,
          "company_info_id": 1
        },
        {
          "id": 46,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "fluorescence_intensity_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 42,
          "company_info_id": 1
        },
        {
          "id": 47,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "fluorescence_intensity_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 42,
          "company_info_id": 1
        },
        {
          "id": 48,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "fluorescence_intensity_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 42,
          "company_info_id": 1
        },
        {
          "id": 49,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "fluorescence_color_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 43,
          "company_info_id": 1
        },
        {
          "id": 50,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "fluorescence_color_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 43,
          "company_info_id": 1
        },
        {
          "id": 51,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "fluorescence_color_master",
          "api_endpoint": "/master",
          "id_menu_item": 43,
          "company_info_id": 1
        },
        {
          "id": 52,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "fluorescence_color_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 43,
          "company_info_id": 1
        },
        {
          "id": 53,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "fluorescence_color_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 43,
          "company_info_id": 1
        },
        {
          "id": 54,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "fluorescence_color_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 43,
          "company_info_id": 1
        },
        {
          "id": 55,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "fancy_color_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 44,
          "company_info_id": 1
        },
        {
          "id": 56,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "fancy_color_master",
          "api_endpoint": "/master",
          "id_menu_item": 44,
          "company_info_id": 1
        },
        {
          "id": 57,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "fancy_color_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 44,
          "company_info_id": 1
        },
        {
          "id": 58,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "fancy_color_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 44,
          "company_info_id": 1
        },
        {
          "id": 59,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "fancy_color_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 44,
          "company_info_id": 1
        },
        {
          "id": 60,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "fancy_color_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 44,
          "company_info_id": 1
        },
        {
          "id": 61,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "fancy_color_intensity_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 45,
          "company_info_id": 1
        },
        {
          "id": 62,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "fancy_color_intensity_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 45,
          "company_info_id": 1
        },
        {
          "id": 63,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "fancy_color_intensity_master",
          "api_endpoint": "/master",
          "id_menu_item": 45,
          "company_info_id": 1
        },
        {
          "id": 64,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "fancy_color_intensity_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 45,
          "company_info_id": 1
        },
        {
          "id": 65,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "fancy_color_intensity_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 45,
          "company_info_id": 1
        },
        {
          "id": 66,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "fancy_color_intensity_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 45,
          "company_info_id": 1
        },
        {
          "id": 67,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "fancy_color_overtone_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 46,
          "company_info_id": 1
        },
        {
          "id": 68,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "fancy_color_overtone_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 46,
          "company_info_id": 1
        },
        {
          "id": 69,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "fancy_color_overtone_master",
          "api_endpoint": "/master",
          "id_menu_item": 46,
          "company_info_id": 1
        },
        {
          "id": 70,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "fancy_color_overtone_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 46,
          "company_info_id": 1
        },
        {
          "id": 71,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "fancy_color_overtone_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 46,
          "company_info_id": 1
        },
        {
          "id": 72,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "fancy_color_overtone_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 46,
          "company_info_id": 1
        },
        {
          "id": 73,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "girdle_thin_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 47,
          "company_info_id": 1
        },
        {
          "id": 74,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "girdle_thin_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 47,
          "company_info_id": 1
        },
        {
          "id": 75,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "girdle_thin_master",
          "api_endpoint": "/master",
          "id_menu_item": 47,
          "company_info_id": 1
        },
        {
          "id": 76,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "girdle_thin_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 47,
          "company_info_id": 1
        },
        {
          "id": 77,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "girdle_thin_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 47,
          "company_info_id": 1
        },
        {
          "id": 78,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "girdle_thin_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 47,
          "company_info_id": 1
        },
        {
          "id": 79,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "girdle_thick_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 48,
          "company_info_id": 1
        },
        {
          "id": 80,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "girdle_thick_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 48,
          "company_info_id": 1
        },
        {
          "id": 81,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "girdle_thick_master",
          "api_endpoint": "/master",
          "id_menu_item": 48,
          "company_info_id": 1
        },
        {
          "id": 82,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "girdle_thick_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 48,
          "company_info_id": 1
        },
        {
          "id": 83,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "girdle_thick_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 48,
          "company_info_id": 1
        },
        {
          "id": 84,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "girdle_thick_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 48,
          "company_info_id": 1
        },
        {
          "id": 85,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "girdle_condition_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 49,
          "company_info_id": 1
        },
        {
          "id": 86,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "girdle_condition_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 49,
          "company_info_id": 1
        },
        {
          "id": 87,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "girdle_condition_master",
          "api_endpoint": "/master",
          "id_menu_item": 49,
          "company_info_id": 1
        },
        {
          "id": 88,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "girdle_condition_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 49,
          "company_info_id": 1
        },
        {
          "id": 89,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "girdle_condition_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 49,
          "company_info_id": 1
        },
        {
          "id": 90,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "girdle_condition_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 49,
          "company_info_id": 1
        },
        {
          "id": 91,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "pair_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 50,
          "company_info_id": 1
        },
        {
          "id": 92,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "pair_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 50,
          "company_info_id": 1
        },
        {
          "id": 93,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "pair_master",
          "api_endpoint": "/master",
          "id_menu_item": 50,
          "company_info_id": 1
        },
        {
          "id": 94,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "pair_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 50,
          "company_info_id": 1
        },
        {
          "id": 95,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "pair_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 50,
          "company_info_id": 1
        },
        {
          "id": 96,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "pair_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 50,
          "company_info_id": 1
        },
        {
          "id": 97,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "pair_separable_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 51,
          "company_info_id": 1
        },
        {
          "id": 98,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "pair_separable_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 51,
          "company_info_id": 1
        },
        {
          "id": 99,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "pair_separable_master",
          "api_endpoint": "/master",
          "id_menu_item": 51,
          "company_info_id": 1
        },
        {
          "id": 100,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "pair_separable_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 51,
          "company_info_id": 1
        },
        {
          "id": 101,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "pair_separable_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 51,
          "company_info_id": 1
        },
        {
          "id": 102,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "pair_separable_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 51,
          "company_info_id": 1
        },
        {
          "id": 103,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "pair_stock_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 52,
          "company_info_id": 1
        },
        {
          "id": 104,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "pair_stock_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 52,
          "company_info_id": 1
        },
        {
          "id": 105,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "pair_stock_master",
          "api_endpoint": "/master",
          "id_menu_item": 52,
          "company_info_id": 1
        },
        {
          "id": 106,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "pair_stock_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 52,
          "company_info_id": 1
        },
        {
          "id": 107,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "pair_stock_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 52,
          "company_info_id": 1
        },
        {
          "id": 108,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "pair_stock_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 52,
          "company_info_id": 1
        },
        {
          "id": 109,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "center_inclusion_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 53,
          "company_info_id": 1
        },
        {
          "id": 110,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "center_inclusion_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 53,
          "company_info_id": 1
        },
        {
          "id": 111,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "center_inclusion_master",
          "api_endpoint": "/master",
          "id_menu_item": 53,
          "company_info_id": 1
        },
        {
          "id": 112,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "center_inclusion_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 53,
          "company_info_id": 1
        },
        {
          "id": 113,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "center_inclusion_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 53,
          "company_info_id": 1
        },
        {
          "id": 114,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "center_inclusion_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 53,
          "company_info_id": 1
        },
        {
          "id": 115,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "black_inclusion_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 54,
          "company_info_id": 1
        },
        {
          "id": 116,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "black_inclusion_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 54,
          "company_info_id": 1
        },
        {
          "id": 117,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "black_inclusion_master",
          "api_endpoint": "/master",
          "id_menu_item": 54,
          "company_info_id": 1
        },
        {
          "id": 118,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "black_inclusion_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 54,
          "company_info_id": 1
        },
        {
          "id": 119,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "black_inclusion_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 54,
          "company_info_id": 1
        },
        {
          "id": 120,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "black_inclusion_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 54,
          "company_info_id": 1
        },
        {
          "id": 121,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "lab_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 55,
          "company_info_id": 1
        },
        {
          "id": 122,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "lab_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 55,
          "company_info_id": 1
        },
        {
          "id": 123,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "lab_master",
          "api_endpoint": "/master",
          "id_menu_item": 55,
          "company_info_id": 1
        },
        {
          "id": 124,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "lab_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 55,
          "company_info_id": 1
        },
        {
          "id": 125,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "lab_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 55,
          "company_info_id": 1
        },
        {
          "id": 126,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "lab_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 55,
          "company_info_id": 1
        },
        {
          "id": 127,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "lab_location_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 56,
          "company_info_id": 1
        },
        {
          "id": 128,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "lab_location_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 56,
          "company_info_id": 1
        },
        {
          "id": 129,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "lab_location_master",
          "api_endpoint": "/master",
          "id_menu_item": 56,
          "company_info_id": 1
        },
        {
          "id": 130,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "lab_location_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 56,
          "company_info_id": 1
        },
        {
          "id": 131,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "lab_location_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 56,
          "company_info_id": 1
        },
        {
          "id": 132,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "lab_location_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 56,
          "company_info_id": 1
        },
        {
          "id": 133,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "parcel_stones_master",
          "api_endpoint": "/master",
          "id_menu_item": 57,
          "company_info_id": 1
        },
        {
          "id": 134,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "parcel_stones_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 57,
          "company_info_id": 1
        },
        {
          "id": 135,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "parcel_stones_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 57,
          "company_info_id": 1
        },
        {
          "id": 136,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "parcel_stones_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 57,
          "company_info_id": 1
        },
        {
          "id": 137,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "parcel_stones_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 57,
          "company_info_id": 1
        },
        {
          "id": 138,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "parcel_stones_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 57,
          "company_info_id": 1
        },
        {
          "id": 139,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "availability_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 58,
          "company_info_id": 1
        },
        {
          "id": 140,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "availability_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 58,
          "company_info_id": 1
        },
        {
          "id": 141,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "availability_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 58,
          "company_info_id": 1
        },
        {
          "id": 142,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "availability_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 58,
          "company_info_id": 1
        },
        {
          "id": 143,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "availability_master",
          "api_endpoint": "/master",
          "id_menu_item": 58,
          "company_info_id": 1
        },
        {
          "id": 144,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "availability_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 58,
          "company_info_id": 1
        },
        {
          "id": 145,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "polish_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 59,
          "company_info_id": 1
        },
        {
          "id": 146,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "polish_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 59,
          "company_info_id": 1
        },
        {
          "id": 147,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "polish_master",
          "api_endpoint": "/master",
          "id_menu_item": 59,
          "company_info_id": 1
        },
        {
          "id": 148,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "polish_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 59,
          "company_info_id": 1
        },
        {
          "id": 149,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "polish_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 59,
          "company_info_id": 1
        },
        {
          "id": 150,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "polish_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 59,
          "company_info_id": 1
        },
        {
          "id": 151,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "symmetry_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 60,
          "company_info_id": 1
        },
        {
          "id": 152,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "symmetry_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 60,
          "company_info_id": 1
        },
        {
          "id": 153,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "symmetry_master",
          "api_endpoint": "/master",
          "id_menu_item": 60,
          "company_info_id": 1
        },
        {
          "id": 154,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "symmetry_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 60,
          "company_info_id": 1
        },
        {
          "id": 155,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "symmetry_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 60,
          "company_info_id": 1
        },
        {
          "id": 156,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "symmetry_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 60,
          "company_info_id": 1
        },
        {
          "id": 157,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "culet_condition_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 61,
          "company_info_id": 1
        },
        {
          "id": 158,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "culet_condition_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 61,
          "company_info_id": 1
        },
        {
          "id": 159,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "culet_condition_master",
          "api_endpoint": "/master",
          "id_menu_item": 61,
          "company_info_id": 1
        },
        {
          "id": 160,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "culet_condition_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 61,
          "company_info_id": 1
        },
        {
          "id": 161,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "culet_condition_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 61,
          "company_info_id": 1
        },
        {
          "id": 162,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "culet_condition_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 61,
          "company_info_id": 1
        },
        {
          "id": 163,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "laser_inscription_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 62,
          "company_info_id": 1
        },
        {
          "id": 164,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "laser_inscription_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 62,
          "company_info_id": 1
        },
        {
          "id": 165,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "laser_inscription_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 62,
          "company_info_id": 1
        },
        {
          "id": 166,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "laser_inscription_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 62,
          "company_info_id": 1
        },
        {
          "id": 167,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "laser_inscription_master",
          "api_endpoint": "/master",
          "id_menu_item": 62,
          "company_info_id": 1
        },
        {
          "id": 168,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "laser_inscription_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 62,
          "company_info_id": 1
        },
        {
          "id": 169,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "cert_comment_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 63,
          "company_info_id": 1
        },
        {
          "id": 170,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "cert_comment_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 63,
          "company_info_id": 1
        },
        {
          "id": 171,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "cert_comment_master",
          "api_endpoint": "/master",
          "id_menu_item": 63,
          "company_info_id": 1
        },
        {
          "id": 172,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "cert_comment_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 63,
          "company_info_id": 1
        },
        {
          "id": 173,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "cert_comment_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 63,
          "company_info_id": 1
        },
        {
          "id": 174,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "cert_comment_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 63,
          "company_info_id": 1
        },
        {
          "id": 175,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "time_to_location_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 64,
          "company_info_id": 1
        },
        {
          "id": 176,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "time_to_location_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 64,
          "company_info_id": 1
        },
        {
          "id": 177,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "time_to_location_master",
          "api_endpoint": "/master",
          "id_menu_item": 64,
          "company_info_id": 1
        },
        {
          "id": 178,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "time_to_location_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 64,
          "company_info_id": 1
        },
        {
          "id": 179,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "time_to_location_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 64,
          "company_info_id": 1
        },
        {
          "id": 180,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "time_to_location_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 64,
          "company_info_id": 1
        },
        {
          "id": 181,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "trade_show_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 65,
          "company_info_id": 1
        },
        {
          "id": 182,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "trade_show_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 65,
          "company_info_id": 1
        },
        {
          "id": 183,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "trade_show_master",
          "api_endpoint": "/master",
          "id_menu_item": 65,
          "company_info_id": 1
        },
        {
          "id": 184,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "trade_show_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 65,
          "company_info_id": 1
        },
        {
          "id": 185,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "trade_show_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 65,
          "company_info_id": 1
        },
        {
          "id": 186,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "trade_show_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 65,
          "company_info_id": 1
        },
        {
          "id": 187,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "shade_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 66,
          "company_info_id": 1
        },
        {
          "id": 188,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "shade_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 66,
          "company_info_id": 1
        },
        {
          "id": 189,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "shade_master",
          "api_endpoint": "/master",
          "id_menu_item": 66,
          "company_info_id": 1
        },
        {
          "id": 190,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "shade_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 66,
          "company_info_id": 1
        },
        {
          "id": 191,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "shade_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 66,
          "company_info_id": 1
        },
        {
          "id": 192,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "shade_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 66,
          "company_info_id": 1
        },
        {
          "id": 193,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "report_type_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 67,
          "company_info_id": 1
        },
        {
          "id": 194,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "report_type_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 67,
          "company_info_id": 1
        },
        {
          "id": 195,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "report_type_master",
          "api_endpoint": "/master",
          "id_menu_item": 67,
          "company_info_id": 1
        },
        {
          "id": 196,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "report_type_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 67,
          "company_info_id": 1
        },
        {
          "id": 197,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "report_type_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 67,
          "company_info_id": 1
        },
        {
          "id": 198,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "report_type_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 67,
          "company_info_id": 1
        },
        {
          "id": 199,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "milky_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 68,
          "company_info_id": 1
        },
        {
          "id": 200,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "milky_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 68,
          "company_info_id": 1
        },
        {
          "id": 201,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "milky_master",
          "api_endpoint": "/master",
          "id_menu_item": 68,
          "company_info_id": 1
        },
        {
          "id": 202,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "milky_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 68,
          "company_info_id": 1
        },
        {
          "id": 203,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "milky_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 68,
          "company_info_id": 1
        },
        {
          "id": 204,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "milky_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 68,
          "company_info_id": 1
        },
        {
          "id": 205,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "bgm_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 69,
          "company_info_id": 1
        },
        {
          "id": 206,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "bgm_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 69,
          "company_info_id": 1
        },
        {
          "id": 207,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "bgm_master",
          "api_endpoint": "/master",
          "id_menu_item": 69,
          "company_info_id": 1
        },
        {
          "id": 208,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "bgm_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 69,
          "company_info_id": 1
        },
        {
          "id": 209,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "bgm_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 69,
          "company_info_id": 1
        },
        {
          "id": 210,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "bgm_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 69,
          "company_info_id": 1
        },
        {
          "id": 211,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "H&A_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 70,
          "company_info_id": 1
        },
        {
          "id": 212,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "H&A_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 70,
          "company_info_id": 1
        },
        {
          "id": 213,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "H&A_master",
          "api_endpoint": "/master",
          "id_menu_item": 70,
          "company_info_id": 1
        },
        {
          "id": 214,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "H&A_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 70,
          "company_info_id": 1
        },
        {
          "id": 215,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "H&A_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 70,
          "company_info_id": 1
        },
        {
          "id": 216,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "H&A_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 70,
          "company_info_id": 1
        },
        {
          "id": 217,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "growth_type_master",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 71,
          "company_info_id": 1
        },
        {
          "id": 218,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "growth_type_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 71,
          "company_info_id": 1
        },
        {
          "id": 219,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "growth_type_master",
          "api_endpoint": "/master",
          "id_menu_item": 71,
          "company_info_id": 1
        },
        {
          "id": 220,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "growth_type_master",
          "api_endpoint": "/master/:id",
          "id_menu_item": 71,
          "company_info_id": 1
        },
        {
          "id": 221,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "growth_type_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 71,
          "company_info_id": 1
        },
        {
          "id": 222,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "growth_type_master",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 71,
          "company_info_id": 1
        },
        {
          "id": 223,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "country",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 72,
          "company_info_id": 1
        },
        {
          "id": 224,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "country",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 72,
          "company_info_id": 1
        },
        {
          "id": 225,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "country",
          "api_endpoint": "/master",
          "id_menu_item": 72,
          "company_info_id": 1
        },
        {
          "id": 226,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "country",
          "api_endpoint": "/master/:id",
          "id_menu_item": 72,
          "company_info_id": 1
        },
        {
          "id": 227,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "country",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 72,
          "company_info_id": 1
        },
        {
          "id": 228,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "country",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 72,
          "company_info_id": 1
        },
        {
          "id": 229,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "state",
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 73,
          "company_info_id": 1
        },
        {
          "id": 230,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "state",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 73,
          "company_info_id": 1
        },
        {
          "id": 231,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "state",
          "api_endpoint": "/master",
          "id_menu_item": 73,
          "company_info_id": 1
        },
        {
          "id": 232,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "state",
          "api_endpoint": "/master/:id",
          "id_menu_item": 73,
          "company_info_id": 1
        },
        {
          "id": 233,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": "state",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 73,
          "company_info_id": 1
        },
        {
          "id": 234,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": "state",
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 73,
          "company_info_id": 1
        },
        {
          "id": 235,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/masters/:master_type",
          "id_menu_item": 74,
          "company_info_id": 1
        },
        {
          "id": 236,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 74,
          "company_info_id": 1
        },
        {
          "id": 237,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/master",
          "id_menu_item": 74,
          "company_info_id": 1
        },
        {
          "id": 238,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/master/:id",
          "id_menu_item": 74,
          "company_info_id": 1
        },
        {
          "id": 239,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 74,
          "company_info_id": 1
        },
        {
          "id": 240,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/master/:id/:master_type",
          "id_menu_item": 74,
          "company_info_id": 1
        },
        {
          "id": 241,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/admin/loose-diamond",
          "id_menu_item": 75,
          "company_info_id": 1
        },
        {
          "id": 242,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/loose-diamond-single/:id",
          "id_menu_item": 75,
          "company_info_id": 1
        },
        {
          "id": 243,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/loose-diamond-single",
          "id_menu_item": 75,
          "company_info_id": 1
        },
        {
          "id": 244,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/loose-diamond-single/:id",
          "id_menu_item": 75,
          "company_info_id": 1
        },
        {
          "id": 245,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/loose-diamond-single/:id",
          "id_menu_item": 75,
          "company_info_id": 1
        },
        {
          "id": 246,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/loose-diamond/:product_id",
          "id_menu_item": 75,
          "company_info_id": 1
        },
        {
          "id": 247,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "shape_master",
          "api_endpoint": "/info-section",
          "id_menu_item": 76,
          "company_info_id": 1
        },
        {
          "id": 248,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "shape_master",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 76,
          "company_info_id": 1
        },
        {
          "id": 249,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "shape_master",
          "api_endpoint": "/info-section",
          "id_menu_item": 76,
          "company_info_id": 1
        },
        {
          "id": 250,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/diamond-shape/:id",
          "id_menu_item": 76,
          "company_info_id": 1
        },
        {
          "id": 251,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/diamond-shape/:id",
          "id_menu_item": 76,
          "company_info_id": 1
        },
        {
          "id": 252,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/diamond-shape/:id",
          "id_menu_item": 76,
          "company_info_id": 1
        },
        {
          "id": 253,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/diamond-shape/:id",
          "id_menu_item": 76,
          "company_info_id": 1
        },
        {
          "id": 254,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/diamond-shape",
          "id_menu_item": 76,
          "company_info_id": 1
        },
        {
          "id": 255,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/diamond-shape",
          "id_menu_item": 76,
          "company_info_id": 1
        },
        {
          "id": 256,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "stone_master",
          "api_endpoint": "/info-section",
          "id_menu_item": 77,
          "company_info_id": 1
        },
        {
          "id": 257,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "stone_master",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 77,
          "company_info_id": 1
        },
        {
          "id": 258,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "stone_master",
          "api_endpoint": "/info-section",
          "id_menu_item": 77,
          "company_info_id": 1
        },
        {
          "id": 259,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/stone/:id",
          "id_menu_item": 77,
          "company_info_id": 1
        },
        {
          "id": 260,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/stone/:id",
          "id_menu_item": 77,
          "company_info_id": 1
        },
        {
          "id": 261,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/stone/:id",
          "id_menu_item": 77,
          "company_info_id": 1
        },
        {
          "id": 262,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/stone/:id",
          "id_menu_item": 77,
          "company_info_id": 1
        },
        {
          "id": 263,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/stone",
          "id_menu_item": 77,
          "company_info_id": 1
        },
        {
          "id": 264,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/stone",
          "id_menu_item": 77,
          "company_info_id": 1
        },
        {
          "id": 265,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/carat-size/:id",
          "id_menu_item": 78,
          "company_info_id": 1
        },
        {
          "id": 266,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/carat-size",
          "id_menu_item": 78,
          "company_info_id": 1
        },
        {
          "id": 267,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/carat-size",
          "id_menu_item": 78,
          "company_info_id": 1
        },
        {
          "id": 268,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "carat",
          "api_endpoint": "/info-section",
          "id_menu_item": 78,
          "company_info_id": 1
        },
        {
          "id": 269,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "carat",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 78,
          "company_info_id": 1
        },
        {
          "id": 270,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "carat",
          "api_endpoint": "/info-section",
          "id_menu_item": 78,
          "company_info_id": 1
        },
        {
          "id": 271,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/carat-size/:id",
          "id_menu_item": 78,
          "company_info_id": 1
        },
        {
          "id": 272,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/carat-size/:id",
          "id_menu_item": 78,
          "company_info_id": 1
        },
        {
          "id": 273,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/carat-size/:id",
          "id_menu_item": 78,
          "company_info_id": 1
        },
        {
          "id": 274,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/caratSize/config-value",
          "id_menu_item": 78,
          "company_info_id": 1
        },
        {
          "id": 275,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "color",
          "api_endpoint": "/info-section",
          "id_menu_item": 79,
          "company_info_id": 1
        },
        {
          "id": 276,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "color",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 79,
          "company_info_id": 1
        },
        {
          "id": 277,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "color",
          "api_endpoint": "/info-section",
          "id_menu_item": 79,
          "company_info_id": 1
        },
        {
          "id": 278,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/color/:id",
          "id_menu_item": 79,
          "company_info_id": 1
        },
        {
          "id": 279,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/color/:id",
          "id_menu_item": 79,
          "company_info_id": 1
        },
        {
          "id": 280,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/color/:id",
          "id_menu_item": 79,
          "company_info_id": 1
        },
        {
          "id": 281,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/color/:id",
          "id_menu_item": 79,
          "company_info_id": 1
        },
        {
          "id": 282,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/color",
          "id_menu_item": 79,
          "company_info_id": 1
        },
        {
          "id": 283,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/color",
          "id_menu_item": 79,
          "company_info_id": 1
        },
        {
          "id": 284,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "clarity",
          "api_endpoint": "/info-section",
          "id_menu_item": 80,
          "company_info_id": 1
        },
        {
          "id": 285,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "clarity",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 80,
          "company_info_id": 1
        },
        {
          "id": 286,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "clarity",
          "api_endpoint": "/info-section",
          "id_menu_item": 80,
          "company_info_id": 1
        },
        {
          "id": 287,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/clarity",
          "id_menu_item": 80,
          "company_info_id": 1
        },
        {
          "id": 288,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/clarity/:id",
          "id_menu_item": 80,
          "company_info_id": 1
        },
        {
          "id": 289,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/clarity/:id",
          "id_menu_item": 80,
          "company_info_id": 1
        },
        {
          "id": 290,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/clarity/:id",
          "id_menu_item": 80,
          "company_info_id": 1
        },
        {
          "id": 291,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/clarity/:id",
          "id_menu_item": 80,
          "company_info_id": 1
        },
        {
          "id": 292,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/clarity",
          "id_menu_item": 80,
          "company_info_id": 1
        },
        {
          "id": 293,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/cut/:id",
          "id_menu_item": 81,
          "company_info_id": 1
        },
        {
          "id": 294,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/cut/:id",
          "id_menu_item": 81,
          "company_info_id": 1
        },
        {
          "id": 295,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/cut/:id",
          "id_menu_item": 81,
          "company_info_id": 1
        },
        {
          "id": 296,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/cut/:id",
          "id_menu_item": 81,
          "company_info_id": 1
        },
        {
          "id": 297,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/cut",
          "id_menu_item": 81,
          "company_info_id": 1
        },
        {
          "id": 298,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/cut",
          "id_menu_item": 81,
          "company_info_id": 1
        },
        {
          "id": 299,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "cut",
          "api_endpoint": "/info-section",
          "id_menu_item": 81,
          "company_info_id": 1
        },
        {
          "id": 300,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "cut",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 81,
          "company_info_id": 1
        },
        {
          "id": 301,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "cut",
          "api_endpoint": "/info-section",
          "id_menu_item": 81,
          "company_info_id": 1
        },
        {
          "id": 302,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/mm-size/:id",
          "id_menu_item": 82,
          "company_info_id": 1
        },
        {
          "id": 303,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/mm-size/:id",
          "id_menu_item": 82,
          "company_info_id": 1
        },
        {
          "id": 304,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/mm-size/:id",
          "id_menu_item": 82,
          "company_info_id": 1
        },
        {
          "id": 305,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/mm-size/:id",
          "id_menu_item": 82,
          "company_info_id": 1
        },
        {
          "id": 306,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/mm-size",
          "id_menu_item": 82,
          "company_info_id": 1
        },
        {
          "id": 307,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/mm-size",
          "id_menu_item": 82,
          "company_info_id": 1
        },
        {
          "id": 308,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "mm_size",
          "api_endpoint": "/info-section",
          "id_menu_item": 82,
          "company_info_id": 1
        },
        {
          "id": 309,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "mm_size",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 82,
          "company_info_id": 1
        },
        {
          "id": 310,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "mm_size",
          "api_endpoint": "/info-section",
          "id_menu_item": 82,
          "company_info_id": 1
        },
        {
          "id": 311,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/diamond-group",
          "id_menu_item": 83,
          "company_info_id": 1
        },
        {
          "id": 312,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/diamond-group",
          "id_menu_item": 83,
          "company_info_id": 1
        },
        {
          "id": 313,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/diamond-group/:id",
          "id_menu_item": 83,
          "company_info_id": 1
        },
        {
          "id": 314,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/diamond-group/:id",
          "id_menu_item": 83,
          "company_info_id": 1
        },
        {
          "id": 315,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/diamond-group/:id",
          "id_menu_item": 83,
          "company_info_id": 1
        },
        {
          "id": 316,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/diamond/group/master/csv",
          "id_menu_item": 83,
          "company_info_id": 1
        },
        {
          "id": 317,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/head/:id",
          "id_menu_item": 84,
          "company_info_id": 1
        },
        {
          "id": 318,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/head/:id",
          "id_menu_item": 84,
          "company_info_id": 1
        },
        {
          "id": 319,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/head/:id",
          "id_menu_item": 84,
          "company_info_id": 1
        },
        {
          "id": 320,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/head/:id",
          "id_menu_item": 84,
          "company_info_id": 1
        },
        {
          "id": 321,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/head",
          "id_menu_item": 84,
          "company_info_id": 1
        },
        {
          "id": 322,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/head",
          "id_menu_item": 84,
          "company_info_id": 1
        },
        {
          "id": 323,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "head",
          "api_endpoint": "/info-section",
          "id_menu_item": 84,
          "company_info_id": 1
        },
        {
          "id": 324,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "head",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 84,
          "company_info_id": 1
        },
        {
          "id": 325,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "head",
          "api_endpoint": "/info-section",
          "id_menu_item": 84,
          "company_info_id": 1
        },
        {
          "id": 326,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "shank",
          "api_endpoint": "/info-section",
          "id_menu_item": 85,
          "company_info_id": 1
        },
        {
          "id": 327,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "shank",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 85,
          "company_info_id": 1
        },
        {
          "id": 328,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "shank",
          "api_endpoint": "/info-section",
          "id_menu_item": 85,
          "company_info_id": 1
        },
        {
          "id": 329,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/shank/:id",
          "id_menu_item": 85,
          "company_info_id": 1
        },
        {
          "id": 330,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/shank/:id",
          "id_menu_item": 85,
          "company_info_id": 1
        },
        {
          "id": 331,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/shank/:id",
          "id_menu_item": 85,
          "company_info_id": 1
        },
        {
          "id": 332,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/shank/:id",
          "id_menu_item": 85,
          "company_info_id": 1
        },
        {
          "id": 333,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/shank",
          "id_menu_item": 85,
          "company_info_id": 1
        },
        {
          "id": 334,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/shank",
          "id_menu_item": 85,
          "company_info_id": 1
        },
        {
          "id": 335,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "side_setting",
          "api_endpoint": "/info-section",
          "id_menu_item": 86,
          "company_info_id": 1
        },
        {
          "id": 336,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "side_setting",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 86,
          "company_info_id": 1
        },
        {
          "id": 337,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "side_setting",
          "api_endpoint": "/info-section",
          "id_menu_item": 86,
          "company_info_id": 1
        },
        {
          "id": 338,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/side-setting/:id",
          "id_menu_item": 86,
          "company_info_id": 1
        },
        {
          "id": 339,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/side-setting/:id",
          "id_menu_item": 86,
          "company_info_id": 1
        },
        {
          "id": 340,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/side-setting/:id",
          "id_menu_item": 86,
          "company_info_id": 1
        },
        {
          "id": 341,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/side-setting/:id",
          "id_menu_item": 86,
          "company_info_id": 1
        },
        {
          "id": 342,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/side-setting",
          "id_menu_item": 86,
          "company_info_id": 1
        },
        {
          "id": 343,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/side-setting",
          "id_menu_item": 86,
          "company_info_id": 1
        },
        {
          "id": 344,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/size/:id",
          "id_menu_item": 87,
          "company_info_id": 1
        },
        {
          "id": 345,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/size/:id",
          "id_menu_item": 87,
          "company_info_id": 1
        },
        {
          "id": 346,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/size/:id",
          "id_menu_item": 87,
          "company_info_id": 1
        },
        {
          "id": 347,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/size",
          "id_menu_item": 87,
          "company_info_id": 1
        },
        {
          "id": 348,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/size",
          "id_menu_item": 87,
          "company_info_id": 1
        },
        {
          "id": 349,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "item_size",
          "api_endpoint": "/info-section",
          "id_menu_item": 87,
          "company_info_id": 1
        },
        {
          "id": 350,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "item_size",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 87,
          "company_info_id": 1
        },
        {
          "id": 351,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "item_size",
          "api_endpoint": "/info-section",
          "id_menu_item": 87,
          "company_info_id": 1
        },
        {
          "id": 352,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "item_length",
          "api_endpoint": "/info-section",
          "id_menu_item": 88,
          "company_info_id": 1
        },
        {
          "id": 353,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "item_length",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 88,
          "company_info_id": 1
        },
        {
          "id": 354,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "item_length",
          "api_endpoint": "/info-section",
          "id_menu_item": 88,
          "company_info_id": 1
        },
        {
          "id": 355,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/setting-type/:id",
          "id_menu_item": 89,
          "company_info_id": 1
        },
        {
          "id": 356,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/setting-type/:id",
          "id_menu_item": 89,
          "company_info_id": 1
        },
        {
          "id": 357,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/setting-type/:id",
          "id_menu_item": 89,
          "company_info_id": 1
        },
        {
          "id": 358,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/setting-type/:id",
          "id_menu_item": 89,
          "company_info_id": 1
        },
        {
          "id": 359,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/setting-type",
          "id_menu_item": 89,
          "company_info_id": 1
        },
        {
          "id": 360,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/setting-type",
          "id_menu_item": 89,
          "company_info_id": 1
        },
        {
          "id": 361,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "setting_type",
          "api_endpoint": "/info-section",
          "id_menu_item": 89,
          "company_info_id": 1
        },
        {
          "id": 362,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "setting_type",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 89,
          "company_info_id": 1
        },
        {
          "id": 363,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "setting_type",
          "api_endpoint": "/info-section",
          "id_menu_item": 89,
          "company_info_id": 1
        },
        {
          "id": 364,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/settingType/add",
          "id_menu_item": 89,
          "company_info_id": 1
        },
        {
          "id": 365,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/goldKT/config-value",
          "id_menu_item": 90,
          "company_info_id": 1
        },
        {
          "id": 366,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/gold-karat/:id",
          "id_menu_item": 90,
          "company_info_id": 1
        },
        {
          "id": 367,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/gold-karat/:id",
          "id_menu_item": 90,
          "company_info_id": 1
        },
        {
          "id": 368,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/gold-karat/:id",
          "id_menu_item": 90,
          "company_info_id": 1
        },
        {
          "id": 369,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/gold-karat/:id",
          "id_menu_item": 90,
          "company_info_id": 1
        },
        {
          "id": 370,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/gold-karat",
          "id_menu_item": 90,
          "company_info_id": 1
        },
        {
          "id": 371,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/gold-karat",
          "id_menu_item": 90,
          "company_info_id": 1
        },
        {
          "id": 372,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "metal_karat",
          "api_endpoint": "/info-section",
          "id_menu_item": 90,
          "company_info_id": 1
        },
        {
          "id": 373,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "metal_karat",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 90,
          "company_info_id": 1
        },
        {
          "id": 374,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "metal_karat",
          "api_endpoint": "/info-section",
          "id_menu_item": 90,
          "company_info_id": 1
        },
        {
          "id": 375,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/metal-tone/:id",
          "id_menu_item": 91,
          "company_info_id": 1
        },
        {
          "id": 376,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/metal-tone/:id",
          "id_menu_item": 91,
          "company_info_id": 1
        },
        {
          "id": 377,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/metal-tone/:id",
          "id_menu_item": 91,
          "company_info_id": 1
        },
        {
          "id": 378,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/metal-tone/:id",
          "id_menu_item": 91,
          "company_info_id": 1
        },
        {
          "id": 379,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/metal-tone",
          "id_menu_item": 91,
          "company_info_id": 1
        },
        {
          "id": 380,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/metal-tone",
          "id_menu_item": 91,
          "company_info_id": 1
        },
        {
          "id": 381,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "metal_tone",
          "api_endpoint": "/info-section",
          "id_menu_item": 91,
          "company_info_id": 1
        },
        {
          "id": 382,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "metal_tone",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 91,
          "company_info_id": 1
        },
        {
          "id": 383,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "metal_tone",
          "api_endpoint": "/info-section",
          "id_menu_item": 91,
          "company_info_id": 1
        },
        {
          "id": 384,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "metal_master",
          "api_endpoint": "/info-section",
          "id_menu_item": 92,
          "company_info_id": 1
        },
        {
          "id": 385,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "metal_master",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 92,
          "company_info_id": 1
        },
        {
          "id": 386,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "metal_master",
          "api_endpoint": "/info-section",
          "id_menu_item": 92,
          "company_info_id": 1
        },
        {
          "id": 387,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/metal/id",
          "id_menu_item": 92,
          "company_info_id": 1
        },
        {
          "id": 388,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/metal/id",
          "id_menu_item": 92,
          "company_info_id": 1
        },
        {
          "id": 389,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/metal/id",
          "id_menu_item": 92,
          "company_info_id": 1
        },
        {
          "id": 390,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/metal/id",
          "id_menu_item": 92,
          "company_info_id": 1
        },
        {
          "id": 391,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/metal",
          "id_menu_item": 92,
          "company_info_id": 1
        },
        {
          "id": 392,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/metal",
          "id_menu_item": 92,
          "company_info_id": 1
        },
        {
          "id": 393,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "brands",
          "api_endpoint": "/info-section",
          "id_menu_item": 93,
          "company_info_id": 1
        },
        {
          "id": 394,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "barnds",
          "api_endpoint": "/info-section",
          "id_menu_item": 93,
          "company_info_id": 1
        },
        {
          "id": 395,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "brands",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 93,
          "company_info_id": 1
        },
        {
          "id": 396,
          "id_action": 7,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/brand/:id",
          "id_menu_item": 93,
          "company_info_id": 1
        },
        {
          "id": 397,
          "id_action": 6,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/brand/:id",
          "id_menu_item": 93,
          "company_info_id": 1
        },
        {
          "id": 398,
          "id_action": 6,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/brand/:id",
          "id_menu_item": 93,
          "company_info_id": 1
        },
        {
          "id": 399,
          "id_action": 7,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/brand",
          "id_menu_item": 93,
          "company_info_id": 1
        },
        {
          "id": 400,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/brand",
          "id_menu_item": 93,
          "company_info_id": 1
        },
        {
          "id": 401,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "collection",
          "api_endpoint": "/info-section",
          "id_menu_item": 94,
          "company_info_id": 1
        },
        {
          "id": 402,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "collection",
          "api_endpoint": "/info-section",
          "id_menu_item": 94,
          "company_info_id": 1
        },
        {
          "id": 403,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "collection",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 94,
          "company_info_id": 1
        },
        {
          "id": 404,
          "id_action": 7,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/attribute/collection/:id",
          "id_menu_item": 94,
          "company_info_id": 1
        },
        {
          "id": 405,
          "id_action": 6,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/attribute/collection/:id",
          "id_menu_item": 94,
          "company_info_id": 1
        },
        {
          "id": 406,
          "id_action": 6,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/collection/:id",
          "id_menu_item": 94,
          "company_info_id": 1
        },
        {
          "id": 407,
          "id_action": 7,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/collection",
          "id_menu_item": 94,
          "company_info_id": 1
        },
        {
          "id": 408,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/attribute/collection",
          "id_menu_item": 94,
          "company_info_id": 1
        },
        {
          "id": 409,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/tag",
          "id_menu_item": 95,
          "company_info_id": 1
        },
        {
          "id": 410,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "tag",
          "api_endpoint": "/info-section",
          "id_menu_item": 95,
          "company_info_id": 1
        },
        {
          "id": 411,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "tag",
          "api_endpoint": "/info-section/:info_key",
          "id_menu_item": 95,
          "company_info_id": 1
        },
        {
          "id": 412,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "tag",
          "api_endpoint": "/info-section",
          "id_menu_item": 95,
          "company_info_id": 1
        },
        {
          "id": 413,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/coupon",
          "id_menu_item": 96,
          "company_info_id": 1
        },
        {
          "id": 414,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/coupon",
          "id_menu_item": 96,
          "company_info_id": 1
        },
        {
          "id": 415,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/coupon/:id",
          "id_menu_item": 96,
          "company_info_id": 1
        },
        {
          "id": 416,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/coupon/:id",
          "id_menu_item": 96,
          "company_info_id": 1
        },
        {
          "id": 417,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/coupon/:id",
          "id_menu_item": 96,
          "company_info_id": 1
        },
        {
          "id": 418,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/coupon/:id",
          "id_menu_item": 96,
          "company_info_id": 1
        },
        {
          "id": 419,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/shipping-charge",
          "id_menu_item": 97,
          "company_info_id": 1
        },
        {
          "id": 420,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/shipping-charge",
          "id_menu_item": 97,
          "company_info_id": 1
        },
        {
          "id": 421,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/shipping-charge/:id",
          "id_menu_item": 97,
          "company_info_id": 1
        },
        {
          "id": 422,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/shipping-charge/:id",
          "id_menu_item": 97,
          "company_info_id": 1
        },
        {
          "id": 423,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/shipping-charge/:id",
          "id_menu_item": 97,
          "company_info_id": 1
        },
        {
          "id": 424,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/category/add",
          "id_menu_item": 98,
          "company_info_id": 1
        },
        {
          "id": 425,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/category",
          "id_menu_item": 98,
          "company_info_id": 1
        },
        {
          "id": 426,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/category/main",
          "id_menu_item": 98,
          "company_info_id": 1
        },
        {
          "id": 427,
          "id_action": 8,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/category/sub",
          "id_menu_item": 98,
          "company_info_id": 1
        },
        {
          "id": 428,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/category/edit",
          "id_menu_item": 98,
          "company_info_id": 1
        },
        {
          "id": 429,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/category/delete",
          "id_menu_item": 98,
          "company_info_id": 1
        },
        {
          "id": 430,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/category/status",
          "id_menu_item": 98,
          "company_info_id": 1
        },
        {
          "id": 431,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/customer/add",
          "id_menu_item": 99,
          "company_info_id": 1
        },
        {
          "id": 432,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/customer",
          "id_menu_item": 99,
          "company_info_id": 1
        },
        {
          "id": 433,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/customer/:id",
          "id_menu_item": 99,
          "company_info_id": 1
        },
        {
          "id": 434,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/customer/edit",
          "id_menu_item": 99,
          "company_info_id": 1
        },
        {
          "id": 435,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/customer/delete",
          "id_menu_item": 99,
          "company_info_id": 1
        },
        {
          "id": 436,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/product/review/status",
          "id_menu_item": 100,
          "company_info_id": 1
        },
        {
          "id": 437,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/product/review/list/admin",
          "id_menu_item": 100,
          "company_info_id": 1
        },
        {
          "id": 438,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/report/customers",
          "id_menu_item": 101,
          "company_info_id": 1
        },
        {
          "id": 439,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/order/transaction/list",
          "id_menu_item": 102,
          "company_info_id": 1
        },
        {
          "id": 440,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/product/wish/list",
          "id_menu_item": 103,
          "company_info_id": 1
        },
        {
          "id": 441,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/product/cart/list/admin",
          "id_menu_item": 104,
          "company_info_id": 1
        },
        {
          "id": 442,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/enquiries/product",
          "id_menu_item": 105,
          "company_info_id": 1
        },
        {
          "id": 443,
          "id_action": 8,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/enquiries/product/update",
          "id_menu_item": 105,
          "company_info_id": 1
        },
        {
          "id": 444,
          "id_action": 6,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/enquiries/product/details",
          "id_menu_item": 105,
          "company_info_id": 1
        },
        {
          "id": 445,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/enquiries/general",
          "id_menu_item": 106,
          "company_info_id": 1
        },
        {
          "id": 446,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/banners/edit",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 447,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/banners/delete",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 448,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/banners",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 449,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/banners/status",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 450,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/marketingBanner/add",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 451,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/marketingBanner",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 452,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/marketingBanner/edit",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 453,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/marketingBanner/delete",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 454,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/marketingBanner/status",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 455,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/featureSection/add",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 456,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/featureSection",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 457,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/featureSection/edit",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 458,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/featureSection/delete",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 459,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/featureSection/status",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 460,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/about/main/edit",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 461,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/about/main",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 462,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/about/sub/add",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 463,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/about/sub",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 464,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/about/sub/:id",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 465,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/about/sub/edit",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 466,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/about/sub/delete",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 467,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/about/sub/status",
          "id_menu_item": 107,
          "company_info_id": 1
        },
        {
          "id": 468,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template/two/banners",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 469,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template/two/banners",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 470,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template/two/banners/edit",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 471,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template/two/banners/status",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 472,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template/two/banners/delete",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 473,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/banners",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 474,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/banners",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 475,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/banners/edit",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 476,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/banners/status",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 477,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/banners/delete",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 478,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/featureSection",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 479,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/featureSection/add",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 480,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/featureSection/edit",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 481,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/featureSection/status",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 482,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/featureSection/delete",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 483,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/marketingSection",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 484,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/marketingSection/add",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 485,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/marketingSection/edit",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 486,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/marketingSection/status",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 487,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template/two/home-about/marketingSection/delete",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 488,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template/two/marketingBanner",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 489,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template/two/marketingBanner/add",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 490,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template/two/marketingBanner/edit",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 491,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template/two/marketingBanner/status",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 492,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template/two/marketingBanner/delete",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 493,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template/two/featureSection",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 494,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template/two/featureSection/add",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 495,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template/two/featureSection/edit",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 496,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template/two/featureSection/status",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 497,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template/two/featureSection/delete",
          "id_menu_item": 108,
          "company_info_id": 1
        },
        {
          "id": 498,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-three/splash-screen",
          "id_menu_item": 109,
          "company_info_id": 1
        },
        {
          "id": 499,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-three/splash-screen",
          "id_menu_item": 109,
          "company_info_id": 1
        },
        {
          "id": 500,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-three/splash-screen/:id",
          "id_menu_item": 109,
          "company_info_id": 1
        },
        {
          "id": 501,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-three/splash-screen/:id",
          "id_menu_item": 109,
          "company_info_id": 1
        },
        {
          "id": 502,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-three/splash-screen/:id",
          "id_menu_item": 109,
          "company_info_id": 1
        },
        {
          "id": 503,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-six/banner",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 504,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-six/banner/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 505,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-six/banner",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 506,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-six/banner/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 507,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-six/banner/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 508,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-six/diamond-shape",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 509,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-six/diamond-shape",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 510,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-six/diamond-shape/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 511,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-six/diamond-shape/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 512,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-six/diamond-shape/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 513,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-six/shop-by",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 514,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-six/shop-by",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 515,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-six/shop-by/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 516,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-six/shop-by/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 517,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-six/shop-by/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 518,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-six/sparkle",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 519,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-six/sparkle",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 520,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-six/sparkle/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 521,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-six/sparkle/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 522,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-six/sparkle/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 523,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-six/shape-marque",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 524,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-six/shape-marque",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 525,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-six/shape-marque/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 526,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-six/shape-marque/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 527,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-six/shape-marque/:id",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 528,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-six/instagram",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 529,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-six/instagram",
          "id_menu_item": 110,
          "company_info_id": 1
        },
        {
          "id": 530,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/testimonial",
          "id_menu_item": 111,
          "company_info_id": 1
        },
        {
          "id": 531,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/testimonial/add",
          "id_menu_item": 111,
          "company_info_id": 1
        },
        {
          "id": 532,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/testimonial/edit",
          "id_menu_item": 111,
          "company_info_id": 1
        },
        {
          "id": 533,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/testimonial/status",
          "id_menu_item": 111,
          "company_info_id": 1
        },
        {
          "id": 534,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/testimonial/:id",
          "id_menu_item": 111,
          "company_info_id": 1
        },
        {
          "id": 535,
          "id_action": 9,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/testimonial/delete",
          "id_menu_item": 111,
          "company_info_id": 1
        },
        {
          "id": 536,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/marketingPopup/add",
          "id_menu_item": 112,
          "company_info_id": 1
        },
        {
          "id": 537,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/marketingPopup",
          "id_menu_item": 112,
          "company_info_id": 1
        },
        {
          "id": 538,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/marketingPopup/edit",
          "id_menu_item": 112,
          "company_info_id": 1
        },
        {
          "id": 539,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/marketingPopup/delete",
          "id_menu_item": 112,
          "company_info_id": 1
        },
        {
          "id": 540,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/marketingPopup/status",
          "id_menu_item": 112,
          "company_info_id": 1
        },
        {
          "id": 541,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/blogs/add",
          "id_menu_item": 113,
          "company_info_id": 1
        },
        {
          "id": 542,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/blog",
          "id_menu_item": 113,
          "company_info_id": 1
        },
        {
          "id": 543,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/blog/edit",
          "id_menu_item": 113,
          "company_info_id": 1
        },
        {
          "id": 544,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/blog/delete",
          "id_menu_item": 113,
          "company_info_id": 1
        },
        {
          "id": 545,
          "id_action": 8,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/blog",
          "id_menu_item": 113,
          "company_info_id": 1
        },
        {
          "id": 546,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/blogs/list",
          "id_menu_item": 113,
          "company_info_id": 1
        },
        {
          "id": 547,
          "id_action": 6,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/blogs/details",
          "id_menu_item": 113,
          "company_info_id": 1
        },
        {
          "id": 548,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/staticPage/add",
          "id_menu_item": 114,
          "company_info_id": 1
        },
        {
          "id": 549,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/staticPage",
          "id_menu_item": 114,
          "company_info_id": 1
        },
        {
          "id": 550,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/staticPage/:id",
          "id_menu_item": 114,
          "company_info_id": 1
        },
        {
          "id": 551,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/staticPage/edit",
          "id_menu_item": 114,
          "company_info_id": 1
        },
        {
          "id": 552,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/staticPage/delete",
          "id_menu_item": 114,
          "company_info_id": 1
        },
        {
          "id": 553,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/staticPage/status",
          "id_menu_item": 114,
          "company_info_id": 1
        },
        {
          "id": 554,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/menu-item-with-permission",
          "id_menu_item": 115,
          "company_info_id": 1
        },
        {
          "id": 555,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/menu-item-with-permission",
          "id_menu_item": 115,
          "company_info_id": 1
        },
        {
          "id": 556,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/menu-item-with-permission",
          "id_menu_item": 115,
          "company_info_id": 1
        },
        {
          "id": 557,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/menu-item-with-permission/:id",
          "id_menu_item": 115,
          "company_info_id": 1
        },
        {
          "id": 558,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/menu-item-with-permission/:id",
          "id_menu_item": 115,
          "company_info_id": 1
        },
        {
          "id": 559,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/menu-item-with-permission/:id",
          "id_menu_item": 115,
          "company_info_id": 1
        },
        {
          "id": 560,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/roles",
          "id_menu_item": 115,
          "company_info_id": 1
        },
        {
          "id": 561,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/roles/:id",
          "id_menu_item": 115,
          "company_info_id": 1
        },
        {
          "id": 562,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/roles/:id",
          "id_menu_item": 115,
          "company_info_id": 1
        },
        {
          "id": 563,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/actions",
          "id_menu_item": 115,
          "company_info_id": 1
        },
        {
          "id": 564,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/menu-items",
          "id_menu_item": 115,
          "company_info_id": 1
        },
        {
          "id": 565,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/role-configuration/:id",
          "id_menu_item": 115,
          "company_info_id": 1
        },
        {
          "id": 566,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/role-configuration",
          "id_menu_item": 115,
          "company_info_id": 1
        },
        {
          "id": 567,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/role-configuration/:id",
          "id_menu_item": 115,
          "company_info_id": 1
        },
        {
          "id": 568,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/business-user",
          "id_menu_item": 116,
          "company_info_id": 1
        },
        {
          "id": 569,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/business-user/:id",
          "id_menu_item": 116,
          "company_info_id": 1
        },
        {
          "id": 570,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/business-user",
          "id_menu_item": 116,
          "company_info_id": 1
        },
        {
          "id": 571,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/business-user/:id",
          "id_menu_item": 116,
          "company_info_id": 1
        },
        {
          "id": 572,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/business-user/:id",
          "id_menu_item": 116,
          "company_info_id": 1
        },
        {
          "id": 573,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/change-any-user-password",
          "id_menu_item": 116,
          "company_info_id": 1
        },
        {
          "id": 574,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/config-master-list",
          "id_menu_item": 117,
          "company_info_id": 1
        },
        {
          "id": 575,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "RING_CONFIGURATOR",
          "api_endpoint": "/configurator-master/:config_type",
          "id_menu_item": 117,
          "company_info_id": 1
        },
        {
          "id": 576,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "RING_CONFIGURATOR",
          "api_endpoint": "side-setting-image/:config_type",
          "id_menu_item": 117,
          "company_info_id": 1
        },
        {
          "id": 577,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "RING_CONFIGURATOR",
          "api_endpoint": "/side-setting-image/:config_type",
          "id_menu_item": 117,
          "company_info_id": 1
        },
        {
          "id": 578,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/config-master-list",
          "id_menu_item": 118,
          "company_info_id": 1
        },
        {
          "id": 682,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "profile",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 579,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "THREE_STONE_CONFIGURATOR",
          "api_endpoint": "/configurator-master/:config_type",
          "id_menu_item": 118,
          "company_info_id": 1
        },
        {
          "id": 580,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "THREE_STONE_CONFIGURATOR",
          "api_endpoint": "side-setting-image/:config_type",
          "id_menu_item": 118,
          "company_info_id": 1
        },
        {
          "id": 581,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "THREE_STONE_CONFIGURATOR",
          "api_endpoint": "/side-setting-image/:config_type",
          "id_menu_item": 118,
          "company_info_id": 1
        },
        {
          "id": 582,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/config-master-list",
          "id_menu_item": 119,
          "company_info_id": 1
        },
        {
          "id": 583,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "ETERNITY_BAND_CONFIGURATOR",
          "api_endpoint": "/configurator-master/:config_type",
          "id_menu_item": 119,
          "company_info_id": 1
        },
        {
          "id": 584,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "ETERNITY_BAND_CONFIGURATOR",
          "api_endpoint": "side-setting-image/:config_type",
          "id_menu_item": 119,
          "company_info_id": 1
        },
        {
          "id": 585,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "ETERNITY_BAND_CONFIGURATOR",
          "api_endpoint": "/side-setting-image/:config_type",
          "id_menu_item": 119,
          "company_info_id": 1
        },
        {
          "id": 586,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/config-master-list",
          "id_menu_item": 120,
          "company_info_id": 1
        },
        {
          "id": 587,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "BRACELET_CONFIGURATOR",
          "api_endpoint": "/configurator-master/:config_type",
          "id_menu_item": 120,
          "company_info_id": 1
        },
        {
          "id": 588,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "BRACELET_CONFIGURATOR",
          "api_endpoint": "side-setting-image/:config_type",
          "id_menu_item": 120,
          "company_info_id": 1
        },
        {
          "id": 589,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "BRACELET_CONFIGURATOR",
          "api_endpoint": "/side-setting-image/:config_type",
          "id_menu_item": 120,
          "company_info_id": 1
        },
        {
          "id": 590,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/config-master-list",
          "id_menu_item": 121,
          "company_info_id": 1
        },
        {
          "id": 591,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "PENDANT_CONFIGURATOR",
          "api_endpoint": "/configurator-master/:config_type",
          "id_menu_item": 121,
          "company_info_id": 1
        },
        {
          "id": 592,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "PENDANT_CONFIGURATOR",
          "api_endpoint": "side-setting-image/:config_type",
          "id_menu_item": 121,
          "company_info_id": 1
        },
        {
          "id": 593,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "PENDANT_CONFIGURATOR",
          "api_endpoint": "/side-setting-image/:config_type",
          "id_menu_item": 121,
          "company_info_id": 1
        },
        {
          "id": 594,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/config-master-list",
          "id_menu_item": 122,
          "company_info_id": 1
        },
        {
          "id": 595,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "EARRING_CONFIGURATOR",
          "api_endpoint": "/configurator-master/:config_type",
          "id_menu_item": 122,
          "company_info_id": 1
        },
        {
          "id": 596,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "EARRING_CONFIGURATOR",
          "api_endpoint": "side-setting-image/:config_type",
          "id_menu_item": 122,
          "company_info_id": 1
        },
        {
          "id": 597,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "EARRING_CONFIGURATOR",
          "api_endpoint": "/side-setting-image/:config_type",
          "id_menu_item": 122,
          "company_info_id": 1
        },
        {
          "id": 598,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/tax",
          "id_menu_item": 123,
          "company_info_id": 1
        },
        {
          "id": 599,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/tax/:id",
          "id_menu_item": 123,
          "company_info_id": 1
        },
        {
          "id": 600,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/tax/add",
          "id_menu_item": 123,
          "company_info_id": 1
        },
        {
          "id": 601,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/tax/edit",
          "id_menu_item": 123,
          "company_info_id": 1
        },
        {
          "id": 602,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/tax/delete",
          "id_menu_item": 123,
          "company_info_id": 1
        },
        {
          "id": 603,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/tax/status",
          "id_menu_item": 123,
          "company_info_id": 1
        },
        {
          "id": 604,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/attribute/metal-rate/:metal_id",
          "id_menu_item": 124,
          "company_info_id": 1
        },
        {
          "id": 605,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/page",
          "id_menu_item": 125,
          "company_info_id": 1
        },
        {
          "id": 606,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/page/:id",
          "id_menu_item": 125,
          "company_info_id": 1
        },
        {
          "id": 607,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/page",
          "id_menu_item": 125,
          "company_info_id": 1
        },
        {
          "id": 608,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "page",
          "id_menu_item": 125,
          "company_info_id": 1
        },
        {
          "id": 609,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/page/:id",
          "id_menu_item": 125,
          "company_info_id": 1
        },
        {
          "id": 610,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/restrict-page/:id",
          "id_menu_item": 125,
          "company_info_id": 1
        },
        {
          "id": 611,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/page/:id",
          "id_menu_item": 125,
          "company_info_id": 1
        },
        {
          "id": 612,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/meta-data",
          "id_menu_item": 126,
          "company_info_id": 1
        },
        {
          "id": 613,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/meta-data/:id",
          "id_menu_item": 126,
          "company_info_id": 1
        },
        {
          "id": 614,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/meta-data",
          "id_menu_item": 126,
          "company_info_id": 1
        },
        {
          "id": 615,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/meta-data/:id",
          "id_menu_item": 126,
          "company_info_id": 1
        },
        {
          "id": 616,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/meta-data/:id",
          "id_menu_item": 126,
          "company_info_id": 1
        },
        {
          "id": 617,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/meta-data/:id",
          "id_menu_item": 126,
          "company_info_id": 1
        },
        {
          "id": 618,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/activity-log",
          "id_menu_item": 127,
          "company_info_id": 1
        },
        {
          "id": 619,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/store-address",
          "id_menu_item": 128,
          "company_info_id": 1
        },
        {
          "id": 620,
          "id_action": 9,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/store-address/:id",
          "id_menu_item": 128,
          "company_info_id": 1
        },
        {
          "id": 621,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/store-address/:id",
          "id_menu_item": 128,
          "company_info_id": 1
        },
        {
          "id": 622,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/currency/:id",
          "id_menu_item": 129,
          "company_info_id": 1
        },
        {
          "id": 623,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/currency",
          "id_menu_item": 129,
          "company_info_id": 1
        },
        {
          "id": 624,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/currency/default/:id",
          "id_menu_item": 129,
          "company_info_id": 1
        },
        {
          "id": 625,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/country/add",
          "id_menu_item": 130,
          "company_info_id": 1
        },
        {
          "id": 626,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/country",
          "id_menu_item": 130,
          "company_info_id": 1
        },
        {
          "id": 627,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/country/:id",
          "id_menu_item": 130,
          "company_info_id": 1
        },
        {
          "id": 628,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/country/edit",
          "id_menu_item": 130,
          "company_info_id": 1
        },
        {
          "id": 629,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/country/delete",
          "id_menu_item": 130,
          "company_info_id": 1
        },
        {
          "id": 630,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/country/status",
          "id_menu_item": 130,
          "company_info_id": 1
        },
        {
          "id": 631,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/state/add",
          "id_menu_item": 131,
          "company_info_id": 1
        },
        {
          "id": 632,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/state",
          "id_menu_item": 131,
          "company_info_id": 1
        },
        {
          "id": 633,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/state/:id",
          "id_menu_item": 131,
          "company_info_id": 1
        },
        {
          "id": 634,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/state/edit",
          "id_menu_item": 131,
          "company_info_id": 1
        },
        {
          "id": 635,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/state/delete",
          "id_menu_item": 131,
          "company_info_id": 1
        },
        {
          "id": 636,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/state/status",
          "id_menu_item": 131,
          "company_info_id": 1
        },
        {
          "id": 637,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "city",
          "api_endpoint": "/city/add",
          "id_menu_item": 132,
          "company_info_id": 1
        },
        {
          "id": 638,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "city",
          "api_endpoint": "/city",
          "id_menu_item": 132,
          "company_info_id": 1
        },
        {
          "id": 639,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "city",
          "api_endpoint": "/city/:id",
          "id_menu_item": 132,
          "company_info_id": 1
        },
        {
          "id": 640,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "city",
          "api_endpoint": "/city/edit",
          "id_menu_item": 132,
          "company_info_id": 1
        },
        {
          "id": 641,
          "id_action": 9,
          "is_active": "1",
          "http_method": 2,
          "master_type": "city",
          "api_endpoint": "/city/delete",
          "id_menu_item": 132,
          "company_info_id": 1
        },
        {
          "id": 642,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "city",
          "api_endpoint": "/city/status",
          "id_menu_item": 132,
          "company_info_id": 1
        },
        {
          "id": 643,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/general",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 644,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/general/company-info",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 645,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/general/logos",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 646,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/general/script",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 647,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/general/system-color",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 648,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/general/font-style",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 649,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/general/setting",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 650,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/general/setting",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 651,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/general/font-style-file/:font/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 652,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/attribute/metal-tone",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 653,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "header",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 654,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "footer",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 655,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "home_page",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 656,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "product_card",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 657,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "login",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 658,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "registration",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 659,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "product_filter",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 660,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "product_detail",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 661,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "create_your_own",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 662,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "toast",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 663,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "button",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 664,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "cart",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 665,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "checkout",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 666,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "profile",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 667,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "verified_otp",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 668,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": "configurator_detail",
          "api_endpoint": "/theme",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 669,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "header",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 670,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "footer",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 671,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "home_page",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 672,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "product_card",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 673,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "login",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 674,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "registration",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 675,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "product_filter",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 676,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "product_detail",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 677,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "create_your_own",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 678,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "toast",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 679,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "button",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 680,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "cart",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 681,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "checkout",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 683,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "verified_otp",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 684,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": "configurator_detail",
          "api_endpoint": "/theme/:section_type",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 685,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "header",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 686,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "footer",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 687,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "home_page",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 688,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "product_card",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 689,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "login",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 690,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "registration",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 691,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "product_filter",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 692,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "product_detail",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 693,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "create_your_own",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 694,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "toast",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 695,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "button",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 696,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "cart",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 697,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "checkout",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 698,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "profile",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 699,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "verified_otp",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 700,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "configurator_detail",
          "api_endpoint": "/theme/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 701,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "header",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 702,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "footer",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 703,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "home_page",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 704,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "product_card",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 705,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "login",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 706,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "registration",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 707,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "product_filter",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 708,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "product_detail",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 709,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "create_your_own",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 710,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "toast",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 711,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "button",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 712,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "cart",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 713,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "checkout",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 714,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "profile",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 715,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "verified_otp",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 716,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": "configurator_detail",
          "api_endpoint": "/theme-select/:id",
          "id_menu_item": 133,
          "company_info_id": 1
        },
        {
          "id": 717,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/mega-menu",
          "id_menu_item": 134,
          "company_info_id": 1
        },
        {
          "id": 718,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/mega-menu",
          "id_menu_item": 134,
          "company_info_id": 1
        },
        {
          "id": 719,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/mega-menu/:id",
          "id_menu_item": 134,
          "company_info_id": 1
        },
        {
          "id": 720,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/mega-menu/:id",
          "id_menu_item": 134,
          "company_info_id": 1
        },
        {
          "id": 721,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/mega-menu/:id",
          "id_menu_item": 134,
          "company_info_id": 1
        },
        {
          "id": 722,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/mega-menu-attribute",
          "id_menu_item": 134,
          "company_info_id": 1
        },
        {
          "id": 723,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/mega-menu-attribute",
          "id_menu_item": 134,
          "company_info_id": 1
        },
        {
          "id": 724,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/mega-menu-attribute/:id",
          "id_menu_item": 134,
          "company_info_id": 1
        },
        {
          "id": 725,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/mega-menu-attribute/:id",
          "id_menu_item": 134,
          "company_info_id": 1
        },
        {
          "id": 726,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/mega-menu-attribute/:id",
          "id_menu_item": 134,
          "company_info_id": 1
        },
        {
          "id": 727,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/mega-menu-attribute/:id_menu",
          "id_menu_item": 134,
          "company_info_id": 1
        },
        {
          "id": 728,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/mega-menu-attribute",
          "id_menu_item": 134,
          "company_info_id": 1
        },
        {
          "id": 729,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/filter-masters",
          "id_menu_item": 135,
          "company_info_id": 1
        },
        {
          "id": 730,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/filter/:id",
          "id_menu_item": 135,
          "company_info_id": 1
        },
        {
          "id": 731,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/filter",
          "id_menu_item": 135,
          "company_info_id": 1
        },
        {
          "id": 732,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/filter",
          "id_menu_item": 135,
          "company_info_id": 1
        },
        {
          "id": 733,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/filter/:id",
          "id_menu_item": 135,
          "company_info_id": 1
        },
        {
          "id": 734,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/user/filter",
          "id_menu_item": 135,
          "company_info_id": 1
        },
        {
          "id": 735,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/email-template",
          "id_menu_item": 136,
          "company_info_id": 1
        },
        {
          "id": 736,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/email-template/:id",
          "id_menu_item": 136,
          "company_info_id": 1
        },
        {
          "id": 737,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/email-template",
          "id_menu_item": 136,
          "company_info_id": 1
        },
        {
          "id": 738,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/email-template/:id",
          "id_menu_item": 136,
          "company_info_id": 1
        },
        {
          "id": 739,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/email-template/:id",
          "id_menu_item": 136,
          "company_info_id": 1
        },
        {
          "id": 740,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/email-template/:id",
          "id_menu_item": 136,
          "company_info_id": 1
        },
        {
          "id": 741,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/email-template",
          "id_menu_item": 137,
          "company_info_id": 1
        },
        {
          "id": 742,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/email-template/:id",
          "id_menu_item": 137,
          "company_info_id": 1
        },
        {
          "id": 743,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/email-template",
          "id_menu_item": 137,
          "company_info_id": 1
        },
        {
          "id": 744,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/email-template/:id",
          "id_menu_item": 137,
          "company_info_id": 1
        },
        {
          "id": 745,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/email-template/:id",
          "id_menu_item": 137,
          "company_info_id": 1
        },
        {
          "id": 746,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/email-template/:id",
          "id_menu_item": 137,
          "company_info_id": 1
        },
        {
          "id": 747,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/client-manage",
          "id_menu_item": 138,
          "company_info_id": 1
        },
        {
          "id": 748,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/client-manage/:company_key",
          "id_menu_item": 138,
          "company_info_id": 1
        },
        {
          "id": 749,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/client-manage",
          "id_menu_item": 138,
          "company_info_id": 1
        },
        {
          "id": 750,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/client-manage/:company_key",
          "id_menu_item": 138,
          "company_info_id": 1
        },
        {
          "id": 751,
          "id_action": 9,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/client-manage/:company_key",
          "id_menu_item": 138,
          "company_info_id": 1
        },
        {
          "id": 752,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/general/setting",
          "id_menu_item": 139,
          "company_info_id": 1
        },
        {
          "id": 753,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/general/setting",
          "id_menu_item": 139,
          "company_info_id": 1
        },
        {
          "id": 754,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/configurator-setting",
          "id_menu_item": 140,
          "company_info_id": 1
        },
        {
          "id": 755,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/configurator-setting",
          "id_menu_item": 140,
          "company_info_id": 1
        },
        {
          "id": 756,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/configurator-setting/:id",
          "id_menu_item": 140,
          "company_info_id": 1
        },
        {
          "id": 757,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/configurator-setting/:id",
          "id_menu_item": 140,
          "company_info_id": 1
        },
        {
          "id": 758,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/configurator-setting/:id",
          "id_menu_item": 140,
          "company_info_id": 1
        },
        {
          "id": 759,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/admin/configurator-setting/:ids",
          "id_menu_item": 140,
          "company_info_id": 1
        },
        {
          "id": 760,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/configurator-setting-file",
          "id_menu_item": 141,
          "company_info_id": 1
        },
        {
          "id": 761,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/configurator-setting-file/:config_id",
          "id_menu_item": 141,
          "company_info_id": 1
        },
        {
          "id": 762,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/configurator-setting-file/:id",
          "id_menu_item": 141,
          "company_info_id": 1
        },
        {
          "id": 763,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/configurator-setting-common-file",
          "id_menu_item": 141,
          "company_info_id": 1
        },
        {
          "id": 764,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/configurator-setting-common-file",
          "id_menu_item": 141,
          "company_info_id": 1
        },
        {
          "id": 765,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/theme/:company_key",
          "id_menu_item": 141,
          "company_info_id": 1
        },
        {
          "id": 766,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/user/configurator-setting/:company_key",
          "id_menu_item": 141,
          "company_info_id": 1
        },
        {
          "id": 767,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-slider",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 768,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-slider",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 769,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-slider",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 770,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-slider",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 771,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-slider",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 772,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-top",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 773,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-top",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 774,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-top",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 775,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-top",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 776,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-top",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 777,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-bottom",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 778,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-bottom",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 779,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-bottom",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 780,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-bottom",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 781,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-seven/offer-bottom",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 782,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-seven/attractive-jewellery",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 783,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-seven/attractive-jewellery",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 784,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-seven/attractive-jewellery",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 785,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-seven/attractive-jewellery",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 786,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-seven/attractive-jewellery",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 787,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-seven/stunning-jewelry",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 788,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-seven/stunning-jewelry",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 789,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-seven/stunning-jewelry",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 790,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-seven/stunning-jewelry",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 791,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-seven/stunning-jewelry",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 792,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-seven/product",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 793,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-seven/product",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 794,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-seven/product",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 795,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-seven/product",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 796,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-seven/product",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 797,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-seven/product-and-category",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 798,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-seven/product-and-category",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 799,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-seven/product-and-category",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 800,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-seven/product-and-category",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 801,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-seven/product-and-category",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 802,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-seven/dazzling-and-stylish",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 803,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-seven/dazzling-and-stylish",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 804,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-seven/dazzling-and-stylish",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 805,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-seven/dazzling-and-stylish",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 806,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-seven/dazzling-and-stylish",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 807,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-seven/testimonials",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 808,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-seven/testimonials",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 809,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-seven/testimonials",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 810,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-seven/testimonials",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 811,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-seven/testimonials",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 812,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-seven/testimonials-details",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 813,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-seven/testimonials-details",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 814,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-seven/testimonials-details",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 815,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-seven/testimonials-details",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 816,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-seven/testimonials-details",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 817,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-seven/lominous-design",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 818,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-seven/lominous-design",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 819,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-seven/lominous-design",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 820,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-seven/lominous-design",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 821,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-seven/lominous-design",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 822,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-seven/jewellery-calegories",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 823,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-seven/jewellery-calegories",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 824,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-seven/jewellery-calegories",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 825,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-seven/jewellery-calegories",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 826,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-seven/jewellery-calegories",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 827,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-seven/stunning-design",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 828,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-seven/stunning-design",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 829,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-seven/stunning-design",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 830,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-seven/stunning-design",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 831,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-seven/stunning-design",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 832,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/template-seven/festive-sale-offer",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 833,
          "id_action": 7,
          "is_active": "1",
          "http_method": 2,
          "master_type": null,
          "api_endpoint": "/template-seven/festive-sale-offer",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 834,
          "id_action": 8,
          "is_active": "1",
          "http_method": 3,
          "master_type": null,
          "api_endpoint": "/template-seven/festive-sale-offer",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 835,
          "id_action": 9,
          "is_active": "1",
          "http_method": 4,
          "master_type": null,
          "api_endpoint": "/template-seven/festive-sale-offer",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 836,
          "id_action": 8,
          "is_active": "1",
          "http_method": 5,
          "master_type": null,
          "api_endpoint": "/template-seven/festive-sale-offer",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 837,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/add-product/dropDown/list",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 838,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/product-sku",
          "id_menu_item": 142,
          "company_info_id": 1
        },
        {
          "id": 839,
          "id_action": 6,
          "is_active": "1",
          "http_method": 1,
          "master_type": null,
          "api_endpoint": "/email-log",
          "id_menu_item": 143,
          "company_info_id": 1
        }
      ])
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('role_api_permissions', null, {});
  }
};

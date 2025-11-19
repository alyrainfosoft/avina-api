'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const value = await queryInterface.sequelize.query(`SELECT * FROM currency_rates`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (!value || value.length == 0) {
      await queryInterface.bulkInsert('currency_rates', [
        {
          "id": 1,
          "currency": "USD",
          "rate": "1",
          "created_date": new Date(),
          "modified_date": null,
          "is_active": "1",
          "is_deleted": "0",
          "created_by": null,
          "modified_by": null,
          "is_default": "1",
          "symbol_placement": "left",
          "symbol": "$",
          "code": "USD",
          "decimal_token": ".",
          "thousand_token": ",",
          "is_use_api": "0",
          "exchange_rate_type": "manually",
          "api_url": null,
          "api_key": "",
          "company_info_id": 1
        }
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('currency_rates', null, {});
  }
};

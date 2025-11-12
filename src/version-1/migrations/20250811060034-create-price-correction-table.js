'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create an ENUM type
      await queryInterface.sequelize.query(`
      CREATE TYPE public.price_correction_product_type AS ENUM
          ('dynamic_product', 'choose_setting_product', 'ring_configurator',
           'three_stone_configurator', 'eternity_band_configurator',
            'bracelet_configurator', 'stud_configurator', 'pendant_configurator'
             );
        `)
    await queryInterface.createTable('price_corrections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      round_off: {
        type: Sequelize.INTEGER
      },
      product_type: {
        type: 'price_correction_product_type'
      },
      created_date: {
        type: Sequelize.DATE
      },
      modified_date: {
        type: Sequelize.DATE
      },
      is_active: {
        type: 'bit',
        defaultValue: '1'
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'app_users',
          key: 'id'
        }
      },
      modified_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'app_users',
          key: 'id'
        }
      },
      company_info_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'company_infoes',
          key: 'id'
        }
      }
    })
  },

  async down(queryInterface, Sequelize) {
     await queryInterface.sequelize.query(`
      DROP TYPE price_correction_product_type;
    `);
    await queryInterface.dropTable('price_corrections');

  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'offers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      offer_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      offer_name: {
        type: 'character varying',
        allowNull: false,
      },
      coupon_code: {
        type: 'character varying'
      },
      method: {
        type: 'character varying'
      },
      product_type: {
        type: 'character varying',
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      image: {
        type: 'character varying',
        allowNull: true
      },
      link: {
        type: 'character varying',
        allowNull: true,
      },
      discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      discount_type: {
        type: 'character varying',
        allowNull: true,
      },
      maximum_discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
      },
      per_user_usage_limit: {
        type: 'character varying',
        allowNull: true,
      },
      total_number_of_usage_limit: {
        type: 'character varying',
        allowNull: true,
      },
      all_user: {
        type: 'character varying',
        defaultValue: '0',
      },
      specific_user_segments: {
        type: 'character varying',
        defaultValue: '0',
      },
      specific_user: {
        type: 'character varying',
        defaultValue: '0',
      },
      start_date: {
        type: Sequelize.DATE,
      },
      start_time: {
        type: Sequelize.TIME,
      },
      every_week_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      day_start_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      day_end_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      days: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      product_type_offer_combination: {
        type: 'character varying',
        defaultValue: '0',
      },
      order_type_offer_combination: {
        type: 'character varying',
        defaultValue: '0',
      },
      is_active: {
        type: 'character varying',
        defaultValue: '1',
      },
      is_deleted: {
        type: 'character varying',
        defaultValue: '0',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      updated_at: {
        type:Sequelize. DATE,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'app_users',
          key: 'id',
        }
      },
      updated_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'app_users',
          key: 'id',
        }
      },
      cart_total_amount: {
        type: Sequelize.DECIMAL(10, 0),
      },
      cart_total_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      bxgy_customer_buys_quantity: {
        type: Sequelize.INTEGER
      },
      bxgy_customer_gets_quantity: {
        type: Sequelize.INTEGER
      },
      bxgy_discount_value_type: {
        type: 'character varying',
      },
      bxgy_discount_value: {
        type: Sequelize.DECIMAL(10, 2),
      },
      bxgy_allocation_limit: {
        type: Sequelize.INTEGER
      },
      company_info_id: {
        type: Sequelize.INTEGER,
      }
    }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('offers');
  }
};

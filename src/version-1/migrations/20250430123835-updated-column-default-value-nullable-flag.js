'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
  //   // Change column types
    await queryInterface.changeColumn('diamond_shapes', 'is_diamond', {
      type: Sequelize.JSONB,
      allowNull: true,  
    });

    await queryInterface.changeColumn('diamond_shapes', 'sort_order', {
      type: Sequelize.JSONB,
      allowNull: true,  
    });

    await queryInterface.changeColumn('diamond_shapes', 'diamond_size_id', {
      type: Sequelize.JSONB,
      allowNull: true,  
    });

    await queryInterface.changeColumn('enquiries', 'time', {
      type: Sequelize.TIME,
      allowNull: true,  
    });

    await queryInterface.changeColumn('product_enquiries', 'time', {
      type: Sequelize.TIME,
      allowNull: true,  
    });

  await queryInterface.removeColumn('role_permission_access_audit_logs', 'old_value');
  await queryInterface.removeColumn('role_permission_access_audit_logs', 'new_value');

  await queryInterface.addColumn('role_permission_access_audit_logs', 'old_value', {
    type:'bit(1)',
    allowNull: true,
  });

  await queryInterface.addColumn('role_permission_access_audit_logs', 'new_value', {
    type:'bit(1)',
    allowNull: true,  
  });
    await queryInterface.changeColumn('currency_rates', 'decimal_token', {
      type: Sequelize.STRING,
      defaultValue: '.',
      allowNull: true, 
    });

    await queryInterface.changeColumn('currency_rates', 'thousand_token', {
      type: Sequelize.STRING,
      defaultValue: ',',
      allowNull: true, 
    });

    await queryInterface.changeColumn('currency_rates', 'is_use_api', {
      type: 'bit(1)',
      defaultValue: Sequelize.literal("'0'::bit(1)"), 
      allowNull: true, 
    });

    await queryInterface.changeColumn('currency_rates', 'exchange_rate_type', {
      type: Sequelize.STRING,
      defaultValue: 'manually',
      allowNull: true, 
    });

    await queryInterface.changeColumn('customer_users', 'sign_up_type', {
      type: Sequelize.STRING,
      defaultValue: 'system',
      allowNull: true, 
    });

    await queryInterface.changeColumn('filters', 'item_scope', {
      type: Sequelize.STRING,
      defaultValue: 'product',
      allowNull: true, 
    });

    await queryInterface.changeColumn('template_six', 'is_active', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'1'::bit(1)"),  
    });

    await queryInterface.changeColumn('template_six', 'is_deleted', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'0'::bit(1)"), 
    });

    await queryInterface.changeColumn('banners', 'is_active', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'0'::bit(1)"), 
    });

    await queryInterface.changeColumn('banners', 'is_deleted', {
      type: 'bit(1)',
      defaultValue: Sequelize.literal("'0'::bit(1)"), 
    });

    await queryInterface.changeColumn('filters', 'item_scope', {
      type: Sequelize.STRING,
      defaultValue: 'product',
      allowNull: true, 
    });

    // Modify nullable columns (to NOT NULL)
    await queryInterface.changeColumn('setting_carat_weights', 'is_active', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'1'::bit(1)"),  
    });

    await queryInterface.changeColumn('setting_carat_weights', 'is_deleted', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'0'::bit(1)"), 
    });

    await queryInterface.changeColumn('setting_styles', 'is_active', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'1'::bit(1)"),  
    });

    await queryInterface.changeColumn('setting_styles', 'is_deleted', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'0'::bit(1)"), 
    });

    await queryInterface.changeColumn('states', 'is_active', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'1'::bit(1)"),  
    });

    await queryInterface.changeColumn('states', 'is_deleted', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'0'::bit(1)"), 
    });

    await queryInterface.changeColumn('static_pages', 'is_active', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'1'::bit(1)"),  
    });

    await queryInterface.changeColumn('static_pages', 'is_deleted', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'0'::bit(1)"), 
    });

    await queryInterface.changeColumn('tax_masters', 'is_active', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'1'::bit(1)"),  
    });

    await queryInterface.changeColumn('tax_masters', 'is_deleted', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'0'::bit(1)"), 
    });

    await queryInterface.changeColumn('metal_group_masters', 'is_active', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'1'::bit(1)"),  
    });

    await queryInterface.changeColumn('metal_group_masters', 'is_deleted', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'0'::bit(1)"), 
    });

    await queryInterface.changeColumn('configurator_setting', 'is_active', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'1'::bit(1)"),  
    });

    await queryInterface.changeColumn('configurator_setting', 'is_deleted', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'0'::bit(1)"), 
    });

    await queryInterface.changeColumn('birthstone_product_metal_options', 'is_deleted', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'0'::bit(1)"), 
    });

    await queryInterface.changeColumn('mm_sizes', 'is_active', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'1'::bit(1)"),  
    });

    await queryInterface.changeColumn('mm_sizes', 'is_deleted', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'0'::bit(1)"), 
    });

    await queryInterface.changeColumn('our_stories', 'is_active', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'1'::bit(1)"),  
    });

    await queryInterface.changeColumn('our_stories', 'is_deleted', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'0'::bit(1)"), 
    });

    await queryInterface.changeColumn('product_reviews', 'is_approved', {
      type: 'bit(1)',
      allowNull: false,  
      defaultValue: Sequelize.literal("'1'::bit(1)"),  
    });
  },

  async down(queryInterface, Sequelize) {
// nothing need to droup
  }
};

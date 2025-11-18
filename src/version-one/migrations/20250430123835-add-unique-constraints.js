
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addConstraint('auth_group', {
      fields: ['name'],
      type: 'unique',
      name: 'auth_group_name_key'
    }),
      queryInterface.addConstraint('auth_group_permissions', {
      fields: ['permission_id','group_id'],
      type: 'unique',
      name: 'auth_group_permissions_group_id_permission_id_0cd325b0_uniq'
    }),
      queryInterface.addConstraint('auth_permission', {
      fields: ['content_type_id','codename'],
      type: 'unique',
      name: 'auth_permission_content_type_id_codename_01ab375a_uniq'
    }),

      queryInterface.addConstraint('auth_user', {
      fields: ['username'],
      type: 'unique',
      name: 'auth_user_username_key'
    }),
      queryInterface.addConstraint('auth_user_groups', {
      fields: ['user_id','group_id'],
      type: 'unique',
      name: 'auth_user_groups_user_id_group_id_94350c0c_uniq'
    }),

      queryInterface.addConstraint('auth_user_user_permissions', {
      fields: ['permission_id','user_id'],
      type: 'unique',
      name: 'auth_user_user_permissions_user_id_permission_id_14a6b632_uniq'
    }),

      queryInterface.addConstraint('role_api_permissions', {
      fields: ['id_menu_item','api_endpoint','http_method','master_type', 'company_info_id'],
      type: 'unique',
      name: 'unq_api_endpoint_http_method'
    }),
    
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeConstraint('auth_group', 'auth_group_name_key'),
      queryInterface.removeConstraint('auth_group_permissions', 'auth_group_permissions_group_id_permission_id_0cd325b0_uniq'),
      queryInterface.removeConstraint('auth_permission', 'auth_permission_content_type_id_codename_01ab375a_uniq'),
      queryInterface.removeConstraint('auth_user', 'auth_user_username_key'),
      queryInterface.removeConstraint('auth_user_groups', 'auth_user_groups_user_id_group_id_94350c0c_uniq'),
      queryInterface.removeConstraint('auth_user_user_permissions', 'auth_user_user_permissions_user_id_permission_id_14a6b632_uniq'),
      queryInterface.removeConstraint('role_api_permissions', 'unq_api_endpoint_http_method'),
 
    ]);
  }
};

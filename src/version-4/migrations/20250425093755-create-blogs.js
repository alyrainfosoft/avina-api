
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blogs', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      meta_title: {
  allowNull: false,
  type: 'character varying',
},
      meta_description: {
  allowNull: false,
  type: 'character varying',
},
      meta_keywords: {
  allowNull: false,
  type: 'character varying',
},
      name: {
  allowNull: false,
  type: 'character varying',
},
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      id_banner_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      slug: {
  allowNull: false,
  type: 'character varying',
},
      description: {
  allowNull: false,
  type: 'character varying',
},
      author: {
  allowNull: false,
  type: 'character varying',
},
      publish_date: {
  allowNull: false,
  type: Sequelize.DATE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      is_status: {
  allowNull: false,
  type: Sequelize.CHAR(1),
},
      is_deleted: {
        allowNull: false,
  type: 'bit(1)',
},
      is_default: {
  allowNull: true,
  default:'0',
  type: 'bit(1)',
},
      id_category: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      sort_des: {
  allowNull: true,
  type: 'character varying',
},
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('blogs');
  }
};

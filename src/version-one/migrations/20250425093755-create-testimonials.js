
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('testimonials', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      person_name: {
  allowNull: false,
  type: 'character varying(50)',
},
      designation: {
  allowNull: false,
  type: 'character varying(100)',
},
      text: {
  allowNull: false,
  type: 'character varying(2000)',
},
      id_image: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
     is_active: {
  default:'0',
  type: 'bit(1)',
},
      is_deleted: {
  default:'0',
  type: 'bit(1)',
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
      company_info_id: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('testimonials');
  }
};

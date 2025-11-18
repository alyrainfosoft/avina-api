
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
     // Create an ENUM type
   await queryInterface.sequelize.query(`
    CREATE TYPE public.menu_type AS ENUM
        ('header', 'footer');  `);

    await queryInterface.createTable('mega_menus', {
      id: {
  allowNull: false,
  primaryKey: true,
  autoIncrement: true,
  autoIncrementIdentity: true,
  type: Sequelize.INTEGER,
},
      name: {
  allowNull: true,
  type: 'character varying',
},
      menu_type: {
  allowNull: false,
  type: 'menu_type',
},
     is_active: {
  default:'1',
  type: 'bit(1)',
},
      is_deleted: {
  allowNull: true,
  default:'0',
  type: 'bit(1)',
},
      created_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      created_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      modified_date: {
  allowNull: true,
  type: Sequelize.DATE,
},
      modified_by: {
  allowNull: true,
  type: Sequelize.INTEGER,
},
      company_info_id: {
  allowNull: false,
  type: Sequelize.INTEGER,
},
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('mega_menus');

    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE menu_type;
    `);
  }
};

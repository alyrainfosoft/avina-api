/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Disable foreign key checks in PostgreSQL
 // Drop foreign key constraints that are dependent on the tables you're trying to drop

 await queryInterface.sequelize.query(`
  ALTER TABLE auth_permission DROP CONSTRAINT IF EXISTS fk_auth_permission_content_type_id;
`);
    // Drop each table forcefully
    await queryInterface.dropTable('django_admin_log');
    await queryInterface.dropTable('django_content_type');
    await queryInterface.dropTable('django_migrations');
    await queryInterface.dropTable('django_session');
  },

  async down(queryInterface, Sequelize) {
    // Optionally, you can recreate the tables if needed
  }
};

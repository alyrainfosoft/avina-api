'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const value = await queryInterface.sequelize.query(`SELECT * FROM app_users`, { type: queryInterface.sequelize.QueryTypes.SELECT });
   if(!value || value.length == 0){
     await queryInterface.bulkInsert('app_users', [
  {
    "id":1,
    "username": "superadmin@tcc.com",
    "pass_hash": "$2b$10$6xqKa28hJhOUGwPbS3LT.OtfpT9i8Kjqysj7I8ESaM7J39DRtDrnq",
    "user_type": 1,
    "user_status": 2,
    "refresh_token": "dummy refresh token",
    "pass_reset_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzIxMTkwNTU5LCJleHAiOjE3MjExOTA2MTl9.RpOtiaTM7xUp7z2cMDrcotdkzLLHjDAxRhlO4I0ljBk",
    "one_time_pass": "642103",
    "resend_otp_count": null,
    "last_login_date": null,
    "firebase_device_token": null,
    "is_active": "1",
    "is_email_verified": "1",
    "is_deleted": "0",
    "approved_by": null,
    "approved_date": null,
    "created_by": null,
    "created_date": new Date(),
    "modified_by": 1,
    "modified_date": "2024-07-17T04:29:19.600Z",
    "id_role": 0,
    "otp_create_date": "2025-04-14T07:35:31.471Z",
    "otp_expire_date": "2025-04-14T07:36:31.471Z",
    "is_super_admin": false,
    "company_info_id": 1
  }
]);
   }
    
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('app_users', null, {});
  }
};

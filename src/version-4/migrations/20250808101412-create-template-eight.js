'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1
              FROM pg_enum
              WHERE enumlabel = 'section'
                AND enumtypid = (
                    SELECT oid FROM pg_type WHERE typname = 'log_type'
                )
          ) THEN
              ALTER TYPE public.log_type ADD VALUE 'section';
          END IF;
      END$$;
      `);


    await queryInterface.sequelize.query(`CREATE TABLE IF NOT EXISTS public.template_eight
(
    id INTEGER GENERATED ALWAYS AS IDENTITY,
    title character varying(255) COLLATE pg_catalog."default",
    sub_title character varying(255) COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    sub_description text COLLATE pg_catalog."default",
    title_color character varying(255) COLLATE pg_catalog."default",
    sub_title_color character varying(255) COLLATE pg_catalog."default",
    description_color character varying(255) COLLATE pg_catalog."default",
    sub_description_color character varying(255) COLLATE pg_catalog."default",
    link character varying(255) COLLATE pg_catalog."default",
    button_name character varying(255) COLLATE pg_catalog."default",
    button_color character varying(255) COLLATE pg_catalog."default",
    button_text_color character varying(255) COLLATE pg_catalog."default",
    is_button_transparent character varying(50) COLLATE pg_catalog."default",
    button_hover_color character varying(255) COLLATE pg_catalog."default",
    button_text_hover_color character varying(255) COLLATE pg_catalog."default",
    sort_order double precision,
    id_title_image integer,
    product_ids json,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    is_active character varying(50) COLLATE pg_catalog."default",
    is_deleted character varying(50) COLLATE pg_catalog."default",
    created_by integer,
    created_date timestamp without time zone,
    modified_by integer,
    modified_date timestamp without time zone,
    company_info_id integer,
    CONSTRAINT template_eight_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.template_eight
    OWNER to postgres;`, {
       type: Sequelize.QueryTypes.RAW
     });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS public.template_eight;`, {
      type: Sequelize.QueryTypes.RAW
    }); 
  }
};

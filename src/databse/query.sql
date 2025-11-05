ALTER TABLE IF EXISTS public.metal_masters
    ADD COLUMN is_config bit DEFAULT '0';

ALTER TABLE IF EXISTS public.gold_kts
    ADD COLUMN is_config bit DEFAULT '0';

ALTER TABLE IF EXISTS public.order_details
    ADD COLUMN id bigint NOT NULL GENERATED ALWAYS AS IDENTITY;
ALTER TABLE IF EXISTS public.order_details DROP CONSTRAINT IF EXISTS order_details_pkey;

ALTER TABLE IF EXISTS public.order_details
    ADD PRIMARY KEY (id);

ALTER TABLE IF EXISTS public.cart_products
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE IF EXISTS public.products
    ADD COLUMN quantity bigint;

ALTER TABLE IF EXISTS public.products
    ADD COLUMN id_brand integer;

ALTER TABLE IF EXISTS public.products
    ADD COLUMN id_collection character varying;
ALTER TABLE IF EXISTS public.products
    ADD CONSTRAINT fk_products_id_brand FOREIGN KEY (id_brand)
    REFERENCES public.brands (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.products
    ADD COLUMN is_quantity_track boolean NOT NULL DEFAULT false;

ALTER TABLE IF EXISTS public.product_metal_options
    ADD COLUMN id_size integer;

ALTER TABLE IF EXISTS public.product_metal_options
    ADD COLUMN id_length integer;

ALTER TABLE IF EXISTS public.product_metal_options
    ADD COLUMN quantity bigint;

ALTER TABLE IF EXISTS public.product_metal_options
    ADD COLUMN side_dia_weight double precision;

ALTER TABLE IF EXISTS public.product_metal_options
    ADD COLUMN side_dia_count bigint;

ALTER TABLE IF EXISTS public.product_metal_options
    ADD COLUMN remaing_quantity_count bigint;

ALTER TABLE IF EXISTS public.product_metal_options
    ADD COLUMN id_m_tone integer;
ALTER TABLE IF EXISTS public.product_metal_options
    ADD CONSTRAINT fk_pmo_size_id FOREIGN KEY (id_size)
    REFERENCES public.items_sizes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.product_metal_options
    ADD CONSTRAINT fk_pmo_length_id FOREIGN KEY (id_length)
    REFERENCES public.items_lengths (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.product_metal_options
    ADD CONSTRAINT fk_pmo_id_m_tone FOREIGN KEY (id_m_tone)
    REFERENCES public.metal_tones (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

CREATE TABLE IF NOT EXISTS public.collections
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying COLLATE pg_catalog.default NOT NULL,
    slug character varying COLLATE pg_catalog.default NOT NULL,
    is_active bit(1) NOT NULL,
    created_date timestamp without time zone,
    modified_date timestamp without time zone,
    created_by integer,
    modified_by integer,
    is_deleted bit(1) NOT NULL,
    CONSTRAINT collection_pkey PRIMARY KEY (id),
    CONSTRAINT created_by_user_id FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT modified_by_user_id FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.collections
    OWNER to postgres;

ALTER TABLE IF EXISTS public.wishlist_products DROP COLUMN IF EXISTS product_id;

ALTER TABLE IF EXISTS public.wishlist_products
    RENAME user_id TO id;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN product_type integer NOT NULL;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN product_id integer NOT NULL;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN variant_id integer;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN id_size integer;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN id_length integer;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN id_metal integer NOT NULL;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN id_metal_tone integer;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN id_head_metal_tone integer;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN id_shank_metal_tone integer;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN is_band bit;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN id_band_metal_tone integer;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN id_karat integer;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN product_details json;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN user_id integer NOT NULL;
ALTER TABLE IF EXISTS public.wishlist_products
    ADD CONSTRAINT pk_wishlist_products PRIMARY KEY (id);
ALTER TABLE IF EXISTS public.wishlist_products DROP CONSTRAINT IF EXISTS fk_product_product_id;

ALTER TABLE IF EXISTS public.wishlist_products DROP CONSTRAINT IF EXISTS fk_user_id_app_users;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD CONSTRAINT fk_size_id_item_sizes FOREIGN KEY (id_size)
    REFERENCES public.items_sizes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD CONSTRAINT fk_length_item_length FOREIGN KEY (id_length)
    REFERENCES public.items_lengths (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD CONSTRAINT fk_metal_id FOREIGN KEY (id_metal)
    REFERENCES public.metal_masters (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD CONSTRAINT fk_karat_id FOREIGN KEY (id_karat)
    REFERENCES public.gold_kts (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD CONSTRAINT fk_metal_tone FOREIGN KEY (id_metal_tone)
    REFERENCES public.metal_tones (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD CONSTRAINT fk_head_metal_tone FOREIGN KEY (id_head_metal_tone)
    REFERENCES public.metal_tones (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD CONSTRAINT fk_shank_metal_tone FOREIGN KEY (id_shank_metal_tone)
    REFERENCES public.metal_tones (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD CONSTRAINT fk_band_metal_tone FOREIGN KEY (id_band_metal_tone)
    REFERENCES public.metal_tones (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD CONSTRAINT fk_user_id_app_users FOREIGN KEY (user_id)
    REFERENCES public.app_users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.wishlist_products DROP COLUMN IF EXISTS id;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN id bigint NOT NULL GENERATED ALWAYS AS IDENTITY;
ALTER TABLE IF EXISTS public.wishlist_products
    ADD PRIMARY KEY (id);

ALTER TABLE IF EXISTS public.cart_products DROP COLUMN IF EXISTS product_SKU;

ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN variant_id integer;

ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN id_metal integer;

ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN id_karat integer;

ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN id_metal_tone integer;

ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN id_size integer;

ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN id_length integer;

ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN is_band bit;

ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN id_head_metal_tone integer;

ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN id_shank_metal_tone integer;

ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN id_band_metal_tone integer;

ALTER TABLE IF EXISTS public.cart_products
    ADD CONSTRAINT fk_id_metal FOREIGN KEY (id_metal)
    REFERENCES public.metal_masters (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.cart_products
    ADD CONSTRAINT fk_karat_id FOREIGN KEY (id_karat)
    REFERENCES public.gold_kts (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.cart_products
    ADD CONSTRAINT fk_head_metal_tone FOREIGN KEY (id_head_metal_tone)
    REFERENCES public.metal_tones (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.cart_products
    ADD CONSTRAINT fk_shank_metal_tone FOREIGN KEY (id_shank_metal_tone)
    REFERENCES public.metal_tones (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.cart_products
    ADD CONSTRAINT fk_band_metal_tone FOREIGN KEY (id_band_metal_tone)
    REFERENCES public.metal_tones (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.cart_products
    ADD CONSTRAINT fk_metal_tone FOREIGN KEY (id_metal_tone)
    REFERENCES public.metal_tones (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.cart_products
    ADD CONSTRAINT fk_size FOREIGN KEY (id_size)
    REFERENCES public.items_sizes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.cart_products
    ADD CONSTRAINT fk_length FOREIGN KEY (id_length)
    REFERENCES public.items_lengths (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.order_details
    ADD COLUMN variant_id integer;

ALTER TABLE IF EXISTS public.product_images
    ALTER COLUMN id_metal_tone DROP NOT NULL;

ALTER TABLE IF EXISTS public.product_diamond_options
    ADD COLUMN id_stone integer;

ALTER TABLE IF EXISTS public.product_diamond_options
    ADD COLUMN id_shape integer;

ALTER TABLE IF EXISTS public.product_diamond_options
    ADD COLUMN id_color integer;

ALTER TABLE IF EXISTS public.product_diamond_options
    ADD COLUMN id_clarity integer;

ALTER TABLE IF EXISTS public.product_diamond_options
    ADD COLUMN id_mm_size integer;

ALTER TABLE IF EXISTS public.product_diamond_options
    ADD COLUMN id_cut integer;
ALTER TABLE IF EXISTS public.product_diamond_options
    ADD CONSTRAINT fk_pdo_stone_id FOREIGN KEY (id_stone)
    REFERENCES public.gemstones (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.product_diamond_options
    ADD CONSTRAINT fk_pdo_shape_id FOREIGN KEY (id_shape)
    REFERENCES public.diamond_shapes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.product_diamond_options
    ADD CONSTRAINT fk_pdo_mm_size_id FOREIGN KEY (id_mm_size)
    REFERENCES public.mm_sizes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.product_diamond_options
    ADD CONSTRAINT fk_pdo_color_id FOREIGN KEY (id_color)
    REFERENCES public.colors (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.product_diamond_options
    ADD CONSTRAINT fk_pdo_clarity_id FOREIGN KEY (id_clarity)
    REFERENCES public.clarities (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.product_diamond_options
    ADD CONSTRAINT fk_pdo_cuts_id FOREIGN KEY (id_cut)
    REFERENCES public.cuts (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.product_diamond_options
    ALTER COLUMN weight DROP NOT NULL;

ALTER TABLE IF EXISTS public.product_diamond_options
    ALTER COLUMN count DROP NOT NULL;

ALTER TABLE IF EXISTS public.product_diamond_options
    ALTER COLUMN id_diamond_group DROP NOT NULL;

/* 13-06-2024 master changes */

/* metal master */

ALTER TABLE IF EXISTS public.metal_masters
    ADD COLUMN is_band bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.metal_masters
    ADD COLUMN is_three_stone bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.metal_masters
    ADD COLUMN is_bracelet bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.metal_masters
    ADD COLUMN is_pendant bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.metal_masters
    ADD COLUMN is_earring bit DEFAULT '0'::"bit";

/* metal tone */
ALTER TABLE IF EXISTS public.metal_tones
    ADD COLUMN is_config bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.metal_tones
    ADD COLUMN is_band bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.metal_tones
    ADD COLUMN is_three_stone bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.metal_tones
    ADD COLUMN is_bracelet bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.metal_tones
    ADD COLUMN is_pendant bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.metal_tones
    ADD COLUMN is_earring bit DEFAULT '0'::"bit";

/* metal karat */

ALTER TABLE IF EXISTS public.gold_kts
    ADD COLUMN is_band bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.gold_kts
    ADD COLUMN is_three_stone bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.gold_kts
    ADD COLUMN is_bracelet bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.gold_kts
    ADD COLUMN is_pendant bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.gold_kts
    ADD COLUMN is_earring bit DEFAULT '0'::"bit";

/* cuts */

ALTER TABLE IF EXISTS public.cuts
    ADD COLUMN is_config bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.cuts
    ADD COLUMN is_band bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.cuts
    ADD COLUMN is_three_stone bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.cuts
    ADD COLUMN is_bracelet bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.cuts
    ADD COLUMN is_pendant bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.cuts
    ADD COLUMN is_earring bit DEFAULT '0'::"bit";

/* diamond shape */

ALTER TABLE IF EXISTS public.diamond_shapes
    ADD COLUMN is_config bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.diamond_shapes
    ADD COLUMN is_band bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.diamond_shapes
    ADD COLUMN is_three_stone bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.diamond_shapes
    ADD COLUMN is_bracelet bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.diamond_shapes
    ADD COLUMN is_pendant bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.diamond_shapes
    ADD COLUMN is_earring bit DEFAULT '0'::"bit";

/* diamond carat size */

ALTER TABLE IF EXISTS public.carat_sizes
    ADD COLUMN is_band bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.carat_sizes
    ADD COLUMN is_three_stone bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.carat_sizes
    ADD COLUMN is_bracelet bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.carat_sizes
    ADD COLUMN is_pendant bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.carat_sizes
    ADD COLUMN is_earring bit DEFAULT '0'::"bit";

/* diamond group master */

ALTER TABLE IF EXISTS public.diamond_group_masters
    ADD COLUMN is_band bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.diamond_group_masters
    ADD COLUMN is_three_stone bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.diamond_group_masters
    ADD COLUMN is_bracelet bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.diamond_group_masters
    ADD COLUMN is_pendant bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.diamond_group_masters
    ADD COLUMN is_earring bit DEFAULT '0'::"bit";

/* heads */

ALTER TABLE IF EXISTS public.heads
    ADD COLUMN is_config bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.heads
    ADD COLUMN is_band bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.heads
    ADD COLUMN is_three_stone bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.heads
    ADD COLUMN is_bracelet bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.heads
    ADD COLUMN is_pendant bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.heads
    ADD COLUMN is_earring bit DEFAULT '0'::"bit";

/* shank */

ALTER TABLE IF EXISTS public.shanks
    ADD COLUMN is_config bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.shanks
    ADD COLUMN is_band bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.shanks
    ADD COLUMN is_three_stone bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.shanks
    ADD COLUMN is_bracelet bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.shanks
    ADD COLUMN is_pendant bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.shanks
    ADD COLUMN is_earring bit DEFAULT '0'::"bit";

/* side setting */

ALTER TABLE IF EXISTS public.side_setting_styles
    ADD COLUMN is_config bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.side_setting_styles
    ADD COLUMN is_band bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.side_setting_styles
    ADD COLUMN is_three_stone bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.side_setting_styles
    ADD COLUMN is_bracelet bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.side_setting_styles
    ADD COLUMN is_pendant bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.side_setting_styles
    ADD COLUMN is_earring bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.template_banners
    ADD COLUMN banner_text_color character varying;


-- Table: public.config_eternity_product

-- DROP TABLE IF EXISTS public.config_eternity_product;

CREATE TABLE IF NOT EXISTS public.config_eternity_product
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    side_setting_id integer,
    style_no character varying COLLATE pg_catalog."default",
    product_title character varying COLLATE pg_catalog."default" NOT NULL,
    product_sort_des character varying COLLATE pg_catalog."default" NOT NULL,
    product_long_des character varying COLLATE pg_catalog."default" NOT NULL,
    sku character varying COLLATE pg_catalog."default" NOT NULL,
    dia_cts double precision,
    dia_shape_id integer,
    dia_clarity_id integer,
    dia_cut_id integer,
    dia_mm_id integer,
    dia_color integer,
    dia_count double precision,
    diamond_group_id integer,
    prod_dia_total_count double precision,
    alterant_dia_count double precision,
    product_type character varying COLLATE pg_catalog."default",
    product_size character varying,
    product_combo_type integer,
    slug character varying COLLATE pg_catalog."default",
    created_by integer,
    labour_charge double precision,
    is_deleted bit(1),
    other_charge double precision,
    discount_type integer,
    discount_value character varying COLLATE pg_catalog."default",
    modified_by integer,
    dia_type integer,
    created_date timestamp without time zone,
    modified_date timestamp without time zone,
    CONSTRAINT config_eternity_products_pkey PRIMARY KEY (id),
    CONSTRAINT diamond_clarity_id FOREIGN KEY (dia_clarity_id)
        REFERENCES public.clarities (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT diamond_color_id_fk FOREIGN KEY (dia_color)
        REFERENCES public.colors (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT diamond_cuts_id FOREIGN KEY (dia_cut_id)
        REFERENCES public.cuts (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT diamond_mm_size_id FOREIGN KEY (dia_mm_id)
        REFERENCES public.mm_sizes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT diamond_shape_id FOREIGN KEY (dia_shape_id)
        REFERENCES public.diamond_shapes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT center_stone_diamond_group_id_fk FOREIGN KEY (diamond_group_id)
        REFERENCES public.diamond_group_masters (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT product_side_setting_id FOREIGN KEY (side_setting_id)
        REFERENCES public.side_setting_styles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.config_eternity_product
    OWNER to postgres;

-- Table: public.config_product_metals

-- DROP TABLE IF EXISTS public.config_product_metals;

CREATE TABLE IF NOT EXISTS public.config_eternity_product_metals
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    config_eternity_id integer,
    metal_id integer,
    metal_wt double precision,
    created_by integer,
    created_date timestamp without time zone,
    modified_by integer,
    modified_date timestamp without time zone,
    karat_id integer,
    metal_tone character varying COLLATE pg_catalog."default",
    labour_charge double precision,
    is_deleted bit(1) DEFAULT (0)::bit(1),
    CONSTRAINT config_eternity_product_metals_pkey PRIMARY KEY (id),
    CONSTRAINT config_eternity_id_product FOREIGN KEY (config_eternity_id)
        REFERENCES public.config_products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT created_by_user FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT metal_id_products FOREIGN KEY (metal_id)
        REFERENCES public.metal_masters (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT modified_by_user FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT product_karat_id FOREIGN KEY (karat_id)
        REFERENCES public.gold_kts (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.config_eternity_product_metals
    OWNER to postgres;

-- Table: public.config_eternity_product_diamonds

-- DROP TABLE IF EXISTS public.config_eternity_product_diamonds;

CREATE TABLE IF NOT EXISTS public.config_eternity_product_diamonds
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    config_eternity_product_id integer,
    dia_count integer,
    dia_cts integer,
    dia_size double precision,
    created_date timestamp without time zone,
    created_by integer,
    modified_date timestamp without time zone,
    modified_by integer,
    id_diamond_group integer,
    dia_weight double precision,
    dia_shape integer,
    dia_stone integer,
    dia_color integer,
    dia_mm_size integer,
    dia_clarity integer,
    dia_cuts integer,
    is_deleted bit(1) DEFAULT (0)::bit(1),
    CONSTRAINT config_eternity_product_diamonds_pkey PRIMARY KEY (id),
    CONSTRAINT config_eternity_product_id_product_diamond_details FOREIGN KEY (config_eternity_product_id)
        REFERENCES public.config_products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT create_by_user FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT modified_by_users FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT product_dia_carat_fk FOREIGN KEY (dia_cts)
        REFERENCES public.carat_sizes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT product_dia_clarity_fk FOREIGN KEY (dia_clarity)
        REFERENCES public.clarities (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT product_dia_color_fk FOREIGN KEY (dia_color)
        REFERENCES public.colors (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT product_dia_cuts_fk FOREIGN KEY (dia_cuts)
        REFERENCES public.cuts (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT product_dia_mm_size_fk FOREIGN KEY (dia_mm_size)
        REFERENCES public.mm_sizes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT product_dia_shape_fk FOREIGN KEY (dia_shape)
        REFERENCES public.diamond_shapes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT product_dia_stone_fk FOREIGN KEY (dia_stone)
        REFERENCES public.gemstones (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT product_diamond_group_id FOREIGN KEY (id_diamond_group)
        REFERENCES public.diamond_group_masters (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.config_eternity_product_diamonds
    OWNER to postgres;

ALTER TABLE public.config_eternity_product
    ALTER COLUMN id TYPE bigint;

ALTER TABLE public.config_eternity_product_diamonds
    ALTER COLUMN id TYPE bigint;

ALTER TABLE public.config_eternity_product_metals
    ALTER COLUMN id TYPE bigint;

ALTER TABLE IF EXISTS public.config_eternity_product
    RENAME TO config_eternity_products;

ALTER TABLE IF EXISTS public.config_eternity_product_diamonds
    RENAME CONSTRAINT config_eternity_product_id_product_diamond_details TO fk_config_eternity_product_id;

ALTER TABLE IF EXISTS public.config_eternity_product_metals DROP CONSTRAINT IF EXISTS config_eternity_id_product;

ALTER TABLE IF EXISTS public.config_eternity_product_metals
    ADD CONSTRAINT config_eternity_id_product FOREIGN KEY (config_eternity_id)
    REFERENCES public.config_eternity_products (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.config_eternity_product_diamonds DROP CONSTRAINT IF EXISTS fk_config_eternity_product_id;

ALTER TABLE IF EXISTS public.config_eternity_product_diamonds
    ADD CONSTRAINT fk_config_eternity_product_id FOREIGN KEY (config_eternity_id)
    REFERENCES public.config_eternity_products (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.config_eternity_product_diamonds
    RENAME dia_size TO diamond_type;

ALTER TABLE IF EXISTS public.config_eternity_products
    ADD COLUMN id_stone bigint;
ALTER TABLE IF EXISTS public.config_eternity_products
    ADD CONSTRAINT fk_stone_id FOREIGN KEY (id_stone)
    REFERENCES public.gemstones (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.config_eternity_products
    RENAME alterant_dia_count TO alternate_dia_count;


-- Type: stone_type

-- DROP TYPE IF EXISTS public.stone_type;

CREATE TYPE public.stone_type AS ENUM
    ('gemstone', 'diamond');

ALTER TYPE public.stone_type
    OWNER TO postgres;



-- Table: public.masters
CREATE TYPE public.master_type AS ENUM
    ('metal_master', 'metal_tone_master', 'metal_karat_master', 'stone_master', 'stone_carat_master', 'stone_shape_master', 'diamond_color_master', 'diamond_clarity_master', 'diamond_cut_master', 'diamond_certificate_master', 'diamond_process_master', 'item_size_master', 'item_length_master', 'setting_style_master', 'tag_master', 'brand_master', 'category_master', 'select_preference_master', 'availability_master', 'cut_grade_master', 'polish_master', 'symmetry_master', 'fluorescence_intensity_master', 'fluorescence_color_master', 'lab_master', 'fancy_color_master', 'fancy_color_intensity_master', 'fancy_color_overtone_master', 'girdle_thin_master', 'girdle_thick_master', 'girdle_condition_master', 'culet_condition_master', 'laser_inscription_master', 'cert_comment_master', 'country', 'state', 'city', 'time_to_location_master', 'pair_separable_master', 'pair_stock_master', 'parcel_stones_master', 'trade_show_master', 'shade_master', 'center_inclusion_master', 'black_inclusion_master', 'report_type_master', 'lab_location_master', 'milky_master', 'bgm_master', 'pair_master', 'H&A_master', 'growth_type_master');

ALTER TYPE public.master_type
    OWNER TO postgres;s
-- DROP TABLE IF EXISTS public.masters;

CREATE TABLE IF NOT EXISTS public.masters
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    slug character varying COLLATE pg_catalog."default" NOT NULL,
    sort_code character varying COLLATE pg_catalog."default",
    id_parent bigint,
    id_image bigint,
    is_active bit(1) NOT NULL DEFAULT (1)::bit(1),
    is_deleted bit(1) NOT NULL DEFAULT (0)::bit(1),
    created_at timestamp without time zone NOT NULL,
    created_by bigint,
    modified_at timestamp without time zone,
    modified_by bigint,
    deleted_at timestamp without time zone,
    deleted_by bigint,
    master_type master_type NOT NULL,
    stone_type stone_type,
    value character varying COLLATE pg_catalog."default",
    link character varying COLLATE pg_catalog."default",
    import_name character varying COLLATE pg_catalog."default",
    CONSTRAINT masters_pkey PRIMARY KEY (id),
    CONSTRAINT fk_image_id FOREIGN KEY (id_image)
        REFERENCES public.images (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.masters
    OWNER to postgres;

-- 8-3-2024
ALTER TABLE IF EXISTS public.config_product_diamonds
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.config_product_metals
    ALTER COLUMN id SET GENERATED BY DEFAULT;
-- Table: public.loose_diamond_group_masters

-- DROP TABLE IF EXISTS public.loose_diamond_group_masters;

CREATE TABLE IF NOT EXISTS public.loose_diamond_group_masters
(
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    stock_id character varying COLLATE pg_catalog."default",
    availability bigint,
    stone bigint,
    shape bigint,
    weight double precision,
    color bigint,
    clarity bigint,
    cut_grade bigint,
    "off_RAP" double precision,
    polish bigint,
    symmetry bigint,
    fluorescence_intensity bigint,
    fluorescence_color bigint,
    measurements character varying COLLATE pg_catalog."default",
    lab bigint,
    certificate bigint,
    certificate_url character varying COLLATE pg_catalog."default",
    treatment character varying COLLATE pg_catalog."default",
    fancy_color bigint,
    fancy_color_intensity bigint,
    fancy_color_overtone bigint,
    depth_per double precision,
    table_per double precision,
    girdle_thin bigint,
    girdle_thick bigint,
    girdle_per double precision,
    girdle_condition bigint,
    culet_size character varying COLLATE pg_catalog."default",
    culet_condition bigint,
    crown_height double precision,
    crown_angle double precision,
    pavilion_depth double precision,
    pavilion_angle double precision,
    laser_inscription bigint,
    cert_comment bigint,
    sort_description character varying COLLATE pg_catalog."default",
    long_description character varying COLLATE pg_catalog."default",
    country bigint,
    state bigint,
    city bigint,
    time_to_location bigint,
    in_matched_pair_separable character varying COLLATE pg_catalog."default",
    pair_stock bigint,
    parcel_stone bigint,
    image_link character varying COLLATE pg_catalog."default",
    video_link character varying COLLATE pg_catalog."default",
    sari_loupe character varying COLLATE pg_catalog."default",
    trade_show bigint,
    key_of_symbols character varying COLLATE pg_catalog."default",
    shade bigint,
    star_length double precision,
    center_inclusion bigint,
    black_inclusion bigint,
    member_comment character varying COLLATE pg_catalog."default",
    report_issue_date date,
    report_type character varying COLLATE pg_catalog."default",
    lab_location character varying COLLATE pg_catalog."default",
    brand bigint,
    milky bigint,
    eye_clean character varying COLLATE pg_catalog."default",
    h_a bigint,
    bgm bigint,
    growth_type bigint,
    total_price double precision,
    price_ct double precision,
    created_at timestamp with time zone,
    created_by bigint,
    modified_at timestamp with time zone,
    modified_by bigint,
    is_deleted bit(1) DEFAULT (0)::bit(1),
    deleted_at timestamp with time zone,
    deleted_by bigint,
    is_active bit(1) DEFAULT (1)::bit(1),
    stone_type character varying COLLATE pg_catalog."default",
    mm_size character varying COLLATE pg_catalog."default",
    seive_size character varying COLLATE pg_catalog."default",
    image_path character varying COLLATE pg_catalog."default",
    CONSTRAINT loose_diamond_group_masters_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.loose_diamond_group_masters
    OWNER to postgres;

CREATE TYPE info_key AS ENUM ('metal_tone',
'metal_karat'
'tone_master',
'shape_master',
'carat',
'color',
'clarity',
'head',
'shank',
'setting_type',
'side_setting',
'brands',
'collection')

CREATE TABLE IF NOT EXISTS public.info_sections
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    title character varying COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    key info_key NOT NULL,
    created_at timestamp with time zone NOT NULL,
    created_by bigint NOT NULL,
    modified_at timestamp with time zone,
    modified_by bigint,
    CONSTRAINT info_sections_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.info_sections
    OWNER to postgres;
/* add web restrict URL */

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN web_restrict_url character varying;

ALTER TABLE IF EXISTS public.config_eternity_products
    ADD COLUMN product_length bigint;
ALTER TABLE IF EXISTS public.config_eternity_products
    ADD CONSTRAINT fk_product_length FOREIGN KEY (product_length)
    REFERENCES public.items_lengths (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
    
ALTER TABLE public.products
    ALTER COLUMN long_description TYPE character varying COLLATE pg_catalog."default";

ALTER TABLE IF EXISTS public.product_categories
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.product_metal_options
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.product_images
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.role_permissions
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.role_permission_accesses
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.role_permission_access_audit_logs
    ALTER COLUMN id SET GENERATED BY DEFAULT;
    
/* 25-07-2024 master changes related ALL changes  */

ALTER TABLE IF EXISTS public.cities
    ALTER COLUMN is_active SET DEFAULT (0)::bit(1);

ALTER TABLE IF EXISTS public.cities
    ALTER COLUMN is_deleted SET DEFAULT (0)::bit(1);

ALTER TABLE IF EXISTS public.gemstones
    ADD COLUMN is_config bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.gemstones
    ADD COLUMN is_band bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.gemstones
    ADD COLUMN is_three_stone bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.gemstones
    ADD COLUMN is_bracelet bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.gemstones
    ADD COLUMN is_pendant bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.gemstones
    ADD COLUMN is_earring bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.cuts
    ADD COLUMN is_config bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.cuts
    ADD COLUMN is_band bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.cuts
    ADD COLUMN is_three_stone bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.cuts
    ADD COLUMN is_bracelet bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.cuts
    ADD COLUMN is_pendant bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.cuts
    ADD COLUMN is_earring bit DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.diamond_shapes DROP COLUMN IF EXISTS is_diamond;

ALTER TABLE IF EXISTS public.diamond_shapes DROP COLUMN IF EXISTS diamond_size_id;

ALTER TABLE IF EXISTS public.diamond_shapes DROP COLUMN IF EXISTS sort_order;

ALTER TABLE IF EXISTS public.diamond_shapes
    ADD COLUMN is_diamond json;

ALTER TABLE IF EXISTS public.diamond_shapes
    ADD COLUMN sort_order json;

ALTER TABLE IF EXISTS public.diamond_shapes
    ADD COLUMN diamond_size_id json;

ALTER TABLE IF EXISTS public.diamond_shapes
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.carat_sizes DROP COLUMN IF EXISTS is_diamond;

ALTER TABLE IF EXISTS public.carat_sizes
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.carat_sizes
    ADD COLUMN is_diamond json;

ALTER TABLE IF EXISTS public.heads DROP COLUMN IF EXISTS diamond_shape_id;

ALTER TABLE IF EXISTS public.heads DROP COLUMN IF EXISTS diamond_size_id;

ALTER TABLE IF EXISTS public.heads DROP COLUMN IF EXISTS sort_order;

ALTER TABLE IF EXISTS public.heads
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.heads
    ADD COLUMN diamond_shape_id json;

ALTER TABLE IF EXISTS public.heads
    ADD COLUMN diamond_size_id json;

ALTER TABLE IF EXISTS public.heads
    ADD COLUMN sort_order json;

ALTER TABLE IF EXISTS public.shanks DROP COLUMN IF EXISTS side_setting_id;

ALTER TABLE IF EXISTS public.shanks DROP COLUMN IF EXISTS sort_order;

ALTER TABLE IF EXISTS public.shanks
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.shanks
    ADD COLUMN side_setting_id json;

ALTER TABLE IF EXISTS public.shanks
    ADD COLUMN sort_order json;

ALTER TABLE IF EXISTS public.side_setting_styles DROP COLUMN IF EXISTS sort_order;

ALTER TABLE IF EXISTS public.side_setting_styles
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.side_setting_styles
    ADD COLUMN sort_order json;

ALTER TABLE IF EXISTS public.diamond_group_masters DROP COLUMN IF EXISTS is_diamond_type;

ALTER TABLE IF EXISTS public.diamond_group_masters
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.diamond_group_masters
    ADD COLUMN is_diamond_type json;

/* Template 3 (02-09-2024) */

CREATE TYPE public.template_three_type AS ENUM
    ('banner', 'jewelry_collection', 'diamond_collection', 'category_section');

ALTER TYPE public.master_type
    OWNER TO postgres;


-- Table: public.template_three

-- DROP TABLE IF EXISTS public.template_three;

CREATE TABLE IF NOT EXISTS public.template_three
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    section_type template_three_type NOT NULL,
    title character varying COLLATE pg_catalog."default",
    sub_title character varying COLLATE pg_catalog."default",
    description character varying COLLATE pg_catalog."default",
    button_name character varying COLLATE pg_catalog."default",
    button_color character varying COLLATE pg_catalog."default",
    link character varying COLLATE pg_catalog."default",
    button_text_color character varying COLLATE pg_catalog."default",
    title_id_image integer,
    id_image integer,
    id_sub_image integer,
    is_active bit(1),
    is_deleted bit(1),
    created_date timestamp with time zone,
    created_by integer,
    modified_date timestamp with time zone,
    modified_by integer,
    id_collection integer,
    id_category integer,
    sort_order double precision,
    CONSTRAINT cretaed_user_id FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_id_category FOREIGN KEY (id_category)
        REFERENCES public.categories (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_id_collection FOREIGN KEY (id_collection)
        REFERENCES public.collections (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_id_image FOREIGN KEY (id_image)
        REFERENCES public.images (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_sub_id_image FOREIGN KEY (id_sub_image)
        REFERENCES public.images (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_title_id_image FOREIGN KEY (title_id_image)
        REFERENCES public.images (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT modified_user_id FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.template_three
    OWNER to postgres;


/* 09-09-2024 changes */

ALTER TYPE public.template_three_type
    ADD VALUE 'product_model' AFTER 'category_section';

ALTER TABLE products
ADD COLUMN is_choose_setting BIT(1) NOT NULL DEFAULT '0'::BIT(1),
ADD COLUMN is_single BIT(1) NOT NULL DEFAULT '0'::BIT(1),
ADD COLUMN setting_diamond_shapes character varying;

ALTER TABLE product_metal_options 
ADD COLUMN center_diamond_price numeric(10,3);

CREATE TABLE IF NOT EXISTS public.tp_diamond_responses
(
    tp_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    response json NOT NULL
);


/* 10-09-2024 changes */

ALTER TABLE IF EXISTS public.product_metal_options
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.product_categories
    ALTER COLUMN id SET GENERATED BY DEFAULT;


/* 12-09-2024 product list API improved changes*/

CREATE INDEX idx_products_id ON products(id);
CREATE INDEX idx_product_diamond_options_id_product ON product_diamond_options(id_product);
CREATE INDEX idx_diamond_group_masters_id ON diamond_group_masters(id);
CREATE INDEX idx_product_metal_options_id_product ON product_metal_options(id_product);
CREATE INDEX idx_product_categories_id_product ON product_categories(id_product);
CREATE INDEX idx_categories_id ON categories(id);
CREATE INDEX idx_metal_masters_id ON metal_masters(id);
CREATE INDEX idx_gold_kts_id ON gold_kts(id);


/* 18-09-2024 stock change log */

CREATE TABLE IF NOT EXISTS public.stock_change_logs
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    product_id integer NOT NULL,
    variant_id integer,
    product_type smallint NOT NULL,
    sku character varying(200) NOT NULL,
    prev_quantity integer NOT NULL,
    new_quantity integer NOT NULL,
    transaction_type smallint NOT NULL,
    changed_by integer,
    email character varying(75),
   	change_date timestamp without time zone NOT NULL,
    CONSTRAINT stock_change_logs_pkey PRIMARY KEY (id),
    CONSTRAINT variant_id_pmo FOREIGN KEY (variant_id)
        REFERENCES public.product_metal_options (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT changed_by_app_users FOREIGN KEY (changed_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)


ALTER TABLE IF EXISTS public.stock_change_logs
    ALTER COLUMN id SET GENERATED BY DEFAULT;


/* 19-09-2024 loose diamond manage quantity */

ALTER TABLE loose_diamond_group_masters
ADD COLUMN quantity integer,
ADD COLUMN remaining_quantity_count integer;

/* 23-069-2024 SEO related changes */

CREATE TABLE IF NOT EXISTS public.pages
(
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    description character varying COLLATE pg_catalog."default",
    url character varying COLLATE pg_catalog."default",
    is_active bit(1),
    is_restrict bit(1),
    is_deleted bit(1),
    created_date timestamp with time zone,
    created_by integer,
    modified_by integer,
    modified_date timestamp with time zone,
    CONSTRAINT pages_pkey PRIMARY KEY (id),
    CONSTRAINT fk_created_user_id FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_user_id FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.pages
    OWNER to postgres;

-- Table: public.metadata_details

-- DROP TABLE IF EXISTS public.metadata_details;

CREATE TABLE IF NOT EXISTS public.metadata_details
(
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    title character varying COLLATE pg_catalog."default",
    description character varying COLLATE pg_catalog."default",
    key_word character varying COLLATE pg_catalog."default",
    is_active bit(1),
    id_page bigint,
    created_by integer,
    created_date timestamp with time zone,
    is_deleted bit(1),
    modified_by integer,
    modified_date timestamp with time zone,
    CONSTRAINT metadata_details_pkey PRIMARY KEY (id),
    CONSTRAINT fk_created_user_id FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_modified_user_id FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_page_id FOREIGN KEY (id_page)
        REFERENCES public.pages (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.metadata_details
    OWNER to postgres;


/* 25-09-2024 COUPON management related changes */
-- Table: public.coupons

-- DROP TABLE IF EXISTS public.coupons;

CREATE TABLE IF NOT EXISTS public.coupons
(
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    name character varying COLLATE pg_catalog."default",
    coupon_code character varying COLLATE pg_catalog."default" NOT NULL,
    percentage_off character varying COLLATE pg_catalog."default",
    discount_amount_currency character varying COLLATE pg_catalog."default",
    duration character varying COLLATE pg_catalog."default",
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    is_deleted character varying COLLATE pg_catalog."default",
    deleted_date timestamp with time zone,
    deleted_by bigint,
    created_date timestamp without time zone,
    created_by bigint,
    updated_date timestamp with time zone,
    updated_by bigint,
    usage_limit character varying COLLATE pg_catalog."default",
    maximum_discount_amount character varying COLLATE pg_catalog."default",
    is_active bit(1),
    user_id integer,
    discount_type character varying COLLATE pg_catalog."default" NOT NULL,
    discount_amount double precision,
    min_total_amount double precision,
    max_total_amount double precision,
    description character varying COLLATE pg_catalog."default",
    CONSTRAINT "Coupon_pkey" PRIMARY KEY (id),
    CONSTRAINT fk_craeted_user_id FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_deleted_user_id FOREIGN KEY (deleted_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_user_id FOREIGN KEY (updated_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.coupons
    OWNER to postgres;

ALTER TABLE IF EXISTS public.orders
    ADD COLUMN coupon_discount double precision;
ALTER TABLE IF EXISTS public.orders
    ADD CONSTRAINT fk_coupon_id FOREIGN KEY (coupon_id)
    REFERENCES public.coupons (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.product_images
    ALTER COLUMN id SET GENERATED BY DEFAULT;


/* blank database changes */

ALTER TABLE IF EXISTS public.wishlist_products
    ALTER COLUMN id_metal DROP NOT NULL;

ALTER TABLE public.tags
    ALTER COLUMN name TYPE character varying COLLATE pg_catalog."default";

ALTER TABLE IF EXISTS public.coupons
    ADD COLUMN user_limits bigint;

ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN id_coupon bigint;
ALTER TABLE IF EXISTS public.cart_products
    ADD CONSTRAINT fk_coupon_id FOREIGN KEY (id_coupon)
    REFERENCES public.coupons (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TYPE public.info_key RENAME VALUE 'metal_karattone_master' TO 'metal_karat';
    ALTER TYPE public.info_key ADD VALUE 'stone_master';

ALTER TABLE IF EXISTS public.product_diamond_options
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.customer_users DROP COLUMN IF EXISTS country_id;

ALTER TABLE IF EXISTS public.customer_users
    ADD COLUMN country_id character varying;
ALTER TABLE IF EXISTS public.customer_users DROP CONSTRAINT IF EXISTS country_id_country;

/* Add category in collection master */

ALTER TABLE IF EXISTS public.collections
    ADD COLUMN id_category integer;
ALTER TABLE IF EXISTS public.collections
    ADD CONSTRAINT fk_category_id FOREIGN KEY (id_category)
    REFERENCES public.categories (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

/* template three and template five changes */

ALTER TYPE public.template_three_type
    RENAME TO template_five_type;

ALTER TABLE IF EXISTS public.template_three
    RENAME TO template_five;


/* template three changes */

CREATE TYPE public.template_three_type AS ENUM
    ('splash_screen', 'diamond_shape_section', 'category_section', 'product_model', 'event_section', 'style_section');

ALTER TYPE public.template_three_type
    OWNER TO postgres;

CREATE TYPE public.template_three_diamond_shape_section_type AS ENUM
    ('basic_shape', 'special_shape');

ALTER TYPE public.template_three_diamond_shape_section_type
    OWNER TO postgres;

CREATE TABLE IF NOT EXISTS public.template_three
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    title character varying COLLATE pg_catalog."default",
    sub_title character varying COLLATE pg_catalog."default",
    description character varying COLLATE pg_catalog."default",
    button_name character varying COLLATE pg_catalog."default",
    button_color character varying COLLATE pg_catalog."default",
    link character varying COLLATE pg_catalog."default",
    button_text_color character varying COLLATE pg_catalog."default",
    id_image integer,
    id_hover_image integer,
    id_collection integer,
    id_category integer,
    id_style integer,
    sort_order double precision,
    is_button_transparent bit(1),
    button_hover_color character varying COLLATE pg_catalog."default",
    button_text_hover_color character varying COLLATE pg_catalog."default",
    is_active bit(1) NOT NULL DEFAULT '1'::"bit",
    is_deleted bit(1) NOT NULL DEFAULT '0'::"bit",
    created_date timestamp with time zone NOT NULL,
    created_by integer,
    modified_date timestamp with time zone,
    modified_by integer,
    section_type template_three_type NOT NULL,
    id_diamond_shape integer,
    diamond_shape_type template_three_diamond_shape_section_type,
    CONSTRAINT template_three_pkey1 PRIMARY KEY (id),
    CONSTRAINT fk_collection_id FOREIGN KEY (id_collection)
        REFERENCES public.collections (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_create_user FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_diamond_shape_id FOREIGN KEY (id_diamond_shape)
        REFERENCES public.diamond_shapes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_id_category FOREIGN KEY (id_category)
        REFERENCES public.categories (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_image_hover_id FOREIGN KEY (id_hover_image)
        REFERENCES public.images (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_main_image_id FOREIGN KEY (id_image)
        REFERENCES public.images (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_user FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_style_id FOREIGN KEY (id_style)
        REFERENCES public.setting_styles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.template_three
    OWNER to postgres;

ALTER TABLE IF EXISTS public.product_diamond_options
    ALTER COLUMN id SET GENERATED BY DEFAULT;

ALTER TABLE IF EXISTS public.products
    ADD COLUMN additional_detail character varying;

ALTER TYPE public.template_three_type
    ADD VALUE 'style_section' AFTER 'product_page_banner';


ALTER TABLE IF EXISTS public.template_three
    ADD COLUMN hash_tag character varying;

ALTER TABLE IF EXISTS public.side_setting_styles
    ADD COLUMN diamond_shape_id json;

/* add address in company info */   
ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN company_address character varying;

/* add info section in  attributes */

ALTER TYPE public.info_key
    ADD VALUE 'metal_master' AFTER 'stone_master';
ALTER TYPE public.info_key
    ADD VALUE 'cut' AFTER 'metal_master';
ALTER TYPE public.info_key
    ADD VALUE 'mm_size' AFTER 'cut';
ALTER TYPE public.info_key
    ADD VALUE 'item_size' AFTER 'mm_size';
ALTER TYPE public.info_key
    ADD VALUE 'item_length' AFTER 'item_size';
ALTER TYPE public.info_key
    ADD VALUE 'tag' AFTER 'item_length';


/* create  materialized view for product list */

CREATE MATERIALIZED VIEW IF NOT EXISTS public.product_list_view
TABLESPACE pg_default
AS
 WITH filtered_pmo AS (
         SELECT DISTINCT ON (pmo.id_product) pmo.id,
            pmo.id_product,
            pmo.id_metal_group,
            pmo.metal_weight,
            pmo.is_deleted,
            pmo.created_by,
            pmo.created_date,
            pmo.modified_by,
            pmo.modified_date,
            pmo.is_default,
            pmo.id_metal,
            pmo.id_karat,
            pmo.id_metal_tone,
            pmo.retail_price,
            pmo.compare_price,
            pmo.id_size,
            pmo.id_length,
            pmo.quantity,
            pmo.side_dia_weight,
            pmo.side_dia_count,
            pmo.remaing_quantity_count,
            pmo.id_m_tone,
            pmo.center_diamond_price,
            karats.name
           FROM product_metal_options pmo
             LEFT JOIN gold_kts karats ON karats.id = pmo.id_karat
          WHERE pmo.is_deleted = '0'::"bit"
          ORDER BY pmo.id_product, karats.name
        ), product_images_data AS (
         SELECT product_images.id_product,
            product_images.id AS image_id,
            concat('https://cadcocatalogue.s3.ap-southeast-1.amazonaws.com/', product_images.image_path) AS image_path,
            product_images.id_metal_tone,
            product_images.image_type
           FROM product_images
          WHERE product_images.is_deleted = '0'::"bit" AND product_images.image_type = 1
        ), sum_price AS (
         SELECT pdo_1.id_product,
            sum(dgm_1.rate * pdo_1.weight::double precision * pdo_1.count::double precision) AS sum_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND (pdo_1.id_type = 2 OR 'undefined'::text <> '1'::text)
          GROUP BY pdo_1.id_product
        )
 SELECT products.id,
    products.name,
    products.sku,
    products.slug,
    products.created_date,
    products.product_type,
    products.setting_style_type,
    products.gender,
    products.id_collection,
    products.id_brand,
    products.setting_diamond_shapes,
    products.is_trending,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_categories.id, 'id_category', product_categories.id_category, 'id_sub_category', product_categories.id_sub_category, 'id_sub_sub_category', product_categories.id_sub_sub_category, 'category_name', categories.slug, 'sub_category_name', sub_categories.slug, 'sub_sub_category', sub_sub_categories.slug)) AS product_categories,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_images_data.image_id, 'image_path', product_images_data.image_path, 'id_metal_tone', product_images_data.id_metal_tone, 'image_type', product_images_data.image_type)) AS product_images,
    jsonb_agg(DISTINCT jsonb_build_object('id', filtered_pmo.id, 'id_metal', filtered_pmo.id_metal, 'id_karat', filtered_pmo.id_karat, 'id_size', filtered_pmo.id_size, 'id_length', filtered_pmo.id_length, 'id_m_tone', filtered_pmo.id_m_tone, 'quantity', filtered_pmo.remaing_quantity_count, 'wishlist_id', NULL::unknown, 'metal_tone',
        CASE
            WHEN filtered_pmo.id_metal_tone IS NULL THEN '{}'::integer[]
            ELSE string_to_array(filtered_pmo.id_metal_tone::text, '|'::text)::integer[]
        END, 'gold_karat', filtered_pmo.name, 'catalogue_design_price', filtered_pmo.retail_price, 'Price',
        CASE
            WHEN products.product_type = 2 THEN
            CASE
                WHEN 'undefined'::text = '1'::text THEN filtered_pmo.retail_price - COALESCE(filtered_pmo.center_diamond_price, 0::numeric)::double precision
                ELSE filtered_pmo.retail_price
            END
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / 31.104::double precision * filtered_pmo.name::double precision / 24::double precision * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END)) AS pmo,
    jsonb_agg(DISTINCT jsonb_build_object('id', pdo.id, 'weight', pdo.weight, 'count', pdo.count, 'id_shape',
        CASE
            WHEN products.product_type = 1 THEN dgm.id_shape
            ELSE pdo.id_shape
        END, 'id_stone', pdo.id_stone, 'id_color', pdo.id_color, 'id_clarity', pdo.id_clarity)) AS pdo
   FROM products
     LEFT JOIN product_images_data ON product_images_data.id_product = products.id
     LEFT JOIN product_categories ON product_categories.id_product = products.id
     LEFT JOIN categories ON categories.id = product_categories.id_category
     LEFT JOIN categories sub_categories ON sub_categories.id = product_categories.id_sub_category
     LEFT JOIN categories sub_sub_categories ON sub_sub_categories.id = product_categories.id_sub_sub_category
     LEFT JOIN filtered_pmo ON filtered_pmo.id_product = products.id
     LEFT JOIN metal_masters metal_master ON metal_master.id = filtered_pmo.id_metal
     LEFT JOIN product_diamond_options pdo ON pdo.id_product = products.id AND pdo.is_deleted = '0'::"bit"
     LEFT JOIN diamond_group_masters dgm ON dgm.id = pdo.id_diamond_group
     LEFT JOIN sum_price ON sum_price.id_product = products.id
  WHERE products.is_deleted = '0'::"bit" AND products.is_active = '1'::"bit"
  GROUP BY products.id
WITH DATA;

ALTER TABLE IF EXISTS public.product_list_view
    OWNER TO postgres;


/* FAQ */

CREATE TABLE IF NOT EXISTS public.faq_que_ans
(
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    id_parent bigint,
    category_name character varying COLLATE pg_catalog."default",
    question character varying COLLATE pg_catalog."default",
    answer character varying COLLATE pg_catalog."default",
    is_active bit(1) NOT NULL,
    is_deleted bit(1) NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by integer,
    modified_by integer,
    slug character varying COLLATE pg_catalog."default",
    CONSTRAINT faq_que_ans_pkey PRIMARY KEY (id),
    CONSTRAINT fk_created_user FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_id_parent_category FOREIGN KEY (id_parent)
        REFERENCES public.faq_que_ans (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_user FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.faq_que_ans
    OWNER to postgres;

/* add certificate in product */

ALTER TABLE IF EXISTS public.products
    ADD COLUMN certificate character varying;

/* add sort order in FAQ */

ALTER TABLE IF EXISTS public.faq_que_ans
    ADD COLUMN sort_order integer;

/* shipping days add in product & company info */

ALTER TABLE IF EXISTS public.products
    ADD COLUMN shipping_day integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN est_shipping_day integer;

/* add pinterest link in company info */

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN pinterest_link character varying;

/* add calculate rate in metal master  */

ALTER TABLE IF EXISTS public.metal_masters
    ADD COLUMN calculate_rate double precision;

ALTER TABLE IF EXISTS public.metal_masters
    ALTER COLUMN calculate_rate SET DEFAULT 1.0;


/* updated product_list_view */

-- View: public.product_list_view

-- DROP MATERIALIZED VIEW IF EXISTS public.product_list_view;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.product_list_view
TABLESPACE pg_default
AS
 WITH filtered_pmo AS (
         SELECT DISTINCT ON (pmo.id_product) pmo.id,
            pmo.id_product,
            pmo.id_metal_group,
            pmo.metal_weight,
            pmo.is_deleted,
            pmo.created_by,
            pmo.created_date,
            pmo.modified_by,
            pmo.modified_date,
            pmo.is_default,
            pmo.id_metal,
            pmo.id_karat,
            pmo.id_metal_tone,
            pmo.retail_price,
            pmo.compare_price,
            pmo.id_size,
            pmo.id_length,
            pmo.quantity,
            pmo.side_dia_weight,
            pmo.side_dia_count,
            pmo.remaing_quantity_count,
            pmo.id_m_tone,
            pmo.center_diamond_price,
            karats.name
           FROM product_metal_options pmo
             LEFT JOIN gold_kts karats ON karats.id = pmo.id_karat
          WHERE pmo.is_deleted = '0'::"bit"
          ORDER BY pmo.id_product, karats.name
        ), product_images_data AS (
         SELECT product_images.id_product,
            product_images.id AS image_id,
            concat('https://d1d4axu56w21qu.cloudfront.net/', product_images.image_path) AS image_path,
            product_images.id_metal_tone,
            product_images.image_type
           FROM product_images
          WHERE product_images.is_deleted = '0'::"bit" AND product_images.image_type = 1
        ), sum_price AS (
         SELECT pdo_1.id_product,
            sum(dgm_1.rate * pdo_1.weight::double precision * pdo_1.count::double precision) AS sum_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND (pdo_1.id_type = 2 OR 'undefined'::text <> '1'::text)
          GROUP BY pdo_1.id_product
        )
 SELECT products.id,
    products.name,
    products.sku,
    products.slug,
    products.created_date,
    products.product_type,
    products.setting_style_type,
    products.gender,
    products.id_collection,
    products.id_brand,
    products.setting_diamond_shapes,
    products.is_trending,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_categories.id, 'id_category', product_categories.id_category, 'id_sub_category', product_categories.id_sub_category, 'id_sub_sub_category', product_categories.id_sub_sub_category, 'category_name', categories.slug, 'sub_category_name', sub_categories.slug, 'sub_sub_category', sub_sub_categories.slug)) AS product_categories,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_images_data.image_id, 'image_path', product_images_data.image_path, 'id_metal_tone', product_images_data.id_metal_tone, 'image_type', product_images_data.image_type)) AS product_images,
    jsonb_agg(DISTINCT jsonb_build_object('id', filtered_pmo.id, 'id_metal', filtered_pmo.id_metal, 'id_karat', filtered_pmo.id_karat, 'id_size', filtered_pmo.id_size, 'id_length', filtered_pmo.id_length, 'id_m_tone', filtered_pmo.id_m_tone, 'quantity', filtered_pmo.remaing_quantity_count, 'wishlist_id', NULL::unknown, 'metal_tone',
        CASE
            WHEN filtered_pmo.id_metal_tone IS NULL THEN '{}'::integer[]
            ELSE string_to_array(filtered_pmo.id_metal_tone::text, '|'::text)::integer[]
        END, 'gold_karat', filtered_pmo.name, 'catalogue_design_price', filtered_pmo.retail_price, 'Price',
        CASE
            WHEN products.product_type = 2 THEN
            CASE
                WHEN 'undefined'::text = '1'::text THEN filtered_pmo.retail_price - COALESCE(filtered_pmo.center_diamond_price, 0::numeric)::double precision
                ELSE products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.retail_price
            END
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.name::double precision / 24::double precision * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END, 'compare_price',
        CASE
            WHEN products.product_type = 2 THEN products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision +filtered_pmo.compare_price
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.name::double precision / 24::double precision * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END)) AS pmo,
    jsonb_agg(DISTINCT jsonb_build_object('id', pdo.id, 'weight', pdo.weight, 'count', pdo.count, 'id_shape',
        CASE
            WHEN products.product_type = 1 THEN dgm.id_shape
            ELSE pdo.id_shape
        END, 'id_stone', pdo.id_stone, 'id_color', pdo.id_color, 'id_clarity', pdo.id_clarity)) AS pdo
   FROM products
     LEFT JOIN product_images_data ON product_images_data.id_product = products.id
     LEFT JOIN product_categories ON product_categories.id_product = products.id
     LEFT JOIN categories ON categories.id = product_categories.id_category
     LEFT JOIN categories sub_categories ON sub_categories.id = product_categories.id_sub_category
     LEFT JOIN categories sub_sub_categories ON sub_sub_categories.id = product_categories.id_sub_sub_category
     LEFT JOIN filtered_pmo ON filtered_pmo.id_product = products.id
     LEFT JOIN metal_masters metal_master ON metal_master.id = filtered_pmo.id_metal
     LEFT JOIN product_diamond_options pdo ON pdo.id_product = products.id AND pdo.is_deleted = '0'::"bit"
     LEFT JOIN diamond_group_masters dgm ON dgm.id = pdo.id_diamond_group
     LEFT JOIN sum_price ON sum_price.id_product = products.id
  WHERE products.is_deleted = '0'::"bit" AND products.is_active = '1'::"bit"
  GROUP BY products.id
WITH DATA;

ALTER TABLE IF EXISTS public.product_list_view
    OWNER TO postgres;

/* HOOK MASTER */

CREATE TABLE IF NOT EXISTS public.hook_types
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    slug character varying COLLATE pg_catalog."default" NOT NULL,
    sort_code character varying COLLATE pg_catalog."default" NOT NULL,
    is_active bit(1) NOT NULL DEFAULT '1'::"bit",
    is_deleted bit(1) NOT NULL DEFAULT '0'::"bit",
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    id_image integer,
    created_by integer,
    modified_by integer,
    CONSTRAINT hook_typess_pkey PRIMARY KEY (id),
    CONSTRAINT fk_created_user FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_image_id FOREIGN KEY (id_image)
        REFERENCES public.images (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_user FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.hook_types
    OWNER to postgres;


/* bracelet configurator */

CREATE TABLE IF NOT EXISTS public.config_bracelet_products
(
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    product_type character varying COLLATE pg_catalog."default" NOT NULL,
    product_style character varying COLLATE pg_catalog."default",
    product_length integer,
    setting_type integer,
    hook_type integer,
    dia_total_wt double precision,
    style_no character varying COLLATE pg_catalog."default",
    "style_no_WB" character varying COLLATE pg_catalog."default",
    is_active bit(1) NOT NULL,
    is_deleted bit(1) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone,
    created_by integer NOT NULL,
    modified_by integer,
    product_title character varying COLLATE pg_catalog."default" NOT NULL,
    sku character varying COLLATE pg_catalog."default" NOT NULL,
    slug character varying COLLATE pg_catalog."default" NOT NULL,
    product_sort_des character varying COLLATE pg_catalog."default",
    product_long_des character varying COLLATE pg_catalog."default",
    product_dia_type integer,
    CONSTRAINT config_bracelet_products_pkey PRIMARY KEY (id),
    CONSTRAINT fk_create_by_user FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_hook_type FOREIGN KEY (hook_type)
        REFERENCES public.hook_types (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_by_user FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_product_length FOREIGN KEY (product_length)
        REFERENCES public.items_lengths (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_setting_style FOREIGN KEY (setting_type)
        REFERENCES public.side_setting_styles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.config_bracelet_products
    OWNER to postgres;


-- Table: public.config_bracelet_product_metals

-- DROP TABLE IF EXISTS public.config_bracelet_product_metals;

CREATE TABLE IF NOT EXISTS public.config_bracelet_product_metals
(
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    config_product_id bigint NOT NULL,
    id_metal integer NOT NULL,
    id_karat integer,
    labour_charge double precision,
    metal_wt double precision,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by integer,
    modified_by integer,
    CONSTRAINT config_bracelet_product_metals_pkey PRIMARY KEY (id),
    CONSTRAINT fk_config_bracelet_product FOREIGN KEY (config_product_id)
        REFERENCES public.config_bracelet_products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_created_user FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_karat_id FOREIGN KEY (id_karat)
        REFERENCES public.gold_kts (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_metal_id FOREIGN KEY (id_metal)
        REFERENCES public.metal_masters (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_modified_user FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.config_bracelet_product_metals
    OWNER to postgres;


-- Table: public.config_bracelet_product_diamonds

-- DROP TABLE IF EXISTS public.config_bracelet_product_diamonds;

CREATE TABLE IF NOT EXISTS public.config_bracelet_product_diamonds
(
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    config_product_id integer NOT NULL,
    stone_type character varying COLLATE pg_catalog."default" NOT NULL,
    id_stone integer NOT NULL,
    id_shape integer,
    id_mm_size integer,
    id_color integer,
    id_clarity integer,
    id_cut integer,
    id_carat integer,
    dia_wt double precision,
    dia_count integer,
    id_diamond_group_master integer,
    is_active bit(1) NOT NULL DEFAULT '1'::"bit",
    is_deleted bit(1) NOT NULL DEFAULT '0'::"bit",
    created_by integer,
    modified_by integer,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    CONSTRAINT config_bracelet_product_diamonds_pkey PRIMARY KEY (id),
    CONSTRAINT fk_carat_id FOREIGN KEY (id_carat)
        REFERENCES public.carat_sizes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_clarity_id FOREIGN KEY (id_clarity)
        REFERENCES public.clarities (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_color_id FOREIGN KEY (id_color)
        REFERENCES public.colors (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_config_bracelet_product FOREIGN KEY (config_product_id)
        REFERENCES public.config_bracelet_products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_created_user FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_cut_id FOREIGN KEY (id_cut)
        REFERENCES public.cuts (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_diamond_group_master FOREIGN KEY (id_diamond_group_master)
        REFERENCES public.diamond_group_masters (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_mm_size_id FOREIGN KEY (id_mm_size)
        REFERENCES public.mm_sizes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_user FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_shape_id FOREIGN KEY (id_shape)
        REFERENCES public.diamond_shapes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_stone_id FOREIGN KEY (id_stone)
        REFERENCES public.gemstones (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.config_bracelet_product_diamonds
    OWNER to postgres;

ALTER TABLE IF EXISTS public.config_bracelet_product_diamonds
    ADD COLUMN alternate_stone character varying;

ALTER TABLE IF EXISTS public.config_bracelet_product_metals
    ALTER COLUMN labour_charge SET DEFAULT 0;


-- View: public.ring_three_stone_configurator_price_view

-- DROP MATERIALIZED VIEW IF EXISTS public.ring_three_stone_configurator_price_view;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.ring_three_stone_configurator_price_view
TABLESPACE pg_default
AS
 SELECT config_products.id,
    side_diamond.dia_stone,
    config_products.sku,
    config_products.product_title,
    config_products.product_sort_des,
    config_products.product_long_des,
    config_products.slug,
    config_products.head_no,
    config_products.shank_no,
    config_products.band_no,
    config_products.ring_no,
    config_products.head_type_id,
    config_products.center_diamond_group_id,
    config_products.shank_type_id,
    config_products.side_setting_id,
    config_products.product_type,
    config_products.style_no,
    metal_masters.id AS metal_id,
    gold_kts.id AS karat_id,
    config_products.center_dia_type,
    jsonb_agg(DISTINCT jsonb_build_object('dia_count', side_diamond.dia_count, 'dia_weight', side_diamond.dia_weight, 'product_type', side_diamond.product_type)) AS cpdo,
    sum(
        CASE
            WHEN lower(cpmo.head_shank_band::text) <> 'band'::text THEN
            CASE
                WHEN cpmo.karat_id IS NULL THEN cpmo.metal_wt * metal_masters.metal_rate + cpmo.labor_charge
                ELSE cpmo.metal_wt * (metal_masters.metal_rate / metal_masters.calculate_rate * gold_kts.name::double precision / 24::double precision) + cpmo.labor_charge
            END
            ELSE 0::double precision
        END) +
        CASE
            WHEN config_products.center_dia_type = 1 THEN dgm.rate
            ELSE dgm.synthetic_rate
        END + COALESCE(product_diamond_detail.without_band_diamond_price, 0::double precision) AS without_band_price,
        CASE
            WHEN cpmo.karat_id IS NULL THEN
            CASE
                WHEN config_products.center_dia_type = 1 THEN dgm.rate
                ELSE dgm.synthetic_rate
            END + sum(cpmo.metal_wt * metal_masters.metal_rate + cpmo.labor_charge) + COALESCE(product_diamond_detail.with_band_diamond_price, 0::double precision)
            ELSE
            CASE
                WHEN config_products.center_dia_type = 1 THEN dgm.rate
                ELSE dgm.synthetic_rate
            END + sum(cpmo.metal_wt * (metal_masters.metal_rate / metal_masters.calculate_rate * gold_kts.name::double precision / 24::double precision) + cpmo.labor_charge) + COALESCE(product_diamond_detail.with_band_diamond_price, 0::double precision)
        END AS with_band_price
   FROM config_products
     JOIN config_product_metals cpmo ON cpmo.config_product_id = config_products.id
     LEFT JOIN metal_masters ON metal_masters.id = cpmo.metal_id
     LEFT JOIN gold_kts ON gold_kts.id = cpmo.karat_id
     JOIN diamond_group_masters dgm ON config_products.center_diamond_group_id = dgm.id
     LEFT JOIN ( SELECT cpdo.config_product_id,
            sum(
                CASE
                    WHEN lower(cpdo.product_type::text) <> 'band'::text THEN COALESCE(pdgm.rate * cpdo.dia_count::double precision * cpdo.dia_weight, 0::double precision)
                    ELSE 0::double precision
                END) AS without_band_diamond_price,
            COALESCE(sum(pdgm.rate * cpdo.dia_count::double precision * cpdo.dia_weight), 0::double precision) AS with_band_diamond_price
           FROM config_product_diamonds cpdo
             JOIN diamond_group_masters pdgm ON pdgm.id = cpdo.id_diamond_group
          GROUP BY cpdo.config_product_id) product_diamond_detail ON product_diamond_detail.config_product_id = config_products.id
     LEFT JOIN ( SELECT config_product_diamonds.config_product_id,
            config_product_diamonds.dia_stone,
            config_product_diamonds.dia_count,
            config_product_diamonds.dia_weight,
            config_product_diamonds.product_type
           FROM config_product_diamonds
          WHERE lower(config_product_diamonds.product_type::text) = 'side'::text) side_diamond ON side_diamond.config_product_id = config_products.id
  WHERE config_products.is_deleted = '0'::"bit"
  GROUP BY config_products.id, side_diamond.dia_stone, cpmo.karat_id, dgm.rate, product_diamond_detail.without_band_diamond_price, product_diamond_detail.with_band_diamond_price, metal_masters.id, gold_kts.id, dgm.synthetic_rate
WITH DATA;

ALTER TABLE IF EXISTS public.ring_three_stone_configurator_price_view
    OWNER TO postgres;


/* bracelet three stone configurator product column change  */

ALTER TABLE IF EXISTS public.config_bracelet_products
    RENAME "style_no_WB" TO bracelet_no;



-- View: public.eternity_band_configurator_price_view

-- DROP MATERIALIZED VIEW IF EXISTS public.eternity_band_configurator_price_view;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.eternity_band_configurator_price_view
TABLESPACE pg_default
AS
 SELECT cebp.id,
    cebp.side_setting_id,
    cebp.product_title,
    cebp.product_sort_des,
    cebp.product_long_des,
    cebp.sku,
    cebp.slug,
    cebp.dia_cts,
    cebp.dia_shape_id,
    cebp.dia_clarity_id,
    cebp.dia_cut_id,
    cebp.dia_mm_id,
    cebp.dia_color,
    cebp.diamond_group_id,
    cebp.product_size,
    cebp.product_length,
    cebp.product_combo_type,
    cebp.style_no,
    cebp.id_stone,
    cebp.dia_type,
    cebp.labour_charge,
    cebp.other_charge,
    cebp.prod_dia_total_count,
    cebp.alternate_dia_count,
    cebp.dia_count,
    cebpmo.karat_id,
    cebpmo.metal_id,
    cebpdo.dia_cuts AS alt_dia_cuts,
    cebpdo.dia_stone AS alt_dia_stone,
    cebpdo.dia_cts AS alt_dia_cts,
    cebpdo.dia_shape AS alt_dia_shape,
    cebpdo.diamond_type AS alt_diamond_type,
    cebpdo.dia_weight AS alt_dia_weight,
    cebpdo.dia_color AS alt_dia_color,
    cebpdo.dia_clarity AS alt_dia_clarity,
    cebpdo.id_diamond_group AS alt_id_diamond_group,
    json_build_object('id', cebpmo.id, 'config_eternity_id', cebpmo.config_eternity_id, 'karat_id', cebpmo.karat_id, 'metal_id', cebpmo.metal_id, 'metal_wt', cebpmo.metal_wt, 'karat_value', gold_kts.name, 'metal_rate', metal_masters.metal_rate, 'calculate_rate', metal_masters.calculate_rate) AS metal,
        CASE
            WHEN cebpdo.dia_stone IS NOT NULL THEN json_build_object('id', cebpdo.id, 'config_eternity_product_id', cebpdo.config_eternity_product_id, 'dia_clarity', cebpdo.dia_clarity, 'dia_color', cebpdo.dia_color, 'dia_count', cebpdo.dia_count, 'dia_cts', cebpdo.dia_cts, 'dia_cuts', cebpdo.dia_cuts, 'dia_mm_size', cebpdo.dia_mm_size, 'dia_shape', cebpdo.dia_shape, 'dia_stone', cebpdo.dia_stone, 'dia_weight', cebpdo.dia_weight, 'diamond_type', cebpdo.diamond_type, 'id_diamond_group', cebpdo.id_diamond_group, 'rate', dgmp.rate)
            ELSE NULL::json
        END AS diamonds,
        CASE
            WHEN cebpmo.karat_id IS NULL THEN
            CASE
                WHEN cebp.product_combo_type = 1 OR cebp.product_combo_type = 3 THEN COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                    ELSE dgm.rate
                END * cebp.dia_count * carat_sizes.value::double precision, 0::double precision)
                ELSE COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgmp.synthetic_rate
                    ELSE dgmp.rate
                END * cebpdo.dia_count::double precision * carat_size_sd.value::double precision, 0::double precision) + COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                    ELSE dgm.rate
                END * cebp.dia_count * carat_sizes.value::double precision, 0::double precision)
            END + metal_masters.metal_rate * cebpmo.metal_wt + COALESCE(cebp.labour_charge, 0::double precision) + COALESCE(cebp.other_charge, 0::double precision)
            ELSE
            CASE
                WHEN cebp.product_combo_type = 1 OR cebp.product_combo_type = 3 THEN COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                    ELSE dgm.rate
                END * cebp.prod_dia_total_count * carat_sizes.value::double precision, 0::double precision)
                ELSE COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgmp.synthetic_rate
                    ELSE dgmp.rate
                END * cebpdo.dia_count::double precision * carat_size_sd.value::double precision, 0::double precision) + COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                    ELSE dgm.rate
                END * cebp.alternate_dia_count * carat_sizes.value::double precision, 0::double precision)
            END + metal_masters.metal_rate / metal_masters.calculate_rate * gold_kts.name::double precision / 24::double precision * cebpmo.metal_wt + COALESCE(cebp.labour_charge, 0::double precision) + COALESCE(cebp.other_charge, 0::double precision)
        END AS calculated_value
   FROM config_eternity_products cebp
     JOIN config_eternity_product_metals cebpmo ON cebpmo.config_eternity_id = cebp.id
     LEFT JOIN diamond_group_masters dgm ON dgm.id = cebp.diamond_group_id
     LEFT JOIN carat_sizes ON dgm.id_carat = carat_sizes.id
     LEFT JOIN metal_masters ON metal_masters.id = cebpmo.metal_id
     LEFT JOIN gold_kts ON gold_kts.id = cebpmo.karat_id
     LEFT JOIN config_eternity_product_diamonds cebpdo ON cebpdo.config_eternity_product_id = cebp.id AND cebpdo.is_deleted = '0'::"bit"
     LEFT JOIN diamond_group_masters dgmp ON dgmp.id = cebpdo.id_diamond_group
     LEFT JOIN carat_sizes carat_size_sd ON dgmp.id_carat = carat_size_sd.id
  WHERE cebp.is_deleted = '0'::"bit"
WITH DATA;

ALTER TABLE IF EXISTS public.eternity_band_configurator_price_view
    OWNER TO postgres;

-- View: public.bracelet_configurator_price_view

-- DROP MATERIALIZED VIEW IF EXISTS public.bracelet_configurator_price_view;
ALTER TABLE IF EXISTS public.config_bracelet_products
    ADD COLUMN metal_weight_type character varying;
    
CREATE MATERIALIZED VIEW IF NOT EXISTS public.bracelet_configurator_price_view
TABLESPACE pg_default
AS
 SELECT config_bracelet_products.id,
    config_bracelet_products.product_type,
    config_bracelet_products.product_style,
    config_bracelet_products.product_length,
    config_bracelet_products.setting_type,
    config_bracelet_products.hook_type,
    config_bracelet_products.dia_total_wt,
    config_bracelet_products.style_no,
    config_bracelet_products.bracelet_no,
    config_bracelet_products.product_title,
    config_bracelet_products.sku,
    config_bracelet_products.slug,
    config_bracelet_products.product_sort_des,
    config_bracelet_products.product_long_des,
    config_bracelet_product_metals.id_metal,
    config_bracelet_product_metals.id_karat,
    config_bracelet_products.product_dia_type,
    config_bracelet_products.metal_weight_type,
    carat_sizes.value AS total_diamond_wt,
        CASE
            WHEN config_bracelet_product_metals.id_karat IS NULL THEN metal_masters.metal_rate * config_bracelet_product_metals.metal_wt + product_diamond_details.diamond_rate
            ELSE metal_masters.metal_rate / metal_masters.calculate_rate * gold_kts.name::double precision / 24::double precision * config_bracelet_product_metals.metal_wt + config_bracelet_product_metals.labour_charge + product_diamond_details.diamond_rate
        END AS product_price,
    json_build_object('id', config_bracelet_product_metals.id, 'config_product_id', config_bracelet_product_metals.config_product_id, 'id_metal', config_bracelet_product_metals.id_metal, 'id_karat', config_bracelet_product_metals.id_karat, 'metal_name', metal_masters.name, 'karat_value', gold_kts.name, 'labour_charge', config_bracelet_product_metals.labour_charge, 'metal_wt', config_bracelet_product_metals.metal_wt) AS metals,
    jsonb_agg(DISTINCT jsonb_build_object('id', cbpdo.id, 'config_product_id', cbpdo.config_product_id, 'stone_type', cbpdo.stone_type, 'id_stone', cbpdo.id_stone, 'id_shape', cbpdo.id_shape, 'id_mm_size', cbpdo.id_mm_size, 'id_color', cbpdo.id_color, 'id_clarity', cbpdo.id_clarity, 'id_cut', cbpdo.id_cut, 'id_carat', cbpdo.id_carat, 'dia_wt', cbpdo.dia_wt, 'dia_count', cbpdo.dia_count, 'id_diamond_group_master', cbpdo.id_diamond_group_master, 'diamond_shape_name', pds.name, 'diamond_cut_value', cuts.value, 'diamond_clarity_value', clarities.value, 'diamond_color_name', colors.value, 'stone_name', psd.name, 'stone_sort_code', psd.sort_code, 'alternate_stone', cbpdo.alternate_stone)) AS diamond_details,
    sum(
        CASE
            WHEN lower(cbpdo.stone_type::text) = 'gemstone'::text THEN 1
            ELSE 0
        END) AS gemstone_count,
    sum(
        CASE
            WHEN lower(cbpdo.stone_type::text) = 'diamond'::text THEN 1
            ELSE 0
        END) AS diamond_count,
    sum(
        CASE
            WHEN lower(cbpdo.alternate_stone::text) IS NOT NULL THEN 1
            ELSE 0
        END) AS alternate_stone,
        CASE
            WHEN sum(
            CASE
                WHEN lower(cbpdo.stone_type::text) = 'diamond'::text THEN 1
                ELSE 0
            END) >= 1 AND sum(
            CASE
                WHEN lower(cbpdo.stone_type::text) = 'gemstone'::text THEN 1
                ELSE 0
            END) <= 0 THEN 'diamond'::text
            WHEN sum(
            CASE
                WHEN lower(cbpdo.stone_type::text) = 'diamond'::text THEN 1
                ELSE 0
            END) <= 0 AND sum(
            CASE
                WHEN lower(cbpdo.stone_type::text) = 'gemstone'::text THEN 1
                ELSE 0
            END) >= 1 THEN 'gemstone'::text
            WHEN sum(
            CASE
                WHEN lower(cbpdo.stone_type::text) = 'diamond'::text THEN 1
                ELSE 0
            END) >= 1 AND sum(
            CASE
                WHEN lower(cbpdo.stone_type::text) = 'gemstone'::text THEN 1
                ELSE 0
            END) >= 1 THEN 'diamond-gemstone'::text
            ELSE NULL::text
        END AS stone_combination_type
   FROM config_bracelet_products
     LEFT JOIN carat_sizes ON carat_sizes.id::double precision = config_bracelet_products.dia_total_wt
     JOIN config_bracelet_product_metals ON config_bracelet_product_metals.config_product_id = config_bracelet_products.id
     LEFT JOIN config_bracelet_product_diamonds cbpdo ON cbpdo.config_product_id = config_bracelet_products.id
     LEFT JOIN diamond_shapes pds ON pds.id = cbpdo.id_shape
     LEFT JOIN gemstones psd ON psd.id = cbpdo.id_stone
     LEFT JOIN colors ON colors.id = cbpdo.id_color
     LEFT JOIN clarities ON clarities.id = cbpdo.id_clarity
     LEFT JOIN cuts ON cuts.id = cbpdo.id_cut
     LEFT JOIN ( SELECT cpdo.config_product_id,
            COALESCE(sum(pdgm.rate * cpdo.dia_count::double precision * cpdo.dia_wt), 0::double precision) AS diamond_rate
           FROM config_bracelet_product_diamonds cpdo
             LEFT JOIN diamond_group_masters pdgm ON pdgm.id = cpdo.id_diamond_group_master
          GROUP BY cpdo.config_product_id) product_diamond_details ON product_diamond_details.config_product_id = config_bracelet_products.id
     LEFT JOIN metal_masters ON config_bracelet_product_metals.id_metal = metal_masters.id
     LEFT JOIN gold_kts ON config_bracelet_product_metals.id_karat = gold_kts.id
  GROUP BY config_bracelet_products.id, config_bracelet_product_metals.id_metal, config_bracelet_product_metals.id_karat, carat_sizes.value, metal_masters.id, config_bracelet_product_metals.id, product_diamond_details.diamond_rate, gold_kts.id
WITH DATA;

ALTER TABLE IF EXISTS public.bracelet_configurator_price_view
    OWNER TO postgres;


-- Table: public.shipping_charges

-- DROP TABLE IF EXISTS public.shipping_charges;

CREATE TABLE IF NOT EXISTS public.shipping_charges
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    amount double precision NOT NULL,
    is_active bit(1) NOT NULL DEFAULT '1'::"bit",
    is_deleted bit(1) NOT NULL DEFAULT '0'::"bit",
    min_amount double precision,
    max_amount double precision,
    created_date timestamp with time zone NOT NULL,
    created_by integer,
    modified_date timestamp with time zone,
    modified_by integer,
    CONSTRAINT shipping_charges_pkey PRIMARY KEY (id),
    CONSTRAINT fk_create_by_user FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_by_user FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.shipping_charges
    OWNER to postgres;

/* template 6 */

CREATE TYPE public.template_six_type AS ENUM
    ('banner', 'diamond_shape_section', 'category_section', 'sparkling_section', 'shape_marque', 'event_section', 'style_section');

ALTER TYPE public.template_six_type
    OWNER TO postgres;

CREATE TABLE IF NOT EXISTS public.template_six
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    title character varying COLLATE pg_catalog."default",
    sub_title character varying COLLATE pg_catalog."default",
    description character varying COLLATE pg_catalog."default",
    button_name character varying COLLATE pg_catalog."default",
    button_color character varying COLLATE pg_catalog."default",
    link character varying COLLATE pg_catalog."default",
    button_text_color character varying COLLATE pg_catalog."default",
    id_image integer,
    id_hover_image integer,
    id_collection integer,
    id_category integer,
    id_style integer,
    sort_order double precision,
    is_button_transparent bit(1),
    button_hover_color character varying COLLATE pg_catalog."default",
    button_text_hover_color character varying COLLATE pg_catalog."default",
    is_active bit(1) NOT NULL DEFAULT '1'::"bit",
    is_deleted bit(1) NOT NULL DEFAULT '0'::"bit",
    created_date timestamp with time zone NOT NULL,
    created_by integer,
    modified_date timestamp with time zone,
    modified_by integer,
    id_diamond_shape integer,
    diamond_shape_type template_three_diamond_shape_section_type,
    hash_tag character varying COLLATE pg_catalog."default",
    section_type template_six_type,
    id_title_image integer,
    id_product integer,
    CONSTRAINT template_six_pkey PRIMARY KEY (id),
    CONSTRAINT fk_collection_id FOREIGN KEY (id_collection)
        REFERENCES public.collections (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_create_user FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_diamond_shape_id FOREIGN KEY (id_diamond_shape)
        REFERENCES public.diamond_shapes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_id_category FOREIGN KEY (id_category)
        REFERENCES public.categories (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_image_hover_id FOREIGN KEY (id_hover_image)
        REFERENCES public.images (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_image_title_id FOREIGN KEY (id_title_image)
        REFERENCES public.images (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_main_image_id FOREIGN KEY (id_image)
        REFERENCES public.images (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_modified_user FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_product_id FOREIGN KEY (id_product)
        REFERENCES public.products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_style_id FOREIGN KEY (id_style)
        REFERENCES public.setting_styles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.template_six
    OWNER to postgres;

/* metal karat changes */

ALTER TABLE IF EXISTS public.gold_kts
    ADD COLUMN calculate_rate double precision NOT NULL DEFAULT 1;

UPDATE gold_kts set calculate_rate = ROUND(CAST(name AS numeric) / 24, 2) WHERE is_deleted = '0'

/* product search history */
CREATE TABLE IF NOT EXISTS public.product_search_histories
(
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    value character varying COLLATE pg_catalog."default" NOT NULL,
    user_id integer,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    CONSTRAINT product_search_history_pkey PRIMARY KEY (id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;


ALTER TABLE IF EXISTS public.product_search_histories
    OWNER to postgres;

ALTER TABLE IF EXISTS public.side_setting_styles
    ADD COLUMN diamond_size_id json;

ALTER TABLE IF EXISTS public.blogs
    ADD COLUMN is_default bit(1) DEFAULT '0'::"bit";

ALTER TABLE IF EXISTS public.blogs
    ADD COLUMN id_category integer;

-- DROP TABLE IF EXISTS public.blog_categories;

CREATE TABLE IF NOT EXISTS public.blog_categories
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    slug character varying COLLATE pg_catalog."default",
    created_date timestamp with time zone NOT NULL,
    created_by integer,
    modified_date timestamp with time zone,
    modified_by integer,
    is_active bit(1) NOT NULL DEFAULT '1'::"bit",
    is_deleted bit(1) NOT NULL DEFAULT '0'::"bit",
    CONSTRAINT blog_categories_pkey PRIMARY KEY (id),
    CONSTRAINT fk_created_user FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_user FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.blog_categories
    OWNER to postgres;


ALTER TABLE IF EXISTS public.products
    ADD COLUMN is_customization bit DEFAULT '0';

ALTER TABLE IF EXISTS public.products
    ADD COLUMN parent_id integer;



DROP MATERIALIZED VIEW IF EXISTS public.product_list_view;
CREATE MATERIALIZED VIEW IF NOT EXISTS public.product_list_view
 AS
 WITH filtered_pmo AS (
         SELECT DISTINCT ON (pmo.id_product) pmo.id,
            pmo.id_product,
            pmo.id_metal_group,
            pmo.metal_weight,
            pmo.is_deleted,
            pmo.created_by,
            pmo.created_date,
            pmo.modified_by,
            pmo.modified_date,
            pmo.is_default,
            pmo.id_metal,
            pmo.id_karat,
            pmo.id_metal_tone,
            pmo.retail_price,
            pmo.compare_price,
            pmo.id_size,
            pmo.id_length,
            pmo.quantity,
            pmo.side_dia_weight,
            pmo.side_dia_count,
            pmo.remaing_quantity_count,
            pmo.id_m_tone,
            pmo.center_diamond_price,
            karats.name
           FROM product_metal_options pmo
             LEFT JOIN gold_kts karats ON karats.id = pmo.id_karat
          WHERE pmo.is_deleted = '0'::"bit"
          ORDER BY pmo.id_product, karats.name
        ), product_images_data AS (
         SELECT product_images.id_product,
            product_images.id AS image_id,
            concat('https://d1d4axu56w21qu.cloudfront.net/', product_images.image_path) AS image_path,
            product_images.id_metal_tone,
            product_images.image_type
           FROM product_images
          WHERE product_images.is_deleted = '0'::"bit" AND product_images.image_type = 1
        ), sum_price AS (
         SELECT pdo_1.id_product,
            sum(dgm_1.rate * pdo_1.weight::double precision * pdo_1.count::double precision) AS sum_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND (pdo_1.id_type = 2 OR 'undefined'::text <> '1'::text)
          GROUP BY pdo_1.id_product
        )
 SELECT products.id,
    products.name,
    products.sku,
    products.slug,
    products.created_date,
    products.product_type,
    products.setting_style_type,
    products.gender,
    products.id_collection,
    products.id_brand,
    products.setting_diamond_shapes,
    products.is_trending,
	products.parent_id,
	products.is_customization,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_categories.id, 'id_category', product_categories.id_category, 'id_sub_category', product_categories.id_sub_category, 'id_sub_sub_category', product_categories.id_sub_sub_category, 'category_name', categories.slug, 'sub_category_name', sub_categories.slug, 'sub_sub_category', sub_sub_categories.slug)) AS product_categories,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_images_data.image_id, 'image_path', product_images_data.image_path, 'id_metal_tone', product_images_data.id_metal_tone, 'image_type', product_images_data.image_type)) AS product_images,
    jsonb_agg(DISTINCT jsonb_build_object('id', filtered_pmo.id, 'id_metal', filtered_pmo.id_metal, 'id_karat', filtered_pmo.id_karat, 'id_size', filtered_pmo.id_size, 'id_length', filtered_pmo.id_length, 'id_m_tone', filtered_pmo.id_m_tone, 'quantity', filtered_pmo.remaing_quantity_count, 'wishlist_id', NULL::unknown, 'metal_tone',
        CASE
            WHEN filtered_pmo.id_metal_tone IS NULL THEN '{}'::integer[]
            ELSE string_to_array(filtered_pmo.id_metal_tone::text, '|'::text)::integer[]
        END, 'gold_karat', filtered_pmo.name, 'catalogue_design_price', filtered_pmo.retail_price, 'Price',
        CASE
            WHEN products.product_type = 2 THEN
            CASE
                WHEN 'undefined'::text = '1'::text THEN filtered_pmo.retail_price - COALESCE(filtered_pmo.center_diamond_price, 0::numeric)::double precision
                ELSE products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.retail_price
            END
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.name::double precision / 24::double precision * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END, 'compare_price',
        CASE
            WHEN products.product_type = 2 THEN products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.compare_price
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.name::double precision / 24::double precision * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END)) AS pmo,
    jsonb_agg(DISTINCT jsonb_build_object('id', pdo.id, 'weight', pdo.weight, 'count', pdo.count, 'id_shape',
        CASE
            WHEN products.product_type = 1 THEN dgm.id_shape
            ELSE pdo.id_shape
        END, 'id_stone', pdo.id_stone, 'id_color', pdo.id_color, 'id_clarity', pdo.id_clarity,'id_type', pdo.id_type)) AS pdo
   FROM products
     LEFT JOIN product_images_data ON product_images_data.id_product = products.id
     LEFT JOIN product_categories ON product_categories.id_product = products.id
     LEFT JOIN categories ON categories.id = product_categories.id_category
     LEFT JOIN categories sub_categories ON sub_categories.id = product_categories.id_sub_category
     LEFT JOIN categories sub_sub_categories ON sub_sub_categories.id = product_categories.id_sub_sub_category
     LEFT JOIN filtered_pmo ON filtered_pmo.id_product = products.id
     LEFT JOIN metal_masters metal_master ON metal_master.id = filtered_pmo.id_metal
     LEFT JOIN product_diamond_options pdo ON pdo.id_product = products.id AND pdo.is_deleted = '0'::"bit"
     LEFT JOIN diamond_group_masters dgm ON dgm.id = pdo.id_diamond_group
     LEFT JOIN sum_price ON sum_price.id_product = products.id
  WHERE products.is_deleted = '0'::"bit" AND products.is_active = '1'::"bit"
  GROUP BY products.id
 WITH DATA;

ALTER TABLE IF EXISTS public.product_list_view
  OWNER TO postgres;

/* login & registration with third party */


ALTER TABLE IF EXISTS public.customer_users
    ADD COLUMN sign_up_type sign_up_type DEFAULT 'system';

ALTER TABLE IF EXISTS public.customer_users
    ADD COLUMN third_party_response json;


CREATE TYPE public.sign_up_type AS ENUM
    ('system', 'google', 'instagram', 'facebook', 'apple');

ALTER TYPE public.sign_up_type
    OWNER TO postgres;


ALTER TABLE IF EXISTS public.customer_users
    ALTER COLUMN mobile DROP NOT NULL;

ALTER TABLE IF EXISTS public.app_users
    ALTER COLUMN pass_hash DROP NOT NULL;

ALTER TABLE IF EXISTS public.app_users
    ADD COLUMN otp_create_date timestamp with time zone;

ALTER TABLE IF EXISTS public.app_users
    ADD COLUMN otp_expire_date timestamp with time zone;

ALTER TABLE IF EXISTS public.customer_users
    ADD COLUMN gender customer_gender;

CREATE TYPE public.customer_gender AS ENUM
    ('male', 'female', 'other');

ALTER TYPE public.customer_gender
    OWNER TO postgres;


ALTER TABLE IF EXISTS public.orders
    ADD COLUMN delivery_days integer DEFAULT 25;
    
ALTER TABLE IF EXISTS public.enquiries
    ALTER COLUMN last_name DROP NOT NULL;

ALTER TABLE IF EXISTS public.blogs
    ADD COLUMN sort_des character varying;

ALTER TABLE IF EXISTS public.blog_categories
    ADD COLUMN sort_order integer;


ALTER TYPE public.template_six_type
    ADD VALUE 'instagram_section' AFTER 'style_section';

ALTER TABLE IF EXISTS public.template_six DROP CONSTRAINT IF EXISTS fk_product_id;

ALTER TABLE IF EXISTS public.enquiries
    ALTER COLUMN last_name DROP NOT NULL;


-- View: public.product_list_view

DROP MATERIALIZED VIEW IF EXISTS public.product_list_view;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.product_list_view
TABLESPACE pg_default
AS
 WITH filtered_pmo AS (
         SELECT DISTINCT ON (pmo.id_product) pmo.id,
            pmo.id_product,
            pmo.id_metal_group,
            pmo.metal_weight,
            pmo.is_deleted,
            pmo.created_by,
            pmo.created_date,
            pmo.modified_by,
            pmo.modified_date,
            pmo.is_default,
            pmo.id_metal,
            pmo.id_karat,
            pmo.id_metal_tone,
            pmo.retail_price,
            pmo.compare_price,
            pmo.id_size,
            pmo.id_length,
            pmo.quantity,
            pmo.side_dia_weight,
            pmo.side_dia_count,
            pmo.remaing_quantity_count,
            pmo.id_m_tone,
            pmo.center_diamond_price,
            karats.name,
            karats.calculate_rate AS karat_calculate_rate
           FROM product_metal_options pmo
             LEFT JOIN gold_kts karats ON karats.id = pmo.id_karat
          WHERE pmo.is_deleted = '0'::"bit"
          ORDER BY pmo.id_product, karats.name
        ), product_images_data AS (
         SELECT product_images.id_product,
            product_images.id AS image_id,
            concat('https://dobz5rvtb86np.cloudfront.net/', product_images.image_path) AS image_path,
            product_images.id_metal_tone,
            product_images.image_type
           FROM product_images
          WHERE product_images.is_deleted = '0'::"bit" AND product_images.image_type = 1
        ), sum_price AS (
         SELECT pdo_1.id_product,
            sum(dgm_1.rate * pdo_1.weight::double precision * pdo_1.count::double precision) AS sum_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND (pdo_1.id_type = 2 OR 'undefined'::text <> '1'::text)
          GROUP BY pdo_1.id_product
        )
 SELECT products.id,
    products.name,
    products.sku,
    products.slug,
    products.sort_description,
    products.created_date,
    products.product_type,
    products.setting_style_type,
    products.gender,
    products.id_collection,
    products.id_brand,
    products.setting_diamond_shapes,
    products.is_trending,
    products.parent_id,
    products.is_customization,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_categories.id, 'id_category', product_categories.id_category, 'id_sub_category', product_categories.id_sub_category, 'id_sub_sub_category', product_categories.id_sub_sub_category, 'category_name', categories.slug, 'sub_category_name', sub_categories.slug, 'sub_sub_category', sub_sub_categories.slug)) AS product_categories,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_images_data.image_id, 'image_path', product_images_data.image_path, 'id_metal_tone', product_images_data.id_metal_tone, 'image_type', product_images_data.image_type)) AS product_images,
    jsonb_agg(DISTINCT jsonb_build_object('id', filtered_pmo.id, 'id_metal', filtered_pmo.id_metal, 'id_karat', filtered_pmo.id_karat, 'id_size', filtered_pmo.id_size, 'id_length', filtered_pmo.id_length, 'id_m_tone', filtered_pmo.id_m_tone, 'quantity', filtered_pmo.remaing_quantity_count, 'wishlist_id', NULL::unknown, 'metal_tone',
        CASE
            WHEN filtered_pmo.id_metal_tone IS NULL THEN '{}'::integer[]
            ELSE string_to_array(filtered_pmo.id_metal_tone::text, '|'::text)::integer[]
        END, 'gold_karat', filtered_pmo.name, 'catalogue_design_price', filtered_pmo.retail_price, 'Price',
        CEIL(CASE
            WHEN products.product_type = 2 THEN
            CASE
                WHEN 'undefined'::text = '1'::text THEN filtered_pmo.retail_price - COALESCE(filtered_pmo.center_diamond_price, 0::numeric)::double precision
                ELSE products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.retail_price
            END
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END), 'compare_price',
        CEIL(CASE
            WHEN products.product_type = 2 THEN products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.compare_price
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END))) AS pmo,
    jsonb_agg(DISTINCT jsonb_build_object('id', pdo.id, 'weight', pdo.weight, 'count', pdo.count, 'id_shape',
        CASE
            WHEN products.product_type = 1 THEN dgm.id_shape
            ELSE pdo.id_shape
        END, 'id_stone', pdo.id_stone, 'id_color', pdo.id_color, 'id_clarity', pdo.id_clarity, 'id_type', pdo.id_type)) AS pdo
   FROM products
     LEFT JOIN product_images_data ON product_images_data.id_product = products.id
     LEFT JOIN product_categories ON product_categories.id_product = products.id AND product_categories.is_deleted = '0'::"bit"
     LEFT JOIN categories ON categories.id = product_categories.id_category
     LEFT JOIN categories sub_categories ON sub_categories.id = product_categories.id_sub_category
     LEFT JOIN categories sub_sub_categories ON sub_sub_categories.id = product_categories.id_sub_sub_category
     LEFT JOIN filtered_pmo ON filtered_pmo.id_product = products.id
     LEFT JOIN metal_masters metal_master ON metal_master.id = filtered_pmo.id_metal AND metal_master.is_deleted = '0'::"bit"
     LEFT JOIN product_diamond_options pdo ON pdo.id_product = products.id AND pdo.is_deleted = '0'::"bit"
     LEFT JOIN diamond_group_masters dgm ON dgm.id = pdo.id_diamond_group AND dgm.is_deleted = '0'::"bit"
     LEFT JOIN sum_price ON sum_price.id_product = products.id
  WHERE products.is_deleted = '0'::"bit" AND products.is_active = '1'::"bit"
  GROUP BY products.id
WITH DATA;

ALTER TABLE IF EXISTS public.product_list_view
    OWNER TO postgres;


ALTER TABLE public.addresses 
ALTER COLUMN pincode TYPE character varying USING pincode::character varying;


DROP MATERIALIZED VIEW IF EXISTS public.ring_three_stone_configurator_price_view;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.ring_three_stone_configurator_price_view
TABLESPACE pg_default
AS   
	   WITH productmetal AS ( 
	   SELECT cpmo.config_product_id,
            max(cpmo.karat_id) AS karat_id,
            max(cpmo.metal_id) AS metal_id,
            sum(cpmo.metal_wt *
                CASE
                    WHEN cpmo.karat_id IS NULL THEN metal_master.metal_rate
                    ELSE metal_master.metal_rate / metal_master.calculate_rate * gold_kts.calculate_rate
                END + COALESCE(cpmo.labor_charge, 0::double precision)) AS metal_rate,
            sum(
                CASE
                    WHEN lower(cpmo.head_shank_band::text) = 'band'::text THEN 0::double precision
                    ELSE cpmo.metal_wt *
                    CASE
                        WHEN cpmo.karat_id IS NULL THEN metal_master.metal_rate
                        ELSE metal_master.metal_rate / metal_master.calculate_rate * gold_kts.calculate_rate
                    END + COALESCE(cpmo.labor_charge, 0::double precision)
                END) AS without_band_metal_rate
           FROM config_product_metals cpmo
             LEFT JOIN metal_masters metal_master ON metal_master.id = cpmo.metal_id
             LEFT JOIN gold_kts ON gold_kts.id = cpmo.karat_id
          GROUP BY cpmo.config_product_id
        ), productdiamond AS (
         SELECT cpdo.config_product_id,
			SUM(cpdo.dia_stone) FILTER (WHERE LOWER(cpdo.product_type)::text ~~* 'side'::text) as dia_stone,
            jsonb_agg(DISTINCT jsonb_build_object('dia_count', cpdo.dia_count, 'dia_weight', cpdo.dia_weight, 'product_type', cpdo.product_type)) FILTER (WHERE LOWER(cpdo.product_type)::text ~~* 'side'::text) AS cpdo,
            COALESCE(sum(pdgm.rate * cpdo.dia_count * cpdo.DIA_WEIGHT), 0::double precision) AS diamond_rate,
            COALESCE(sum(
                CASE
                    WHEN cpdo.product_type::text ~~* 'band'::text THEN 0::double precision
                    ELSE pdgm.rate * cpdo.dia_count * cpdo.DIA_WEIGHT
                END), 0::double precision) AS without_band_diamond_rate
           FROM config_product_diamonds cpdo
             LEFT JOIN diamond_group_masters pdgm ON cpdo.id_diamond_group = pdgm.id
          GROUP BY cpdo.config_product_id
        ), productprice AS (
         SELECT cp_1.id AS config_product_id,
            ceil(
                CASE
                    WHEN cp_1.center_dia_type = 1 THEN dgm.rate
                    ELSE dgm.synthetic_rate
                END 
				+ COALESCE(cp_1.laber_charge, 0::double precision) 
				+ COALESCE(pm_1.metal_rate, 0::double precision) 
				+ COALESCE(pd_1.diamond_rate, 0::double precision)
			) AS with_band_price,
            ceil(
                CASE
                    WHEN cp_1.center_dia_type = 1 THEN dgm.rate
                    ELSE dgm.synthetic_rate
                END + COALESCE(cp_1.laber_charge, 0::double precision) + COALESCE(pm_1.without_band_metal_rate, 0::double precision) + COALESCE(pd_1.without_band_diamond_rate, 0::double precision)) AS without_band_price
           FROM config_products cp_1
             LEFT JOIN diamond_group_masters dgm ON cp_1.center_diamond_group_id = dgm.id
             LEFT JOIN productmetal pm_1 ON cp_1.id = pm_1.config_product_id
             LEFT JOIN productdiamond pd_1 ON cp_1.id = pd_1.config_product_id
        )
 SELECT cp.id,
    pd.cpdo,
	pd.dia_stone,
    cp.sku,
    cp.product_title,
    cp.product_sort_des,
    cp.product_long_des,
    cp.slug,
    cp.head_no,
    cp.shank_no,
    cp.band_no,
    cp.ring_no,
    cp.head_type_id,
    cp.center_diamond_group_id,
    cp.shank_type_id,
    cp.side_setting_id,
    cp.product_type,
    cp.style_no,
    cp.center_dia_type,
    pm.metal_id,
    pm.karat_id,
    pp.with_band_price,
    pp.without_band_price
   FROM config_products cp
     LEFT JOIN productprice pp ON cp.id = pp.config_product_id
     LEFT JOIN productmetal pm ON cp.id = pm.config_product_id
     LEFT JOIN productdiamond pd ON cp.id = pd.config_product_id
WITH DATA;

ALTER TABLE IF EXISTS public.ring_three_stone_configurator_price_view
    OWNER TO postgres;

/* -------------- about use section -------------------- */


CREATE TYPE public.about_us_section_type AS ENUM
    ('banner', 'features_section', 'marketing_section');

ALTER TYPE public.about_us_section_type
    OWNER TO postgres;


CREATE TABLE IF NOT EXISTS public.about_us
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    title character varying COLLATE pg_catalog."default",
    sub_title character varying COLLATE pg_catalog."default",
    button_name character varying COLLATE pg_catalog."default",
    button_color character varying COLLATE pg_catalog."default",
    button_text_color character varying COLLATE pg_catalog."default",
    link character varying COLLATE pg_catalog."default",
    content character varying COLLATE pg_catalog."default",
    button_hover_color character varying COLLATE pg_catalog."default",
    button_text_hover_color character varying COLLATE pg_catalog."default",
    id_image integer,
    is_active bit(1) NOT NULL DEFAULT '1'::"bit",
    is_deleted bit(1) NOT NULL DEFAULT '0'::"bit",
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by integer,
    modified_by integer,
    section_type about_us_section_type,
    sort_order integer,
    is_button_transparent bit(1) NOT NULL DEFAULT '0'::"bit",
    CONSTRAINT about_us_pkey PRIMARY KEY (id),
    CONSTRAINT fk_created_user_id FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_image_id FOREIGN KEY (id_image)
        REFERENCES public.images (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_user_id FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.about_us
    OWNER to postgres;


ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN gst_number character varying;

ALTER TABLE IF EXISTS public.role_api_permissions DROP CONSTRAINT IF EXISTS unq_api_endpoint_http_method;

ALTER TABLE IF EXISTS public.role_api_permissions
    ADD CONSTRAINT unq_api_endpoint_http_method UNIQUE (id_menu_item, api_endpoint, http_method);

/* ---------------- Ring Configurator ----------------- */

DROP MATERIALIZED VIEW IF EXISTS public.ring_three_stone_configurator_price_view;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.ring_three_stone_configurator_price_view
TABLESPACE pg_default
AS
 WITH productmetal AS (
         SELECT cpmo.config_product_id,
            max(cpmo.karat_id) AS karat_id,
            max(cpmo.metal_id) AS metal_id,
            sum(
                CASE
                    WHEN lower(cpmo.head_shank_band::text) = 'band'::text THEN 0::double precision
                    ELSE cpmo.metal_wt
                END) AS metal_weight,
            sum(cpmo.metal_wt) AS with_band_metal_weight,
            sum(cpmo.metal_wt *
                CASE
                    WHEN cpmo.karat_id IS NULL THEN metal_master.metal_rate
                    ELSE metal_master.metal_rate / metal_master.calculate_rate * gold_kts.calculate_rate
                END + COALESCE(cpmo.labor_charge, 0::double precision)) AS metal_rate,
            sum(
                CASE
                    WHEN lower(cpmo.head_shank_band::text) = 'band'::text THEN 0::double precision
                    ELSE cpmo.metal_wt *
                    CASE
                        WHEN cpmo.karat_id IS NULL THEN metal_master.metal_rate
                        ELSE metal_master.metal_rate / metal_master.calculate_rate * gold_kts.calculate_rate
                    END + COALESCE(cpmo.labor_charge, 0::double precision)
                END) AS without_band_metal_rate
           FROM config_product_metals cpmo
             LEFT JOIN metal_masters metal_master ON metal_master.id = cpmo.metal_id
             LEFT JOIN gold_kts ON gold_kts.id = cpmo.karat_id
          GROUP BY cpmo.config_product_id
        ), productdiamond AS (
         SELECT cpdo.config_product_id,
            sum(cpdo.dia_stone) FILTER (WHERE lower(cpdo.product_type::text) ~~* 'side'::text) AS dia_stone,
            jsonb_agg(DISTINCT jsonb_build_object('dia_count', cpdo.dia_count, 'dia_weight', cpdo.dia_weight, 'product_type', cpdo.product_type)) FILTER (WHERE lower(cpdo.product_type::text) ~~* 'side'::text) AS cpdo,
            COALESCE(sum(pdgm.rate * cpdo.dia_count::double precision * cpdo.dia_weight), 0::double precision) AS diamond_rate,
            COALESCE(sum(cpdo.dia_count::double precision * cpdo.dia_weight), 0::double precision) AS with_band_diamond_weight,
            COALESCE(sum(
                CASE
                    WHEN cpdo.product_type::text ~~* 'band'::text THEN 0::double precision
                    ELSE cpdo.dia_count::double precision * cpdo.dia_weight
                END), 0::double precision) AS diamond_weight,
            COALESCE(sum(
                CASE
                    WHEN cpdo.product_type::text ~~* 'band'::text THEN 0::double precision
                    ELSE pdgm.rate * cpdo.dia_count::double precision * cpdo.dia_weight
                END), 0::double precision) AS without_band_diamond_rate
           FROM config_product_diamonds cpdo
             LEFT JOIN diamond_group_masters pdgm ON cpdo.id_diamond_group = pdgm.id
          GROUP BY cpdo.config_product_id
        ), productprice AS (
         SELECT cp_1.id AS config_product_id,
            cz.value AS center_dia_weight,
            ceil(
                CASE
                    WHEN cp_1.center_dia_type = 1 THEN dgm.rate
                    ELSE dgm.synthetic_rate
                END + COALESCE(cp_1.laber_charge, 0::double precision) + COALESCE(pm_1.metal_rate, 0::double precision) + COALESCE(pd_1.diamond_rate, 0::double precision)) AS with_band_price,
            ceil(
                CASE
                    WHEN cp_1.center_dia_type = 1 THEN dgm.rate
                    ELSE dgm.synthetic_rate
                END + COALESCE(cp_1.laber_charge, 0::double precision) + COALESCE(pm_1.without_band_metal_rate, 0::double precision) + COALESCE(pd_1.without_band_diamond_rate, 0::double precision)) AS without_band_price
           FROM config_products cp_1
             LEFT JOIN diamond_group_masters dgm ON cp_1.center_diamond_group_id = dgm.id
             LEFT JOIN carat_sizes cz ON cz.id::double precision = cp_1.center_dia_cts
             LEFT JOIN productmetal pm_1 ON cp_1.id = pm_1.config_product_id
             LEFT JOIN productdiamond pd_1 ON cp_1.id = pd_1.config_product_id
        )
 SELECT cp.id,
    pd.cpdo,
    pd.dia_stone,
    cp.sku,
    cp.product_title,
    cp.product_sort_des,
    cp.product_long_des,
    cp.slug,
    cp.head_no,
    cp.shank_no,
    cp.band_no,
    cp.ring_no,
    cp.head_type_id,
    cp.center_diamond_group_id,
    cp.shank_type_id,
    cp.side_setting_id,
    cp.product_type,
    cp.style_no,
    pd.diamond_weight,
    pd.with_band_diamond_weight,
    cp.center_dia_type,
    pm.metal_id,
    pm.karat_id,
    pm.metal_weight,
    pm.with_band_metal_weight,
    pp.with_band_price,
    pp.without_band_price,
    pp.center_dia_weight
   FROM config_products cp
     LEFT JOIN productprice pp ON cp.id = pp.config_product_id
     LEFT JOIN productmetal pm ON cp.id = pm.config_product_id
     LEFT JOIN productdiamond pd ON cp.id = pd.config_product_id
WITH DATA;

ALTER TABLE IF EXISTS public.ring_three_stone_configurator_price_view
    OWNER TO postgres;

/* -------------------- eternity band configurator View -------------------------- */


DROP MATERIALIZED VIEW IF EXISTS public.eternity_band_configurator_price_view;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.eternity_band_configurator_price_view
TABLESPACE pg_default
AS
 SELECT cebp.id,
    cebp.side_setting_id,
    cebp.product_title,
    cebp.product_sort_des,
    cebp.product_long_des,
    cebp.sku,
    cebp.slug,
    cebp.dia_cts,
    cebp.dia_shape_id,
    cebp.dia_clarity_id,
    cebp.dia_cut_id,
    cebp.dia_mm_id,
    cebp.dia_color,
    cebp.diamond_group_id,
    cebp.product_size,
    cebp.product_length,
    cebp.product_combo_type,
    cebp.style_no,
    cebp.id_stone,
    cebp.dia_type,
    cebp.labour_charge,
    cebp.other_charge,
    cebp.prod_dia_total_count,
    cebp.alternate_dia_count,
    cebp.dia_count,
    cebpmo.karat_id,
    cebpmo.metal_id,
    cebpdo.dia_cuts AS alt_dia_cuts,
    cebpdo.dia_stone AS alt_dia_stone,
    cebpdo.dia_cts AS alt_dia_cts,
    cebpdo.dia_shape AS alt_dia_shape,
    cebpdo.diamond_type AS alt_diamond_type,
    cebpdo.dia_weight AS alt_dia_weight,
    cebp.prod_dia_total_count * carat_sizes.value::double precision AS diamond_weight,
    cebpdo.dia_color AS alt_dia_color,
    cebpdo.dia_clarity AS alt_dia_clarity,
    cebpmo.metal_wt AS metal_weight,
    cebpdo.id_diamond_group AS alt_id_diamond_group,
    json_build_object('id', cebpmo.id, 'config_eternity_id', cebpmo.config_eternity_id, 'karat_id', cebpmo.karat_id, 'metal_id', cebpmo.metal_id, 'metal_wt', cebpmo.metal_wt, 'karat_value', gold_kts.name, 'metal_rate', metal_masters.metal_rate, 'calculate_rate', metal_masters.calculate_rate) AS metal,
        CASE
            WHEN cebpdo.dia_stone IS NOT NULL THEN json_build_object('id', cebpdo.id, 'config_eternity_product_id', cebpdo.config_eternity_product_id, 'dia_clarity', cebpdo.dia_clarity, 'dia_color', cebpdo.dia_color, 'dia_count', cebpdo.dia_count, 'dia_cts', cebpdo.dia_cts, 'dia_cuts', cebpdo.dia_cuts, 'dia_mm_size', cebpdo.dia_mm_size, 'dia_shape', cebpdo.dia_shape, 'dia_stone', cebpdo.dia_stone, 'dia_weight', cebpdo.dia_weight, 'diamond_type', cebpdo.diamond_type, 'id_diamond_group', cebpdo.id_diamond_group, 'rate', dgmp.rate)
            ELSE NULL::json
        END AS diamonds,
        CASE
            WHEN cebpmo.karat_id IS NULL THEN
            CASE
                WHEN cebp.product_combo_type = 1 OR cebp.product_combo_type = 3 THEN COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                    ELSE dgm.rate
                END * cebp.dia_count * carat_sizes.value::double precision, 0::double precision)
                ELSE COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgmp.synthetic_rate
                    ELSE dgmp.rate
                END * cebpdo.dia_count::double precision * carat_size_sd.value::double precision, 0::double precision) + COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                    ELSE dgm.rate
                END * cebp.dia_count * carat_sizes.value::double precision, 0::double precision)
            END + metal_masters.metal_rate * cebpmo.metal_wt + COALESCE(cebp.labour_charge, 0::double precision) + COALESCE(cebp.other_charge, 0::double precision)
            ELSE
            CASE
                WHEN cebp.product_combo_type = 1 OR cebp.product_combo_type = 3 THEN COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                    ELSE dgm.rate
                END * cebp.prod_dia_total_count * carat_sizes.value::double precision, 0::double precision)
                ELSE COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgmp.synthetic_rate
                    ELSE dgmp.rate
                END * cebpdo.dia_count::double precision * carat_size_sd.value::double precision, 0::double precision) + COALESCE(
                CASE
                    WHEN cebp.dia_type = 2 THEN dgm.synthetic_rate
                    ELSE dgm.rate
                END * cebp.alternate_dia_count * carat_sizes.value::double precision, 0::double precision)
            END + metal_masters.metal_rate / metal_masters.calculate_rate * gold_kts.name::double precision / 24::double precision * cebpmo.metal_wt + cebpmo.metal_wt * 3375::double precision + COALESCE(cebp.other_charge, 0::double precision)
        END AS calculated_value
   FROM config_eternity_products cebp
     JOIN config_eternity_product_metals cebpmo ON cebpmo.config_eternity_id = cebp.id
     LEFT JOIN diamond_group_masters dgm ON dgm.id = cebp.diamond_group_id
     LEFT JOIN carat_sizes ON dgm.id_carat = carat_sizes.id
     LEFT JOIN metal_masters ON metal_masters.id = cebpmo.metal_id
     LEFT JOIN gold_kts ON gold_kts.id = cebpmo.karat_id
     LEFT JOIN config_eternity_product_diamonds cebpdo ON cebpdo.config_eternity_product_id = cebp.id AND cebpdo.is_deleted = '0'::"bit"
     LEFT JOIN diamond_group_masters dgmp ON dgmp.id = cebpdo.id_diamond_group
     LEFT JOIN carat_sizes carat_size_sd ON dgmp.id_carat = carat_size_sd.id
  WHERE cebp.is_deleted = '0'::"bit"
WITH DATA;

ALTER TABLE IF EXISTS public.eternity_band_configurator_price_view
    OWNER TO postgres;

/* multi currency module  version 4*/

-- Type: currency_symbol_placement

-- DROP TYPE IF EXISTS public.currency_symbol_placement;

CREATE TYPE public.currency_symbol_placement AS ENUM
    ('left', 'right');

ALTER TYPE public.currency_symbol_placement
    OWNER TO postgres;

ALTER TABLE IF EXISTS public.currency_rates
    ADD COLUMN symbol_placement currency_symbol_placement;

ALTER TABLE IF EXISTS public.currency_rates
    ADD COLUMN symbol character varying;

ALTER TABLE IF EXISTS public.currency_rates
    ADD COLUMN code character varying;

ALTER TABLE IF EXISTS public.currency_rates
    ADD COLUMN decimal_token character varying NOT NULL DEFAULT '.';

ALTER TABLE IF EXISTS public.currency_rates
    ADD COLUMN thousand_token character varying NOT NULL DEFAULT ',';


CREATE TYPE public.currency_rate_find_type AS ENUM
    ('manually', 'free-api');

ALTER TYPE public.currency_rate_find_type
    OWNER TO postgres;

ALTER TABLE IF EXISTS public.currency_rates
    ADD COLUMN is_use_api bit NOT NULL DEFAULT '0';

ALTER TABLE IF EXISTS public.currency_rates
    ADD COLUMN exchange_rate_type currency_rate_find_type NOT NULL DEFAULT 'manually';

ALTER TABLE IF EXISTS public.currency_rates
    ADD COLUMN api_url character varying;

ALTER TABLE IF EXISTS public.currency_rates
    ADD COLUMN api_key character varying;

ALTER TABLE IF EXISTS public.currency_rates DROP CONSTRAINT IF EXISTS currency_rates_currency_unique;


-- Type: template_seven_type

-- DROP TYPE IF EXISTS public.template_seven_type;

CREATE TYPE public.template_seven_type AS ENUM
    ('offers_slider', 'single_offer_top', 'single_offer_bottom', 'attractive_jewelry', 'jewelry_Categories', 'stunning_desgin', 'festive_sale_offer', 'dazzling_and_stylish', 'category_and_products', 'stunning_jewels', 'testimonial', 'template_selevens', 'testimonial_detail', 'new_and_blog');

ALTER TYPE public.template_seven_type
    OWNER TO postgres;

-- Table: public.template_seven

-- DROP TABLE IF EXISTS public.template_seven;

CREATE TABLE IF NOT EXISTS public.template_seven
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    title character varying COLLATE pg_catalog."default",
    sub_title character varying COLLATE pg_catalog."default",
    sub_title_one character varying COLLATE pg_catalog."default",
    description character varying COLLATE pg_catalog."default",
    sub_description character varying COLLATE pg_catalog."default",
    button_name character varying COLLATE pg_catalog."default",
    button_color character varying COLLATE pg_catalog."default",
    link character varying COLLATE pg_catalog."default",
    button_text_color character varying COLLATE pg_catalog."default",
    id_bg_image integer,
    id_product_image integer,
    id_title_image integer,
    id_offer_image integer,
    id_categories integer,
    sort_order double precision,
    is_button_transparent bit(1),
    button_hover_color character varying COLLATE pg_catalog."default",
    button_text_hover_color character varying COLLATE pg_catalog."default",
    is_active bit(1) NOT NULL DEFAULT '1'::"bit",
    is_deleted bit(1) NOT NULL DEFAULT '0'::"bit",
    created_date timestamp with time zone NOT NULL,
    created_by integer,
    modified_date timestamp with time zone,
    modified_by integer,
    section_type template_seven_type,
    id_products character varying COLLATE pg_catalog."default",
    CONSTRAINT template_seven_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.template_seven
    OWNER to postgres;

ALTER TABLE role_api_permissions
ADD COLUMN master_type VARCHAR;
    OWNER to postgres;


/*    --------------- super admin --------------- */

CREATE TYPE public.theme_section_type AS ENUM
    ('header', 'footer', 'home_page', 'product_grid', 'product_card', 'product_filter', 'product_detail', 'create_your_own', 'login', 'registration', 'toast', 'button', 'cart', 'checkout');

ALTER TYPE public.theme_section_type
    OWNER TO postgres;

-- Table: public.themes

-- DROP TABLE IF EXISTS public.themes;

CREATE TABLE IF NOT EXISTS public.themes
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying COLLATE pg_catalog."default",
    description character varying COLLATE pg_catalog."default",
    id_image integer,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by integer,
    modified_by integer,
    is_active bit(1) NOT NULL DEFAULT '1'::"bit",
    is_deleted bit(1) NOT NULL DEFAULT '0'::"bit",
    deleted_date timestamp with time zone,
    deleted_by integer,
    section_type theme_section_type NOT NULL DEFAULT 'header'::theme_section_type,
    key character varying COLLATE pg_catalog."default",
    CONSTRAINT themes_pkey PRIMARY KEY (id),
    CONSTRAINT fk_created_user_id FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_deleted_user_id FOREIGN KEY (deleted_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_image_id FOREIGN KEY (id_image)
        REFERENCES public.images (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_user_id FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.themes
    OWNER to postgres;


-- Table: public.theme_attributes

-- DROP TABLE IF EXISTS public.theme_attributes;

CREATE TABLE IF NOT EXISTS public.theme_attributes
(
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    id_theme integer,
    key_value character varying COLLATE pg_catalog."default",
    value character varying COLLATE pg_catalog."default",
    link character varying COLLATE pg_catalog."default",
    id_image integer,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by integer,
    modified_by integer,
    is_deleted bit(1) NOT NULL DEFAULT '0'::"bit",
    deleted_by integer,
    deleted_date timestamp with time zone,
    is_changeable bit(1) NOT NULL DEFAULT '0'::bit(1),
    CONSTRAINT theme_attributes_pkey PRIMARY KEY (id),
    CONSTRAINT fk_created_user_id FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_deleted_user_id FOREIGN KEY (deleted_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_user_id FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.theme_attributes
    OWNER to postgres;

-- Table: public.theme_attribute_customers

-- DROP TABLE IF EXISTS public.theme_attribute_customers;

CREATE TABLE IF NOT EXISTS public.theme_attribute_customers
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    id_company_info integer,
    id_theme integer,
    id_theme_attribute bigint,
    value character varying COLLATE pg_catalog."default",
    id_image integer,
    link character varying COLLATE pg_catalog."default",
    created_date timestamp with time zone,
    created_by integer,
    modified_date timestamp with time zone,
    modified_by integer,
    CONSTRAINT theme_attribute_customers_pkey PRIMARY KEY (id),
    CONSTRAINT fk_company_id FOREIGN KEY (id_company_info)
        REFERENCES public.company_infoes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_create_by_user FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_image_id FOREIGN KEY (id_image)
        REFERENCES public.images (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_by_user FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_theme_attribute_id FOREIGN KEY (id_theme_attribute)
        REFERENCES public.theme_attributes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_theme_id FOREIGN KEY (id_theme)
        REFERENCES public.themes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.theme_attribute_customers
    OWNER to postgres;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_header integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_footer integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_home_page integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_product_grid integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_product_card integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_product_filter integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_product_detail integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_create_your_own integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_login_page integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_registration_page integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_toast integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_button integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_cart integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_checkout integer;


CREATE TABLE IF NOT EXISTS public.email_templates
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    template_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    subject character varying(255) COLLATE pg_catalog."default" NOT NULL,
    body text COLLATE pg_catalog."default" NOT NULL,
    placeholders jsonb NOT NULL,
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    modified_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    modified_by integer,
    is_active bit(1),
    is_deleted bit(1),
    message_type integer[],
    company_info_id integer DEFAULT 1,
    CONSTRAINT email_templates_pkey PRIMARY KEY (id),
    CONSTRAINT fk_company_info FOREIGN KEY (company_info_id)
        REFERENCES public.company_infoes (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
 
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.order_details
    ADD COLUMN product_details_json json;

/* 24-03-2025 */
-- DROP TABLE IF EXISTS public.activity_logs;

CREATE TABLE IF NOT EXISTS public.activity_logs
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    log_type log_type,
    activity_type log_activity_type,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    modified_by integer,
    created_by integer,
    old_value_json json,
    updated_value_json json,
    ref_id integer,
    CONSTRAINT activity_logs_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.activity_logs
    OWNER to postgres;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN loader_image integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN mail_tem_logo integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN default_image integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN page_not_found_image integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN script character varying;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN address_embed_map character varying;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN address_map_link character varying;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN primary_font character varying;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN primary_font_weight character varying;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN primary_font_json json;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN secondary_font character varying;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN secondary_font_weight character varying;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN secondary_font_json json;

CREATE TYPE public.font_type AS ENUM
    ('google', 'font');

ALTER TYPE public.font_type
    OWNER TO postgres;
	
ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN secondary_font_type font_type;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN primary_font_type font_type;
	
    ALTER TABLE invoices
ADD COLUMN invoice_pdf_path VARCHAR(255);
-- Table: public.font_style_files

-- DROP TABLE IF EXISTS public.font_style_files;

CREATE TABLE IF NOT EXISTS public.font_style_files
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    file_path character varying COLLATE pg_catalog."default" NOT NULL,
    is_deleted bit(1) NOT NULL DEFAULT '0'::"bit",
    created_by integer,
    created_date timestamp with time zone,
    modified_by integer,
    modified_date timestamp with time zone,
    deleted_date timestamp with time zone,
    deleted_by integer,
    CONSTRAINT font_style_files_pkey PRIMARY KEY (id),
    CONSTRAINT fk_created_by_users FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_by_users FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.font_style_files
    OWNER to postgres;


-- Table: public.web_config_setting

-- DROP TABLE IF EXISTS public.web_config_setting;

CREATE TABLE IF NOT EXISTS public.web_config_setting
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    razorpay_public_key character varying COLLATE pg_catalog."default",
    razorpay_secret_key character varying COLLATE pg_catalog."default",
    razorpay_status bit(1) NOT NULL DEFAULT '0'::"bit",
    razorpay_webhook character varying COLLATE pg_catalog."default",
    stripe_public_key character varying COLLATE pg_catalog."default",
    stripe_secret_key character varying COLLATE pg_catalog."default",
    stripe_webhook character varying COLLATE pg_catalog."default",
    stripe_status bit(1) NOT NULL DEFAULT '0'::"bit",
    paypal_public_key character varying COLLATE pg_catalog."default",
    paypal_secret_key character varying COLLATE pg_catalog."default",
    paypal_webhook character varying COLLATE pg_catalog."default",
    paypal_status bit(1) NOT NULL DEFAULT '0'::"bit",
    yoco_public_key character varying COLLATE pg_catalog."default",
    yoco_secret_key character varying COLLATE pg_catalog."default",
    yoco_webhook character varying COLLATE pg_catalog."default",
    yoco_status bit(1) NOT NULL DEFAULT '0'::"bit",
    affirm_public_key character varying COLLATE pg_catalog."default",
    affirm_secret_key character varying COLLATE pg_catalog."default",
    affirm_webhook character varying COLLATE pg_catalog."default",
    affirm_status bit(1) NOT NULL DEFAULT '0'::"bit",
    smtp_user_name character varying COLLATE pg_catalog."default",
    smtp_password character varying COLLATE pg_catalog."default",
    smtp_host character varying COLLATE pg_catalog."default",
    smtp_port character varying COLLATE pg_catalog."default",
    smtp_secure character varying COLLATE pg_catalog."default",
    smtp_from character varying COLLATE pg_catalog."default",
    smtp_service character varying COLLATE pg_catalog."default",
    insta_api_endpoint character varying COLLATE pg_catalog."default",
    insta_access_token character varying COLLATE pg_catalog."default",
    image_local_path character varying COLLATE pg_catalog."default",
    file_local_path character varying COLLATE pg_catalog."default",
    local_status bit(1) NOT NULL DEFAULT '0'::"bit",
    s3_bucket_name character varying COLLATE pg_catalog."default",
    s3_bucket_region character varying COLLATE pg_catalog."default",
    s3_bucket_secret_access_key character varying COLLATE pg_catalog."default",
    s3_bucket_status bit(1) NOT NULL DEFAULT '0'::"bit",
    image_base_url character varying COLLATE pg_catalog."default",
    secure_communication boolean NOT NULL DEFAULT false,
    secure_key character varying COLLATE pg_catalog."default",
    secure_iv character varying COLLATE pg_catalog."default",
    fronted_base_url character varying COLLATE pg_catalog."default",
    reset_pass_url character varying COLLATE pg_catalog."default",
    otp_generate_digit_count integer,
    invoice_number_generate_digit_count integer,
    order_invoice_number_identity character varying COLLATE pg_catalog."default",
    allow_out_of_stock_product_order boolean NOT NULL DEFAULT false,
    company_id integer,
    modified_by integer,
    modified_date timestamp with time zone,
    CONSTRAINT web_config_setting_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.web_config_setting
    OWNER to postgres;

    DO $$ 
DECLARE 
    -- Define a list of the values you want to add (from your LogsType enum)
    log_types text[] := ARRAY[
        'metal_master', 'metal_karat', 'product', 'diamond_group_master', 'order', 
        'banner', 'featureSection', 'marketing_popup', 'Marketing_bennar', 'our_story',
        'address', 'enquiry', 'product_enquiry', 'metal_ton', 'brand', 'diamond_carat_size',
        'clarity', 'collection', 'color', 'cut', 'diamond_shape', 'gem_stone', 'head', 
        'hook_type', 'item_length', 'item_size', 'mm_size', 'sieve_size', 'setting_carat_weight',
        'setting_type', 'shank', 'side_setting', 'tag', 'city', 'country', 'currency', 
        'master', 'page', 'state', 'tax', 'temaplete_two_banner', 'temaplete_two_feature_section',
        'temaplete_two_home_about_banner', 'temaplete_two_home_about_feature', 
        'temaplete_two_home_about_marketing', 'temaplete_two_home_about_marketing_popup',
        'temaplete_two_home_marketing_section', 'temaplet_five_banner', 'temaplet_five_category',
        'temaplet_five_diamond', 'temaplet_five_jewellry', 'temaplet_five_product_modle',
        'template_six_banner', 'template_six_diamon_shape', 'template_six_instagram',
        'template_six_shape_marque', 'template_six_Shop_by', 'temaplate_Six_sparkling',
        'temaplate_three_diamondshape', 'temaplate_three_shopeby', 'temaplate_three_splash_screen',
        'template_seven_offers_slider', 'template_seven_single_offer_top', 
        'template_seven_single_offer_bottom', 'template_seven_attractive_jewelry', 
        'template_seven_jewelry_Categories', 'template_seven_stunning_desgin', 
        'template_seven_festive_sale_offer', 'template_seven_dazzling_and_stylish', 
        'template_seven_category_and_products', 'template_seven_stunning_jewels', 
        'template_seven_luminous_design', 'template_seven_testimonial', 'template_seven_testimonial_detail',
        'template_seven_new_and_blog','about_us',
'all_product_cart',
'auth',
'birth_stone_product',
'birth_stone_product_upload',
'blog_category',
'blog',
'cart_product',
'category',
'companyinfo',
'config_all_product_bulk_upload',
'config_bracelet_product_bulk_upload',
'config_eternity_product_bulk_upload',
'config_product_bulk_upload_new',
'config_product_bulk_upload',
'config_product_New_diamond_group_bulk_upload',
'coupon',
'customer',
'genral_enquiry',
'faq',
'faq_que_aws',
'gift_set_product',
'gift_set_product_image',
'home_about_main',
'home_about_sub_content',
'info_section',
'loose_diamond_bulk_import',
'loose_diamond_bulk_import_image',
'mega_menu',
'meta_data',
'payment_transaction', 
'gift_set_payment_transaction',
'config_payment_transaction',
'config_payment_transaction_with_paypal',  
'product_bulk_upload_with_choose_setting',
'product_bulk_upload_with_variant',  
'product_bulk_upload',
'product_image_bulk_upload',
'product_review',
'product_wish_list',
'variant_product_wish_list',
'product_wish_list_with_product',
'move_product_cart_to_wish_list',
'retail_discount_config_product_bulk_upload',
'role_api_permission',
'role',
'role_configuration',
'menu_item',
'shipping_charge',
'static_page',
'subscription',
'testimonials',
'themes',
'web_config',
'theme_compony_info',
'tp_diamond',
'upload',
'user_management',
'webhook',
'menu_item_with_permission',
'stripe_transaction',
'razor_pay',
'webhook_transaction_success',
'webhook_transaction_failed',
'client_manage',
'pay_pal',
'stripe'
    ];

    -- Variable to store the existing enum values in the log_type type
    existing_log_types text[];

    -- A variable to store the missing enum value
    missing_value text;
BEGIN
    -- Get the current values of the log_type enum
    SELECT array_agg(enumlabel) INTO existing_log_types
    FROM pg_enum
    WHERE enumtypid = 'log_type'::regtype;

    -- Loop through the array of desired log_types and check if they exist in existing_log_types
    FOREACH missing_value IN ARRAY log_types
    LOOP
        -- If the log_type does not exist in the enum, add it
        IF NOT missing_value = ANY(existing_log_types) THEN
            EXECUTE format('ALTER TYPE log_type ADD VALUE %L', missing_value);
        END IF;
    END LOOP;
END $$;
/* 28-03-2025 */

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN db_name character varying;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN db_user_name character varying;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN db_password character varying;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN db_host character varying;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN db_port integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN db_dialect character varying;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN db_ssl_unauthorized boolean NOT NULL DEFAULT false;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN is_active bit NOT NULL DEFAULT '1'::"bit";

DO $$ 
DECLARE 
    -- Define a list of the values you want to add (from your LogsActivityType enum)
    log_activity_types text[] := ARRAY[
        'ADD', 'EDIT', 'DELETE', 'STATUS_UPDATE', 'RATE_UPDATE', 'QUANTITY_UPDATE', 
        'REGISTER', 'LOGIN', 'OTP', 'REFRESH_TOKEN', 'CHANGE_PASSWORD', 'FORGOT_PASSWORD', 
        'RESETPASSWORD', 'CHANGE_ANY_USER_PASSWORD', 'CUSTOMER_REGISTER', 
        'CUSTOMER_REGISTER_WITH_SYSTEM', 'CUSTOMER_REGISTER_WITH_GOOGLE', 
        'All_READY_EXIST_CUSTOMER_REGISTER_WITH_GOOGLE', 'CUSTOMER__OTP_VARIFICATION', 
        'RESEND_OTP_VERIFICATION', 'CUSTOMER_INFO_UPDATE', 'IS_FEATURED', 'IS_TRANDING', 
        'BLOG_DEFAULT', 'COMPANY_INFO_UPDATE', 'REMOVE_COUPON', 'ORDER_STATUS', 
        'DELIVERY_STATUS', 'SUBSCRIBE', 'LOGO_UPDATE', 'SCRIPT', 'UPDATE_FONT_STYLE', 
        'DELETE_FONT_STYLE', 'UPDATE_SYSTEM_COLOR',
        'STRIPE_EVENT',   
        'PAYPAL_EVENT',
        'RAZORPAY_EVENT',
        'FAILED_PAYMENT_QUENTITY_MANAGE_DIAMOND',
        'FAILED_PAYMENT_QUENTITY_MANAGE_METAL'
    ];

    -- Variable to store the existing enum values in the log_activity_type type
    existing_log_activity_types text[];

    -- A variable to store the missing enum value
    missing_value text;
BEGIN
    -- Get the current values of the log_activity_type enum
    SELECT array_agg(enumlabel) INTO existing_log_activity_types
    FROM pg_enum
    WHERE enumtypid = 'log_activity_type'::regtype;

    -- Loop through the array of desired log_activity_types and check if they exist in existing_log_activity_types
    FOREACH missing_value IN ARRAY log_activity_types
    LOOP
        -- If the log_activity_type does not exist in the enum, add it
        IF NOT missing_value = ANY(existing_log_activity_types) THEN
            EXECUTE format('ALTER TYPE log_activity_type ADD VALUE %L', missing_value);
        END IF;
    END LOOP;
END $$;
/* 29-03-2025 */

ALTER TABLE IF EXISTS public.app_users
    ADD COLUMN is_super_admin boolean NOT NULL DEFAULT false;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN company_email DROP NOT NULL;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN company_phone DROP NOT NULL;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN copy_right DROP NOT NULL;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN web_link DROP NOT NULL;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN facebook_link DROP NOT NULL;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN insta_link DROP NOT NULL;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN youtube_link DROP NOT NULL;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN linkdln_link DROP NOT NULL;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN twitter_link DROP NOT NULL;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN web_primary_color DROP NOT NULL;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN web_secondary_color DROP NOT NULL;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN announce_is_active SET DEFAULT '0';

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN announce_is_active DROP NOT NULL;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN announce_color DROP NOT NULL;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN announce_text DROP NOT NULL;

ALTER TABLE IF EXISTS public.company_infoes
    ALTER COLUMN announce_text_color DROP NOT NULL;

/* 31-03-2025 */

ALTER TYPE public.theme_section_type
    ADD VALUE 'profile' AFTER 'checkout';

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_profile integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN share_image integer;

/* 31-02-2025 */

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'  -- Or the schema you're using
        AND table_type = 'BASE TABLE'
        AND table_name != 'company_infoes'  -- Exclude the company_infoes table
    LOOP
        -- Add the company_info_id column to each table with a default value of 1
        EXECUTE format('ALTER TABLE %I ADD COLUMN company_info_id INT DEFAULT 1;', r.table_name);
        
        -- Add the foreign key constraint
        EXECUTE format('ALTER TABLE %I ADD CONSTRAINT fk_company_info FOREIGN KEY (company_info_id) REFERENCES company_infoes(id) ON DELETE CASCADE ON UPDATE CASCADE;', r.table_name);
    END LOOP;
END $$;

/* 01-04-2025  filter API*/


CREATE TYPE public.filter_select_type AS ENUM
    ('single', 'multiple', 'range');

ALTER TYPE public.filter_select_type
    OWNER TO postgres;

-- Table: public.filters

CREATE TABLE IF NOT EXISTS public.filters
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    name character varying COLLATE pg_catalog."default",
    key character varying COLLATE pg_catalog."default" NOT NULL,
    filter_select_type filter_select_type,
    selected_value character varying COLLATE pg_catalog."default",
    created_date timestamp with time zone,
    created_by integer,
    is_active bit(1) NOT NULL DEFAULT '1'::"bit",
    modified_date timestamp with time zone,
    modified_by integer,
    company_info_id integer NOT NULL DEFAULT 1,
    CONSTRAINT filters_pkey PRIMARY KEY (id),
    CONSTRAINT client_id FOREIGN KEY (company_info_id)
        REFERENCES public.company_infoes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT created_user_id FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT modified_user_id FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.filters
    OWNER to postgres;

ALTER TABLE IF EXISTS public.web_config_setting
    RENAME razorpay_webhook TO razorpay_script;

ALTER TABLE IF EXISTS public.web_config_setting
    RENAME stripe_webhook TO stripe_script;

ALTER TABLE IF EXISTS public.web_config_setting
    RENAME paypal_webhook TO paypal_script;

ALTER TABLE IF EXISTS public.web_config_setting
    RENAME yoco_webhook TO yoco_script;

ALTER TABLE IF EXISTS public.web_config_setting
    RENAME affirm_webhook TO affirm_script;

ALTER TABLE IF EXISTS public.web_config_setting DROP COLUMN IF EXISTS secure_communication;

ALTER TABLE IF EXISTS public.web_config_setting
    RENAME secure_key TO metal_tone_identifier;

ALTER TABLE IF EXISTS public.web_config_setting
    RENAME secure_iv TO three_stone_glb_key;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN band_glb_key character varying;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN glb_key character varying;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN metal_karat_value text;

/* 02-04-2025 mega menu changes */

ALTER TABLE IF EXISTS public.mega_menues
    RENAME TO mega_menu_attributes;

ALTER TABLE IF EXISTS public.mega_menu_attributes
    ADD COLUMN company_info_id integer;

ALTER TABLE IF EXISTS public.mega_menu_attributes
    ADD CONSTRAINT fk_company_info_id FOREIGN KEY (company_info_id)
    REFERENCES public.company_infoes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

CREATE TYPE public.menu_type AS ENUM
    ('header', 'footer');

ALTER TYPE public.menu_type
    OWNER TO postgres;

CREATE TABLE IF NOT EXISTS public.mega_menus
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying COLLATE pg_catalog."default",
    menu_type menu_type NOT NULL DEFAULT 'header'::menu_type,
    is_active bit(1) NOT NULL DEFAULT '1'::"bit",
    is_deleted bit(1) DEFAULT '0'::"bit",
    created_date timestamp with time zone,
    created_by integer,
    modified_date timestamp with time zone,
    modified_by integer,
    company_info_id integer NOT NULL DEFAULT 1,
    CONSTRAINT mega_menus_pkey PRIMARY KEY (id),
    CONSTRAINT fk_company_id FOREIGN KEY (company_info_id)
        REFERENCES public.company_infoes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_created_user FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_modified_user FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.mega_menus
    OWNER to postgres;

ALTER TABLE IF EXISTS public.mega_menu_attributes DROP COLUMN IF EXISTS slug;

/* 03-04-2025 */

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN metal_gold_id integer;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN metal_silver_id integer;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN metal_platinum_id integer;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN eternity_band_glb_key character varying;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN bracelet_glb_key character varying;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN google_font_key character varying;

ALTER TABLE IF EXISTS public.web_config_setting DROP COLUMN IF EXISTS metal_tone_identifier;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN metal_tone_identifier integer;

/* 04-04-2025 */

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN google_auth_status bit DEFAULT '0';

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN google_auth_key character varying;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN insta_auth_status bit DEFAULT '0';

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN insta_auth_key character varying;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN facebook_auth_status bit DEFAULT '0';

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN facebook_auth_key character varying;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN apple_auth_status bit DEFAULT '0';

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN apple_auth_key character varying;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN glb_url bit DEFAULT '0';

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN insta_secret_key character varying;

ALTER TYPE public.log_type
    ADD VALUE 'configurator_setting' AFTER 'stripe';

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_configurator character varying;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN id_otp_verify integer;

ALTER TYPE public.theme_section_type
    ADD VALUE 'verified_otp' AFTER 'profile';

/* template two chnages */

ALTER TABLE IF EXISTS public.template_banners
    ADD COLUMN button_color character varying;

ALTER TABLE IF EXISTS public.template_banners
    ADD COLUMN button_text_color character varying;

ALTER TABLE IF EXISTS public.template_banners
    ADD COLUMN button_hover_color character varying;

ALTER TABLE IF EXISTS public.template_banners
    ADD COLUMN button_hover_text_color character varying;

ALTER TABLE IF EXISTS public.template_banners
    ADD COLUMN is_button_transparent bit DEFAULT '0';

ALTER TABLE IF EXISTS public.template_banners
    ADD COLUMN title character varying;

ALTER TABLE IF EXISTS public.template_banners
    ADD COLUMN product_ids json;

ALTER TYPE public.log_type
    ADD VALUE 'temaplete_two_product_section' AFTER 'configurator_setting';

ALTER TYPE public.log_type
    ADD VALUE 'mega_menu_acttributes' AFTER 'temaplete_two_product_section';


/* --------------------------- 09-04-2025 -------------------------------------------- */

 ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN gust_user_allowed boolean DEFAULT true;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN promo_code_allowed boolean DEFAULT true;

CREATE TABLE IF NOT EXISTS public.store_address
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    address character varying COLLATE pg_catalog."default",
    map_link character varying COLLATE pg_catalog."default",
    branch_name character varying COLLATE pg_catalog."default",
    created_by integer,
    created_date timestamp with time zone,
    is_active bit(1) DEFAULT '1'::"bit",
    is_deleted bit(1) DEFAULT '0'::"bit",
    modified_by integer,
    modified_date timestamp with time zone,
    company_info_id integer,
    CONSTRAINT store_address_pkey PRIMARY KEY (id),
    CONSTRAINT fk_client_id FOREIGN KEY (company_info_id)
        REFERENCES public.company_infoes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_created_user_id FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_modified_user_id FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.store_address
    OWNER to postgres;

ALTER TYPE public.log_type
    ADD VALUE 'store_address' AFTER 'mega_menu_acttributes';

ALTER TYPE public.log_type
    ADD VALUE 'order_with_paypal' AFTER 'store_address';
ALTER TYPE public.log_type
    ADD VALUE 'filter' AFTER 'order_with_paypal';
    ALTER TYPE public.log_type
    ADD VALUE 'email_template' AFTER 'filter';


    CREATE TABLE public.exception_logs
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 ),
    request_body json,
    request_query json,
    request_param json,
    response json,
    error json,
    created_date timestamp with time zone,
    created_by integer,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.exaptation_logs
    OWNER to postgres;
/* ---------------------- 10-04-2025 --------------------------- */

ALTER TABLE IF EXISTS public.side_setting_styles
    ADD COLUMN config_image json;
    ADD COLUMN ref_id integer;

/* ------------------------- 21-04-2025 ------------------------- */

ALTER TABLE IF EXISTS public.products
    ADD COLUMN meta_title character varying COLLATE pg_catalog."default";

ALTER TABLE IF EXISTS public.products
    ADD COLUMN meta_description character varying COLLATE pg_catalog."default";

ALTER TABLE IF EXISTS public.products
    ADD COLUMN meta_tag character varying COLLATE pg_catalog."default";

DROP MATERIALIZED VIEW IF EXISTS public.product_list_view;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.product_list_view
TABLESPACE pg_default
AS
 WITH filtered_pmo AS (
         SELECT DISTINCT ON (pmo.id_product) pmo.id,
            pmo.id_product,
            pmo.id_metal_group,
            pmo.metal_weight,
            pmo.is_deleted,
            pmo.created_by,
            pmo.created_date,
            pmo.modified_by,
            pmo.modified_date,
            pmo.is_default,
            pmo.id_metal,
            pmo.id_karat,
            pmo.id_metal_tone,
            pmo.retail_price,
            pmo.compare_price,
            pmo.id_size,
            pmo.id_length,
            pmo.quantity,
            pmo.side_dia_weight,
            pmo.side_dia_count,
            pmo.remaing_quantity_count,
            pmo.id_m_tone,
            pmo.center_diamond_price,
            karats.name,
            karats.calculate_rate AS karat_calculate_rate,
            pmo.company_info_id
           FROM product_metal_options pmo
             LEFT JOIN gold_kts karats ON karats.id = pmo.id_karat
          WHERE pmo.is_deleted = '0'::"bit"
          ORDER BY pmo.id_product, karats.name
        ), product_images_data AS (
         SELECT product_images.id_product,
            product_images.id AS image_id,
            concat('https://d1d4axu56w21qu.cloudfront.net/', product_images.image_path) AS image_path,
            product_images.id_metal_tone,
            product_images.image_type
           FROM product_images
          WHERE product_images.is_deleted = '0'::"bit" AND (product_images.image_type = ANY (ARRAY[1, 4]))
        ), sum_price AS (
         SELECT pdo_1.id_product,
            sum(dgm_1.rate * pdo_1.weight::double precision * pdo_1.count::double precision) AS sum_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND (pdo_1.id_type = 2 OR 'undefined'::text <> '1'::text)
          GROUP BY pdo_1.id_product
        )
 SELECT products.id,
    products.name,
    products.sku,
    products.slug,
    products.sort_description,
    products.created_date,
    products.product_type,
    products.setting_style_type,
    products.gender,
    products.id_collection,
    products.id_brand,
    products.setting_diamond_shapes,
    products.is_trending,
    products.parent_id,
    products.is_customization,
    products.company_info_id,
	products.meta_title,
	products.meta_description,
	products.meta_tag,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_categories.id, 'id_category', product_categories.id_category, 'id_sub_category', product_categories.id_sub_category, 'id_sub_sub_category', product_categories.id_sub_sub_category, 'category_name', categories.slug, 'sub_category_name', sub_categories.slug, 'sub_sub_category', sub_sub_categories.slug)) AS product_categories,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_images_data.image_id, 'image_path', product_images_data.image_path, 'id_metal_tone', product_images_data.id_metal_tone, 'image_type', product_images_data.image_type)) AS product_images,
    jsonb_agg(DISTINCT jsonb_build_object('id', filtered_pmo.id, 'id_metal', filtered_pmo.id_metal, 'id_karat', filtered_pmo.id_karat, 'id_size', filtered_pmo.id_size, 'id_length', filtered_pmo.id_length, 'id_m_tone', filtered_pmo.id_m_tone, 'quantity', filtered_pmo.remaing_quantity_count, 'wishlist_id', NULL::unknown, 'metal_tone',
        CASE
            WHEN filtered_pmo.id_metal_tone IS NULL THEN '{}'::integer[]
            ELSE string_to_array(filtered_pmo.id_metal_tone::text, '|'::text)::integer[]
        END, 'gold_karat', filtered_pmo.name, 'catalogue_design_price', filtered_pmo.retail_price, 'Price',
        CASE
            WHEN products.product_type = 2 THEN
            CASE
                WHEN 'undefined'::text = '1'::text THEN filtered_pmo.retail_price - COALESCE(filtered_pmo.center_diamond_price, 0::numeric)::double precision
                ELSE products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.retail_price
            END
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END, 'compare_price',
        CASE
            WHEN products.product_type = 2 THEN products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.compare_price
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END)) AS pmo,
    jsonb_agg(DISTINCT jsonb_build_object('id', pdo.id, 'weight', pdo.weight, 'count', pdo.count, 'id_shape',
        CASE
            WHEN products.product_type = 1 THEN dgm.id_shape
            ELSE pdo.id_shape
        END, 'id_stone', pdo.id_stone, 'id_color', pdo.id_color, 'id_clarity', pdo.id_clarity, 'id_type', pdo.id_type)) AS pdo
   FROM products
     LEFT JOIN product_images_data ON product_images_data.id_product = products.id
     LEFT JOIN product_categories ON product_categories.id_product = products.id AND product_categories.is_deleted = '0'::"bit"
     LEFT JOIN categories ON categories.id = product_categories.id_category
     LEFT JOIN categories sub_categories ON sub_categories.id = product_categories.id_sub_category
     LEFT JOIN categories sub_sub_categories ON sub_sub_categories.id = product_categories.id_sub_sub_category
     LEFT JOIN filtered_pmo ON filtered_pmo.id_product = products.id
     LEFT JOIN metal_masters metal_master ON metal_master.id = filtered_pmo.id_metal AND metal_master.is_deleted = '0'::"bit"
     LEFT JOIN product_diamond_options pdo ON pdo.id_product = products.id AND pdo.is_deleted = '0'::"bit"
     LEFT JOIN diamond_group_masters dgm ON dgm.id = pdo.id_diamond_group AND dgm.is_deleted = '0'::"bit"
     LEFT JOIN sum_price ON sum_price.id_product = products.id
  WHERE products.is_deleted = '0'::"bit" AND products.is_active = '1'::"bit" AND products.parent_id IS NULL
  GROUP BY products.id
WITH DATA;

ALTER TABLE IF EXISTS public.product_list_view
    OWNER TO postgres;

/* ---------------------- 11-04-2025 --------------------------- */

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN pickup_from_store boolean DEFAULT true;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN move_to_wishlist boolean DEFAULT false;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN shop_now boolean DEFAULT false;

/* ---------------------- 14-04-2025 --------------------------- */

ALTER TYPE public.theme_section_type
    ADD VALUE 'configurator_detail' AFTER 'verified_otp';

/* ------------------- 15-04-2025 ----------------------------*/

ALTER TABLE IF EXISTS public.themes DROP COLUMN IF EXISTS company_info_id;
ALTER TABLE IF EXISTS public.theme_attributes DROP COLUMN IF EXISTS company_info_id;
ALTER TABLE IF EXISTS public.theme_attribute_customers DROP COLUMN IF EXISTS company_info_id;

/* ---------------------- 16-04-2025 --------------------------- */

ALTER TYPE public.log_activity_type
    ADD VALUE 'CUSTOMER_LOGIN' AFTER 'FAILED_PAYMENT_QUENTITY_MANAGE_DIAMOND';
ALTER TYPE public.log_activity_type
    ADD VALUE 'CUSTOMER_OTP' AFTER 'CUSTOMER_LOGIN';

/* ---------------------- 16-04-2025 --------------------------- */

CREATE TYPE public.filter_item_scope AS ENUM
    ('product', 'diamond', 'both');

ALTER TYPE public.filter_item_scope
    OWNER TO postgres;

ALTER TABLE IF EXISTS public.filters
    ADD COLUMN item_scope filter_item_scope DEFAULT 'product';

ALTER TYPE public.mega_menu_type
    ADD VALUE 'static_page' AFTER 'page';

ALTER TABLE IF EXISTS public.mega_menu_attributes
    ADD COLUMN id_static_page integer;

ALTER TABLE IF EXISTS public.mega_menu_attributes
    ADD CONSTRAINT fk_id_page FOREIGN KEY (id_page)
    REFERENCES public.pages (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.mega_menu_attributes
    ADD CONSTRAINT fk_id_static_page FOREIGN KEY (id_static_page)
    REFERENCES public.static_pages (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.configurator_setting DROP COLUMN IF EXISTS company_info_id;
ALTER TABLE IF EXISTS public.configurator_setting_file DROP COLUMN IF EXISTS company_info_id;

/*----------------23-04-2025------------------------*/
ALTER TYPE public.log_type
    ADD VALUE 'loose_diamond_single' AFTER 'email_template';
ALTER TYPE public.log_type
    ADD VALUE 'customer_auth' AFTER 'loose_diamond_single';
ALTER TYPE public.mega_menu_type
    ADD VALUE 'text' AFTER 'static_page';
/* ---------------------- 21-04-2025 --------------------------- */


ALTER TABLE IF EXISTS public.products
    ADD COLUMN meta_title character varying COLLATE pg_catalog."default";

ALTER TABLE IF EXISTS public.products
    ADD COLUMN meta_description character varying COLLATE pg_catalog."default";

ALTER TABLE IF EXISTS public.products
    ADD COLUMN meta_tag character varying COLLATE pg_catalog."default";

ALTER TABLE IF EXISTS public.products
    ADD COLUMN setting_diamond_sizes character varying;

ALTER TABLE IF EXISTS public.products
    ADD COLUMN is_band bit;

ALTER TABLE IF EXISTS public.product_metal_options
    ADD COLUMN band_metal_weight numeric;

ALTER TABLE IF EXISTS public.product_diamond_options
    ADD COLUMN is_band boolean NOT NULL DEFAULT false;

ALTER TABLE IF EXISTS public.product_metal_options
    ADD COLUMN band_metal_price double precision;

ALTER TABLE IF EXISTS public.products
    ADD COLUMN is_3d_product boolean DEFAULT false;

DROP MATERIALIZED VIEW IF EXISTS public.product_list_view;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.product_list_view
TABLESPACE pg_default
AS
 WITH filtered_pmo AS (
         SELECT DISTINCT ON (pmo.id_product) pmo.id,
            pmo.id_product,
            pmo.id_metal_group,
            pmo.metal_weight,
            pmo.is_deleted,
            pmo.created_by,
            pmo.created_date,
            pmo.modified_by,
            pmo.modified_date,
            pmo.is_default,
            pmo.id_metal,
            pmo.id_karat,
            pmo.id_metal_tone,
            pmo.retail_price,
            pmo.compare_price,
            pmo.id_size,
            pmo.id_length,
            pmo.quantity,
            pmo.side_dia_weight,
            pmo.side_dia_count,
            pmo.remaing_quantity_count,
            pmo.id_m_tone,
            pmo.center_diamond_price,
            karats.name,
            karats.calculate_rate AS karat_calculate_rate,
            pmo.company_info_id
           FROM product_metal_options pmo
             LEFT JOIN gold_kts karats ON karats.id = pmo.id_karat
          WHERE pmo.is_deleted = '0'::"bit"
          ORDER BY pmo.id_product, karats.name
        ), product_images_data AS (
         SELECT product_images.id_product,
            product_images.id AS image_id,
            concat('https://d34nvao6scwj7v.cloudfront.net/', product_images.image_path) AS image_path,
            product_images.id_metal_tone,
            product_images.image_type
           FROM product_images
          WHERE product_images.is_deleted = '0'::"bit" AND (product_images.image_type = ANY (ARRAY[1, 4]))
        ), sum_price AS (
         SELECT pdo_1.id_product,
            sum(dgm_1.rate * pdo_1.weight::double precision * pdo_1.count::double precision) AS sum_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND (pdo_1.id_type = 2 OR 'undefined'::text <> '1'::text)
          GROUP BY pdo_1.id_product
        ), without_center_diamond_price AS (
         SELECT pdo_1.id_product,
            sum(dgm_1.rate * pdo_1.weight::double precision * pdo_1.count::double precision) AS diamond_price
           FROM product_diamond_options pdo_1
             LEFT JOIN diamond_group_masters dgm_1 ON dgm_1.id = pdo_1.id_diamond_group
          WHERE pdo_1.is_deleted = '0'::"bit" AND (pdo_1.id_type = 1)
          GROUP BY pdo_1.id_product
        )
 SELECT products.id,
    products.name,
    products.sku,
    products.slug,
    products.sort_description,
    products.created_date,
    products.product_type,
    products.setting_style_type,
    products.gender,
    products.id_collection,
    products.id_brand,
    products.setting_diamond_shapes,
    products.is_trending,
    products.parent_id,
    products.is_customization,
    products.company_info_id,
    products.meta_title,
    products.meta_description,
    products.meta_tag,
	products.is_band,
	products.is_single,
	products.is_choose_setting,
	products.setting_diamond_sizes,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_categories.id, 'id_category', product_categories.id_category, 'id_sub_category', product_categories.id_sub_category, 'id_sub_sub_category', product_categories.id_sub_sub_category, 'category_name', categories.slug, 'sub_category_name', sub_categories.slug, 'sub_sub_category', sub_sub_categories.slug)) AS product_categories,
    jsonb_agg(DISTINCT jsonb_build_object('id', product_images_data.image_id, 'image_path', product_images_data.image_path, 'id_metal_tone', product_images_data.id_metal_tone, 'image_type', product_images_data.image_type)) AS product_images,
    jsonb_agg(DISTINCT jsonb_build_object('id', filtered_pmo.id, 'id_metal', filtered_pmo.id_metal, 'id_karat', filtered_pmo.id_karat, 'id_size', filtered_pmo.id_size, 'id_length', filtered_pmo.id_length, 'id_m_tone', filtered_pmo.id_m_tone, 'quantity', filtered_pmo.remaing_quantity_count, 'wishlist_id', NULL::unknown, 'metal_tone',
        CASE
            WHEN filtered_pmo.id_metal_tone IS NULL THEN '{}'::integer[]
            ELSE string_to_array(filtered_pmo.id_metal_tone::text, '|'::text)::integer[]
        END, 'gold_karat', filtered_pmo.name, 'catalogue_design_price', filtered_pmo.retail_price, 'Price',
        CASE
            WHEN products.product_type = 2 THEN
             products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.retail_price
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END, 'compare_price',
        CASE
            WHEN products.product_type = 2 THEN products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.compare_price
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(sum_price.sum_price, 0::double precision)
            END
        END, 'choose_style_price',
        CASE
            WHEN products.product_type = 2 THEN (products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + filtered_pmo.compare_price) - filtered_pmo.center_diamond_price
            ELSE
            CASE
                WHEN filtered_pmo.id_karat IS NULL THEN metal_master.metal_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(without_center_diamond_price.diamond_price, 0::double precision)
                ELSE metal_master.metal_rate / metal_master.calculate_rate * filtered_pmo.karat_calculate_rate * filtered_pmo.metal_weight::double precision + products.making_charge::double precision + products.finding_charge::double precision + products.other_charge::double precision + COALESCE(without_center_diamond_price.diamond_price, 0::double precision)
            END	
		END)) AS pmo,
    jsonb_agg(DISTINCT jsonb_build_object('id', pdo.id, 'weight', pdo.weight, 'count', pdo.count, 'id_shape',
        CASE
            WHEN products.product_type = 1 THEN dgm.id_shape
            ELSE pdo.id_shape
        END, 'id_stone', pdo.id_stone, 'id_color', pdo.id_color, 'id_clarity', pdo.id_clarity, 'id_type', pdo.id_type)) AS pdo
   FROM products
     LEFT JOIN product_images_data ON product_images_data.id_product = products.id
     LEFT JOIN product_categories ON product_categories.id_product = products.id AND product_categories.is_deleted = '0'::"bit"
     LEFT JOIN categories ON categories.id = product_categories.id_category
     LEFT JOIN categories sub_categories ON sub_categories.id = product_categories.id_sub_category
     LEFT JOIN categories sub_sub_categories ON sub_sub_categories.id = product_categories.id_sub_sub_category
     LEFT JOIN filtered_pmo ON filtered_pmo.id_product = products.id
     LEFT JOIN metal_masters metal_master ON metal_master.id = filtered_pmo.id_metal AND metal_master.is_deleted = '0'::"bit"
     LEFT JOIN product_diamond_options pdo ON pdo.id_product = products.id AND pdo.is_deleted = '0'::"bit"
     LEFT JOIN diamond_group_masters dgm ON dgm.id = pdo.id_diamond_group AND dgm.is_deleted = '0'::"bit"
     LEFT JOIN sum_price ON sum_price.id_product = products.id
	 LEFT JOIN without_center_diamond_price ON without_center_diamond_price.id_product = products.id
  WHERE products.is_deleted = '0'::"bit" AND products.is_active = '1'::"bit" AND products.parent_id IS NULL
  GROUP BY products.id
WITH DATA;

ALTER TABLE IF EXISTS public.product_list_view
    OWNER TO postgres;

/* ---------------------- 24-04-2025 --------------------------- */
ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN product_not_found_image integer;

ALTER TABLE IF EXISTS public.company_infoes
    ADD COLUMN order_not_found_image integer;
ALTER TABLE IF EXISTS public.company_infoes
    ADD CONSTRAINT product_not_found_fk FOREIGN KEY (product_not_found_image)
    REFERENCES public.images (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.company_infoes
    ADD CONSTRAINT order_not_found_fk FOREIGN KEY (order_not_found_image)
    REFERENCES public.images (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.web_config_setting
    ADD COLUMN s3_bucket_access_key character varying;

ALTER TABLE IF EXISTS public.configurator_setting
    ADD COLUMN description text;

ALTER TABLE IF EXISTS public.configurator_setting
    ADD COLUMN link character varying;

ALTER TABLE IF EXISTS public.products
    ADD COLUMN head_no character varying;

ALTER TABLE IF EXISTS public.products
    ADD COLUMN shank_no character varying;

ALTER TABLE IF EXISTS public.products
    ADD COLUMN band_no character varying;

ALTER TABLE IF EXISTS public.products
    ADD COLUMN style_no character varying;

ALTER TABLE IF EXISTS public.loose_diamond_group_masters DROP COLUMN IF EXISTS certificate;

ALTER TABLE IF EXISTS public.loose_diamond_group_masters DROP COLUMN IF EXISTS pair_stock;

ALTER TABLE IF EXISTS public.loose_diamond_group_masters
    ADD COLUMN certificate character varying;

ALTER TABLE IF EXISTS public.loose_diamond_group_masters
    ADD COLUMN pair_stock character varying;
/* mobile banner image 07-05-2025*/
ALTER TABLE IF EXISTS public.template_six
    ADD COLUMN mobile_banner_image integer;
ALTER TABLE IF EXISTS public.template_six
    ADD CONSTRAINT fk_mobile_banner_image FOREIGN KEY (mobile_banner_image)
    REFERENCES public.images (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

/*--------------------- 15-05-2025 ----------------*/

ALTER TYPE public.template_seven_type
    ADD VALUE 'best_seller' AFTER 'luminous_design';
ALTER TYPE public.log_type
    ADD VALUE 'template_seven_products' AFTER 'email_template';
ALTER TABLE IF EXISTS public.template_seven
    ADD COLUMN product_ids json;
/* 16-05-2025 */
ALTER TABLE IF EXISTS public.subscriptions
    ADD COLUMN user_ip character varying;

ALTER TABLE IF EXISTS public.subscriptions
    ADD COLUMN user_country character varying;

ALTER TABLE IF EXISTS public.subscriptions
    ADD COLUMN user_location character varying;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN user_ip character varying;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN user_country character varying;

ALTER TABLE IF EXISTS public.wishlist_products
    ADD COLUMN user_location character varying;

ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN user_ip character varying;

ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN user_country character varying;

ALTER TABLE IF EXISTS public.cart_products
    ADD COLUMN user_location character varying;

ALTER TABLE IF EXISTS public.orders
    ADD COLUMN cart_ids character varying;

-- 28-052025
ALTER TABLE IF EXISTS public.banners
    ADD COLUMN description text;


    ALTER TABLE IF EXISTS public.banners
    ADD COLUMN sub_title character varying;

ALTER TABLE IF EXISTS public.banners
    ADD COLUMN link_one character varying;

ALTER TABLE IF EXISTS public.banners
    ADD COLUMN link_two character varying;

ALTER TABLE IF EXISTS public.banners
    ADD COLUMN button_one character varying;

ALTER TABLE IF EXISTS public.banners
    ADD COLUMN button_two character varying;

------- Stud Configurator 18-06-2025 -------
CREATE TYPE public.stud_product_type AS ENUM
    ('stud', 'huggies');
CREATE TYPE public.stud_side_dia_prod_type AS ENUM
    ('halo', 'huggies');

CREATE TABLE IF NOT EXISTS public.stud_config_products
(
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    setting_type bigint NOT NULL,
    center_dia_wt bigint NOT NULL,
    center_dia_shape bigint NOT NULL,
    center_dia_mm_size bigint NOT NULL,
    center_dia_count bigint NOT NULL,
    style_no bigint NOT NULL,
    huggies_no bigint,
    drop_no bigint,
    sort_description character varying COLLATE pg_catalog."default",
    long_description text COLLATE pg_catalog."default",
    labour_charge double precision,
    other_charge double precision,
    product_total_diamond double precision,
    created_at timestamp with time zone NOT NULL,
    created_by bigint NOT NULL,
    is_active bit(1) NOT NULL DEFAULT '1'::"bit",
    is_deleted bit(1) NOT NULL DEFAULT '0'::"bit",
    modified_at timestamp with time zone,
    modified_by bigint,
    deleted_at timestamp with time zone,
    deleted_by bigint,
    product_style stud_product_type DEFAULT 'stud'::stud_product_type,
    company_info_id integer,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    sku character varying COLLATE pg_catalog."default" NOT NULL,
    slug character varying COLLATE pg_catalog."default" NOT NULL,
    huggies_setting_type bigint,
    CONSTRAINT stud_config_products_pkey PRIMARY KEY (id),
    CONSTRAINT fk_center_dia_mm_size FOREIGN KEY (center_dia_mm_size)
        REFERENCES public.mm_sizes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_center_dia_shape FOREIGN KEY (center_dia_shape)
        REFERENCES public.diamond_shapes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_center_dia_wt FOREIGN KEY (center_dia_wt)
        REFERENCES public.carat_sizes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_deleted_by FOREIGN KEY (deleted_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_huggies_setting_type FOREIGN KEY (huggies_setting_type)
        REFERENCES public.side_setting_styles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_modified_by FOREIGN KEY (modified_by)
        REFERENCES public.app_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_setting_type FOREIGN KEY (setting_type)
        REFERENCES public.heads (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.stud_diamonds
(
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    stud_id bigint NOT NULL,
    dia_shape bigint NOT NULL,
    dia_weight double precision NOT NULL,
    dia_mm_size bigint,
    dia_count bigint NOT NULL,
    company_info_id integer NOT NULL,
    side_dia_prod_type stud_side_dia_prod_type DEFAULT 'halo'::stud_side_dia_prod_type,
    CONSTRAINT stud_diamonds_pkey PRIMARY KEY (id),
    CONSTRAINT fk_dia_mm_size FOREIGN KEY (dia_mm_size)
        REFERENCES public.mm_sizes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_dia_shape FOREIGN KEY (dia_shape)
        REFERENCES public.diamond_shapes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_stud_id FOREIGN KEY (stud_id)
        REFERENCES public.stud_config_products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.stud_metals
(
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    stud_id bigint NOT NULL,
    metal_id bigint NOT NULL,
    metal_wt double precision NOT NULL,
    karat_id bigint,
    company_info_id integer,
    CONSTRAINT stud_metals_pkey PRIMARY KEY (id),
    CONSTRAINT fk_karat_id FOREIGN KEY (karat_id)
        REFERENCES public.gold_kts (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_metal_id FOREIGN KEY (metal_id)
        REFERENCES public.metal_masters (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_stud_id FOREIGN KEY (stud_id)
        REFERENCES public.stud_config_products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;
import { BIGINT, DOUBLE, INTEGER, STRING } from "sequelize"

export const StudDiamonds = (dbContext: any) => {
    let studDiamonds = dbContext.define("stud_diamonds", {
        id: {
            type: BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        stud_id: {
            type: BIGINT,
        },
        dia_shape: {
            type: BIGINT,
        },
        dia_weight: {
            type: DOUBLE,
        },
        dia_mm_size: {
            type: BIGINT,
        },
        dia_count: {
            type: BIGINT,
        },
        company_info_id: {
            type: INTEGER
        },
        side_dia_prod_type: {
            type: STRING
        }
    })

    return studDiamonds
}
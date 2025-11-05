import { BIGINT, DOUBLE, INTEGER } from "sequelize"

export const StudMetal = (dbContext: any) => {
    let studMetal = dbContext.define("stud_metals", {
        id: {
            type: BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        stud_id: {
            type: BIGINT,
        },
        metal_id: {
            type: BIGINT,
        },
        karat_id: {
            type: BIGINT,
        },
        metal_wt: {
            type: DOUBLE,
        },
        company_info_id :{ 
            type:INTEGER
        },
    })

    return studMetal
}
import { BIGINT, DOUBLE, INTEGER } from "sequelize"

export const ConfigPendantMetals = (dbContext: any) => {
    let pendantMetal = dbContext.define("config_pendant_metals", {
        id: {
            type: BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        pendant_id: {
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

    return pendantMetal
}
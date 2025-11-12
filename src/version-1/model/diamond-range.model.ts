import { INTEGER } from "sequelize";

export const DiamondRanges = (dbContext: any) => {
  let diamondRanges = dbContext.define('diamond_ranges', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        autoIncrementIdentity: true,
        type: INTEGER,
      },
      carat_value: {
        allowNull: false,
        type: 'character varying',
      },
      min_carat_range: {
        allowNull: false,
        type: 'character varying',
      },
      max_carat_range: {
        allowNull: false,
        type: 'character varying'
      },

    });
  
  return diamondRanges;
}
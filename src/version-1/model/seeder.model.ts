import { DATE, NOW,  STRING } from "sequelize";
export const SeederMeta = (dbContext: any) => {
 let seederMeta = dbContext.define(
  "SeederMeta",
  {
    name: {
        type: STRING,
        allowNull: false,
        unique: true,
      },
      executed_at: {
        type: DATE,
        allowNull: false,
        defaultValue: NOW,
      },
  },{
    tableName:'SeederMeta'
  }
);
  return seederMeta;
}

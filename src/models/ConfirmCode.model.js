import {DataTypes, Model} from "sequelize";
import {sequelize} from "../utils/db.js";

export class ConfirmCodeModel extends Model{}

ConfirmCodeModel.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
    allowNull: false
  },
  code: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
},{sequelize, tableName: "confirmCodes", timestamps: false})
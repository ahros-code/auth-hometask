import {DataTypes, Model} from "sequelize";
import {sequelize} from "../utils/db.js";

export class UserModel extends Model{}

UserModel.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email:{
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isActivated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  activateLink: {
    type: DataTypes.STRING
  }
},{sequelize, tableName: "users", timestamps: false})
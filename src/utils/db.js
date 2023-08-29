import {Sequelize} from "sequelize";
import "dotenv/config";

export const sequelize = new Sequelize(process.env["DB_CONNECTION_STRING"],{
  logging: false
});

try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}
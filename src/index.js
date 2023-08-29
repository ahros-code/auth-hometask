import express from "express";
import {UserModel} from "./models/User.model.js";
import authRouter from "./routers/auth.router.js";
import {ConfirmCodeModel} from "./models/ConfirmCode.model.js";

(async function (){
  try{
    const app = express();
    app.use(express.json());
    await UserModel.sync({alter: true})
    await ConfirmCodeModel.sync({alter: true})
    app.use("/auth", authRouter)
    app.listen(process.env["PORT"], () => {
      console.log("🚀 server is running...")
    })
  } catch (err){
    console.log(err.message)
  }
})()
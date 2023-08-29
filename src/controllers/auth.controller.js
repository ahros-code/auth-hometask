import {UserModel} from "../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {ConfirmCodeModel} from "../models/ConfirmCode.model.js";
import nodemailer from "nodemailer";
import {v4} from "uuid";
import "dotenv/config"

async function register(req, res) {
  try {
    const {username, email, password} = req.body

    const saltRounds = 5;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    const token = jwt.sign({email, hash}, process.env["JWT_SECRET_KEY"]);

    const activateLink = v4();

    const newUser = await UserModel.create({
      username, email, password: hash, activateLink
    },{returning: true})

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env["NODEMAILER_USER"],
        pass: process.env["NODEMAILER_PASS"]
      }
    })
    const message = transport.sendMail({
      from: process.env["SENDER"],
      to: email,
      subject: "Activate your account",
      html: `
        <div>
          <h1>activation link</h1>
            <a href=${process.env["BACK_URL"]}/auth/activate/${activateLink}>Activate account</a>
        </div>
      `
    })

    return res.status(201).send({
      status: 201,
      data: [
        {user: newUser}, {token}
      ],
      error: null
    })

  } catch (err) {
    return res.status(500).send({
      status: 500,
      data: null,
      error: err.message
    })
  }
}

async function login(req, res){
  try{
    const {email, password} = req.body;
    const user = await UserModel.findOne({
      where: {
        email
      }
    })
    if(!user){
      return res.status(404).send({
        status: 404,
        data: null,
        error: "user is not found"
      })
    }
    const checkPass = bcrypt.compareSync(password, user.dataValues.password);
    if(!checkPass){
      return res.status(400).send({
        status: 400,
        data: null,
        error: "password is not correct"
      })
    }
    const token = jwt.sign({email, password: user.password}, process.env["JWT_SECRET_KEY"]);

    return res.status(200).send({
      status: 200,
      data: [
        {token}
      ],
      error: null
    })

  } catch (err){
    return res.status(500).send({
      status: 500,
      data: null,
      error: err.message
    })
  }
}

const generateCode = (len) => {
  let code = "";
  const schema = "0123456789";
  for (let i = 0; i < len; i++) {
    code += schema[Math.floor(Math.random() * schema.length)];
  }

  return code;
};

async function forgotPassword(req, res){
  try{
    const {email} = req.body;
    const user = await UserModel.findOne({where: {email}});
    if(!user){
      return res.status(404).send({
        status: 404,
        data: null,
        error: "user is not found"
      })
    }
    const codeExists = await ConfirmCodeModel.findOne({where: {user_id: user.id}});
    if(codeExists){
      ConfirmCodeModel.destroy({where: {user: user.id}})
    }
    const code = generateCode(5);
    await ConfirmCodeModel.create({
      code,
      user_id: user.id
    });
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env["NODEMAILER_USER"],
        pass: process.env["NODEMAILER_PASS"]
      }
    })
    const message = transport.sendMail({
      from: process.env["SENDER"],
      to: user.email,
      text: code
    });
    return res.status(200).send({
      status: 200,
      data: [{email: user.email}, {message: "Password reset code has been sent to ur email"}]
    })
  } catch (err){
    return res.status(500).send({
      status: 500,
      data: null,
      error: err.message
    })
  }
}

async function newPassword(req, res){
  try{
    const {code, email, password} = req.body;
    const user = await UserModel.findOne({where: {email}});
    if(!user){
      return res.status(404).send({
        status: 404,
        data: null,
        error: "user is not found"
      })
    }
    const dbCode = await ConfirmCodeModel.findOne({where: {user_id: user.id}});
    if(dbCode.code != code){
      return res.status(400).send({
        status: 400,
        data: null,
        error: "code is wrong"
      })
    }
    const saltRounds = 5;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    const newUserPass = await UserModel.update({password: hash},{where: {email}});
    return res.status(200).send({
      status: 200,
      data: [{message: "Password is successfully updated!!!"}],
      error: null
    })
  } catch (err){
    return res.status(500).send({
      status: 500,
      data: null,
      error: err.message
    })
  }
}

async function activate(req, res){
  try{
    const {link} = req.params;
    const user = await UserModel.findOne({where: {activateLink: link}});
    if(!user){
      return res.status(404).send({
        status: 404,
        data: null,
        error: "user is not found"
      })
    }
    user.isActivated = true;
    await user.save();
    return res.status(200).send({
      status: 200,
      data: [{message: "Account is activated"}],
      error: null
    })
  } catch (err){
    return res.status(500).send({
      status: 500,
      data: null,
      error: err.message
    })
  }
}

export default {register, login, forgotPassword, newPassword, activate}
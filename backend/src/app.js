const express = require("express");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken');
const cors = require("cors");
const swaggerUi = require('swagger-ui-express');
require("dotenv").config();
const {
  validate,
  update_validate,
  delete_validate,
} = require("./Middleware/userMiddleware");
const { get_user_data, add_user } = require("./utils");
const { DBConnect } = require("./config/Db");
const { userModel } = require("./Module/userModule");
const { cloudniary_upload } = require("./utils/cloudinary_uploader");
const { Multer_upload } = require("./utils/multer_upload");
const { eventRouter } = require("./router/eventRouter");
const { Token_auth } = require("./Middleware/Token_auth");
const { Role_Auth } = require("./Middleware/Role");
const { openapiSpecification } = require("./config/Swagger");
//console.log(openapiSpecification)
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(cors());
app.use('/event',eventRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});
app.use(morgan("combined", { stream: accessLogStream }));

app.get("/", async(req, res) => {
  const users = await userModel.find({},{password:0,_id:0,__v:0});
  res.json(users);
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: get all users availble
 *     description: all USers
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 */

app.post("/register", Multer_upload.single("image"), async (req, res) => {
  let status = 0;
  let message = "All fields Are required name,email,password,image";
  let return_data = [];
  const { name, email, password } = req.body;
  if (name && email && password && name != "" && email != "" && password != "") {
    const emailFind = await userModel.findOne({ email: email });
    //console.log(emailFind);
    message = "Email is Already Registered";
    if (emailFind == null) {
      message = "Image upload failed";
      if (req.file) {
        try {
          const profile_image = await cloudniary_upload(req);
          const hashpass =await bcrypt.hash(password, 10);
          const newUser = {
            id: parseInt(Math.random() * 10000000),
            name,
            email,
            password:hashpass,
            profile_image,
          };
          const new_user = await userModel.create(newUser);
          message = "You are registered";
          status = 1;
          return_data = new_user;
        } catch (error) {
          message = `Image upload failed: ${error.message}`;
        }
      }
    }
  }
  res.json({ status: status, message: message, data: return_data });
});
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user by their name, email, password, profile photo.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Registration response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */

app.post('/login',async(req,res)=>{
  let status = 0;
  let message = "All fields Are required email,password";
  let return_data = [];
  const{email,password} = req.body;
  if(email && password && email!='' && password!=''){
    const user = await userModel.findOne({email:email});
    message="User not availbale"
    if(user!=null){
      message="Wrong Password"
      //console.log(user.password)
      const password_match = await bcrypt.compare(password, user.password);
      if(password_match) {
          message="Login successfully";
          status=1;
          let token = jwt.sign({ email: user.email }, process.env.JWT_PRIVATE_KEY);
          return_data = [{token:token}]
      }
    }
  }
  res.json({ status: status, message: message, data: return_data });
})
/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user with email and password.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */


app.patch("/update", Token_auth, Role_Auth(['user','Admin']), async (req, res) => {
  let status = 0;
  let message = "All fields (id, name, email) are required";
  let return_data = [];
  const {name, email } = req.body;
  if (name && email && name !== '' && email !== '') {
      try {
          const user = await userModel.findOne({ email: req.user.email });
          message = "User not found";
          if (user) {
              message = "Email Already Used";
              const check_email = await userModel.findOne({ email: email });
              if(check_email==null){
                user.name = name;
                user.email = email;
                await user.save();
                status = 1;
                message = "User update successful";
                return_data = user;
              }
          }
      } catch (error) {
          message = `Update failed: ${error.message}`;
      }
  }

  res.json({ status: status, message: message, data: return_data });
});
/**
 * @swagger
 * /update:
 *   patch:
 *     summary: Update user details
 *     description: Update a user's name and email. Requires authentication.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Update response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */


app.delete("/delete", Token_auth, async (req, res) => {
  let status = 0;
  let message = "Account deletion failed";
  let return_data = [];
  try {
    const user = await userModel.findOne({ email: req.user.email });
    if (user) {
      await userModel.deleteOne({ email: req.user.email });
      status = 1;
      message = "Account deletion successful";
    } else {
      message = "User not found";
    }
  } catch (error) {
    message = `Deletion failed: ${error.message}`;
  }
  res.json({ status: status, message: message, data: return_data });
});
/**
 * @swagger
 * /delete:
 *   delete:
 *     summary: Delete user account
 *     description: Deletes the authenticated user's account.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Deletion response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */


app.listen(process.env.PORT, () => {
  try {
    DBConnect(process.env.DB_URL);
    console.log(`Server is at PORT http://localhost:${process.env.PORT}`);
  } catch (error) {
    console.log(error);
  }
});

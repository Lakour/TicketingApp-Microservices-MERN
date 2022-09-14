import express from 'express';
import { body } from "express-validator";
import jwt from 'jsonwebtoken';

import { User } from '../models/user'
import { Password } from '../services/password';
import { validateRequest } from "../middlewares/validate-request";
import { BadRequestError } from '../errors/bad-request-error';
const router = express.Router();


router.post("/api/users/signin",
  //error handling
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("You must supply a password"),
  ], validateRequest,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { email, password } = req.body;

    //does email exist?
    const user = await User.findOne({ email })

    if (!user) {
      throw new BadRequestError("Login Request Failed");
    }

    //compare pw with stored and supplied
    const isPassword = await Password.compare(user.password, password);

    if (!isPassword) {
      throw new BadRequestError("Invalid Credentials")
    }

    //logged in send back a JWT
    const userJwt = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY!);

    //Store it on session object
    req.session = { jwt: userJwt };


    res.status(200).send(user)

  })

export { router as signinRouter };

import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from 'jsonwebtoken';

import {User} from '../models/user'
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
 
    //check if email already exists
    const {email, password} = req.body;
    const existingUser = await User.findOne({email});

    if(existingUser){
      throw new BadRequestError("Email in use");
    }
    
    //hash pw if no email exists
    const user = User.build({email, password});

    //save to db
    await user.save();

    //Generate JWT
    //TS needs process.env to hav a JWT so we check in index.ts upon server startup
    const userJwt = jwt.sign({id: user.id, email: user.email}, process.env.JWT_KEY!);

    //Store it on session object
    req.session = {jwt:userJwt};


    res.status(201).send(user);
  }
);

export { router as signupRouter };

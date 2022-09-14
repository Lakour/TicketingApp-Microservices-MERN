import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();
//traffic is being proxied to our app thru ingress nginx
//express is behind this proxy and needs to know we can allow from ingress nginx
app.set("trust proxy", true)
app.use(json());
app.use(cookieSession({
  // disable encryption, jwt will already be encrypted
  signed: false,
  secure: true
}))

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

//conncet to db
const start = async ()=>{
  //is there a JWT? Coming from k8's secret lib
  if(!process.env.JWT_KEY){
    throw new Error("JWT_KEY must be defined")
  }
  try{
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth")

    console.log("Connected to MongoDb")
  }catch(err){
    console.log(err)
  }
  app.listen(3000, () => {
    console.log('Listening on port 3000!!!!!!!!');
  });
}
start()


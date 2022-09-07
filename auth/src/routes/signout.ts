import express from 'express';

const router = express.Router();

router.post("/api/user/signout",(req, res)=>{
  res.send("singed out")
})

export {router as signoutRouter};
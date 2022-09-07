import mongoose from 'mongoose';
import {Password} from '../services/password';
 
//An interface that describes the props required to create a user
interface UserAttributes {
  email: string,
  password: string
}

//An interface that describes the props that a User Model has
//a method that will be associated with the user model
interface UserModel extends mongoose.Model<UserDocument> {
  build(attributes: UserAttributes): UserDocument;
}

//An interface that describes the props that a single User has
//if we dont do this, then the user object will have extra props that we dont need
interface UserDocument extends mongoose.Document{
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }
});

//check password
userSchema.pre('save', async function(done){
  //are we changing pw?
  if(this.isModified('password')){
    //get pw from user document
    const hashed = await Password.toHash(this.get('password'))
    this.set("password", hashed)
  }
  done();
})

userSchema.statics.build = (attributes: UserAttributes) => {
  return new User(attributes)
}

const User = mongoose.model<UserDocument, UserModel>("User", userSchema);


export { User };
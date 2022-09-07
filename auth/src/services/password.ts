//built-in libraries
import {scrypt, randomBytes} from 'crypto';
import {promisify} from 'util';

//scrpyt by default is not async so we need promisify
const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string){
    //generate random string
    const salt = randomBytes(8).toString("hex");
    //type of Buffer
    const buffer = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buffer.toString('hex')}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string){
    const [hashedPassword, salt] = storedPassword.split('.');
    const buffer = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    
    return buffer.toString('hex') === hashedPassword;
  }
}
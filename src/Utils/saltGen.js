import bcrypt from 'bcrypt';
import {config} from 'dotenv';
import { appendFileSync } from 'fs';
const env = config()
let salt = process.env.SALT;

let genSalt = salt
if (! salt ){
 genSalt =  bcrypt.genSaltSync(12)
 appendFileSync('./.env', ('\nSALT= ' + genSalt ))
}
function generateCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    
    for (let i = 0; i < 10; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return code;
  }
export {genSalt,generateCode}
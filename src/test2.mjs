import CryptoES from 'crypto-es';
import something from "./test.js"
let c= CryptoES;
const dateKey = c.HmacSHA256("secret", "AWS4");
export {dateKey, something } ;
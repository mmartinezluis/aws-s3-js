import CryptoES from 'crypto-es';
import something from "./test"
let c= CryptoES;
const dateKey = c.HmacSHA256("secret", "AWS4");
export {dateKey, something } ;
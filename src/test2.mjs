import CryptoES from 'crypto-es';
// import something from "./test"
let c= CryptoES;
const dateKey = c.HmacSHA256(date, "AWS4");
export default dateKey;
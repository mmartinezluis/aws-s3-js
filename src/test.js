const customBuffer = require("buffer/").Buffer
// import customBuffer from 'buffer';


const foo = () => {
    return customBuffer.from("Hello")
};

module.exports = foo;
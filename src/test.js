import customBuffer from 'buffer'
// import toBuffer from "typedarray-to-buffer";


function foo(){
    return customBuffer.from("Hello")
}

// function run(){
//     const encoder = new TextEncoder();
//     return toBuffer(encoder.encode("Hello"));
// }

export default foo
import toBuffer from "typedarray-to-buffer";

function run(){
    const encoder = new TextEncoder();
    return toBuffer(encoder.encode("Hello"));
}

export default run
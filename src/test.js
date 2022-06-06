import customBuffer from 'buffer';

const foo = () => {
    return customBuffer.from("Hello")
};

export { foo };
// importing nanoid directly in 'index.mjs' does not work as expected when
// calling the module in the browser via Webpack (it produces an error);
// so first require the module here, then import it to index file
const { nanoid } = require('nanoid');
module.exports = nanoid;
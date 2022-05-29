class S3Client {

    static crypto = require('crypto')

    constructor(config) {
        this.config = config;
    }
}

module.exports = S3Client;
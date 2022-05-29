class S3Client {

    static crypto = require('crypto')

    constructor(config) {
        this.config = config;
    }

    _request(uri, method, payload, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, uri, true);
        xhr.onreadystatechange = function() {
            if(xhr.readyState === XMLHttpRequest.DONE) {
                let statusCode = xhr.status;
                if(callback){
                    callback(statusCode, xhr);
                }
            }
        }
        xhr.send(payload);
    }

}

module.exports = S3Client;
class S3Client {

    static crypto = require('crypto')

    constructor(config) {
        this.config = config;
    }

    uploadFile(file, key, dirName) {

        const tenMinutes = 6e5;
        const isoDate = new Date(new Date().getTime() + tenMinutes).toISOString();
        const date = isoDate.split("T")[0].split("-").join("");  // yyyymmdd
        const formattedIso = isoDate.split("-").join("").split(":").join("").split(".").join("");

        const policy = Buffer.from(
                JSON.stringify(
                    { 
                        expiration: isoDate,
                        conditions: [
                            {"bucket": this.config.bucketName},
                            {"acl": "public-read"},
                            ["starts-with", "$key", ""],
                            ["starts-with", "$Content-Type", ""],
                            {"x-amz-meta-uuid": "14365123651274"},
                            {"x-amz-server-side-encryption": "AES256"},
                            ["starts-with", "$x-amz-meta-tag", ""],
                            {"x-amz-credential": `${this.config.accessKeyId}/${date}/${this.config.region}/s3/aws4_request`},
                            {"x-amz-algorithm": "AWS4-HMAC-SHA256"},
                            {"x-amz-date": formattedIso }
                        ] 
                    }
                )
            )
            .toString('base64')
            .replaceAll(/[$\n\r]/g, "")

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
class S3Client {

    static crypto = require('crypto')

    constructor(config) {
        this.config = config;
    }

    uploadFile(file, key, dirName) {
        try {
            this._sanityCheckConfig(); 

            const tenMinutes = 6e5;
            const isoDate = new Date(new Date().getTime() + tenMinutes).toISOString();
            const date = isoDate.split("T")[0].split("-").join("");  // yyyymmdd
            const formattedIso = isoDate.split("-").join("").split(":").join("").split(".").join("");

            const policy = this._generatePolicy(isoDate, date, formattedIso);
            const signature = this._generateSignature(date, policy);
        
            // Create a form to send to AWS S3
            let formData = new FormData();
            formData.append("key", file.name)
            formData.append("acl", "public-read")
            formData.append("content-type", file.type)
            formData.append("x-amz-meta-uuid", "14365123651274")
            formData.append("x-amz-server-side-encryption", 'AES256')
            formData.append("x-amz-credential", `${this.config.accessKeyId}/${date}/${this.config.region}/s3/aws4_request`)
            formData.append("x-amz-algorithm", 'AWS4-HMAC-SHA256')
            formData.append("x-amz-date", formattedIso)
            formData.append("x-amz-meta-tag", "")
            formData.append("policy", policy)
            formData.append("x-amz-signature", signature)
            formData.append("file", file)

            return new Promise((resolve, reject) => {
                this._request(this.config.baseUrl, 'POST', formData, function(statusCode, xhr){
                    if(statusCode >= 200 && statusCode <= 207) {
                        console.log(xhr)
                        return resolve({
                            bucket: this.config.bucketName, 
                            key: file.name, 
                            location: this.config.baseUrl + "/" +  file.name, 
                            status: statusCode 
                        });
                    }
                    return reject({
                        message: xhr.responseText, 
                        status: xhr.status, 
                        statusText: xhr.statusText
                    });
                }.bind(this));
            })
        } catch(error) {
            return Promise.reject(error);
        }
    }

    deleteFile(key, dirName) {
        this._sanityCheckConfig(); 
        if(typeof(key) !== "string" || !key.trim().length) throw new Error("'key' must be a nonempty string");
        if(dirName && (typeof dirName !== "string" || !dirName.length)) throw new Error("If included, 'dirName' must be a nonempty string");
        return new Promise((resolve, reject) => {
            this._request(this.config.baseUrl + "/" + (dirName ? dirName + "/" : "") + key, "DELETE", undefined, function(statusCode, xhr) {
                console.log(statusCode);
                console.log(xhr);
                return resolve({
                    key: (dirName ? dirName + "/" : "") + key, 
                    status: statusCode,
                    xhr: xhr
                });
            })
        })
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

    _sanityCheckConfig() {
        if(typeof(this.config) !== "object" || (this.config instanceof Array) || !Object.keys(this.config).length ) throw new Error("The argument for the constructor of the " + this.constructor.name + " class must be a nonempty object");
        // Required params
        if(typeof(this.config.bucketName) !== "string" || !this.config.bucketName.trim().length ) throw new Error("'bucketName' must be a nonempty string");
        if(typeof(this.config.region) !== "string" || !this.config.region.trim().length ) throw new Error("'region' must be a nonempty string");
        if(typeof(this.config.accessKeyId) !== "string" || !this.config.accessKeyId.trim().length ) throw new Error("'accessKeyId' must be a nonempty string");
        if(typeof(this.config.secretAccessKey) !== "string" || !this.config.secretAccessKey.trim().length ) throw new Error("'secretAccessKey' must be a nonempty string");
        // Optional params
        if(this.config.baseUrl && (typeof(this.config.baseUrl) !== "string" || !this.config.baseUrl.trim().length)){ throw new Error("If included, 'baseUrl' must be a nonempty string") } else this.config.baseUrl = (this.config.baseUrl || 'https://' + this.config.bucketName + '.s3.' + this.config.region + '.amazonaws.com');         
        if(this.config.parseFileName && typeof(this.config.parseFileName) !== "boolean"){ throw new Error("If included, 'parseFileName' must be a boolean") } else this.config.parseFileName = true;
        if(this.config.onUploadProgress && typeof(this.config.onUploadProgress) !== "function") throw new Error("If included, the value for the 'onUploadProgress' key must be a function");
        if(this.config.parsingFunction && typeof(this.config.parsingFunction) !== "function") throw new Error("If included, the value for the 'parsingFunction' key must be a function returning a nonempty string")
    }

    _generatePolicy(isoDate, date, formattedIso) {
        // Note: The optional "encoding" parameter from "Buffer.from(string[,enconding])" defaults to utf8
        return Buffer.from(
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

    _generateSignature(date, policy) {
        // Calculating the SigningKey
        let c = this.constructor.crypto;
        // c ( algorithm, key, ..rest(string))
        const dateKey = c.createHmac('sha256', "AWS4" + this.config.secretAccessKey).update(date).digest();
        const dateRegionKey = c.createHmac('sha256', dateKey).update(this.config.region).digest();
        const dateRegionServiceKey = c.createHmac('sha256', dateRegionKey).update('s3').digest();
        const signingKey = c.createHmac('sha256', dateRegionServiceKey).update('aws4_request').digest();
        const signature = c.createHmac('sha256', signingKey).update(policy).digest('hex');
        // signing key = HMAC-SHA256(HMAC-SHA256(HMAC-SHA256(HMAC-SHA256("AWS4" + "<YourSecretAccessKey>","20130524"),"us-east-1"),"s3"),"aws4_request")
        return signature;
    }

}

module.exports = S3Client;
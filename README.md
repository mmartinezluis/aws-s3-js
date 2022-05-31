
# AWS S3 JS
Upload files to an Amazon S3 bucket using JavaScript.

## Installation
Run `npm install aws-s3-js` to install the package in your project. 

## Usage
To get started, call the constructor using the below keys:

```javascript
import awsS3Js from 'aws-s3-js'

const config = {
    bucketName: "<bueket-name>"
    region: "<bucket-region>"
    accessKeyId: "<your-accessKey>"
    secretAccessKey: "<your-secrectAccessKey>"
}

const S3Client = new awsS3Js(config);
```

### Uploading a file

To upload a file, use the S3Client with the `uploadFile` method:

```javascript
S3Client
    .uploadFile(file)
    .then( resp => {
        // your code to handle response
    })
    .catch( err => {
        // your code to handle error
    })
```

Sample response:

```javascript
{
    bucket: "bucketname"
    key: "object's S3 key"
    location: "object's S3 Url"
    status: 204
}

Note: 204 is a success code when 
```

### Deleting a file

Use the S3Client with the `deleteFile` method:

```javascript
S3Client
    .deleteFile("file-S3-key")
    .then( resp => {
        // your code to handle response
    })
    .catch( err => {
        // your code to handle error
    })
```

### Configuration

The constructor accepts the following keys:

```javascript
config = {
    bucketName: "<string> (required)",
    region: "<string> (required)",
    accessKeyId: "<string> (required)",
    secretAccessKey: "<string> (required)",
    baseUrl: "<string> (optional; if not provided, utilizes the bucket)",
    parseFileName: "<boolean> (optinal; defaults to 'true')",
    onUploadProgress: "<callback function> (optional; passes you two arguments: 'loaded' and 'total' so you can use them to track/display the progress of the file upload)",
    parsingFunction: "<function> (optional; takes one argument, the file's key (the new name for the file; refer to below example for usage))"
}
```

The `uploadFile` method accepts the following arguments:

```javascript
S3Client.uploadFile(
    "file: <a file or anything> (required)", 
    "key: <string> (optional; if included, this will be the new name of the file; if not included, a random string will be generated and assigned as a key, with the file type appended at the end (e.g., .png, .jpeg,))", 
    "dirName: <string> (optional; example: images/cats)" 
)
   
```

To be continued soon
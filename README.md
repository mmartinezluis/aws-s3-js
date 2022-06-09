
# AWS S3 JS

Upload files to an Amazon S3 bucket using JavaScript.

[Finally: `aws-s3-js` now works straight out of the box with react-scripts 5 and Webpack 5, even if you have not configured your app to [polyfill Node Js core modules](https://stackoverflow.com/questions/64557638/how-to-polyfill-node-core-modules-in-webpack-5). `aws-s3-js` also works with react-scripts 4 straight out of the box.]

[Note: aws-s3-js does not currently support Typescript; for this reason, you might see a message next to your import statement (`import awsS3Js from 'aws-s3-js'`) that reads `Could not find a declaration file for module "aws-s3-js". '/.../node_modules/aws-s3-js/src/index.mjs' implicitly has an 'any' type.` Don't worry, this does not affect the functionality of the package. I will be working on adding Typescript support next (and the message will go away).]

## Installation

To install the package, in your project run

```
npm install aws-s3-js
```

Then use a default import statement:
```
import awsS3Js from 'aws-s3-js'
```

## Usage

To get started, call the constructor using the below keys:

```javascript
import awsS3Js from 'aws-s3-js'

const config = {
    bucketName: "<bucket-name>",
    region: "<bucket-region>",
    accessKeyId: "<your-accessKey>",
    secretAccessKey: "<your-secretAccessKey>"
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
    bucket: "bucketname",
    key: "object's S3 key",
    location: "object's S3 Url",
    status: 204
}
```
Note: 204 is a success code. 


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

## Configuration

The constructor accepts the following keys:

```javascript
config = {
    bucketName: "<string> (required)",
    region: "<string> (required)",
    accessKeyId: "<string> (required)",
    secretAccessKey: "<string> (required)",
    baseUrl: "<string> (optional) (if not provided, utilizes the bucket's info to form the bucket's url)",
    parseFileName: "<boolean> (optinal) (defaults to 'true')",
    onUploadProgress: "<callback function> (optional) (passes you two arguments: 'loaded' and 'total' so you can use them to track/display the progress of the file upload)",
    parsingFunction: "<function> (optional) (takes one argument, the file's key (the new name for the file; returns a string; refer the Advance Useage section for example usage))"
}
```

The `uploadFile` method accepts the following arguments:

```javascript
S3Client.uploadFile(
    "file <a file> (required)", 
    "key <string> (optional) (if included, this will be the new name of the file; if not included, a random string will be generated and assigned as a key, with the file type appended at the end (e.g., .png, .jpeg,))", 
    "dirName <string> (optional) (example: profileImages)" 
)   
```

The `deleteFile` method accepts one argument only:
```javascript
S3Client.deleteFile("file-S3-key <string> (required)")
```

You can use a combination of the above configurations to customize the functionality of the module. 


## Basic Usage

### Using the module with `parseFileName` on (default configuration):

```javascript
import awsS3Js from 'aws-s3-js'

const config = {
    bucketName: "<bueket-name>",
    region: "<bucket-region>",
    accessKeyId: "<your-accessKey>",
    secretAccessKey: "<your-secrectAccessKey>"
}

const S3Client = new awsS3Js(config);

S3Client
    .uploadFile(file, file.name)
    .then( resp => console.log(resp))
```

Assuming that the file's name is
```javascript
"#my/picture [in] ?$ {the} +&mountain.png"
```
it will be parsed before sending the file to Amazon, and you'll get a response containing the following value for `key` (from the parsed file's name):

```javascript
{
    bucket: "bucketname",
    key: "'mypicturein$the&mountain.png'",
    location: "object's S3 Url",
    status: 204
}
```
You can see that some special characters were removed as well as blank spaces. The module's default parsing function takes care of removing some special characters that may void your object's Amazon S3 key (such as '#', '?', '+'). You can get more info about valid characters for objects' key (file names) in the **More Info** section below. 

### Creating and/or uploading to a specific directory:

Suppose you have files with names `adjacency-list.jpeg` and `Barcelona/2018.png`, and you want to upload them to different directories (folders). You would call the S3Client like so (asssume default configuration):

For the first file:
```javascript
// note: here we assign a key manually
S3Client
    .upload(file, "adjacency-list.jpeg", "technology")
    .then( data => console.log(data))
```

Then, the response object would contain 
```javascript
key: "technology/adjacency-list.jpeg"
```
which places the object within the `technology` directory. For the second file:
```javascript
// note: here we use the file's name as a key
S3Client
    .upload(file, file.name, "vacation")
    .then( data => console.log(data))
```
The response object would contain 
```javascript
key: "vacation/Barcelona2018.png"
```
which places the object within the `vacation` directory. For the second file, note that the "/" from the file name was removed; if the forward slash would have gone through, it would have created yet an additional directory: `vacation/Barcelona`. If your bucket is consumed by users of your app, you probably don't want new directories being created at random if users include file names that contain a forward slash. 

You can always turn off the parsing, if you wish, in the constructor:
```javascript
const config = {
    //... some properties,
    parseFileName: false
}
```
which would have produced, for the second file:
```javascript
key: "vacation/Barcelona/2018.png"
```

### Leaving off the key:

If you don't specify a key, the module will generate a random key of 21 characters:

```javascript
S3Client
    .upload(file, undefined, "vacation")
    .then( data => console.log(data))

    // sample response key:
    key: "vacation/067b2a3bce020dp_cf9bc.png"
```

## Advanced Usage

### Tracking upload progress:

This functionality may come handy if you are uploading a large file.

Define a function to assign it to the constructor's `onUploadProgress` key, which provides you with two arguments (`loaded`, and `total`):

```javascript
import awsS3Js from 'aws-s3-js'

const onUploadProgress = function(loaded, total) {
    // Do something, such as setting a state variable to display current upload progress
     console.log(`Uploaded ${loaded} of ${total}`);
}

const S3Client = new awsS3Js({
    bucketName: "<bucket-name>",
    region: "<bucket-region>",
    accessKeyId: "<your-accessKey>",
    secretAccessKey: "<your-secretAccessKey>",
    onUploadProgress: (loaded, total) => onUploadProgress(loaded, total)
})
```
The `onUploadProgress` function will be automatically called while a file is uploading:

```javascript
S3Client
    .uploadFile(file)
    .then( data => console.log(data))
```

### Using a custom parsing function:

You can provide your own parsing function for the module to use instead of the module's default parsing function (note: if `parseFileName`  is set to false, all parsing will be skpped and the original key provided will be returned):

```javascript
import awsS3Js from 'aws-s3-js'

// the parsing function must return a string
const parsingFunction = function(key) {
    // Do something, such as removing special characters from the key
     return key.replace(/[^]/g, "")
}

const S3Client = new awsS3Js({
    bucketName: "<bucket-name>",
    region: "<bucket-region>",
    accessKeyId: "<your-accessKey>",
    secretAccessKey: "<your-secrectAccessKey>",
    parsingFunction: function(key) {
        parsingFunction(key)
    }
})

// note: you must provide a key (a file name) for your parsing function to run
S3Client
    .upload(file, "this^is^the^file^key.png")
    .then( data => console.log(data))

// Expected key in response object:
key: "thisisthefilekey.png"
```

## Dependencies
This module utilizes 3 dependencies:
* buffer: used to generate a Buffer for calculating the _string to sign_ or _bucket policy_ in Amazon's Signature Calculation Version 4. This module is a polyfill for Node Js' core Buffer module, which prevents your app from crahsing when using Webpack 5 or react-scripts 5.

* CryptoES: used for carrying out HmacSHA256 (secure hashing algorithm) encryptions in calculating the _signing key_ in Amazon's Signature Calculation Version 4.
This module is a polyfill for Node Js' crypto module.

* nanoid: used to generate a random key when a key is not provided to the module's `uploadFile` method. 

## More Info
You can find more info about Amazon S3 object key valid characters and characters to avoid [here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html).

This package performs browser-based uploads to Amazon S3. For official documention on this process, you may refer to the [Amazon Simple Storage Service API Reference](https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html), PDF section "Authenticating Requests in Browser-Based Uploads Using POST (AWS Signature Version 4)", subsections "Broswer-Based uploads Using HTTP-POST", "Calculating a Signature", "POST Policy", and "Example: Browser-Based Upload using HTTP POST (Using AWS Signature Version 4)".

## Credits
This package is inspired on and improves upon react-aws-s3.

## Contributing
Coming later.

## License
MIT







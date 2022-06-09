
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

Please refer to `aws-s3-js`[github repo](https://github.com/mmartinezluis/aws-s3-js) for full documentation.

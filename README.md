
# AWS S3 JS

Upload files to an Amazon S3 bucket using JavaScript.

[Finally: `aws-s3-js` now works straight out of the box with react-scripts 5 and Webpack 5, even if you have not configured your app to [polyfill Node Js core modules](https://stackoverflow.com/questions/64557638/how-to-polyfill-node-core-modules-in-webpack-5). `aws-s3-js` also works with react-scripts 4 straight out of the box.]

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

Please refer to `aws-s3-js`[github readme](https://github.com/mmartinezluis/aws-s3-js) for  full documentation and example usage.

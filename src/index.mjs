import CryptoES from "crypto-es";
import nanoid from "../_nanoid.js";
import customBuffer from "../_buffer.js";

class S3Client {
  constructor(config) {
    this.config = config;
  }

  uploadFile(file, key, dirName) {
    try {
      this._sanityCheckConfig();
      this._sanityCheckPayload({ file, key, dirName });

      const tenMinutes = 6e5;
      const isoDate = new Date(new Date().getTime() + tenMinutes).toISOString();
      const date = isoDate.split("T")[0].split("-").join(""); // yyyymmdd
      const formattedIso = isoDate
        .split("-")
        .join("")
        .split(":")
        .join("")
        .split(".")
        .join("");

      const policy = this._generatePolicy(isoDate, date, formattedIso);
      const signature = this._generateSignature(date, policy);
      const newKey = this._generateKey(file, key);
      const fileName = dirName ? dirName + "/" + newKey : newKey;

      let formData = new FormData();
      formData.append("key", fileName);
      formData.append("acl", "public-read");
      formData.append("content-type", file.type);
      formData.append("x-amz-meta-uuid", "14365123651274");
      formData.append("x-amz-server-side-encryption", "AES256");
      formData.append(
        "x-amz-credential",
        `${this.config.accessKeyId}/${date}/${this.config.region}/s3/aws4_request`
      );
      formData.append("x-amz-algorithm", "AWS4-HMAC-SHA256");
      formData.append("x-amz-date", formattedIso);
      formData.append("x-amz-meta-tag", "");
      formData.append("policy", policy);
      formData.append("x-amz-signature", signature);
      formData.append("file", file);

      return new Promise((resolve, reject) => {
        this._request(
          this.config.baseUrl,
          "POST",
          formData,
          function (statusCode, xhr) {
            if (statusCode < 200 || statusCode > 207) {
              return reject({
                message: xhr.responseText,
                status: xhr.status,
                statusText: xhr.statusText,
              });
            }
            return resolve({
              bucket: this.config.bucketName,
              key: fileName,
              location: this.config.baseUrl + "/" + fileName,
              status: statusCode,
            });
          }.bind(this)
        );
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  deleteFile(key) {
    try {
      this._sanityCheckConfig();
      if (typeof key !== "string" || !key.trim().length)
        throw new Error("'key' must be a nonempty string");
      return new Promise((resolve, reject) => {
        this._request(
          this.config.baseUrl + "/" + key,
          "DELETE",
          undefined,
          function (statusCode, xhr) {
            return resolve({
              key: key,
              status: statusCode,
              message: xhr.responseText,
            });
          }
        );
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  _request(uri, method, payload, callback) {
    let xhr = new XMLHttpRequest();
    if (method === "POST" && this.config.onUploadProgress) {
      xhr.upload.onprogress = function (event) {
        this.config.onUploadProgress(event.loaded, event.total);
      }.bind(this);
    }
    xhr.open(method, uri, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        let statusCode = xhr.status;
        if (callback) {
          callback(statusCode, xhr);
        }
      }
    };
    xhr.send(payload);
  }

  _sanityCheckConfig() {
    if (
      typeof this.config !== "object" ||
      this.config instanceof Array ||
      !Object.keys(this.config).length
    )
      throw new Error(
        "The argument for the constructor of the " +
          this.constructor.name +
          " class must be a nonempty object"
      );
    // Required params
    if (
      typeof this.config.bucketName !== "string" ||
      !this.config.bucketName.trim().length
    )
      throw new Error("'bucketName' must be a nonempty string");
    if (
      typeof this.config.region !== "string" ||
      !this.config.region.trim().length
    )
      throw new Error("'region' must be a nonempty string");
    if (
      typeof this.config.accessKeyId !== "string" ||
      !this.config.accessKeyId.trim().length
    )
      throw new Error("'accessKeyId' must be a nonempty string");
    if (
      typeof this.config.secretAccessKey !== "string" ||
      !this.config.secretAccessKey.trim().length
    )
      throw new Error("'secretAccessKey' must be a nonempty string");
    // Optional params
    if (
      this.config.baseUrl &&
      (typeof this.config.baseUrl !== "string" ||
        !this.config.baseUrl.trim().length)
    ) {
      throw new Error("If included, 'baseUrl' must be a nonempty string");
    } else
      this.config.baseUrl =
        this.config.baseUrl ||
        "https://" +
          this.config.bucketName +
          ".s3." +
          this.config.region +
          ".amazonaws.com";
    if (
      this.config.parseFileName &&
      typeof this.config.parseFileName !== "boolean"
    ) {
      throw new Error("If included, 'parseFileName' must be a boolean");
    } else
      this.config.parseFileName =
        this.config.parseFileName !== undefined
          ? this.config.parseFileName
          : true;
    if (
      this.config.onUploadProgress &&
      typeof this.config.onUploadProgress !== "function"
    )
      throw new Error(
        "If included, the value for the 'onUploadProgress' key must be a function"
      );
    if (
      this.config.parsingFunction &&
      typeof this.config.parsingFunction !== "function"
    )
      throw new Error(
        "If included, the value for the 'parsingFunction' key must be a function returning a nonempty string"
      );
  }

  _sanityCheckPayload(payload) {
    if (!payload.file) throw new Error("A file must be provided");
    if (
      payload.key &&
      (typeof payload.key !== "string" || !payload.key.trim().length)
    )
      throw new Error(
        "If included, the 'key' argumant must be a nomempty string"
      );
    if (
      payload.dirName &&
      (typeof payload.dirName !== "string" || !payload.dirName.trim().length)
    )
      throw new Error(
        "If included, the 'dirName' argument must be a nonempty string"
      );
  }

  _generatePolicy(isoDate, date, formattedIso) {
    return customBuffer
      .from(
        JSON.stringify({
          expiration: isoDate,
          conditions: [
            { bucket: this.config.bucketName },
            { acl: "public-read" },
            ["starts-with", "$key", ""],
            ["starts-with", "$Content-Type", ""],
            { "x-amz-meta-uuid": "14365123651274" },
            { "x-amz-server-side-encryption": "AES256" },
            ["starts-with", "$x-amz-meta-tag", ""],
            {
              "x-amz-credential": `${this.config.accessKeyId}/${date}/${this.config.region}/s3/aws4_request`,
            },
            { "x-amz-algorithm": "AWS4-HMAC-SHA256" },
            { "x-amz-date": formattedIso },
          ],
        })
      )
      .toString("base64")
      .replace(/[$\n\r]/g, "");
  }

  _generateSignature(date, policy) {
    const dateKey = CryptoES.HmacSHA256(
      date,
      "AWS4" + this.config.secretAccessKey
    );
    const dateRegionKey = CryptoES.HmacSHA256(this.config.region, dateKey);
    const dateRegionServiceKey = CryptoES.HmacSHA256("s3", dateRegionKey);
    const signingKey = CryptoES.HmacSHA256(
      "aws4_request",
      dateRegionServiceKey
    );
    const signature = CryptoES.HmacSHA256(policy, signingKey).toString(
      CryptoES.enc.Hex
    );
    return signature;
  }

  _generateKey(file, key) {
    let newKey, s;
    if (
      this.config.parsingFunction &&
      (typeof (s = this.config.parsingFunction(key)) !== "string" ||
        !s.trim().length)
    )
      throw new Error(
        "The function for the 'parsingFunction' config key must return a nonempty string; received '" +
          key +
          "'; returned '" +
          s +
          "'"
      );
    newKey =
      key && key.includes(".")
        ? (this.config.parseFileName &&
            ((this.config.parsingFunction && s) || helpers.parseKey(key))) ||
          key
        : ((key &&
            this.config.parseFileName &&
            ((this.config.parsingFunction && s) || helpers.parseKey(key))) ||
            key ||
            nanoid()) +
          "." +
          file.type.split("/")[1];
    return newKey;
  }
}

const helpers = {};
helpers.parseKey = function (key) {
  let parsed = key.replace(/[{`}^%\]">[~<|#/=?+:\s]/g, "").replace(/[\\]/g, "");
  if (!parsed.length)
    throw new Error(
      "A 'key' may not be composed of special characters only as some are scaped, which may result in an empty (invalid) key; recieved '" +
        key +
        "'; returned '" +
        parsed +
        "'"
    );
  return parsed;
};

export default S3Client;

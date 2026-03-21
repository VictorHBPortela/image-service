# S3 Storage notes:

- Express doesn't accept multipart/form-data as default, we have to use multer middleware to receive the image buffer and send it to S3

- @aws-sdk/client-s3 -> putObjectCommand, getObjectCommand, deleteObjectCommand (S3 CRUD Operations)

- Files uploaded must have unique names because S3 overwrites files uploaded with existing names -> use 'crypto' or 'bcrypt' to generate unique ID's

- @aws-sdk/s3-request-presigner -> getSignedUrl(client, command, { expiresIn: 3600 }) -> retrieves image's signed URL from S3

- the signed url is saved on the datebase as "imageUrl" and is used to show the image

- use 'sharp' npm package to apply image transformations such as resizing

- Just in case anyone is running into trouble with adding the credentials parameter to the S3Client object, the current version of the AWS SDK (as of writing this) for Node doesn't require it as a parameter anymore. The credentials are automatically read from the .env file, and MUST be named AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.

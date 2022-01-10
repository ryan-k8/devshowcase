module.exports = (permittedfileTypes, maxFileSize, maxFileNumber) => {
  return async (req, res, next) => {
    try {
      const { sentImages: sentImagesMetaData } = JSON.parse(
        req.headers["x-images-metadata"]
      );

      if (sentImagesMetaData.length > maxFileNumber) {
        throw new Error("");
      }

      sentImagesMetaData.forEach((uploadedImg) => {
        if (
          uploadedImg.size > maxFileSize ||
          !permittedfileTypes.includes(uploadedImg.mimeType)
        ) {
          throw new Error("");
        }
      });

      next();
    } catch (err) {
      return res.status(409).json({ message: "conflict with uploading files" });
    }
  };
};

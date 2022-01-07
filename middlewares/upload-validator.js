module.exports = (permittedfileTypes, maxFileSize, maxFileNumber) => {
  return async (req, res, next) => {
    try {
      const imagesMetaData = JSON.parse(req.headers["x-images-metadata"]);

      if (imagesMetaData.length > maxFileNumber) {
        throw new Error("");
      }

      imagesMetaData.forEach((uploadedImg) => {
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

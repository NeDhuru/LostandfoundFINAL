export const errorHandle = (error, fileName, feature, errorMessage) => {
  console.log({
    error: error,
    "File : ": fileName,
    "Feature ": feature,
    "Message ": errorMessage,
  });
};

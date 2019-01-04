// generate random color
const randomRgbaGenerator = alpha => {
  return (
    "rgb(" +
    Math.floor(Math.random() * 255).toString() +
    "," +
    Math.floor(Math.random() * 255).toString() +
    "," +
    Math.floor(Math.random() * 255).toString() +
    "," +
    alpha +
    ")"
  );
};

const randomHexGenerator = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

module.exports = {
    randomRgbaGenerator,
    randomHexGenerator
};

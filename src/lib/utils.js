export const getRandomFloat = (min, max) => (max - min) * Math.random() + min;
export const getRandomInt = (min, max) =>
  Math.floor(getRandomFloat(min, max + 1));
export const getRandomCoordinates = () => ({
  x: getRandomInt(0, window.innerWidth),
  y: getRandomInt(0, window.innerHeight)
});
export const isOutOfBounds = (x, y) => {
  const height = window.innerHeight;
  const width = window.innerWidth;

  return x < 0 || y < 0 || x > width || y > height;
};
export const funcOrVal = subject =>
  typeof subject === "function" ? subject() : subject;

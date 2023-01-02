export const getRandomFloat = (min: number, max: number) =>
  (max - min) * Math.random() + min;

export const getRandomInt = (min: number, max: number) =>
  Math.floor(getRandomFloat(min, max + 1));

export const getRandomCoordinates = () => ({
  x: getRandomInt(0, window.innerWidth),
  y: getRandomInt(0, window.innerHeight),
});

export const isOutOfBounds = (x: number, y: number) => {
  // TODO: do not assume bounds are window
  const height = window.innerHeight;
  const width = window.innerWidth;

  return x < 0 || y < 0 || x > width || y > height;
};

export const funcOrVal = <T>(subject: T) =>
  typeof subject === "function" ? subject() : subject;

export const GRID_SIZE = 75;

export const snapToGrid = (value) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

export const getRotatedSize = (width, height, rotation) => {
    const angle = rotation % 180;

    return angle === 90
        ? {
              width: height,
              height: width,
          }
        : {
              width,
              height,
          };
};

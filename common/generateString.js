const generateString = (length = 7) => {
  return Array.from({ length: Math.ceil(length / 13) })
    .map(() => Math.random().toString(36).substring(2, 15))
    .join("")
    .substring(0, length);
};

module.exports = generateString;

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const isValidObjectId = (value) => objectIdRegex.test(value);

module.exports = { objectIdRegex, isValidObjectId };

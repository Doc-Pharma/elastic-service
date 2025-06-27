const stringifyArg = (arg) => {
  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
};

const logger = {
  info: (...args) => {
    const output = args.map(stringifyArg).join(' ');
    console.log(`Info : ${output}`);
  },

  error: (...args) => {
    const output = args.map(stringifyArg).join(' ');
    console.error(`Error : ${output}`);
  },
};

module.exports = {
  logger,
};

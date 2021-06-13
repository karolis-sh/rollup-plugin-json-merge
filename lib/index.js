const fse = require('fs-extra');
const { promisify } = require('util');
const glob = promisify(require('glob'));

const { name } = require('../package.json');

const getContentChunks = (input) => {
  return Promise.all(
    input
      .filter((item) => item != null)
      .map((item, index) =>
        typeof item === 'string'
          ? glob(item).then((filenames) =>
              Promise.all(filenames.map((filename) => fse.readJSON(filename)))
            )
          : Promise.resolve(index === 0 ? JSON.parse(JSON.stringify(item)) : item)
      )
  ).then((items) => items.flat().filter((item) => typeof item !== 'undefined'));
};

const merge = (items) =>
  items.length ? JSON.stringify(Object.assign(...items), null, 2) : undefined;

module.exports = ({ input = [], fileName = 'output.json' } = {}) => {
  return {
    name,
    async generateBundle() {
      const chunks = await getContentChunks(typeof input === 'string' ? [input] : input);
      const source = merge(chunks);
      if (source != null) {
        await this.emitFile({ type: 'asset', fileName, source });
      }
    },
  };
};

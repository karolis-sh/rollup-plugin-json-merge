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
  ).then((items) => items.flat().filter((item) => item != null));
};

module.exports = ({
  input = [],
  fileName = 'output.json',
  merge = (items) => Object.assign(...items),
} = {}) => {
  return {
    name,
    async generateBundle() {
      const chunks = await getContentChunks(typeof input === 'string' ? [input] : input);
      const merged = chunks.length ? merge(chunks) : undefined;
      if (merged != null) {
        await this.emitFile({ type: 'asset', fileName, source: JSON.stringify(merged, null, 2) });
      }
    },
  };
};

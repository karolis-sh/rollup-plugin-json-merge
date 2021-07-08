const path = require('path');
const { rollup } = require('rollup');

const mergePlugin = require('../lib');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

async function build({ input, merge }) {
  const fileName = 'test.json';
  const bundle = await rollup({
    input: path.join(FIXTURES_DIR, 'index.js'),
    plugins: [mergePlugin({ fileName, input, merge })],
  });
  const { output } = await bundle.generate({});
  return output.find((item) => item.fileName === fileName);
}

const format = (value) => JSON.stringify(value, null, 2);

it('should handle no sources', async () => {
  const output = await build({
    input: [],
  });

  expect(output).toBeUndefined();
});

it('should handle null source', async () => {
  const output = await build({
    input: [path.join(FIXTURES_DIR, 'null.json')],
  });

  expect(output).toBeUndefined();
});

it('should handle multiple sources', async () => {
  const output = await build({
    input: [
      { name: 'Karolis' },
      { surname: 'Šarapnickis' },
      path.join(FIXTURES_DIR, 'manifest-{a,b}.json'),
    ],
  });

  expect(output.source).toEqual(
    format({
      name: 'Go B',
      surname: 'Šarapnickis',
      version: '1.0.0',
      description: 'Lets merge stuff!',
    })
  );
});

it('should use custom merger', async () => {
  const output = await build({
    input: [
      { name: 'Karolis' },
      { surname: 'Šarapnickis' },
      path.join(FIXTURES_DIR, 'manifest-{a,b}.json'),
    ],
    merge: (items) => items,
  });

  expect(output.source).toEqual(
    format([
      { name: 'Karolis' },
      { surname: 'Šarapnickis' },
      {
        name: 'Go A',
        version: '1.0.0',
      },
      {
        name: 'Go B',
        description: 'Lets merge stuff!',
      },
    ])
  );
});

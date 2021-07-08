const path = require('path');
const { rollup } = require('rollup');

const merge = require('../lib');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

async function build({ input }) {
  const fileName = 'test.json';
  const bundle = await rollup({
    input: path.join(FIXTURES_DIR, 'index.js'),
    plugins: [merge({ input, fileName })],
  });
  const { output } = await bundle.generate({});
  return output.find((item) => item.fileName === fileName);
}

it('should handle multiple sources', async () => {
  const output = await build({
    input: [
      { name: 'Karolis' },
      { surname: 'Šarapnickis' },
      path.join(FIXTURES_DIR, 'manifest-{a,b}.json'),
    ],
  });

  expect(output.source).toEqual(
    JSON.stringify(
      {
        name: 'Go B',
        surname: 'Šarapnickis',
        version: '1.0.0',
        description: 'Lets merge stuff!',
      },
      null,
      2
    )
  );
});

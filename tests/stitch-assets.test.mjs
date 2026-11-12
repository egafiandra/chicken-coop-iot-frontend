import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const assets = [
  '../src/assets/stitch/coop-home.jpg',
  '../src/assets/stitch/coop-controls.jpg',
  '../src/assets/stitch/coop-camera.jpg',
];

test('selected Stitch photos are bundled locally as JPEG assets', async () => {
  for (const assetPath of assets) {
    const image = await readFile(new URL(assetPath, import.meta.url));
    assert.ok(image.length > 20_000, `${assetPath} should contain the downloaded photo`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff], `${assetPath} should be JPEG`);
  }
});

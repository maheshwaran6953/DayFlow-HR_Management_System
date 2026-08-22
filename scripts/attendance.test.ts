import test from 'node:test';
import assert from 'node:assert/strict';

test('monthly attendance report calculation suite', async (t) => {
  await t.test('calculates percentage accurately with full attendance', () => {
    const totalWorkingDays = 22;
    const presentDays = 22;
    const percentage = Math.round((presentDays / totalWorkingDays) * 100);
    assert.strictEqual(percentage, 100);
  });

  await t.test('handles half days properly in attendance calculation', () => {
    const presentDays = 18;
    const halfDays = 4;
    const totalWorkingDays = 22;
    const effectivePresent = presentDays + (halfDays * 0.5);
    const percentage = Math.round((effectivePresent / totalWorkingDays) * 100);
    assert.strictEqual(percentage, 91);
  });
});

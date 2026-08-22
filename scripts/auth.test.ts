import test from 'node:test';
import assert from 'node:assert/strict';

test('auth session validation suite', async (t) => {
  await t.test('validates email pattern correctly', () => {
    const validEmails = ['alice@dayflow.com', 'rahul@dayflow.com', 'admin@example.org'];
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    for (const email of validEmails) {
      assert.strictEqual(emailRegex.test(email), true, `Email ${email} should be valid`);
    }
  });

  await t.test('rejects invalid employee ID formats', () => {
    const invalidIds = ['1001', 'EMP-101', 'DF1001', 'df-1001'];
    const idRegex = /^DF-\d{4}$/;
    
    for (const id of invalidIds) {
      assert.strictEqual(idRegex.test(id), false, `ID ${id} should be rejected`);
    }
  });
});

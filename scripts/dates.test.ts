import test from "node:test";
import assert from "node:assert/strict";
import { startOfDay, startOfWeek, endOfDay } from "../src/lib/dates";

test("startOfDay resets time component to 00:00:00.000", () => {
  const d = new Date(2026, 7, 22, 14, 30, 45, 123);
  const res = startOfDay(d);
  assert.equal(res.getHours(), 0);
  assert.equal(res.getMinutes(), 0);
  assert.equal(res.getSeconds(), 0);
  assert.equal(res.getMilliseconds(), 0);
  assert.equal(res.getFullYear(), 2026);
  assert.equal(res.getMonth(), 7);
  assert.equal(res.getDate(), 22);
});

test("endOfDay sets time component to 23:59:59.999 while keeping date", () => {
  const d = new Date(2026, 7, 22, 10, 15, 0, 0);
  const res = endOfDay(d);
  assert.equal(res.getHours(), 23);
  assert.equal(res.getMinutes(), 59);
  assert.equal(res.getSeconds(), 59);
  assert.equal(res.getMilliseconds(), 999);
  assert.equal(res.getFullYear(), 2026);
  assert.equal(res.getMonth(), 7);
  assert.equal(res.getDate(), 22);
});

test("startOfWeek computes Monday start for Monday, Wednesday, Saturday, and Sunday", () => {
  // Monday: 2026-08-17
  const monday = new Date(2026, 7, 17, 12, 0, 0);
  assert.equal(monday.getDay(), 1);
  const resMon = startOfWeek(monday);
  assert.equal(resMon.getDate(), 17);
  assert.equal(resMon.getDay(), 1);

  // Wednesday: 2026-08-19
  const wednesday = new Date(2026, 7, 19, 15, 30, 0);
  assert.equal(wednesday.getDay(), 3);
  const resWed = startOfWeek(wednesday);
  assert.equal(resWed.getDate(), 17);
  assert.equal(resWed.getDay(), 1);

  // Saturday: 2026-08-22
  const saturday = new Date(2026, 7, 22, 20, 0, 0);
  assert.equal(saturday.getDay(), 6);
  const resSat = startOfWeek(saturday);
  assert.equal(resSat.getDate(), 17);
  assert.equal(resSat.getDay(), 1);

  // Sunday: 2026-08-23
  const sunday = new Date(2026, 7, 23, 18, 0, 0);
  assert.equal(sunday.getDay(), 0);
  const resSun = startOfWeek(sunday);
  assert.equal(resSun.getDate(), 17);
  assert.equal(resSun.getDay(), 1);
});

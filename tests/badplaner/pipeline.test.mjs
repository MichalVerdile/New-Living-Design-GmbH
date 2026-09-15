import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// No test can accidentally reach a real provider, even through the default export.
globalThis.fetch = async () => { throw new Error('External network is forbidden in tests'); };
const moduleUrl = (name) => pathToFileURL(path.join(process.env.BADPLANER_TEST_BUILD, name));
const { createHandler } = await import(moduleUrl('api/badplaner.js'));
const { optionsForPackage } = await import(moduleUrl('src/data/badplaner.js'));
const { Budget, TimeoutError } = await import(moduleUrl('server/badplaner/budget.js'));
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jX1EAAAAASUVORK5CYII=';

function payload(changes = {}) {
  const options = optionsForPackage('essenza');
  return {
    kind: 'render', raum: 'badezimmer', paket: 'essenza', format: options.formats[0],
    platte: options.tiles[0].id, unterbau: options.bases[0].id, top: options.tops[0].id,
    becken: options.basinTypes[0].id, finish: '', keramik: options.sanitary[0].id,
    wall: options.walls[0].id, dusche: options.showers[0].id, badewanne: options.bathtubs[0].id, waschtisch: options.basins[0].id,
    spiegel: options.mirrors[0].id, windows: '0', cistern: 'unterputz', foto: `data:image/png;base64,${PNG}`,
    name: 'Fixture Person', email: 'fixture@example.invalid', telefon: '+41 00 000 00 00', place: '4800 Zofingen', consent: true,
    ...changes,
  };
}

function fakeClock() {
  let time = Date.parse('2026-09-13T12:00:00Z');
  let sequence = 0;
  const timers = new Map();
  return {
    now: () => time,
    setTimeout(callback, delay) { const id = ++sequence; timers.set(id, { at: time + delay, callback }); return id; },
    clearTimeout(id) { timers.delete(id); },
    advance(ms) {
      const target = time + ms;
      for (;;) {
        const first = [...timers.entries()].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
        if (!first) break;
        timers.delete(first[0]); time = first[1].at; first[1].callback();
      }
      time = target;
    },
    timers,
  };
}

const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const generated = (data = PNG, mimeType = 'image/png') => response({ candidates: [{ content: { parts: [{ inlineData: { mimeType, data } }] }, finishReason: 'STOP' }] });
const checked = (extra = false, text) => response({ candidates: [{ content: { parts: [{ text: text ?? JSON.stringify({ extra_openings: extra, toilet_moved: false, layout_changed: false, view_changed: false, shower_present: false, bathtub_present: false, reason: 'fixture comparison' }) }] }, finishReason: 'STOP' }] });

function harness(settings = {}) {
  const clock = fakeClock();
  const calls = [];
  let generation = 0; let checks = 0; let mail = 0; let ids = 0;
  const fetch = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ url, init, body });
    assert.equal(init.redirect, 'error', 'provider redirects must not bypass URL policy');
    assert.ok(init.signal instanceof AbortSignal);
    if (url.includes('generativelanguage.googleapis.com')) {
      if (body.generationConfig.responseModalities) {
        generation += 1;
        clock.advance(settings.generateDelays?.[generation - 1] ?? 0);
        return settings.generations?.[generation - 1]?.(init) ?? generated();
      }
      checks += 1;
      clock.advance(settings.checkDelays?.[checks - 1] ?? 0);
      return settings.checks?.[checks - 1]?.(init) ?? checked();
    }
    if (url === 'https://api.resend.com/emails') {
      mail += 1;
      clock.advance(settings.mailDelays?.[mail - 1] ?? 0);
      return settings.mails?.[mail - 1]?.(init) ?? response({ id: `mail-${mail}` });
    }
    if (url.startsWith('https://formspree.io/')) {
      clock.advance(settings.formspreeDelay ?? 0);
      return settings.formspree?.(init) ?? response({ ok: true });
    }
    if (url.includes('/audiences/')) return settings.newsletter?.(init) ?? response({ id: 'contact-fixture' });
    if (url.startsWith('https://newlivingdesign.ch/badplaner/swatches/') || url.startsWith('https://www.energieker.it/')) {
      clock.advance(settings.swatchDelay ?? 0);
      return settings.swatch?.(init) ?? response({}, 404);
    }
    throw new Error(`Unexpected mock URL: ${url}`);
  };
  const handler = createHandler({ fetch, clock, sleep: async (milliseconds) => { clock.advance(milliseconds); }, env: { GEMINI_API_KEY: 'fake-not-a-key', RESEND_API_KEY: 'fake-not-a-key', ...settings.env }, newId: () => `bp-fixture-${++ids}` });
  async function invoke(body = payload(), request = {}) {
    const res = { headers: {}, statusCode: 200, body: null,
      setHeader(name, value) { this.headers[name] = value; },
      status(code) { this.statusCode = code; return this; },
      json(value) { this.body = value; return this; },
    };
    await handler({ method: 'POST', headers: {}, body, ...request }, res);
    assert.equal(clock.timers.size, 0, 'all timeout handles must be cleared');
    return res;
  }
  return { invoke, clock, calls, counts: () => ({ generation, checks, mail }) };
}

test('approved rendering reaches company and customer, reporting provider acceptance', async () => {
  const h = harness(); const res = await h.invoke();
  assert.equal(res.statusCode, 200); assert.equal(res.body.ok, true);
  assert.equal(res.body.image.data, PNG); assert.equal(res.body.delivery.lead, 'accepted');
  assert.equal(res.body.delivery.customer, 'accepted'); assert.equal(res.body.delivery.newsletter, 'skipped');
  assert.deepEqual(h.counts(), { generation: 1, checks: 1, mail: 2 });
  assert.match(res.headers['Set-Cookie'], /HttpOnly; Secure; SameSite=Lax/);
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.equal('lead_saved' in res.body, false);
  const leadMail = h.calls.find((call) => call.url === 'https://api.resend.com/emails');
  assert.match(JSON.stringify(leadMail.body), /Muster/);
  assert.match(JSON.stringify(leadMail.body), /nicht geladen/);
});

test('cistern is required and only accepts the two supported values', async () => {
  for (const cistern of [undefined, '', 'sichtbar', 'unknown']) {
    const h = harness(); const res = await h.invoke(payload({ cistern }));
    assert.equal(res.statusCode, 400); assert.equal(res.body.field, 'cistern');
    assert.deepEqual(h.counts(), { generation: 0, checks: 0, mail: 0 });
  }
});

test('Aufputz and Unterputz produce explicit, exclusive toilet branches', async () => {
  for (const cistern of ['aufputz', 'unterputz']) {
    const h = harness(); const res = await h.invoke(payload({ cistern }));
    assert.equal(res.statusCode, 200);
    const generation = h.calls.find((call) => call.body?.generationConfig?.responseModalities);
    const prompt = generation.body.contents[0].parts[0].text;
    const checker = h.calls.find((call) => call.url.includes('generativelanguage.googleapis.com') && !call.body?.generationConfig?.responseModalities);
    const checkPrompt = checker.body.contents[0].parts[0].text;
    if (cistern === 'aufputz') {
      assert.match(prompt, /slim sanitary module stands in front of the existing wall/);
      assert.match(prompt, /wall behind is neither moved nor opened/);
      assert.match(checkPrompt, /must NOT be reported as layout_changed/);
    } else {
      assert.match(prompt, /cistern is concealed inside the wall and stays concealed/);
      assert.match(prompt, /no visible cistern and no sanitary module/);
      assert.doesNotMatch(checkPrompt, /must NOT be reported as layout_changed/);
    }
  }
});

test('Colore uses the selected tap series and finish in prompt and lead mail', async () => {
  const options = optionsForPackage('colore');
  const h = harness();
  const res = await h.invoke(payload({
    paket: 'colore', format: options.formats[0], platte: options.tiles[0].id,
    unterbau: options.bases[0].id, top: options.tops[0].id, becken: options.basinTypes[0].id,
    armaturenserie: 'treemme-ran', finish: 'treemme-nero-opaco', keramik: options.sanitary[0].id,
    wall: options.walls[0].id, dusche: options.showers[0].id, badewanne: options.bathtubs[0].id,
    waschtisch: options.basins[0].id, spiegel: options.mirrors[0].id,
  }));
  assert.equal(res.statusCode, 200);
  const generation = h.calls.find((call) => call.body?.generationConfig?.responseModalities);
  assert.match(generation.body.contents[0].parts[0].text, /Treemme Ran tap in matte black/);
  const lead = JSON.stringify(h.calls.find((call) => call.url === 'https://api.resend.com/emails')?.body);
  assert.match(lead, /Treemme Ran, Nero Opaco/);
  assert.doesNotMatch(lead, /Armaturenserie/);
});

test('Gäste-WC prompt and checker require no shower or bathtub', async () => {
  const h = harness();
  const res = await h.invoke(payload({ raum: 'gaeste-wc', dusche: '', badewanne: '', waschtisch: 'einzel' }));
  assert.equal(res.statusCode, 200);
  const generation = h.calls.find((call) => call.body?.generationConfig?.responseModalities);
  const checker = h.calls.find((call) => call.body?.generationConfig?.responseMimeType);
  assert.match(generation.body.contents[0].parts[0].text, /guest WC: the result must contain NO shower/);
  assert.match(checker.body.contents[0].parts[0].text, /guest WC.*shower_present=false.*bathtub_present=false/);
});

test('shower prompt tiles the full tray or sloped-floor perimeter to the ceiling', async () => {
  const approved = JSON.stringify({ extra_openings: false, toilet_moved: false, layout_changed: false, view_changed: false, shower_present: true, bathtub_present: false, reason: 'fixture comparison' });
  const h = harness({ checks: [() => checked(false, approved)] });
  const res = await h.invoke(payload({ dusche: 'walk-in', badewanne: 'keine', wall: 'halbhoch' }));
  assert.equal(res.statusCode, 200);
  const generation = h.calls.find((call) => call.body?.generationConfig?.responseModalities);
  assert.match(generation.body.contents[0].parts[0].text, /entire perimeter of the shower tray or sloped tiled shower floor/);
  assert.match(generation.body.contents[0].parts[0].text, /every wall around the entire shower-floor perimeter is tiled continuously to the ceiling/);
});

test('fixture checker rejects a shower in a Gäste-WC', async () => {
  const wrong = JSON.stringify({ extra_openings: false, toilet_moved: false, layout_changed: false, view_changed: false, shower_present: true, bathtub_present: false, reason: 'unexpected shower' });
  const h = harness({ checks: [() => checked(false, wrong), () => checked(false, wrong)] });
  const res = await h.invoke(payload({ raum: 'gaeste-wc', dusche: '', badewanne: '', waschtisch: 'einzel' }));
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.code, 'RENDER_REJECTED');
  assert.equal(res.body.delivery.lead, 'accepted');
  assert.equal(h.counts().mail, 1);
  const leadMail = h.calls.find((call) => call.url === 'https://api.resend.com/emails');
  assert.match(leadMail.body.subject, /Ideenbild abgelehnt/);
  assert.match(JSON.stringify(leadMail.body), /unexpected shower/);
  assert.deepEqual(leadMail.body.attachments.map(({ filename }) => filename), ['foto.png']);
});

test('rejected renders consume the device cookie and IP quota', async () => {
  const wrong = JSON.stringify({ extra_openings: true, toilet_moved: false, layout_changed: false, view_changed: false, shower_present: false, bathtub_present: false, reason: 'invented window' });
  const h = harness({ checks: Array.from({ length: 12 }, () => () => checked(false, wrong)) });
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const res = await h.invoke();
    assert.equal(res.statusCode, 502);
    assert.match(res.headers['Set-Cookie'], /nldbp=1:2026-09-13/);
  }
  const blocked = await h.invoke();
  assert.equal(blocked.statusCode, 429);
  assert.deepEqual(h.counts(), { generation: 12, checks: 12, mail: 6 });
});

test('checker rejects a changed camera or expanded field of view', async () => {
  const changedView = JSON.stringify({ extra_openings: false, toilet_moved: false, layout_changed: false, view_changed: true, shower_present: false, bathtub_present: false, reason: 'camera and visible room bounds changed' });
  const h = harness({ checks: [() => checked(false, changedView), () => checked(false, changedView)] });
  const res = await h.invoke(payload({ dusche: 'keine', badewanne: 'keine' }));
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.code, 'RENDER_REJECTED');
  assert.deepEqual(h.counts(), { generation: 2, checks: 2, mail: 1 });
});

test('individual consultation sends one lead and never calls Gemini', async () => {
  const h = harness();
  const res = await h.invoke({ kind: 'beratung', raum: 'gaeste-wc', priorities: 'Mehr Stauraum und pflegeleichte Flächen', name: 'Fixture Person', email: 'fixture@example.invalid', telefon: '+41 00 000 00 00', consent: true });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(h.counts(), { generation: 0, checks: 0, mail: 1 });
});

test('consultation image request requires a room photo before provider calls', async () => {
  const h = harness();
  const res = await h.invoke({ kind: 'beratung', raum: 'badezimmer', priorities: 'Neue Aufteilung', imageWanted: true, name: 'Fixture Person', email: 'fixture@example.invalid', telefon: '+41 00 000 00 00', consent: true });
  assert.equal(res.statusCode, 400);
  assert.equal(h.calls.length, 0);
});

for (const [name, change] of Object.entries({
  'missing option': { top: undefined }, 'unknown option': { platte: 'unknown' },
  'missing windows': { windows: '' }, 'missing consent': { consent: false },
  'missing name': { name: '' }, 'missing place': { place: '' }, 'invalid email': { email: 'not-an-email' },
  'invalid base64': { foto: 'data:image/png;base64,AAAA===A' },
  'false MIME': { foto: `data:image/jpeg;base64,${PNG}` },
})) test(`${name} returns 400 before any provider call`, async () => {
  const h = harness(); const res = await h.invoke(payload(change));
  assert.equal(res.statusCode, 400); assert.equal(res.body.ok, false); assert.equal(h.calls.length, 0);
});

test('HTTP and JSON envelope reject malformed requests without network', async () => {
  const h = harness();
  assert.equal((await h.invoke(null, { method: 'GET' })).statusCode, 405);
  for (const body of [null, [], 'broken-json', 7, {}]) assert.equal((await h.invoke(body)).statusCode, 400);
  assert.equal(h.calls.length, 0);
});

test('oversize JSON is rejected before provider calls', async () => {
  const h = harness(); const res = await h.invoke({ ...payload(), note: 'x'.repeat(4 * 1024 * 1024) });
  assert.equal(res.statusCode, 413); assert.equal(h.calls.length, 0);
});

test('second rejected result is never returned, while the lead and original photo are preserved', async () => {
  const h = harness({ checks: [() => checked(true), () => checked(true)] });
  const res = await h.invoke();
  assert.equal(res.body.code, 'RENDER_REJECTED'); assert.equal(res.statusCode, 502);
  assert.equal(res.body.image, undefined); assert.deepEqual(h.counts(), { generation: 2, checks: 2, mail: 1 });
  const leadMail = h.calls.find((call) => call.url === 'https://api.resend.com/emails');
  assert.match(JSON.stringify(leadMail.body), /Ideenbild.*abgelehnt \(Prüfung\), nicht angezeigt/);
  assert.match(JSON.stringify(leadMail.body), /Muster/);
  assert.equal(leadMail.body.attachments.length, 1);
  assert.equal(leadMail.body.attachments[0].filename, 'foto.png');
});

test('second approved result replaces first rejected result', async () => {
  const h = harness({ checks: [() => checked(true), () => checked()] });
  const res = await h.invoke();
  assert.equal(res.statusCode, 200); assert.deepEqual(h.counts(), { generation: 2, checks: 2, mail: 2 });
  const retry = h.calls.filter((call) => call.body?.generationConfig?.responseModalities)[1];
  assert.match(retry.body.contents[0].parts[0].text, /failed the structural and fixture check/);
});

test('second generation failure after rejection still fails closed', async () => {
  const h = harness({ checks: [() => checked(true)], generations: [() => generated(), () => response({}, 500)] });
  const res = await h.invoke();
  assert.equal(res.statusCode, 502); assert.equal(res.body.image, undefined); assert.equal(h.counts().mail, 0);
});

for (const answer of ['not json', '```json\n{"extra_openings":false,"reason":"x"}\n```', '{"extra_openings":"false","reason":"x"}', '{"extra_openings":false}', '{"extra_openings":false,"reason":""}', '{"extra_openings":false,"reason":"x","uncertain":true}', 'null', '[]']) {
  test(`checker retries and delivers malformed result for ${answer.slice(0, 28)}`, async () => {
    const h = harness({ checks: [() => checked(false, answer), () => checked(false, answer)] }); const res = await h.invoke();
    assert.equal(res.statusCode, 200); assert.equal(res.body.image.data, PNG); assert.equal(h.counts().mail, 2);
  });
}

test('checker result without a completed STOP response is retried and delivered with warning', async () => {
  for (const finishReason of [undefined, 'MAX_TOKENS', 'SAFETY']) {
    const unavailable = () => response({ candidates: [{ finishReason, content: { parts: [{ text: '{"extra_openings":false,"reason":"fixture"}' }] } }] });
    const h = harness({ checks: [unavailable, unavailable] });
    const res = await h.invoke(); assert.equal(res.statusCode, 200); assert.equal(h.counts().mail, 2);
  }
});

test('disabled checker delivers and reports it in the lead mail', async () => {
  for (const value of ['', '  ']) {
    const h = harness({ env: { BADPLANER_CHECK_MODEL: value } }); const res = await h.invoke();
    assert.equal(res.statusCode, 200); assert.deepEqual(h.counts(), { generation: 1, checks: 0, mail: 2 });
    assert.match(JSON.stringify(h.calls.find((call) => call.url === 'https://api.resend.com/emails')?.body), /Fensterprüfung.*deaktiviert/);
  }
});

test('missing generation key still fails before rendering', async () => {
  const h = harness({ env: { GEMINI_API_KEY: '' } }); assert.equal((await h.invoke()).statusCode, 503); assert.equal(h.calls.length, 0);
});

test('unavailable checker retries once, delivers the lead and marks the mail', async () => {
  const h = harness({ checks: [() => response({}, 503), () => response({}, 503)] }); const res = await h.invoke();
  assert.equal(res.statusCode, 200); assert.equal(res.body.image.data, PNG);
  assert.deepEqual(h.counts(), { generation: 1, checks: 2, mail: 2 });
  assert.match(JSON.stringify(h.calls.find((call) => call.url === 'https://api.resend.com/emails')?.body), /Fensterprüfung.*nicht möglich \(Prüfdienst nicht erreichbar\)/);
});

test('generation timeout and invalid generated image fail without checker/mail', async () => {
  for (const settings of [{ generateDelays: [50001] }, { generations: [() => generated('AAAA')] }, { generations: [() => generated(PNG, 'image/svg+xml')] }]) {
    const h = harness(settings); const res = await h.invoke();
    assert.equal(res.statusCode, 502); assert.deepEqual(h.counts(), { generation: 1, checks: 0, mail: 0 });
  }
});

test('failed render attempts do not consume the IP counter', async () => {
  const failures = Array.from({ length: 6 }, () => () => response({}, 500));
  const h = harness({ generations: failures });
  for (let index = 0; index < failures.length; index += 1) assert.equal((await h.invoke()).statusCode, 502);
  assert.equal((await h.invoke()).statusCode, 200);
});

test('retry is skipped when full render, check and delivery reserve cannot fit', async () => {
  const h = harness({ generateDelays: [30000], checks: [() => checked(true)] }); const res = await h.invoke();
  assert.equal(res.body.code, 'RENDER_REJECTED'); assert.deepEqual(h.counts(), { generation: 1, checks: 1, mail: 1 });
});

test('company mail fallback success is explicit and reports missing attachments', async () => {
  const h = harness({ mails: [() => response({}, 500)] }); const res = await h.invoke();
  assert.equal(res.statusCode, 200); assert.equal(res.body.delivery.leadProvider, 'formspree');
  assert.equal(res.body.delivery.leadAttachments, false);
});

test('both company channels reject: no success or customer email', async () => {
  const h = harness({ mails: [() => response({}, 500)], formspree: () => response({}, 500) }); const res = await h.invoke();
  assert.equal(res.statusCode, 502); assert.equal(res.body.code, 'LEAD_DELIVERY_FAILED');
  assert.equal(res.body.image, undefined); assert.equal(h.counts().mail, 1);
});

test('ambiguous company timeout is unknown and is not automatically duplicated', async () => {
  const h = harness({ mailDelays: [8001] }); const res = await h.invoke();
  assert.equal(res.statusCode, 502); assert.equal(res.body.delivery.lead, 'unknown');
  assert.equal(h.calls.some((call) => call.url.includes('formspree')), false);
});

for (const [expected, settings] of [
  ['failed', { mails: [() => response({ id: 'lead-ok' }), () => response({}, 500)] }],
  ['unknown', { mailDelays: [0, 6001] }],
  ['skipped', { env: { RESEND_API_KEY: '' } }],
]) test(`customer email ${expected} preserves approved image and honest status`, async () => {
  const h = harness(settings); const res = await h.invoke();
  assert.equal(res.statusCode, 200); assert.equal(res.body.delivery.customer, expected); assert.equal(res.body.image.data, PNG);
});

test('newsletter failures are surfaced separately and never silently marked subscribed', async () => {
  const h = harness({ env: { RESEND_AUDIENCE_ID: 'fixture-audience' }, newsletter: () => response({}, 500) });
  const res = await h.invoke(payload({ newsletter: true }));
  assert.equal(res.statusCode, 200); assert.equal(res.body.delivery.newsletter, 'failed');
});

test('host header injection cannot select a swatch origin', async () => {
  const h = harness(); await h.invoke(payload(), { headers: { host: 'evil.example.invalid', 'x-forwarded-host': '127.0.0.1' } });
  assert.ok(h.calls[0].url.startsWith('https://newlivingdesign.ch/badplaner/swatches/'));
  assert.ok(h.calls.every((call) => !call.url.includes('evil.example') && !call.url.includes('127.0.0.1')));
});

test('malformed cookie remains recoverable and device limit performs zero requests', async () => {
  const h = harness(); assert.equal((await h.invoke(payload(), { headers: { cookie: 'nldbp=%E0%A4%A' } })).statusCode, 200);
  const limited = harness(); const res = await limited.invoke(payload(), { headers: { cookie: 'nldbp=3:2026-09-13' } });
  assert.equal(res.statusCode, 429); assert.equal(limited.calls.length, 0);
});

test('floorplan failure does not falsely confirm receipt', async () => {
  const h = harness({ mails: [() => response({}, 500)], formspree: () => response({}, 500) });
  const res = await h.invoke({ kind: 'grundriss', leadId: 'bp-fixture', name: 'Fixture', phone: '12345678', note: 'fixture' });
  assert.equal(res.statusCode, 502); assert.equal(res.body.ok, false);
});

test('floorplan PDF signature and base64 are validated before sending', async () => {
  const h = harness(); const res = await h.invoke({ kind: 'grundriss', name: 'Fixture', phone: '12345678', file: { mime: 'application/pdf', data: PNG } });
  assert.equal(res.statusCode, 400); assert.equal(h.calls.length, 0);
});

test('floorplan attachment lost in fallback is not confirmed as delivered', async () => {
  const h = harness({ env: { RESEND_API_KEY: '' } });
  const res = await h.invoke({ kind: 'grundriss', name: 'Fixture', phone: '12345678', file: { mime: 'image/png', data: PNG } });
  assert.equal(res.statusCode, 502); assert.equal(res.body.code, 'ATTACHMENT_NOT_DELIVERED');
  assert.equal(res.body.delivery.leadAttachments, false);
});

test('malformed 2xx lead/customer/newsletter responses are unknown, not accepted', async () => {
  for (const json of [{}, { id: '' }, { id: 42 }]) {
    const lead = harness({ mails: [() => response(json)] });
    assert.equal((await lead.invoke()).body.delivery.lead, 'unknown');
    const customer = harness({ mails: [() => response({ id: 'lead-ok' }), () => response(json)] });
    assert.equal((await customer.invoke()).body.delivery.customer, 'unknown');
    const newsletter = harness({ env: { RESEND_AUDIENCE_ID: 'fixture' }, newsletter: () => response(json) });
    assert.equal((await newsletter.invoke(payload({ newsletter: true }))).body.delivery.newsletter, 'unknown');
  }
});

test('current large catalog originals below 5 MiB retain their visual reference', async () => {
  const bytes = Buffer.alloc(4_686_310); Buffer.from(PNG, 'base64').copy(bytes);
  const h = harness({ swatch: () => new Response(bytes, { headers: { 'content-type': 'image/png' } }) });
  const res = await h.invoke(); assert.equal(res.statusCode, 200);
  const generation = h.calls.find((call) => call.body?.generationConfig?.responseModalities);
  assert.equal(generation.body.contents[0].parts.length, 3);
  assert.equal(Buffer.from(generation.body.contents[0].parts[2].inlineData.data, 'base64').length, bytes.length);
  const leadMail = h.calls.find((call) => call.url === 'https://api.resend.com/emails');
  assert.match(JSON.stringify(leadMail.body), /Muster/);
  assert.match(JSON.stringify(leadMail.body), /geladen/);
});

test('generated response headers and streaming bytes respect the provider cap', async () => {
  for (const large of [
    () => new Response('{}', { headers: { 'content-length': String(7 * 1024 * 1024) } }),
    () => new Response(new Uint8Array(6 * 1024 * 1024 + 1)),
  ]) {
    const h = harness({ generations: [large] }); const res = await h.invoke();
    assert.equal(res.statusCode, 502); assert.equal(h.counts().checks, 0); assert.equal(h.counts().mail, 0);
  }
});

test('full slow pipeline including fallback stays within the overall deadline', async () => {
  const h = harness({ swatchDelay: 4000, generateDelays: [49000], checkDelays: [19000],
    mailDelays: [7000, 5000], mails: [() => response({}, 500)], formspreeDelay: 7000 });
  const start = h.clock.now(); const res = await h.invoke();
  assert.equal(res.statusCode, 200); assert.equal(res.body.delivery.leadProvider, 'formspree');
  assert.equal(h.clock.now() - start, 95000); assert.ok(h.clock.now() - start < 105000);
});

test('exhausted deadline starts no further external call', async () => {
  const clock = fakeClock(); const budget = new Budget(clock, 105000); let calls = 0;
  clock.advance(105000);
  await assert.rejects(budget.run(8000, async () => { calls += 1; }), TimeoutError);
  assert.equal(calls, 0); assert.equal(clock.timers.size, 0);
});

test('identical API requests are explicitly not claimed durably idempotent', async () => {
  const h = harness(); const first = await h.invoke(); const second = await h.invoke();
  assert.notEqual(first.body.leadId, second.body.leadId);
  assert.equal(h.counts().generation, 2); // UI blocks double clicks; persistence is a separate decision.
});

test('deadline also bounds an adapter ignoring abort and clears all timers', async () => {
  const clock = fakeClock(); const budget = new Budget(clock, 105000);
  let signal;
  const work = budget.run(50000, async (value) => { signal = value; return new Promise(() => {}); });
  clock.advance(50000);
  await assert.rejects(work, TimeoutError); assert.equal(signal.aborted, true); assert.equal(clock.timers.size, 0);
  clock.advance(50000);
  const last = budget.run(20000, async () => new Promise(() => {}));
  clock.advance(5000); await assert.rejects(last, TimeoutError); assert.equal(budget.remaining(), 0);
});

test('slow response body is timed out, not only response headers', async () => {
  let cancelCalled = false;
  const h = harness({ generations: [() => new Response(new ReadableStream({ cancel() { cancelCalled = true; } }), { headers: { 'content-type': 'application/json' } })] });
  const pending = h.invoke();
  for (let i = 0; i < 30 && h.counts().generation === 0; i += 1) await Promise.resolve();
  h.clock.advance(50000);
  const res = await pending;
  assert.equal(res.statusCode, 502); assert.equal(cancelCalled, true); assert.equal(h.counts().mail, 0);
});

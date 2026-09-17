import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// No test can accidentally reach a real provider, even through the default export.
globalThis.fetch = async () => { throw new Error('External network is forbidden in tests'); };
const moduleUrl = (name) => pathToFileURL(path.join(process.env.BADPLANER_TEST_BUILD, name));
const { createHandler, nearestAspectRatio } = await import(moduleUrl('api/badplaner.js'));
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
const photoChecked = (isBathroom = true, text) => response({ candidates: [{ content: { parts: [{ text: text ?? JSON.stringify({ is_bathroom: isBathroom, reason: 'toilet and washbasin visible' }) }] }, finishReason: 'STOP' }] });
const inv = (changes = {}) => ({ toilet: 'left', washbasin: 'left', shower: 'none', bathtub: 'none', bidet: 'none', ...changes });
// Die Pruefung liefert ein Inventar; geurteilt wird im Code. `checked()` ist der
// unauffaellige Fall: alles steht nachher, wo es vorher stand.
const checked = (extra = false, text) => response({ candidates: [{ content: { parts: [{ text: text ?? JSON.stringify({ before: inv(), after: inv(), extra_openings: extra, view_changed: false, reason: 'inventory' }) }] }, finishReason: 'STOP' }] });
const checkedInv = (before, after, extra = {}) => response({ candidates: [{ content: { parts: [{ text: JSON.stringify({ before: inv(before), after: inv(after), extra_openings: false, view_changed: false, reason: 'inventory', ...extra }) }] }, finishReason: 'STOP' }] });

function harness(settings = {}) {
  const clock = fakeClock();
  const calls = [];
  let generation = 0; let checks = 0; let photoChecks = 0; let mail = 0; let ids = 0;
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
      if ((body.contents?.[0]?.parts || []).filter((part) => part.inlineData).length === 1) {
        photoChecks += 1;
        clock.advance(settings.photoCheckDelays?.[photoChecks - 1] ?? 0);
        return settings.photoChecks?.[photoChecks - 1]?.(init) ?? photoChecked();
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
  return { invoke, clock, calls, counts: () => ({ generation, checks, mail }), photoCount: () => photoChecks };
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
    const checker = h.calls.find((call) => call.url.includes('generativelanguage.googleapis.com') && !call.body?.generationConfig?.responseModalities
      && call.body.contents[0].parts.filter((part) => part.inlineData).length === 2);
    const checkPrompt = checker.body.contents[0].parts[0].text;
    if (cistern === 'aufputz') {
      assert.match(prompt, /is completely removed and must not survive in any form/);
      assert.match(prompt, /exactly the sanitary module of image \d, copied part for part/);
      assert.match(prompt, /clearly more than twice as tall as it is wide/);
      assert.match(prompt, /flush button on the glass front near the top, never on the top surface/);
      assert.match(prompt, /the toilet is wall-hung, rimless, in .*hanging on the front of that module/);
      // Ein Holzsitz auf weisser Keramik war einer der Befunde vom 16.09.
      assert.match(prompt, /its seat and lid are in the very same .*never wood, never a contrasting colour/);
      assert.match(prompt, /wall behind is neither moved nor opened/);
      // Die Vorwand, die das Modul traegt, ist normale Bauarbeit: Diego baut sie
      // und verkleidet sie. Die Pruefung darf sie nicht als neue Wand lesen.
      assert.match(checkPrompt, /A slim pre-wall behind the toilet, tiled or clad, is normal building work and is not a wall of the room/);
    } else {
      assert.match(prompt, /cistern is concealed inside the wall and stays concealed/);
      assert.match(prompt, /no visible cistern and no sanitary module/);
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
  const checker = h.calls.find((call) => call.body?.generationConfig?.responseMimeType
    && call.body.contents[0].parts.filter((part) => part.inlineData).length === 2);
  assert.match(generation.body.contents[0].parts[0].text, /guest WC: the result must contain NO shower/);
  assert.match(checker.body.contents[0].parts[0].text, /name the wall each sanitary fixture stands against/);
});

test('shower prompt tiles the full tray or sloped-floor perimeter to the ceiling', async () => {
  const h = harness({ checks: [() => checkedInv({}, { shower: 'back' })] });
  const res = await h.invoke(payload({ dusche: 'walk-in', badewanne: 'keine', wall: 'halbhoch' }));
  assert.equal(res.statusCode, 200);
  const generation = h.calls.find((call) => call.body?.generationConfig?.responseModalities);
  assert.match(generation.body.contents[0].parts[0].text, /entire perimeter of the shower tray or sloped tiled shower floor/);
  assert.match(generation.body.contents[0].parts[0].text, /every wall around the entire shower-floor perimeter is tiled continuously to the ceiling/);
});

test('ein Foto ohne Bad wird gar nicht erst gerendert', async () => {
  // Michaels Probe vom 16.09: Foto einer Veranda mit Sofa. Frueher lief daraus
  // zweimal die Bildgenerierung, und der Kunde bekam nur "Kontrolle nicht bestanden".
  const h = harness({ photoChecks: [() => photoChecked(false)] });
  const res = await h.invoke();
  assert.equal(res.statusCode, 422);
  assert.equal(res.body.code, 'PHOTO_NOT_A_BATHROOM');
  assert.equal(h.counts().generation, 0, 'ein falsches Foto darf kein Bild kosten');
  assert.equal(h.counts().checks, 0);
  assert.match(res.body.error, /kein Bad und kein WC/);
  assert.equal(res.body.delivery.lead, 'accepted');
  const leadMail = h.calls.find((call) => call.url === 'https://api.resend.com/emails');
  assert.match(leadMail.body.subject, /Foto zeigt kein Bad/);
  assert.deepEqual(leadMail.body.attachments.map(({ filename }) => filename), ['foto.png']);
  assert.equal(h.counts().mail, 1, 'der Kunde bekommt keine Bildmail');
});

test('ein falsches Foto kostet den Kunden keinen Tagesversuch', async () => {
  const h = harness({ photoChecks: [() => photoChecked(false)] });
  const res = await h.invoke();
  assert.equal(res.statusCode, 422);
  assert.equal(res.headers['Set-Cookie'], undefined);
});

test('die Fotopruefung bekommt nur das Kundenfoto, nicht Muster oder Modul', async () => {
  const h = harness();
  await h.invoke(payload({ spuelkasten: 'aufputz' }));
  const first = h.calls.find((call) => call.url.includes('generativelanguage.googleapis.com'));
  const parts = first.body.contents[0].parts;
  assert.equal(parts.filter((part) => part.inlineData).length, 1);
  assert.match(parts[0].text, /is_bathroom/);
});

test('eine unlesbare Fotopruefung haelt den Badplaner nicht auf', async () => {
  // Im Zweifel durchlassen: ein ausgeraeumtes Bad darf nicht abgewiesen werden.
  const h = harness({ photoChecks: [() => photoChecked(true, 'kein JSON'), () => photoChecked(true, '{}')] });
  const res = await h.invoke();
  assert.equal(res.statusCode, 200);
  assert.equal(h.counts().generation, 1);
});

test('faellt die Fotopruefung aus, wird trotzdem gerendert', async () => {
  const h = harness({ photoChecks: [() => response({ error: 'quota' }, 429)] });
  const res = await h.invoke();
  assert.equal(res.statusCode, 200);
  assert.equal(h.counts().generation, 1);
});

test('das Bidet wird weggeraeumt, und ein stehengebliebenes Bidet wird verworfen', async () => {
  // Probe vom 17.09: im Ideenbild stand das Bidet noch da. Im Fixpreis gibt es keins.
  const h = harness();
  await h.invoke();
  const prompt = h.calls.find((call) => call.body?.generationConfig?.responseModalities).body.contents[0].parts[0].text;
  assert.match(prompt, /If image 1 shows a bidet, it is gone/);
  assert.match(prompt, /nothing standing in its place/);

  const left = () => checkedInv({ bidet: 'right' }, { bidet: 'right' });
  const second = harness({ checks: [left, left] });
  const res = await second.invoke();
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.code, 'RENDER_REJECTED');
  const leadMail = second.calls.find((call) => call.url === 'https://api.resend.com/emails');
  assert.match(JSON.stringify(leadMail.body), /the bidet is still there, on the right wall/);
});

test('nach einem echten ersten Durchgang bleibt Zeit fuer den zweiten', async () => {
  // 35 s Generierung und 4 s Pruefung sind gemessene Werte aus der Produktion.
  // Mit der alten Reserve (25 s) und dem Faktor 1.3 kam der zweite Versuch nie.
  const h = harness({ generateDelays: [35000, 35000], checkDelays: [4000, 4000], checks: [() => checked(true), () => checked(false)] });
  const res = await h.invoke();
  assert.equal(h.counts().generation, 2, 'der zweite Versuch muss laufen');
  assert.equal(res.statusCode, 200);
  const leadMail = h.calls.find((call) => call.url === 'https://api.resend.com/emails');
  assert.match(JSON.stringify(leadMail.body), /1\. Versuch verworfen, 2\. Versuch ok/);
});

test('der Prompt ist eine Bearbeitung, keine Neuzeichnung', async () => {
  const h = harness();
  await h.invoke();
  const prompt = h.calls.find((call) => call.body?.generationConfig?.responseModalities).body.contents[0].parts[0].text;
  assert.match(prompt, /This is an edit of image 1, not a new picture/);
  assert.match(prompt, /KEEP THE POSITIONS/);
  assert.match(prompt, /its place along that wall, measured against the corners, the door and the window/);
  // Die Duscharmatur stand ueber dem WC statt in der Dusche.
  assert.match(prompt, /Every shower fitting[^.]*sits inside the shower area on the shower wall, never on a wall next to the toilet or the washbasin/);
});

test('die Dusche muss an die Wand, an der die Wanne stand', async () => {
  const wrong = () => checkedInv({ bathtub: 'right' }, { shower: 'left' });
  const h = harness({ checks: [wrong, wrong] });
  const res = await h.invoke(payload({ dusche: 'walk-in', badewanne: 'keine' }));
  assert.equal(res.statusCode, 502);
  const leadMail = h.calls.find((call) => call.url === 'https://api.resend.com/emails');
  assert.match(JSON.stringify(leadMail.body), /the bathtub it replaces stood on the right wall/);
});

test('eine fehlende Dusche und ein verschobenes Waschbecken werden verworfen', async () => {
  const missing = () => checkedInv({ bathtub: 'none' }, { shower: 'none' });
  const first = harness({ checks: [missing, missing] });
  const a = await first.invoke(payload({ dusche: 'walk-in', badewanne: 'keine' }));
  assert.equal(a.statusCode, 502);
  assert.match(JSON.stringify(first.calls.find((c) => c.url === 'https://api.resend.com/emails').body), /requested shower is missing/);

  const shifted = () => checkedInv({ washbasin: 'left' }, { washbasin: 'back' });
  const second = harness({ checks: [shifted, shifted] });
  const bResult = await second.invoke();
  assert.equal(bResult.statusCode, 502);
  assert.match(JSON.stringify(second.calls.find((c) => c.url === 'https://api.resend.com/emails').body), /washbasin moved from the left wall to the back wall/);
});

test('eine unbrauchbare Antwort der Pruefung gilt als nicht verfuegbar, nicht als bestanden', async () => {
  for (const text of ['kein JSON', JSON.stringify({ before: { toilet: 'links' }, after: {} }), JSON.stringify({ before: {}, after: {}, extra_openings: false, view_changed: false, reason: 'x' })]) {
    const h = harness({ checks: [() => checked(false, text), () => checked(false, text)] });
    const res = await h.invoke();
    assert.equal(res.statusCode, 200, 'nicht lesbar heisst ausgeliefert, aber in der Lead-Mail vermerkt');
    const leadMail = h.calls.find((call) => call.url === 'https://api.resend.com/emails');
    assert.match(JSON.stringify(leadMail.body), /nicht m\u00f6glich/);
  }
});

test('das Ideenbild entsteht mit dem genauesten Modell, nicht dem billigsten', async () => {
  // Qualitaet vor Ersparnis: das Bild ist das Produkt. 2K kostet bei diesem
  // Modell gleich viel wie 1K.
  const h = harness();
  await h.invoke();
  const gen = h.calls.find((call) => call.body?.generationConfig?.responseModalities);
  assert.match(gen.url, /models\/gemini-3-pro-image:generateContent/);
  assert.equal(gen.body.generationConfig.imageConfig.imageSize, '2K');

  // Umschaltbar ohne Codeaenderung, falls ein neueres Modell kommt.
  const other = harness({ env: { BADPLANER_MODEL: 'gemini-3.1-flash-image' } });
  await other.invoke();
  assert.match(other.calls.find((call) => call.body?.generationConfig?.responseModalities).url, /gemini-3\.1-flash-image/);
});

test('fixture checker rejects a shower in a Gäste-WC', async () => {
  const h = harness({ checks: [() => checkedInv({}, { shower: 'right' }), () => checkedInv({}, { shower: 'right' })] });
  const res = await h.invoke(payload({ raum: 'gaeste-wc', dusche: '', badewanne: '', waschtisch: 'einzel' }));
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.code, 'RENDER_REJECTED');
  assert.equal(res.body.delivery.lead, 'accepted');
  assert.equal(h.counts().mail, 1);
  const leadMail = h.calls.find((call) => call.url === 'https://api.resend.com/emails');
  assert.match(leadMail.body.subject, /Ideenbild abgelehnt/);
  assert.match(JSON.stringify(leadMail.body), /shower on the right wall although none was ordered/);
  // Das verworfene Bild geht nur an uns, damit wir sehen, was die Pruefung beanstandet hat.
  assert.deepEqual(leadMail.body.attachments.map(({ filename }) => filename), ['foto.png', 'verworfen.jpg']);
  assert.equal(h.counts().mail, 1, 'the customer must not receive a rejected image');
});

test('a rejected render leaves the customer his daily attempts', async () => {
  const h = harness({ checks: Array.from({ length: 20 }, () => () => checked(true)) });
  // Zehn abgelehnte Bilder hintereinander: das Gerätelimit bleibt unberührt,
  // es wird kein Zähler-Cookie gesetzt.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const res = await h.invoke();
    assert.equal(res.statusCode, 502);
    assert.equal(res.headers['Set-Cookie'], undefined);
  }
  // Das IP-Limit greift weiter, damit sich das nicht endlos wiederholen lässt.
  const blocked = await h.invoke();
  assert.equal(blocked.statusCode, 429);
  assert.deepEqual(h.counts(), { generation: 20, checks: 20, mail: 10 });
});

test('after a rejection the next attempt still counts as the first', async () => {
  const h = harness({ checks: [() => checked(true), () => checked(true), () => checked()] });
  const rejected = await h.invoke();
  assert.equal(rejected.statusCode, 502);
  assert.equal(rejected.headers['Set-Cookie'], undefined);
  const ok = await h.invoke();
  assert.equal(ok.statusCode, 200);
  assert.match(ok.headers['Set-Cookie'], /nldbp=1:2026-09-13/);
});

test('a changed field of view is noted for us but the customer still gets the image', async () => {
  const h = harness({ checks: [() => checkedInv({}, {}, { view_changed: true, reason: 'camera and visible room bounds changed' })] });
  const res = await h.invoke(payload({ dusche: 'keine', badewanne: 'keine' }));
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  assert.deepEqual(h.counts(), { generation: 1, checks: 1, mail: 2 });
  const leadMail = h.calls.find((call) => call.url === 'https://api.resend.com/emails');
  assert.match(JSON.stringify(leadMail.body), /Bildausschnitt ver/);
});

test('a moved toilet is still rejected even when the field of view held', async () => {
  const moved = () => checkedInv({ toilet: 'back' }, { toilet: 'right' });
  const h = harness({ checks: [moved, moved] });
  const res = await h.invoke(payload({ dusche: 'keine', badewanne: 'keine' }));
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.code, 'RENDER_REJECTED');
  assert.deepEqual(h.counts(), { generation: 2, checks: 2, mail: 1 });
});

test('the generation request carries the aspect ratio of the customer photo', async () => {
  const h = harness(); await h.invoke();
  const gen = h.calls.find((call) => call.url.includes('generativelanguage.googleapis.com') && call.body?.generationConfig?.responseModalities);
  assert.equal(gen.body.generationConfig.imageConfig.imageSize, '2K');
  assert.equal(gen.body.generationConfig.imageConfig.aspectRatio, '1:1');
});

test('nearestAspectRatio picks a format Gemini supports', () => {
  assert.equal(nearestAspectRatio(720, 1280), '9:16');
  assert.equal(nearestAspectRatio(1280, 720), '16:9');
  assert.equal(nearestAspectRatio(1200, 1600), '3:4');
  assert.equal(nearestAspectRatio(1600, 1200), '4:3');
  assert.equal(nearestAspectRatio(1024, 1024), '1:1');
  assert.equal(nearestAspectRatio(0, 800), '');
});

test('the sanitary module travels as its own reference image', async () => {
  const image = () => new Response(Buffer.from(PNG, 'base64'), { status: 200, headers: { 'content-type': 'image/png' } });
  const h = harness({ swatch: () => image() });
  const res = await h.invoke(payload({ cistern: 'aufputz' }));
  assert.equal(res.statusCode, 200);
  const generation = h.calls.find((call) => call.body?.generationConfig?.responseModalities);
  const parts = generation.body.contents[0].parts;
  // Foto, Plattenmuster, Sanitärmodul.
  assert.equal(parts.filter((part) => part.inlineData).length, 2 + 1);
  const module = parts.filter((part) => part.inlineData)[2].inlineData;
  assert.equal(module.mimeType, 'image/jpeg');
  // Ein echtes JPEG, kein Platzhalter: Base64 eines Bildes von einigen Kilobyte.
  assert.ok(module.data.startsWith('/9j/'), 'module image is not a JPEG');
  assert.ok(module.data.length > 2000, `module image too small: ${module.data.length}`);
  const prompt = parts[0].text;
  assert.match(prompt, /Image 3 is ONLY a product photo of one sanitary module/);
  assert.match(prompt, /exactly the sanitary module of image 3, copied part for part/);
  assert.match(prompt, /never tiled, never clad and never boxed in/);
  const leadMail = h.calls.find((call) => call.url === 'https://api.resend.com/emails');
  assert.match(JSON.stringify(leadMail.body), /OLI QR INOX Sospeso/);
});

test('the module image needs no network call and none is made for it', async () => {
  const h = harness();
  const res = await h.invoke(payload({ cistern: 'aufputz' }));
  assert.equal(res.statusCode, 200);
  assert.equal(h.calls.filter((call) => call.url.includes('oli-world')).length, 0);
  const generation = h.calls.find((call) => call.body?.generationConfig?.responseModalities);
  // Plattenmuster fehlt hier (404), das Modul ist trotzdem dabei: Foto + Modul.
  assert.equal(generation.body.contents[0].parts.filter((part) => part.inlineData).length, 2);
  assert.match(generation.body.contents[0].parts[0].text, /Image 2 is ONLY a product photo of one sanitary module/);
});

test('Unterputz carries no module image and forbids a module in front of the wall', async () => {
  const h = harness();
  const res = await h.invoke(payload({ cistern: 'unterputz' }));
  assert.equal(res.statusCode, 200);
  const generation = h.calls.find((call) => call.body?.generationConfig?.responseModalities);
  assert.equal(generation.body.contents[0].parts.filter((part) => part.inlineData).length, 1);
  const prompt = generation.body.contents[0].parts[0].text;
  assert.doesNotMatch(prompt, /product photo of one sanitary module/);
  assert.match(prompt, /no visible cistern and no sanitary module in front of the wall/);
});

test('the washbasin gets the same ceramic colour as the toilet', async () => {
  const options = optionsForPackage('colore');
  const coloured = options.sanitary.find((entry) => entry.id !== 'weiss') || options.sanitary[0];
  const h = harness();
  const res = await h.invoke(payload({
    paket: 'colore', format: options.formats[0], platte: options.tiles[0].id,
    unterbau: options.bases[0].id, top: options.tops[0].id, becken: 'aufsatz',
    armaturenserie: 'treemme-ran', finish: 'treemme-nero-opaco', keramik: coloured.id,
    wall: options.walls[0].id, dusche: options.showers[0].id, badewanne: options.bathtubs[0].id,
    waschtisch: options.basins[0].id, spiegel: options.mirrors[0].id,
  }));
  assert.equal(res.statusCode, 200);
  const generation = h.calls.find((call) => call.body?.generationConfig?.responseModalities);
  const prompt = generation.body.contents[0].parts[0].text;
  // Ein Bad mit farbigem WC und weissem Becken ist eine Farbe zu viel.
  assert.ok(prompt.includes(`in the same ${coloured.prompt} as the toilet, exactly the same colour and finish`),
    'washbasin does not carry the ceramic colour');
});

test('an integrated washbasin keeps the countertop material, not the ceramic colour', async () => {
  const options = optionsForPackage('atelier');
  assert.ok(options.basinTypes.some((entry) => entry.id === 'integriert'), 'atelier should offer an integrated basin');
  const tile = options.tiles[0];
  const h = harness();
  const res = await h.invoke(payload({
    paket: 'atelier', look: tile.look, format: tile.format, platte: tile.id, kombination: 'einheitlich',
    unterbau: options.bases[0].id, top: options.tops[0].id, becken: 'integriert',
    finish: options.finishes[0].id, keramik: options.sanitary[0].id,
    wall: options.walls[0].id, dusche: options.showers[0].id, badewanne: options.bathtubs[0].id,
    waschtisch: options.basins[0].id, spiegel: options.mirrors[0].id,
  }));
  assert.equal(res.statusCode, 200, `unexpected status ${res.statusCode}: ${JSON.stringify(res.body).slice(0, 200)}`);
  const generation = h.calls.find((call) => call.body?.generationConfig?.responseModalities);
  assert.doesNotMatch(generation.body.contents[0].parts[0].text, /as the toilet, exactly the same colour and finish/);
});

test('the toilet keeps its wall, also under a sloping ceiling', async () => {
  const h = harness();
  const res = await h.invoke(payload());
  assert.equal(res.statusCode, 200);
  const generation = h.calls.find((call) => call.body?.generationConfig?.responseModalities);
  const prompt = generation.body.contents[0].parts[0].text;
  // Zweimal gesehen: unter der Dachschraege wandert das WC an die gerade Wand.
  assert.match(prompt, /The toilet keeps its wall and its place because its drain cannot be moved/);
  assert.match(prompt, /never moved to a straight or rear wall to gain headroom/);
});

test('an Unterputz toilet also keeps seat and lid in the ceramic colour', async () => {
  const h = harness();
  const res = await h.invoke(payload({ cistern: 'unterputz' }));
  assert.equal(res.statusCode, 200);
  const generation = h.calls.find((call) => call.body?.generationConfig?.responseModalities);
  assert.match(generation.body.contents[0].parts[0].text, /with seat and lid in the very same .*never wood/);
});

test('kein Auswahlname traegt italienischen Katalogtext oder ein doppeltes Wort', () => {
  // "Artistic mosaic (immagine di categoria)" und "Onyx Onyx Black" standen so im Badplaner.
  const scraperText = /immagine|categoria|prodotto|scheda tecnica|non disponibile/i;
  for (const id of ['essenza', 'colore', 'atelier']) {
    const options = optionsForPackage(id);
    for (const [group, list] of Object.entries(options)) {
      if (!Array.isArray(list)) continue;
      for (const option of list) {
        if (!option || typeof option.label !== 'string') continue;
        assert.ok(!scraperText.test(option.label), `${group}: ${option.label} traegt italienischen Katalogtext`);
        const words = option.label.split(' ');
        for (let i = 0; i < words.length - 1; i += 1) {
          assert.notEqual(words[i], words[i + 1], `${group}: ${option.label} wiederholt ein Wort`);
        }
      }
    }
  }
});

test('every tap finish carries a German name, not only the Italian one', () => {
  const german = /\((Chrom|Schwarz matt|Weiss matt|Gold gebürstet|Nickel gebürstet|Edelstahl gebürstet|Roségold gebürstet|Messing gebürstet|Anthrazit)\)/;
  for (const id of ['essenza', 'colore', 'atelier']) {
    for (const finish of optionsForPackage(id).finishes) {
      // Der Kunde in Zofingen liest "Cromo" nicht als Chrom.
      const italian = /^(Cromo|Nero Opaco|Bianco Opaco|Oro Spazzolato|Nichel Spazzolato|Inox Spazzolato|Oro Rosa Spazzolato|Ottone Spazzolato|Gun Metal-PVD)$/;
      assert.ok(!italian.test(finish.label), `${finish.label} has no German name`);
      if (/Spazzolato|Opaco|^Cromo|Gun Metal/.test(finish.label)) {
        assert.match(finish.label, german, `${finish.label} is missing its German name`);
      }
    }
  }
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
  assert.deepEqual(leadMail.body.attachments.map(({ filename }) => filename), ['foto.png', 'verworfen.jpg']);
  // Der zweite, ebenfalls verworfene Versuch ist der, den wir zu sehen bekommen.
  assert.ok(leadMail.body.attachments[1].content.length > 0);
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
  // Kein Bild fuer den Kunden, aber der Lead geht an uns (mit dem verworfenen Bild).
  assert.equal(res.statusCode, 502); assert.equal(res.body.image, undefined); assert.equal(h.counts().mail, 1);
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

test('ein Ausfall des Bilddienstes wird gemeldet, der Lead aber nicht weggeworfen', async () => {
  // Diegos Probe vom 17.09: erster Versuch scheiterte, und es kam gar keine Mail.
  // Der Kunde hatte das ganze Formular ausgefuellt, wir hatten davon nichts.
  for (const settings of [{ generateDelays: [65001] }, { generations: [() => generated('AAAA')] }, { generations: [() => generated(PNG, 'image/svg+xml')] }]) {
    const h = harness(settings); const res = await h.invoke();
    assert.equal(res.statusCode, 502);
    assert.equal(res.body.code, 'RENDER_FAILED');
    assert.match(res.body.error, /Ihre Angaben und Ihr Foto sind bei uns/);
    assert.deepEqual(h.counts(), { generation: 1, checks: 0, mail: 1 });
    const leadMail = h.calls.find((call) => call.url === 'https://api.resend.com/emails');
    assert.match(leadMail.body.subject, /kein Ideenbild erzeugt/);
    assert.deepEqual(leadMail.body.attachments.map(({ filename }) => filename), ['foto.png']);
  }
});

test('auch ein gescheiterter zweiter Versuch behaelt den Lead und das verworfene Bild', async () => {
  const h = harness({ generateDelays: [35000, 0], checkDelays: [4000], checks: [() => checked(true)],
    generations: [() => generated(), () => response({ error: 'boom' }, 500)] });
  const res = await h.invoke();
  assert.equal(res.statusCode, 502);
  assert.equal(h.counts().generation, 2);
  assert.equal(h.counts().mail, 1);
  const leadMail = h.calls.find((call) => call.url === 'https://api.resend.com/emails');
  assert.deepEqual(leadMail.body.attachments.map(({ filename }) => filename), ['foto.png', 'verworfen.jpg']);
});

test('ein Ausfall des Bilddienstes kostet den Kunden keinen Tagesversuch', async () => {
  const h = harness({ generations: [() => response({ error: 'boom' }, 500)] });
  const res = await h.invoke();
  assert.equal(res.statusCode, 502);
  assert.equal(res.headers['Set-Cookie'], undefined);
});

test('failed render attempts do not consume the IP counter', async () => {
  const failures = Array.from({ length: 6 }, () => () => response({}, 500));
  const h = harness({ generations: failures });
  for (let index = 0; index < failures.length; index += 1) assert.equal((await h.invoke()).statusCode, 502);
  assert.equal((await h.invoke()).statusCode, 200);
});

test('retry is skipped when a second pass of the measured length cannot fit', async () => {
  const h = harness({ generateDelays: [45000], checks: [() => checked(true)] }); const res = await h.invoke();
  assert.equal(res.body.code, 'RENDER_REJECTED'); assert.deepEqual(h.counts(), { generation: 1, checks: 1, mail: 1 });
});

test('retry runs when the first pass was fast enough to repeat', async () => {
  const h = harness({ generateDelays: [20000], checks: [() => checked(true)] }); const res = await h.invoke();
  assert.equal(res.statusCode, 200); assert.deepEqual(h.counts(), { generation: 2, checks: 2, mail: 2 });
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
  const limited = harness(); const res = await limited.invoke(payload(), { headers: { cookie: 'nldbp=5:2026-09-13' } });
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
    assert.equal(res.statusCode, 502); assert.equal(h.counts().checks, 0); assert.equal(h.counts().mail, 1);
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
  h.clock.advance(65000);
  const res = await pending;
  assert.equal(res.statusCode, 502); assert.equal(cancelCalled, true); assert.equal(h.counts().mail, 1);
});

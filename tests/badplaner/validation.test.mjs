import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

assert.ok(process.env.BADPLANER_TEST_BUILD, 'BADPLANER_TEST_BUILD must point to the compiled test tree');
const build = process.env.BADPLANER_TEST_BUILD;
const { normalizeSelection, ValidationError } = await import(pathToFileURL(resolve(build, 'server/badplaner/validation.js')));
const { optionsForPackage } = await import(pathToFileURL(resolve(build, 'src/data/badplaner.js')));

const packageIds = ['essenza', 'colore', 'atelier'];
const fieldLists = {
  platte: 'tiles', unterbau: 'bases', top: 'tops', becken: 'basinTypes',
  keramik: 'sanitary', wall: 'walls', dusche: 'showers', waschtisch: 'basins', spiegel: 'mirrors',
};
const legacyAliases = {
  paket: 'package', platte: 'tile', unterbau: 'furniture', keramik: 'sanitary',
  dusche: 'shower', waschtisch: 'basin', spiegel: 'mirror',
};

/** Mirrors the current UI's JSON payload, including conditional empty strings. */
function uiPayload(pkg, changes = {}) {
  const opts = optionsForPackage(pkg);
  const payload = {
    kind: 'render', paket: pkg, individuell: false,
    format: pkg === 'atelier' ? '' : opts.formats[0],
    look: pkg === 'atelier' ? opts.tiles[0].look : '',
    boden: '', kombination: pkg === 'atelier' ? 'einheitlich' : '',
    akzentFlaeche: '', akzent: '',
    armaturenserie: pkg === 'colore' ? opts.tapSeriesOptions[0].id : '',
    finish: pkg === 'atelier' ? opts.finishes[0].id : '',
    windows: '1', name: 'Test Person', email: 'test@example.invalid', telefon: '12345678', consent: true,
  };
  for (const [field, list] of Object.entries(fieldLists)) payload[field] = opts[list][0]?.id ?? '';
  return JSON.parse(JSON.stringify({ ...payload, ...changes }));
}

function rejectsField(payload, field) {
  assert.throws(() => normalizeSelection(payload), (error) => {
    assert.ok(error instanceof ValidationError);
    assert.equal(error.name, 'ValidationError');
    assert.equal(error.field, field);
    assert.equal(typeof error.message, 'string');
    assert.ok(error.message.length > 0);
    return true;
  });
}

for (const pkg of packageIds) {
  test(`${pkg}: current UI payload normalizes without changing selected IDs`, () => {
    const payload = uiPayload(pkg);
    const before = JSON.stringify(payload);
    const selected = normalizeSelection(payload);
    assert.equal(JSON.stringify(payload), before, 'normalization must not mutate the request');
    assert.equal(selected.pkg.id, pkg);
    assert.equal(selected.tile.id, payload.platte);
    assert.equal(selected.base.id, payload.unterbau);
    assert.equal(selected.top.id, payload.top);
    assert.equal(selected.basinType.id, payload.becken);
    assert.equal(selected.sanitary.id, payload.keramik);
    assert.equal(selected.wall.id, payload.wall);
    assert.equal(selected.shower.id, payload.dusche);
    assert.equal(selected.basin.id, payload.waschtisch);
    assert.equal(selected.mirror.id, payload.spiegel);
    assert.equal(selected.floorTile, undefined);
    assert.equal(selected.floorFormat, '');
    assert.equal(selected.isAtelier, pkg === 'atelier');
    assert.equal(selected.individuell, false);
    assert.equal(selected.isKombi, false);
    assert.equal(selected.placement, undefined);
    assert.equal(selected.accent, undefined);
    assert.equal(selected.format, pkg === 'atelier' ? selected.tile.format : payload.format);
    assert.equal(selected.finish.id, 'treemme-cromo');
    assert.equal(selected.tapSeriesOption?.id, pkg === 'colore' ? payload.armaturenserie : undefined);
    assert.equal(selected.look?.id, pkg === 'atelier' ? payload.look : undefined);
  });

  for (const field of Object.keys(fieldLists)) {
    test(`${pkg}: ${field} requires a known explicit ID, including single-option lists`, () => {
      for (const value of [undefined, '', 'not-in-the-catalogue']) rejectsField(uiPayload(pkg, { [field]: value }), field);
    });
  }

  test(`${pkg}: non-default equipment remains exactly selected`, () => {
    const opts = optionsForPackage(pkg);
    const changes = {};
    for (const [field, list] of Object.entries(fieldLists)) changes[field] = opts[list].at(-1).id;
    if (pkg === 'atelier') {
      changes.look = opts.tiles.at(-1).look;
      changes.finish = opts.finishes.at(-1).id;
    }
    if (pkg === 'colore') changes.armaturenserie = opts.tapSeriesOptions.at(-1).id;
    const selected = normalizeSelection(uiPayload(pkg, changes));
    assert.equal(selected.tile.id, changes.platte);
    assert.equal(selected.base.id, changes.unterbau);
    assert.equal(selected.top.id, changes.top);
    assert.equal(selected.basinType.id, changes.becken);
    assert.equal(selected.sanitary.id, changes.keramik);
    assert.equal(selected.wall.id, changes.wall);
    assert.equal(selected.shower.id, changes.dusche);
    assert.equal(selected.basin.id, changes.waschtisch);
    assert.equal(selected.mirror.id, changes.spiegel);
    if (pkg === 'atelier') assert.equal(selected.finish.id, changes.finish);
    if (pkg === 'colore') assert.equal(selected.tapSeriesOption.id, changes.armaturenserie);
  });

  test(`${pkg}: package-ineligible IDs fail for every restricted equipment list`, () => {
    const own = optionsForPackage(pkg);
    for (const [field, list] of Object.entries(fieldLists)) {
      const foreign = packageIds.flatMap((id) => optionsForPackage(id)[list])
        .find((entry) => !own[list].some((allowed) => allowed.id === entry.id));
      if (foreign) rejectsField(uiPayload(pkg, { [field]: foreign.id }), field);
    }
  });

  test(`${pkg}: legacy aliases work alone, agree when duplicated, and reject conflicts`, () => {
    const payload = uiPayload(pkg);
    const legacy = { ...payload };
    for (const [field, alias] of Object.entries(legacyAliases)) {
      legacy[alias] = legacy[field];
      delete legacy[field];
      assert.equal(normalizeSelection({ ...payload, [alias]: payload[field] }).pkg.id, pkg);
      rejectsField({ ...payload, [alias]: 'conflicting-explicit-id' }, field);
      rejectsField({ ...payload, [field]: 'conflicting-explicit-id', [alias]: payload[field] }, field);
    }
    assert.deepEqual(normalizeSelection(legacy), normalizeSelection(payload));
  });

  test(`${pkg}: optional floor preserves valid ID; missing is none; invalid is never ignored`, () => {
    const opts = optionsForPackage(pkg);
    for (const value of [undefined, '']) assert.equal(normalizeSelection(uiPayload(pkg, { boden: value })).floorTile, undefined);
    rejectsField(uiPayload(pkg, { boden: 'not-in-the-catalogue' }), 'boden');
    const foreign = optionsForPackage(pkg === 'atelier' ? 'essenza' : 'atelier').tiles[0].id;
    rejectsField(uiPayload(pkg, { boden: foreign }), 'boden');
    const floor = opts.tiles.at(-1);
    const selected = normalizeSelection(uiPayload(pkg, { boden: floor.id }));
    assert.equal(selected.floorTile.id, floor.id);
    assert.equal(selected.floorFormat, floor.formats.includes(selected.format) ? selected.format : floor.format);
  });
}

test('package is required and cannot fall back or accept a truncated ID', () => {
  for (const paket of [undefined, '', 'individuell', 'unknown', `essenza${' '.repeat(50)}invalid`]) {
    rejectsField(uiPayload('essenza', { paket }), 'paket');
  }
  assert.equal(normalizeSelection(uiPayload('essenza', { paket: ' ESSENZA ', package: 'essenza' })).pkg.id, 'essenza');
});

test('individual request remains a boolean without bypassing package validation', () => {
  assert.equal(normalizeSelection(uiPayload('essenza', { individuell: true })).individuell, true);
  assert.equal(normalizeSelection(uiPayload('essenza', { individuell: undefined })).individuell, false);
  rejectsField(uiPayload('essenza', { individuell: 'true' }), 'individuell');
  rejectsField(uiPayload('essenza', { individuell: true, platte: 'unknown' }), 'platte');
});

for (const pkg of ['essenza', 'colore']) {
  test(`${pkg}: format is required and must be package-allowed`, () => {
    for (const format of [undefined, '', '120x278', 'unknown']) rejectsField(uiPayload(pkg, { format }), 'format');
    for (const format of optionsForPackage(pkg).formats) assert.equal(normalizeSelection(uiPayload(pkg, { format })).format, format);
  });

  test(`${pkg}: fixed finish permits omitted/empty/chrome, rejects explicit non-chrome`, () => {
    for (const finish of [undefined, '', 'treemme-cromo']) {
      assert.equal(normalizeSelection(uiPayload(pkg, { finish })).finish.id, 'treemme-cromo');
    }
    for (const finish of ['treemme-nero-opaco', 'treemme-bronze-pvd', 'unknown']) rejectsField(uiPayload(pkg, { finish }), 'finish');
  });

  test(`${pkg}: Atelier-only fields may be empty but never silently ignored`, () => {
    const values = { look: 'travertin', kombination: 'einheitlich', akzentFlaeche: 'waschtisch', akzent: optionsForPackage('atelier').accents[0].id };
    for (const [field, value] of Object.entries(values)) {
      for (const empty of [undefined, '']) assert.doesNotThrow(() => normalizeSelection(uiPayload(pkg, { [field]: empty })));
      rejectsField(uiPayload(pkg, { [field]: value }), field);
      rejectsField(uiPayload(pkg, { [field]: 'unknown' }), field);
    }
  });
}

test('tap series is required only for Colore; other packages reject even a known series', () => {
  for (const armaturenserie of [undefined, '', 'unknown']) rejectsField(uiPayload('colore', { armaturenserie }), 'armaturenserie');
  for (const pkg of ['essenza', 'atelier']) {
    for (const armaturenserie of [undefined, '']) assert.equal(normalizeSelection(uiPayload(pkg, { armaturenserie })).tapSeriesOption, undefined);
    rejectsField(uiPayload(pkg, { armaturenserie: 'treemme-up' }), 'armaturenserie');
  }
});

test('Atelier format derives from its tile, explicit formats must fit that tile', () => {
  const opts = optionsForPackage('atelier');
  const tile = opts.tiles.find((entry) => entry.formats.includes('30x60'));
  assert.ok(tile);
  for (const format of [undefined, '', tile.format, '30x60']) {
    const selected = normalizeSelection(uiPayload('atelier', { platte: tile.id, look: tile.look, format }));
    assert.equal(selected.format, format || tile.format);
  }
  rejectsField(uiPayload('atelier', { format: '1x1' }), 'format');
});

test('Atelier requires look, finish and accent mode and rejects look/tile disagreement', () => {
  for (const field of ['look', 'finish', 'kombination']) {
    for (const value of [undefined, '', 'unknown']) rejectsField(uiPayload('atelier', { [field]: value }), field);
  }
  const anotherLook = optionsForPackage('atelier').looks.find((entry) => entry.id !== uiPayload('atelier').look);
  rejectsField(uiPayload('atelier', { look: anotherLook.id }), 'look');
  rejectsField(uiPayload('atelier', { finish: 'treemme-bianco-opaco' }), 'finish');
});

test('Atelier uniform surfaces reject inactive placement and accent selections', () => {
  rejectsField(uiPayload('atelier', { akzentFlaeche: 'waschtisch' }), 'akzentFlaeche');
  rejectsField(uiPayload('atelier', { akzent: optionsForPackage('atelier').accents[0].id }), 'akzent');
});

for (const [alias, canonical] of Object.entries({ waschtisch: 'waschtischwand', waschtischwand: 'waschtischwand', dusche: 'duschnische', duschnische: 'duschnische' })) {
  test(`Atelier combination accepts placement ${alias} and only compatible accents`, () => {
    const opts = optionsForPackage('atelier');
    const allowed = opts.accents.find((entry) => entry.placement.includes(canonical));
    const payload = uiPayload('atelier', { kombination: 'kombination', akzentFlaeche: alias, akzent: allowed.id });
    const selected = normalizeSelection(payload);
    assert.equal(selected.isKombi, true);
    assert.equal(selected.placement.id, canonical);
    assert.equal(selected.accent.id, allowed.id);
    for (const akzent of [undefined, '', 'unknown']) rejectsField({ ...payload, akzent }, 'akzent');
    const forbidden = opts.accents.find((entry) => !entry.placement.includes(canonical));
    if (forbidden) rejectsField({ ...payload, akzent: forbidden.id }, 'akzent');
  });
}

test('Atelier combination requires a valid placement, including prototype-key rejection', () => {
  for (const akzentFlaeche of [undefined, '', 'unknown', 'constructor', 'toString', '__proto__']) {
    rejectsField(uiPayload('atelier', { kombination: 'kombination', akzentFlaeche, akzent: optionsForPackage('atelier').accents[0].id }), 'akzentFlaeche');
  }
});

test('non-string selections fail on their own field instead of becoming defaults', () => {
  for (const field of ['paket', ...Object.keys(fieldLists), 'boden', 'format', 'look', 'finish', 'armaturenserie', 'kombination', 'akzentFlaeche', 'akzent']) {
    for (const value of [null, false, 1, [], {}]) rejectsField(uiPayload('atelier', { [field]: value }), field);
  }
});

test('empty canonical fields can use legacy IDs, but invalid IDs are not truncated into valid ones', () => {
  const payload = uiPayload('essenza');
  assert.equal(normalizeSelection({ ...payload, platte: '', tile: payload.platte }).tile.id, payload.platte);
  rejectsField({ ...payload, platte: `${payload.platte}${' '.repeat(200)}invalid` }, 'platte');
});

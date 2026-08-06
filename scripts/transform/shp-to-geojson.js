const fs = require('fs');
const path = require('path');
const { open } = require('shapefile');
const simplify = require('simplify-js');

const SHP_DIR = process.env.SHP_DIR || path.join(__dirname, '..', 'data', 'cnuc');
const OUT_FILE = path.join(__dirname, '..', '..', 'public', 'ucs_poligonos.geojson');
const UCS_FILE = path.join(__dirname, '..', '..', 'src', 'data', 'ucs.json');
const TOLERANCE = Number(process.env.TOLERANCE || '0.005');

function normalize(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

function simplifyRing(ring) {
  if (!ring || ring.length < 4) return ring;
  const pts = ring.map(([x, y]) => ({ x, y }));
  const out = simplify(pts, TOLERANCE, true);
  if (!out || out.length < 3) return ring;
  const closed = out.map((p) => [p.x, p.y]);
  const first = closed[0];
  const last = closed[closed.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) closed.push([...first]);
  return closed;
}

function simplifyGeometry(geometry) {
  if (!geometry) return geometry;
  if (geometry.type === 'Polygon') {
    return { ...geometry, coordinates: geometry.coordinates.map(simplifyRing) };
  }
  if (geometry.type === 'MultiPolygon') {
    return { ...geometry, coordinates: geometry.coordinates.map((p) => p.map(simplifyRing)) };
  }
  return geometry;
}

function countCoords(geometry) {
  if (!geometry) return 0;
  let n = 0;
  const add = (rings) => { for (const r of rings) n += r.length; };
  if (geometry.type === 'Polygon') add(geometry.coordinates);
  else if (geometry.type === 'MultiPolygon') for (const p of geometry.coordinates) add(p);
  return n;
}

async function main() {
  const ucs = JSON.parse(fs.readFileSync(UCS_FILE, 'utf8'));
  const byCodigo = new Map();
  const byNome = new Map();
  for (const u of ucs) {
    if (u.codigo) byCodigo.set(String(u.codigo).trim(), u);
    if (u.nome) byNome.set(normalize(u.nome), u);
  }

  const shpPath = path.join(SHP_DIR, 'cnuc_2025_08.shp');
  const dbfPath = path.join(SHP_DIR, 'cnuc_2025_08.dbf');
  const source = await open(shpPath, dbfPath, { encoding: 'utf8' });

  const out = fs.createWriteStream(OUT_FILE);
  out.write('{"type":"FeatureCollection","features":[');

  let first = true;
  let matched = 0;
  let unmatched = 0;
  let n = 0;
  let rawCoords = 0;
  let outCoords = 0;

  while (true) {
    const res = await source.read();
    if (res.done) break;
    const f = res.value;
    const p = f.properties || {};
    const codigo = String(p.cd_cnuc || '').trim();
    const nome = String(p.nome_uc || '').trim();
    const uc = byCodigo.get(codigo) || byNome.get(normalize(nome));
    if (uc) matched++; else unmatched++;

    rawCoords += countCoords(f.geometry);
    const geom = simplifyGeometry(f.geometry);
    outCoords += countCoords(geom);

    const feature = {
      type: 'Feature',
      properties: {
        codigo: codigo || undefined,
        nome: nome || undefined,
        categoria: uc?.categoria || undefined,
        esfera: uc?.esfera || undefined,
        uf: uc?.uf || p.uf || undefined,
        area_ha: uc?.area_ha !== undefined ? uc.area_ha : undefined,
        slug: uc?.slug || undefined,
      },
      geometry: geom,
    };

    out.write((first ? '' : ',') + JSON.stringify(feature));
    first = false;
    n++;
    if (n % 500 === 0) console.log(`  ${n} features processadas`);
  }

  out.write(']}');
  out.end();

  await new Promise((resolve, reject) => {
    out.on('finish', resolve);
    out.on('error', reject);
  });

  const outSizeMB = (fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(1);
  console.log('features:', n, '| casadas:', matched, '| sem match:', unmatched);
  console.log('coords brutas:', rawCoords, '-> após simplificar:', outCoords, `(${Math.round((1 - outCoords / rawCoords) * 100)}% menos)`);
  console.log('tamanho:', outSizeMB, 'MB ->', OUT_FILE);
}

main().catch((e) => { console.error('ERRO', e); process.exit(1); });

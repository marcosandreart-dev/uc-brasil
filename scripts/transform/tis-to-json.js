const fs = require("fs");
const path = require("path");
const { open } = require("shapefile");

const SHP_DIR = process.env.TIS_SHP_DIR || path.join(__dirname, "..", "data", "funai", "shp");
const OUT_JSON = path.join(__dirname, "..", "..", "src", "data", "tis.json");

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNumber(value) {
  if (value === undefined || value === null) return null;
  const num = parseFloat(String(value).replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

async function main() {
  const shpPath = path.join(SHP_DIR, "tis_poligonais.shp");
  const dbfPath = path.join(SHP_DIR, "tis_poligonais.dbf");
  if (!fs.existsSync(shpPath) || !fs.existsSync(dbfPath)) {
    console.error("Shapefile de TI não encontrado em:", SHP_DIR);
    console.error("Baixe os dados em scripts/data/funai/ e descompacte antes de rodar.");
    process.exit(1);
  }

  const source = await open(shpPath, dbfPath, { encoding: "latin1" });

  const tis = [];
  const slugUsed = new Map();

  while (true) {
    const res = await source.read();
    if (res.done) break;
    const p = res.value.properties || {};

    const nome = String(p.terrai_nom || "").trim();
    if (nome === "") continue;

    const codigo = String(p.terrai_cod ?? "").trim();
    let slug = slugify(nome) || `ti-${codigo}`;
    if (slugUsed.has(slug)) {
      slug = `${slug}-${String(p.uf_sigla || "").toLowerCase()}`;
    }
    if (slugUsed.has(slug)) {
      slug = `${slug}-${codigo}`;
    }
    slugUsed.set(slug, true);

    tis.push({
      id: codigo,
      codigo,
      nome,
      slug,
      etnias: String(p.etnia_nome || "").trim(),
      municipios: String(p.municipio_ || "").trim(),
      uf: String(p.uf_sigla || "").trim(),
      area_ha: toNumber(p.superficie),
      situacao: String(p.fase_ti || "").trim(),
      modalidade: String(p.modalidade || "").trim(),
      cr: String(p.cr || "").trim(),
      faixa_fronteira: String(p.faixa_fron || "").trim(),
      dominio_uniao: String(p.dominio_un || "").trim(),
      data_atualizacao: String(p.data_atual || "").trim(),
    });
  }

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(tis, null, 2), "utf8");

  console.log("Terras Indígenas processadas:", tis.length);
  console.log("Slugs duplicados resolvidos:", slugUsed.size - tis.length);
  console.log("Saída:", path.relative(process.cwd(), OUT_JSON));
}

main().catch((e) => {
  console.error("ERRO", e);
  process.exit(1);
});

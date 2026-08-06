const fs = require("fs");
const path = require("path");

const SRC_CSV = path.join(__dirname, "..", "data", "cnuc", "cnuc_2026_03.csv");
const OUT_JSON = path.join(__dirname, "..", "..", "src", "data", "ucs.json");

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
  const str = String(value).trim();
  if (str === "" || /sem informa/i.test(str)) return null;
  const num = parseFloat(str.replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

function toInt(value) {
  const num = toNumber(value);
  return num === null ? null : Math.round(num);
}

const raw = fs.readFileSync(SRC_CSV, "latin1");
const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== "");

const header = lines[0].split(";").map((h) => h.trim());
const col = {};
header.forEach((name, index) => {
  col[name] = index;
});

const fields = [
  "ID_UC",
  "Código UC",
  "Nome da UC",
  "Esfera Administrativa",
  "Categoria de Manejo",
  "Categoria IUCN",
  "UF",
  "Ano de Criação",
  "Ato Legal de Criação",
  "Municípios Abrangidos",
  "Plano de Manejo",
  "Conselho Gestor",
  "Órgão Gestor",
  "Área soma biomas",
  "Área Ato Legal de Criação",
  "Bioma declarado",
  "Grupo",
  "Código WDPA",
];

const missing = fields.filter((f) => col[f] === undefined);
if (missing.length > 0) {
  console.error("Colunas ausentes no CSV:", missing);
  console.error("Header encontrado:", header.join(" | "));
  process.exit(1);
}

const ucs = [];
const slugUsed = new Map();

for (let i = 1; i < lines.length; i++) {
  const cells = lines[i].split(";");
  const get = (name) => (cells[col[name]] !== undefined ? cells[col[name]].trim() : "");

  const nome = get("Nome da UC");
  if (nome === "") continue;

  const id = get("ID_UC");
  let slug = slugify(nome) || `uc-${id}`;
  if (slugUsed.has(slug)) {
    slug = `${slug}-${get("UF").toLowerCase()}`;
  }
  if (slugUsed.has(slug)) {
    slug = `${slug}-${id}`;
  }
  slugUsed.set(slug, true);

  const area =
    toNumber(get("Área soma biomas")) ?? toNumber(get("Área Ato Legal de Criação"));

  ucs.push({
    id,
    codigo: get("Código UC"),
    nome,
    slug,
    esfera: get("Esfera Administrativa"),
    categoria: get("Categoria de Manejo"),
    categoria_iuuc: get("Categoria IUCN"),
    uf: get("UF"),
    ano_criacao: toInt(get("Ano de Criação")),
    ato_legal: get("Ato Legal de Criação"),
    municipios: get("Municípios Abrangidos"),
    plano_manejo: get("Plano de Manejo"),
    conselho_gestor: get("Conselho Gestor"),
    orgao_gestor: get("Órgão Gestor"),
    area_ha: area,
    bioma: get("Bioma declarado"),
    grupo: get("Grupo"),
    codigo_wdpa: get("Código WDPA"),
  });
}

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(ucs, null, 2), "utf8");

console.log("UCs processadas:", ucs.length);
console.log("Slugs duplicados resolvidos:", slugUsed.size - ucs.length);
console.log("Saída:", path.relative(process.cwd(), OUT_JSON));

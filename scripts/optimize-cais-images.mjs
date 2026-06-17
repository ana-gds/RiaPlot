// Otimiza as fotos dos cais em src/assets/cais/.
//
// Redimensiona para uma largura máxima razoável (as fotos são mostradas em
// cartões de ~400 px e no detalhe a ~640 px; 1600 px chega para ecrãs retina) e
// recomprime, MANTENDO o formato e o nome de cada ficheiro — por isso nenhum
// código precisa de mudar. Só reescreve um ficheiro se o resultado for menor,
// para nunca piorar nada. Os originais ficam sempre no histórico do git.
//
// Uso:  node scripts/optimize-cais-images.mjs
// (corre automaticamente o sharp; instala-o com `npm install -D sharp`.)

import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "assets", "cais");
const MAX_WIDTH = 1600;
const QUALITY = 80;

const fmt = (bytes) => `${(bytes / 1024).toFixed(0)} KB`.padStart(8);

async function reencode(buf, ext) {
  let img = sharp(buf).rotate(); // respeita a orientação EXIF antes de a perder
  const meta = await img.metadata();
  if (meta.width > MAX_WIDTH) img = img.resize({ width: MAX_WIDTH, withoutEnlargement: true });

  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return img.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    case ".png":
      // Foto em PNG: o redimensionamento é o que mais poupa; a paleta/compressão
      // máxima ajudam sem perder o formato.
      return img.png({ quality: QUALITY, compressionLevel: 9, palette: true }).toBuffer();
    case ".webp":
      return img.webp({ quality: QUALITY }).toBuffer();
    default:
      return null;
  }
}

const files = (await readdir(DIR)).filter((f) =>
  [".jpg", ".jpeg", ".png", ".webp"].includes(extname(f).toLowerCase()),
);

let before = 0;
let after = 0;
let changed = 0;

for (const file of files) {
  const path = join(DIR, file);
  const orig = await readFile(path);
  const out = await reencode(orig, extname(file).toLowerCase());
  before += orig.length;

  if (out && out.length < orig.length) {
    await writeFile(path, out);
    after += out.length;
    changed++;
    console.log(`✓ ${file.padEnd(34)} ${fmt(orig.length)} → ${fmt(out.length)}`);
  } else {
    after += orig.length;
    console.log(`· ${file.padEnd(34)} ${fmt(orig.length)} (sem alteração)`);
  }
}

console.log(
  `\n${changed}/${files.length} ficheiros otimizados.  Total: ${fmt(before)} → ${fmt(after)} ` +
    `(−${(((before - after) / before) * 100).toFixed(0)}%)`,
);

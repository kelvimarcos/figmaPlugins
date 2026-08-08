// Embute o logo (assets/logo.svg) dentro do ui.html, no <template id="logo">.
//
// O arquivo original tem ~295 KB porque cada letra do anel "COPYWRITER" é um
// path com coordenadas de 3 casas decimais. Como o logo é exibido a 26px, dá
// para enxugar sem diferença visível:
//
//   1. remove o anel interno de opacidade 0.15 (invisível nesse tamanho);
//   2. arredonda as coordenadas para inteiro — o logo tem 1080 unidades de
//      largura para 26px de tela, ou seja ~41 unidades por pixel;
//   3. colapsa espaços em branco.
//
// Rode com `npm run logo` sempre que trocar o arquivo do logo.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = path.join(root, 'assets', 'logo.svg');
const target = path.join(root, 'src', 'frontend', 'ui.html');

const original = fs.readFileSync(source, 'utf8');
let svg = original;

// 1. anel decorativo interno
const faint = svg.indexOf('<g opacity="0.15">');
if (faint !== -1) {
  const end = svg.indexOf('</g>', faint);
  if (end !== -1) svg = svg.slice(0, faint) + svg.slice(end + 4);
}

// 2. precisão das coordenadas
svg = svg.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n))));

// 3. espaços supérfluos
svg = svg.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();

// A largura/altura fixas dariam 1080px; o viewBox sozinho deixa o CSS mandar.
svg = svg.replace(/^<svg[^>]*>/, (tag) =>
  tag.replace(/\s(width|height)="[^"]*"/g, '').replace('<svg', '<svg aria-hidden="true"')
);

// O bloco só é reconhecido no fim do arquivo, na própria linha. Ancorar assim
// evita casar com uma menção ao marcador em comentário no meio do HTML — o que
// apagaria tudo entre a menção e o fim do arquivo.
const html = fs.readFileSync(target, 'utf8');
const marker = /\n<template id="logo">[\s\S]*<\/template>\s*$/;
if (!marker.test(html)) {
  console.error(
    'ui.html precisa terminar com uma linha <template id="logo">…</template>. Nada foi alterado.'
  );
  process.exit(1);
}

const updated = html.replace(marker, () => `\n<template id="logo">${svg}</template>\n`);

// Rede de segurança: o corpo antes do bloco não pode encolher.
const bodyBefore = html.slice(0, html.search(marker));
const bodyAfter = updated.slice(0, updated.search(marker));
if (bodyAfter.length !== bodyBefore.length) {
  console.error('A substituição alteraria o restante do ui.html. Abortado.');
  process.exit(1);
}

fs.writeFileSync(target, updated);

const kb = (value) => `${(value / 1024).toFixed(1)} KB`;
console.log(`logo embutido: ${kb(original.length)} → ${kb(svg.length)}`);

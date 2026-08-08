# Publicar o Kivo na Figma Community

## Antes de tudo: esvazie as chaves embutidas

No topo do `<script>` do `ui.html` existe o bloco `CHAVES_EMBUTIDAS`. Se você
colou a sua chave ali para uso pessoal, **apague antes de publicar**: o `ui.html`
viaja dentro do pacote e qualquer pessoa consegue extrair a chave — o consumo
cairia na sua fatura.

Com as duas linhas vazias, o campo de chave volta a aparecer no painel de
configurações e cada usuário usa a própria.

> O provedor "Google grátis (não-oficial)", que usava o endpoint interno do
> Google Tradutor, já foi removido — era o principal motivo de reprovação.

## 1. Preparar os arquivos

```bash
npm run build
npm run lint
```

Confira que o `code.js` gerado está atualizado — é ele que vai no pacote, não o
`code.ts`. Rode o [TESTING.md](TESTING.md) inteiro antes de submeter: a revisão
reprova plugin que quebra no caminho básico.

## 2. Arte do listing

Prepare no próprio Figma, exportando da sua logo:

| Peça | Tamanho | Onde aparece |
| --- | --- | --- |
| Ícone | 128×128 px | lista de plugins e menu (é este que substitui o `</>`) |
| Capa | 1920×960 px | topo da página do plugin na Community |
| Imagens extras | 1920×960 px | carrossel — use prints das duas abas em uso |

Para o ícone, exporte o quadrado laranja com o "K". O anel "COPYWRITER" fica
ilegível nesse tamanho, então vale uma versão simplificada.

## 3. Texto do listing

- **Nome** — "Kivo". Não pode conter "Figma" no nome.
- **Descrição** — diga logo de cara que o texto é enviado a um serviço externo
  escolhido pelo usuário, e que DeepL/Google Cloud exigem chave própria. Ser
  explícito sobre isso acelera a revisão.
- **Tags** — translate, translation, localization, i18n, copy, text.
- **Política de privacidade** — obrigatória, porque o plugin envia conteúdo do
  documento a terceiros. Publique o [PRIVACY.md](PRIVACY.md) numa URL pública
  (GitHub Pages, Notion público, gist) e cole o link no campo do listing.
- **Support contact** — um e-mail que você acompanhe.

## 4. Publicar

No Figma: menu → **Plugins → Development → Kivo → Publish new release**.
Preencha o formulário, envie a arte e submeta.

A revisão costuma levar de alguns dias a duas semanas. Se reprovar, o Figma
manda o motivo por e-mail e você corrige e ressubmete — não recomeça do zero.

Você pode publicar **como rascunho/privado** (visível só por link) para testar o
fluxo antes de abrir ao público. Recomendo fazer isso primeiro.

## 5. O que a revisão costuma cobrar

- plugin que quebra ou não faz o que a descrição promete;
- uso de API de terceiros sem autorização;
- coleta de dados sem política de privacidade declarada;
- arte de listing enganosa ou marca de terceiros sem permissão;
- nome contendo "Figma".

## Depois de publicar

Cada nova versão passa por revisão de novo. Como o `code.js` é gerado, lembre de
rodar `npm run build` antes de cada release — publicar um `code.js` velho é o
erro mais fácil de cometer.

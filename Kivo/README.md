# Kivo

Plugin do Figma para traduzir textos direto do canvas — camadas em lote ou um
texto avulso digitado na própria janela do plugin.

## O que ele faz

**Aba "Traduzir em lote"** — traduz camadas de texto em lote:

1. Escolha o idioma **De** (ou "Detectar automaticamente") e o **Para**.
2. Escolha o que traduzir: o que está selecionado ou a página atual.
3. **Escanear e traduzir** monta a lista de original → tradução.
4. Desmarque o que não quiser, clique num item para localizá-lo no canvas, e
   depois em **Aplicar**.
5. **Desfazer** devolve os textos originais.

**Aba "Texto livre"** — cole ou digite um texto (ou puxe da seleção com **Pegar
da seleção**), traduza, e use **Copiar** ou **Colar no Figma**, que substitui o
conteúdo das camadas selecionadas ou cria uma camada nova no centro da tela.

**Aba "Gerador de texto"** — gera texto de preenchimento em latim. Escolha a
quantidade (5 por padrão) e a unidade — parágrafos, frases ou palavras — e use
**Copiar** ou **Preencher seleção**, que substitui o conteúdo das camadas de
texto selecionadas. É offline: não chama API nenhuma nem consome cota.

**Ler texto da imagem** — selecione uma imagem no canvas e o plugin extrai o
texto dela com o Google Cloud Vision e já traduz. Usa a chave do Google Cloud
(a mesma da tradução), com a **Cloud Vision API** ativada no mesmo projeto.

### Detalhes que importam

- **Só camadas de texto.** Texto dentro de imagem, texto vetorizado (outline) e
  nomes de camada não são tocados.
- **Textos repetidos** são traduzidos uma vez só e reaproveitados.
- **Fontes mistas** num mesmo texto são todas carregadas antes da escrita.
- **Camadas com fonte não instalada** são puladas com aviso, sem travar o lote.
- **Desfazer funciona entre sessões**: o original fica no `pluginData` da própria
  camada, então feche e reabra o plugin que ele ainda restaura.
- Ocultos, travados e textos só com números podem ser ignorados pelos chips.

## Provedores de tradução

| Provedor | Chave | Observações |
| --- | --- | --- |
| DeepL | sim | Melhor qualidade. Chaves terminadas em `:fx` usam a API Free. |
| Google Cloud | sim | API oficial (Translation v2), cobrada por caractere. |
| MyMemory | não | Gratuito; exige idioma de origem explícito. É memória colaborativa — não use com conteúdo confidencial. |

O provedor e a chave ficam no painel de configurações (ícone de engrenagem no
cabeçalho). Cada provedor guarda a própria chave, então dá para alternar sem
redigitar, e as preferências ficam em `figma.clientStorage`, na sua máquina. Os domínios
usados estão declarados em `networkAccess` no `manifest.json`.

## Janela e tema

A janela é redimensionável pela alça no canto inferior direito (mínimo 300×420,
máximo 1400×1200) e o tamanho volta na próxima abertura. O layout se adapta:

- **até 359px** — os pares de campos viram pilha e o rodapé quebra em duas linhas;
- **440px** (padrão) — duas colunas de campos;
- **a partir de 620px** — original e tradução lado a lado, na lista e no texto livre;
- **a partir de 900px** — o conteúdo para de esticar em 880px e centraliza.

O botão no cabeçalho alterna entre seguir o tema do Figma, claro e escuro.

## Desenvolvimento

```bash
npm install
npm run build
```

| Comando | O que faz |
| --- | --- |
| `npm run build` | compila `code.ts` → `code.js` |
| `npm run watch` | recompila a cada alteração |
| `npm run lint` | ESLint com as regras oficiais da Figma |
| `npm run logo` | reembute o logo em `ui.html` a partir de `img logo/svg.svg` |

### Arquivos

| Arquivo | Papel |
| --- | --- |
| `code.ts` → `code.js` | roda na sandbox: acessa o documento, **sem** acesso à rede |
| `ui.html` | interface no iframe; é aqui que as chamadas HTTP acontecem |
| `manifest.json` | declara a UI e os domínios permitidos |
| `tools/embed-logo.js` | otimiza e injeta o logo no `<template>` no fim do `ui.html` |
| `img logo/` | arte da marca (`svg.svg` é a fonte do ícone do cabeçalho) |

O logo é otimizado de 288 KB para 46 KB: o anel interno de 15% de opacidade é
removido (invisível a 26px) e as coordenadas são arredondadas.

### Carregar no Figma

Menu **Plugins → Development → Import plugin from manifest…** e aponte para o
`manifest.json` desta pasta. Depois disso, cada execução relê os arquivos do
disco — basta **Ctrl+Alt+P** para rodar de novo.

Erros da sandbox aparecem em **Plugins → Development → Open console**.

## Documentação

- [TESTING.md](TESTING.md) — roteiro de teste dentro do Figma
- [PUBLISHING.md](PUBLISHING.md) — como publicar na Figma Community
- [PRIVACY.md](PRIVACY.md) — política de privacidade para o listing

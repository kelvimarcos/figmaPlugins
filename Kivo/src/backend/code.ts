// Kivo — tradução de textos direto no Figma.
//
// Este arquivo roda na sandbox do plugin: tem acesso ao documento via `figma`,
// mas NÃO tem acesso à rede. As chamadas HTTP acontecem em `ui.html`, que roda
// num iframe com ambiente de browser completo. A comunicação é por mensagens.

// As chaves guardam o nome antigo de propósito: `ORIGINAL_KEY` é o que permite
// desfazer camadas já traduzidas, e as outras duas guardam preferências e
// tamanho da janela. Renomear apagaria tudo isso de quem já usou o plugin.
const ORIGINAL_KEY = 'ktranslatey:original';
const SETTINGS_KEY = 'ktranslatey:settings';
const SIZE_KEY = 'ktranslatey:size';

const DEFAULT_SIZE = { w: 440, h: 690 };
const MIN_SIZE = { w: 300, h: 420 };
const MAX_SIZE = { w: 1400, h: 1200 };

// ---------------------------------------------------------------------------
// Idioma
//
// A UI é quem escolhe o idioma (botão do globo no cabeçalho) e avisa a sandbox
// pela mensagem `ui-lang`. Aqui ficam só os textos que aparecem fora do iframe:
// os toasts do Figma e as mensagens que voltam para a lista de resultados.
// Formas com "|" são singular|plural, escolhidas por `n`.
// ---------------------------------------------------------------------------

const FALLBACK_LANG = 'pt-BR';

const STRINGS: Record<string, Record<string, string>> = {
  'pt-BR': {
    notifyApplied: 'Kivo: {n} texto traduzido.|Kivo: {n} textos traduzidos.',
    notifyRestored: 'Kivo: {n} texto restaurado.|Kivo: {n} textos restaurados.',
    warnNothingSelected: 'Nada selecionado no canvas.',
    warnMissingFonts:
      '{n} texto usa fonte não instalada e será ignorado na aplicação.'
      + '|{n} textos usam fontes não instaladas e serão ignorados na aplicação.',
    insertPasted: 'Texto colado em {n} camada.|Texto colado em {n} camadas.',
    insertCreated: 'Nova camada de texto criada.',
    errNodeMissing: 'Nó {id} não encontrado.',
    errMissingFont: '"{text}": fonte não instalada.',
    ocrNoSelection: 'Selecione a imagem que você quer ler.',
    ocrTooBig: 'Imagem grande demais para ler. Recorte um pedaço e tente de novo.',
  },
  en: {
    notifyApplied: 'Kivo: {n} text translated.|Kivo: {n} texts translated.',
    notifyRestored: 'Kivo: {n} text restored.|Kivo: {n} texts restored.',
    warnNothingSelected: 'Nothing selected on the canvas.',
    warnMissingFonts:
      '{n} text uses a font that is not installed and will be skipped.'
      + '|{n} texts use fonts that are not installed and will be skipped.',
    insertPasted: 'Text pasted into {n} layer.|Text pasted into {n} layers.',
    insertCreated: 'New text layer created.',
    errNodeMissing: 'Node {id} not found.',
    errMissingFont: '"{text}": font not installed.',
    ocrNoSelection: 'Select the image you want to read.',
    ocrTooBig: 'Image too large to read. Crop a section and try again.',
  },
  es: {
    notifyApplied: 'Kivo: {n} texto traducido.|Kivo: {n} textos traducidos.',
    notifyRestored: 'Kivo: {n} texto restaurado.|Kivo: {n} textos restaurados.',
    warnNothingSelected: 'No hay nada seleccionado en el lienzo.',
    warnMissingFonts:
      '{n} texto usa una fuente no instalada y se omitirá.'
      + '|{n} textos usan fuentes no instaladas y se omitirán.',
    insertPasted: 'Texto pegado en {n} capa.|Texto pegado en {n} capas.',
    insertCreated: 'Nueva capa de texto creada.',
    errNodeMissing: 'No se encontró el nodo {id}.',
    errMissingFont: '"{text}": fuente no instalada.',
    ocrNoSelection: 'Selecciona la imagen que quieres leer.',
    ocrTooBig: 'Imagen demasiado grande para leerla. Recorta un trozo e inténtalo de nuevo.',
  },
  fr: {
    notifyApplied: 'Kivo : {n} texte traduit.|Kivo : {n} textes traduits.',
    notifyRestored: 'Kivo : {n} texte restauré.|Kivo : {n} textes restaurés.',
    warnNothingSelected: 'Rien de sélectionné sur le canevas.',
    warnMissingFonts:
      '{n} texte utilise une police non installée et sera ignoré.'
      + '|{n} textes utilisent des polices non installées et seront ignorés.',
    insertPasted: 'Texte collé dans {n} calque.|Texte collé dans {n} calques.',
    insertCreated: 'Nouveau calque de texte créé.',
    errNodeMissing: 'Nœud {id} introuvable.',
    errMissingFont: '« {text} » : police non installée.',
    ocrNoSelection: 'Sélectionnez l’image à lire.',
    ocrTooBig: 'Image trop grande à lire. Recadrez une partie et réessayez.',
  },
  de: {
    notifyApplied: 'Kivo: {n} Text übersetzt.|Kivo: {n} Texte übersetzt.',
    notifyRestored: 'Kivo: {n} Text wiederhergestellt.|Kivo: {n} Texte wiederhergestellt.',
    warnNothingSelected: 'Nichts auf der Canvas ausgewählt.',
    warnMissingFonts:
      '{n} Text verwendet eine nicht installierte Schrift und wird übersprungen.'
      + '|{n} Texte verwenden nicht installierte Schriften und werden übersprungen.',
    insertPasted: 'Text in {n} Ebene eingefügt.|Text in {n} Ebenen eingefügt.',
    insertCreated: 'Neue Textebene erstellt.',
    errNodeMissing: 'Knoten {id} nicht gefunden.',
    errMissingFont: '"{text}": Schrift nicht installiert.',
    ocrNoSelection: 'Wähle das Bild aus, das gelesen werden soll.',
    ocrTooBig: 'Bild zu groß zum Lesen. Schneide einen Ausschnitt zu und versuche es erneut.',
  },
};

let uiLang = FALLBACK_LANG;

function t(key: string, params?: Record<string, string | number>): string {
  const dict = STRINGS[uiLang] || STRINGS[FALLBACK_LANG];
  let text = dict[key] !== undefined ? dict[key] : STRINGS[FALLBACK_LANG][key];
  if (text === undefined) return key;
  if (text.indexOf('|') !== -1) {
    const forms = text.split('|');
    text = params && Number(params.n) === 1 ? forms[0] : forms[1];
  }
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (whole, name: string) =>
    params[name] === undefined ? whole : String(params[name])
  );
}

type Scope = 'selection' | 'page';

interface ScanOptions {
  scope: Scope;
  skipHidden: boolean;
  skipLocked: boolean;
}

interface ScanItem {
  id: string;
  text: string;
  page: string;
  translated: boolean;
}

interface ApplyItem {
  id: string;
  text: string;
}

figma.showUI(__html__, { ...toWidthHeight(DEFAULT_SIZE), themeColors: true });

// A janela do plugin não é redimensionável por padrão: a UI tem uma alça no
// canto que manda mensagens de `resize`. O último tamanho volta na abertura.
figma.clientStorage
  .getAsync(SIZE_KEY)
  .then((size) => {
    if (size) figma.ui.resize(clamp(size.w, MIN_SIZE.w, MAX_SIZE.w), clamp(size.h, MIN_SIZE.h, MAX_SIZE.h));
  })
  .catch(() => {
    /* tamanho salvo é opcional */
  });

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function toWidthHeight(size: { w: number; h: number }): { width: number; height: number } {
  return { width: size.w, height: size.h };
}

figma.ui.onmessage = async (msg: { type: string; [key: string]: unknown }) => {
  try {
    switch (msg.type) {
      case 'ui-ready': {
        const settings = await figma.clientStorage.getAsync(SETTINGS_KEY);
        figma.ui.postMessage({
          type: 'init',
          settings: settings || null,
          hasSelection: figma.currentPage.selection.length > 0,
        });
        break;
      }

      case 'ui-lang': {
        const lang = msg.lang as string;
        uiLang = STRINGS[lang] ? lang : FALLBACK_LANG;
        break;
      }

      case 'resize': {
        const size = msg.size as { w: number; h: number };
        const width = clamp(size.w, MIN_SIZE.w, MAX_SIZE.w);
        const height = clamp(size.h, MIN_SIZE.h, MAX_SIZE.h);
        figma.ui.resize(width, height);
        if (msg.persist) await figma.clientStorage.setAsync(SIZE_KEY, { w: width, h: height });
        break;
      }

      case 'save-settings': {
        await figma.clientStorage.setAsync(SETTINGS_KEY, msg.settings);
        break;
      }

      case 'scan': {
        const options = msg.options as ScanOptions;
        const { nodes, warnings } = await collectTextNodes(options);
        const items: ScanItem[] = nodes.map((node) => ({
          id: node.id,
          text: node.characters,
          page: pageNameOf(node),
          translated: node.getPluginData(ORIGINAL_KEY) !== '',
        }));
        figma.ui.postMessage({ type: 'scan-result', items, warnings });
        break;
      }

      case 'apply': {
        const result = await applyTranslations(msg.items as ApplyItem[]);
        figma.ui.postMessage({ type: 'apply-done', ...result });
        figma.notify(t('notifyApplied', { n: result.applied }));
        break;
      }

      case 'undo': {
        const result = await undoTranslations(msg.ids as string[]);
        figma.ui.postMessage({ type: 'undo-done', ...result });
        figma.notify(t('notifyRestored', { n: result.restored }));
        break;
      }

      case 'get-selection-text': {
        const text = figma.currentPage.selection
          .filter((node): node is TextNode => node.type === 'TEXT')
          .map((node) => node.characters)
          .join('\n');
        figma.ui.postMessage({ type: 'selection-text', text });
        break;
      }

      case 'get-selection-image': {
        const result = await exportSelectionImage();
        figma.ui.postMessage({ type: 'selection-image', ...result });
        break;
      }

      case 'insert-text': {
        const result = await insertText(msg.text as string);
        figma.ui.postMessage({ type: 'insert-done', ...result });
        figma.notify(result.message);
        break;
      }

      case 'select-node': {
        await focusNode(msg.id as string);
        break;
      }

      case 'close': {
        figma.closePlugin();
        break;
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({ type: 'error', message });
  }
};

figma.on('selectionchange', () => {
  figma.ui.postMessage({
    type: 'selection-changed',
    hasSelection: figma.currentPage.selection.length > 0,
    count: figma.currentPage.selection.length,
  });
});

// ---------------------------------------------------------------------------
// Coleta
// ---------------------------------------------------------------------------

async function collectTextNodes(
  options: ScanOptions
): Promise<{ nodes: TextNode[]; warnings: string[] }> {
  const warnings: string[] = [];
  const found: TextNode[] = [];
  const seen = new Set<string>();

  // Otimização recomendada pela Figma: quando textos ocultos não interessam,
  // a travessia nem desce para dentro de instâncias invisíveis.
  figma.skipInvisibleInstanceChildren = options.skipHidden;

  const push = (node: TextNode) => {
    if (seen.has(node.id)) return;
    if (options.skipHidden && !isEffectivelyVisible(node)) return;
    if (options.skipLocked && isEffectivelyLocked(node)) return;
    if (node.characters.trim() === '') return;
    seen.add(node.id);
    found.push(node);
  };

  if (options.scope === 'selection') {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      warnings.push(t('warnNothingSelected'));
    }
    for (const node of selection) {
      if (node.type === 'TEXT') {
        push(node);
      } else if ('findAllWithCriteria' in node) {
        for (const text of node.findAllWithCriteria({ types: ['TEXT'] })) push(text);
      }
    }
  } else {
    for (const text of figma.currentPage.findAllWithCriteria({ types: ['TEXT'] })) push(text);
  }

  const missingFont = found.filter((node) => node.hasMissingFont).length;
  if (missingFont > 0) {
    warnings.push(t('warnMissingFonts', { n: missingFont }));
  }

  return { nodes: found, warnings };
}

function isEffectivelyVisible(node: SceneNode): boolean {
  let current: BaseNode | null = node;
  while (current && current.type !== 'PAGE' && current.type !== 'DOCUMENT') {
    if ('visible' in current && !current.visible) return false;
    current = current.parent;
  }
  return true;
}

function isEffectivelyLocked(node: SceneNode): boolean {
  let current: BaseNode | null = node;
  while (current && current.type !== 'PAGE' && current.type !== 'DOCUMENT') {
    if ('locked' in current && current.locked) return true;
    current = current.parent;
  }
  return false;
}

function pageNameOf(node: BaseNode): string {
  let current: BaseNode | null = node;
  while (current && current.type !== 'PAGE') current = current.parent;
  return current && current.type === 'PAGE' ? current.name : '—';
}

// ---------------------------------------------------------------------------
// Aplicação e desfazer
// ---------------------------------------------------------------------------

async function applyTranslations(
  items: ApplyItem[]
): Promise<{ applied: number; errors: string[] }> {
  let applied = 0;
  const errors: string[] = [];

  for (const item of items) {
    const node = await figma.getNodeByIdAsync(item.id);
    if (!node || node.type !== 'TEXT') {
      errors.push(t('errNodeMissing', { id: item.id }));
      continue;
    }

    if (node.hasMissingFont) {
      errors.push(t('errMissingFont', { text: preview(node.characters) }));
      continue;
    }

    try {
      await loadFontsOf(node);
      if (node.getPluginData(ORIGINAL_KEY) === '') {
        node.setPluginData(ORIGINAL_KEY, node.characters);
      }
      node.characters = item.text;
      applied++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`"${preview(node.characters)}": ${message}`);
    }
  }

  return { applied, errors };
}

async function undoTranslations(ids: string[]): Promise<{ restored: number; errors: string[] }> {
  let restored = 0;
  const errors: string[] = [];

  for (const id of ids) {
    const node = await figma.getNodeByIdAsync(id);
    if (!node || node.type !== 'TEXT') continue;

    const original = node.getPluginData(ORIGINAL_KEY);
    if (original === '') continue;

    try {
      await loadFontsOf(node);
      node.characters = original;
      node.setPluginData(ORIGINAL_KEY, '');
      restored++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`"${preview(node.characters)}": ${message}`);
    }
  }

  return { restored, errors };
}

// ---------------------------------------------------------------------------
// Leitura de imagem (OCR)
//
// A sandbox só exporta os pixels; quem chama o Google Cloud Vision é a UI, que
// é o lado com rede. Textos pequenos ganham nitidez ao exportar em 2×, mas o
// PNG cresce ao quadrado — por isso a escala cai em imagens já grandes.
// ---------------------------------------------------------------------------

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

async function exportSelectionImage(): Promise<{
  bytes: Uint8Array | null;
  error: string | null;
}> {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) return { bytes: null, error: t('ocrNoSelection') };

  // Prefere um nó que tenha mesmo imagem no preenchimento; se não houver, vale
  // o que estiver selecionado — um frame com um print dentro, por exemplo.
  const target = selection.filter(hasImageFill)[0] || selection[0];
  const width = 'width' in target ? target.width : 0;
  const scale = width > 0 && width < 800 ? 2 : 1;

  const bytes = await target.exportAsync({
    format: 'PNG',
    constraint: { type: 'SCALE', value: scale },
  });

  if (bytes.length > MAX_IMAGE_BYTES) return { bytes: null, error: t('ocrTooBig') };
  return { bytes, error: null };
}

function hasImageFill(node: SceneNode): boolean {
  if (!('fills' in node)) return false;
  const fills = node.fills;
  if (fills === figma.mixed) return false;
  return fills.some((fill) => fill.type === 'IMAGE' && fill.visible !== false);
}

// Um nó de texto pode misturar várias fontes ao longo do conteúdo; todas
// precisam estar carregadas antes de escrever em `characters`.
async function loadFontsOf(node: TextNode): Promise<void> {
  const length = node.characters.length;
  const fonts: FontName[] =
    length > 0 ? node.getRangeAllFontNames(0, length) : [node.fontName as FontName];
  await Promise.all(fonts.map((font) => figma.loadFontAsync(font)));
}

// Cola o texto traduzido: substitui o conteúdo das camadas de texto
// selecionadas ou, se não houver seleção, cria uma nova camada no centro
// da viewport.
async function insertText(text: string): Promise<{ message: string }> {
  const selection = figma.currentPage.selection.filter(
    (node): node is TextNode => node.type === 'TEXT'
  );

  if (selection.length > 0) {
    let applied = 0;
    for (const node of selection) {
      if (node.hasMissingFont) continue;
      await loadFontsOf(node);
      if (node.getPluginData(ORIGINAL_KEY) === '') {
        node.setPluginData(ORIGINAL_KEY, node.characters);
      }
      node.characters = text;
      applied++;
    }
    return { message: t('insertPasted', { n: applied }) };
  }

  const font: FontName = { family: 'Inter', style: 'Regular' };
  await figma.loadFontAsync(font);
  const node = figma.createText();
  node.fontName = font;
  node.characters = text;
  node.x = figma.viewport.center.x - node.width / 2;
  node.y = figma.viewport.center.y - node.height / 2;
  figma.currentPage.appendChild(node);
  figma.currentPage.selection = [node];
  figma.viewport.scrollAndZoomIntoView([node]);
  return { message: t('insertCreated') };
}

async function focusNode(id: string): Promise<void> {
  const node = await figma.getNodeByIdAsync(id);
  if (!node || node.type !== 'TEXT') return;

  const page = pageOf(node);
  if (page && page !== figma.currentPage) {
    await figma.setCurrentPageAsync(page);
  }
  figma.currentPage.selection = [node];
  figma.viewport.scrollAndZoomIntoView([node]);
}

function pageOf(node: BaseNode): PageNode | null {
  let current: BaseNode | null = node;
  while (current && current.type !== 'PAGE') current = current.parent;
  return current && current.type === 'PAGE' ? current : null;
}

function preview(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > 32 ? `${flat.slice(0, 32)}…` : flat;
}

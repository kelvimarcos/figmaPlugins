# Roteiro de teste — Kivo

O que ainda não foi verificado é a metade que conversa com o documento:
varredura, carregamento de fontes, aplicar e desfazer. Este roteiro cobre isso.

## 0. Preparar

```bash
npm run build
```

No Figma: **Ctrl+Alt+P** re-executa o último plugin (ou menu → Plugins →
Development → Kivo).

Deixe o console aberto o tempo todo — é onde os erros da sandbox aparecem com
stack: menu → **Plugins → Development → Open console**.

## 1. Montar um arquivo de teste

Num arquivo novo, crie um frame com camadas de texto que cubram os casos-limite.
Vale ~10 minutos e é o que faz o teste valer:

| Camada | Como criar | Serve para testar |
| --- | --- | --- |
| Texto simples | "Start your free trial" | caminho feliz |
| Texto repetido | o mesmo texto em duas camadas | deduplicação (1 requisição só) |
| Fontes mistas | um texto com metade em Bold | `getRangeAllFontNames` |
| Texto oculto | camada com o olho fechado | "Ignorar ocultos" |
| Camada travada | cadeado ligado | "Ignorar travados" |
| Só números | "2024" ou "R$ 49,90" | "Ignorar só-números" |
| Dentro de instância | um botão de componente com label | escrita em instância |
| Texto vazio | camada de texto sem conteúdo | deve ser ignorada |

## 2. Varredura

- [ ] **Seleção sem nada selecionado** → aviso "Nada selecionado no canvas."
- [ ] Selecione o frame → **Escanear e traduzir** lista todos os textos dele
- [ ] Os textos ocultos/travados/só-números **não** aparecem com os chips ligados
- [ ] Desligue "Ignorar ocultos" e escaneie de novo → o texto oculto aparece
- [ ] "O que traduzir" = **Página atual** → pega tudo da página, mesmo fora do frame
- [ ] O texto repetido aparece **duas vezes na lista** mas a barra de progresso
      conta **uma tradução só**

## 3. Tradução

- [ ] A lista mostra original em cinza e tradução abaixo, com a barra laranja
- [ ] Clicar num item **seleciona e enquadra** a camada no canvas
- [ ] Clicar num item de outra página **troca de página** antes de enquadrar
- [ ] Trocar para **DeepL** ou **Google Cloud** sem chave → bloqueia com aviso
- [ ] Com chave válida → traduz (a chave fica salva ao reabrir o plugin)
- [ ] Trocar de provedor e voltar → cada um mantém a própria chave
- [ ] **MyMemory** com "Detectar automaticamente" → bloqueia pedindo o idioma

## 4. Aplicar e desfazer — o mais importante

- [ ] **Aplicar** troca o texto no canvas e o item fica com fundo laranja claro
- [ ] O texto de **fontes mistas** aplica sem erro e mantém a primeira fonte
- [ ] O texto **dentro da instância** aplica (ou falha com mensagem clara, se o
      componente travar a propriedade)
- [ ] Desmarcar alguns itens antes de aplicar → só os marcados mudam
- [ ] **Desfazer** devolve os textos originais
- [ ] Feche o plugin, reabra, escaneie de novo e clique em **Desfazer** → ainda
      restaura (o original fica no `pluginData` da camada)
- [ ] **Ctrl+Z** do próprio Figma também reverte

Se alguma camada usar fonte não instalada, ela deve ser **pulada com aviso**, não
travar o resto.

## 5. Janela e tema

- [ ] Arrastar a alça no canto inferior direito redimensiona a janela
- [ ] Fechar e reabrir → volta no tamanho que ficou
- [ ] Encolher abaixo de ~360px → os campos viram pilha, nada corta
- [ ] Alargar acima de ~620px → original e tradução ficam lado a lado
- [ ] O botão do cabeçalho cicla: seguir o Figma → claro → escuro
- [ ] Trocar o tema do próprio Figma com o plugin em "seguir" → acompanha

## 6. Texto livre

- [ ] Digitar, **Traduzir**, e o resultado aparece com Copiar/Colar liberados
- [ ] **Pegar da seleção** puxa o texto das camadas selecionadas
- [ ] **Copiar** coloca no clipboard (cole em qualquer lugar para conferir)
- [ ] **Colar no Figma** com camadas de texto selecionadas → substitui o conteúdo
- [ ] **Colar no Figma** sem nada selecionado → cria camada nova no centro da tela

## O que me mandar se quebrar

1. o que você clicou e o que esperava;
2. a mensagem que apareceu na faixa de status do plugin;
3. o erro do console (Plugins → Development → Open console), com a stack.

Com esses três eu acho a causa direto.

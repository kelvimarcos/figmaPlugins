# Política de privacidade — Kivo

_Última atualização: 7 de agosto de 2026._

O Kivo é um plugin do Figma que traduz textos do seu arquivo usando um
serviço de tradução que **você escolhe**. Esta página explica exatamente quais
dados saem do seu computador e para onde vão.

## O que é enviado

Quando você clica em "Escanear e traduzir" ou "Traduzir", o plugin envia **o
conteúdo textual** das camadas selecionadas (ou o texto que você digitou) para o
provedor de tradução escolhido, junto com o idioma de origem e de destino.

Nada mais é enviado: nem o nome do arquivo, nem nomes de camadas, nem imagens,
nem informações da sua conta do Figma, nem identificadores do documento.

## Para quem é enviado

Depende do provedor selecionado no plugin. Cada um tem a própria política:

| Provedor | Destino | Política |
| --- | --- | --- |
| DeepL | `api.deepl.com` / `api-free.deepl.com` | https://www.deepl.com/privacy |
| Google Cloud Translation | `translation.googleapis.com` | https://cloud.google.com/terms/cloud-privacy-notice |
| MyMemory | `api.mymemory.translated.net` | https://mymemory.translated.net/doc/privacy.php |

O MyMemory é uma memória de tradução colaborativa: textos enviados a ele podem
ser incorporados ao acervo público do serviço. **Não use o MyMemory com conteúdo
confidencial.**

## O que fica guardado

O plugin guarda localmente, via `figma.clientStorage` (na sua máquina, dentro do
Figma), apenas:

- suas preferências de idioma, escopo, provedor e tema;
- o tamanho da janela;
- as chaves de API que você digitar.

As chaves ficam em texto simples nesse armazenamento local e são usadas somente
para autenticar as chamadas ao provedor correspondente. Elas nunca são enviadas
a nenhum outro destino.

Os textos originais das camadas traduzidas são guardados no `pluginData` do
próprio arquivo do Figma, para que o botão "Desfazer" funcione. Esses dados ficam
no seu arquivo e não saem dele.

## O que não fazemos

O plugin não tem servidor próprio. Não coletamos analytics, não rastreamos uso,
não temos acesso ao seu conteúdo e não compartilhamos nada com terceiros além do
provedor de tradução que você mesmo selecionou.

## Como remover seus dados

Desinstalar o plugin apaga o `clientStorage` associado a ele. Para remover os
textos originais guardados no arquivo, use "Desfazer" antes de desinstalar.

## Contato

kelvison.designer@gmail.com

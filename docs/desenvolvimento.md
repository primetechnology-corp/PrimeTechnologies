# Desenvolvimento

## Requisitos

- [Node.js](https://nodejs.org/) (versão compatível com o Vite indicado no
  `package.json`).
- npm (acompanha o Node.js).

## Instalação

```bash
npm install
```

## Scripts disponíveis

Definidos em `package.json`:

| Script            | Comando         | Descrição                                   |
| ----------------- | --------------- | ------------------------------------------- |
| `npm run dev`     | `vite`          | Sobe o servidor de desenvolvimento com HMR. |
| `npm run build`   | `vite build`    | Gera a build de produção em `dist/`.         |
| `npm run preview` | `vite preview`  | Serve localmente a build de produção.        |

## Fluxo local

1. Instale as dependências: `npm install`.
2. Rode `npm run dev` e acesse a URL exibida no terminal.
3. Edite `index.html`, os arquivos em `src/scss/` ou os módulos em `src/*.js`;
   o Vite recarrega automaticamente.

## Build de produção

```bash
npm run build
```

Os artefatos são gerados em `dist/`. Para validar localmente antes do deploy:

```bash
npm run preview
```

## Deploy

O deploy é feito via **Cloudflare Pages** (ver README na raiz). O arquivo
`public/robots.txt` é publicado na raiz do site.

## Dependências principais

- `three` — fundo animado em WebGL da seção hero.
- `sweetalert2` — mensagens de feedback do formulário.
- `vite` e plugins (`vite-plugin-html`, `vite-plugin-html-minifier-terser`,
  `vite-plugin-imagemin`) — build, minificação de HTML e otimização de imagens.

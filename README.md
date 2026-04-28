# Prime Technology - Landing Page

Este projeto é uma landing page desenvolvida com **Vite**, **JavaScript** e **SCSS**.

## Requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (recomendado: versão 18+)
- npm (já vem com o Node.js)

## Como rodar o projeto localmente

### 1) Instalar dependências

```bash
npm install
```

### 2) Iniciar ambiente de desenvolvimento

```bash
npm run dev
```

Depois disso, abra no navegador o endereço exibido no terminal (normalmente algo como `http://localhost:5173`).

## Build de produção

Para gerar os arquivos otimizados de produção:

```bash
npm run build
```

Os arquivos finais serão gerados na pasta:

```bash
dist/
```

## Preview da build de produção

Para subir um servidor local com a versão de produção:

```bash
npm run preview
```

## Estrutura principal do projeto

```bash
.
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── robots.txt
├── src/
│   ├── main.js
│   ├── hero.js
│   ├── assets/
│   └── scss/
└── dist/ (gerado após npm run build)
```

## Deploy (Cloudflare Pages)

Configuração recomendada:

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`

## Robots.txt

O projeto possui `robots.txt` em:

- `public/robots.txt` (fonte)
- `dist/robots.txt` (build atual)
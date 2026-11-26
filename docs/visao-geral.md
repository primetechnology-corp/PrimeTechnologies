# Visão geral

A **Prime Technology** é uma landing page institucional (página única) que
apresenta a empresa, seus serviços e casos de sucesso, além de oferecer um
formulário de contato.

## Objetivo

Página de apresentação da empresa com foco em conversão: o visitante conhece os
serviços, vê resultados de projetos e entra em contato pelo formulário.

## Stack

| Camada            | Tecnologia                                   |
| ----------------- | -------------------------------------------- |
| Build / dev server | [Vite](https://vitejs.dev/)                 |
| Marcação          | HTML5 (`index.html`)                          |
| Estilos           | SCSS (modularizado em `src/scss/`)            |
| Scripts           | JavaScript ES Modules (`src/*.js`)            |
| 3D / background    | [three.js](https://threejs.org/)            |
| Alertas / feedback | [SweetAlert2](https://sweetalert2.github.io/) |
| Otimização de imagem | `vite-plugin-imagemin`                      |

O projeto usa `"type": "module"` no `package.json`, portanto todo o código
JavaScript é tratado como ES Modules.

## Funcionalidades

- **Header fixo** com navegação e menu mobile (hambúrguer) acessível.
- **Hero** com título, chamada para ação e fundo animado em WebGL (three.js).
- **Serviços**: Desenvolvimento de Software, Consultoria em TI e Design UX/UI.
- **Casos de sucesso**: cartões com imagem e descrição de projetos entregues.
- **Footer** com formulário de contato validado, dados de contato, redes sociais
  e ano de copyright preenchido automaticamente.
- **Animações de entrada** via `IntersectionObserver` em elementos com o atributo
  `data-animate`.
- **SEO**: meta tags (description, keywords, Open Graph, Twitter Card),
  `canonical` e dados estruturados (JSON-LD `Organization`).

## Público e idioma

A página é em português do Brasil (`<html lang="pt-BR">`) e direcionada a
clientes que buscam serviços de tecnologia.

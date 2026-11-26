# Arquitetura

## Estrutura de pastas

```
.
├── index.html            # Marcação única da landing page (header, main, footer)
├── favicon.ico
├── vite.config.js        # Configuração do Vite (build + imagemin)
├── package.json
├── public/
│   └── robots.txt        # Servido na raiz do site
├── docs/                 # Esta documentação
└── src/
    ├── main.js           # Ponto de entrada: importa SCSS e inicializa módulos
    ├── hero.js           # Fundo animado em WebGL (three.js)
    ├── formHandler.js    # Validação e envio do formulário de contato
    ├── assets/           # Imagens (logo e prints de projetos)
    └── scss/             # Estilos modularizados
```

## Ponto de entrada

`src/main.js` é o único script carregado pelo `index.html`
(`<script type="module" src="/src/main.js">`). Ele:

1. Importa os estilos (`import './scss/main.scss'`).
2. Inicializa o fundo animado (`initHeroBackground` de `hero.js`).
3. Inicializa o formulário (`initFormHandler` de `formHandler.js`).
4. Preenche o ano no rodapé (`#footer-year`).
5. Adiciona sombra ao header ao rolar a página.
6. Controla a abertura/fechamento do menu mobile (`.header__mobile-toggle`),
   incluindo o atributo de acessibilidade `aria-expanded`.
7. Faz _smooth scroll_ para os links âncora internos.
8. Observa elementos com `[data-animate]` via `IntersectionObserver` para animar
   a entrada ao entrarem na viewport.

## Módulos JavaScript

### `src/hero.js`

Exporta `initHeroBackground()`. Usa **three.js** para renderizar um fundo
animado (efeito de rastro/partículas que reage ao movimento) atrás da seção
hero.

### `src/formHandler.js`

Exporta `initFormHandler()`. Responsável pelo formulário de contato do rodapé:

- **Honeypot anti-bot**: campo oculto `website`; se preenchido, o envio é
  descartado silenciosamente.
- **Validação** (`validateForm`): nome, e-mail (regex
  `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`), telefone (10–11 dígitos, DDD) e mensagem.
- **Máscara de telefone** (`initPhoneMask`): formata o campo como
  `(XX) XXXXX-XXXX`.
- **Feedback ao usuário** via **SweetAlert2** (`Swal.fire`) para sucesso/erro.

## Estilos (SCSS)

`src/scss/main.scss` é o agregador que importa os parciais com `@use`, na ordem:

| Arquivo               | Conteúdo                                   |
| --------------------- | ------------------------------------------ |
| `_variables.scss`     | Cores, espaçamentos e tokens de design      |
| `_mixins.scss`        | Mixins reutilizáveis                        |
| `_base.scss`          | Reset e estilos globais                     |
| `_header.scss`        | Header e menu mobile                        |
| `_hero.scss`          | Seção hero                                  |
| `_services.scss`      | Seção de serviços                           |
| `_cases.scss`         | Casos de sucesso                            |
| `_footer.scss`        | Footer e formulário                         |
| `_animations.scss`    | Animações (`data-animate`, etc.)            |

A nomenclatura das classes segue o padrão **BEM** (ex.: `header__nav`,
`services__card`, `footer__form-input`).

## Build

`vite.config.js` define:

- `build`: sem sourcemap, minificação com `esbuild`, `cssCodeSplit` habilitado e
  `assetsInlineLimit` de 4096 bytes.
- `vite-plugin-imagemin`: otimização de imagens (mozjpeg, pngquant e webp).

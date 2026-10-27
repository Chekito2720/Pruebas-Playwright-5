# Practice ExpandTesting · Playwright

Suite de ~430 pruebas (UI + API) para https://practice.expandtesting.com con Playwright y archivos `*.spec.ts`.

## Requisitos

- **Node.js 18 o superior** (recomendado 20/22) → https://nodejs.org
- Conexión a internet (las pruebas corren contra el sitio real)

## Instalación

```bash
cd practice-expandtesting-playwright
npm install
npx playwright install chromium
```

> En Linux, si faltan librerías del sistema: `npx playwright install --with-deps chromium`

## Ejecutar

```bash
npm test                  # todas las pruebas (Chromium)
npm run test:headed       # viendo el navegador
npm run test:ui           # modo UI interactivo
npm run report            # abre el reporte HTML
npm run test:list         # lista las pruebas sin ejecutarlas
ALL_BROWSERS=1 npx playwright test   # Chromium + Firefox + WebKit
                                     # (requiere: npx playwright install)
```

Por archivo: `test:smoke`, `test:api`, `test:auth`, `test:forms`, `test:dynamic`,
`test:interactions`, `test:alerts`, `test:tables`, `test:apps`, `test:responsive`.

En Windows PowerShell la variable se define así: `$env:ALL_BROWSERS=1; npx playwright test`

## Estructura

```
playwright.config.ts
src/
  data/pages.ts          lista de páginas para el smoke masivo
  fixtures/base.ts       fixture que bloquea anuncios/trackers
  pages/                 Page Objects (Login, Register)
  utils/random.ts        generadores de usuarios/correos únicos
tests/
  site-pages.spec.ts     smoke de ~90 páginas
  home.spec.ts           home y navegación
  auth-login.spec.ts     login (funcional + seguridad básica)
  auth-register.spec.ts  registro
  forms.spec.ts          inputs, radios, checkboxes, dropdown, validación, upload/download
  dynamic.spec.ts        add/remove, controles y carga dinámica, scroll infinito
  interactions.spec.ts   hovers, teclado, slider, drag & drop, geolocalización
  alerts-windows.spec.ts diálogos JS, ventanas, iframes, modales, basic auth
  tables-dom.spec.ts     tablas, DataTables, DOM complejo
  apps.spec.ts           BMI, password checker, Notes app
  api.spec.ts            Notes API (usuarios y notas) y status codes
  responsive.spec.ts     móvil y escritorio
```

## Notas

- Los selectores viven en el propio spec o en `src/pages/`; si el sitio cambia algo, se ajusta en un solo lugar.
- El sitio es público y compartido: si ves fallos aislados por lentitud o límites de la API, baja los workers
  (`npx playwright test --workers=2`).
- Los tests de la Notes API crean usuarios con correos únicos y limpian la cuenta al final.

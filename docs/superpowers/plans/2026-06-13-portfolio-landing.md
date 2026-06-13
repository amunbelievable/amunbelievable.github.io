# Лендинг-портфолио Антона Малаховского — План реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать статический лендинг-портфолио на Astro: прелоадер → hero → снап-список кейсов → детальные подстраницы (.md), с плавными переходами и возвратом на исходную позицию списка.

**Architecture:** Astro static-сайт. Контент кейсов — Content Collections (`glob` loader, zod-схема) + свободный markdown. Навигация и переходы — Astro View Transitions (`<ClientRouter />`). Поведенческая логика (сортировка, восстановление скролла, гейт прелоадера) вынесена в чистые TS-модули и покрыта Vitest; сквозные сценарии — Playwright. Responsive, один кодовый набор.

**Tech Stack:** Astro 5, TypeScript, Vitest (юнит-логика), Playwright (E2E), GitHub Actions + GitHub Pages.

**Соглашения проекта:**
- Пакетный менеджер — `npm`.
- Медиа кейсов и hero лежат в `public/` и подключаются строкой-URL (единообразно для картинок и видео; webp уже оптимизированы).
- Локальный git нужен для дисциплины коммитов; публикация на GitHub — позже (вне этого плана).

---

## Структура файлов

```
landing-portfolio/
├── astro.config.mjs              # конфиг Astro (site/base, integrations)
├── package.json
├── tsconfig.json
├── vitest.config.ts              # юнит-тесты логики
├── playwright.config.ts          # E2E
├── public/
│   ├── hero/main.webp            # фон Hero (уже есть в корне, переносится сюда)
│   └── cases/crasher/cover.webp  # обложка CRASHER.MX (из case1.webp)
├── src/
│   ├── content.config.ts         # схема коллекции cases
│   ├── content/
│   │   └── cases/
│   │       └── crasher.md        # первый кейс-образец
│   ├── lib/
│   │   ├── cases.ts              # sortCases() — сортировка по order
│   │   ├── scroll-restore.ts     # resolveTargetCase() — какой кейс показать при возврате
│   │   └── preloader.ts          # shouldShowPreloader() — гейт показа
│   ├── layouts/
│   │   └── BaseLayout.astro      # <head>, ClientRouter, глобальные стили
│   ├── styles/
│   │   └── global.css            # переменные, базовые стили, breakpoints
│   ├── components/
│   │   ├── Preloader.astro
│   │   ├── Header.astro
│   │   ├── ContactsPopup.astro
│   │   ├── Hero.astro
│   │   ├── CaseList.astro
│   │   ├── CaseRow.astro
│   │   └── Footer.astro
│   └── pages/
│       ├── index.astro           # главная
│       └── cases/[slug].astro    # детальная подстраница кейса
├── tests/
│   └── e2e/
│       ├── navigation.spec.ts
│       └── ui.spec.ts
└── .github/workflows/deploy.yml  # деплой на GitHub Pages
```

---

## Task 0: Скаффолд проекта и тулинг

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `vitest.config.ts`, `playwright.config.ts`

- [ ] **Step 1: Инициализировать минимальный Astro-проект вручную**

Создать `package.json`:

```json
{
  "name": "landing-portfolio",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test:unit": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 2: Установить зависимости**

Run:
```bash
npm install astro
npm install -D typescript vitest @playwright/test
npx playwright install chromium
```
Expected: установка без ошибок, появляется `node_modules` и `package-lock.json`.

- [ ] **Step 3: Создать `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  // site/base заполним в Task 11 под адрес GitHub Pages
  site: 'https://example.com',
});
```

- [ ] **Step 4: Создать `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: Создать `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/lib/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 6: Создать `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: 'http://localhost:4321' },
});
```

- [ ] **Step 7: Создать `.gitignore`**

```
node_modules/
dist/
.astro/
test-results/
playwright-report/
.superpowers/
```

- [ ] **Step 8: Инициализировать локальный git и первый коммит**

Run:
```bash
git init
git add -A
git commit -m "chore: scaffold Astro project with Vitest and Playwright"
```
Expected: создан репозиторий, первый коммит прошёл.

---

## Task 1: Перенести медиа-ассеты в `public/`

**Files:**
- Create: `public/hero/main.webp`, `public/cases/crasher/cover.webp`

- [ ] **Step 1: Перенести файлы**

Run:
```bash
mkdir -p public/hero public/cases/crasher
git mv main.webp public/hero/main.webp
git mv case1.webp public/cases/crasher/cover.webp
```
Expected: файлы перемещены, доступны по URL `/hero/main.webp` и `/cases/crasher/cover.webp` после сборки.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: move hero and first case media into public/"
```

---

## Task 2: Утилита сортировки кейсов (TDD)

**Files:**
- Create: `src/lib/cases.ts`
- Test: `src/lib/cases.test.ts`

- [ ] **Step 1: Написать падающий тест**

`src/lib/cases.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { sortCases } from './cases';

describe('sortCases', () => {
  it('sorts by ascending order field', () => {
    const input = [
      { id: 'b', data: { order: 2 } },
      { id: 'a', data: { order: 1 } },
      { id: 'c', data: { order: 3 } },
    ];
    expect(sortCases(input as any).map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate the input array', () => {
    const input = [
      { id: 'b', data: { order: 2 } },
      { id: 'a', data: { order: 1 } },
    ];
    sortCases(input as any);
    expect(input.map((c) => c.id)).toEqual(['b', 'a']);
  });
});
```

- [ ] **Step 2: Запустить тест — убедиться, что падает**

Run: `npm run test:unit`
Expected: FAIL — `sortCases is not a function` / модуль не найден.

- [ ] **Step 3: Реализовать минимум**

`src/lib/cases.ts`:
```ts
export interface CaseLike {
  id: string;
  data: { order: number };
}

export function sortCases<T extends CaseLike>(cases: T[]): T[] {
  return [...cases].sort((a, b) => a.data.order - b.data.order);
}
```

- [ ] **Step 4: Запустить тест — убедиться, что проходит**

Run: `npm run test:unit`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add sortCases utility with tests"
```

---

## Task 3: Контент-коллекция кейсов и первый кейс

**Files:**
- Create: `src/content.config.ts`, `src/content/cases/crasher.md`

- [ ] **Step 1: Описать схему коллекции**

`src/content.config.ts`:
```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const cases = defineCollection({
  loader: glob({ base: './src/content/cases', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    years: z.string(),
    order: z.number(),
    cover: z.object({
      type: z.enum(['image', 'video']),
      src: z.string(),
    }),
    heading: z.string(),
  }),
});

export const collections = { cases };
```

- [ ] **Step 2: Создать первый кейс**

`src/content/cases/crasher.md`:
```markdown
---
title: "CRASHER.MX"
years: "2024 — 2025"
order: 1
cover:
  type: "image"
  src: "/cases/crasher/cover.webp"
heading: "Бренд-менеджмент выхода на Мексику"
---

## Задача
Разработать брендбук и ToV платформы с учётом трендовости продукта: его web-платформа на голову опережала рынок.

## Инсайт
Новому продукту требуется небанальная упаковка, чтобы показать, что мы — «просто космос».

## Решение
Концепция «Казино из другой галактики!» («¡Un Casino de otra Galaxia!»): космический дизайн, маскот и коммуникации, отражающие совершенно новое слово на мексиканском рынке. Удалось передать отличия продукта: лёгкость в навигации, трендовую и понятную вёрстку, современные web-решения.
```

- [ ] **Step 3: Проверить, что схема валидна (sync типов)**

Run: `npx astro sync`
Expected: завершается без ошибок валидации frontmatter; генерируются типы коллекции.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add cases content collection and CRASHER.MX case"
```

---

## Task 4: Глобальные стили и базовый layout

**Files:**
- Create: `src/styles/global.css`, `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Создать глобальные стили**

`src/styles/global.css`:
```css
:root {
  --bg: #ffffff;
  --fg: #111111;
  --muted: #666666;
  --line: #e9e9e9;
  --maxw: 1200px;
  --space: clamp(16px, 4vw, 48px);
  --font: 'Inter', system-ui, -apple-system, sans-serif;
  --bp-mobile: 768px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
}

img, video { display: block; max-width: 100%; }

a { color: inherit; text-decoration: none; }

.container { max-width: var(--maxw); margin: 0 auto; padding-inline: var(--space); }

/* Появление блоков при скролле */
.reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s ease; }
.reveal.is-visible { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

- [ ] **Step 2: Создать базовый layout с ClientRouter**

`src/layouts/BaseLayout.astro`:
```astro
---
import { ClientRouter } from 'astro:transitions';
import '../styles/global.css';

interface Props { title?: string; description?: string; }
const {
  title = 'Антон Малаховский — портфолио',
  description = 'Creative team lead. Digital | web | strategy.',
} = Astro.props;
---
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="generator" content={Astro.generator} />
    <ClientRouter />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Smoke-проверка сборки**

Run: `npm run build`
Expected: сборка завершается без ошибок (страниц пока может не быть — допустимо, если есть хотя бы index из следующих задач; если падает на «no pages», временно создать пустой `src/pages/index.astro` с `---\n---\n<p>ok</p>` и удалить после Task 8).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add global styles and base layout with ClientRouter"
```

---

## Task 5: Header и ContactsPopup

**Files:**
- Create: `src/components/Header.astro`, `src/components/ContactsPopup.astro`
- Test: `tests/e2e/ui.spec.ts`

- [ ] **Step 1: Написать падающий E2E-тест на поп-ап контактов**

`tests/e2e/ui.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('contacts popup opens and closes', async ({ page }) => {
  await page.goto('/');
  // дождаться скрытия прелоадера
  await page.locator('#preloader').waitFor({ state: 'hidden' }).catch(() => {});

  const popup = page.locator('#contacts-popup');
  await expect(popup).toBeHidden();

  await page.getByRole('button', { name: /контакты/i }).click();
  await expect(popup).toBeVisible();
  await expect(page.getByRole('link', { name: /amunbelievable@gmail.com/i })).toBeVisible();

  await page.locator('#contacts-close').click();
  await expect(popup).toBeHidden();
});
```

- [ ] **Step 2: Запустить тест — убедиться, что падает**

Run: `npm run test:e2e -- ui.spec.ts`
Expected: FAIL — кнопки «Контакты» / поп-апа ещё нет.

- [ ] **Step 3: Реализовать ContactsPopup**

`src/components/ContactsPopup.astro`:
```astro
---
const contacts = [
  { label: 'E-mail', value: 'amunbelievable@gmail.com', href: 'mailto:amunbelievable@gmail.com' },
  { label: 'Telegram', value: '@amunbelievable', href: 'https://t.me/amunbelievable' },
  { label: 'LinkedIn', value: 'anton-malakhovskiy', href: 'https://linkedin.com/in/anton-malakhovskiy-9452bb360' },
];
---
<div id="contacts-popup" class="popup" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-label="Контакты">
  <div class="popup__backdrop" data-close></div>
  <aside class="popup__panel">
    <button id="contacts-close" class="popup__close" data-close aria-label="Закрыть">×</button>
    <h2 class="popup__title">Контакты</h2>
    <ul class="popup__list">
      {contacts.map((c) => (
        <li>
          <span class="popup__label">{c.label}</span>
          <a href={c.href} target="_blank" rel="noopener noreferrer">{c.value}</a>
        </li>
      ))}
    </ul>
  </aside>
</div>

<style>
  .popup[hidden] { display: none; }
  .popup { position: fixed; inset: 0; z-index: 100; }
  .popup__backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.25); }
  .popup__panel {
    position: absolute; top: 0; right: 0; height: 100%; width: min(420px, 100%);
    background: var(--bg); padding: 48px var(--space);
    box-shadow: -8px 0 40px rgba(0,0,0,.12);
    transform: translateX(100%); transition: transform .4s ease;
    display: flex; flex-direction: column; gap: 24px;
  }
  .popup:not([hidden]) .popup__panel { transform: none; }
  .popup__close { align-self: flex-end; background: none; border: 0; font-size: 32px; line-height: 1; cursor: pointer; color: var(--fg); }
  .popup__title { font-size: 14px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); }
  .popup__list { list-style: none; display: flex; flex-direction: column; gap: 20px; }
  .popup__label { display: block; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
  .popup__list a { font-size: 18px; border-bottom: 1px solid var(--fg); padding-bottom: 2px; }
  @media (max-width: 768px) {
    .popup__panel { width: 100%; }
  }
</style>

<script>
  function initContacts() {
    const popup = document.getElementById('contacts-popup');
    const openBtn = document.getElementById('contacts-open');
    if (!popup || !openBtn) return;

    const open = () => { popup.hidden = false; popup.setAttribute('aria-hidden', 'false'); };
    const close = () => { popup.hidden = true; popup.setAttribute('aria-hidden', 'true'); };

    openBtn.addEventListener('click', open);
    popup.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }
  document.addEventListener('astro:page-load', initContacts);
</script>
```

- [ ] **Step 4: Реализовать Header**

`src/components/Header.astro`:
```astro
---
---
<header class="header">
  <div class="header__inner container">
    <span class="header__name">Антон Малаховский</span>
    <button id="contacts-open" class="header__contacts" type="button">Контакты</button>
  </div>
</header>

<style>
  .header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(255,255,255,.85); backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--line);
  }
  .header__inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
  .header__name { font-size: 14px; letter-spacing: 1px; }
  .header__contacts {
    background: none; border: 1px solid var(--fg); border-radius: 999px;
    padding: 8px 20px; font-size: 13px; cursor: pointer; color: var(--fg);
    transition: background .2s ease, color .2s ease;
  }
  .header__contacts:hover { background: var(--fg); color: var(--bg); }
  @media (max-width: 768px) { .header__name { display: none; } }
</style>
```

- [ ] **Step 5: Подключить Header и ContactsPopup на временной странице и прогнать тест**

Временно в `src/pages/index.astro` (будет переписан в Task 8):
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import ContactsPopup from '../components/ContactsPopup.astro';
---
<BaseLayout>
  <Header />
  <ContactsPopup />
  <main style="height:120vh"></main>
</BaseLayout>
```

Run: `npm run test:e2e -- ui.spec.ts`
Expected: PASS — поп-ап открывается, видны контакты, закрывается.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add sticky header and contacts popup"
```

---

## Task 6: Hero

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Реализовать Hero**

`src/components/Hero.astro`:
```astro
---
const bio =
  'Креативный лидер с 11+ годами опыта в разработке бренд-стратегий, 360-кампаний и web-продуктов. Экспертиза в iGaming, Affiliate, Telecom и FMCG. Выстраиваю бренды и цифровые продукты с нуля: от идеи и CJM до релиза и измеримого результата.';
---
<section id="hero" class="hero">
  <div class="hero__bg" aria-hidden="true"></div>
  <div class="hero__overlay" aria-hidden="true"></div>
  <div class="hero__content">
    <img class="hero__avatar" src="/hero/avatar.webp" alt="Антон Малаховский" width="120" height="120" />
    <h1 class="hero__name">Антон Малаховский</h1>
    <p class="hero__role">creative team lead</p>
    <p class="hero__tagline">digital | web | strategy</p>
    <p class="hero__bio">{bio}</p>
  </div>
</section>

<style>
  .hero { position: relative; min-height: 100svh; display: grid; place-items: center; text-align: center; overflow: hidden; }
  .hero__bg {
    position: absolute; inset: 0;
    background: #f3f0e8 url('/hero/main.webp') center/cover no-repeat;
  }
  .hero__overlay {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 35%, rgba(255,255,255,.55), rgba(255,255,255,.15) 60%);
  }
  .hero__content { position: relative; z-index: 1; padding: var(--space); max-width: 640px; }
  .hero__avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 20px; border: 3px solid rgba(255,255,255,.9); box-shadow: 0 8px 24px rgba(0,0,0,.15); }
  .hero__name { font-size: clamp(28px, 6vw, 44px); font-weight: 600; letter-spacing: .5px; }
  .hero__role { margin-top: 8px; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: var(--fg); }
  .hero__tagline { margin-top: 4px; font-size: 12px; letter-spacing: 2px; color: var(--muted); }
  .hero__bio { margin-top: 18px; font-size: 14px; line-height: 1.7; color: var(--fg); }
</style>
```

> **Зависимость по контенту:** аватарки пока нет. Положить файл в `public/hero/avatar.webp`. Если файла нет на момент сборки — `<img>` отдаст alt-текст; это допустимо для разработки, заменить перед релизом.

- [ ] **Step 2: Подключить Hero на временной index и проверить сборку**

Добавить `<Hero />` в `src/pages/index.astro` после `<Header />`.

Run: `npm run build`
Expected: сборка без ошибок.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add hero section"
```

---

## Task 7: CaseRow и CaseList (снап-скролл + появление)

**Files:**
- Create: `src/components/CaseRow.astro`, `src/components/CaseList.astro`

- [ ] **Step 1: Реализовать CaseRow**

`src/components/CaseRow.astro`:
```astro
---
interface Props {
  slug: string;
  title: string;
  years: string;
  cover: { type: 'image' | 'video'; src: string };
}
const { slug, title, years, cover } = Astro.props;
---
<section class="case" id={`case-${slug}`} data-slug={slug}>
  <a class="case__link reveal" href={`/cases/${slug}`} data-case-link={slug}>
    <span class="case__title">{title}</span>
    <span class="case__media">
      {cover.type === 'video' ? (
        <video src={cover.src} autoplay loop muted playsinline></video>
      ) : (
        <img src={cover.src} alt={title} loading="lazy" />
      )}
    </span>
    <span class="case__years">{years}</span>
  </a>
</section>

<style>
  .case { min-height: 100svh; scroll-snap-align: start; display: grid; place-items: center; padding: 88px var(--space) var(--space); }
  .case__link { display: grid; grid-template-columns: 1fr minmax(0, 2fr) 1fr; align-items: center; gap: 32px; width: 100%; max-width: var(--maxw); }
  .case__title { font-size: clamp(20px, 3vw, 32px); font-weight: 600; }
  .case__years { text-align: right; color: var(--muted); letter-spacing: 1px; }
  .case__media { aspect-ratio: 16/10; overflow: hidden; border-radius: 10px; background: var(--line); }
  .case__media img, .case__media video { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
  .case__link:hover .case__media img, .case__link:hover .case__media video { transform: scale(1.03); }
  @media (max-width: 768px) {
    .case__link { grid-template-columns: 1fr; gap: 12px; text-align: left; }
    .case__years { text-align: left; }
  }
</style>
```

- [ ] **Step 2: Реализовать CaseList**

`src/components/CaseList.astro`:
```astro
---
import { getCollection } from 'astro:content';
import { sortCases } from '../lib/cases';
import CaseRow from './CaseRow.astro';

const cases = sortCases(await getCollection('cases'));
---
<div id="cases" class="caselist">
  {cases.map((c) => (
    <CaseRow slug={c.id} title={c.data.title} years={c.data.years} cover={c.data.cover} />
  ))}
</div>

<style>
  .caselist { scroll-snap-type: y mandatory; }
</style>

<script>
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    items.forEach((el) => io.observe(el));
  }
  document.addEventListener('astro:page-load', initReveal);
</script>
```

> Примечание: `scroll-snap-type` на контейнере `.caselist`; Hero и Footer вне него, поэтому снап работает только в зоне кейсов и не мешает прокрутке к hero/footer.

- [ ] **Step 3: Проверить сборку**

Run: `npm run build`
Expected: сборка без ошибок, кейс CRASHER.MX отрисован.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add snap-scrolling case list and rows"
```

---

## Task 8: Главная страница (сборка секций)

**Files:**
- Create/Modify: `src/pages/index.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Реализовать Footer**

`src/components/Footer.astro`:
```astro
---
---
<footer class="footer">
  <a class="footer__top" href="#hero" data-scroll-top>↑ Наверх</a>
</footer>

<style>
  .footer { display: grid; place-items: center; padding: 48px var(--space); border-top: 1px solid var(--line); }
  .footer__top { font-size: 13px; letter-spacing: 2px; text-transform: uppercase; border: 1px solid var(--fg); border-radius: 999px; padding: 10px 24px; transition: background .2s, color .2s; }
  .footer__top:hover { background: var(--fg); color: var(--bg); }
</style>

<script>
  function initTop() {
    const btn = document.querySelector('[data-scroll-top]');
    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
  document.addEventListener('astro:page-load', initTop);
</script>
```

- [ ] **Step 2: Собрать главную страницу**

`src/pages/index.astro` (полностью заменить):
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Preloader from '../components/Preloader.astro';
import Header from '../components/Header.astro';
import ContactsPopup from '../components/ContactsPopup.astro';
import Hero from '../components/Hero.astro';
import CaseList from '../components/CaseList.astro';
import Footer from '../components/Footer.astro';
---
<BaseLayout>
  <Preloader />
  <Header />
  <ContactsPopup />
  <main>
    <Hero />
    <CaseList />
  </main>
  <Footer />
</BaseLayout>
```

> `Preloader` создаётся в Task 10. Чтобы эта задача собиралась самостоятельно, временно закомментировать строку импорта и тег `<Preloader />`, затем раскомментировать в Task 10. (Альтернатива — выполнить Task 10 до Step 2.)

- [ ] **Step 3: Проверить сборку и прогнать E2E контактов**

Run: `npm run build && npm run test:e2e -- ui.spec.ts`
Expected: сборка ок; тест контактов проходит.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: assemble homepage with footer scroll-to-top"
```

---

## Task 9: Детальная подстраница кейса + переход + сохранение позиции

**Files:**
- Create: `src/pages/cases/[slug].astro`
- Test: `tests/e2e/navigation.spec.ts`

- [ ] **Step 1: Написать падающий E2E-тест навигации и возврата**

`tests/e2e/navigation.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('open a case and return to its position via Назад', async ({ page }) => {
  await page.goto('/');
  await page.locator('#preloader').waitFor({ state: 'hidden' }).catch(() => {});

  await page.locator('[data-case-link="crasher"]').click();
  await expect(page).toHaveURL(/\/cases\/crasher\/?$/);
  await expect(page.getByRole('heading', { name: /Бренд-менеджмент выхода на Мексику/i })).toBeVisible();

  await page.getByRole('link', { name: /назад/i }).click();
  await expect(page).toHaveURL(/\/(#case-crasher)?$/);
  // целевой кейс в зоне видимости
  await expect(page.locator('#case-crasher')).toBeInViewport();
});
```

- [ ] **Step 2: Запустить тест — убедиться, что падает**

Run: `npm run test:e2e -- navigation.spec.ts`
Expected: FAIL — страницы `/cases/crasher` нет.

- [ ] **Step 3: Реализовать детальную страницу**

`src/pages/cases/[slug].astro`:
```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const cases = await getCollection('cases');
  return cases.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const { title, years, heading, cover } = entry.data;
---
<BaseLayout title={`${title} — Антон Малаховский`}>
  <article class="detail">
    <div class="detail__media">
      {cover.type === 'video' ? (
        <video src={cover.src} autoplay loop muted playsinline></video>
      ) : (
        <img src={cover.src} alt={title} />
      )}
    </div>
    <div class="detail__body">
      <p class="detail__years">{years}</p>
      <h1 class="detail__title">{title}</h1>
      <h2 class="detail__heading">{heading}</h2>
      <div class="detail__prose"><Content /></div>
      <a class="detail__back" href={`/#case-${entry.id}`} data-back={entry.id}>← Назад</a>
    </div>
  </article>
</BaseLayout>

<style>
  .detail { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space); max-width: var(--maxw); margin: 0 auto; padding: 88px var(--space) var(--space); align-items: start; }
  .detail__media { position: sticky; top: 88px; border-radius: 10px; overflow: hidden; background: var(--line); }
  .detail__media img, .detail__media video { width: 100%; height: auto; }
  .detail__years { color: var(--muted); letter-spacing: 1px; }
  .detail__title { font-size: clamp(28px, 4vw, 44px); font-weight: 600; margin-top: 6px; }
  .detail__heading { font-size: 18px; font-weight: 500; color: var(--muted); margin-top: 8px; }
  .detail__prose { margin-top: 28px; line-height: 1.75; }
  .detail__prose :global(h2) { margin-top: 24px; font-size: 16px; letter-spacing: 1px; text-transform: uppercase; }
  .detail__prose :global(p) { margin-top: 10px; }
  .detail__back { display: inline-block; margin-top: 40px; border: 1px solid var(--fg); border-radius: 999px; padding: 10px 24px; font-size: 13px; }
  .detail__back:hover { background: var(--fg); color: var(--bg); }
  @media (max-width: 768px) {
    .detail { grid-template-columns: 1fr; }
    .detail__media { position: static; }
  }
</style>

<script>
  // Запомнить, какой кейс открыли — для восстановления позиции при возврате
  function rememberOnLeave() {
    document.querySelectorAll('[data-back]').forEach((el) => {
      el.addEventListener('click', () => {
        const slug = (el as HTMLElement).dataset.back;
        if (slug) sessionStorage.setItem('lastCase', slug);
      });
    });
  }
  document.addEventListener('astro:page-load', rememberOnLeave);
</script>
```

- [ ] **Step 4: Запомнить кейс при клике по карточке (на главной)**

Добавить в `<script>` компонента `CaseList.astro` (внутри `initReveal`-скрипта файла — отдельной функцией) обработчик, сохраняющий slug при клике по карточке:

В `src/components/CaseList.astro`, в блоке `<script>`, добавить функцию и её вызов:
```js
  function rememberOnClick() {
    document.querySelectorAll('[data-case-link]').forEach((el) => {
      el.addEventListener('click', () => {
        const slug = el.getAttribute('data-case-link');
        if (slug) sessionStorage.setItem('lastCase', slug);
      });
    });
  }
  document.addEventListener('astro:page-load', rememberOnClick);
```

- [ ] **Step 5: Запустить тест — частично (страница открывается)**

Run: `npm run test:e2e -- navigation.spec.ts`
Expected: переход на кейс и заголовок — проходят; шаг с возвратом «в зоне видимости» может ещё не выполняться надёжно — финальное восстановление позиции делает Task 10.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add case detail page and remember last case on navigation"
```

---

## Task 10: Восстановление позиции списка (TDD-логика) + прелоадер

**Files:**
- Create: `src/lib/scroll-restore.ts`, `src/lib/scroll-restore.test.ts`, `src/lib/preloader.ts`, `src/lib/preloader.test.ts`, `src/components/Preloader.astro`

### 10A. Логика выбора целевого кейса (TDD)

- [ ] **Step 1: Написать падающий тест**

`src/lib/scroll-restore.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { resolveTargetCase } from './scroll-restore';

describe('resolveTargetCase', () => {
  it('prefers hash over stored value', () => {
    expect(resolveTargetCase('#case-crasher', 'other')).toBe('crasher');
  });
  it('falls back to stored value when no hash', () => {
    expect(resolveTargetCase('', 'crasher')).toBe('crasher');
  });
  it('returns null when nothing applies', () => {
    expect(resolveTargetCase('', null)).toBeNull();
  });
  it('ignores hashes that are not case anchors', () => {
    expect(resolveTargetCase('#hero', null)).toBeNull();
  });
});
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npm run test:unit`
Expected: FAIL — модуль не найден.

- [ ] **Step 3: Реализовать**

`src/lib/scroll-restore.ts`:
```ts
const CASE_HASH = /^#case-(.+)$/;

export function resolveTargetCase(hash: string, stored: string | null): string | null {
  const m = hash.match(CASE_HASH);
  if (m) return m[1];
  if (stored) return stored;
  return null;
}
```

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `npm run test:unit`
Expected: PASS.

### 10B. Логика гейта прелоадера (TDD)

- [ ] **Step 5: Написать падающий тест**

`src/lib/preloader.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { shouldShowPreloader } from './preloader';

describe('shouldShowPreloader', () => {
  it('shows when no session flag set', () => {
    expect(shouldShowPreloader(null)).toBe(true);
  });
  it('does not show when already shown this session', () => {
    expect(shouldShowPreloader('1')).toBe(false);
  });
});
```

- [ ] **Step 6: Запустить — убедиться, что падает**

Run: `npm run test:unit`
Expected: FAIL.

- [ ] **Step 7: Реализовать**

`src/lib/preloader.ts`:
```ts
export function shouldShowPreloader(sessionFlag: string | null): boolean {
  return sessionFlag === null;
}
```

- [ ] **Step 8: Запустить — убедиться, что проходит**

Run: `npm run test:unit`
Expected: PASS (все юнит-тесты зелёные).

### 10C. Компонент Preloader + DOM-обвязка восстановления

- [ ] **Step 9: Реализовать Preloader**

`src/components/Preloader.astro`:
```astro
---
---
<div id="preloader" class="preloader" aria-hidden="true">
  <div class="preloader__inner">
    <span class="preloader__label">Loading</span>
    <div class="preloader__bar"><div id="preloader-fill" class="preloader__fill"></div></div>
    <span id="preloader-pct" class="preloader__pct">0%</span>
  </div>
</div>

<style>
  .preloader { position: fixed; inset: 0; z-index: 200; background: #fff; display: grid; place-items: center; transition: opacity .5s ease; }
  .preloader.is-done { opacity: 0; pointer-events: none; }
  .preloader[hidden] { display: none; }
  .preloader__inner { width: min(320px, 70vw); display: grid; gap: 12px; justify-items: start; }
  .preloader__label { font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: #111; }
  .preloader__bar { width: 100%; height: 2px; background: #e5e5e5; }
  .preloader__fill { height: 100%; width: 0%; background: #111; transition: width .15s linear; }
  .preloader__pct { font-size: 11px; color: #666; }
  @media (prefers-reduced-motion: reduce) { .preloader { transition: none; } }
</style>

<script>
  import { shouldShowPreloader } from '../lib/preloader';
  import { resolveTargetCase } from '../lib/scroll-restore';

  function restoreScroll() {
    const target = resolveTargetCase(location.hash, sessionStorage.getItem('lastCase'));
    if (!target) return;
    const el = document.getElementById(`case-${target}`);
    if (el) el.scrollIntoView({ behavior: 'auto' });
    sessionStorage.removeItem('lastCase');
  }

  function runPreloader() {
    const el = document.getElementById('preloader');
    const fill = document.getElementById('preloader-fill');
    const pct = document.getElementById('preloader-pct');
    if (!el) return;

    // Показываем только при первом заходе за сессию
    if (!shouldShowPreloader(sessionStorage.getItem('preloaderShown'))) {
      el.hidden = true;
      restoreScroll();
      return;
    }
    sessionStorage.setItem('preloaderShown', '1');

    let progress = 0;
    const tick = () => {
      progress = Math.min(100, progress + Math.random() * 12 + 4);
      if (fill) (fill as HTMLElement).style.width = `${progress}%`;
      if (pct) pct.textContent = `${Math.round(progress)}%`;
      if (progress < 100) {
        setTimeout(tick, 120);
      } else {
        el.classList.add('is-done');
        setTimeout(() => { el.hidden = true; restoreScroll(); }, 500);
      }
    };
    tick();
  }

  document.addEventListener('astro:page-load', () => {
    // Прелоадер живёт только на главной (где есть #preloader); восстановление — там же
    runPreloader();
  });
</script>
```

> Восстановление позиции вызывается после завершения/пропуска прелоадера, поэтому при возврате с детальной (где прелоадер уже «показан» в этой сессии) скролл мгновенно встаёт на нужный кейс.

- [ ] **Step 10: Раскомментировать Preloader в `index.astro`** (если комментировали в Task 8): импорт и `<Preloader />` первой строкой внутри `<BaseLayout>`.

- [ ] **Step 11: Прогнать все тесты**

Run: `npm run test:unit && npm run build && npm run test:e2e`
Expected: юнит — зелёные; сборка ок; E2E `navigation.spec.ts` (включая «#case-crasher в зоне видимости») и `ui.spec.ts` — проходят.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add preloader and list scroll-position restoration"
```

---

## Task 11: Деплой на GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Настроить `astro.config.mjs` под GitHub Pages**

Заменить плейсхолдер на реальные значения проекта Антона. Для пользовательского репозитория `username.github.io` — `base` не нужен; для проектного репозитория `username/repo` — указать `base: '/repo'`.

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://<username>.github.io',
  // base: '/<repo>', // раскомментировать для проектного репозитория
});
```

> Значения `<username>`/`<repo>` подставляются, когда Антон заведёт GitHub и репозиторий. До этого момента деплой не запускается — это ожидаемо.

- [ ] **Step 2: Создать workflow деплоя**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: withastro/action@v6

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 3: Проверить, что прод-сборка проходит локально**

Run: `npm run build`
Expected: сборка без ошибок, артефакты в `dist/`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "ci: add GitHub Pages deploy workflow and site config"
```

> Custom domain (`public/CNAME` с доменом) добавляется, когда домен будет куплен — отдельной однострочной задачей.

---

## Task 12: Финальная проверка по чек-листу спецификации

**Files:** нет (ручная/автоматическая верификация)

- [ ] **Step 1: Полный прогон тестов**

Run: `npm run test:unit && npm run build && npm run test:e2e`
Expected: всё зелёное.

- [ ] **Step 2: Ручной чек-лист (через `npm run preview`)**

Run: `npm run preview` и пройти по http://localhost:4321:
- [ ] Прелоадер 0→100% при первом заходе, затем раскрытие; при переходах внутри сайта не повторяется.
- [ ] Hero читается поверх `main.webp`.
- [ ] Снап-скролл по кейсам (колесо/свайп).
- [ ] Клик в кейс → плавный переход на детальную.
- [ ] «Назад» возвращает ровно на тот кейс, где был пользователь.
- [ ] «Наверх» из футера → к Hero.
- [ ] Контакты: десктоп — панель справа; мобайл (DevTools, ширина <768px) — на весь экран; 3 ссылки рабочие.
- [ ] Desktop и mobile раскладки на ключевых ширинах (1280px / 375px).

- [ ] **Step 3: Финальный коммит (если были правки)**

```bash
git add -A
git commit -m "test: verify spec checklist passes"
```

---

## Self-Review (выполнено автором плана)

- **Покрытие спеки:** прелоадер (T10), header+контакты (T5), hero (T6), снап-список (T7), детальная+«Назад» (T9), восстановление позиции (T10), футер «Наверх» (T8), модель контента (T3), responsive (в стилях каждого компонента + T12), деплой (T11), тестирование (T2/T9/T10/T12). Все разделы спецификации имеют задачу.
- **Плейсхолдеры:** реальный код в каждом шаге; единственные намеренные внешние зависимости — аватарка (`public/hero/avatar.webp`) и значения `site`/`base` GitHub — явно отмечены как контент/настройка от заказчика, не как «TODO в коде».
- **Согласованность типов/имён:** `sortCases`, `resolveTargetCase(hash, stored)`, `shouldShowPreloader(flag)`, `sessionStorage` ключи `lastCase`/`preloaderShown`, id `#case-<slug>`, атрибуты `data-case-link`/`data-back`, `#preloader`/`#contacts-popup`/`#contacts-open`/`#contacts-close` — используются одинаково во всех задачах.

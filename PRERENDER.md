# SEO-пререндер: инструкция для команды разработки

## Проблема, которую решаем

Сайт — это SPA (React + Vite). В собранной папке `dist/` лежит **один**
`index.html` с одинаковыми `<title>` и `description`. Внешние SEO-сканеры
(Topvisor, Screaming Frog, Serpstat и т.п.) **не исполняют JavaScript** и читают
именно этот сырой HTML — поэтому на всех URL они видят одинаковые метатеги.
Клиентская подстановка тегов через JS эту проблему не решает.

## Решение

Скрипт `scripts/prerender.mjs` запускается **после** `vite build` и создаёт для
каждого URL сайта отдельный `dist/<путь>/index.html` с уникальными
`title`, `description`, `canonical` и `og:*` / `twitter:*`.
Данные берутся из того же бэкенд-фида, что и фронтенд, поэтому теги совпадают
один-в-один с тем, что рисует React.

Пользователи по-прежнему получают обычное SPA, а боты — готовый уникальный HTML.

## Что нужно сделать команде (одно действие)

В пайплайне деплоя после сборки добавить запуск пререндера.

Было:
```bash
npm ci
npm run build
```

Стало:
```bash
npm ci
npm run build
node scripts/prerender.mjs
```

> `package.json` в среде poehali.dev защищён от изменений, поэтому команду
> `node scripts/prerender.mjs` нужно добавить в ваш деплой-скрипт вручную.
> Если у вас есть возможность править `package.json` на своей стороне — можно
> добавить удобный алиас и вызывать `npm run build:seo`:
> ```json
> "scripts": {
>   "prerender": "node scripts/prerender.mjs",
>   "build:seo": "vite build && node scripts/prerender.mjs"
> }
> ```

## Требования к окружению

- **Node.js 18+** (используется встроенный `fetch`). На сборочной машине уже есть,
  т.к. проект собирается через Vite.
- На этапе сборки нужен **доступ в интернет** к бэкенд-фиду
  `https://functions.poehali.dev/...` — скрипт тянет из него список категорий и
  товаров. Если сборка идёт в закрытом контуре без интернета — предупредите нас,
  сделаем вариант со статическим JSON.

## Требования к раздаче статики (веб-сервер)

Чтобы боты получали уникальные страницы, сервер должен для вложенных путей
отдавать соответствующий `index.html`, а не корневой. Приоритет такой:

1. Сначала пытаться отдать `dist/<путь>/index.html` (сгенерированный пререндером).
2. Если файла нет — SPA-fallback на `dist/index.html`.

### Nginx (пример)
```nginx
location / {
    root /var/www/meatmassagers/dist;
    # 1) точный файл  2) сгенерированный index.html для этого пути  3) SPA-fallback
    try_files $uri $uri/index.html $uri/ /index.html;
}
```

### Apache (.htaccess)
```apache
RewriteEngine On
# Если существует сгенерированный index.html для пути — отдать его
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI}/index.html -f
RewriteRule ^(.*)$ /$1/index.html [L]
# Иначе SPA-fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
```

> Важно: **не** редиректить все запросы жёстко на `/index.html`. Именно из-за
> этого сканеры и видят одинаковые теги. Сначала — вложенный `index.html`.

## Как проверить, что всё работает

После деплоя (JS не исполняется — как у сканера):
```bash
curl -s https://meatmassagers.ru/blokorezki               | grep -o '<title>[^<]*</title>'
curl -s https://meatmassagers.ru/volchki-myasorubki       | grep -o '<title>[^<]*</title>'
curl -s https://meatmassagers.ru/blokorezki/blokorezka-imb-2300-638 | grep -o '<title>[^<]*</title>'
```
Заголовки должны быть **разными** на каждом URL.

Локально:
```bash
npm run build
node scripts/prerender.mjs
# должно вывести: [prerender] готово. Сгенерировано страниц ... : ~360+
grep -o '<title>[^<]*</title>' dist/blokorezki/index.html
```

## Что покрывает пререндер

- Главная `/`, лендинги `/massagers`, `/injector`, `/slicers`, `/ldogenerator`,
  страница `/contacts`.
- Все категории каталога (`/<категория>`).
- Все товары (`/<категория>/<товар>`).

Всего ~360+ страниц. Список формируется автоматически из фида — при добавлении
новых товаров/категорий ничего править не нужно, просто пересоберите проект.

## Что попадает в HTML каждой страницы (SEO-практики)

- Уникальные `<title>` и `<meta name="description">` (description обрезается до
  ~160 символов по границе слова — под сниппет выдачи).
- `<link rel="canonical">` с абсолютным URL страницы.
- `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">`.
- Open Graph: `og:title/description/url/type/image` + `og:site_name`, `og:locale`.
- Twitter Card: `summary_large_image`.
- Микроразметка `application/ld+json` прямо в HTML:
  - товары — `Product` + `Offer` + `BreadcrumbList`;
  - категории — `CollectionPage` + `ItemList` + `BreadcrumbList`.
  Это видят боты без JavaScript.

## Обслуживание

- Логика формирования тегов в `scripts/prerender.mjs` полностью повторяет
  `src/pages/CategoryPage.tsx` (категории и товары) и статичные страницы.
  Если меняете шаблоны title/description на фронте — синхронно поправьте их в
  скрипте, чтобы теги совпадали.
- Домен, адрес фида и картинка по умолчанию заданы константами в начале файла
  (`SITE`, `CATALOG_FN`, `DEFAULT_IMG`).
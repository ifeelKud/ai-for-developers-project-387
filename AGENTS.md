# Booking Service

## Описание приложения

Система бронирования встреч с двумя ролями:

**Владелец календаря** (один заранее заданный профиль):
- Создаёт типы событий (id, название, описание, длительность)
- Просматривает страницу предстоящих встреч

**Гость** (без регистрации и авторизации):
- Просматривает доступные типы событий
- Выбирает тип → открывает календарь → выбирает свободный слот (14 дней вперёд)
- Создаёт бронирование

**Правила:**
- На одно время — одна запись (любой тип события)
- Слоты доступны только из окна в 14 дней от текущей даты

**Примечание:** Во всём проекте нет регистрации и авторизации.

## Источник истины

TypeSpec-спецификация `spec/booking.tsp` является **жёстким источником истины** для API-контракта. Все изменения API должны вноситься только в этот файл. Фронтенд и Бэкенд синхронизируются через скомпилированный OpenAPI (`tsp-output/`).

## Структура репозитория

- **Корневая директория** — TypeSpec-спецификация API
- **booking-api/** — Fastify бэкенд, реализующий API из TypeSpec
- **booking-ui/** — React/Vite фронтенд, потребляющий сгенерированный OpenAPI
- **e2e/** — Playwright интеграционные тесты

## Порты

- `booking-api/`: 3000
- `booking-ui/`: 5173
- Prism mock (опционально): 4010

## Команды

### Корневая директория
```bash
npm run compile   # Генерирует OpenAPI в tsp-output/
npm run watch     # То же в режиме watch
npm run test:e2e          # Запуск e2e тестов (headless)
npm run test:e2e:ui       # Запуск с UI mode (интерактивный)
npm run test:e2e:headed   # Запуск в видимом браузере
```

### booking-api/
```bash
npm run dev       # Запуск dev сервера (tsx watch)
npm run build     # Компиляция TypeScript
npm run start     # Запуск продакшен сервера
npm run lint      # Линтинг
```

### booking-ui/
```bash
npm run dev                    # Vite dev сервер (port 5173)
npm run generate:types         # Регенерирует типы из tsp-output/@typespec/openapi3/openapi.yaml
npm run build                  # Сборка
npm run lint                   # Линтинг
```

## Порядок работы

1. Изменить `spec/booking.tsp`
2. `npm run compile` в корне → генерирует OpenAPI в `tsp-output/`
3. Обновить бэкенд и фронтенд по сгенерированному OpenAPI:
   - **booking-api/**: адаптировать роуты согласно новому контракту
   - **booking-ui/**: `npm run generate:types` для обновления типов

## Тестирование

### E2E тесты (Playwright)

**Структура:**
```
e2e/
├── playwright.config.ts   # Конфигурация Playwright (webServers, projects)
├── helpers/
│   ├── api.ts             # REST-клиент для API (createEventType, createBooking, etc.)
│   └── date.ts            # Утилиты для работы с датами
├── guest-booking.spec.ts  # E2E сценарии guest-пользователя
└── edge-cases.spec.ts     # Граничные случаи API
```

**Основные сценарии:**
- Создание → просмотр → отмена бронирования
- Double booking → 409 SLOT_OCCUPIED
- Бронирование за пределами 14 дней → 400 SLOT_OUTSIDE_WINDOW
- Пустой guestName → 400 VALIDATION_ERROR
- Несуществующий eventTypeId → 404 NOT_FOUND
- Повторная отмена → 400 VALIDATION_ERROR

**Добавление нового теста:**
1. Определить тип: UI-тест (`page` parameter) или API-тест (только `helpers/api`)
2. UI-тесты: добавить в `guest-booking.spec.ts`
3. API-тесты: добавить в `edge-cases.spec.ts`
4. Использовать `api.createEventType()` для создания тестовых данных

## CI

`.github/workflows/hexlet-check.yml` — автогенерируется Hexlet, **не редактировать и не удалять**.

## Важно

- `tsp-output/` — сгенерированная директория, не коммитится (добавлена в .gitignore)
- Типы фронтенда живут в `booking-ui/src/api/types.ts` — перезаписываются при `generate:types`
- Бэкенд читает OpenAPI из `tsp-output/@typespec/openapi3/openapi.yaml` для валидации контракта
- `e2e/node_modules/`, `e2e/test-results/`, `e2e/playwright-report/` — не коммитятся

## Git

**НИКОГДА** не выполнять `git commit`, `git push`, `git amend` или любые другие git-операции, изменяющие историю репозитория, без **явного** запроса пользователя.

Любая общая команда на действие — «делай», «продолжай», «деплой», «вперёд», «ок», «давай», «запускай», «применяй», «выполняй» и любые другие — **НЕ** является разрешением на коммит или пуш.

Перед любым коммитом:
1. Показать `git status` и `git diff --stat`
2. Спросить: «Закоммитить и запушить?»
3. Дождаться **прямого и однозначного** подтверждения

Это правило не имеет исключений.
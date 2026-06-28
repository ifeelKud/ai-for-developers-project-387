---
name: conventional-commits
description: Use when the user asks to commit and/or push changes. Commits and pushes changes following Conventional Commits specification. Analyzes file changes, determines commit type and scope, forms proper commit messages, and asks for confirmation before pushing.
---

# Conventional Commits

## Когда использовать

Активируй этот skill, когда пользователь просит закоммитить и/или запушить изменения (например, "commit and push", "закоммить", "сделай коммит", "запуш").

## Workflow

1. **Проанализируй изменения** — выполни `git status` и `git diff`, чтобы понять, что изменилось
2. **Определи тип и scope** — используй таблицу Type Mapping ниже
3. **Сформируй сообщение коммита** — следуй правилам Message Rules
4. **Закоммить** — `git add <files>` затем `git commit -m "<message>"`
5. **Спроси перед пушем** — всегда спрашивай подтверждение перед `git push`

## Type Mapping

| Изменённый путь | Тип | Scope |
|---|---|---|
| `booking-api/src/` | `feat` или `fix` | `api` |
| `booking-ui/src/` | `feat` или `fix` | `ui` |
| `spec/` | `feat` или `fix` | `spec` |
| `e2e/` | `test` | `e2e` |
| `.github/workflows/` | `ci` | `github` |
| `package.json`, lockfiles, зависимости | `chore` | `deps` |
| `release-please-*`, `.release-please-*` | `chore` | `release` |
| `AGENTS.md`, `README.md`, документация | `docs` | имя файла без расширения |
| Корневые конфиги (`tspconfig.yaml` и др.) | `chore` | `config` |

**Breaking changes** — добавь `!` к типу: `feat!:`, `fix!:`, `refactor!:`

## Message Rules

- **Язык**: только английский
- **Scope**: всегда указывай в скобках после типа
- **Описание**: первая буква строчная, без точки в конце, повелительное наклонение (imperative mood)
- **Формат**: `<type>(<scope>): <description>`
- **Breaking changes**: `<type>(<scope>)!: <description>` + `BREAKING CHANGE: <details>` в теле коммита

## Примеры

```
fix(api): handle null guestName in booking creation
feat(ui): add 14-day availability window indicator
test(e2e): add double booking scenario
ci(github): add release-please workflow
chore(deps): update fastify to v5.3.2
docs(AGENTS.md): add testing section
feat(api)!: change response format to paginated

BREAKING CHANGE: API now returns { data, count } instead of plain array
```

# Тренировки: расхождения фронтенда и бэкенда

## Общая картина

Бэкенд поддерживает: `title`, `notes`, `weight_before`, `duration`, `completed_at`, `created_at`.
Фронтенд использует не всё, а бэкенд не отдаёт некоторые нужные данные.

---

## 1. Баги на фронтенде (потеря данных)

### 1.1 Название для свободной тренировки игнорируется
- Пользователь вводит название в модалке
- `startFreeMode()` в store хардкодит `title: 'Свободная тренировка'`
- **Fix (фронт):** передать пользовательский `title` в `startFreeMode()`

### 1.2 Заметки не передаются при старте по плану
- `startFromPlan(plan, weight?, notes?)` — параметр `notes` добавили в модалку, но store-метод принимает только `(plan, weight?)`
- **Fix (фронт):** добавить `notes` параметр в `startFromPlan()` и `startFreeMode()`, передавать в `workoutApi.create()`

### 1.3 Заметки не передаются при свободной тренировке
- `WorkoutSetupPage` получает `notes` через query param, но не передаёт в `startFreeMode()`
- **Fix (фронт):** прочитать query param и передать в store

---

## 2. Фронтенд не показывает то, что бэкенд уже отдаёт

### 2.1 Заметки (`notes`) не отображаются в деталях тренировки
- Бэкенд возвращает `notes` в `GET /workouts/{id}`
- `WorkoutDetailPage` не показывает их
- **Fix (фронт):** добавить секцию "Заметки" в WorkoutDetailPage

### 2.2 Заметки не отображаются в списке тренировок
- `WorkoutItem` показывает только title и date
- **Fix (фронт):** опционально — добавить превью заметки

---

## 3. Duration — никто не считает

### Проблема
- Поле `duration` (INTEGER, минуты) есть в БД, бэкенд его возвращает
- **Бэкенд никогда не ставит** `duration` — при `POST /workouts/{id}/complete` обновляет только `completed_at`
- **Фронтенд никогда не отправляет** `duration`
- Результат: поле всегда `NULL`

### Варианты решения

**Вариант A — Бэкенд считает при завершении (рекомендуется):**
- В `CompleteSession` вычислять: `duration = (now() - created_at) / 60`
- Сохранять в `duration` вместе с `completed_at`
- **Fix (бэкенд):** изменить SQL в `training_repository.go` → `CompleteSession`:
  ```sql
  UPDATE training_sessions
  SET completed_at = now(),
      duration = EXTRACT(EPOCH FROM (now() - created_at)) / 60
  WHERE id = $1
  RETURNING ...
  ```

**Вариант B — Фронтенд считает и отправляет:**
- При завершении фронтенд знает `startedAt` (хранит в store)
- Можно вычислить `duration = Math.round((Date.now() - startedAt) / 60000)`
- Но нет API для обновления `duration` после создания

**Рекомендация:** Вариант A — бэкенд считает автоматически, фронтент ничего не делает.

---

## 4. Имена упражнений в подходах

### Проблема
- `GET /workouts/{id}` возвращает `sets[]` с `exercise_id`, но **без `exercise_name`**
- Фронтенд показывает `Упражнение #${exercise_id}` — плохой UX

### Варианты решения

**Вариант A — Бэкенд добавляет имена (рекомендуется):**
- JOIN с таблицей `exercises` при запросе сетов
- Добавить `exercise_name` в `TrainingSetResponse` в schema.yaml
- **Fix (бэкенд):** изменить SQL в `GetSessionSets`:
  ```sql
  SELECT ts.*, e.name as exercise_name
  FROM training_sets ts
  JOIN exercises e ON e.id = ts.exercise_id
  WHERE ts.training_session_id = $1
  ORDER BY ts.exercise_order, ts.set_order
  ```
- **Fix (schema.yaml):** добавить `exercise_name: string` в `TrainingSetResponse`
- **Fix (фронт):** обновить тип `TrainingSetResponse`, использовать в `WorkoutDetailPage`

**Вариант B — Фронтенд запрашивает отдельно:**
- При загрузке деталей тренировки вызвать `GET /exercises`
- Сопоставить `exercise_id` с именами
- Минус: лишний запрос, может не найти удалённые упражнения

**Рекомендация:** Вариант A — JOIN на бэкенде.

---

## 5. `created_at` не возвращается в API

### Проблема
- Поле `created_at` хранится в БД (DEFAULT now())
- API response **не включает** `created_at` в `WorkoutSession`
- Фронтенд не может точно рассчитать длительность (если выбрать Вариант B для duration)

### Fix (бэкенд):
- Добавить `created_at` в `WorkoutSession` response schema
- Добавить поле в Go-модель ответа

### Fix (фронт):
- Добавить `created_at?: string` в тип `WorkoutSession`
- Использовать для расчёта длительности (если Вариант B)

---

## Сводная таблица изменений

### Фронтенд

| Файл | Что сделать |
|------|------------|
| `entities/workout/model/activeWorkout.ts` | Добавить `title` и `notes` параметры в `startFromPlan()` и `startFreeMode()`, передавать в `workoutApi.create()` |
| `pages/workouts/ui/StartWorkoutModal.vue` | Передать `title` и `notes` в store при обоих режимах |
| `pages/workouts/ui/WorkoutSetupPage.vue` | Прочитать `title`/`notes` из query и передать в `startFreeMode()` |
| `pages/workouts/ui/WorkoutDetailPage.vue` | Показать `notes`, использовать `exercise_name` из API (когда бэкенд добавит) |
| `pages/workouts/ui/WorkoutItem.vue` | Показать длительность и кол-во упражнений если есть |
| `shared/types/index.ts` | Добавить `exercise_name?` в `TrainingSetResponse`, `created_at?` в `WorkoutSession` |

### Бэкенд

| Файл | Что сделать |
|------|------------|
| `internal/training/repository/training_repository.go` → `CompleteSession` | Вычислять `duration = (now() - created_at) / 60` при завершении |
| `internal/training/repository/training_repository.go` → `GetSessionSets` | JOIN с `exercises` для получения `exercise_name` |
| `internal/training/model/training.go` | Добавить `ExerciseName` в модель TrainingSet, `CreatedAt` в ответ сессии |
| `api/schema.yaml` | Добавить `exercise_name` в `TrainingSetResponse`, `created_at` в `WorkoutSession` |

### Приоритеты

| Приоритет | Задача |
|-----------|--------|
| **P0** | Fix баги потери данных (title/notes не передаются) — **только фронтенд** |
| **P1** | Duration — бэкенд считает при complete |
| **P1** | Exercise names — бэкенд добавляет JOIN |
| **P2** | created_at в API response |
| **P2** | Отображение notes в деталях тренировки |

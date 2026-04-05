# План реализации всех экранов Trainify

## Контекст

Фронтенд Trainify — PWA-приложение для фитнес-тренировок. Сейчас реализованы только страницы Login/Register и placeholder Home. Нужно реализовать все оставшиеся экраны из Pencil-дизайна (~25 экранов desktop+mobile) с полной интеграцией с backend API (`schema.yaml`). Архитектура — Feature-Sliced Design.

---

## Фаза 0 — Фундамент (~20 файлов)

### 0A. Дизайн-токены в Tailwind
**Файл:** `src/app/styles/index.css` — добавить `@theme` блок (Tailwind v4) с CSS-переменными цветов из дизайна, чтобы использовать `bg-card`, `text-secondary` и т.д. вместо хардкода hex.

### 0B. Общие TypeScript-типы
**Файл:** `src/shared/types/index.ts` — все интерфейсы из OpenAPI: `Exercise`, `WorkoutSession`, `WorkoutSessionDetail`, `TrainingSet`, `TrainingSetResponse`, `ProgressPoint`, `PersonalRecord`, `WorkoutPlan`, `PlanExercise`, `WorkoutPlanDetail`, `User`.

### 0C. Новые shared UI-компоненты (8 шт.)
| Компонент | Файл | Описание |
|-----------|------|----------|
| AppSelect | `shared/ui/AppSelect.vue` | Dropdown, стилизация как AppInput |
| Card | `shared/ui/Card.vue` | Обёртка `bg-card border rounded-2xl p-6`, slot |
| Badge | `shared/ui/Badge.vue` | Пилл с вариантами success/warning/error/info |
| Modal | `shared/ui/Modal.vue` | Teleport, backdrop, Escape, transition |
| ConfirmDialog | `shared/ui/ConfirmDialog.vue` | Modal + кнопки Cancel/Confirm |
| EmptyState | `shared/ui/EmptyState.vue` | Иконка + текст + CTA кнопка |
| Pagination | `shared/ui/Pagination.vue` | Страницы + prev/next |
| SearchInput | `shared/ui/SearchInput.vue` | Input с иконкой поиска |

Обновить `shared/ui/index.ts` — добавить реэкспорты.

### 0D. Toast-система
- `shared/ui/Toast.vue` + `shared/ui/ToastContainer.vue`
- `shared/lib/useToast.ts` — composable `{ success(), error(), info() }`
- Добавить `<ToastContainer />` в `app/App.vue`

### 0E. JWT-декодер
- `shared/lib/decodeJwt.ts` — парсинг payload JWT без библиотек (atob)

### 0F. Расширение auth store
**Файл:** `features/auth/model/index.ts` (модификация) — добавить:
- `user: ref<User | null>` (из decoded JWT)
- `isAdmin: computed`
- `initAuth()` — восстановление сессии из localStorage при старте

### 0G. Роутер + guards
**Файл:** `app/providers/router.ts` (переписать) — три группы роутов:
- **Guest** (`/login`, `/register`, `/forgot-password`, `/reset-password`) — `meta: { guest: true }`
- **Auth** (`/`, `/workouts`, `/plans`, `/exercises`, `/analytics`, `/profile`) — обёрнуты в `MainLayout`, `meta: { requiresAuth: true }`
- **Admin** (`/admin/users`, `/admin/exercises`, `/admin/stats`) — `meta: { requiresAuth: true, requiresAdmin: true }`

Guard: неавторизован → `/login`, гость на auth-странице → `/`, не-админ на admin → `/`

### 0H. Layout-виджеты
| Компонент | Файл | Описание |
|-----------|------|----------|
| MainLayout | `widgets/layouts/MainLayout.vue` | Sidebar (desktop md+) + BottomNav (mobile) + `<router-view>` |
| TheSidebar | `widgets/sidebar/TheSidebar.vue` | 240px, лого, навигация, logout. Секция "Админ" по условию `isAdmin` |
| NavItem | `widgets/sidebar/NavItem.vue` | Ссылка: иконка + текст, active state по текущему route |
| TheBottomNav | `widgets/bottom-nav/TheBottomNav.vue` | 5 иконок + FAB (создать тренировку), `md:hidden` |

---

## Фаза 1 — Забыли пароль (3 файла)

- `pages/forgot-password/ui/ForgotPasswordPage.vue` — форма с email, кнопка "Отправить ссылку", success-сообщение, ссылка назад
- `pages/forgot-password/ui/ResetPasswordPage.vue` — новый пароль + подтверждение, токен из query params
- `pages/forgot-password/index.ts`
- Добавить `forgotPassword()`, `resetPassword()` в `features/auth/api/index.ts` (заглушки — эндпоинтов нет в schema)

---

## Фаза 2 — Entity-слой + Feature API (~18 файлов)

### Entities (по 3 файла: api, model, index)
| Entity | Store | API-методы |
|--------|-------|------------|
| exercise | `useExerciseStore` | `list(filters?)`, `create(data)` |
| workout | `useWorkoutStore` | `list(params?)`, `get(id)`, `create(data)`, `addSets(id, sets)`, `complete(id)` |
| plan | `usePlanStore` | `list()`, `get(id)`, `create(data)`, `update(id, data)`, `delete(id)` |

### Features (по 3 файла)
| Feature | Store | Заметка |
|---------|-------|---------|
| analytics | `useAnalyticsStore` | `getProgress(exercise_id, period)`, `getRecords()` |
| profile | `useProfileStore` | Заглушки — нет эндпоинтов в schema |
| admin | `useAdminStore` | Заглушки — нет эндпоинтов в schema |

---

## Фаза 3 — Dashboard (6 файлов)

**Установить:** `chart.js` + `vue-chartjs`

- `pages/dashboard/ui/DashboardPage.vue` — метрики + график + AI-карточка + последние тренировки
- `pages/dashboard/ui/MetricCard.vue` — иконка + значение + подпись
- `pages/dashboard/ui/ProgressChart.vue` — линейный график (vue-chartjs)
- `pages/dashboard/ui/AiRecommendation.vue` — карточка с рекомендацией
- `pages/dashboard/ui/RecentWorkoutsList.vue` — список тренировок
- `pages/dashboard/index.ts`

Desktop: 4 метрики в ряд → 2 колонки (график + AI) → список. Mobile: одна колонка.

---

## Фаза 4 — Тренировки (10 файлов)

### 4A. Список тренировок
- `pages/workouts/ui/WorkoutsPage.vue` — поиск, фильтры, список, пагинация
- `pages/workouts/ui/WorkoutItem.vue` — строка тренировки

### 4B. Детали тренировки
- `pages/workouts/ui/WorkoutDetailPage.vue` — метрики, список упражнений с подходами
- `pages/workouts/ui/ExerciseSetGroup.vue` — группа подходов по упражнению

### 4C. Активная тренировка (mobile-first)
- `pages/workouts/ui/ActiveWorkoutPage.vue` — таймер, прогресс, ввод подхода, отдых
- `pages/workouts/ui/WorkoutTimer.vue` — setInterval-таймер
- `pages/workouts/ui/ExerciseProgress.vue` — progress bar
- `pages/workouts/ui/SetInput.vue` — вес + повторения
- `pages/workouts/ui/RestTimer.vue` — обратный отсчёт
- `pages/workouts/index.ts`

---

## Фаза 5 — Планы (5 файлов)

- `pages/plans/ui/PlansPage.vue` — сетка карточек планов + создание
- `pages/plans/ui/PlanCard.vue` — карточка плана
- `pages/plans/ui/PlanEditorPage.vue` — создание/редактирование (route param `id`)
- `pages/plans/ui/PlanExerciseItem.vue` — строка упражнения в плане
- `pages/plans/ui/ExercisePickerModal.vue` — модалка выбора упражнения
- `pages/plans/index.ts`

---

## Фаза 6 — Библиотека упражнений (4 файла)

- `pages/exercises/ui/ExercisesPage.vue` — поиск, фильтры, сетка карточек
- `pages/exercises/ui/ExerciseCard.vue` — карточка упражнения
- `pages/exercises/ui/CreateExerciseModal.vue` — форма создания
- `pages/exercises/index.ts`

---

## Фаза 7 — Аналитика (6 файлов)

- `pages/analytics/ui/AnalyticsPage.vue` — селектор + графики + рекорды
- `pages/analytics/ui/ExerciseSelector.vue` — AppSelect с упражнениями
- `pages/analytics/ui/PeriodTabs.vue` — табы Неделя/Месяц/Год
- `pages/analytics/ui/WeightChart.vue` — линейный график (max weight)
- `pages/analytics/ui/VolumeChart.vue` — столбчатый график (volume)
- `pages/analytics/ui/PersonalRecordsTable.vue` — таблица рекордов
- `pages/analytics/index.ts`

---

## Фаза 8 — Профиль (5 файлов)

- `pages/profile/ui/ProfilePage.vue` — аватар, форма профиля, смена пароля, logout
- `pages/profile/ui/AvatarUpload.vue` — круглый аватар + загрузка
- `pages/profile/ui/ProfileForm.vue` — имя, email, вес, рост
- `pages/profile/ui/ChangePasswordForm.vue` — текущий/новый/подтверждение
- `pages/profile/index.ts`

---

## Фаза 9 — Админ-панель (7 файлов)

- `pages/admin/ui/AdminUsersPage.vue` — таблица пользователей с фильтрами
- `pages/admin/ui/UserRow.vue` — строка пользователя
- `pages/admin/ui/AdminExercisesPage.vue` — модерация упражнений
- `pages/admin/ui/ExerciseModerationCard.vue` — карточка модерации
- `pages/admin/ui/AdminStatsPage.vue` — метрики платформы + график
- `pages/admin/ui/PlatformMetricCard.vue` — метрика
- `pages/admin/ui/ActivityChart.vue` — график активности
- `pages/admin/index.ts`

---

## Порядок зависимостей

```
Фаза 0 (фундамент)
  ├── Фаза 1 (forgot password)
  └── Фаза 2 (entity/feature слои)
        ├── Фаза 3 (dashboard)    ─┐
        ├── Фаза 4 (тренировки)    │
        ├── Фаза 5 (планы)        │── параллельно
        ├── Фаза 6 (упражнения)    │
        ├── Фаза 7 (аналитика)    │
        ├── Фаза 8 (профиль)      │
        └── Фаза 9 (админ)        ─┘
```

## NPM-пакеты к установке
- `chart.js` + `vue-chartjs` (Фаза 3)

## Известные ограничения
- **Нет backend-эндпоинтов** для: профиль (`/users/me`), admin (`/admin/*`), forgot-password (`/users/forgot-password`). API-слой делаем с правильными типами, UI обрабатывает ошибки через toast.
- **JWT payload** — предполагаем `{ id, email, role }`. Нужно проверить с реальным токеном.
- **Active Workout** — самый сложный экран. Выделить composable `useActiveWorkout` для управления state machine.

## Верификация
После каждой фазы:
1. `npx vue-tsc -b` — проверка типов
2. `npx vite build` — сборка
3. Ручная проверка в браузере: desktop (1440px) + mobile (390px)
4. Сравнение с Pencil-скриншотами

Итого: **~75 новых/изменённых файлов** across 10 фаз.

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // Guest routes
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login/ui/LoginPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/register/ui/RegisterPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/pages/forgot-password/ui/ForgotPasswordPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/pages/forgot-password/ui/ResetPasswordPage.vue'),
    meta: { guest: true },
  },

  // Authenticated routes (with MainLayout)
  {
    path: '/',
    component: () => import('@/widgets/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/dashboard/ui/DashboardPage.vue'),
      },
      {
        path: 'workouts',
        name: 'workouts',
        component: () => import('@/pages/workouts/ui/WorkoutsPage.vue'),
      },
      {
        path: 'workouts/new',
        name: 'start-workout',
        component: () => import('@/pages/workouts/ui/StartWorkoutPage.vue'),
      },
      {
        path: 'workouts/select-plan',
        name: 'select-plan',
        component: () => import('@/pages/workouts/ui/SelectPlanPage.vue'),
      },
      {
        path: 'workouts/setup',
        name: 'workout-setup',
        component: () => import('@/pages/workouts/ui/WorkoutSetupPage.vue'),
      },
      {
        path: 'workouts/active',
        name: 'active-workout',
        component: () => import('@/pages/workouts/ui/ActiveWorkoutPage.vue'),
      },
      {
        path: 'workouts/finish',
        name: 'workout-finish',
        component: () => import('@/pages/workouts/ui/WorkoutFinishPage.vue'),
      },
      {
        path: 'workouts/:id',
        name: 'workout-detail',
        component: () => import('@/pages/workouts/ui/WorkoutDetailPage.vue'),
      },
      {
        path: 'plans',
        name: 'plans',
        component: () => import('@/pages/plans/ui/PlansPage.vue'),
      },
      {
        path: 'plans/new',
        name: 'plan-new',
        component: () => import('@/pages/plans/ui/PlanEditorPage.vue'),
      },
      {
        path: 'plans/:id/edit',
        name: 'plan-edit',
        component: () => import('@/pages/plans/ui/PlanEditorPage.vue'),
      },
      {
        path: 'exercises',
        name: 'exercises',
        component: () => import('@/pages/exercises/ui/ExercisesPage.vue'),
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('@/pages/analytics/ui/AnalyticsPage.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/profile/ui/ProfilePage.vue'),
      },
    ],
  },

  // Admin routes (with MainLayout)
  {
    path: '/admin',
    component: () => import('@/widgets/layouts/MainLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/pages/admin/ui/AdminUsersPage.vue'),
      },
      {
        path: 'exercises',
        name: 'admin-exercises',
        component: () => import('@/pages/admin/ui/AdminExercisesPage.vue'),
      },
      {
        path: 'stats',
        name: 'admin-stats',
        component: () => import('@/pages/admin/ui/AdminStatsPage.vue'),
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('access_token')
  const isAuthenticated = !!token

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.guest && isAuthenticated) {
    return { name: 'dashboard' }
  }

  if (to.meta.requiresAdmin && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'admin') return { name: 'dashboard' }
    } catch {
      return { name: 'login' }
    }
  }
})

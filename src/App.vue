<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-inner">
        <div class="brand">
          <div class="brand__logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h1 class="brand__title">
            CRUD Pro
          </h1>
        </div>

        <nav class="nav-menu">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
          >
            <el-icon class="nav-item__icon">
              <component :is="item.icon" />
            </el-icon>
            <span class="nav-item__label">{{ item.label }}</span>
          </router-link>
        </nav>

        <div class="header-right">
          <button class="theme-toggle" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'" @click="toggleTheme">
            <transition name="rotate" mode="out-in">
              <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            </transition>
          </button>
          <div class="user-profile">
            <div class="avatar">
              <span>F</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { Search, Document, DataAnalysis } from "@element-plus/icons-vue"

const navItems = [
  { path: "/crud", label: "CRUD 演示", icon: DataAnalysis },
  { path: "/form", label: "表单演示", icon: Document },
  { path: "/search", label: "搜索演示", icon: Search },
]

const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add("dark")
    localStorage.setItem("theme", "dark")
  }
  else {
    document.documentElement.classList.remove("dark")
    localStorage.setItem("theme", "light")
  }
}

onMounted(() => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  handleThemeChange(mediaQuery)
  mediaQuery.addEventListener("change", handleThemeChange)
})

onUnmounted(() => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  mediaQuery.removeEventListener("change", handleThemeChange)
})

function handleThemeChange(e: MediaQueryListEvent | MediaQueryList) {
  const savedTheme = localStorage.getItem("theme")
  const systemDark = e.matches

  if (savedTheme === "dark" || (!savedTheme && systemDark)) {
    isDark.value = true
    document.documentElement.classList.add("dark")
  }
  else {
    isDark.value = false
    document.documentElement.classList.remove("dark")
  }
}
</script>

<style scoped>
/*
  Gaming / Sci-Fi Theme
  Aesthetic: Cyberpunk, High-Tech, Neon, Deep Space
*/
:global(:root) {
  /* --- Tech Light Mode (Clean, Lab-like) --- */
  --color-bg-app: #f1f5f9; /* Slate 100 */
  --color-bg-surface: #ffffff;

  --color-text-primary: #0f172a; /* Slate 900 */
  --color-text-secondary: #475569; /* Slate 600 */
  --color-text-tertiary: #94a3b8; /* Slate 400 */
  --color-bg-surface-hover: #e2e8f0;

  /* Neon Blue & Electric Violet */
  --color-primary: #4f46e5; /* Indigo 600 */
  --color-accent: #06b6d4; /* Cyan 500 */
  --color-border: #cbd5e1;

  --header-height: 60px; /* Slightly taller for HUD feel */
  --header-bg: rgba(255, 255, 255, 0.85);
  --header-border: var(--color-border-subtle);
  --color-border-subtle: #e2e8f0;
  --color-primary-hover: #4338ca;
  --color-primary-light: #e0e7ff;

  /* Shadows */
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-glow: 0 0 20px rgba(79, 70, 229, 0.25); /* Blue Glow */

  /* Tech Radius (Squarish) */
  --radius-lg: 12px;
  --radius-md: 6px;
  --radius-sm: 2px;
  --radius-xl: 16px;

  /* Grid Pattern Color */
  --grid-color: rgba(0, 0, 0, 0.03);

  /* --- Legacy Mapping --- */
  --app-bg: var(--color-bg-app);
  --card-bg: var(--color-bg-surface);
  --hover-bg: var(--color-bg-surface-hover);
  --text-sub: var(--color-text-secondary);
  --active-bg: var(--color-primary-light);
  --text-main: var(--color-text-primary);
  --sidebar-bg: var(--color-bg-surface);
  --text-title: var(--color-text-primary);
  --active-text: var(--color-primary);
  --card-border: var(--color-border-subtle);
  --divider-color: var(--color-border-subtle);
  --primary-gradient: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); /* Blue -> Cyan */
  --el-bg-color: var(--color-bg-surface);

  --el-color-primary: var(--color-primary);
  --header-border-color: var(--header-border);
  --el-text-color-primary: var(--color-text-primary);
  --el-text-color-regular: var(--color-text-secondary);
}

:global(html.dark) {
  /* --- Cyberpunk Dark Mode --- */
  --color-bg-app: #030712; /* Gray 950 (Almost Black) */
  --color-bg-surface: #111827; /* Gray 900 */
  --color-text-primary: #f3f4f6; /* Gray 100 */
  --color-text-secondary: #9ca3af; /* Gray 400 */
  --color-text-tertiary: #4b5563; /* Gray 600 */
  --color-bg-surface-hover: #1f2937;

  /* Neon Violet & Cyber Pink */
  --color-primary: #d946ef; /* Fuchsia 500 */
  --color-accent: #8b5cf6; /* Violet 500 */
  --color-border: #374151; /* Gray 700 */
  --color-border-subtle: #1f2937; /* Gray 800 */
  --header-bg: rgba(17, 24, 39, 0.85);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.6);

  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 25px rgba(217, 70, 239, 0.4); /* Pink/Purple Neon Glow */
  --grid-color: rgba(255, 255, 255, 0.03);
  --header-border: #374151;

  --primary-gradient: linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%); /* Fuchsia -> Violet */
  --color-primary-hover: #e879f9;
  --color-primary-light: rgba(217, 70, 239, 0.15);
}

:global(body) {
  margin: 0;
  font-family: "Space Grotesk", "Inter", system-ui, sans-serif; /* Tech font feel if avail, else Inter */
  color: var(--color-text-primary);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  background-color: var(--color-bg-app);
  -webkit-font-smoothing: antialiased;
}

/* Tech Grid Background */
.app-layout {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background-size: 40px 40px; /* Tech Grid */
  background-image: linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
  background-position: center top;
}

/* Header Styles - HUD Style */
.app-header {
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  z-index: 50;
  position: fixed;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--header-border);
  backdrop-filter: blur(12px);
  background-color: var(--header-bg);
  -webkit-backdrop-filter: blur(12px);
}

:global(html.dark) .app-header {
  border-bottom: 1px solid rgba(217, 70, 239, 0.3); /* Neon border in dark mode */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.header-inner {
  height: 100%;
  margin: 0 auto;
  display: flex;
  padding: 0 24px;
  max-width: 1440px;
  align-items: center;
  justify-content: space-between;
}

.brand {
  gap: 12px;
  display: flex;
  align-items: center;
  user-select: none;
  text-decoration: none;
}

.brand__logo {
  width: 36px;
  height: 36px;
  display: flex;
  background: var(--primary-gradient);
  align-items: center;
  border-radius: 8px; /* Tech square-round */
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-glow);
  justify-content: center;
}

/* Glitch/Shine effect on logo */
.brand__logo::after {
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  content: "";
  position: absolute;
  animation: shine 6s infinite;
  transform: skewX(-25deg);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
}

@keyframes shine {
  0% {
    left: -100%;
  }
  20% {
    left: 200%;
  }
  100% {
    left: 200%;
  }
}

.brand__title {
  color: var(--color-text-primary) !important;
  margin: 0;
  font-size: 1.25rem;
  font-family: "Inter", sans-serif;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Navigation - Pill HUD */
.nav-menu {
  gap: 8px;
  border: 1px solid transparent;
  display: flex;
  padding: 4px;
  background: rgba(0, 0, 0, 0.02);
  align-items: center;
  border-radius: 999px;
}

:global(html.dark) .nav-menu {
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.03);
}

.nav-item {
  gap: 8px;
  color: var(--color-text-secondary);
  display: flex;
  padding: 8px 16px;
  position: relative;
  font-size: 0.9rem;
  background: transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  align-items: center;
  font-weight: 600;
  border-radius: 999px;
  text-decoration: none;
}

.nav-item:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-surface-hover);
}

.router-link-active.nav-item {
  color: #ffffff;
  background: var(--primary-gradient);
  box-shadow: var(--shadow-glow);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

:global(html.dark) .router-link-active.nav-item {
  /* In dark mode, gradient is already set by var, just ensuring text contrast */
  color: #ffffff;
}

.nav-item__icon {
  font-size: 1.1em;
}

/* Right Actions */
.header-right {
  gap: 16px;
  display: flex;
  align-items: center;
}

.theme-toggle {
  color: var(--color-text-secondary);
  width: 36px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  height: 36px;
  display: flex;
  padding: 0;
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  align-items: center;
  border-radius: 8px;
  justify-content: center;
}

.theme-toggle:hover {
  color: var(--color-primary);
  box-shadow: 0 0 10px var(--color-primary-light);
  border-color: var(--color-primary);
}

.user-profile .avatar {
  color: white;
  width: 36px;
  border: 2px solid var(--color-bg-surface);
  cursor: pointer;
  height: 36px;
  display: flex;
  font-size: 0.9rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 0 0 2px var(--color-border-subtle);
  transition: all 0.2s ease;
  align-items: center;
  font-weight: 700;
  border-radius: 8px;
  justify-content: center;
}

.user-profile .avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 0 2px var(--color-primary);
}

/* Main Content */
.main-content {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  padding-top: var(--header-height);
}

.content-wrapper {
  margin: 0 auto;
  padding: 24px;
  max-width: 1440px;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.98);
}

.rotate-enter-active,
.rotate-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.rotate-enter-from {
  opacity: 0;
  transform: rotate(-180deg) scale(0.5);
}

.rotate-leave-to {
  opacity: 0;
  transform: rotate(180deg) scale(0.5);
}
</style>

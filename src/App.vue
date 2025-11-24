<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="brand">
        <div class="brand__logo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
        </button>
        <div class="user-profile">
          <div class="avatar">
            F
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
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
/* Global CSS Variables */
:global(:root) {
  --app-bg: #ffffff; /* Cleaner white bg for app, content will have contrast */
  --sidebar-bg: #f8fafc; /* Very subtle gray for sidebar */
  --sidebar-border: #f1f5f9; /* Subtle border */
  --header-bg: #ffffff; /* New variable for header background */
  --header-border: #f1f5f9; /* New variable for header border */
  --hover-bg: #f8fafc;
  --text-sub: #64748b;
  --active-bg: #f1f5f9; /* Slightly darker for active top nav */
  --card-bg: #ffffff;

  --text-main: #334155;
  --text-title: #0f172a;
  --active-text: #0f172a;
  --card-border: #e2e8f0;
  --divider-color: #f1f5f9;
  --app-bg-gradient: radial-gradient(circle at 50% 0%, rgba(120, 119, 198, 0.08), rgba(255, 255, 255, 0) 70%);

  /* Accents */
  --nav-active-color: #2563eb;
  --primary-gradient: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);

  /* Refined Shadows */
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.15);

  /* Radius */
  --radius-lg: 12px;
  --radius-md: 8px;
  --radius-sm: 6px;
  --radius-xl: 16px;

  /* Pattern */
  --dot-color: #e5e7eb;
}

:global(html.dark) {
  --app-bg: #020617; /* Deep dark */
  --sidebar-bg: #0f172a; /* Slightly lighter dark */
  --card-bg: #0f172a;

  --hover-bg: #1e293b;
  --text-sub: #64748b;
  --active-bg: #1e293b;

  --dot-color: #1e293b;
  --header-bg: #0f172a;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.5);

  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.5);

  --text-main: #94a3b8;
  --text-title: #f8fafc;
  --active-text: #f8fafc;
  --card-border: #1e293b;
  --shadow-glow: 0 0 30px rgba(56, 189, 248, 0.1);
  --divider-color: #1e293b;
  --header-border: #1e293b;
  --sidebar-border: #1e293b;
  --app-bg-gradient: radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.08), rgba(2, 6, 23, 0) 70%);
  --nav-active-color: #60a5fa;
}

:global(body) {
  color: var(--text-main);
  margin: 0;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    sans-serif;
  background-color: var(--app-bg);
  background-image: var(--app-bg-gradient);
  background-attachment: fixed;
  -webkit-font-smoothing: antialiased;
}

/* Global Dot Pattern */
:global(.dot-pattern) {
  background-size: 20px 20px;
  background-image: radial-gradient(var(--dot-color) 1px, transparent 1px);
}

.app-layout {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

/* Header Styles */
.app-header {
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  padding: 0 24px;
  z-index: 50;
  position: fixed;
  background: var(--header-bg);
  align-items: center;
  border-bottom: 1px solid var(--header-border);
  backdrop-filter: blur(8px);
}

:global(html.dark) .app-header {
  background: rgba(15, 23, 42, 0.8);
}

.brand {
  gap: 12px;
  display: flex;
  align-items: center;
  margin-right: 48px;
}

.brand__logo {
  width: 32px;
  height: 32px;
  display: flex;
  background: var(--primary-gradient);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  align-items: center;
  border-radius: 8px;
  justify-content: center;
}

.brand__title {
  color: var(--text-title);
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.nav-menu {
  gap: 8px;
  flex: 1;
  display: flex;
  align-items: center;
}

.nav-item {
  gap: 8px;
  color: var(--text-sub);
  display: flex;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.2s ease;
  align-items: center;
  font-weight: 500;
  border-radius: 999px;
  text-decoration: none;
}

.nav-item:hover {
  color: var(--text-title);
  background-color: var(--hover-bg);
}

.router-link-active.nav-item {
  color: var(--nav-active-color);
  box-shadow: none;
  background-color: var(--active-bg);
}

.nav-item__icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.header-right {
  gap: 16px;
  display: flex;
  align-items: center;
}

.theme-toggle {
  color: var(--text-sub);
  border: none;
  cursor: pointer;
  display: flex;
  padding: 8px;
  background: transparent;
  transition: all 0.2s;
  align-items: center;
  border-radius: 50%;
  justify-content: center;
}

.theme-toggle:hover {
  color: var(--text-title);
  background-color: var(--hover-bg);
}

.user-profile {
  display: flex;
  align-items: center;
}

.avatar {
  color: white;
  width: 32px;
  cursor: pointer;
  height: 32px;
  display: flex;
  font-size: 14px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 0 0 2px var(--app-bg);
  align-items: center;
  font-weight: 600;
  border-radius: 50%;
  justify-content: center;
}

/* Main Content */
.main-content {
  flex: 1;
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  margin-top: 64px;
  margin-left: auto;
  padding-top: 0;
  margin-right: auto;
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

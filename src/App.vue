<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand__logo">FD</span>
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
          <i class="nav-item__icon" :class="item.icon"></i>
          <span class="nav-item__label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="theme-toggle" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'" @click="toggleTheme">
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          <span>{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>
        <p class="version">
          v1.0.0
        </p>
      </div>
    </aside>

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
import { ref, onMounted } from "vue"

const navItems = [
  { path: "/crud", label: "CRUD 演示", icon: "i-crud" },
  { path: "/form", label: "表单演示", icon: "i-form" },
  { path: "/search", label: "搜索演示", icon: "i-search" },
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
  const savedTheme = localStorage.getItem("theme")
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches

  if (savedTheme === "dark" || (!savedTheme && systemDark)) {
    isDark.value = true
    document.documentElement.classList.add("dark")
  }
  else {
    isDark.value = false
    document.documentElement.classList.remove("dark")
  }
})
</script>

<style scoped>
/* Global CSS Variables */
:global(:root) {
  --app-bg: #f8fafc;
  --card-bg: #ffffff;
  --hover-bg: #f1f5f9;
  --text-sub: #64748b;
  --active-bg: #eff6ff;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --text-main: #334155;
  --sidebar-bg: #ffffff;
  --text-title: #0f172a;
  --active-text: #2563eb;
  --card-border: #e2e8f0;
  --divider-color: #f1f5f9;
  --sidebar-border: #e2e8f0;
}

:global(html.dark) {
  --app-bg: #0f172a;
  --card-bg: #1e293b;
  --hover-bg: #334155;
  --text-sub: #94a3b8;
  --active-bg: #1e3a8a;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --text-main: #e2e8f0;
  --sidebar-bg: #1e293b;
  --text-title: #f8fafc;
  --active-text: #60a5fa;
  --card-border: #334155;
  --divider-color: #334155;
  --sidebar-border: #334155;
}

:global(body) {
  color: var(--text-main);
  margin: 0;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  font-family:
    "Inter",
    "PingFang SC",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  background-color: var(--app-bg);
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

/* Sidebar Styles */
.sidebar {
  top: 0;
  left: 0;
  width: 240px;
  bottom: 0;
  display: flex;
  z-index: 10;
  position: fixed;
  background: var(--sidebar-bg);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
  border-right: 1px solid var(--sidebar-border);
  flex-direction: column;
}

.brand {
  gap: 12px;
  display: flex;
  padding: 24px;
  align-items: center;
  border-bottom: 1px solid var(--divider-color);
}

.brand__logo {
  color: white;
  width: 32px;
  height: 32px;
  display: flex;
  font-size: 14px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  align-items: center;
  font-weight: 700;
  border-radius: 8px;
  justify-content: center;
}

.brand__title {
  color: var(--text-title);
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.nav-menu {
  gap: 4px;
  flex: 1;
  display: flex;
  padding: 24px 16px;
  flex-direction: column;
}

.nav-item {
  color: var(--text-sub);
  display: flex;
  padding: 10px 12px;
  transition: all 0.2s ease;
  align-items: center;
  font-weight: 500;
  border-radius: 8px;
  text-decoration: none;
}

.nav-item:hover {
  color: var(--text-main);
  background-color: var(--hover-bg);
}

.router-link-active.nav-item {
  color: var(--active-text);
  background-color: var(--active-bg);
}

.nav-item__icon {
  width: 20px;
  height: 20px;
  opacity: 0.5;
  margin-right: 12px;
  border-radius: 4px;
  background-color: currentColor;
}

.sidebar-footer {
  gap: 12px;
  display: flex;
  padding: 16px;
  border-top: 1px solid var(--divider-color);
  align-items: center;
  flex-direction: column;
}

.theme-toggle {
  gap: 8px;
  color: var(--text-sub);
  width: 100%;
  border: 1px solid var(--divider-color);
  cursor: pointer;
  display: flex;
  padding: 8px 16px;
  font-size: 13px;
  transition: all 0.2s ease;
  align-items: center;
  border-radius: 6px;
  justify-content: center;
  background-color: transparent;
}

.theme-toggle:hover {
  color: var(--text-main);
  border-color: var(--sidebar-border);
  background-color: var(--hover-bg);
}

.version {
  color: var(--text-sub);
  margin: 0;
  opacity: 0.7;
  font-size: 12px;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  margin-left: 240px; /* Match sidebar width */
  padding: 32px;
  max-width: 1600px; /* Prevent stretching too wide on huge screens */
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

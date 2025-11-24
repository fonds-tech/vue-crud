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
          <el-icon class="nav-item__icon">
            <component :is="item.icon" />
          </el-icon>
          <span class="nav-item__label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="theme-toggle" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'" @click="toggleTheme">
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          <span>{{ isDark ? 'Light' : 'Dark' }}</span>
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
  --app-bg: #f9fafb;
  --card-bg: #ffffff;
  --hover-bg: #f2f4f7;
  --text-sub: #667085;
  --active-bg: #eff8ff;
  --shadow-md: 0 4px 6px -2px rgba(16, 24, 40, 0.03), 0 12px 16px -4px rgba(16, 24, 40, 0.08);
  --shadow-sm: 0 1px 3px rgba(16, 24, 40, 0.1), 0 1px 2px rgba(16, 24, 40, 0.06);
  --text-main: #344054;
  --sidebar-bg: #ffffff;
  --text-title: #101828;
  --active-text: #175cd3;
  --card-border: #eaecf0;
  --divider-color: #eaecf0;
  --sidebar-border: #eaecf0;

  /* Radius */
  --radius-lg: 12px;
  --radius-md: 8px;
  --radius-sm: 6px;
}

:global(html.dark) {
  --app-bg: #0b0c0f;
  --card-bg: #15171e;
  --hover-bg: #1f242f;
  --text-sub: #94969c;
  --active-bg: #1a2645;
  --shadow-md: 0 4px 6px -2px rgba(0, 0, 0, 0.4), 0 12px 16px -4px rgba(0, 0, 0, 0.4);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
  --text-main: #cecfd2;
  --sidebar-bg: #111318;
  --text-title: #f5f6f7;
  --active-text: #528bff;
  --card-border: #222630;
  --divider-color: #222630;
  --sidebar-border: #2a2f3a;
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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
  z-index: 20;
  position: fixed;
  background: var(--sidebar-bg);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
  border-right: 1px solid var(--sidebar-border);
  flex-direction: column;
}

.brand {
  gap: 10px;
  height: 64px;
  display: flex;
  padding: 0 20px;
  align-items: center;
  border-bottom: 1px solid var(--divider-color);
}

.brand__logo {
  color: white;
  width: 28px;
  height: 28px;
  display: flex;
  font-size: 13px;
  background: linear-gradient(135deg, #0052d9, #2563eb);
  box-shadow: var(--shadow-sm);
  align-items: center;
  font-weight: 700;
  border-radius: 6px;
  justify-content: center;
}

.brand__title {
  color: var(--text-title);
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.nav-menu {
  gap: 4px;
  flex: 1;
  display: flex;
  padding: 20px 12px;
  flex-direction: column;
}

.nav-item {
  color: var(--text-sub);
  display: flex;
  padding: 8px 12px;
  font-size: 14px;
  transition: all 0.15s ease;
  align-items: center;
  font-weight: 500;
  border-radius: var(--radius-sm);
  text-decoration: none;
}

.nav-item:hover {
  color: var(--text-title);
  background-color: var(--hover-bg);
}

.router-link-active.nav-item {
  color: var(--active-text);
  background-color: var(--active-bg);
}

.nav-item__icon {
  width: 18px;
  height: 18px;
  opacity: 0.6;
  margin-right: 10px;
  /* border-radius and background-color removed to show SVG icon */
}

.sidebar-footer {
  display: flex;
  padding: 16px 20px;
  border-top: 1px solid var(--divider-color);
  align-items: center;
  justify-content: space-between;
  background-color: var(--sidebar-bg);
}

.theme-toggle {
  gap: 8px;
  color: var(--text-sub);
  border: 1px solid var(--divider-color);
  cursor: pointer;
  display: flex;
  padding: 6px 10px;
  font-size: 12px;
  transition: all 0.2s ease;
  align-items: center;
  font-weight: 500;
  border-radius: var(--radius-sm);
  background-color: transparent;
}

.theme-toggle:hover {
  color: var(--text-title);
  border-color: var(--sidebar-border);
  background-color: var(--hover-bg);
}

.version {
  color: var(--text-sub);
  margin: 0;
  opacity: 0.6;
  font-size: 12px;
  font-family: monospace;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  padding: 24px 32px;
  max-width: 1600px;
  margin-left: 240px;
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

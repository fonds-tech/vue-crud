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

        <div class="header-actions">
          <!-- Nav moved to sidebar -->
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
      </div>
    </header>

    <div class="layout-body">
      <aside class="app-sidebar">
        <nav class="nav-menu">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
          >
            <span class="nav-item__label">{{ item.label }}</span>
          </router-link>
        </nav>
      </aside>

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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"

const navItems = [
  { path: "/fd-form", label: "form" },
  { path: "/fd-search", label: "search" },
  { path: "/fd-table", label: "table" },
  { path: "/fd-detail", label: "detail" },
  { path: "/fd-dialog", label: "dialog" },
  { path: "/fd-grid", label: "grid" },
  { path: "/fd-select", label: "select" },
  { path: "/fd-cascader", label: "cascader" },
  { path: "/fd-context-menu", label: "context-menu" },
  { path: "/fd-option", label: "option" },
  { path: "/fd-add-button", label: "add-button" },
  { path: "/fd-delete-button", label: "delete-button" },
  { path: "/fd-import", label: "import" },
  { path: "/fd-upsert", label: "upsert" },
  { path: "/fd-crud", label: "crud" },
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
  HIGH-TECH / SCI-FI THEME
  Concept: "Holographic Dashboard"
  Keywords: Precision, Data, Cyan, Glass, Scanlines
*/
:global(:root) {
  /* --- Light Mode: Clean Lab Tech --- */
  --color-bg-app: #f0f4f8;
  --color-bg-surface: #ffffff;

  --color-text-primary: #0f172a;
  --color-text-tertiary: #94a3b8;
  --color-text-secondary: #475569;
  --color-bg-surface-hover: #eef2f6;

  /* Tech Cyan & Deep Blue */
  --color-primary: #0891b2; /* Cyan 600 */
  --color-accent: #6366f1; /* Indigo */
  --header-bg: rgba(255, 255, 255, 0.8);
  --radius-lg: 6px;
  --radius-md: 4px;

  --radius-sm: 2px;
  --radius-xl: 8px;

  --grid-color: rgba(8, 145, 178, 0.05);
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  --shadow-glow: 0 0 10px rgba(8, 145, 178, 0.2);

  --color-border: #cbd5e1;
  --header-border: #0891b2;

  --header-height: 60px;
  --sidebar-width: 220px;

  --color-border-subtle: #e2e8f0;
  --color-primary-hover: #0e7490;
  --color-primary-light: #cffafe;

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
  --el-bg-color: var(--color-bg-surface);
  --divider-color: var(--color-border-subtle);

  --el-color-primary: var(--color-primary);

  --primary-gradient: linear-gradient(135deg, #0891b2 0%, #6366f1 100%);
  --header-border-color: var(--header-border);
  --el-text-color-primary: var(--color-text-primary);
  --el-text-color-regular: var(--color-text-secondary);
}

:global(html.dark) {
  /* --- Dark Mode: Holographic Interface --- */
  --color-bg-app: #020408; /* Deep Space */
  --color-bg-surface: #0a1018; /* Dark Blue Grey */
  --color-text-primary: #e2e8f0;
  --color-text-tertiary: #475569;
  --color-text-secondary: #94a3b8;
  --color-bg-surface-hover: #111a26;

  /* Holographic Cyan & Laser Blue */
  --color-primary: #00f0ff; /* Electric Cyan */
  --color-accent: #0066ff; /* Laser Blue */
  --header-bg: rgba(2, 4, 8, 0.7);

  --grid-color: rgba(0, 240, 255, 0.08);
  --shadow-card: 0 0 0 1px rgba(0, 240, 255, 0.15), 0 10px 30px -10px rgba(0, 0, 0, 0.5);

  --shadow-glow: 0 0 15px rgba(0, 240, 255, 0.25);

  --color-border: #1e293b;
  --header-border: rgba(0, 240, 255, 0.3);

  --primary-gradient: linear-gradient(135deg, #00f0ff 0%, #0066ff 100%);
  --color-border-subtle: #0f172a;
  --color-primary-hover: #6affff;
  --color-primary-light: rgba(0, 240, 255, 0.15);
}

:global(body) {
  margin: 0;
  /* Tech Font Stack: Clean Sans + Monospace for details */
  color: var(--color-text-primary);
  overflow: hidden; /* Prevent global scroll, use inner scroll */
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  background-color: var(--color-bg-app);
  -webkit-font-smoothing: antialiased;
}

/* Scanline Overlay */
.app-layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
  flex-direction: column;
  background-size: 30px 30px;
  background-image: linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
}

/* Moving Scanline Animation */
.app-layout::after {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  content: "";
  opacity: 0.5;
  z-index: 999;
  position: fixed;
  animation: scanlines 1s linear infinite;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 240, 255, 0.02) 51%, transparent 51%);
  pointer-events: none;
  background-size: 100% 4px;
}

@keyframes scanlines {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 4px;
  }
}

/* Header Styles - Glass Tech */
.app-header {
  position: relative; /* Changed from fixed for flex layout ease, OR keep fixed if desired. Let's use absolute/fixed to overlay z-index */
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  z-index: 50;
  position: fixed;
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--header-border);
  backdrop-filter: blur(16px);
  background-color: var(--header-bg);
  -webkit-backdrop-filter: blur(16px);
}

.header-inner {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  padding: 0 24px;
  box-sizing: border-box;
  align-items: center;
  justify-content: space-between;
}

.brand {
  gap: 12px;
  display: flex;
  min-width: var(--sidebar-width); /* Align logo with sidebar */
  align-items: center;
  user-select: none;
  text-decoration: none;
}

.brand__logo {
  width: 32px;
  border: 1px solid var(--color-primary);
  height: 32px;
  display: flex;
  position: relative;
  background: rgba(0, 240, 255, 0.1);
  box-shadow: var(--shadow-glow);
  align-items: center;
  border-radius: 4px;
  justify-content: center;
}

.brand__logo svg path {
  stroke: var(--color-primary);
}

.brand__title {
  color: var(--color-text-primary) !important;
  margin: 0;
  font-size: 1.125rem;
  font-family: "JetBrains Mono", "Fira Code", monospace; /* Tech Font */
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.header-actions {
  gap: 12px;
  flex: 1;
  display: flex;
  align-items: center;
  margin-left: auto;
  justify-content: flex-end;
}

/* Layout Body (Sidebar + Main) */
.layout-body {
  flex: 1;
  height: calc(100vh - var(--header-height));
  display: flex;
  overflow: hidden;
  margin-top: var(--header-height);
}

/* Sidebar Styles */
.app-sidebar {
  width: var(--sidebar-width);
  display: flex;
  padding: 16px 0;
  box-sizing: border-box;
  overflow-y: auto;
  flex-shrink: 0;
  border-right: 1px solid var(--header-border);
  flex-direction: column;
  backdrop-filter: blur(16px);
  background-color: var(--header-bg);
  /* Scrollbar styling */
  scrollbar-color: var(--color-primary) transparent;
  scrollbar-width: thin;
}

.app-sidebar::-webkit-scrollbar {
  width: 4px;
}
.app-sidebar::-webkit-scrollbar-track {
  background: transparent;
}
.app-sidebar::-webkit-scrollbar-thumb {
  border-radius: 2px;
  background-color: var(--color-primary);
}

/* Navigation - Vertical */
.nav-menu {
  gap: 4px;
  display: flex;
  padding: 0 12px;
  flex-direction: column;
}

.nav-item {
  gap: 12px;
  color: var(--color-text-secondary);
  width: 100%;
  border: 1px solid transparent;
  display: flex;
  padding: 10px 12px;
  position: relative;
  font-size: 0.85rem;
  box-sizing: border-box;
  transition: all 0.2s ease;
  align-items: center;
  font-family: "JetBrains Mono", monospace;
  font-weight: 500;
  border-radius: 4px;
  letter-spacing: 0.05em;
  text-decoration: none;
}

.nav-item:hover {
  color: var(--color-primary);
  transform: translateX(4px);
  background: rgba(0, 240, 255, 0.05);
  border-color: rgba(0, 240, 255, 0.2);
}

.nav-item.router-link-active {
  color: var(--color-primary) !important;
  background: rgba(0, 240, 255, 0.08);
  box-shadow: var(--shadow-glow);
  border-color: var(--color-primary);
}

/* Vertical active indicator */
.nav-item.router-link-active::before {
  top: 50%;
  left: 0;
  width: 3px;
  height: 60%;
  content: "";
  position: absolute;
  transform: translateY(-50%);
  background: var(--color-primary);
  border-radius: 0 2px 2px 0;
}

/* Right Actions */
.header-right {
  gap: 16px;
  display: flex;
  align-items: center;
}

.theme-toggle {
  color: var(--color-text-secondary);
  width: 32px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  height: 32px;
  display: flex;
  padding: 0;
  background: transparent;
  transition: all 0.2s ease;
  align-items: center;
  border-radius: 4px;
  justify-content: center;
}

.theme-toggle:hover {
  color: var(--color-primary);
  box-shadow: var(--shadow-glow);
  border-color: var(--color-primary);
}

.user-profile .avatar {
  color: var(--color-primary);
  width: 32px;
  border: 1px solid var(--color-primary);
  cursor: pointer;
  height: 32px;
  display: flex;
  font-size: 0.85rem;
  background: var(--color-bg-surface);
  transition: all 0.2s ease;
  align-items: center;
  font-family: monospace;
  font-weight: 600;
  border-radius: 4px;
  justify-content: center;
}

.user-profile .avatar:hover {
  color: #000;
  background: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

/* Main Content */
.main-content {
  flex: 1;
  width: 100%;
  padding: 24px;
  position: relative;
  box-sizing: border-box;
  overflow-y: auto;
}

.content-wrapper {
  margin: 0 auto;
  max-width: 1600px;
  padding-bottom: 40px;
}

/* Transitions - Smooth Data Flow */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: scale(0.99);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.99);
}

.rotate-enter-active,
.rotate-leave-active {
  transition: all 0.3s ease;
}

.rotate-enter-from {
  opacity: 0;
  transform: rotate(-90deg);
}

.rotate-leave-to {
  opacity: 0;
  transform: rotate(90deg);
}
</style>

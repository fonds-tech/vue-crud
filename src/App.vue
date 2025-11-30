<template>
  <div class="app">
    <!-- Header -->
    <header class="app__header">
      <div class="app__header-inner">
        <div class="app__brand">
          <div class="app__brand-logo">
            <div class="logo-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M9 12h6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 9v6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          <div class="app__brand-text">
            <h1 class="title">CRUD</h1>
          </div>
        </div>

        <div class="app__header-actions">
          <button class="app__icon-btn" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'" @click="toggleTheme">
            <transition name="rotate" mode="out-in">
              <svg
                v-if="isDark"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </transition>
          </button>
          <div class="app__user-profile">
            <div class="app__avatar">
              <span>A</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="app__body">
      <!-- Sidebar -->
      <aside class="app__sidebar">
        <nav class="app__nav">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="app__nav-item">
            <span class="app__nav-icon">
              <component :is="item.icon" />
            </span>
            <span class="app__nav-item-label">{{ item.label }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="app__main">
        <div class="app__content">
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
import { Cpu, Edit, Grid, Delete, Search, Upload, Message, Pointer, Tickets, DataLine, Document, Operation, CirclePlus, Connection, MoreFilled } from "@element-plus/icons-vue"

const navItems = [
  { path: "/fd-crud", label: "Crud", icon: Cpu },
  { path: "/fd-table", label: "Table", icon: DataLine },
  { path: "/fd-grid", label: "Grid", icon: Grid },
  { path: "/fd-detail", label: "Detail", icon: Tickets },
  { path: "/fd-search", label: "Search", icon: Search },
  { path: "/fd-form", label: "Form", icon: Document },
  { path: "/fd-upsert", label: "Upsert", icon: Edit },
  { path: "/fd-select", label: "Select", icon: Pointer },
  { path: "/fd-cascader", label: "Cascader", icon: Connection },
  { path: "/fd-option", label: "Option", icon: Operation },
  { path: "/fd-import", label: "Import", icon: Upload },
  { path: "/fd-dialog", label: "Dialog", icon: Message },
  { path: "/fd-context-menu", label: "Context Menu", icon: MoreFilled },
  { path: "/fd-add-button", label: "Add Button", icon: CirclePlus },
  { path: "/fd-delete-button", label: "Delete Button", icon: Delete },
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

onMounted(() => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  handleThemeChange(mediaQuery)
  mediaQuery.addEventListener("change", handleThemeChange)
})

onUnmounted(() => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  mediaQuery.removeEventListener("change", handleThemeChange)
})
</script>

<style scoped lang="scss">
/* Theme Variables */
:global(:root) {
  /* Color Palette - Modern Indigo/Slate with better saturation */
  --color-primary: #6366f1; /* Indigo 500 */
  --color-primary-hover: #4f46e5; /* Indigo 600 */
  --color-primary-light: #e0e7ff; /* Indigo 100 - More visible */
  --color-primary-bg: #eef2ff; /* Indigo 50 */
  --color-primary-contrast: #ffffff;

  /* Backgrounds - Softer, cleaner */
  --bg-app: #f8fafc; /* Slate 50 */
  --bg-header: rgba(255, 255, 255, 0.8);
  --bg-sidebar: #ffffff;
  --bg-surface: #ffffff;

  /* Text - Sharper contrast */
  --text-main: #0f172a; /* Slate 900 */
  --text-secondary: #475569; /* Slate 600 */
  --text-muted: #94a3b8; /* Slate 400 */
  --text-group-title: #64748b; /* Slate 500 */

  /* Borders & Separators */
  --border-color: #e2e8f0; /* Slate 200 */
  --divider-color: #f1f5f9;

  /* UI Metrics */
  --radius-lg: 16px;
  --radius-md: 8px;
  --radius-sm: 6px;
  --header-height: 60px;
  --sidebar-width: 260px;

  /* Shadows - Modern, diffused */
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05);

  /* Transitions */
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
}

:global(html.dark) {
  --color-primary: #818cf8; /* Indigo 400 */
  --color-primary-hover: #6366f1; /* Indigo 500 */
  --bg-app: #020617;
  --color-primary-bg: rgba(99, 102, 241, 0.1);
  --color-primary-light: rgba(99, 102, 241, 0.2); /* Slate 950 */
  --bg-surface: #0f172a; /* Slate 900 */
  --bg-header: rgba(2, 6, 23, 0.75);

  --text-main: #f8fafc;
  --bg-sidebar: #0f172a; /* Slate 50 */
  --text-secondary: #cbd5e1; /* Slate 300 */
  --text-muted: #64748b; /* Slate 500 */
  --text-group-title: #475569; /* Slate 600 */

  --border-color: #1e293b; /* Slate 800 */
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --divider-color: #1e293b;
}

.app {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  flex-direction: column;
}

/* --- Header --- */
.app__header {
  height: var(--header-height);
  display: flex;
  padding: 0 24px;
  z-index: 50;
  transition: all 0.3s ease;
  align-items: center;
  /* border-bottom: 1px solid var(--border-color); Removed border for cleaner look */
  box-shadow: var(--shadow-sm); /* Added soft shadow */
  backdrop-filter: blur(20px); /* Increased blur */
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.75); /* More transparent */
  position: relative;
}

:global(html.dark) .app__header {
  background-color: rgba(2, 6, 23, 0.65); /* Dark mode transparency */
  box-shadow: 0 4px 20px -1px rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05); /* Very subtle border in dark mode */
}

.app__header-inner {
  width: 100%;
  display: flex;
  max-width: 1600px;
  align-items: center;
  justify-content: space-between;
}

.app__brand {
  gap: 12px;
  color: var(--text-main);
  display: flex;
  align-items: center;
  user-select: none;
  padding-left: 8px;
  text-decoration: none; /* Minor visual balance */
}

.app__brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-box {
  width: 36px;
  height: 36px;
  display: flex;
  background: linear-gradient(135deg, var(--color-primary), #4f46e5);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: transform 0.2s ease;
  align-items: center;
  border-radius: 10px;
  justify-content: center;
}

.app__brand:hover .logo-box {
  transform: scale(1.05) rotate(3deg);
}

.app__brand-text {
  gap: 8px;
  display: flex;
  align-items: center;
}

.app__brand-text .title {
  color: var(--text-main);
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
}

.app__brand-text .badge {
  color: var(--color-primary);
  border: 1px solid rgba(99, 102, 241, 0.1);
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
  letter-spacing: 0.02em;
  background-color: var(--color-primary-bg);
}

.app__header-actions {
  gap: 12px;
  display: flex;
  align-items: center;
}

.app__icon-btn {
  color: var(--text-secondary);
  width: 36px;
  border: 1px solid transparent;
  cursor: pointer;
  height: 36px;
  display: flex;
  transition: all 0.2s ease;
  align-items: center;
  border-radius: 8px;
  justify-content: center;
  background-color: transparent;

  &:hover {
    color: var(--color-primary);
    background-color: var(--color-primary-bg);
  }
}

.app__user-profile .app__avatar {
  color: #fff;
  width: 34px;
  cursor: pointer;
  height: 34px;
  display: flex;
  font-size: 14px;
  background: linear-gradient(135deg, var(--color-primary), #8b5cf6);
  box-shadow: 0 2px 5px rgba(99, 102, 241, 0.2);
  transition:
    transform 0.2s var(--ease-out-expo),
    box-shadow 0.2s ease;
  align-items: center;
  font-weight: 600;
  border-radius: 10px; /* Soft square */
  position: relative;
  justify-content: center;

  &::after {
    inset: 0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    content: "";
    position: absolute;
    border-radius: inherit;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
  }
}

/* --- Body Layout --- */
.app__body {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* --- Sidebar --- */
.app__sidebar {
  width: var(--sidebar-width);
  display: flex;
  padding: 0;
  overflow-y: auto;
  transition: all 0.3s var(--ease-out-expo);
  flex-shrink: 0;
  border-right: 1px solid var(--border-color);
  flex-direction: column;
  background-color: var(--bg-sidebar);

  /* Clean scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 2px;
  }
  &:hover::-webkit-scrollbar-thumb {
    background: var(--border-color);
  }
}

.app__nav {
  gap: 4px;
  display: flex;
  padding: 24px 16px;
  flex-direction: column;
}

.app__nav-item {
  color: var(--text-secondary);
  display: flex;
  padding: 10px 12px;
  overflow: hidden;
  position: relative;
  font-size: 14px;
  transition: all 0.2s ease;
  align-items: center;
  font-weight: 500;
  border-radius: var(--radius-md);
  text-decoration: none;

  &:hover {
    color: var(--text-main);
    background-color: var(--bg-app);
  }

  &.router-link-active {
    color: var(--color-primary);
    font-weight: 600;
    background-color: var(--color-primary-bg);

    .app__nav-icon {
      color: var(--color-primary);
    }
  }
}

.app__nav-icon {
  color: var(--text-muted);
  width: 20px;
  height: 20px;
  display: flex;
  transition: color 0.2s ease;
  align-items: center;
  margin-right: 12px;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
  }
}

/* --- Main Content --- */
.app__main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  flex-direction: column;
  background-color: var(--bg-app);
}

.app__content {
  flex: 1;
  width: 100%;
  padding: 0;
  position: relative;
  overflow-x: hidden;

  /* Smooth scrollbar for content */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    border: 2px solid transparent;
    border-radius: 4px;
    background-clip: content-box;
    background-color: rgba(148, 163, 184, 0.4);
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(148, 163, 184, 0.6);
  }
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.rotate-enter-active,
.rotate-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.rotate-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}
.rotate-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}
</style>

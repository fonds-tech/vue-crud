<template>
  <div class="app">
    <!-- Header -->
    <header class="app__header">
      <div class="app__header-inner">
        <div class="app__brand">
          <div class="app__brand-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" class="logo-bg" />
              <path d="M12 7L17 12L12 17M7 12H17" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h1 class="app__brand-title">CRUD Pro</h1>
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
  { path: "/fd-form", label: "Form", icon: Document },
  { path: "/fd-search", label: "Search", icon: Search },
  { path: "/fd-table", label: "Table", icon: DataLine },
  { path: "/fd-detail", label: "Detail", icon: Tickets },
  { path: "/fd-dialog", label: "Dialog", icon: Message },
  { path: "/fd-grid", label: "Grid", icon: Grid },
  { path: "/fd-select", label: "Select", icon: Pointer },
  { path: "/fd-cascader", label: "Cascader", icon: Connection },
  { path: "/fd-context-menu", label: "Context Menu", icon: MoreFilled },
  { path: "/fd-option", label: "Option", icon: Operation },
  { path: "/fd-add-button", label: "Add Button", icon: CirclePlus },
  { path: "/fd-delete-button", label: "Delete Button", icon: Delete },
  { path: "/fd-import", label: "Import", icon: Upload },
  { path: "/fd-upsert", label: "Upsert", icon: Edit },
  { path: "/fd-crud", label: "Crud", icon: Cpu },
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
  /* Color Palette - Modern Indigo/Slate */
  --color-primary: #6366f1; /* Indigo 500 */
  --color-primary-hover: #4f46e5; /* Indigo 600 */
  --color-primary-light: #eef2ff; /* Indigo 50 */
  --color-primary-contrast: #ffffff;

  /* Backgrounds */
  --bg-app: #f1f5f9; /* Slate 100 - Soft background */
  --bg-header: rgba(255, 255, 255, 0.85);
  --bg-sidebar: #ffffff;
  --bg-surface: #ffffff;

  /* Text */
  --text-main: #0f172a; /* Slate 900 */
  --text-secondary: #64748b; /* Slate 500 */
  --text-muted: #94a3b8; /* Slate 400 */

  /* Borders & Separators */
  --border-color: #e2e8f0; /* Slate 200 */
  --divider-color: #f1f5f9;

  /* UI Metrics */
  --radius-lg: 16px;
  --radius-md: 10px;
  --radius-sm: 6px;
  --header-height: 64px;
  --sidebar-width: 260px;

  /* Shadows */
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

:global(html.dark) {
  --color-primary: #818cf8; /* Indigo 400 */
  --color-primary-hover: #6366f1; /* Indigo 500 */
  --bg-app: #0f172a;
  --color-primary-light: rgba(99, 102, 241, 0.15); /* Slate 900 */
  --bg-surface: #1e293b; /* Slate 800 */
  --bg-sidebar: #111827; /* Gray 900 - Slightly darker than app bg */
  --bg-header: rgba(15, 23, 42, 0.8);

  --text-main: #f8fafc; /* Slate 50 */
  --text-secondary: #94a3b8; /* Slate 400 */
  --text-muted: #64748b; /* Slate 500 */

  --border-color: #1e293b; /* Slate 800 */
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5);

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
  --divider-color: #1e293b;
}

.app {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
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
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(12px);
  justify-content: center;
  background-color: var(--bg-header);
  -webkit-backdrop-filter: blur(12px);
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
  text-decoration: none;
}

.app__brand-logo {
  color: var(--color-primary);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 28px;
    height: 28px;
    rect {
      opacity: 0.2;
    }
  }
}

.app__brand-title {
  margin: 0;
  font-size: 18px;
  background: linear-gradient(135deg, var(--text-main) 0%, var(--text-secondary) 100%);
  font-weight: 700;
  letter-spacing: -0.02em;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.app__header-actions {
  gap: 16px;
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
  border-radius: 50%;
  justify-content: center;
  background-color: transparent;

  &:hover {
    color: var(--color-primary);
    background-color: var(--color-primary-light);
  }
}

.app__user-profile .app__avatar {
  color: #fff;
  width: 36px;
  border: 2px solid var(--bg-surface);
  cursor: pointer;
  height: 36px;
  display: flex;
  font-size: 14px;
  background: linear-gradient(135deg, var(--color-primary), #8b5cf6);
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.25);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  align-items: center;
  font-weight: 600;
  border-radius: 50%;
  justify-content: center;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.35);
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
  padding: 20px 12px;
  overflow-y: auto;
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
  flex-shrink: 0;
  border-right: 1px solid var(--border-color);
  flex-direction: column;
  background-color: var(--bg-sidebar);

  /* Clean scrollbar */
  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
}

.app__nav {
  gap: 6px;
  display: flex;
  flex-direction: column;
}

.app__nav-item {
  color: var(--text-secondary);
  display: flex;
  padding: 10px 16px;
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
    background-color: var(--color-primary-light);

    .app__nav-icon {
      color: var(--color-primary);
    }

    /* Active Indicator Bar */
    &::before {
      top: 50%;
      left: 0;
      width: 4px;
      height: 20px;
      content: "";
      position: absolute;
      transform: translateY(-50%);
      border-radius: 0 4px 4px 0;
      background-color: var(--color-primary);
    }
  }
}

.app__nav-icon {
  color: var(--text-muted);
  width: 24px;
  height: 24px;
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
  padding: 12px;
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
    background-color: var(--border-color);
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--text-muted);
  }
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.rotate-enter-active,
.rotate-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

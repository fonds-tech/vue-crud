<template>
  <div class="app">
    <!-- Header -->
    <header class="app__header">
      <div class="app__header-inner">
        <div class="app__brand">
          <div class="app__brand-logo">
            <div class="logo-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
import { Cpu, Edit, Grid, Delete, Search, Upload, Message, Pointer, Tickets, DataLine, Document, CirclePlus, Connection, MoreFilled } from "@element-plus/icons-vue"

const navItems = [
  { path: "/crud", label: "Crud", icon: Cpu },
  { path: "/table", label: "Table", icon: DataLine },
  { path: "/grid", label: "Grid", icon: Grid },
  { path: "/detail", label: "Detail", icon: Tickets },
  { path: "/search", label: "Search", icon: Search },
  { path: "/form", label: "Form", icon: Document },
  { path: "/upsert", label: "Upsert", icon: Edit },
  { path: "/select", label: "Select", icon: Pointer },
  { path: "/cascader", label: "Cascader", icon: Connection },
  { path: "/import", label: "Import", icon: Upload },
  { path: "/dialog", label: "Dialog", icon: Message },
  { path: "/context-menu", label: "Context Menu", icon: MoreFilled },
  { path: "/add-button", label: "Add Button", icon: CirclePlus },
  { path: "/delete-button", label: "Delete Button", icon: Delete },
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
  /* Color Palette - Razer Inspired */
  --color-primary: #00c000; /* Vibrant Green (Readable on Light) */
  --color-primary-bg: #f2fff2;
  --color-primary-hover: #009000;
  --color-primary-light: #e6f9e6;
  --color-primary-contrast: #ffffff;

  /* Backgrounds */
  --bg-app: #f5f5f5;
  --bg-header: rgba(255, 255, 255, 0.9);
  --bg-sidebar: #ffffff;
  --bg-surface: #ffffff;

  /* Text */
  --text-main: #000000;
  --text-muted: #757575;
  --text-secondary: #424242;
  --text-group-title: #616161;

  /* Borders & Separators */
  --border-color: #e0e0e0;
  --divider-color: #eeeeee;

  /* UI Metrics */
  --radius-lg: 16px;
  --radius-md: 8px;
  --radius-sm: 6px;
  --header-height: 60px;
  --sidebar-width: 260px;

  /* Shadows */
  --shadow-lg: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --shadow-sm: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12);

  /* Transitions */
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
}

:global(html.dark) {
  /* Razer Dark Theme */
  --color-primary: #44d62c; /* Razer Neon Green */
  --color-primary-bg: rgba(68, 214, 44, 0.1);
  --color-primary-hover: #00d000;
  --color-primary-light: rgba(68, 214, 44, 0.15);

  /* Backgrounds */
  --bg-app: #050505; /* Deep Black */
  --bg-surface: #111111; /* Off Black */
  --bg-header: rgba(5, 5, 5, 0.9);
  --bg-sidebar: #111111;

  /* Text */
  --text-main: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.5);
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-group-title: rgba(255, 255, 255, 0.6);

  /* Borders & Separators */
  --shadow-md: 0 4px 5px 0 rgba(0, 0, 0, 0.5), 0 1px 10px 0 rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.6);
  --shadow-sm: 0 2px 1px -1px rgba(0, 0, 0, 0.5), 0 1px 1px 0 rgba(0, 0, 0, 0.4), 0 1px 3px 0 rgba(0, 0, 0, 0.4);
  --border-color: #222222;
  --divider-color: #222222;
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
  position: relative;
  justify-content: center;
  background-color: var(--bg-header);
}

:global(html.dark) .app__header {
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
  background: linear-gradient(135deg, #333333, #000000);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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

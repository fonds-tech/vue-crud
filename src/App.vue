<template>
  <div class="app">
    <header class="app__header">
      <div class="app__header-inner">
        <div class="app__brand">
          <div class="app__brand-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h1 class="app__brand-title">
            CRUD Pro
          </h1>
        </div>

        <div class="app__header-actions">
          <!-- Nav moved to sidebar -->
          <div class="app__header-right">
            <button class="app__theme-toggle" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'" @click="toggleTheme">
              <transition name="rotate" mode="out-in">
                <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              </transition>
            </button>
            <div class="app__user-profile">
              <div class="app__avatar">
                <span>F</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="app__body">
      <aside class="app__sidebar">
        <nav class="app__nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="app__nav-item"
          >
            <span class="app__nav-item-label">{{ item.label }}</span>
          </router-link>
        </nav>
      </aside>

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

<style scoped lang="scss">
/* 科幻风主题变量：含亮色与暗色模式 */
:global(:root) {
  --app-bg: var(--color-bg-app);
  --card-bg: var(--color-bg-surface);
  --hover-bg: var(--color-bg-surface-hover);
  --text-sub: var(--color-text-secondary);
  --active-bg: var(--color-primary-light);
  --header-bg: rgba(255, 255, 255, 0.8);
  --radius-lg: 6px;
  --radius-md: 4px;
  --radius-sm: 2px;
  --radius-xl: 8px;
  --text-main: var(--color-text-primary);
  --grid-color: rgba(8, 145, 178, 0.05);
  --sidebar-bg: var(--color-bg-surface);
  --text-title: var(--color-text-primary);
  --active-text: var(--color-primary);
  --card-border: var(--color-border-subtle);
  --el-bg-color: var(--color-bg-surface);
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-glow: 0 0 10px rgba(8, 145, 178, 0.2);
  --color-accent: #6366f1;
  --color-bg-app: #f0f4f8;
  --color-border: #cbd5e1;
  --color-primary: #0891b2;
  --divider-color: var(--color-border-subtle);
  --header-border: #0891b2;
  --header-height: 60px;
  --sidebar-width: 220px;
  --color-bg-surface: #ffffff;
  --el-color-primary: var(--color-primary);
  --primary-gradient: linear-gradient(135deg, #0891b2 0%, #6366f1 100%);
  --color-text-primary: #0f172a;
  --color-border-subtle: #e2e8f0;
  --color-primary-hover: #0e7490;
  --color-primary-light: #cffafe;
  --color-text-tertiary: #94a3b8;
  --header-border-color: var(--header-border);
  --color-text-secondary: #475569;
  --el-text-color-primary: var(--color-text-primary);
  --el-text-color-regular: var(--color-text-secondary);
  --color-bg-surface-hover: #eef2f6;
}

:global(html.dark) {
  --header-bg: rgba(2, 4, 8, 0.7);
  --grid-color: rgba(0, 240, 255, 0.08);
  --shadow-card: 0 0 0 1px rgba(0, 240, 255, 0.15), 0 10px 30px -10px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 15px rgba(0, 240, 255, 0.25);
  --color-accent: #0066ff;
  --color-bg-app: #020408;
  --color-border: #1e293b;
  --color-primary: #00f0ff;
  --header-border: rgba(0, 240, 255, 0.3);
  --color-bg-surface: #0a1018;
  --primary-gradient: linear-gradient(135deg, #00f0ff 0%, #0066ff 100%);
  --color-text-primary: #e2e8f0;
  --color-border-subtle: #0f172a;
  --color-primary-hover: #6affff;
  --color-primary-light: rgba(0, 240, 255, 0.15);
  --color-text-tertiary: #475569;
  --color-text-secondary: #94a3b8;
  --color-bg-surface-hover: #111a26;
}

:global(body) {
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
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

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
  flex-direction: column;
  background-size: 30px 30px;
  background-image: linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);

  &::after {
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

  &__header {
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

  &__header-inner {
    width: 100%;
    height: 100%;
    margin: 0 auto;
    display: flex;
    padding: 0 24px;
    box-sizing: border-box;
    align-items: center;
    justify-content: space-between;
  }

  &__brand {
    gap: 12px;
    display: flex;
    min-width: var(--sidebar-width);
    align-items: center;
    user-select: none;
    text-decoration: none;

    &-logo {
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

      svg path {
        stroke: var(--color-primary);
      }
    }

    &-title {
      color: var(--color-text-primary) !important;
      margin: 0;
      font-size: 1.125rem;
      font-family: "JetBrains Mono", "Fira Code", monospace;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
  }

  &__header-actions {
    gap: 12px;
    flex: 1;
    display: flex;
    align-items: center;
    margin-left: auto;
    justify-content: flex-end;
  }

  &__header-right {
    gap: 16px;
    display: flex;
    align-items: center;
  }

  &__theme-toggle {
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

    &:hover {
      color: var(--color-primary);
      box-shadow: var(--shadow-glow);
      border-color: var(--color-primary);
    }
  }

  &__user-profile {
    .app__avatar {
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

      &:hover {
        color: #000;
        background: var(--color-primary);
        box-shadow: var(--shadow-glow);
      }
    }
  }

  &__body {
    flex: 1;
    height: calc(100vh - var(--header-height));
    display: flex;
    overflow: hidden;
    margin-top: var(--header-height);
  }

  &__sidebar {
    width: var(--sidebar-width);
    display: flex;
    padding: 16px 0;
    box-sizing: border-box;
    overflow-y: auto;
    flex-shrink: 0;
    border-right: 1px solid var(--header-border);
    flex-direction: column;
    backdrop-filter: blur(16px);
    scrollbar-color: var(--color-primary) transparent;
    scrollbar-width: thin;
    background-color: var(--sidebar-bg);

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 2px;
      background-color: var(--color-primary);
    }
  }

  &__nav {
    gap: 4px;
    display: flex;
    padding: 0 12px;
    flex-direction: column;
  }

  &__nav-item {
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

    &:hover {
      color: var(--color-primary);
      transform: translateX(4px);
      background: rgba(0, 240, 255, 0.05);
      border-color: rgba(0, 240, 255, 0.2);
    }

    &.router-link-active {
      color: var(--color-primary) !important;
      background: rgba(0, 240, 255, 0.08);
      box-shadow: var(--shadow-glow);
      border-color: var(--color-primary);

      &::before {
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
    }
  }

  &__nav-item-label {
    flex: 1;
  }

  &__main {
    flex: 1;
    width: 100%;
    display: flex;
    padding: 24px;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    flex-direction: column;
  }

  &__content {
    flex: 1;
    display: flex;
    overflow: hidden;
    flex-direction: column;
  }
}

@keyframes scanlines {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 4px;
  }
}

:global(.fade-slide-enter-active),
:global(.fade-slide-leave-active) {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

:global(.fade-slide-enter-from) {
  opacity: 0;
  transform: scale(0.99);
}

:global(.fade-slide-leave-to) {
  opacity: 0;
  transform: scale(0.99);
}

:global(.rotate-enter-active),
:global(.rotate-leave-active) {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

:global(.rotate-enter-from) {
  opacity: 0;
  transform: rotate(-90deg) scale(0.9);
}

:global(.rotate-leave-to) {
  opacity: 0;
  transform: rotate(90deg) scale(0.9);
}
</style>

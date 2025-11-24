<template>
  <div class="app">
    <nav class="top-nav">
      <span class="logo">FD CRUD</span>
      <div class="nav-links">
        <router-link
          v-for="playground in playgrounds"
          :key="playground.path"
          :to="playground.path"
          class="nav-link"
        >
          {{ playground.label }}
        </router-link>
      </div>
    </nav>

    <main class="content-card">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
const playgrounds = [
  { path: "/crud", label: "CRUD 调试" },
  { path: "/form", label: "表单调试" },
  { path: "/search", label: "搜索调试" },
]
</script>

<style scoped>
:global(body) {
  margin: 0;
  background: linear-gradient(135deg, #eef2ff, #fdf2f8);
  font-family:
    "SF Pro Display",
    "PingFang SC",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.app {
  padding: 24px;
  box-sizing: border-box;
  min-height: 100vh;
}

.top-nav {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  justify-content: space-between;
}

.logo {
  color: #1f2d3d;
  font-size: 18px;
  font-weight: 600;
}

.nav-links {
  gap: 8px;
  display: inline-flex;
}

.nav-link {
  color: #1f2d3d;
  border: 1px solid transparent;
  padding: 6px 14px;
  min-width: 0;
  box-shadow: none;
  transition: all 0.2s;
  font-weight: 600;
  border-radius: 999px;
  text-decoration: none;
  background-color: #fff;
}

.nav-link:hover {
  color: #409eff;
  transform: translateY(-2px);
  border-color: rgba(64, 158, 255, 0.5);
}

.router-link-active.nav-link {
  color: #fff;
  background: linear-gradient(135deg, #409eff, #36d1dc);
  box-shadow: 0 10px 24px rgba(64, 158, 255, 0.25);
}

.content-card {
  margin: 0 auto;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
  border-radius: 18px;
  background-color: #fff;
}

@media (max-width: 768px) {
  .app {
    padding: 16px;
  }

  .top-nav {
    gap: 12px;
    align-items: flex-start;
    flex-direction: column;
  }

  .content-card {
    padding: 16px;
    border-radius: 14px;
  }
}
</style>

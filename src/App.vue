<template>
  <div class="app">
    <header class="hero">
      <p class="hero__desc">
        集成 CRUD、表单与搜索示例，方便在同一页面对比交互与主题效果。
      </p>

      <nav class="hero__nav">
        <router-link to="/crud" class="nav-link">
          CRUD 页面
        </router-link>
        <router-link to="/form" class="nav-link">
          表单演示
        </router-link>
        <router-link to="/search" class="nav-link">
          搜索演示
        </router-link>
      </nav>
    </header>

    <main class="content-card">
      <router-view />
    </main>
  </div>
</template>

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
  padding: 48px 24px 64px;
  box-sizing: border-box;
  min-height: 100vh;
}

.hero {
  text-align: center;
  margin-bottom: 32px;
}

.hero__badge {
  color: #1f6ff2;
  display: inline-flex;
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 999px;
  letter-spacing: 0.08em;
  background-color: rgba(64, 158, 255, 0.14);
}

.hero__desc {
  color: #606266;
  margin: 0 auto;
  max-width: 560px;
  line-height: 1.6;
}

.hero__nav {
  gap: 12px;
  display: inline-flex;
  flex-wrap: wrap;
  margin-top: 24px;
  justify-content: center;
}

.nav-link {
  color: #1f2d3d;
  border: 1px solid transparent;
  padding: 10px 18px;
  min-width: 120px;
  box-shadow: 0 8px 20px rgba(31, 109, 255, 0.08);
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
  padding: 32px;
  max-width: 1200px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
  border-radius: 24px;
  background-color: #fff;
}

@media (max-width: 768px) {
  .app {
    padding: 32px 16px 48px;
  }

  .hero__title {
    font-size: 26px;
  }

  .content-card {
    padding: 20px;
    border-radius: 16px;
  }
}
</style>

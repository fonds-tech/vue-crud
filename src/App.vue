<template>
  <div class="app-container">
    <nav class="nav-bar">
      <router-link to="/" class="nav-link">
        CRUD Demo
      </router-link> |
      <router-link to="/form-debug" class="nav-link">
        Form Debug
      </router-link> |
      <router-link to="/search-debug" class="nav-link">
        Search Debug
      </router-link>
    </nav>
    <div class="content-area">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  font-family: sans-serif;
}

.nav-bar {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
  background-color: #f5f7fa;
}

.nav-link {
  color: #606266;
  margin: 0 10px;
  padding: 5px 10px;
  transition: all 0.3s;
  font-weight: bold;
  border-radius: 4px;
  text-decoration: none;
}

.nav-link:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

.router-link-active {
  color: #409eff;
  background-color: #ecf5ff;
}

.content-area {
  padding: 0 20px;
}
</style>

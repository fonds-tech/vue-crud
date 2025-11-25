<template>
  <div class="dialog-demo">
    <el-card class="dialog-demo__card">
      <template #header>
        <div class="dialog-demo__header">
          <div>
            <p class="dialog-demo__eyebrow">
              Fullscreen Control
            </p>
            <h3>全屏模式与方法调用</h3>
          </div>
          <el-tag size="small" type="warning" effect="light">
            API
          </el-tag>
        </div>
      </template>

      <p class="dialog-demo__desc">
        `fd-dialog` 暴露 `open/close/fullscreen` 方法，并提供 `dialogVisible/fullscreenActive` 状态，可用于打造自定义控制面板。
      </p>

      <div class="dialog-demo__actions">
        <el-button plain @click="openByApi">
          通过方法打开
        </el-button>
        <el-button plain @click="toggleFullscreen">
          切换全屏
        </el-button>
        <el-button plain @click="closeByApi">
          关闭弹窗
        </el-button>
      </div>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        :title="`当前状态：${visibleState}`"
        class="dialog-demo__alert"
      />
    </el-card>

    <fd-dialog
      ref="dialogRef"
      v-model="dialogVisible"
      title="系统巡检报告"
      width="860"
      destroy-on-close
      :fullscreen="presetFullscreen"
      :show-close="false"
      @close="handleClose"
    >
      <div class="fullscreen-dialog__body">
        <div class="fullscreen-dialog__panel">
          <p class="panel-eyebrow">
            运行概览
          </p>
          <h4>集群状态良好</h4>
          <p class="panel-desc">
            已完成近 30 天巡检，关键服务 0 异常。
          </p>

          <div class="panel-metrics">
            <div class="panel-metric">
              <span class="metric-label">节点</span>
              <strong>128</strong>
            </div>
            <div class="panel-metric">
              <span class="metric-label">全屏状态</span>
              <strong>{{ fullscreenText }}</strong>
            </div>
            <div class="panel-metric">
              <span class="metric-label">可见性</span>
              <strong>{{ dialogVisible ? "显示" : "隐藏" }}</strong>
            </div>
          </div>
        </div>

        <el-divider />

        <el-descriptions :column="2" size="large" border>
          <el-descriptions-item label="最近巡检时间">
            2024-06-18 09:30
          </el-descriptions-item>
          <el-descriptions-item label="负责人">
            高文
          </el-descriptions-item>
          <el-descriptions-item label="剩余风险">
            0 个 (Critical)
          </el-descriptions-item>
          <el-descriptions-item label="平均响应">
            312 ms
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="closeByApi()">
          关闭
        </el-button>
        <el-button type="primary" text @click="presetFullscreen = !presetFullscreen">
          {{ presetFullscreen ? "取消全屏" : "默认全屏" }}
        </el-button>
      </template>
    </fd-dialog>
  </div>
</template>

<script setup lang="ts">
import type { DialogExpose } from "./types"
import { ref, computed } from "vue"

const dialogVisible = ref(false)
const presetFullscreen = ref(false)
const dialogRef = ref<DialogExpose>()

const fullscreenText = computed(() => (dialogRef.value?.fullscreenActive?.value ? "开启" : "关闭"))
const visibleState = computed(() => (dialogRef.value?.dialogVisible?.value ? "已打开" : "已关闭"))

function openByApi() {
  dialogRef.value?.open()
}

function closeByApi() {
  dialogRef.value?.close()
}

function toggleFullscreen() {
  dialogRef.value?.fullscreen()
}

function handleClose() {
  presetFullscreen.value = false
}
</script>

<style scoped>
.dialog-demo {
  gap: 16px;
  display: flex;
  flex-direction: column;
}

.dialog-demo__card {
  border: none;
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.08);
  border-radius: 18px;
}

.dialog-demo__header {
  gap: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-demo__eyebrow {
  color: var(--text-sub);
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dialog-demo__desc {
  color: var(--text-sub);
  margin: 0 0 12px;
}

.dialog-demo__actions {
  gap: 8px;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.dialog-demo__alert {
  margin-top: 8px;
}

.fullscreen-dialog__body {
  padding: 24px;
}

.fullscreen-dialog__panel {
  margin-bottom: 16px;
}

.panel-eyebrow {
  color: var(--text-sub);
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.panel-desc {
  color: var(--text-sub);
  margin: 4px 0 16px;
}

.panel-metrics {
  gap: 18px;
  display: flex;
}

.panel-metric {
  border: 1px solid var(--card-border);
  padding: 12px 16px;
  background: var(--card-bg);
  border-radius: 12px;
}

.metric-label {
  color: var(--text-sub);
  font-size: 12px;
}

.panel-metric strong {
  display: block;
  font-size: 20px;
  margin-top: 4px;
}
</style>

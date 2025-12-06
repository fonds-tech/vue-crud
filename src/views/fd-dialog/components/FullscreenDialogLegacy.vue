<template>
  <div class="dialog-example">
    <div class="trigger-area">
      <el-space wrap>
        <el-button plain :icon="Cpu" @click="openByApi">
          打开巡检报告
        </el-button>
        <el-button plain @click="toggleFullscreen">
          切换全屏
        </el-button>
        <el-button plain @click="closeByApi">
          关闭弹窗
        </el-button>
      </el-space>
      <span class="operation-tip">演示通过 API 控制弹窗状态</span>
    </div>

    <el-alert
      type="info"
      :closable="false"
      show-icon
      :title="`当前状态：${visibleState}`"
      class="dialog-example__alert"
    />

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
import type { DialogExpose } from "@/components/dialog/type"
import { Cpu } from "@element-plus/icons-vue"
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
.dialog-example {
  gap: 16px;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.trigger-area {
  gap: 12px;
  display: flex;
  align-items: center;
}

.operation-tip {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.dialog-example__alert {
  width: 100%;
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

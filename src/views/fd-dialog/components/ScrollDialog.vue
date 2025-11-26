<template>
  <div class="dialog-demo">
    <el-card class="dialog-demo__card">
      <template #header>
        <div class="dialog-demo__header">
          <div>
            <p class="dialog-demo__eyebrow">
              Scrollable Content
            </p>
            <h3>长内容与滚动容器</h3>
          </div>
          <el-tag size="small" type="success" effect="plain">
            height
          </el-tag>
        </div>
      </template>

      <p class="dialog-demo__desc">
        利用 `height` 属性可限制可滚动区域，适合展示审批日志、系统公告等长内容。
      </p>

      <el-space wrap>
        <el-button type="primary" @click="dialogVisible = true">
          查看最新日志
        </el-button>
        <el-button text type="primary" @click="shuffleLogs">
          刷新日志
        </el-button>
      </el-space>
    </el-card>

    <fd-dialog
      v-model="dialogVisible"
      title="发布日志"
      width="640"
      height="28vh"
      top="10vh"
    >
      <div class="scroll-dialog__body">
        <el-timeline>
          <el-timeline-item
            v-for="item in logs"
            :key="item.id"
            :timestamp="item.time"
            :type="item.type"
          >
            <div class="timeline-item">
              <strong>{{ item.title }}</strong>
              <p>{{ item.desc }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </fd-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

interface TimelineLog {
  id: number
  time: string
  title: string
  desc: string
  type: "primary" | "success" | "warning" | "danger" | "info"
}

const dialogVisible = ref(false)
const logs = ref<TimelineLog[]>(generateLogs())

function shuffleLogs() {
  logs.value = generateLogs()
}

function generateLogs(): TimelineLog[] {
  const templates = [
    { title: "文档站点发布", desc: "docs:build 产物已推送到 CDN", type: "primary" },
    { title: "版本号提升", desc: "bumpp 自动生成 tag v1.5.2", type: "success" },
    { title: "影像服务扩容", desc: "新增 3 台 GPU 节点以支持高峰时段", type: "warning" },
    { title: "安全扫描完成", desc: "依赖漏洞已全部修复", type: "success" },
    { title: "多区域同步", desc: "完成 OSS -> CDN 资源刷新", type: "info" },
  ]

  return templates.map((item, index) => ({
    id: index,
    time: `2024-07-${(index + 10).toString().padStart(2, "0")} 10:${index}0`,
    ...item,
  }))
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
  margin: 0 0 16px;
}

.scroll-dialog__body {
  padding: 24px;
}

.timeline-item {
  gap: 4px;
  display: flex;
  flex-direction: column;
}

.timeline-item p {
  color: var(--text-sub);
  margin: 0;
}
</style>

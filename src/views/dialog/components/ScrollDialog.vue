<template>
  <div class="dialog-example">
    <el-space wrap>
      <el-button type="primary" :icon="List" @click="dialogVisible = true"> 发布日志 </el-button>
      <el-button text type="primary" @click="shuffleLogs"> 刷新日志 </el-button>
    </el-space>
    <span class="operation-tip">点击查看长列表内容的滚动效果</span>

    <fd-dialog v-model="dialogVisible" title="发布日志" width="640" height="28vh" top="10vh">
      <div class="scroll-dialog__body">
        <el-timeline>
          <el-timeline-item v-for="item in logs" :key="item.id" :timestamp="item.time" :type="item.type">
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
import { List } from "@element-plus/icons-vue"

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
  const templates: Omit<TimelineLog, "id" | "time">[] = [
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
.dialog-example {
  gap: 12px;
  display: flex;
  align-items: center;
}

.operation-tip {
  color: var(--el-text-color-secondary);
  font-size: 13px;
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

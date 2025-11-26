<template>
  <section class="demo-card">
    <h4 class="demo-card__title">
      分组与插槽
    </h4>
    <p class="demo-card__desc">
      展示分组标题、具名插槽、自定义组件渲染与动作按钮。
    </p>

    <el-button type="primary" @click="openDetail">
      查看高级详情
    </el-button>

    <fd-detail ref="detailRef">
      <template #status="{ value }">
        <el-tag :type="value ? 'success' : 'danger'">
          {{ value ? "启用" : "禁用" }}
        </el-tag>
      </template>
      <template #group-extra="{ group }">
        <el-tag effect="plain" size="small">
          {{ group.title }}
        </el-tag>
      </template>
      <template #footer>
        <div class="slot-footer">
          <el-button @click="close">
            取消
          </el-button>
          <el-button type="primary" @click="close">
            知道了
          </el-button>
        </div>
      </template>
    </fd-detail>
  </section>
</template>

<script setup lang="ts">
import type { DetailRef, DetailUseOptions } from "@/components/fd-detail/type"
import { ref, onMounted } from "vue"

defineOptions({
  name: "slot-detail-demo",
})

const detailRef = ref<DetailRef>()

const options: DetailUseOptions = {
  dialog: { width: "780px", title: "设备详情" },
  descriptions: { column: 2 },
  groups: [
    { name: "basic", title: "基础信息", descriptions: { slots: { title: () => "基础信息" } } },
    { name: "meta", title: "扩展属性", descriptions: { slots: { title: () => "扩展属性" } } },
  ],
  items: [
    { field: "name", label: "名称", group: "basic" },
    { field: "type", label: "类型", group: "basic" },
    { field: "status", label: "状态", component: { slot: "status" }, group: "basic" },
    { field: "owner", label: "负责人", group: "basic" },
    { field: "remark", label: "备注", span: 2, group: "meta" },
    { field: "tags", label: "标签", span: 2, group: "meta", formatter: (value: string[]) => value.join(" / ") },
  ],
  slots: () => ({
    // 分组标题附加信息
    title: "group-extra",
  }),
}

const mockData = {
  name: "网关 A-01",
  type: "Gateway",
  status: 1,
  owner: "Alice",
  remark: "具名插槽演示：状态标签 + 自定义 footer。",
  tags: ["生产", "核心"],
}

onMounted(() => {
  detailRef.value?.use(options)
})

function openDetail() {
  detailRef.value?.setData(mockData)
  detailRef.value?.detail(mockData)
}

function close() {
  detailRef.value?.close()
}
</script>

<style scoped lang="scss">
.demo-card {
  border: 1px solid var(--card-border);
  padding: 16px;
  background: var(--card-bg);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);

  &__title {
    margin: 0 0 4px 0;
  }

  &__desc {
    color: var(--text-sub);
    margin: 0 0 12px 0;
  }
}

.slot-footer {
  gap: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>

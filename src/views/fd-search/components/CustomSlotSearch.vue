<template>
  <div class="search-variant">
    <!-- 外部控制区 -->
    <el-card header="外部控制 (External Control)">
      <el-button-group>
        <el-button type="primary" @click="handleExternalSearch">
          外部触发搜索
        </el-button>
        <el-button type="warning" @click="handleExternalReset">
          外部触发重置
        </el-button>
        <el-button @click="handleToggleCollapse">
          切换折叠状态
        </el-button>
      </el-button-group>
      <p class="control-tip">
        通过 ref 获取组件实例，调用暴露的 search/reset/collapse 方法
      </p>
    </el-card>

    <!-- 核心演示区 -->
    <el-card>
      <fd-crud ref="crudRef">
        <fd-search ref="searchRef">
          <!-- 1. 表单项插槽：自定义复杂交互控件 -->
          <template #custom-region="{ model }">
            <el-radio-group v-model="model.region" size="default">
              <el-radio-button value="cn">
                中国
              </el-radio-button>
              <el-radio-button value="us">
                美国
              </el-radio-button>
              <el-radio-button value="jp">
                日本
              </el-radio-button>
            </el-radio-group>
          </template>

          <!-- 2. 动作区插槽：自定义操作按钮 -->
          <template #action-export>
            <el-button circle type="success">
              <el-icon><download /></el-icon>
            </el-button>
          </template>
        </fd-search>
      </fd-crud>
    </el-card>

    <el-card>
      <pre class="variant-snapshot">{{ crudParams }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { SearchOptions } from "@/components/search/types"
import { computed } from "vue"
import { Share, Download } from "@element-plus/icons-vue"
import { SearchMockService } from "../mockService"
import { useCrud, useSearch } from "@/hooks"

const crudRef = useCrud(
  { service: new SearchMockService() },
  crud => crud.refresh(),
)

const options: SearchOptions = {
  grid: { cols: 3 },
  items: [
    {
      prop: "keyword",
      label: "关键词",
      component: {
        is: "el-input",
        props: { placeholder: "输入关键词", clearable: true },
      },
    },
    {
      prop: "region",
      label: "地区(Slot)",
      component: {
        slot: "custom-region", // 对应 template #custom-region
      },
      value: "cn", // 默认值
    },
    {
      prop: "dynamicStatus",
      label: "动态属性",
      component: {
        is: "el-select",
        // 3. 动态属性：props 可以是一个函数，根据 model 动态变化
        props: model => ({
          placeholder: model.region === "cn" ? "选择国内状态" : "Select Status",
          disabled: !model.keyword, // 示例：没有输入关键词时禁用
        }),
        options: [
          { label: "Active", value: 1 },
          { label: "Inactive", value: 0 },
        ],
      },
    },
  ],
  action: {
    items: [
      { type: "search", text: "查询" },
      { type: "reset" },
      {
        // 4. 动态动作按钮：组件样式随 model 变化
        component: {
          is: "el-button",
          props: model => ({
            type: model.region === "cn" ? "danger" : "primary",
            plain: true,
            icon: Share,
          }),
          slots: { default: () => "动态按钮" },
          on: {
            click: () => console.log("Dynamic button clicked"),
          },
        },
      },
      {
        // 对应 template #action-export
        slot: "action-export",
      },
    ],
  },
}

const searchRef = useSearch(options)
const crudParams = computed(() => crudRef.value?.params)

// 外部控制逻辑
function handleExternalSearch() {
  // 可以传入额外参数，这些参数会合并到搜索条件中
  searchRef.value?.search({ source: "external-btn" })
}

function handleExternalReset() {
  searchRef.value?.reset()
}

function handleToggleCollapse() {
  searchRef.value?.collapse()
}
</script>

<style scoped lang="scss">
.search-variant {
  gap: 16px;
  display: flex;
  flex-direction: column;

  .variant-snapshot {
    color: #e5e7eb;
    margin: 0;
    padding: 16px;
    overflow: auto;
    background: #111827;
    max-height: 300px;
    font-family: "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
    border-radius: var(--radius-md);
  }

  .control-tip {
    color: var(--text-sub);
    font-size: 12px;
    margin-top: 8px;
  }
}
</style>

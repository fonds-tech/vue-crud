<template>
  <div class="fd-search">
    <fd-form ref="formRef" class="fd-search__form">
      <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="scope">
        <slot :name="slotName" v-bind="scope ?? {}" />
      </template>
    </fd-form>

    <fd-grid
      v-if="resolvedActions.length"
      class="fd-search__action"
      v-bind="actionGridProps"
    >
      <fd-grid-item
        v-for="(action, actionIndex) in resolvedActions"
        :key="actionIndex"
        class="fd-search__action-item"
        v-bind="getActionItemProps(action)"
      >
        <el-button
          v-if="action.type === 'search'"
          type="primary"
          :disabled="loading"
          @click="search()"
        >
          <el-icon
            class="fd-search__icon"
            :class="{ 'is-loading': loading }"
          >
            <icon-loading v-if="loading" />
            <icon-search v-else />
          </el-icon>
          <span>{{ action.text || crud.dict?.label?.search || "搜索" }}</span>
        </el-button>

        <el-button
          v-else-if="action.type === 'reset'"
          @click="reset()"
        >
          <el-icon class="fd-search__icon">
            <icon-refresh />
          </el-icon>
          <span>{{ action.text || crud.dict?.label?.reset || "重置" }}</span>
        </el-button>

        <el-button
          v-else-if="action.type === 'collapse'"
          @click="collapse()"
        >
          <el-icon class="fd-search__icon">
            <icon-arrow-up v-if="!collapsed" />
            <icon-arrow-down v-else />
          </el-icon>
          <span>{{ collapseLabel }}</span>
        </el-button>

        <slot
          v-else-if="getActionSlot(action)"
          :name="getActionSlot(action)!"
          :model="formModel"
          :action="action"
        />

        <component
          :is="getComponentIs(action)"
          v-else-if="getComponentIs(action)"
          :style="getComponentStyle(action)"
          v-bind="getComponentProps(action)"
          v-on="getComponentEvents(action)"
        >
          <template
            v-for="(value, name) in getComponentSlots(action)"
            :key="name"
            #[name]
          >
            <component :is="value" />
          </template>
        </component>
      </fd-grid-item>
    </fd-grid>
  </div>
</template>

<script setup lang="ts">
import type { GridProps } from "../fd-grid/type"
import type { FormRecord, FormUseOptions } from "../fd-form/type"
import type { SearchAction, SearchOptions } from "./type"
import FdForm from "../fd-form/index.vue"
import { merge } from "lodash-es"
import { useCore } from "@/hooks"
import { clone, isDef } from "@fonds/utils"
import { isEmpty, isFunction } from "@/utils/check"
import { resolveResponsiveValue } from "../fd-grid/utils"
import { ref, watch, computed, reactive, useSlots, onMounted, onBeforeUnmount } from "vue"
import { Search as IconSearch, ArrowUp as IconArrowUp, Loading as IconLoading, Refresh as IconRefresh, ArrowDown as IconArrowDown } from "@element-plus/icons-vue"

defineOptions({
  name: "fd-search",
  inheritAttrs: false,
})

const slots = useSlots()
const { crud, mitt } = useCore()

const formRef = ref<InstanceType<typeof FdForm>>()
const loading = ref(false)
const collapsed = ref(false)
const viewportWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1920)

function handleResize() {
  if (typeof window === "undefined")
    return
  viewportWidth.value = window.innerWidth
}

const defaultActions: SearchAction[] = [
  { type: "search" },
  { type: "reset" },
]

interface InternalActionOptions<T extends FormRecord = FormRecord> {
  items: SearchAction<T>[]
  grid?: GridProps
}

interface InternalOptions<T extends FormRecord = FormRecord> {
  form: FormUseOptions<T>
  action: InternalActionOptions<T>
  onSearch?: SearchOptions<T>["onSearch"]
  onReset?: SearchOptions<T>["onReset"]
}

const options = reactive<InternalOptions>({
  form: {
    model: {},
    items: [],
    grid: { cols: 4, colGap: 12, rowGap: 12, collapsed: false, collapsedRows: 2 },
    form: {
      labelWidth: "auto",
    },
  },
  action: {
    items: clone(defaultActions),
    grid: {
      cols: 2,
      colGap: 12,
      rowGap: 12,
    },
  },
})

// 表单数据模型，优先读取 fd-form 实例，否则退回默认配置
const formModel = computed<FormRecord>(() => formRef.value?.model ?? (options.form.model as FormRecord) ?? {})
// 真实的动作列表，未配置时回退为默认搜索/重置
const resolvedActions = computed(() => (options.action.items.length ? options.action.items : defaultActions))
// 动作区域使用 fd-grid 布局，gutter 兼容 el-row 写法
const defaultActionGap = 12
const actionGridProps = computed(() => {
  const grid = options.action.grid ?? {}
  const colGap = Math.max(0, resolveResponsiveValue(grid.colGap ?? defaultActionGap, viewportWidth.value, defaultActionGap))
  const rowGap = Math.max(0, resolveResponsiveValue(grid.rowGap ?? defaultActionGap, viewportWidth.value, defaultActionGap))
  const cols = Math.max(1, resolveResponsiveValue(grid.cols ?? 24, viewportWidth.value, 24))
  const collapsed = grid.collapsed ?? false
  const collapsedRows = Math.max(1, grid.collapsedRows ?? 1)
  return {
    cols,
    colGap,
    rowGap,
    collapsed,
    collapsedRows,
  }
})
const collapseLabel = computed(() => (collapsed.value ? crud.dict?.label?.expand ?? "展开" : crud.dict?.label?.collapse ?? "折叠"))

function getActionItemProps(action: SearchAction) {
  const col = resolveActionCol(action)
  return {
    span: col.span,
    offset: col.offset,
  }
}

function resolveActionCol(action: SearchAction) {
  const merged = action.col ?? {}
  return {
    span: resolveResponsiveValue(merged.span ?? 12, viewportWidth.value, 12),
    offset: resolveResponsiveValue(merged.offset ?? 0, viewportWidth.value, 0),
  }
}

watch(
  () => formModel.value,
  (model) => {
    mitt.emit("search.model", model)
  },
  { deep: true },
)

// 接收 fd-search 的业务配置，并透传给 fd-form
function use(useOptions: SearchOptions = {}) {
  if (!useOptions)
    return

  const { action, onSearch, onReset, ...formOptions } = useOptions

  if (action && Object.prototype.hasOwnProperty.call(action, "items")) {
    options.action.items.splice(0, options.action.items.length, ...(action.items ?? []))
  }

  if (action?.grid) {
    options.action.grid = options.action.grid ? merge({}, options.action.grid, action.grid) : clone(action.grid)
  }

  options.onSearch = onSearch
  options.onReset = onReset

  const formConfig = formOptions as FormUseOptions
  if (Object.keys(formConfig).length) {
    merge(options.form, formConfig)
  }

  collapsed.value = Boolean(options.form?.grid?.collapsed)

  formRef.value?.use(clone(options.form))
}

// 折叠/展开搜索区域（交给 fd-form 内部实现栅格收起）
function collapse(state?: boolean) {
  if (typeof state === "boolean") {
    collapsed.value = state
    formRef.value?.collapse?.(state)
  }
  else {
    collapsed.value = !collapsed.value
    formRef.value?.collapse?.()
  }
}

// 过滤空字符串/undefined，保持请求参数干净
function formatQuery(data: Record<string, any> = {}) {
  const values = clone(data)
  Object.keys(values).forEach((key) => {
    const value = values[key]
    if (!isDef(value) || (typeof value === "string" && value.trim() === "")) {
      delete values[key]
    }
  })
  return values
}

// 统一刷新参数：保留 size，重置 page，并写回 crud.setParams
function assignParams(params: Record<string, any>) {
  const current = crud.getParams?.() ?? {}
  const size = current.size ?? crud.params?.size

  Object.keys(crud.params).forEach((key) => {
    if (key !== "size") {
      delete crud.params[key]
    }
  })

  const nextParams: Record<string, any> = { page: 1, ...params }
  if (isDef(size)) {
    nextParams.size = size
  }

  crud.setParams(nextParams)
}

// 对外暴露的搜索逻辑：校验、合并参数、触发 crud.refresh
function search(extra: Record<string, any> = {}) {
  return new Promise((resolve, reject) => {
    formRef.value?.submit(async (model, errors) => {
      if (!isEmpty(errors)) {
        reject(errors)
        return
      }
      const payload = formatQuery(merge({}, model, extra))
      const next = async (params: Record<string, any> = {}) => {
        try {
          loading.value = true
          assignParams(params)
          const result = await crud.refresh(params)
          resolve(result)
          return result
        }
        finally {
          loading.value = false
        }
      }

      try {
        if (options.onSearch) {
          await options.onSearch(payload, { next })
        }
        else {
          await next(payload)
        }
      }
      catch (error) {
        reject(error)
      }
    })
  })
}

// 对外暴露的重置逻辑：清空表单、重置参数、刷新并清空多选
function reset(extra: Record<string, any> = {}) {
  return new Promise((resolve, reject) => {
    const runner = async () => {
      try {
        formRef.value?.resetFields?.()
        formRef.value?.bindFields?.(extra)
        const payload = formatQuery(formModel.value)
        const next = async (params: Record<string, any> = {}) => {
          assignParams(params)
          mitt.emit("table.clearSelection")
          const result = await crud.refresh(params)
          resolve(result)
          return result
        }

        if (options.onReset) {
          await options.onReset(payload, { next })
        }
        else {
          await next(payload)
        }
      }
      catch (error) {
        reject(error)
      }
    }

    runner()
  })
}

// 动作渲染辅助：优先判断 slot，再回退 component 细分能力
const getActionSlot = (action: SearchAction) => resolveMaybe(action.slot) ?? resolveComponent(action, "slot")
const getComponentIs = (action: SearchAction) => resolveComponent(action, "is")
const getComponentProps = (action: SearchAction) => resolveComponent(action, "props") ?? {}
const getComponentEvents = (action: SearchAction) => resolveComponent(action, "on") ?? {}
const getComponentStyle = (action: SearchAction) => resolveComponent(action, "style")
const getComponentSlots = (action: SearchAction) => resolveComponent(action, "slots") ?? {}

// 通用解析函数：根据 key 读取 component 对象，并自动触发函数求值
function resolveComponent(action: SearchAction, key: keyof NonNullable<SearchAction["component"]>) {
  const component = action.component
  if (!component)
    return undefined
  const value = component[key]
  return resolveMaybe(value)
}

// 工具函数：支持传入函数或静态值，统一返回最终渲染值
function resolveMaybe<T>(value: ((model: FormRecord) => T) | T | undefined): T | undefined {
  if (typeof value === "function") {
    return (value as (model: FormRecord) => T)(formModel.value)
  }
  return value
}

// mitt 事件：驱动内部 search/reset，供外部 crud 使用
function searchHandler(params?: any) {
  search(params ?? {})
}

function resetHandler(params?: any) {
  reset(params ?? {})
}

function getModelHandler(callback?: any) {
  if (isFunction(callback)) {
    callback(formModel.value)
  }
}

// 统一注册/销毁所有 search 相关 mitt 事件
function registerEvents() {
  mitt.on("search.search", searchHandler)
  mitt.on("search.reset", resetHandler)
  mitt.on("search.get.model", getModelHandler)
}

function unregisterEvents() {
  mitt.off("search.search", searchHandler)
  mitt.off("search.reset", resetHandler)
  mitt.off("search.get.model", getModelHandler)
}

onMounted(() => {
  registerEvents()
  if (typeof window !== "undefined") {
    window.addEventListener("resize", handleResize)
  }
})

onBeforeUnmount(() => {
  unregisterEvents()
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", handleResize)
  }
})

defineExpose({
  get model() {
    return formModel.value
  },
  form: formRef,
  use,
  search,
  reset,
  collapse,
})
</script>

<style lang="scss">
.fd-search {
  gap: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  &__form {
    flex: 1;
  }

  &__icon {
    width: 1em;
    display: inline-flex;
    min-width: 1em;
    align-items: center;
    justify-content: center;
  }
}
</style>

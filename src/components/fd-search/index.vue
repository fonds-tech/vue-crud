<template>
  <div class="fd-search">
    <fd-form ref="formRef" class="fd-search__form">
      <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="scope">
        <slot :name="slotName" v-bind="scope ?? {}" />
      </template>
    </fd-form>

    <div v-if="resolvedActions.length" class="fd-search__actions" :style="actionsStyle">
      <template v-for="(action, actionIndex) in resolvedActions" :key="actionIndex">
        <el-button
          v-if="action.type === 'search'"
          type="primary"
          :loading="loading"
          @click="search()"
        >
          <el-icon class="fd-search__icon">
            <icon-search />
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
          text
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
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from "vue"
import type { FormRecord, FormUseOptions } from "../fd-form/type"
import type { SearchAction, SearchUseOptions } from "./type"
import FdForm from "../fd-form/index.vue"
import { isDef } from "@fonds/utils"
import { useCore } from "@/hooks"
import { merge, cloneDeep } from "lodash-es"
import { isEmpty, isFunction } from "@/utils/check"
import { ref, watch, computed, reactive, useSlots, onMounted, onBeforeUnmount } from "vue"
import { Search as IconSearch, ArrowUp as IconArrowUp, Refresh as IconRefresh, ArrowDown as IconArrowDown } from "@element-plus/icons-vue"

defineOptions({
  name: "fd-search",
  inheritAttrs: false,
})

const slots = useSlots()
const { crud, mitt } = useCore()

const formRef = ref<InstanceType<typeof FdForm>>()
const loading = ref(false)
const collapsed = ref(false)

const defaultActions: SearchAction[] = [
  { type: "search" },
  { type: "reset" },
]

interface InternalOptions<T extends FormRecord = FormRecord> {
  form: FormUseOptions<T>
  actions: SearchAction<T>[]
  layout: {
    actions: {
      gap: number
      wrap: boolean
      align: "flex-start" | "center" | "flex-end" | "space-between"
    }
  }
  onSearch?: SearchUseOptions<T>["onSearch"]
  onReset?: SearchUseOptions<T>["onReset"]
}

const options = reactive<InternalOptions>({
  form: {
    model: {},
    items: [],
    layout: {
      row: { gutter: 16, collapsed: false, collapsedRows: 2 },
      column: { span: 8 },
    },
    form: {
      labelWidth: "auto",
    },
  },
  actions: cloneDeep(defaultActions),
  layout: {
    actions: {
      gap: 8,
      wrap: true,
      align: "flex-end",
    },
  },
})

// 表单数据模型，优先读取 fd-form 实例，否则退回默认配置
const formModel = computed<FormRecord>(() => formRef.value?.model ?? (options.form.model as FormRecord) ?? {})
// 真实的动作列表，未配置时回退为默认搜索/重置
const resolvedActions = computed(() => (options.actions.length ? options.actions : defaultActions))
// 动作区域样式，保证按钮在多布局场景下可控
const actionsStyle = computed<CSSProperties>(() => {
  const flexWrap: "wrap" | "nowrap" = options.layout.actions.wrap ? "wrap" : "nowrap"
  return {
    display: "flex",
    flexWrap,
    justifyContent: options.layout.actions.align,
    gap: `${options.layout.actions.gap}px`,
  }
})
const collapseLabel = computed(() => (collapsed.value ? crud.dict?.label?.expand ?? "展开更多" : crud.dict?.label?.collapse ?? "收起"))

watch(
  () => formModel.value,
  (model) => {
    mitt.emit("search.model", model)
  },
  { deep: true },
)

// 接收 fd-search 的业务配置，并透传给 fd-form
function use(useOptions: SearchUseOptions = {}) {
  if (!useOptions)
    return

  if (Object.prototype.hasOwnProperty.call(useOptions, "actions")) {
    options.actions.splice(0, options.actions.length, ...(useOptions.actions ?? []))
  }

  if (useOptions.layout?.actions) {
    Object.assign(options.layout.actions, useOptions.layout.actions)
  }

  options.onSearch = useOptions.onSearch
  options.onReset = useOptions.onReset

  if (useOptions.form) {
    merge(options.form, useOptions.form)
  }

  collapsed.value = Boolean(options.form?.layout?.row?.collapsed)

  formRef.value?.use(cloneDeep(options.form))
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
  const values = cloneDeep(data)
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
const getActionSlot = (action: SearchAction) => resolveMaybe(action.slot)
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
})

onBeforeUnmount(() => {
  unregisterEvents()
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

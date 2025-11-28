<template>
  <fd-dialog
    v-bind="dialogBindings"
    v-model="visible"
    :class="dialogClass"
    @open="handleOpen"
    @close="handleClose"
  >
    <slot :data="data" :loading="loading" :visible="visible" :refresh="refresh" :set-data="setData">
      <el-space
        :key="cache"
        v-loading="loading"
        :element-loading-text="options.dialog.loadingText"
        direction="vertical"
        fill
        :size="16"
      >
        <el-descriptions
          v-for="(group, groupIndex) in groups"
          :key="group.name ?? groupIndex"
          :title="resolveMaybe(group.title)"
          v-bind="group.descriptions"
        >
          <template
            v-for="(slotComponent, slotName) in slots(group.descriptions)"
            :key="slotName"
            #[slotName]="scope"
          >
            <slot
              v-if="slotNameOf(slotComponent)"
              :name="slotNameOf(slotComponent)!"
              :data="data"
              :group="group"
              :index="groupIndex"
              v-bind="scope ?? {}"
            />
            <component
              :is="componentOf(slotComponent)"
              v-else-if="componentOf(slotComponent)"
              v-bind="componentProps(slotComponent)"
              :style="componentStyle(slotComponent)"
              v-on="componentEvents(slotComponent)"
            >
              <template
                v-for="(value, childSlot) in componentSlots(slotComponent)"
                :key="childSlot"
                #[childSlot]
              >
                <component :is="value" />
              </template>
            </component>
          </template>

          <template
            v-for="(item, itemIndex) in group.items"
            :key="item.field ?? itemIndex"
          >
            <el-descriptions-item
              v-if="isVisible(item)"
              :label="resolveLabel(item)"
              :span="item.span ?? 1"
            >
              <template v-if="userSlots.label" #label>
                <slot
                  name="label"
                  :index="itemIndex"
                  :data="data"
                  :value="getFieldValue(item)"
                  :item="item"
                />
              </template>

              <template
                v-for="(slotComponent, slotName) in slots(item)"
                :key="slotName"
                #[slotName]
              >
                <slot
                  v-if="slotNameOf(slotComponent)"
                  :name="slotNameOf(slotComponent)!"
                  :index="itemIndex"
                  :data="data"
                  :value="getFieldValue(item)"
                />
                <component
                  :is="componentOf(slotComponent)"
                  v-else-if="componentOf(slotComponent)"
                  v-bind="componentProps(slotComponent)"
                  :style="componentStyle(slotComponent)"
                  v-on="componentEvents(slotComponent)"
                >
                  <template
                    v-for="(value, childSlot) in componentSlots(slotComponent)"
                    :key="childSlot"
                    #[childSlot]
                  >
                    <component :is="value" />
                  </template>
                </component>
              </template>

              <slot
                v-if="slotNameOf(item.component)"
                :name="slotNameOf(item.component)!"
                :index="itemIndex"
                :data="data"
                :value="getFieldValue(item)"
              />
              <component
                :is="componentOf(item.component)"
                v-else-if="componentOf(item.component)"
                v-bind="componentProps(item.component)"
                :style="componentStyle(item.component)"
                v-on="componentEvents(item.component)"
              >
                <template
                  v-for="(value, childSlot) in componentSlots(item.component)"
                  :key="childSlot"
                  #[childSlot]
                >
                  <component :is="value" />
                </template>
              </component>
              <template v-else>
                {{ formatValue(item) }}
              </template>
            </el-descriptions-item>
          </template>
        </el-descriptions>
      </el-space>
    </slot>

    <template #footer>
      <div class="fd-detail__footer">
        <template
          v-for="(action, index) in options.actions"
          :key="index"
        >
          <template v-if="isVisible(action)">
            <el-button
              v-if="action.type === 'ok'"
              type="primary"
              @click="close()"
            >
              {{ resolveActionText(action) }}
            </el-button>
            <slot
              v-else-if="slotNameOf(action.component)"
              :name="slotNameOf(action.component)!"
              :index="index"
              :data="data"
            />
            <component
              :is="componentOf(action.component)"
              v-else-if="componentOf(action.component)"
              v-bind="componentProps(action.component)"
              :style="componentStyle(action.component)"
              v-on="componentEvents(action.component)"
            >
              <template
                v-for="(value, childSlot) in componentSlots(action.component)"
                :key="childSlot"
                #[childSlot]
              >
                <component :is="value" />
              </template>
            </component>
          </template>
        </template>
      </div>
    </template>
  </fd-dialog>
</template>

<script setup lang="ts">
import type { DetailItem, DetailGroup, DetailAction, DetailMaybeFn, DetailOptions, DetailComponent, DetailUseOptions, DetailDescriptions, DetailComponentSlot } from "./type"
import FdDialog from "../fd-dialog/index.vue"
import { clone } from "@fonds/utils"
import { useCore } from "@/hooks"
import { isFunction } from "@/utils/check"
import { pick, merge } from "lodash-es"
import { ElSpace, ElButton, ElMessage, ElDescriptions, ElDescriptionsItem } from "element-plus"
import { ref, watch, computed, reactive, useAttrs, useSlots, onBeforeUnmount, getCurrentInstance } from "vue"

defineOptions({
  name: "fd-detail",
  inheritAttrs: false,
})

const emit = defineEmits(["open", "close", "beforeOpen", "beforeClose"])

const { crud, mitt } = useCore()
const userSlots = useSlots()
const instance = getCurrentInstance()
const attrs = useAttrs() as Record<string, unknown> & { class?: unknown }

// 数据状态：当前详情数据/请求缓存/弹窗可见性/加载态
const data = ref<Record<string, any>>({})
const paramsCache = ref<Record<string, any>>({})
const visible = ref(false)
const loading = ref(false)
const cache = ref(0)

// 默认配置：统一在此集中设置，可通过 use 动态合并
const options = reactive<DetailOptions>({
  dialog: {
    width: "60%",
    title: crud.dict?.label?.detail ?? "详情",
    showClose: true,
    destroyOnClose: true,
    loadingText: "正在加载中...",
  },
  items: [],
  groups: [],
  actions: [],
  descriptions: {
    column: 2,
    border: true,
  },
})

ensureActions()

// 过滤掉 class，其余 attrs 传递给 fd-dialog
const dialogNativeAttrs = computed(() => {
  const result: Record<string, unknown> = {}
  Object.keys(attrs).forEach((key) => {
    if (key === "class")
      return
    result[key] = attrs[key]
  })
  return result
})

// 生成最终的弹窗 class
const dialogClass = computed(() => {
  const extra = attrs.class
  return extra ? ["fd-detail", extra] : ["fd-detail"]
})

// 将配置与 attrs 合并为传递给 fd-dialog 的 props
const dialogBindings = computed(() => {
  const { loadingText, ...rest } = options.dialog
  return {
    ...rest,
    ...dialogNativeAttrs.value,
  }
})

// 根据分组配置聚合 items，缺省分组使用组件 uid 标识
const groups = computed(() => {
  if (!options.items.length)
    return []
  const fallbackName = instance?.uid ?? "fd-detail"
  const map = new Map<string | number, DetailItem[]>()
  map.set(fallbackName, [])
  options.groups.forEach((group) => {
    if (group.name !== undefined) {
      map.set(group.name, [])
    }
  })
  options.items.forEach((item) => {
    const groupName = resolveMaybe(item.group)
    if (groupName !== undefined && map.has(groupName)) {
      map.get(groupName)!.push(item)
    }
    else {
      map.get(fallbackName)!.push(item)
    }
  })
  return Array.from(map.entries())
    .map(([name, items]) => {
      const meta = options.groups.find(group => group.name === name)
      const descriptions = merge({}, options.descriptions, meta?.descriptions) as DetailDescriptions
      const normalizedDescriptions = {
        ...descriptions,
        // 默认使用两列布局，除非外部显式传入其他列数
        column: descriptions.column ?? 2,
      }
      return {
        name,
        items,
        title: meta ? resolveMaybe(meta.title) : descriptions.title,
        descriptions: normalizedDescriptions,
      } as DetailGroup & { items: DetailItem[], descriptions: DetailDescriptions }
    })
    .filter(group => group.items.length > 0)
})

// 弹窗显示/隐藏时触发 beforeOpen/BeforeClose 钩子
watch(
  () => visible.value,
  (current, previous) => {
    if (current && !previous) {
      handleBeforeOpen()
    }
    else if (!current && previous) {
      handleBeforeClose()
    }
  },
)

/** 工具：解析静态值或动态函数返回值 */
function resolveMaybe<T>(value?: DetailMaybeFn<T>): T | undefined {
  if (isFunction(value))
    return value(data.value)
  return value
}

/** 判断是否为组件配置对象 */
function isDetailComponent(target?: DetailComponentSlot): target is DetailComponent {
  return Boolean(target && typeof target === "object" && "is" in (target as Record<string, any>))
}

/** 读取自定义插槽名称 */
function slotNameOf(value?: DetailComponentSlot) {
  if (!value || !isDetailComponent(value))
    return undefined
  return resolveMaybe(value.slot)
}

/** 获取组件引用 */
function componentOf(value?: DetailComponentSlot) {
  if (!value)
    return undefined
  if (isDetailComponent(value))
    return resolveMaybe(value.is)
  return value
}

/** 获取组件事件 */
function componentEvents(value?: DetailComponentSlot) {
  if (!value || !isDetailComponent(value))
    return {}
  return resolveMaybe(value.on) ?? {}
}

/** 获取组件 props */
function componentProps(value?: DetailComponentSlot) {
  if (!value || !isDetailComponent(value))
    return {}
  return resolveMaybe(value.props) ?? {}
}

/** 获取组件 style */
function componentStyle(value?: DetailComponentSlot) {
  if (!value || !isDetailComponent(value))
    return undefined
  return resolveMaybe(value.style)
}

/** 获取组件具名插槽 */
function componentSlots(value?: DetailComponentSlot) {
  if (!value || !isDetailComponent(value))
    return {}
  const slotsValue = resolveMaybe(value.slots)
  return slotsValue || {}
}

/** 字段/分组 slots 统一处理 */
function slots(target?: { slots?: any }) {
  if (!target || typeof target !== "object" || !("slots" in target))
    return {}
  const slotValue = (target as { slots?: DetailDescriptions["slots"] }).slots
  if (!slotValue)
    return {}
  return isFunction(slotValue) ? slotValue(data.value) : slotValue
}

/** 统一的显隐判断 */
function isVisible(target: { hidden?: DetailItem["hidden"] | DetailAction["hidden"] }) {
  const hidden = target?.hidden
  if (isFunction(hidden))
    return !hidden(data.value)
  return !hidden
}

/** 解析字段标题 */
function resolveLabel(item: DetailItem) {
  return resolveMaybe(item.label) ?? ""
}

/** 获取字段值（含默认值） */
function getFieldValue(item: DetailItem) {
  const field = item.field as string
  const current = data.value?.[field]
  if (current === undefined || current === null) {
    return resolveMaybe(item.value)
  }
  return current
}

/** 格式化显示值 */
function formatValue(item: DetailItem) {
  const value = getFieldValue(item)
  if (isFunction(item.formatter))
    return item.formatter(value, data.value)
  return value ?? ""
}

/** 获取动作按钮文案 */
function resolveActionText(action: DetailAction) {
  return resolveMaybe(action.text) ?? crud.dict?.label?.confirm ?? "确定"
}

/** 保证底部至少有一个确认按钮 */
function ensureActions() {
  if (!options.actions.length) {
    options.actions = [
      {
        type: "ok",
        text: crud.dict?.label?.confirm ?? "确定",
      },
    ]
  }
}

/**
 * 外部调用，用于动态合并配置
 */
function use(useOptions: DetailUseOptions) {
  merge(options, useOptions)
  ensureActions()
}

/**
 * 根据 CRUD 字典获取详情接口 key
 */
function getDetailApiName() {
  return crud.dict?.api?.detail ?? "detail"
}

/**
 * 请求详情数据并在成功后触发 done
 */
function requestDetail(query: Record<string, any>, done: (value: Record<string, any>) => void) {
  const apiName = getDetailApiName()
  const service = crud.service?.[apiName]
  if (!isFunction(service)) {
    const error = new Error(`未在 CRUD service 中找到 ${apiName} 方法`)
    ElMessage.error(error.message)
    loading.value = false
    return Promise.reject(error)
  }
  paramsCache.value = clone(query)
  return service(query)
    .then((res: Record<string, any>) => {
      done(res ?? {})
      return res
    })
    .catch((err: any) => {
      ElMessage.error(err?.message ?? "详情查询失败")
      throw err
    })
    .finally(() => {
      loading.value = false
    })
}

/**
 * 打开详情弹窗，默认按主键自动查询
 */
function detail(row: Record<string, any>) {
  setData(row)
  visible.value = true
  loading.value = true
  const done = (value: Record<string, any> = {}) => {
    setData(value)
  }
  const next = (query: Record<string, any>) => {
    return requestDetail(query, done)
  }
  if (isFunction(options.onDetail)) {
    return options.onDetail(row, { done, next, close })
  }
  else {
    const primaryKey = crud.dict?.primaryId ?? "id"
    const query = pick(row, [primaryKey])
    return next(query)
  }
}

/**
 * 主动刷新详情（可覆盖部分查询参数）
 */
function refresh(params: Record<string, any> = {}) {
  const done = (value: Record<string, any> = {}) => {
    setData(value)
  }
  const next = (query: Record<string, any>) => {
    loading.value = true
    return requestDetail(query, done)
  }
  if (isFunction(options.onDetail)) {
    return options.onDetail(params, { next, done, close })
  }
  const query = merge(clone(paramsCache.value), params)
  if (!Object.keys(query).length) {
    return
  }
  return next(query)
}

/**
 * 手动设置详情数据
 */
function setData(value: Record<string, any>) {
  data.value = clone(value ?? {})
}

function getData() {
  return clone(data.value)
}

/**
 * 清空状态，防止数据残留
 */
function clearData() {
  data.value = {}
  paramsCache.value = {}
}

/**
 * 关闭弹窗
 */
function close() {
  visible.value = false
  loading.value = false
}

function handleBeforeOpen() {
  cache.value += 1
  emit("beforeOpen")
  options.onBeforeOpen?.()
}

function handleBeforeClose() {
  const snapshot = getData()
  emit("beforeClose", snapshot)
  options.onBeforeClose?.(snapshot)
}

function handleOpen() {
  emit("open")
  options.onOpen?.()
}

function handleClose() {
  const snapshot = getData()
  emit("close", snapshot)
  options.onClose?.(snapshot)
  clearData()
}

/**
 * 处理 mitt detail / proxy 的统一逻辑
 */
function handleDetailEvent(row: Record<string, any>) {
  if (!row)
    return
  setData(row)
  detail(row)
}

/** mitt detail 事件处理 */
function detailHandler(row: unknown) {
  if (row && typeof row === "object")
    handleDetailEvent(row as Record<string, any>)
}
/** crud.proxy 事件处理 */
function proxyHandler(payload: unknown) {
  if (!payload || typeof payload !== "object")
    return
  const proxyPayload = payload as { name?: string, data?: Record<string, any>[] }
  if (proxyPayload.name !== "detail")
    return
  const row = proxyPayload.data?.[0]
  if (row)
    handleDetailEvent(row)
}

mitt?.on?.("detail", detailHandler)
mitt?.on?.("crud.proxy", proxyHandler)

onBeforeUnmount(() => {
  mitt?.off?.("detail", detailHandler)
  mitt?.off?.("crud.proxy", proxyHandler)
})

defineExpose({
  get data() {
    return data.value
  },
  use,
  close,
  detail,
  refresh,
  setData,
  getData,
  clearData,
})
</script>

<style  lang="scss">
.fd-detail {
  .el-space {
    width: 100%;
  }

  &__footer {
    gap: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>

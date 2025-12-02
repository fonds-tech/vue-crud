<template>
  <fd-dialog
    v-bind="dialogBindings"
    v-model="visible"
    :class="dialogClass"
    @open="handleOpen"
    @close="handleClose"
    @closed="handleClosed"
  >
    <slot :data="data.value" :loading="loading" :visible="visible" :refresh="refresh" :set-data="setData">
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
              :data="data.value"
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
            :key="item.prop ?? itemIndex"
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
                  :data="data.value"
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
                  :data="data.value"
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
                :data="data.value"
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
              <template v-else-if="resolveDict(item)">
                <el-tag
                  v-if="getDictMatch(item)"
                  :type="tagType(getDictMatch(item))"
                  :color="getDictMatch(item)!.color"
                >
                  {{ getDictMatch(item)!.label }}
                </el-tag>
                <template v-else>
                  {{ formatValue(item) }}
                </template>
              </template>
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
              :data="data.value"
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
import type { DetailData, DetailItem, DetailGroup, DetailSlots, DetailAction, DetailExpose, DetailMaybeFn, DetailOptions, DetailComponent, DetailUseOptions, DetailDescriptions, DetailComponentSlot } from "./type"
import FdDialog from "../fd-dialog/index.vue"
import { clone } from "@fonds/utils"
import { useCore } from "@/hooks"
import { isFunction } from "@/utils/check"
import { pick, merge, mergeWith } from "lodash-es"
import { ElTag, ElSpace, ElButton, ElMessage, ElDescriptions, ElDescriptionsItem } from "element-plus"
import { ref, watch, markRaw, computed, reactive, useAttrs, useSlots, onBeforeUnmount, getCurrentInstance } from "vue"

defineOptions({
  name: "fd-detail",
  inheritAttrs: false,
})

/** 详情弹窗生命周期事件，保持与外部事件命名一致 */
const emit = defineEmits(["open", "close", "beforeOpen", "beforeClose"])
defineSlots<Record<string, (props: {
  index?: number
  data: any
  value?: any
  item?: DetailItem
  group?: any
  loading?: boolean
  visible?: boolean
  refresh?: (params?: Record<string, any>) => any
  setData?: (value: Record<string, any>) => void
}) => any>>()

const { crud, mitt } = useCore()
const userSlots = useSlots()
const instance = getCurrentInstance()
const attrs = useAttrs() as Record<string, unknown> & { class?: unknown }

// 数据状态：当前详情数据/请求缓存/弹窗可见性/加载态
const data = ref<DetailData>({})
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

// 初始化时保证底部至少有一个确认按钮，避免出现无动作的空 footer
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

/** 工具：解析静态值或动态函数返回值；依赖当前详情数据进行求值。 */
function resolveMaybe<T>(value?: DetailMaybeFn<T>): T | undefined {
  if (isFunction(value))
    return value(data.value)
  return value
}

/** 判断是否为组件配置对象，避免将插槽名误判为组件。 */
function isDetailComponent(target?: DetailComponentSlot): target is DetailComponent {
  return Boolean(target && typeof target === "object" && "is" in (target as Record<string, any>))
}

/** 读取自定义插槽名称，支持直接传入 slot 名或从组件配置中解析。 */
function slotNameOf(value?: DetailComponentSlot) {
  if (!value)
    return undefined
  if (typeof value === "string")
    return value
  if (typeof value === "object" && "slot" in (value as Record<string, any>))
    return resolveMaybe((value as DetailComponent).slot)
  if (!isDetailComponent(value))
    return undefined
  return resolveMaybe(value.slot)
}

/** 获取组件引用，排除纯字符串/slot 占位，确保返回可渲染的组件定义。 */
function componentOf(value?: DetailComponentSlot) {
  if (!value)
    return undefined
  if (typeof value === "string")
    return undefined
  if (typeof value === "object" && "slot" in (value as Record<string, any>))
    return undefined
  if (isDetailComponent(value))
    return resolveMaybe(value.is)
  const resolved = value
  return typeof resolved === "object" && resolved !== null ? markRaw(resolved) : resolved
}

/** 获取组件事件，避免未配置时返回 undefined。 */
function componentEvents(value?: DetailComponentSlot) {
  if (!value || !isDetailComponent(value))
    return {}
  return resolveMaybe(value.on) ?? {}
}

/** 获取组件 props，默认返回空对象，便于 v-bind 展开。 */
function componentProps(value?: DetailComponentSlot) {
  if (!value || !isDetailComponent(value))
    return {}
  return resolveMaybe(value.props) ?? {}
}

/** 获取组件 style，未配置时返回 undefined 以避免覆盖默认样式。 */
function componentStyle(value?: DetailComponentSlot) {
  if (!value || !isDetailComponent(value))
    return undefined
  return resolveMaybe(value.style)
}

/** 获取组件具名插槽，防御性处理非对象输入。 */
function componentSlots(value?: DetailComponentSlot): Record<string, DetailComponentSlot> {
  if (!value || !isDetailComponent(value))
    return {} as Record<string, DetailComponentSlot>
  const slotsValue = resolveMaybe(value.slots)
  const resolved = slotsValue ?? {}
  if (typeof resolved === "object" && resolved !== null)
    return markRaw(resolved as Record<string, DetailComponentSlot>)
  // 非对象（如布尔）统一视为无效 slots
  return {} as Record<string, DetailComponentSlot>
}

/** 字段/分组 slots 统一处理，支持函数/对象两种写法。 */
function slots(target?: { slots?: DetailSlots }) {
  if (!target || typeof target !== "object" || !("slots" in target))
    return {} as Record<string, DetailComponentSlot>
  const slotValue = (target as { slots?: DetailDescriptions["slots"] }).slots
  if (!slotValue)
    return {} as Record<string, DetailComponentSlot>
  const resolved = isFunction(slotValue) ? slotValue(data.value) : slotValue
  if (typeof resolved === "object" && resolved !== null)
    return markRaw(resolved as Record<string, DetailComponentSlot>)
  return {} as Record<string, DetailComponentSlot>
}

/** 统一的显隐判断，支持布尔与函数两种隐藏条件。 */
function isVisible(target: { hidden?: DetailItem["hidden"] | DetailAction["hidden"] }) {
  const hidden = target?.hidden
  if (isFunction(hidden))
    return !hidden(data.value)
  return !hidden
}

/** 解析字段标题，兼容函数/静态文本。 */
function resolveLabel(item: DetailItem) {
  return resolveMaybe(item.label) ?? ""
}

/** 获取字段值（含默认值），缺省时读取 item.value。 */
function getFieldValue(item: DetailItem) {
  const prop = (item as DetailItem & { field?: string }).prop ?? (item as { field?: string }).field
  if (!prop)
    return resolveMaybe(item.value)
  const current = data.value?.[prop]
  if (current === undefined || current === null) {
    return resolveMaybe(item.value)
  }
  return current
}

/** 解析字典配置 */
function resolveDict(item: DetailItem) {
  return resolveMaybe(item.dict)
}

/** 获取匹配的字典项 */
function getDictMatch(item: DetailItem) {
  const dict = resolveDict(item)
  if (!dict)
    return undefined
  const value = getFieldValue(item)
  return dict.find(d => d.value === value)
}

/** 过滤字典 type，仅返回 Element Plus 允许的类型，避免类型不兼容告警。 */
function tagType(match?: ReturnType<typeof getDictMatch>) {
  const type = match?.type
  if (!type || type === "default")
    return undefined
  return type
}

/** 格式化显示值，优先使用 formatter，否则直接输出。 */
function formatValue(item: DetailItem) {
  const value = getFieldValue(item)
  if (isFunction(item.formatter))
    return item.formatter(value, data.value)
  return value ?? ""
}

/** 获取动作按钮文案，支持字典与自定义文本。 */
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

/** 外部调用，用于动态合并配置（数组整体替换，其余按 lodash mergeWith）。 */
function use(useOptions: DetailUseOptions) {
  mergeWith(options, useOptions, (_objValue, srcValue) => {
    if (Array.isArray(srcValue))
      return srcValue
    return undefined
  })
  ensureActions()
}

/**
 * 根据 CRUD 字典获取详情接口 key。
 */
function getDetailApiName() {
  return crud.dict?.api?.detail ?? "detail"
}

/**
 * 请求详情数据并在成功后触发 done。
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
 * 统一的详情流程：优先触发 onDetail 钩子，否则按 query 调用后端。
 * @param params 原始行数据
 * @param defaultQuery 默认查询参数（通常包含主键）
 */
function runDetailFlow(params: Record<string, any>, defaultQuery: Record<string, any> = {}) {
  let requested = false
  const done = (value: Record<string, any> = {}) => {
    setData(value)
    loading.value = false
  }
  const next = (query: Record<string, any>) => {
    requested = true
    loading.value = true
    paramsCache.value = clone(query)
    return requestDetail(query, done)
  }
  const finalizeIfIdle = () => {
    if (!requested)
      loading.value = false
  }

  if (isFunction(options.onDetail)) {
    try {
      const result = options.onDetail(params, { done, next, close })
      return Promise.resolve(result)
        .catch((error: any) => {
          ElMessage.error(error?.message ?? "详情查询失败")
          throw error
        })
        .finally(finalizeIfIdle)
    }
    catch (error: any) {
      ElMessage.error(error?.message ?? "详情查询失败")
      finalizeIfIdle()
      return Promise.reject(error)
    }
  }

  const query = Object.keys(defaultQuery).length ? defaultQuery : params
  if (!Object.keys(query).length) {
    finalizeIfIdle()
    return
  }
  return next(query)
}

/**
 * 打开详情弹窗，默认按主键自动查询。
 * @description 在设置可见性前校验主键，避免空壳弹窗；返回查询 Promise 以便调用方链式处理。
 */
function detail(row: DetailData) {
  if (!row || typeof row !== "object") {
    ElMessage.warning("无效的详情数据")
    return
  }
  const primaryKey = crud.dict?.primaryId ?? "id"
  const defaultQuery = pick(row, [primaryKey])
  if (defaultQuery[primaryKey] === undefined || defaultQuery[primaryKey] === null) {
    ElMessage.warning(`缺少主键字段 ${primaryKey}`)
    return
  }
  setData(row)
  visible.value = true
  loading.value = true
  return runDetailFlow(row, defaultQuery)
}

/** 主动刷新详情（可覆盖部分查询参数）；无缓存时直接退出并复位 loading，返回查询 Promise。 */
function refresh(params: Record<string, any> = {}) {
  const query = merge(clone(paramsCache.value), params)
  if (!Object.keys(query).length) {
    loading.value = false
    return
  }
  return runDetailFlow(query, query)
}

/**
 * 手动设置详情数据
 */
function setData(value: DetailData) {
  data.value = clone(value ?? {})
}

function getData() {
  return clone(data.value)
}

/** 清空状态，防止数据残留，但不主动关闭弹窗。 */
function clearData() {
  data.value = {}
  paramsCache.value = {}
}

/** 关闭弹窗，保持数据快照到 closed 钩子触发后再清理。 */
function close() {
  visible.value = false
  loading.value = false
}

function handleBeforeOpen() {
  cache.value += 1
  emit("beforeOpen")
  options.onBeforeOpen?.()
}

/** 关闭前抛出快照，供外部存档或二次确认。 */
function handleBeforeClose() {
  const snapshot = getData()
  emit("beforeClose", snapshot)
  options.onBeforeClose?.(snapshot)
}

/** 打开后回调，留给调用方做副作用（如埋点）。 */
function handleOpen() {
  emit("open")
  options.onOpen?.()
}

/** 弹窗关闭事件：同步通知外部，不立即清理数据（等待 closed）。 */
function handleClose() {
  const snapshot = getData()
  emit("close", snapshot)
  options.onClose?.(snapshot)
}

/** 弹窗完全关闭后再清理数据，避免关闭动画期间数据闪空 */
function handleClosed() {
  clearData()
}

/**
 * 处理 mitt detail / proxy 的统一逻辑
 */
function handleDetailEvent(row: DetailData) {
  if (!row)
    return
  setData(row)
  detail(row)
}

/** mitt detail 事件处理 */
function detailHandler(row: unknown) {
  if (row && typeof row === "object")
    handleDetailEvent(row as DetailData)
}
/** crud.proxy 事件处理：与表格代理事件保持一致。 */
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

defineExpose<DetailExpose<DetailData>>({
  get data() {
    return data.value as DetailData
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

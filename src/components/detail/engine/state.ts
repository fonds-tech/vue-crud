import type { DetailData, DetailOptions, DetailUseOptions } from "../types"
import { clone } from "@fonds/utils"
import { mergeWith } from "lodash-es"
import { ref, reactive } from "vue"

interface CrudContext {
  dict?: {
    label?: Record<string, string | undefined>
  }
}

/**
 * 详情状态返回类型。
 * @description 为 createDetailState 提供显式返回类型，用于确保类型声明的可移植性。
 * 采用 Record 类型替代精确类型，避免依赖内部模块路径。
 */
export interface DetailState<D extends DetailData = DetailData> {
  /** 组件配置选项 */
  options: DetailOptions<D>
  /** 详情数据 */
  data: { value: D }
  /** 参数缓存 */
  paramsCache: { value: Record<string, any> }
  /** 弹窗可见性 */
  visible: { value: boolean }
  /** 加载状态 */
  loading: { value: boolean }
  /** 缓存标识 */
  cache: { value: number }
  /** 确保默认操作按钮存在 */
  ensureActions: (currentOptions?: DetailOptions<D>, currentCrud?: CrudContext) => void
  /** 合并更新配置 */
  use: (useOptions: DetailUseOptions<D>) => void
  /** 设置数据 */
  setData: (value: DetailData) => void
  /** 获取数据副本 */
  getData: () => D
  /** 清空数据 */
  clearData: () => void
}

/** 创建详情组件的状态与配置管理。 */
export function createDetailState<D extends DetailData = DetailData>(crud: CrudContext): DetailState<D> {
  const data = ref<D>({} as D)
  const paramsCache = ref<Record<string, any>>({})
  const visible = ref(false)
  const loading = ref(false)
  const cache = ref(0)

  const options = reactive<DetailOptions<D>>({
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

  ensureActions(options, crud)

  function ensureActions(currentOptions = options, currentCrud = crud) {
    if (!currentOptions.actions.length) {
      currentOptions.actions = [
        {
          type: "ok",
          text: currentCrud.dict?.label?.confirm ?? "确定",
        },
      ]
    }
  }

  function use(useOptions: DetailUseOptions<D>) {
    mergeWith(options, useOptions as any, (_objValue, srcValue) => {
      if (Array.isArray(srcValue))
        return srcValue
      return undefined
    })
    ensureActions()
  }

  function setData(value: DetailData) {
    data.value = clone(value ?? {}) as D
  }

  function getData() {
    return clone(data.value) as D
  }

  function clearData() {
    data.value = {} as D
    paramsCache.value = {}
  }

  // 使用类型断言绕过 Vue reactive 类型的复杂推导
  return {
    options,
    data,
    paramsCache,
    visible,
    loading,
    cache,
    ensureActions,
    use,
    setData,
    getData,
    clearData,
  } as DetailState<D>
}

import type { DetailData, DetailOptions, DetailUseOptions } from "./types"
import { clone } from "@fonds/utils"
import { mergeWith } from "lodash-es"
import { ref, reactive } from "vue"

interface CrudContext {
  dict?: {
    label?: Record<string, string | undefined>
  }
}

/** 创建详情组件的状态与配置管理。 */
export function createDetailState<D extends DetailData = DetailData>(crud: CrudContext) {
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
  }
}

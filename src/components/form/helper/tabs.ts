import type { Ref } from "vue"
import type { FormInstance } from "element-plus"
import type { FormItem, FormModel, FormConfig, FormTabPane, FormTabsProps } from "../../../types"
import { ref, computed } from "vue"

interface Options<T extends FormModel = FormModel> {
  config: FormConfig<T>
  Form: Ref<FormInstance | undefined>
}

type InternalTabPane = FormTabPane & { loaded?: boolean }
type TabsItem<T extends FormModel> = FormItem<T> & { props?: FormTabsProps & { labels?: InternalTabPane[] } }
type InternalFormItem<T extends FormModel> = FormItem<T> & { _hidden?: boolean }

function isTabsItem<T extends FormModel>(item: FormItem<T>): item is TabsItem<T> {
  return item.type === "tabs"
}

export function useTabs<T extends FormModel = FormModel>({ config, Form }: Options<T>) {
  const active = ref<string | undefined>()

  const list = computed<InternalTabPane[]>(() => {
    const tabs = config.items.find(isTabsItem)
    return tabs?.props?.labels ?? []
  })

  function getItem(value?: string) {
    if (value === undefined || value === null || value === "") {
      return undefined
    }
    return list.value.find(item => item.value === value)
  }

  function isLoaded(value?: string) {
    const target = getItem(value)
    if (!target) {
      return true
    }
    return target.lazy ? target.loaded === true : true
  }

  function onLoad(value?: string) {
    const target = getItem(value)
    if (target) {
      target.loaded = true
    }
  }

  function getTabsItem() {
    return config.items.find(isTabsItem)
  }

  function mergeProp(item: FormItem<T>) {
    const tabsItem = getTabsItem()
    if (!tabsItem || !tabsItem.props?.mergeProp) {
      return
    }

    const pane = tabsItem.props.labels?.find(tab => tab.value === item.group)
    if (
      pane
      && typeof pane.name === "string"
      && pane.name.length > 0
      && typeof item.field === "string"
      && item.field.length > 0
    ) {
      item.field = `${pane.name}-${item.field}`
    }
  }

  function clear() {
    active.value = undefined
    list.value.forEach((item) => {
      if (item.lazy === true) {
        item.loaded = false
      }
      else {
        item.loaded = undefined
      }
    })
  }

  function set(value?: string) {
    active.value = value
  }

  function toGroup({ prop }: { prop: string }) {
    if (active.value === undefined || prop.length === 0) {
      return
    }

    let groupName: string | undefined

    const formEl = Form.value?.$el as HTMLElement | undefined
    const el = formEl?.querySelector<HTMLElement>(`[data-prop="${prop}"]`) ?? null
    if (el !== null) {
      const attr = el.getAttribute("data-group")
      if (typeof attr === "string" && attr.length > 0) {
        groupName = attr
      }
    }
    else {
      const deep = (items: FormItem<T>[]) => {
        items.forEach((item) => {
          if (String(item.field) === prop && typeof item.group === "string") {
            groupName = item.group
          }
          if (Array.isArray(item.children)) {
            deep(item.children)
          }
        })
      }

      deep(config.items)
    }

    if (typeof groupName === "string" && groupName.length > 0) {
      set(groupName)
    }
  }

  async function change(value: string, needValidate = true) {
    const finish = () => {
      active.value = value
    }

    if (!needValidate) {
      finish()
      return
    }

    let hasError = false
    const validators = config.items
      .filter((item): item is InternalFormItem<T> => item.group === active.value)
      .filter(item => !item._hidden && typeof item.field === "string" && item.field.length > 0)
      .map(async (item) => {
        const field = item.field as string
        const result = await new Promise<string | undefined>((resolve) => {
          void Form.value?.validateField(field, (isValid) => {
            if (!isValid) {
              hasError = true
            }
            resolve(!isValid ? field : undefined)
          })
        })
        return result
      })

    const result = await Promise.all(validators)
    if (hasError) {
      const errors = result.filter((field): field is string => typeof field === "string")
      throw errors
    }

    finish()
  }

  return {
    active,
    list,
    isLoaded,
    onLoad,
    get: getTabsItem,
    set,
    change,
    clear,
    mergeProp,
    toGroup,
  }
}

import type { Ref, WatchStopHandle } from "vue"
import type { FormModel, FormPlugin } from "../../../types"
import { useConfig } from "../../../hooks"
import { watch, getCurrentInstance } from "vue"

interface PluginHooks<T extends FormModel = FormModel> {
  onOpen: Array<() => void>
  onClose: Array<() => void>
  onSubmit: Array<(model: T) => T | Promise<T>>
}

export function usePlugins<T extends FormModel = FormModel>(enable: boolean, { visible }: { visible: Ref<boolean> }) {
  const { style } = useConfig()
  const instance = getCurrentInstance()
  const hooks: PluginHooks<T> = {
    onOpen: [],
    onClose: [],
    onSubmit: [],
  }

  let stopWatcher: WatchStopHandle | null = null

  function reset() {
    hooks.onOpen = []
    hooks.onClose = []
    hooks.onSubmit = []
  }

  function create(plugins: FormPlugin<T>[] = []) {
    if (!enable) {
      return
    }

    reset()

    if (stopWatcher !== null) {
      stopWatcher()
      stopWatcher = null
    }

    const registry = new Set<FormPlugin<T>>()
    const list = [...(style.form?.plugins || []), ...plugins].filter((plugin) => {
      if (registry.has(plugin)) {
        return false
      }
      registry.add(plugin)
      return true
    })

    list.forEach((plugin) => {
      plugin({
        exposed: instance?.exposed,
        onOpen(cb) {
          hooks.onOpen.push(cb)
        },
        onClose(cb) {
          hooks.onClose.push(cb)
        },
        onSubmit(cb) {
          hooks.onSubmit.push(cb)
        },
      })
    })

    stopWatcher = watch(
      visible,
      (val) => {
        if (val) {
          hooks.onOpen.forEach(fn => fn())
        }
        else {
          hooks.onClose.forEach(fn => fn())
        }
      },
      { immediate: true },
    )
  }

  async function submit(model: T) {
    let data = model

    for (const hook of hooks.onSubmit) {
      const result = await hook(data)
      if (result !== undefined) {
        data = result
      }
    }

    return data
  }

  return {
    create,
    submit,
  }
}

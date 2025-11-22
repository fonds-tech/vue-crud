import type { FormHook, FormField, FormModel, FormHookFn, FormHookKey } from "../types"
import { isArray, isEmpty, isObject, isString, isFunction } from "lodash-es"

/* 钩子执行依赖任意 schema 配置，禁用严格的 any/boolean 校验规则 */

interface HookTree<T extends FormModel = FormModel> {
  bind: { value: any, hook: FormHook, model: T, field: FormField }
  submit: { value: any, hook: FormHook, model: T, field: FormField }
}

const formatters: Record<string, FormHookFn> = {
  number(value) {
    if (isArray(value)) {
      return value.map(Number)
    }
    return value !== undefined && value !== null ? Number(value) : value
  },
  string(value) {
    if (isArray(value)) {
      return value.map(String)
    }
    return value !== undefined && value !== null ? String(value) : value
  },
  split(value) {
    if (isString(value)) {
      return value.split(",").filter(Boolean)
    }
    return isArray(value) ? value : []
  },
  join(value) {
    return isArray(value) ? value.join(",") : value
  },
  boolean(value) {
    return Boolean(value)
  },
  booleanNumber(value) {
    return value ? 1 : 0
  },
  datetimeRange(value, { model, field, method }) {
    if (!field) {
      return value
    }

    const key = String(field)
    const prefix = key.charAt(0).toUpperCase() + key.slice(1)
    const start = `start${prefix}`
    const end = `end${prefix}`

    if (method === "bind") {
      return [model[start], model[end]]
    }

    const [startTime, endTime] = value || []
    model[start] = startTime
    model[end] = endTime
    return undefined
  },
  splitJoin(value, { method }) {
    if (method === "bind") {
      return isString(value) ? value.split(",").filter(Boolean) : value
    }
    return isArray(value) ? value.join(",") : value
  },
  json(value, { method }) {
    if (method === "bind") {
      try {
        return JSON.parse(value)
      }
      catch {
        return {}
      }
    }
    return JSON.stringify(value)
  },
  empty(value) {
    if (isString(value)) {
      return value === "" ? undefined : value
    }
    if (isArray(value)) {
      return isEmpty(value) ? undefined : value
    }
    return value
  },
}

function normalizeField<T extends FormModel>(model: T, field?: FormField, value?: any) {
  if (!field) {
    return
  }

  const key = String(field)
  const path = key.split(".")
  let cursor: Record<string, any> = model as Record<string, any>

  if (path.length === 1) {
    cursor[key] = value
    return
  }

  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i]
    cursor[segment] = cursor[segment] ?? {}
    cursor = cursor[segment]
  }

  cursor[path[path.length - 1]] = value
}

function parse<T extends FormModel, K extends keyof HookTree<T>>(
  phase: K,
  payload: HookTree<T>[K],
) {
  const { value, model, field, hook } = payload

  if (!hook) {
    return
  }

  const stack: Array<string | FormHookFn> = []

  if (isString(hook)) {
    stack.push(hook)
  }
  else if (isArray(hook)) {
    stack.push(...hook)
  }
  else if (isFunction(hook)) {
    stack.push(hook)
  }
  else if (isObject(hook)) {
    const config = hook as { bind?: FormHookKey | FormHookFn | Array<FormHookKey | FormHookFn>, submit?: FormHookKey | FormHookFn | Array<FormHookKey | FormHookFn> }
    const pipes = config[phase]
    if (pipes) {
      const normalized = (isArray(pipes) ? pipes : [pipes])
      stack.push(...normalized)
    }
  }

  let nextValue = value

  stack.forEach((pipe) => {
    let handler: FormHookFn | undefined

    if (isString(pipe)) {
      handler = formatters[pipe]
    }
    else if (isFunction(pipe)) {
      handler = pipe
    }

    if (handler) {
      nextValue = handler(nextValue, { model: model as FormModel, field, method: phase as "bind" | "submit" })
    }
  })

  if (field !== undefined) {
    normalizeField(model, field, nextValue)
  }
}

const formHook = {
  bind<T extends FormModel>(data: HookTree<T>["bind"]): void {
    parse("bind", data)
  },
  submit<T extends FormModel>(data: HookTree<T>["submit"]): void {
    parse("submit", data)
  },
}

export function registerFormHook(name: string, handler: FormHookFn): void {
  formatters[name] = handler
}

export default formHook

import type { FormHook, FormField, FormModel, FormHookFn, FormHookKey } from "@/components/fd-form/type"
import { isArray, isEmpty, isObject, isString, isFunction } from "@fonds/utils"

/* 钩子执行依赖任意 schema 配置，禁用严格的 any/boolean 校验规则 */

// 钩子执行上下文接口
interface HookTree<T extends FormModel = FormModel> {
  bind: { value: any, hook: FormHook, model: T, field: FormField }
  submit: { value: any, hook: FormHook, model: T, field: FormField }
}

// 内置格式化函数集合
const formatters: Record<string, FormHookFn> = {
  // 转换为数字
  number(value) {
    if (isArray(value)) {
      return value.map(Number)
    }
    return value !== undefined && value !== null ? Number(value) : value
  },
  // 转换为字符串
  string(value) {
    if (isArray(value)) {
      return value.map(String)
    }
    return value !== undefined && value !== null ? String(value) : value
  },
  // 字符串分割为数组 (仅在 bind 阶段有意义，通常用于逗号分隔的字符串转数组)
  split(value) {
    if (isString(value)) {
      return value.split(",").filter(Boolean)
    }
    return isArray(value) ? value : []
  },
  // 数组合并为字符串 (通常用于 submit 阶段)
  join(value) {
    return isArray(value) ? value.join(",") : value
  },
  // 转换为布尔值
  boolean(value) {
    return Boolean(value)
  },
  // 布尔值与数字 0/1 互转
  booleanNumber(value) {
    return value ? 1 : 0
  },
  // 日期范围处理：将数组拆分为 start/end 字段，或将 start/end 字段合并为数组
  datetimeRange(value, { model, field, method }) {
    if (!field) {
      return value
    }

    const key = String(field)
    const prefix = key.charAt(0).toUpperCase() + key.slice(1)
    const start = `start${prefix}`
    const end = `end${prefix}`

    // bind 阶段：从 model 中读取 start/end 字段组合成数组
    if (method === "bind") {
      const rangeValue = [model[start], model[end]]
      return rangeValue.every(entry => entry === undefined) ? [] : rangeValue
    }

    // submit 阶段：将数组拆分回 model 的 start/end 字段
    if (!isArray(value) || value.length < 2) {
      return undefined
    }
    const [startTime, endTime] = value
    model[start] = startTime
    model[end] = endTime
    return undefined
  },
  // 组合 split 和 join：bind 时 split，submit 时 join
  splitJoin(value, { method }) {
    if (method === "bind") {
      return isString(value) ? value.split(",").filter(Boolean) : value
    }
    return isArray(value) ? value.join(",") : value
  },
  // JSON 转换：bind 时 parse，submit 时 stringify
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
  // 处理空值：空字符串或空数组转为 undefined
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

/**
 * 标准化字段值并设置到模型中
 * 支持嵌套路径 (e.g. "user.name")
 */
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

  // 遍历路径并自动创建缺失的对象
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i]
    cursor[segment] = cursor[segment] ?? {}
    cursor = cursor[segment]
  }

  cursor[path[path.length - 1]] = value
}

function deleteField<T extends FormModel>(model: T, field?: FormField) {
  if (!field) {
    return
  }

  const key = String(field)
  const path = key.split(".")
  let cursor: Record<string, any> = model as Record<string, any>

  if (path.length === 1) {
    delete cursor[key]
    return
  }

  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i]
    const next = cursor[segment]
    if (!next || typeof next !== "object") {
      return
    }
    cursor = next
  }

  delete cursor[path[path.length - 1]]
}

/**
 * 解析并执行钩子函数
 * @param phase 当前阶段 ('bind' 或 'submit')
 * @param payload 上下文参数
 */
function parse<T extends FormModel, K extends keyof HookTree<T>>(
  phase: K,
  payload: HookTree<T>[K],
) {
  const { value, model, field, hook } = payload

  if (!hook) {
    return
  }

  const stack: Array<string | FormHookFn> = []

  // 规范化 hook 配置为数组
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
    // 处理对象配置形式 { bind: ..., submit: ... }
    const config = hook as { bind?: FormHookKey | FormHookFn | Array<FormHookKey | FormHookFn>, submit?: FormHookKey | FormHookFn | Array<FormHookKey | FormHookFn> }
    const pipes = config[phase]
    if (pipes) {
      const normalized = (isArray(pipes) ? pipes : [pipes])
      stack.push(...normalized)
    }
  }

  let nextValue = value

  // 依次执行管道中的处理函数
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

  if (field === undefined) {
    return
  }

  if (phase === "submit" && nextValue === undefined) {
    deleteField(model, field)
    return
  }

  normalizeField(model, field, nextValue)
}

const formHook = {
  // 数据绑定阶段：从数据源 -> 表单模型
  bind<T extends FormModel>(data: HookTree<T>["bind"]): void {
    parse("bind", data)
  },
  // 数据提交阶段：从表单模型 -> 提交数据
  submit<T extends FormModel>(data: HookTree<T>["submit"]): void {
    parse("submit", data)
  },
}

// 注册自定义钩子
export function registerFormHook(name: string, handler: FormHookFn): void {
  formatters[name] = handler
}

export default formHook

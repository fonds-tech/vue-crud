import type { FormHook, FormField, FormModel, FormHookFn, FormHookKey } from "../types"
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
  // 字符串分割为数组 (通常用于 bind: string -> array)
  split(value) {
    if (isString(value)) {
      return value.split(",").filter(Boolean)
    }
    return isArray(value) ? value : []
  },
  // 数组合并为字符串 (通常用于 submit: array -> string)
  join(value) {
    return isArray(value) ? value.join(",") : value
  },
  // 强制转换为布尔值
  boolean(value) {
    return Boolean(value)
  },
  // 布尔值与数字 1/0 互转
  // bind: 1 -> true, 0 -> false
  // submit: true -> 1, false -> 0
  booleanNumber(value, { method }) {
    if (method === "bind") {
      return Boolean(value)
    }
    return value ? 1 : 0
  },
  // 日期范围处理：将数组拆分为 start/end 字段，或将 start/end 字段合并为数组
  datetimeRange(value, { model, field, method }) {
    if (!field) {
      return value
    }

    const key = String(field)
    // 假设 field 为 'time'，则生成 'startTime', 'endTime'
    // 若 field 为 'createTime'，则生成 'startCreateTime', 'endCreateTime'
    const prefix = key.charAt(0).toUpperCase() + key.slice(1)
    const start = `start${prefix}`
    const end = `end${prefix}`

    // bind 阶段：从 model 中读取 start/end 字段组合成数组返回给表单项
    if (method === "bind") {
      const rangeValue = [model[start], model[end]]
      return rangeValue.every(entry => entry === undefined) ? [] : rangeValue
    }

    // submit 阶段：将数组值拆分写回 model 的 start/end 字段，当前字段值通常设为 undefined 以避免冗余
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
        return isString(value) ? JSON.parse(value) : value
      }
      catch {
        return {}
      }
    }
    return JSON.stringify(value)
  },
  // 处理空值：submit 时将空字符串或空数组转为 undefined
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
 * 标准化字段值并设置到模型中 (支持嵌套路径)
 * @param model 数据模型
 * @param field 字段路径 (如 "user.info.name")
 * @param value 要设置的值
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

/**
 * 从模型中删除字段 (支持嵌套路径)
 * @param model 数据模型
 * @param field 字段路径
 */
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

// ==================== 钩子解析与执行 ====================

type HookPhase = "bind" | "submit"

/**
 * 步骤1：将 hook 配置规范化为执行管道数组
 * 支持多种配置形式：字符串、函数、数组、对象
 */
function normalizeToPipes(hook: FormHook, phase: HookPhase): Array<string | FormHookFn> {
  // 单个字符串或函数 -> 包装为数组
  if (isString(hook) || isFunction(hook)) {
    return [hook]
  }

  // 数组 -> 直接使用
  if (isArray(hook)) {
    return hook
  }

  // 对象配置 { bind: ..., submit: ... } -> 提取对应阶段的配置
  if (isObject(hook)) {
    const config = hook as {
      bind?: FormHookKey | FormHookFn | Array<FormHookKey | FormHookFn>
      submit?: FormHookKey | FormHookFn | Array<FormHookKey | FormHookFn>
    }
    const phaseConfig = config[phase]
    if (!phaseConfig) return []
    return isArray(phaseConfig) ? phaseConfig : [phaseConfig]
  }

  return []
}

/**
 * 步骤2：依次执行管道中的处理函数
 * 每个处理函数的输出作为下一个的输入
 */
function executePipes<T extends FormModel>(
  pipes: Array<string | FormHookFn>,
  value: any,
  context: { model: T, field: FormField | undefined, phase: HookPhase },
): any {
  return pipes.reduce((current, pipe) => {
    // 解析处理函数：字符串 -> 内置格式化器，函数 -> 直接使用
    const handler: FormHookFn | undefined = isString(pipe)
      ? formatters[pipe]
      : isFunction(pipe) ? pipe : undefined

    if (!handler) return current
    return handler(current, { model: context.model as FormModel, field: context.field ?? "", method: context.phase })
  }, value)
}

/**
 * 步骤3：将处理结果写入 model
 * - 无字段名：仅执行副作用，不更新
 * - submit 阶段返回 undefined：删除字段
 * - 其他情况：设置字段值
 */
function updateModelField<T extends FormModel>(
  model: T,
  field: FormField | undefined,
  value: any,
  phase: HookPhase,
): void {
  // 无字段名，仅用于副作用处理
  if (field === undefined) return

  // submit 阶段返回 undefined 表示需要删除该字段
  if (phase === "submit" && value === undefined) {
    deleteField(model, field)
    return
  }

  // 正常设置字段值
  normalizeField(model, field, value)
}

/**
 * 解析并执行钩子函数管道
 * 流程：规范化配置 -> 执行管道 -> 更新 model
 */
function parse<T extends FormModel, K extends keyof HookTree<T>>(
  phase: K,
  payload: HookTree<T>[K],
) {
  const { value, model, field, hook } = payload
  if (!hook) return

  // 1. 规范化 hook 配置为执行管道
  const pipes = normalizeToPipes(hook, phase as HookPhase)

  // 2. 执行管道处理
  const result = executePipes(pipes, value, { model, field, phase: phase as HookPhase })

  // 3. 更新 model
  updateModelField(model, field, result, phase as HookPhase)
}

const formHook = {
  // 数据绑定阶段：数据源 -> 表单模型
  bind<T extends FormModel>(data: HookTree<T>["bind"]): void {
    parse("bind", data)
  },
  // 数据提交阶段：表单模型 -> 提交数据
  submit<T extends FormModel>(data: HookTree<T>["submit"]): void {
    parse("submit", data)
  },
}

/**
 * 注册自定义全局钩子
 * @param name 钩子名称
 * @param handler 钩子函数
 */
export function registerFormHook(name: string, handler: FormHookFn): void {
  formatters[name] = handler
}

export default formHook

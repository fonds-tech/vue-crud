import type { FormHelpers } from "./helpers"
import type { FormRecord, FormOptions, InternalRule } from "../interface"
import formHook from "../hooks"
import { clone, isDef, isNoEmpty } from "@fonds/utils"

interface NormalizeContext {
  options: FormOptions
  model: FormRecord
  helpers: FormHelpers
}

/**
 * 规范化表单项配置：补默认组件结构、应用默认值、执行 hook、注入必填规则。
 * @param options 参数对象
 * @param options.options 表单配置
 * @param options.model 表单模型
 * @param options.helpers 辅助方法集合
 */
export function normalizeItems({ options, model, helpers }: NormalizeContext) {
  options.items.forEach((item) => {
    helpers.ensureComponentDefaults(item)

    const propName = helpers.propKey(item.prop)
    if (isDef(item.value) && !isDef(helpers.getModelValue(item.prop))) {
      helpers.setModelValue(item.prop, clone(item.value))
    }

    if (item.hook && item.prop) {
      formHook.bind({
        hook: item.hook,
        model,
        field: propName,
        value: helpers.getModelValue(item.prop),
      })
    }

    if (helpers.required(item)) {
      const rule: InternalRule = {
        required: true,
        _inner: true,
        trigger: ["change", "blur"],
        validator: (_rule, value, callback) => {
          const isEmpty = value === undefined || value === null || value === ""
          if (isEmpty)
            callback(new Error(`${item.label ?? propName}为必填项`))
          else
            callback()
        },
      }
      if (isNoEmpty(item.rules)) {
        const ruleList: InternalRule[] = (Array.isArray(item.rules) ? item.rules : [item.rules]).filter(Boolean) as InternalRule[]
        const index = ruleList.findIndex(r => r._inner === true)
        if (index > -1)
          ruleList[index] = rule
        else
          ruleList.unshift(rule)
        item.rules = ruleList
      }
      else {
        item.rules = [rule]
      }
    }
  })
}

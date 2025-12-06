import { renderForm } from "./render/form"
import { useFormEngine } from "./engine"
import { defineComponent } from "vue"
import "./style.scss"

export default defineComponent({
  name: "fd-form",
  inheritAttrs: false,
  setup(_, { attrs, slots, expose }) {
    // 初始化表单引擎，获取状态与方法
    const { id, formRef, options, model, step, activeGroupName, resolvedActiveGroup, activeStepName, action, methods, use, next, prev, helpers } = useFormEngine()

    // 暴露给父组件的实例属性和方法
    expose({
      id,
      use,
      next,
      prev,
      mode: options.mode,
      model,
      items: options.items,
      form: formRef,
      ...action,
      ...methods,
    })

    // 返回渲染函数
    return () =>
      renderForm({
        formRef,
        options,
        model,
        step,
        activeGroupName,
        resolvedActiveGroup,
        activeStepName,
        helpers,
        slots,
        attrs,
      })
  },
})

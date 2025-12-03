import { renderForm } from "./form-render"
import { useFormEngine } from "./useFormEngine"
import { defineComponent } from "vue"
import "./index.scss"

/**
 * FdForm 动态表单组件
 * @description
 * 基于 Element Plus Form 封装的配置化表单组件。
 * 支持 Grid 布局、Tabs 分组、Steps 分步向导，以及强大的动态属性和 Hooks 机制。
 */
export default defineComponent({
  name: "fd-form",
  inheritAttrs: false,
  setup(_, { attrs, slots, expose }) {
    // 初始化表单引擎，获取状态与方法
    const {
      id,
      formRef,
      options,
      model,
      step,
      activeGroupName,
      resolvedActiveGroup,
      action,
      methods,
      use,
      next,
      prev,
      helpers,
    } = useFormEngine()

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
    return () => renderForm({
      formRef,
      options,
      model,
      step,
      activeGroupName,
      resolvedActiveGroup,
      helpers,
      slots,
      attrs,
    })
  },
})

import { renderForm } from "./form-render"
import { useFormEngine } from "./useFormEngine"
import { defineComponent } from "vue"
import "./index.scss"

export default defineComponent({
  name: "fd-form",
  inheritAttrs: false,
  setup(_, { attrs, slots, expose }) {
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

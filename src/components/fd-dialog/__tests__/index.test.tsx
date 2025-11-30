import type { Ref } from "vue"
import type { MountingOptions } from "@vue/test-utils"
import Dialog from "../index.vue"
import { mount } from "@vue/test-utils"
import { it, expect, describe } from "vitest"
import { h, nextTick, defineComponent } from "vue"

const ElDialogStub = defineComponent({
  name: "ElDialog",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "update:fullscreen", "open", "opened", "close", "closed", "openAutoFocus", "closeAutoFocus"],
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          "class": ["el-dialog-stub", attrs.class],
          "data-model-value": props.modelValue,
          "data-fullscreen": props.fullscreen,
        },
        [slots.header?.(), slots.default?.(), slots.footer?.()],
      )
  },
})

const ElButtonStub = defineComponent({
  name: "ElButton",
  inheritAttrs: false,
  emits: ["click"],
  setup(_, { slots, emit, attrs }) {
    return () =>
      h(
        "button",
        {
          type: "button",
          ...attrs,
          class: ["el-button-stub", attrs.class],
          onClick: (event: MouseEvent) => emit("click", event),
        },
        slots.default?.(),
      )
  },
})

const ElIconStub = defineComponent({
  name: "ElIcon",
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () => h("span", { ...attrs, class: ["el-icon-stub", attrs.class] }, slots.default?.())
  },
})

const ElScrollbarStub = defineComponent({
  name: "ElScrollbar",
  inheritAttrs: false,
  props: {
    height: {
      type: [String, Number],
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          "class": ["el-scrollbar-stub", attrs.class],
          "data-height": props.height,
        },
        slots.default?.(),
      )
  },
})

interface DialogExpose {
  dialogVisible: Ref<boolean>
  fullscreenActive: Ref<boolean>
  open: () => void
  close: () => void
  fullscreen: (value?: boolean) => void
}

function getExpose(wrapper: ReturnType<typeof mountDialog>): DialogExpose {
  return (wrapper.vm.$.exposed ?? {}) as DialogExpose
}

function mountDialog(options: MountingOptions<any> = {}) {
  const { global, ...rest } = options
  type MountSlots = NonNullable<MountingOptions<any>["slots"]>
  const baseSlots: MountSlots = {
    default: "默认插槽",
    footer: "底部插槽",
  }
  return mount(Dialog, {
    props: {
      modelValue: true,
      title: "测试标题",
      ...rest.props,
    },
    slots: {
      ...baseSlots,
      ...(rest.slots ?? {}),
    },
    global: {
      stubs: {
        "el-dialog": ElDialogStub,
        "el-button": ElButtonStub,
        "el-icon": ElIconStub,
        "el-scrollbar": ElScrollbarStub,
        ...(global?.stubs ?? {}),
      },
      ...(global ?? {}),
    },
  })
}

describe("fd-dialog", () => {
  it("渲染标题及默认/页脚插槽内容", () => {
    const wrapper = mountDialog()
    expect(wrapper.find(".fd-dialog__title").text()).toBe("测试标题")
    expect(wrapper.text()).toContain("默认插槽")
    expect(wrapper.text()).toContain("底部插槽")
  })

  it("点击关闭按钮会发出 update:modelValue 事件并同步可见性", async () => {
    const wrapper = mountDialog()
    const closeButton = wrapper.findAll(".fd-dialog__action")[1]
    await closeButton.trigger("click")
    const exposed = getExpose(wrapper)
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false])
    expect(exposed.dialogVisible.value).toBe(false)
  })

  it("全屏按钮与方法都可以切换全屏状态", async () => {
    const wrapper = mountDialog({ props: { fullscreen: false } })
    const exposed = getExpose(wrapper)
    const fullscreenButton = wrapper.findAll(".fd-dialog__action")[0]
    await fullscreenButton.trigger("click")
    expect(exposed.fullscreenActive.value).toBe(true)
    exposed.fullscreen(false)
    expect(exposed.fullscreenActive.value).toBe(false)
    exposed.fullscreen()
    expect(exposed.fullscreenActive.value).toBe(true)
  })

  it("支持外部更新 modelValue 与 fullscreen", async () => {
    const wrapper = mountDialog({ props: { modelValue: false, fullscreen: false } })
    const exposed = getExpose(wrapper)
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(exposed.dialogVisible.value).toBe(true)
    await wrapper.setProps({ fullscreen: true })
    await nextTick()
    expect(exposed.fullscreenActive.value).toBe(true)
  })

  it("能响应 el-dialog 的 update:fullscreen 事件并向外透传", async () => {
    const wrapper = mountDialog({ props: { fullscreen: false } })
    const dialogStub = wrapper.findComponent(ElDialogStub)
    const exposed = getExpose(wrapper)
    dialogStub.vm.$emit("update:fullscreen", true)
    await nextTick()
    expect(wrapper.emitted("update:fullscreen")?.[0]).toEqual([true])
    expect(exposed.fullscreenActive.value).toBe(true)
  })

  it("响应 Element Plus 的生命周期事件", () => {
    const wrapper = mountDialog()
    const dialogStub = wrapper.findComponent(ElDialogStub)
    const lifecycleEvents = ["open", "opened", "close", "closed", "openAutoFocus", "closeAutoFocus"] as const
    lifecycleEvents.forEach(event => dialogStub.vm.$emit(event))
    lifecycleEvents.forEach(event => expect(wrapper.emitted(event)).toHaveLength(1))
  })

  it("能处理来自 el-dialog 的 update:modelValue 事件", async () => {
    const wrapper = mountDialog()
    const dialogStub = wrapper.findComponent(ElDialogStub)
    const exposed = getExpose(wrapper)
    dialogStub.vm.$emit("update:modelValue", false)
    await nextTick()
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false])
    expect(exposed.dialogVisible.value).toBe(false)
  })

  it("根据 height 计算滚动区域高度", () => {
    const wrapper = mountDialog({ props: { height: 240 } })
    const scrollbar = wrapper.find(".fd-dialog__scrollbar")
    expect(scrollbar.attributes("data-height")).toBe("240px")
  })
})

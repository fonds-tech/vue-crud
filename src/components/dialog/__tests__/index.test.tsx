import type { Ref } from "vue"
import type { MountingOptions } from "@vue/test-utils"
import Dialog from "../dialog"
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
    // 用 div 模拟 el-dialog，data-* 标记可断言内部状态变化
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
    maxHeight: {
      type: [String, Number],
      default: undefined,
    },
  },
  setup(props: any, { slots, attrs }: any) {
    return () =>
      h(
        "div",
        {
          ...attrs,
          "class": ["el-scrollbar-stub", attrs.class],
          "data-height": props.height,
          "data-max-height": props.maxHeight,
        },
        slots.default?.(),
      )
  },
})

interface DialogExpose {
  /** 组件内部暴露的可见性状态 */
  dialogVisible: Ref<boolean>
  /** 组件内部暴露的全屏状态 */
  fullscreenActive: Ref<boolean>
  /** 打开对话框的命令式调用 */
  open: () => void
  /** 关闭对话框的命令式调用 */
  close: () => void
  /**
   * 切换或设置全屏
   * @param value 可选，布尔值时强制设置全屏状态
   * @returns 无返回值
   */
  fullscreen: (value?: boolean) => void
}

function getExpose(wrapper: ReturnType<typeof mountDialog>): DialogExpose {
  return (wrapper.vm.$.exposed ?? {}) as DialogExpose
}

function mountDialog(options: MountingOptions<any> = {}) {
  const { global, props, slots, ...rest } = options
  type MountSlots = NonNullable<MountingOptions<any>["slots"]>
  const baseSlots: MountSlots = {
    default: () => "默认插槽",
    footer: () => "底部插槽",
  }
  // 使用 mount 时集中注入 stubs，避免 Element Plus 真实组件影响逻辑，只关心事件/插槽透传
  return mount(Dialog, {
    ...rest,
    props: {
      modelValue: true,
      title: "测试标题",
      ...props,
    },
    slots: {
      ...baseSlots,
      ...(slots ?? {}),
    } as any,
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

  it("当 showClose 为 false 时不显示关闭按钮", () => {
    const wrapper = mountDialog({ props: { showClose: false } })
    // 只有全屏按钮一个 action
    expect(wrapper.findAll(".fd-dialog__action")).toHaveLength(1)
    expect(wrapper.find("[aria-label=\"关闭弹窗\"]").exists()).toBe(false)
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

  it("expose 的 open 和 close 方法能控制可见性", async () => {
    const wrapper = mountDialog({ props: { modelValue: false } })
    const exposed = getExpose(wrapper)

    exposed.open()
    await nextTick()
    const emittedOpen = wrapper.emitted("update:modelValue")
    expect(emittedOpen?.[emittedOpen.length - 1]).toEqual([true])
    expect(exposed.dialogVisible.value).toBe(true)

    exposed.close()
    await nextTick()
    const emittedClose = wrapper.emitted("update:modelValue")
    expect(emittedClose?.[emittedClose.length - 1]).toEqual([false])
    expect(exposed.dialogVisible.value).toBe(false)
  })

  it("类名合并与原生属性透传", () => {
    const wrapper = mountDialog({
      attrs: {
        "class": "custom-class",
        "data-test": "test-id",
      },
    })
    const dialogStub = wrapper.findComponent(ElDialogStub)

    // class 应该被合并到 fd-dialog 之后
    expect(dialogStub.classes()).toContain("fd-dialog")
    expect(dialogStub.classes()).toContain("custom-class")

    // 原生属性应该透传
    expect(dialogStub.attributes("data-test")).toBe("test-id")
  })

  describe("高度计算逻辑", () => {
    it("数字 height 转换为 px", () => {
      const wrapper = mountDialog({ props: { height: 240 } })
      const scrollbar = wrapper.find(".el-scrollbar-stub")
      expect(scrollbar.attributes("data-height")).toBe("240px")
    })

    it("字符串 height 直接透传", () => {
      const wrapper = mountDialog({ props: { height: "50%" } })
      const scrollbar = wrapper.find(".el-scrollbar-stub")
      expect(scrollbar.attributes("data-height")).toBe("50%")
    })

    it("height 为 auto 时使用 maxHeight", () => {
      // height="auto" (默认), maxHeight="60vh" (默认)
      const wrapper = mountDialog({ props: { height: "auto" } })
      const scrollbar = wrapper.find(".el-scrollbar-stub")
      expect(scrollbar.attributes("data-height")).toBeUndefined()
      expect(scrollbar.attributes("data-max-height")).toBe("60vh")
    })

    it("height 为 auto 时支持自定义 maxHeight", () => {
      const wrapper = mountDialog({ props: { height: "auto", maxHeight: 400 } })
      const scrollbar = wrapper.find(".el-scrollbar-stub")
      expect(scrollbar.attributes("data-max-height")).toBe("400px")
    })

    it("无效/空 height 使用默认 fallback", () => {
      // 测试无效类型
      const wrapper = mountDialog({ props: { height: "" } })
      const scrollbar = wrapper.find(".el-scrollbar-stub")
      // 默认 fallback 为 "60vh"
      expect(scrollbar.attributes("data-height")).toBe("60vh")
    })

    it("纯数字字符串 height 转换为 px", () => {
      const wrapper = mountDialog({ props: { height: "240" } })
      const scrollbar = wrapper.find(".el-scrollbar-stub")
      expect(scrollbar.attributes("data-height")).toBe("240px")
    })

    it("maxHeight 为空字符串时使用 fallback", () => {
      const wrapper = mountDialog({ props: { height: "auto", maxHeight: "" } })
      const scrollbar = wrapper.find(".el-scrollbar-stub")
      expect(scrollbar.attributes("data-max-height")).toBe("60vh")
    })

    it("maxHeight 为纯数字字符串时转换为 px", () => {
      const wrapper = mountDialog({ props: { height: "auto", maxHeight: "300" } })
      const scrollbar = wrapper.find(".el-scrollbar-stub")
      expect(scrollbar.attributes("data-max-height")).toBe("300px")
    })
  })

  describe("插槽渲染", () => {
    it("自定义 default 插槽内容正确渲染", () => {
      const wrapper = mountDialog({
        slots: {
          default: () => "自定义内容",
        },
      })
      const scrollbar = wrapper.find(".el-scrollbar-stub")
      expect(scrollbar.text()).toContain("自定义内容")
    })

    it("自定义 footer 插槽内容正确渲染", () => {
      const wrapper = mountDialog({
        slots: {
          footer: () => "自定义底部",
        },
      })
      expect(wrapper.text()).toContain("自定义底部")
    })

    it("支持自定义 header 插槽", () => {
      const wrapper = mountDialog({
        slots: {
          header: () => "自定义头部",
        },
      })
      // header 插槽被透传到 ElDialog，但组件内部 renderHeader 仍会渲染
      // 由于 fd-dialog 内部固定使用 renderHeader，header 插槽不会覆盖
      expect(wrapper.find(".fd-dialog__title").exists()).toBe(true)
    })

    it("无 footer 插槽时不渲染底部内容", () => {
      const wrapper = mount(Dialog, {
        props: {
          modelValue: true,
          title: "测试标题",
        },
        slots: {
          default: () => "内容",
        },
        global: {
          stubs: {
            "el-dialog": ElDialogStub,
            "el-button": ElButtonStub,
            "el-icon": ElIconStub,
            "el-scrollbar": ElScrollbarStub,
          },
        },
      })
      expect(wrapper.text()).not.toContain("底部插槽")
    })
  })

  describe("全屏状态", () => {
    it("fullscreen(true) 强制设置为全屏", async () => {
      const wrapper = mountDialog({ props: { fullscreen: false } })
      const exposed = getExpose(wrapper)
      expect(exposed.fullscreenActive.value).toBe(false)
      exposed.fullscreen(true)
      expect(exposed.fullscreenActive.value).toBe(true)
      // 再次调用 true 保持全屏
      exposed.fullscreen(true)
      expect(exposed.fullscreenActive.value).toBe(true)
    })

    it("fullscreen(false) 强制退出全屏", async () => {
      const wrapper = mountDialog({ props: { fullscreen: true } })
      const exposed = getExpose(wrapper)
      expect(exposed.fullscreenActive.value).toBe(true)
      exposed.fullscreen(false)
      expect(exposed.fullscreenActive.value).toBe(false)
    })

    it("全屏状态下显示正确的图标和提示文本", async () => {
      const wrapper = mountDialog({ props: { fullscreen: false } })
      const exposed = getExpose(wrapper)

      // 非全屏状态
      let fullscreenBtn = wrapper.findAll(".fd-dialog__action")[0]
      expect(fullscreenBtn.attributes("aria-label")).toBe("全屏")
      expect(fullscreenBtn.attributes("title")).toBe("全屏")

      // 切换到全屏
      exposed.fullscreen(true)
      await nextTick()
      fullscreenBtn = wrapper.findAll(".fd-dialog__action")[0]
      expect(fullscreenBtn.attributes("aria-label")).toBe("退出全屏")
      expect(fullscreenBtn.attributes("title")).toBe("退出全屏")
    })
  })

  describe("边界情况", () => {
    it("modelValue 初始为 undefined 时默认关闭", () => {
      const wrapper = mountDialog({ props: { modelValue: undefined } })
      const exposed = getExpose(wrapper)
      expect(exposed.dialogVisible.value).toBe(false)
    })

    it("title 为空时标题区域仍然渲染", () => {
      const wrapper = mountDialog({ props: { title: "" } })
      expect(wrapper.find(".fd-dialog__title").exists()).toBe(true)
      expect(wrapper.find(".fd-dialog__title").text()).toBe("")
    })

    it("title 为 undefined 时标题区域仍然渲染", () => {
      const wrapper = mountDialog({ props: { title: undefined } })
      expect(wrapper.find(".fd-dialog__title").exists()).toBe(true)
    })

    it("fullscreen 初始为 undefined 时默认非全屏", () => {
      const wrapper = mountDialog({ props: { fullscreen: undefined } })
      const exposed = getExpose(wrapper)
      expect(exposed.fullscreenActive.value).toBe(false)
    })
  })
})

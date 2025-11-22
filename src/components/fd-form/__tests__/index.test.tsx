import type { FormRef } from "@/components/fd-form/type"
import FdForm from "../index.vue"
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe } from "vitest"
import { h, markRaw, nextTick, defineComponent } from "vue"

function createSimpleStub(tag = "div") {
  return defineComponent({
    name: `Stub${tag}`,
    setup(_, { slots }) {
      return () => h(tag, {}, slots.default?.())
    },
  })
}

const ElFormStub = defineComponent({
  name: "ElForm",
  props: {
    model: { type: Object, required: false },
  },
  setup(_, { slots, expose }) {
    const api = {
      validate: (callback?: (errors?: Record<string, any>) => void) => {
        callback?.(undefined)
        return Promise.resolve()
      },
      validateField: () => Promise.resolve(),
      resetFields: () => undefined,
      clearValidate: () => undefined,
      setFields: () => undefined,
      scrollToField: () => undefined,
    }
    expose(api)
    return () => h("form", {}, slots.default?.())
  },
})

const ElFormItemStub = defineComponent({
  name: "ElFormItem",
  setup(_, { slots }) {
    return () => h("div", {}, [slots.default?.(), slots.extra?.()])
  },
})

const ElButtonStub = defineComponent({
  name: "ElButton",
  setup(_, { slots, attrs }) {
    return () => h("button", attrs, slots.default?.())
  },
})

const elementStubs = {
  "el-form": ElFormStub,
  "el-space": createSimpleStub("section"),
  "el-steps": createSimpleStub("section"),
  "el-step": createSimpleStub("div"),
  "el-tabs": createSimpleStub("section"),
  "el-tab-pane": createSimpleStub("div"),
  "el-row": createSimpleStub("div"),
  "el-col": createSimpleStub("div"),
  "el-form-item": ElFormItemStub,
  "el-scrollbar": createSimpleStub("div"),
  "el-button": ElButtonStub,
  "el-icon": createSimpleStub("span"),
}

const BasicInput = markRaw(defineComponent({
  name: "BasicInput",
  props: { modelValue: { type: [String, Number], default: "" } },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => h("input", {
      value: props.modelValue as string | number,
      onInput: (event: Event) => {
        const value = (event.target as HTMLInputElement).value
        emit("update:modelValue", value)
      },
    })
  },
}))

const FlexibleInput = markRaw(defineComponent({
  name: "FlexibleInput",
  props: { modelValue: { type: null, default: undefined } },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => h("input", {
      value: props.modelValue as string,
      onInput: (event: Event) => emit("update:modelValue", (event.target as HTMLInputElement).value),
    })
  },
}))

function mountForm() {
  return mount(FdForm, {
    global: {
      stubs: elementStubs,
    },
  })
}

describe("fd-form", () => {
  // 测试 fd-form 组件是否暴露了各种 schema 操作，例如 setField, getField, setOptions, hideItem, showItem。
  it("fd-form 组件暴露 schema 操作", async () => {
    const wrapper = mountForm()
    const form = wrapper.vm as unknown as FormRef<{ name: string }>

    form.use({
      model: { name: "Tom" },
      items: [
        {
          field: "name",
          label: "名称",
          component: { is: BasicInput },
          required: true,
        },
      ],
    })

    await nextTick()

    expect(form.model.name).toBe("Tom")
    form.setField("name", "Jerry")
    expect(form.getField("name")).toBe("Jerry")

    form.setOptions("name", [{ label: "A", value: "a" }])
    expect(form.items[0]?.component?.options).toEqual([{ label: "A", value: "a" }])

    form.hideItem("name")
    expect(form.items[0].hidden).toBe(true)
    form.showItem("name")
    expect(form.items[0].hidden).toBe(false)

    const rules = form.items[0].rules as Array<{ required?: boolean }>
    expect(rules?.[0]?.required).toBe(true)
  })

  // 测试表单提交功能和回调触发。
  it("提交表单并触发回调", async () => {
    const wrapper = mountForm()
    const form = wrapper.vm as unknown as FormRef<{ title: string }>
    const onSubmit = vi.fn()

    form.use({
      model: { title: "Hello" },
      onSubmit,
      items: [
        {
          field: "title",
          label: "标题",
          component: { is: BasicInput },
        },
      ],
    })

    await nextTick()

    const result = await form.submit()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(result.values.title).toBe("Hello")
    expect(result.errors).toBeUndefined()
  })

  // 测试对 form hooks 和 bindFields 功能的支持。
  it("支持 hooks 和 bindFields", async () => {
    const wrapper = mountForm()
    const form = wrapper.vm as unknown as FormRef<{ tags: string, price: number }>

    form.use({
      model: { tags: "x,y", price: 5 },
      items: [
        {
          field: "tags",
          label: "标签",
          hook: "split",
          component: { is: FlexibleInput },
        },
        {
          field: "price",
          label: "价格",
          component: { is: BasicInput },
        },
      ],
    })

    await nextTick()
    expect(form.model.tags).toEqual(["x", "y"])

    form.bindFields({ tags: "a", price: 15 })
    await nextTick()
    expect(form.getField("price")).toBe(15)

    form.setProps("price", { placeholder: "请输入金额" })
    const priceItem = form.items.find(item => item.field === "price")
    const priceProps = typeof priceItem?.component?.props === "function"
      ? priceItem.component.props(form.model)
      : priceItem?.component?.props
    expect(priceProps?.placeholder).toBe("请输入金额")
  })

  // 测试多步表单中的步骤导航流程。
  it("处理步骤导航流程", async () => {
    const wrapper = mountForm()
    const form = wrapper.vm as unknown as FormRef<{ foo: string }>
    const onSubmit = vi.fn()
    const onNext = vi.fn((_, ctx: { next: () => void }) => ctx.next())

    form.use({
      model: { foo: "" },
      onSubmit,
      onNext,
      group: {
        type: "steps",
        children: [
          { name: "basic", title: "基础", component: { is: BasicInput } },
          { name: "extra", title: "扩展", component: { is: BasicInput } },
        ],
      },
      items: [
        {
          field: "foo",
          label: "Foo",
          component: { is: BasicInput },
        },
      ],
    })

    await nextTick()

    form.next()
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()

    form.next()
    expect(onNext).toHaveBeenCalledTimes(2)
    expect(onSubmit).toHaveBeenCalledTimes(1)

    form.prev()
    form.prev()
    expect(onNext).toHaveBeenCalledTimes(2)
  })
})

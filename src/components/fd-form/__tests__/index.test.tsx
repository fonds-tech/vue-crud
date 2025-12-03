import type { FormRef } from "@/components/fd-form/types"
import FdForm from "../form.jsx"
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
      validate: (callback?: (isValid?: boolean, errors?: Record<string, any>) => void) => {
        callback?.(true, undefined)
        return Promise.resolve(true)
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
  it("fd-form 组件暴露 schema 操作", async () => {
    const wrapper = mountForm() // 挂载 fd-form 组件
    const form = wrapper.vm as unknown as FormRef<{ name: string }> // 获取组件实例并断言类型

    form.use({
      model: { name: "Tom" }, // 设置初始模型数据
      items: [
        {
          prop: "name", // 字段名
          label: "名称", // 标签
          component: { is: BasicInput }, // 使用 BasicInput 组件
          required: true, // 必填项
        },
      ],
    }) // 初始化表单配置

    await nextTick() // 等待 DOM 更新

    expect(form.model.name).toBe("Tom") // 验证模型初始值
    form.setField("name", "Jerry") // 修改字段值
    expect(form.getField("name")).toBe("Jerry") // 验证字段值已更新

    form.setOptions("name", [{ label: "A", value: "a" }]) // 设置选项数据
    expect(form.items[0]?.component?.options).toEqual([{ label: "A", value: "a" }]) // 验证选项数据已更新

    form.hideItem("name") // 隐藏表单项
    expect(form.items[0].hidden).toBe(true) // 验证表单项已隐藏
    form.showItem("name") // 显示表单项
    expect(form.items[0].hidden).toBe(false) // 验证表单项已显示

    const rules = form.items[0].rules as Array<{ required?: boolean }> // 获取校验规则
    expect(rules?.[0]?.required).toBe(true) // 验证 required 规则生效
  })

  it("提交表单并触发回调", async () => {
    const wrapper = mountForm() // 挂载 fd-form 组件
    const form = wrapper.vm as unknown as FormRef<{ title: string }> // 获取组件实例
    const onSubmit = vi.fn() // 创建提交回调 mock

    form.use({
      model: { title: "Hello" }, // 设置初始模型
      onSubmit, // 绑定提交回调
      items: [
        {
          prop: "title", // 字段名
          label: "标题", // 标签
          component: { is: BasicInput }, // 使用 BasicInput 组件
        },
      ],
    }) // 初始化表单配置

    await nextTick() // 等待更新

    const result = await form.submit() // 触发提交
    expect(onSubmit).toHaveBeenCalledTimes(1) // 验证回调被调用一次
    expect(result.values.title).toBe("Hello") // 验证提交的数据
    expect(result.errors).toBeUndefined() // 验证没有错误
  })

  it("支持 hooks 和 bindFields", async () => {
    const wrapper = mountForm() // 挂载 fd-form 组件
    const form = wrapper.vm as unknown as FormRef<{ tags: string, price: number }> // 获取实例

    form.use({
      model: { tags: "x,y", price: 5 }, // 初始数据
      items: [
        {
          prop: "tags", // tags 字段
          label: "标签",
          hook: "split", // 使用 split hook，将字符串转为数组
          component: { is: FlexibleInput }, // 使用 FlexibleInput
        },
        {
          prop: "price", // price 字段
          label: "价格",
          component: { is: BasicInput }, // 使用 BasicInput
        },
      ],
    }) // 初始化配置

    await nextTick() // 等待更新
    expect(form.model.tags).toEqual(["x", "y"]) // 验证 hook 将 "x,y" 转换为 ["x", "y"]

    form.bindFields({ tags: "a", price: 15 }) // 批量绑定字段值
    await nextTick() // 等待更新
    expect(form.getField("price")).toBe(15) // 验证 price 字段更新

    form.setProps("price", { placeholder: "请输入金额" }) // 动态设置组件 props
    const priceItem = form.items.find(item => item.prop === "price") // 查找 price 表单项
    const priceProps = typeof priceItem?.component?.props === "function"
      ? priceItem.component.props(form.model) // 如果 props 是函数，则执行获取结果
      : priceItem?.component?.props // 否则直接获取 props
    expect(priceProps?.placeholder).toBe("请输入金额") // 验证 props 设置成功
  })

  it("处理步骤导航流程", async () => {
    const wrapper = mountForm() // 挂载 fd-form
    const form = wrapper.vm as unknown as FormRef<{ foo: string }> // 获取实例
    const onSubmit = vi.fn() // mock 提交回调
    const onNext = vi.fn((_, ctx: { next: () => void }) => ctx.next()) // mock 下一步回调

    form.use({
      model: { foo: "" }, // 初始模型
      onSubmit, // 绑定提交
      onNext, // 绑定下一步
      group: {
        type: "steps", // 使用步骤条模式
        children: [
          { name: "basic", title: "基础", component: { is: BasicInput } }, // 第一步
          { name: "extra", title: "扩展", component: { is: BasicInput } }, // 第二步
        ],
      },
      items: [
        {
          prop: "foo",
          label: "Foo",
          component: { is: BasicInput },
        },
      ],
    }) // 初始化配置

    await nextTick() // 等待更新

    form.next() // 触发下一步
    expect(onNext).toHaveBeenCalledTimes(1) // 验证 onNext 被调用
    expect(onSubmit).not.toHaveBeenCalled() // 验证 onSubmit 未被调用（因为还在步骤中）

    form.next() // 再次触发下一步（到达最后一步）
    expect(onNext).toHaveBeenCalledTimes(2) // 验证 onNext 再次被调用
    expect(onSubmit).toHaveBeenCalledTimes(1) // 验证 onSubmit 被调用（完成所有步骤）

    form.prev() // 上一步
    form.prev() // 再上一步
    expect(onNext).toHaveBeenCalledTimes(2) // 验证 onNext 调用次数不变
  })
})

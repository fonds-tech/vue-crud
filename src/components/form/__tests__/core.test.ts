import { nextTick } from "vue"
import { useFormCore } from "../core"
import { it, vi, expect, describe } from "vitest"

const baseItemDefaults = { labelPosition: "", labelWidth: "", showMessage: true } as const

describe("fd-form core", () => {
  describe("useFormCore 初始化", () => {
    it("生成 id", () => {
      const core = useFormCore()
      expect(core.id).toBeDefined()
      expect(typeof core.id).toBe("string")
    })

    it("初始化 options 和 model", () => {
      const core = useFormCore()
      expect(core.options).toBeDefined()
      expect(core.model).toBeDefined()
      expect(core.options.mode).toBe("add")
      expect(core.options.items).toEqual([])
    })

    it("初始化 step 为 1", () => {
      const core = useFormCore()
      expect(core.step.value).toBe(1)
    })

    it("初始化 activeGroupName 为 undefined", () => {
      const core = useFormCore()
      expect(core.activeGroupName.value).toBeUndefined()
    })

    it("formRef 初始为 undefined", () => {
      const core = useFormCore()
      expect(core.formRef.value).toBeUndefined()
    })

    it("暴露 action 和 methods", () => {
      const core = useFormCore()
      expect(core.action).toBeDefined()
      expect(core.methods).toBeDefined()
      expect(typeof core.action.setField).toBe("function")
      expect(typeof core.methods.validate).toBe("function")
    })

    it("暴露 helpers", () => {
      const core = useFormCore()
      expect(core.helpers).toBeDefined()
      expect(typeof core.helpers.show).toBe("function")
    })
  })

  describe("use() 方法", () => {
    it("合并配置到 options", () => {
      const core = useFormCore()
      core.use({
        model: { name: "Tom" },
        items: [{ ...baseItemDefaults, prop: "name", label: "名称", component: { is: "el-input" } }],
      })

      expect(core.model.name).toBe("Tom")
      expect(core.options.items.length).toBe(1)
    })

    it("设置 mode", () => {
      const core = useFormCore()
      core.use({ mode: "update" })
      expect(core.options.mode).toBe("update")
    })

    it("tabs 模式下自动设置 activeGroupName", async () => {
      const core = useFormCore()
      core.use({
        group: {
          type: "tabs",
          children: [
            { name: "tab1", title: "标签1" },
            { name: "tab2", title: "标签2" },
          ],
        },
      })

      await nextTick()
      expect(core.activeGroupName.value).toBe("tab1")
    })

    it("steps 模式下重置 step 为 1", async () => {
      const core = useFormCore()
      core.step.value = 3
      core.use({
        group: {
          type: "steps",
          children: [
            { name: "step1", title: "步骤1" },
            { name: "step2", title: "步骤2" },
          ],
        },
      })

      expect(core.step.value).toBe(1)
    })

    it("非分组模式下 activeGroupName 为 undefined", async () => {
      const core = useFormCore()
      core.use({
        group: {},
      })

      await nextTick()
      expect(core.activeGroupName.value).toBeUndefined()
    })
  })

  describe("next() 方法", () => {
    it("steps 模式下递增 step", async () => {
      const core = useFormCore()
      // 模拟 formRef
      core.formRef.value = {
        validate: (callback: any) => {
          callback?.(true, undefined)
          return Promise.resolve(true)
        },
      } as any

      core.use({
        group: {
          type: "steps",
          children: [
            { name: "step1", title: "步骤1" },
            { name: "step2", title: "步骤2" },
            { name: "step3", title: "步骤3" },
          ],
        },
      })

      expect(core.step.value).toBe(1)
      core.next()
      await nextTick()
      expect(core.step.value).toBe(2)
    })

    it("最后一步时调用 submit", async () => {
      const onSubmit = vi.fn()
      const core = useFormCore()
      core.formRef.value = {
        validate: (callback: any) => {
          callback?.(true, undefined)
          return Promise.resolve(true)
        },
      } as any

      core.use({
        onSubmit,
        group: {
          type: "steps",
          children: [{ name: "step1", title: "步骤1" }],
        },
      })

      core.next()
      await nextTick()
      expect(onSubmit).toHaveBeenCalled()
    })

    it("触发 onNext 回调", async () => {
      const onNext = vi.fn((_, ctx) => ctx.next())
      const core = useFormCore()
      core.formRef.value = {
        validate: (callback: any) => {
          callback?.(true, undefined)
          return Promise.resolve(true)
        },
      } as any

      core.use({
        onNext,
        group: {
          type: "steps",
          children: [
            { name: "step1", title: "步骤1" },
            { name: "step2", title: "步骤2" },
          ],
        },
      })

      core.next()
      await nextTick()
      expect(onNext).toHaveBeenCalled()
      expect(core.step.value).toBe(2)
    })

    it("非 steps 模式直接调用 submit", async () => {
      const onSubmit = vi.fn()
      const core = useFormCore()
      core.formRef.value = {
        validate: (callback: any) => {
          callback?.(true, undefined)
          return Promise.resolve(true)
        },
      } as any

      core.use({ onSubmit })
      core.next()
      await nextTick()
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  describe("prev() 方法", () => {
    it("step > 1 时递减", () => {
      const core = useFormCore()
      core.use({
        group: {
          type: "steps",
          children: [
            { name: "step1", title: "步骤1" },
            { name: "step2", title: "步骤2" },
          ],
        },
      })

      core.step.value = 2
      core.prev()
      expect(core.step.value).toBe(1)
    })

    it("step = 1 时不变", () => {
      const core = useFormCore()
      core.step.value = 1
      core.prev()
      expect(core.step.value).toBe(1)
    })
  })

  describe("resolvedActiveGroup", () => {
    it("tabs 模式返回当前激活的分组", async () => {
      const core = useFormCore()
      core.use({
        group: {
          type: "tabs",
          children: [
            { name: "tab1", title: "标签1" },
            { name: "tab2", title: "标签2" },
          ],
        },
      })

      await nextTick()
      expect(core.resolvedActiveGroup.value).toBe("tab1")

      core.activeGroupName.value = "tab2"
      expect(core.resolvedActiveGroup.value).toBe("tab2")
    })

    it("非 tabs 模式返回 undefined", () => {
      const core = useFormCore()
      core.use({ group: { type: "steps" } })
      expect(core.resolvedActiveGroup.value).toBeUndefined()
    })
  })

  describe("activeStepName", () => {
    it("steps 模式返回当前步骤名称", () => {
      const core = useFormCore()
      core.use({
        group: {
          type: "steps",
          children: [
            { name: "step1", title: "步骤1" },
            { name: "step2", title: "步骤2" },
          ],
        },
      })

      expect(core.activeStepName.value).toBe("step1")

      core.step.value = 2
      expect(core.activeStepName.value).toBe("step2")
    })
  })

  describe("watcher 行为", () => {
    it("tabs 切换时自动同步 activeGroupName", async () => {
      const core = useFormCore()
      core.use({
        group: {
          type: "tabs",
          children: [
            { name: "tab1", title: "标签1" },
            { name: "tab2", title: "标签2" },
          ],
        },
      })

      await nextTick()
      expect(core.activeGroupName.value).toBe("tab1")

      // 删除当前激活的分组
      core.options.group!.children = [{ name: "tab2", title: "标签2" }]
      await nextTick()
      expect(core.activeGroupName.value).toBe("tab2")
    })

    it("loadedGroups 标记已加载的分组", async () => {
      const core = useFormCore()
      core.use({
        group: {
          type: "tabs",
          children: [
            { name: "tab1", title: "标签1" },
            { name: "tab2", title: "标签2" },
          ],
        },
      })

      await nextTick()
      expect(core.helpers.isGroupLoaded("tab1")).toBe(true)
      expect(core.helpers.isGroupLoaded("tab2")).toBe(false)

      core.activeGroupName.value = "tab2"
      await nextTick()
      expect(core.helpers.isGroupLoaded("tab2")).toBe(true)
    })

    // 新增覆盖测试：tabs watch 中 activeGroupName 不在候选列表时重置为第一个
    it("tabs 配置变更时 activeGroupName 不在候选列表中自动重置", async () => {
      const core = useFormCore()
      core.use({
        group: {
          type: "tabs",
          children: [
            { name: "tab1", title: "标签1" },
            { name: "tab2", title: "标签2" },
          ],
        },
      })

      await nextTick()
      expect(core.activeGroupName.value).toBe("tab1")

      // 手动设置 activeGroupName 为 tab2
      core.activeGroupName.value = "tab2"
      await nextTick()
      expect(core.activeGroupName.value).toBe("tab2")

      // 更新 children，移除 tab2，此时 tab2 不在候选列表中
      core.options.group!.children = [
        { name: "tab3", title: "标签3" },
        { name: "tab4", title: "标签4" },
      ]
      await nextTick()
      // 应该重置为第一个候选 tab3
      expect(core.activeGroupName.value).toBe("tab3")
    })

    // 新增覆盖测试：tabs 模式下 children 为空时 activeGroupName 设为 undefined
    it("tabs 模式下 children 为空时 activeGroupName 设为 undefined", async () => {
      const core = useFormCore()
      core.use({
        group: {
          type: "tabs",
          children: [{ name: "tab1", title: "标签1" }],
        },
      })

      await nextTick()
      expect(core.activeGroupName.value).toBe("tab1")

      // 清空 children
      core.options.group!.children = []
      await nextTick()
      expect(core.activeGroupName.value).toBeUndefined()
    })

    // 新增覆盖测试：非 tabs 类型时 activeGroupName 设为 undefined
    it("从 tabs 切换到 steps 时 activeGroupName 设为 undefined", async () => {
      const core = useFormCore()
      core.use({
        group: {
          type: "tabs",
          children: [{ name: "tab1", title: "标签1" }],
        },
      })

      await nextTick()
      expect(core.activeGroupName.value).toBe("tab1")

      // 切换为 steps 模式
      core.options.group!.type = "steps"
      await nextTick()
      expect(core.activeGroupName.value).toBeUndefined()
    })

    // 新增覆盖测试：steps 模式下 step 变化触发 loadedGroups 标记
    it("steps 模式下 step 变化标记 loadedGroups", async () => {
      const core = useFormCore()
      core.use({
        group: {
          type: "steps",
          children: [
            { name: "step1", title: "步骤1" },
            { name: "step2", title: "步骤2" },
          ],
        },
      })

      await nextTick()
      expect(core.helpers.isGroupLoaded("step1")).toBe(true)
      expect(core.helpers.isGroupLoaded("step2")).toBe(false)

      core.step.value = 2
      await nextTick()
      expect(core.helpers.isGroupLoaded("step2")).toBe(true)
    })

    // 新增覆盖测试：验证失败时 next() 不递增 step
    it("验证失败时 next() 不递增 step", async () => {
      const core = useFormCore()
      core.formRef.value = {
        validate: (callback: any) => {
          callback?.(false, { name: [{ message: "必填" }] })
          return Promise.resolve(false)
        },
      } as any

      core.use({
        group: {
          type: "steps",
          children: [
            { name: "step1", title: "步骤1" },
            { name: "step2", title: "步骤2" },
          ],
        },
      })

      expect(core.step.value).toBe(1)
      core.next()
      await nextTick()
      // 验证失败，step 不应递增
      expect(core.step.value).toBe(1)
    })
  })
})

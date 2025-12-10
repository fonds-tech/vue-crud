import { mount } from "@vue/test-utils"
import { useCore } from "../useCore"
import { useCrud } from "../useCrud"
import { useForm } from "../useForm"
import { useRefs } from "../useRefs"
import { useElApi } from "../useElApi"
import { useTable } from "../useTable"
import { useConfig } from "../useConfig"
import { useDetail } from "../useDetail"
import { useParent } from "../useParent"
import { useSearch } from "../useSearch"
import { useUpsert } from "../useUpsert"
import { useBrowser } from "../useBrowser"
import { useProvide } from "../useProvide"
import { h, ref, provide, nextTick, defineComponent } from "vue"
import { it, vi, expect, describe, afterEach, beforeEach } from "vitest"

describe("通用 hooks", () => {
  describe("useRefs", () => {
    it("setRefs 能收集引用", () => {
      const { refs, setRefs } = useRefs<HTMLElement>()
      setRefs("btn")("el" as any)
      expect(refs.btn).toBe("el")
    })
  })

  describe("useParent", () => {
    it("匹配到指定父组件时注入 exposed", async () => {
      const childValue = ref<any>()
      const Child = defineComponent({
        name: "Child",
        setup() {
          useParent("fd-crud", childValue)
          return () => h("div")
        },
      })
      const Parent = defineComponent({
        name: "fd-crud",
        setup(_, { slots, expose }) {
          const exposed = { foo: "bar" }
          expose(exposed)
          return () => h("section", slots.default?.())
        },
      })
      const wrapper = mount(Parent, { slots: { default: () => h(Child) } })
      await nextTick()
      expect(childValue.value).toEqual({ foo: "bar" })
      wrapper.unmount()
    })

    it("未匹配父组件时保持 undefined", async () => {
      const childValue = ref<any>("init")
      const Child = defineComponent({
        setup() {
          useParent("fd-search", childValue)
          return () => h("div")
        },
      })
      const Wrapper = defineComponent({
        name: "Wrapper",
        setup(_, { slots }) {
          return () => h("section", slots.default?.())
        },
      })
      const wrapper = mount(Wrapper, { slots: { default: () => h(Child) } })
      await nextTick()
      expect(childValue.value).toBe("init")
      wrapper.unmount()
    })
  })

  describe("useBrowser", () => {
    const originalWidth = window.innerWidth
    const originalHeight = window.innerHeight
    let removeSpy: any

    beforeEach(() => {
      removeSpy = vi.spyOn(window, "removeEventListener")
    })

    afterEach(() => {
      Object.defineProperty(window, "innerWidth", { value: originalWidth, configurable: true })
      Object.defineProperty(window, "innerHeight", { value: originalHeight, configurable: true })
      removeSpy.mockRestore()
    })

    it("能监听窗口尺寸并更新 isMini", async () => {
      Object.defineProperty(window, "innerWidth", { value: 500, configurable: true })
      Object.defineProperty(window, "innerHeight", { value: 600, configurable: true })

      const Comp = defineComponent({
        setup() {
          const state = useBrowser()
          return { state }
        },
        template: "<div></div>",
      })
      const wrapper = mount(Comp)
      await nextTick()
      expect(wrapper.vm.state.width).toBe(500)
      expect(wrapper.vm.state.isMini).toBe(true)

      Object.defineProperty(window, "innerWidth", { value: 1200, configurable: true })
      window.dispatchEvent(new Event("resize"))
      await nextTick()
      expect(wrapper.vm.state.width).toBe(1200)
      expect(wrapper.vm.state.isMini).toBe(false)

      wrapper.unmount()
      expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function))
    })
  })

  describe("父子实例注入类 hooks", () => {
    function mountWithParent(
      name: string,
      hook: (options?: any, cb?: (inst: any) => void) => { value: any },
      options: any,
    ) {
      const callback = vi.fn()
      const childInstance = ref<any>()
      const Parent = defineComponent({
        name,
        setup(_, { slots, expose }) {
          const exposed = { use: vi.fn(), id: name }
          expose(exposed)
          return () => h("div", slots.default?.())
        },
      })
      const Child = defineComponent({
        setup() {
          childInstance.value = hook(options, callback).value
          return () => h("span")
        },
      })
      mount(Parent, { slots: { default: () => h(Child) } })
      expect(childInstance.value?.id).toBe(name)
      if (options) {
        expect((childInstance.value as any).use).toHaveBeenCalledWith(options)
      }
      expect(callback).toHaveBeenCalledWith(childInstance.value)
    }

    it("useCrud/useTable/useForm/useDetail/useSearch/useUpsert 均可注入并调用 use/回调", () => {
      mountWithParent("fd-crud", useCrud as any, { page: 1 })
      mountWithParent("fd-table", useTable as any, { size: "small" })
      mountWithParent("fd-form", useForm as any, { labelWidth: 100 })
      mountWithParent("fd-detail", useDetail as any, { title: "detail" })
      mountWithParent("fd-search", useSearch as any, { cols: 2 })
      mountWithParent("fd-upsert", useUpsert as any, { mode: "add" })
    })
  })

  describe("useElApi", () => {
    it("透传 Element 方法并在缺失时返回 undefined", () => {
      const elRef = ref<{ focus?: () => string }>({ focus: vi.fn().mockReturnValue("ok") })
      const api = useElApi(["focus"] as const, elRef)
      expect(api.focus()).toBe("ok")
      elRef.value = {}
      expect(api.focus()).toBeUndefined()
    })
  })

  describe("配置与注入", () => {
    it("useConfig 缺少 provide 时抛错", () => {
      const Comp = defineComponent({ setup: () => useConfig(), template: "<div></div>" })
      expect(() => mount(Comp)).toThrow()
    })

    it("useConfig 通过 provide 注入配置", () => {
      const cfg = { dict: { primaryId: "uuid" } } as any
      const Child = defineComponent({
        setup() {
          const conf = useConfig()
          return { conf }
        },
        template: "<div></div>",
      })
      const Wrapper = defineComponent({
        setup(_, { slots }) {
          provide("__crud_config__", cfg)
          return () => h("section", slots.default?.())
        },
      })
      const wrapper = mount(Wrapper, { slots: { default: () => h(Child) } })
      expect((wrapper.findComponent(Child).vm as any).conf).toBe(cfg)
    })

    it("useCore 返回注入的 crud 与 mitt", () => {
      const crud = { refresh: vi.fn() }
      const mitt = { emit: vi.fn() }
      const Comp = defineComponent({
        setup() {
          const core = useCore()
          return { core }
        },
        template: "<div></div>",
      })
      const wrapper = mount(Comp, {
        global: { provide: { crud, mitt } },
      })
      expect(wrapper.vm.core.crud).toBe(crud)
      expect(wrapper.vm.core.mitt).toBe(mitt)
    })

    it("useProvide 合并默认配置并注册 provide", () => {
      const app = { provide: vi.fn() } as any
      const result = useProvide(app, { dict: { primaryId: "custom" } } as any)
      expect(result.dict?.primaryId).toBe("custom")
      expect(app.provide).toHaveBeenCalledWith("__crud_config__", expect.any(Object))
    })
  })
})

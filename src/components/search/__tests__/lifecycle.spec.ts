import type { Ref } from "vue"
import type { SearchLifecycleParams } from "../interface"
import { ref } from "vue"
import { it, vi, expect, describe, beforeEach } from "vitest"
import {
  handleResize,
  registerEvents,
  unregisterEvents,
  useSearchLifecycle,
} from "../core/lifecycle"

describe("lifecycle", () => {
  let params: SearchLifecycleParams
  let viewportWidth: Ref<number>

  beforeEach(() => {
    viewportWidth = ref(1024)
    params = {
      viewportWidth,
      searchHandler: vi.fn(),
      resetHandler: vi.fn(),
      getModelHandler: vi.fn(),
      mitt: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    }
  })

  describe("registerEvents", () => {
    it("应该注册所有事件监听器", () => {
      registerEvents(params)

      expect(params.mitt.on).toHaveBeenCalledWith("search.search", params.searchHandler)
      expect(params.mitt.on).toHaveBeenCalledWith("search.reset", params.resetHandler)
      expect(params.mitt.on).toHaveBeenCalledWith("search.get.model", params.getModelHandler)
      expect(params.mitt.on).toHaveBeenCalledTimes(3)
    })
  })

  describe("unregisterEvents", () => {
    it("应该注销所有事件监听器", () => {
      unregisterEvents(params)

      expect(params.mitt.off).toHaveBeenCalledWith("search.search", params.searchHandler)
      expect(params.mitt.off).toHaveBeenCalledWith("search.reset", params.resetHandler)
      expect(params.mitt.off).toHaveBeenCalledWith("search.get.model", params.getModelHandler)
      expect(params.mitt.off).toHaveBeenCalledTimes(3)
    })

    it("应该与 registerEvents 对应", () => {
      registerEvents(params)
      unregisterEvents(params)

      // 验证注册和注销的事件名称一致
      const onCalls = (params.mitt.on as any).mock.calls.map((call: any) => call[0])
      const offCalls = (params.mitt.off as any).mock.calls.map((call: any) => call[0])
      expect(onCalls).toEqual(offCalls)
    })
  })

  describe("handleResize", () => {
    it("应该更新 viewportWidth 为当前窗口宽度", () => {
      const originalInnerWidth = window.innerWidth
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1440,
      })

      handleResize(viewportWidth)

      expect(viewportWidth.value).toBe(1440)

      // 恢复原始值
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      })
    })

    it("不同窗口宽度应该正确更新", () => {
      const testWidths = [768, 1024, 1366, 1920]

      testWidths.forEach((width) => {
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: width,
        })

        handleResize(viewportWidth)
        expect(viewportWidth.value).toBe(width)
      })
    })
  })

  describe("useSearchLifecycle", () => {
    it("在组件卸载前不应该抛出错误", () => {
      // 由于 useSearchLifecycle 使用了 onMounted/onBeforeUnmount
      // 我们只测试它不会抛出错误
      expect(() => useSearchLifecycle(params)).not.toThrow()
    })
  })

  describe("事件处理流程", () => {
    it("完整的注册和注销流程", () => {
      // 注册事件
      registerEvents(params)
      expect(params.mitt.on).toHaveBeenCalledTimes(3)

      // 注消事件
      unregisterEvents(params)
      expect(params.mitt.off).toHaveBeenCalledTimes(3)
    })

    it("resize 处理流程", () => {
      const initialWidth = 1024
      viewportWidth.value = initialWidth

      // 模拟窗口尺寸变化
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1920,
      })

      handleResize(viewportWidth)

      expect(viewportWidth.value).toBe(1920)
      expect(viewportWidth.value).not.toBe(initialWidth)
    })
  })
})

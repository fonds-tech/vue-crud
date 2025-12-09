import type { FormAsyncOptionsState } from "../types"
import { reactive } from "vue"
import { syncOptions, ensureOptionState } from "../core/options"
import { it, vi, expect, describe, afterEach, beforeEach } from "vitest"

describe("fd-form options 异步加载", () => {
  let optionState: Record<string, FormAsyncOptionsState>

  beforeEach(() => {
    optionState = reactive({})
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("ensureOptionState", () => {
    it("创建新的选项状态", () => {
      const state = ensureOptionState(optionState, "field1")
      expect(state).toBeDefined()
      expect(state.loading).toBe(false)
    })

    it("返回已存在的状态", () => {
      ensureOptionState(optionState, "field1")
      optionState.field1.value = [1, 2, 3]
      const state = ensureOptionState(optionState, "field1")
      expect(state.value).toEqual([1, 2, 3])
    })
  })

  describe("syncOptions 同步值", () => {
    it("同步设置选项值", () => {
      const data = [{ label: "A", value: "a" }]
      const state = syncOptions(optionState, "sync", data)
      expect(state.value).toEqual(data)
      expect(state.loading).toBe(false)
    })

    it("设置为 undefined 清空值", () => {
      syncOptions(optionState, "sync", [1, 2])
      syncOptions(optionState, "sync", undefined)
      expect(optionState.sync?.value).toBeUndefined()
      expect(optionState.sync?.loading).toBe(false)
    })
  })

  describe("syncOptions 异步 Promise", () => {
    it("promise 加载中状态", async () => {
      const promise = Promise.resolve([{ id: 1 }])
      const state = syncOptions(optionState, "async", promise)
      expect(state.loading).toBe(true)
      expect(state.pending).toBe(promise)

      await vi.runAllTimersAsync()
      expect(state.loading).toBe(false)
      expect(state.value).toEqual([{ id: 1 }])
    })

    it("promise 错误处理", async () => {
      const error = new Error("加载失败")
      const promise = Promise.reject(error)
      const state = syncOptions(optionState, "error", promise)
      expect(state.loading).toBe(true)

      await vi.runAllTimersAsync()
      expect(state.loading).toBe(false)
      expect(state.error).toBe(error)
    })

    it("避免重复请求相同 Promise", () => {
      const promise = Promise.resolve([1])
      syncOptions(optionState, "dup", promise)
      const firstId = optionState.dup?.requestId

      syncOptions(optionState, "dup", promise)
      expect(optionState.dup?.requestId).toBe(firstId)
    })

    it("竞态处理：只采用最新请求的结果", async () => {
      // 第一个慢请求
      let resolveFirst: (value: number[]) => void
      const firstPromise = new Promise<number[]>((resolve) => {
        resolveFirst = resolve
      })
      syncOptions(optionState, "race", firstPromise)
      const firstId = optionState.race?.requestId

      // 第二个快请求
      const secondPromise = Promise.resolve([2])
      syncOptions(optionState, "race", secondPromise)
      expect(optionState.race?.requestId).toBe((firstId ?? 0) + 1)

      // 快请求先完成
      await vi.runAllTimersAsync()
      expect(optionState.race?.value).toEqual([2])

      // 慢请求后完成（应被忽略）
      resolveFirst!([1])
      await vi.runAllTimersAsync()
      expect(optionState.race?.value).toEqual([2]) // 仍然是快请求的结果
    })
  })
})

import type { FormAsyncOptionsState } from "../interface"
import { createHelpers } from "../core"
import { ref, computed, reactive } from "vue"
import { it, vi, expect, describe, afterEach, beforeEach } from "vitest"
import { syncOptions, mergeFormOptions, ensureOptionState, createInitialOptions } from "../core/options"

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

describe("fd-form mergeFormOptions", () => {
  function createMergeContext() {
    const options = reactive(createInitialOptions())
    const model = reactive<Record<string, unknown>>({})
    const step = ref(1)
    const loadedGroups = ref(new Set<string | number>())
    const optState = reactive<Record<string, FormAsyncOptionsState>>({})
    const helpers = createHelpers({
      options,
      model,
      resolvedActiveGroup: computed(() => undefined),
      step,
      loadedGroups,
      optionState: optState,
    })
    return { options, model, step, helpers }
  }

  it("合并 key 配置", () => {
    const ctx = createMergeContext()
    mergeFormOptions(ctx, { key: 123 })
    expect(ctx.options.key).toBe(123)
  })

  it("合并 mode 配置", () => {
    const ctx = createMergeContext()
    mergeFormOptions(ctx, { mode: "update" })
    expect(ctx.options.mode).toBe("update")
  })

  it("合并 form 配置（深度合并）", () => {
    const ctx = createMergeContext()
    ctx.options.form = { labelWidth: "100px", scrollToError: true }
    mergeFormOptions(ctx, { form: { labelWidth: "150px" } })
    expect(ctx.options.form?.labelWidth).toBe("150px")
    expect(ctx.options.form?.scrollToError).toBe(true)
  })

  it("合并 grid 配置", () => {
    const ctx = createMergeContext()
    mergeFormOptions(ctx, { grid: { cols: 3, colGap: 16 } })
    expect(ctx.options.grid?.cols).toBe(3)
    expect(ctx.options.grid?.colGap).toBe(16)
  })

  it("合并 group 配置", () => {
    const ctx = createMergeContext()
    mergeFormOptions(ctx, {
      group: { type: "tabs", children: [{ name: "tab1" }] },
    })
    expect(ctx.options.group?.type).toBe("tabs")
    expect(ctx.options.group?.children?.length).toBe(1)
  })

  it("合并 items 配置", () => {
    const ctx = createMergeContext()
    mergeFormOptions(ctx, {
      items: [
        { prop: "name", component: { is: "el-input" } },
        { prop: "age", component: { is: "el-input-number" } },
      ],
    })
    expect(ctx.options.items.length).toBe(2)
    expect(ctx.options.items[0].prop).toBe("name")
  })

  it("合并 onNext 回调", () => {
    const ctx = createMergeContext()
    const onNext = vi.fn()
    mergeFormOptions(ctx, { onNext })
    expect(ctx.options.onNext).toBe(onNext)
  })

  it("合并 onSubmit 回调", () => {
    const ctx = createMergeContext()
    const onSubmit = vi.fn()
    mergeFormOptions(ctx, { onSubmit })
    expect(ctx.options.onSubmit).toBe(onSubmit)
  })

  it("合并 model 配置（替换而非合并）", () => {
    const ctx = createMergeContext()
    ctx.model.existingField = "old"
    mergeFormOptions(ctx, { model: { newField: "new" } })
    expect(ctx.model.existingField).toBeUndefined()
    expect(ctx.model.newField).toBe("new")
  })

  it("合并后 step 重置为 1", () => {
    const ctx = createMergeContext()
    ctx.step.value = 5
    mergeFormOptions(ctx, { mode: "add" })
    expect(ctx.step.value).toBe(1)
  })

  it("items 过滤无效配置", () => {
    const ctx = createMergeContext()
    mergeFormOptions(ctx, {
      items: [
        { prop: "valid", component: { is: "el-input" } },
        { prop: "invalid" } as any, // 缺少 component
        undefined as any,
      ],
    })
    expect(ctx.options.items.length).toBe(1)
    expect(ctx.options.items[0].prop).toBe("valid")
  })
})

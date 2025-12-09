import type { DictItem } from "../../types/shared"
import { it, expect, describe } from "vitest"
import { has, type, color, label, match } from "../dict"

describe("dict utils", () => {
  const statusDict: DictItem[] = [
    { value: 1, label: "启用", type: "success", color: "green" },
    { value: 0, label: "禁用", type: "danger", color: "red" },
    { value: 2, label: "待审核", type: "warning" },
  ]

  describe("match", () => {
    it("应该找到匹配的字典项", () => {
      expect(match(statusDict, 1)).toEqual({
        value: 1,
        label: "启用",
        type: "success",
        color: "green",
      })
    })

    it("未找到时应该返回 undefined", () => {
      expect(match(statusDict, 3)).toBeUndefined()
      expect(match(statusDict, "invalid")).toBeUndefined()
    })

    it("dict 为 undefined 时应该返回 undefined", () => {
      expect(match(undefined, 1)).toBeUndefined()
    })

    it("dict 不是数组时应该返回 undefined", () => {
      expect(match("not-array" as any, 1)).toBeUndefined()
      expect(match({} as any, 1)).toBeUndefined()
    })

    it("应该匹配不同类型的值", () => {
      const mixedDict: DictItem[] = [
        { value: "str", label: "字符串" },
        { value: 123, label: "数字" },
        { value: true, label: "布尔" },
      ]

      expect(match(mixedDict, "str")?.label).toBe("字符串")
      expect(match(mixedDict, 123)?.label).toBe("数字")
      expect(match(mixedDict, true)?.label).toBe("布尔")
    })

    it("应该使用严格相等比较", () => {
      const dict: DictItem[] = [
        { value: 1, label: "数字1" },
        { value: "1", label: "字符串1" },
      ]

      expect(match(dict, 1)?.label).toBe("数字1")
      expect(match(dict, "1")?.label).toBe("字符串1")
      expect(match(dict, 1)).not.toEqual(match(dict, "1"))
    })
  })

  describe("has", () => {
    it("存在匹配项时应该返回 true", () => {
      expect(has(statusDict, 1)).toBe(true)
      expect(has(statusDict, 0)).toBe(true)
      expect(has(statusDict, 2)).toBe(true)
    })

    it("不存在匹配项时应该返回 false", () => {
      expect(has(statusDict, 3)).toBe(false)
      expect(has(statusDict, "invalid")).toBe(false)
    })

    it("dict 为 undefined 时应该返回 false", () => {
      expect(has(undefined, 1)).toBe(false)
    })
  })

  describe("label", () => {
    it("应该返回匹配项的标签", () => {
      expect(label(statusDict, 1)).toBe("启用")
      expect(label(statusDict, 0)).toBe("禁用")
      expect(label(statusDict, 2)).toBe("待审核")
    })

    it("未匹配时应该返回空字符串", () => {
      expect(label(statusDict, 3)).toBe("")
      expect(label(statusDict, "invalid")).toBe("")
    })

    it("dict 为 undefined 时应该返回空字符串", () => {
      expect(label(undefined, 1)).toBe("")
    })
  })

  describe("color", () => {
    it("应该返回匹配项的颜色", () => {
      expect(color(statusDict, 1)).toBe("green")
      expect(color(statusDict, 0)).toBe("red")
    })

    it("未设置颜色时应该返回 undefined", () => {
      expect(color(statusDict, 2)).toBeUndefined()
    })

    it("未匹配时应该返回 undefined", () => {
      expect(color(statusDict, 3)).toBeUndefined()
    })

    it("dict 为 undefined 时应该返回 undefined", () => {
      expect(color(undefined, 1)).toBeUndefined()
    })
  })

  describe("type", () => {
    it("应该返回匹配项的类型", () => {
      expect(type(statusDict, 1)).toBe("success")
      expect(type(statusDict, 0)).toBe("danger")
      expect(type(statusDict, 2)).toBe("warning")
    })

    it("未匹配时应该返回 undefined", () => {
      expect(type(statusDict, 3)).toBeUndefined()
    })

    it("dict 为 undefined 时应该返回 undefined", () => {
      expect(type(undefined, 1)).toBeUndefined()
    })
  })

  describe("综合场景", () => {
    it("应该处理空字典数组", () => {
      const emptyDict: DictItem[] = []

      expect(match(emptyDict, 1)).toBeUndefined()
      expect(has(emptyDict, 1)).toBe(false)
      expect(label(emptyDict, 1)).toBe("")
      expect(color(emptyDict, 1)).toBeUndefined()
      expect(type(emptyDict, 1)).toBeUndefined()
    })

    it("应该处理只有部分字段的字典项", () => {
      const minimalDict: DictItem[] = [
        { value: 1, label: "最小项" },
      ]

      expect(match(minimalDict, 1)).toEqual({ value: 1, label: "最小项" })
      expect(has(minimalDict, 1)).toBe(true)
      expect(label(minimalDict, 1)).toBe("最小项")
      expect(color(minimalDict, 1)).toBeUndefined()
      expect(type(minimalDict, 1)).toBeUndefined()
    })
  })
})

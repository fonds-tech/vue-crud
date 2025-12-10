import { it, expect, describe } from "vitest"

import { resolveItemData, calculateDisplayInfo, resolveResponsiveValue } from "../utils"

describe("grid utils", () => {
  describe("resolveResponsiveValue", () => {
    it("数值输入直接返回", () => {
      expect(resolveResponsiveValue(12, 500, 0)).toBe(12)
    })

    it("按断点匹配与回退", () => {
      expect(resolveResponsiveValue({ md: 12, sm: 6 }, 800, 0)).toBe(12)
      // 视口无效时使用正无穷回退到最靠前的配置
      expect(resolveResponsiveValue({ xl: 10, sm: 4 }, undefined, 0)).toBe(10)
      // 未命中任何断点时取最靠前的已配置值
      expect(resolveResponsiveValue({ md: 12 }, 300, 1)).toBe(12)
    })

    it("异常输入返回兜底值", () => {
      expect(resolveResponsiveValue(undefined, 400, 7)).toBe(7)
    })
  })

  describe("resolveItemData", () => {
    it("对越界跨度与偏移进行限制", () => {
      expect(resolveItemData(3, { span: 5, offset: -1, suffix: true })).toEqual({ span: 3, offset: 0, suffix: true })
      expect(resolveItemData(4, { span: 2, offset: 5 })).toEqual({ span: 2, offset: 3, suffix: false })
    })

    it("在缺省输入时提供默认值", () => {
      expect(resolveItemData(0, {} as any)).toEqual({ span: 1, offset: 0, suffix: false })
    })
  })

  describe("calculateDisplayInfo", () => {
    it("非折叠模式下全量展示", () => {
      const result = calculateDisplayInfo({
        cols: 2,
        collapsed: false,
        collapsedRows: 1,
        items: [
          { span: 1, offset: 0 },
          { span: 2, offset: 0 },
        ],
      })
      expect(result).toEqual({ overflow: false, displayIndexList: [0, 1] })
    })

    it("折叠时优先保留后缀并触发 overflow", () => {
      const result = calculateDisplayInfo({
        cols: 2,
        collapsed: true,
        collapsedRows: 1,
        items: [
          { span: 2, offset: 0 },
          { span: 2, offset: 0 },
          { span: 1, offset: 0, suffix: true },
        ],
      })
      expect(result.displayIndexList).toEqual([2])
      expect(result.overflow).toBe(true)
    })

    it("折叠但容量充足时无溢出", () => {
      const result = calculateDisplayInfo({
        cols: 3,
        collapsed: true,
        collapsedRows: 1,
        items: [
          { span: 1, offset: 0 },
          { span: 1, offset: 0 },
          { span: 1, offset: 0 },
        ],
      })
      expect(result.displayIndexList).toEqual([0, 1, 2])
      expect(result.overflow).toBe(false)
    })
  })
})

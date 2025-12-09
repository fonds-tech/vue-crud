import { it, expect, describe } from "vitest"
import { mergeSearchOptions, createDefaultOptions } from "../core/options"

describe("createDefaultOptions", () => {
  it("返回默认配置结构", () => {
    const options = createDefaultOptions()
    expect(options.form.grid?.cols).toBe(3)
    expect(options.action.items).toHaveLength(2)
    expect(options.action.items[0].type).toBe("search")
    expect(options.action.items[1].type).toBe("reset")
  })
})

describe("mergeSearchOptions", () => {
  it("合并 action.items (替换模式)", () => {
    const options = createDefaultOptions()
    mergeSearchOptions(options, {
      action: {
        items: [{ type: "search", text: "Query" }],
      },
    })

    expect(options.action.items).toHaveLength(1)
    expect(options.action.items[0].text).toBe("Query")
  })

  it("深度合并 form 配置", () => {
    const options = createDefaultOptions()
    mergeSearchOptions(options, {
      form: { labelWidth: "100px" },
    } as any)

    expect(options.form.form?.labelWidth).toBe("100px")
    // 保留默认值
    expect(options.form.grid?.cols).toBe(3)
  })

  it("合并 action.grid 配置", () => {
    const options = createDefaultOptions()
    mergeSearchOptions(options, {
      action: {
        grid: { cols: 4 },
      },
    })

    expect(options.action.grid?.cols).toBe(4)
    expect(options.action.grid?.colGap).toBe(12) // 默认值保留
  })

  it("设置钩子函数", () => {
    const options = createDefaultOptions()
    const onSearch = () => {}
    mergeSearchOptions(options, { onSearch })

    expect(options.onSearch).toBe(onSearch)
  })
})

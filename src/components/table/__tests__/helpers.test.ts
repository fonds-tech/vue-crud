import type { TableColumnCtx } from "element-plus"
import type { TableDict, TableScope, TableColumn, TableRecord, TableComponent } from "../interface"
import { h } from "vue"
import { it, vi, expect, describe } from "vitest"
import {
  hasDict,
  formatCell,
  getDictType,
  getSlotName,
  resolveDict,
  getDictColor,
  getDictEntry,
  getDictLabel,
  getColumnSlots,
  getComponentIs,
  getComponentProps,
  getComponentSlots,
  getComponentStyle,
  getComponentEvents,
  getHeaderComponent,
} from "../core/helpers"

describe("helpers", () => {
  const mockScope: TableScope<TableRecord> = {
    row: { status: 1, name: "测试" },
    column: { prop: "status" } as TableColumnCtx<TableRecord>,
    $index: 0,
  }

  const mockDict: TableDict[] = [
    { label: "启用", value: 1, type: "success", color: "#67c23a" },
    { label: "禁用", value: 0, type: "danger", color: "#f56c6c" },
  ]

  describe("字典相关函数", () => {
    describe("resolveDict", () => {
      it("应该返回静态数组字典", () => {
        const column: TableColumn = { dict: mockDict }
        const result = resolveDict(column, mockScope)
        expect(result).toEqual(mockDict)
      })

      it("应该调用函数形式的字典并返回结果", () => {
        const dictFn = vi.fn(() => mockDict)
        const column: TableColumn = { dict: dictFn }
        const result = resolveDict(column, mockScope)
        expect(dictFn).toHaveBeenCalledWith(mockScope)
        expect(result).toEqual(mockDict)
      })

      it("字典不存在时应返回 undefined", () => {
        const column: TableColumn = {}
        const result = resolveDict(column, mockScope)
        expect(result).toBeUndefined()
      })
    })

    describe("getDictEntry", () => {
      it("应该根据行数据值匹配字典条目", () => {
        const column: TableColumn = { prop: "status", dict: mockDict }
        const result = getDictEntry(column, mockScope)
        expect(result).toEqual(mockDict[0])
      })

      it("无匹配值时应返回 undefined", () => {
        const scope: TableScope<TableRecord> = {
          ...mockScope,
          row: { status: 999 },
        }
        const column: TableColumn = { prop: "status", dict: mockDict }
        const result = getDictEntry(column, scope)
        expect(result).toBeUndefined()
      })

      it("字典不存在时应返回 undefined", () => {
        const column: TableColumn = { prop: "status" }
        const result = getDictEntry(column, mockScope)
        expect(result).toBeUndefined()
      })
    })

    describe("getDictLabel", () => {
      it("应该返回匹配条目的标签", () => {
        const column: TableColumn = { prop: "status", dict: mockDict }
        const result = getDictLabel(column, mockScope)
        expect(result).toBe("启用")
      })

      it("无匹配时应返回空字符串", () => {
        const scope: TableScope<TableRecord> = {
          ...mockScope,
          row: { status: 999 },
        }
        const column: TableColumn = { prop: "status", dict: mockDict }
        const result = getDictLabel(column, scope)
        expect(result).toBe("")
      })
    })

    describe("getDictColor", () => {
      it("应该返回匹配条目的颜色", () => {
        const column: TableColumn = { prop: "status", dict: mockDict }
        const result = getDictColor(column, mockScope)
        expect(result).toBe("#67c23a")
      })

      it("无匹配时应返回 undefined", () => {
        const scope: TableScope<TableRecord> = {
          ...mockScope,
          row: { status: 999 },
        }
        const column: TableColumn = { prop: "status", dict: mockDict }
        const result = getDictColor(column, scope)
        expect(result).toBeUndefined()
      })
    })

    describe("getDictType", () => {
      it("应该返回匹配条目的类型", () => {
        const column: TableColumn = { prop: "status", dict: mockDict }
        const result = getDictType(column, mockScope)
        expect(result).toBe("success")
      })

      it("无匹配时应返回 undefined", () => {
        const scope: TableScope<TableRecord> = {
          ...mockScope,
          row: { status: 999 },
        }
        const column: TableColumn = { prop: "status", dict: mockDict }
        const result = getDictType(column, scope)
        expect(result).toBeUndefined()
      })
    })

    describe("hasDict", () => {
      it("有匹配的字典条目时应返回 true", () => {
        const column: TableColumn = { prop: "status", dict: mockDict }
        const result = hasDict(column, mockScope)
        expect(result).toBe(true)
      })

      it("无匹配条目时应返回 false", () => {
        const scope: TableScope<TableRecord> = {
          ...mockScope,
          row: { status: 999 },
        }
        const column: TableColumn = { prop: "status", dict: mockDict }
        const result = hasDict(column, scope)
        expect(result).toBe(false)
      })

      it("字典不存在时应返回 false", () => {
        const column: TableColumn = { prop: "status" }
        const result = hasDict(column, mockScope)
        expect(result).toBe(false)
      })
    })
  })

  describe("formatCell", () => {
    it("优先使用 formatter 格式化", () => {
      const formatter = vi.fn(() => "格式化后的值")
      const column: TableColumn = {
        formatter,
        prop: "name",
        value: "默认值",
      }
      const result = formatCell(column, mockScope)
      expect(formatter).toHaveBeenCalledWith(mockScope)
      expect(result).toBe("格式化后的值")
    })

    it("无 formatter 时使用 prop 获取行数据", () => {
      const column: TableColumn = { prop: "name" }
      const result = formatCell(column, mockScope)
      expect(result).toBe("测试")
    })

    it("无 formatter 和 prop 时使用 value", () => {
      const column: TableColumn = { value: "默认值" }
      const result = formatCell(column, mockScope)
      expect(result).toBe("默认值")
    })

    it("无任何配置时返回空字符串", () => {
      const column: TableColumn = {}
      const result = formatCell(column, mockScope)
      expect(result).toBe("")
    })
  })

  describe("组件属性解析", () => {
    describe("getComponentIs", () => {
      it("应该返回字符串类型的 is", () => {
        const component: TableComponent = { is: "div" }
        const result = getComponentIs(component, mockScope)
        expect(result).toBe("div")
      })

      it("应该返回组件类型的 is", () => {
        const MyComponent = { name: "MyComponent" }
        const component: TableComponent = { is: MyComponent }
        const result = getComponentIs(component, mockScope)
        expect(result).toBe(MyComponent)
      })

      it("应该调用函数形式的 is", () => {
        const vnode = h("span", "test")
        const isFn = vi.fn(() => vnode)
        const component: TableComponent = { is: isFn }
        const result = getComponentIs(component, mockScope)
        expect(isFn).toHaveBeenCalledWith(mockScope)
        expect(result).toBe(vnode)
      })

      it("component 为 undefined 时返回 undefined", () => {
        const result = getComponentIs(undefined, mockScope)
        expect(result).toBeUndefined()
      })

      it("is 为 undefined 时返回 undefined", () => {
        const component: TableComponent = {}
        const result = getComponentIs(component, mockScope)
        expect(result).toBeUndefined()
      })
    })

    describe("getComponentProps", () => {
      it("应该返回静态 props 对象", () => {
        const props = { foo: "bar", count: 123 }
        const component: TableComponent = { props }
        const result = getComponentProps(component, mockScope)
        expect(result).toEqual(props)
      })

      it("应该调用函数形式的 props", () => {
        const props = { dynamic: "value" }
        const propsFn = vi.fn(() => props)
        const component: TableComponent = { props: propsFn }
        const result = getComponentProps(component, mockScope)
        expect(propsFn).toHaveBeenCalledWith(mockScope)
        expect(result).toEqual(props)
      })

      it("component 为 undefined 时返回空对象", () => {
        const result = getComponentProps(undefined, mockScope)
        expect(result).toEqual({})
      })

      it("props 为 undefined 时返回空对象", () => {
        const component: TableComponent = {}
        const result = getComponentProps(component, mockScope)
        expect(result).toEqual({})
      })
    })

    describe("getComponentStyle", () => {
      it("应该返回静态样式对象", () => {
        const style = { color: "red", fontSize: "14px" }
        const component: TableComponent = { style }
        const result = getComponentStyle(component, mockScope)
        expect(result).toEqual(style)
      })

      it("应该调用函数形式的 style", () => {
        const style = { backgroundColor: "blue" }
        const styleFn = vi.fn(() => style)
        const component: TableComponent = { style: styleFn }
        const result = getComponentStyle(component, mockScope)
        expect(styleFn).toHaveBeenCalledWith(mockScope)
        expect(result).toEqual(style)
      })

      it("component 为 undefined 时返回 undefined", () => {
        const result = getComponentStyle(undefined, mockScope)
        expect(result).toBeUndefined()
      })

      it("style 为 undefined 时返回 undefined", () => {
        const component: TableComponent = {}
        const result = getComponentStyle(component, mockScope)
        expect(result).toBeUndefined()
      })
    })

    describe("getComponentEvents", () => {
      it("应该返回静态事件对象", () => {
        const onClick = vi.fn()
        const events = { click: onClick }
        const component: TableComponent = { on: events }
        const result = getComponentEvents(component, mockScope)
        expect(result).toEqual(events)
      })

      it("应该调用函数形式的事件", () => {
        const onClick = vi.fn()
        const events = { click: onClick }
        const eventsFn = vi.fn(() => events)
        const component: TableComponent = { on: eventsFn }
        const result = getComponentEvents(component, mockScope)
        expect(eventsFn).toHaveBeenCalledWith(mockScope)
        expect(result).toEqual(events)
      })

      it("component 为 undefined 时返回空对象", () => {
        const result = getComponentEvents(undefined, mockScope)
        expect(result).toEqual({})
      })

      it("on 为 undefined 时返回空对象", () => {
        const component: TableComponent = {}
        const result = getComponentEvents(component, mockScope)
        expect(result).toEqual({})
      })
    })

    describe("getComponentSlots", () => {
      it("应该返回静态插槽对象", () => {
        const slots = { default: "插槽内容", header: "表头" }
        const component: TableComponent = { slots }
        const result = getComponentSlots(component, mockScope)
        expect(result).toEqual(slots)
      })

      it("应该调用函数形式的插槽", () => {
        const slots = { footer: "页脚" }
        const slotsFn = vi.fn(() => slots)
        const component: TableComponent = { slots: slotsFn }
        const result = getComponentSlots(component, mockScope)
        expect(slotsFn).toHaveBeenCalledWith(mockScope)
        expect(result).toEqual(slots)
      })

      it("component 为 undefined 时返回空对象", () => {
        const result = getComponentSlots(undefined, mockScope)
        expect(result).toEqual({})
      })

      it("slots 为 undefined 时返回空对象", () => {
        const component: TableComponent = {}
        const result = getComponentSlots(component, mockScope)
        expect(result).toEqual({})
      })
    })
  })

  describe("列插槽解析", () => {
    describe("getColumnSlots", () => {
      it("应该返回静态插槽对象", () => {
        const slots = { header: { is: "div" }, custom: { is: "span" } }
        const column: TableColumn = { slots }
        const result = getColumnSlots(column)
        expect(result).toEqual(slots)
      })

      it("应该调用函数形式的插槽", () => {
        const slots = { header: { is: "div" } }
        const slotsFn = vi.fn(() => slots)
        const column: TableColumn = { slots: slotsFn }
        const result = getColumnSlots(column)
        expect(slotsFn).toHaveBeenCalled()
        expect(result).toEqual(slots)
      })

      it("slots 为 undefined 时返回空对象", () => {
        const column: TableColumn = {}
        const result = getColumnSlots(column)
        expect(result).toEqual({})
      })
    })

    describe("getHeaderComponent", () => {
      it("应该返回表头组件", () => {
        const headerComponent = { is: "div", props: { title: "标题" } }
        const column: TableColumn = {
          slots: { header: headerComponent },
        }
        const result = getHeaderComponent(column)
        expect(result).toEqual(headerComponent)
      })

      it("无表头组件时返回 undefined", () => {
        const column: TableColumn = { slots: {} }
        const result = getHeaderComponent(column)
        expect(result).toBeUndefined()
      })

      it("slots 为函数时也能正确获取", () => {
        const headerComponent = { is: "span" }
        const column: TableColumn = {
          slots: () => ({ header: headerComponent }),
        }
        const result = getHeaderComponent(column)
        expect(result).toEqual(headerComponent)
      })
    })

    describe("getSlotName", () => {
      it("应该返回静态插槽名称", () => {
        const component: TableComponent = { slot: "custom-slot" }
        const result = getSlotName(component, mockScope)
        expect(result).toBe("custom-slot")
      })

      it("应该调用函数形式的插槽名称", () => {
        const slotFn = vi.fn(() => "dynamic-slot")
        const component: TableComponent = { slot: slotFn }
        const result = getSlotName(component, mockScope)
        expect(slotFn).toHaveBeenCalledWith(mockScope)
        expect(result).toBe("dynamic-slot")
      })

      it("component 为 undefined 时返回 undefined", () => {
        const result = getSlotName(undefined, mockScope)
        expect(result).toBeUndefined()
      })

      it("slot 为 undefined 时返回 undefined", () => {
        const component: TableComponent = {}
        const result = getSlotName(component, mockScope)
        expect(result).toBeUndefined()
      })
    })
  })
})

import { resolveComponent } from "../core/helpers"
import { it, expect, describe } from "vitest"

describe("resolveComponent", () => {
  it("当 component 未定义时返回 undefined", () => {
    const action = { type: "search" }
    expect(resolveComponent(action as any, "props", {})).toBeUndefined()
  })

  it("当 component 属性存在时解析对应值", () => {
    const action = {
      type: "search",
      component: {
        is: "el-input",
        props: { placeholder: "search" },
      },
    }
    expect(resolveComponent(action as any, "is", {})).toBe("el-input")
    expect(resolveComponent(action as any, "props", {})).toEqual({ placeholder: "search" })
  })

  it("支持函数式解析", () => {
    const action = {
      type: "search",
      component: {
        props: (model: any) => ({ placeholder: model.text }),
      },
    }
    const model = { text: "dynamic" }
    expect(resolveComponent(action as any, "props", model)).toEqual({ placeholder: "dynamic" })
  })
})

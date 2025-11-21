import type { FormRef } from "../../../types"
import Form from "../index"
import ElementPlus from "element-plus"
import { mount } from "@vue/test-utils"
import { it, expect, describe } from "vitest"

function mountForm() {
  return mount(Form, {
    global: {
      plugins: [ElementPlus],
    },
  })
}

describe("fd-form", () => {
  it("hydrates default values when using schema", async () => {
    const wrapper = mountForm()
    const instance = wrapper.vm as FormRef

    instance.use({
      items: [
        {
          field: "name",
          label: "姓名",
          value: "Alice",
          component: {
            is: "el-input",
          },
        },
      ],
    })

    expect(instance.getField("name")).toBe("Alice")
  })

  it("bindFields replaces existing model", () => {
    const wrapper = mountForm()
    const instance = wrapper.vm as FormRef

    instance.use({
      items: [
        {
          field: "age",
          label: "年龄",
          component: {
            is: "el-input-number",
          },
        },
      ],
    })

    instance.bindFields({
      age: 30,
    })

    expect(instance.getField("age")).toBe(30)
  })
})

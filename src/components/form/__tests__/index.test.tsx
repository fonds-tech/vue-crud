import type { FormExpose } from "../../../types"
import Form from "../index"
import ElementPlus from "element-plus"
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe } from "vitest"

vi.mock("../../../hooks", async () => {
  const actual = await vi.importActual<typeof import("../../../hooks")>("../../../hooks")
  return {
    ...actual,
    useConfig: () => ({
      dict: {
        label: {
          save: "保存",
          close: "关闭",
          seeMore: "查看更多",
          hideContent: "收起内容",
          nonEmpty: "{label}不能为空",
        },
      },
      permission: {},
      style: {
        size: "default",
        form: {
          span: 12,
          labelWidth: 120,
          labelPosition: "right",
          plugins: [],
        },
      },
      events: {},
    }),
    useBrowser: () => ({
      width: 1920,
      height: 1080,
      isMini: false,
    }),
  }
})

function mountForm() {
  return mount(Form, {
    props: {
      inner: true,
    },
    global: {
      plugins: [ElementPlus],
    },
  })
}

describe("fd-form", () => {
  it("hydrates nested values when opening the form", () => {
    const wrapper = mountForm()
    const instance = wrapper.vm as FormExpose

    instance.open({
      title: "Nested",
      items: [
        {
          field: "profile.name",
          label: "姓名",
          component: {
            is: "el-input",
          },
        },
      ],
      form: {
        profile: {
          name: "Alice",
        },
      },
    })

    expect(instance.form["profile-name"]).toBe("Alice")
  })

  it("bindForm accepts nested objects", () => {
    const wrapper = mountForm()
    const instance = wrapper.vm as FormExpose

    instance.open({
      title: "Bind",
      items: [
        {
          field: "profile.name",
          label: "姓名",
          component: {
            is: "el-input",
          },
        },
      ],
    })

    instance.bindForm({
      profile: {
        name: "Bob",
      },
    })

    expect(instance.form["profile-name"]).toBe("Bob")
  })
})

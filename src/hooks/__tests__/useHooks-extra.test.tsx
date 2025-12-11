import { mount } from "@vue/test-utils"
import { useCrud } from "../useCrud"
import { useForm } from "../useForm"
import { useTable } from "../useTable"
import { useDetail } from "../useDetail"
import { useSearch } from "../useSearch"
import { useUpsert } from "../useUpsert"
import { h, defineComponent } from "vue"
import { it, vi, expect, describe } from "vitest"

describe("通用 use* hooks 分支补测", () => {
  const hooks = [
    ["fd-crud", useCrud],
    ["fd-search", useSearch],
    ["fd-table", useTable],
    ["fd-form", useForm],
    ["fd-upsert", useUpsert],
    ["fd-detail", useDetail],
  ] as const

  hooks.forEach(([name, hook]) => {
    it(`${name} 应该调用 use 且触发回调`, async () => {
      const use = vi.fn()
      const callback = vi.fn()

      const Child = defineComponent({
        name: "hook-child",
        setup() {
          hook({ from: name }, callback)
          return () => null
        },
      })

      const Parent = defineComponent({
        name,
        setup(_, { expose }) {
          expose({ use })
          return () => h(Child)
        },
      })

      mount(Parent)
      expect(use).toHaveBeenCalledWith(expect.objectContaining({ from: name }))
      expect(callback).toHaveBeenCalled()
    })
  })
})

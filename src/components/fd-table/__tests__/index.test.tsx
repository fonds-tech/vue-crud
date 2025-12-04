import type { PropType } from "vue"
import type { MountingOptions } from "@vue/test-utils"
import type { TableExpose, TableRecord, TableUseOptions } from "../../fd-table/type"
import Table from "../index.vue"
import { mount } from "@vue/test-utils"
import { it, vi, expect, describe } from "vitest"
import { h, ref, nextTick, defineComponent } from "vue"

const ElButtonStub = defineComponent({
  name: "ElButtonStub",
  inheritAttrs: false,
  emits: ["click"],
  setup(_, { slots, emit, attrs }) {
    return () =>
      h(
        "button",
        {
          type: "button",
          ...attrs,
          class: ["el-button-stub", attrs.class],
          onClick: (event: MouseEvent) => emit("click", event),
        },
        slots.default?.(),
      )
  },
})

const ElTooltipStub = defineComponent({
  name: "ElTooltipStub",
  inheritAttrs: false,
  setup(_, { slots }) {
    return () => slots.default?.()
  },
})

const ElDropdownStub = defineComponent({
  name: "ElDropdownStub",
  inheritAttrs: false,
  emits: ["command"],
  setup(_, { slots }) {
    return () =>
      h("div", { class: "el-dropdown-stub" }, [
        slots.default?.(),
        h("div", { class: "el-dropdown-menu" }, slots.dropdown?.()),
      ])
  },
})

const ElDropdownMenuStub = defineComponent({
  name: "ElDropdownMenuStub",
  setup(_, { slots }) {
    return () => h("div", { class: "el-dropdown-menu-stub" }, slots.default?.())
  },
})

const ElDropdownItemStub = defineComponent({
  name: "ElDropdownItemStub",
  inheritAttrs: false,
  props: {
    command: String,
  },
  emits: ["command"],
  setup(props, { slots, emit }) {
    return () =>
      h(
        "button",
        {
          class: "el-dropdown-item-stub",
          onClick: () => emit("command", props.command),
        },
        slots.default?.(),
      )
  },
})

const ElPopoverStub = defineComponent({
  name: "ElPopoverStub",
  inheritAttrs: false,
  setup(_, { slots }) {
    return () =>
      h("div", { class: "el-popover-stub" }, [slots.reference?.(), slots.default?.(), slots.content?.()])
  },
})

const ElCheckboxStub = defineComponent({
  name: "ElCheckboxStub",
  inheritAttrs: false,
  props: {
    label: String,
    modelValue: Boolean,
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const state = ref(props.modelValue)
    return () =>
      h("label", { class: "el-checkbox-stub" }, [
        h("input", {
          type: "checkbox",
          checked: state.value,
          onChange: (event: Event) => {
            const checked = (event.target as HTMLInputElement).checked
            state.value = checked
            emit("update:modelValue", checked)
          },
        }),
        props.label,
      ])
  },
})

const ElTableColumnStub = defineComponent({
  name: "ElTableColumnStub",
  inheritAttrs: false,
  setup(_, { slots }) {
    return () => slots.default?.({ row: {}, column: {}, $index: 0 })
  },
})

const ElTableStub = defineComponent({
  name: "ElTableStub",
  inheritAttrs: false,
  props: {
    data: {
      type: Array as PropType<TableRecord[]>,
      default: () => [],
    },
  },
  setup(props, { slots, attrs, expose }) {
    function noop() {}
    expose({
      toggleRowSelection: noop,
      toggleAllSelection: noop,
      toggleRowExpansion: noop,
      clearSelection: noop,
      clearFilter: noop,
      clearSort: noop,
    })
    return () =>
      h("div", { class: "el-table-stub", ...attrs }, [
        props.data?.map((row: TableRecord) => h("div", { class: "row" }, row.name)),
        slots.default?.({ row: props.data?.[0] ?? {}, column: {}, $index: 0 }),
      ])
  },
})

const ElPaginationStub = defineComponent({
  name: "ElPaginationStub",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () => h("div", { class: "el-pagination-stub", ...attrs })
  },
})

const ElLinkStub = defineComponent({
  name: "ElLinkStub",
  inheritAttrs: false,
  emits: ["click"],
  setup(_, { slots, emit, attrs }) {
    return () =>
      h(
        "button",
        {
          type: "button",
          class: ["el-link-stub", attrs.class],
          onClick: (event: MouseEvent) => emit("click", event),
        },
        slots.default?.(),
      )
  },
})

const ElTagStub = defineComponent({
  name: "ElTagStub",
  inheritAttrs: false,
  setup(_, { slots }) {
    return () => h("span", { class: "el-tag-stub" }, slots.default?.())
  },
})

const ElSpaceStub = defineComponent({
  name: "ElSpaceStub",
  inheritAttrs: false,
  setup(_, { slots }) {
    return () => h("div", { class: "el-space-stub" }, slots.default?.())
  },
})

const ElIconStub = defineComponent({
  name: "ElIconStub",
  inheritAttrs: false,
  setup(_, { slots }) {
    return () => h("span", { class: "el-icon-stub" }, slots.default?.())
  },
})

type TableMountOptions = MountingOptions<typeof Table>

const coreStore = {
  crud: createCrudStub(),
  mitt: createMittStub(),
}

vi.mock("@/hooks", () => ({
  useCore: () => coreStore,
}))

interface CrudStub {
  refresh: ReturnType<typeof vi.fn>
  setParams: ReturnType<typeof vi.fn>
  rowInfo: ReturnType<typeof vi.fn>
  rowEdit: ReturnType<typeof vi.fn>
  rowDelete: ReturnType<typeof vi.fn>
  selection: any[]
  dict: { label: Record<string, string>, primaryId: string }
  loading: boolean
  getParams: () => { page: number, size: number }
}

function createCrudStub(): CrudStub {
  const state = { page: 1, size: 20 }
  return {
    refresh: vi.fn(),
    setParams: vi.fn((params: Partial<typeof state>) => Object.assign(state, params)),
    rowInfo: vi.fn(),
    rowEdit: vi.fn(),
    rowDelete: vi.fn(),
    selection: [],
    dict: { label: { detail: "详情", update: "编辑", delete: "删除" }, primaryId: "id" },
    loading: false,
    getParams: () => state,
  }
}

function createMittStub() {
  const handlers: Record<string, Array<(payload?: any) => void>> = {}
  return {
    handlers,
    on: vi.fn((event: string, handler: (payload?: any) => void) => {
      handlers[event] = handlers[event] ?? []
      handlers[event].push(handler)
    }),
    off: vi.fn((event: string, handler?: (payload?: any) => void) => {
      if (!handlers[event])
        return
      if (!handler) {
        handlers[event] = []
        return
      }
      handlers[event] = handlers[event].filter(fn => fn !== handler)
    }),
    emit: vi.fn(),
  }
}

function mountTable(options: TableMountOptions = {}) {
  coreStore.crud = createCrudStub()
  coreStore.mitt = createMittStub()
  const mountOptions: TableMountOptions = {
    ...options,
    global: {
      ...(options.global ?? {}),
      stubs: {
        ...(options.global?.stubs ?? {}),
        "el-button": ElButtonStub,
        "el-tooltip": ElTooltipStub,
        "el-dropdown": ElDropdownStub,
        "el-dropdown-menu": ElDropdownMenuStub,
        "el-dropdown-item": ElDropdownItemStub,
        "el-popover": ElPopoverStub,
        "el-checkbox": ElCheckboxStub,
        "el-table": ElTableStub,
        "el-table-column": ElTableColumnStub,
        "el-pagination": ElPaginationStub,
        "el-link": ElLinkStub,
        "el-tag": ElTagStub,
        "el-space": ElSpaceStub,
        "el-icon": ElIconStub,
      },
    },
  }
  return mount(Table, mountOptions as any)
}

function getExpose(wrapper: ReturnType<typeof mountTable>) {
  return (wrapper.vm.$.exposed ?? {}) as TableExpose
}

function emitTableRefresh(payload: any) {
  coreStore.mitt.handlers["table.refresh"]?.forEach(handler => handler(payload))
}

describe("fd-table", () => {
  it("use 与 setData 可以更新表格数据", async () => {
    const wrapper = mountTable()
    const table = getExpose(wrapper)
    table.use({
      columns: [
        { prop: "name", label: "姓名" },
      ],
    } as TableUseOptions)
    table.setData([
      { id: 1, name: "张三" },
    ])
    await nextTick()
    expect(table.data[0].name).toBe("张三")
  })

  it("工具栏刷新按钮会触发 crud.refresh", async () => {
    const wrapper = mountTable()
    const refreshButton = wrapper.findAll(".fd-table__tools .fd-table__tool-btn")[0]
    await refreshButton.trigger("click")
    expect(coreStore.crud.refresh).toHaveBeenCalled()
  })

  it("table.refresh 事件会更新分页信息", async () => {
    const wrapper = mountTable()
    const table = getExpose(wrapper)
    emitTableRefresh({ list: [{ id: 1, name: "李四" }], page: 2, count: 30, pageSize: 10 })
    await nextTick()
    expect(table.data.length).toBe(1)
  })
})

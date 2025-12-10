import type { Slots } from "vue"
import type { TableCore } from "../core"
import { mount } from "@vue/test-utils"
import { TableFooter } from "../render/pagination"
import { renderTable } from "../render/table"
import { TableToolbar } from "../render/toolbar"
import { renderColumns } from "../render/columns"
import { ColumnSettings } from "../render/settings"
import { renderContextMenu } from "../render/context-menu"
import { h, defineComponent } from "vue"
import { renderActionButtons } from "../render/actions"
import { it, vi, expect, describe, beforeEach } from "vitest"

// 统一 mock Element Plus 组件与指令，记录渲染入参便于断言（使用全局存储避免 hoist 引发的 TDZ）
function getRecorded() {
  const globalObj = globalThis as Record<string, any>
  globalObj.__tableRecorded = globalObj.__tableRecorded ?? {}
  return globalObj.__tableRecorded as Record<string, any[]>
}

function createStub(name: string, renderSlots: Array<"default" | "reference" | "dropdown" | "item"> = ["default"]) {
  return (props: any, { slots }: { slots: Slots }) => {
    const recorded = getRecorded()
    recorded[name] = recorded[name] ?? []
    recorded[name].push(props)
    return h(
      "div",
      { class: name },
      renderSlots.flatMap((slotName) => {
        const slot = (slots as Slots)[slotName]
        const content = slot?.({ element: (props as any).modelValue?.[0] }) ?? null
        return Array.isArray(content) ? content : [content]
      }),
    )
  }
}

vi.mock("element-plus", () => {
  const recorded = getRecorded()
  const ElMessageSuccess = vi.fn()
  ;(globalThis as any).__elMessageSuccess = ElMessageSuccess
  return {
    __esModule: true,
    recorded,
    ElMessage: { success: ElMessageSuccess },
    ElLink: createStub("ElLink"),
    ElTable: createStub("ElTable"),
    ElTableColumn: createStub("ElTableColumn"),
    ElPagination: createStub("ElPagination"),
    ElButton: createStub("ElButton"),
    ElTooltip: createStub("ElTooltip"),
    ElDropdown: createStub("ElDropdown", ["default", "dropdown"]),
    ElDropdownItem: createStub("ElDropdownItem"),
    ElDropdownMenu: createStub("ElDropdownMenu", ["default"]),
    ElIcon: createStub("ElIcon"),
    ElSpace: createStub("ElSpace"),
    ElTag: createStub("ElTag"),
    ElCheckbox: createStub("ElCheckbox"),
    ElScrollbar: createStub("ElScrollbar"),
    ElPopover: createStub("ElPopover", ["default", "reference"]),
    ElLoading: { directive: {} },
  }
})

vi.mock("@element-plus/icons-vue", () => {
  const Icon = createStub("Icon")
  return {
    __esModule: true,
    QuestionFilled: Icon,
    Operation: Icon,
    FullScreen: Icon,
    Refresh: Icon,
    Setting: Icon,
  }
})

vi.mock("vuedraggable", () => ({
  __esModule: true,
  default: createStub("Draggable", ["item"]),
}))

const recorded = getRecorded()
const ElMessageSuccess = (globalThis as any).__elMessageSuccess as ReturnType<typeof vi.fn>

const renderHelpers = {
  getSlotName: vi.fn(),
  getComponentIs: vi.fn(),
  getComponentProps: vi.fn(),
  getComponentStyle: vi.fn(),
  getComponentEvents: vi.fn(),
  getComponentSlots: vi.fn(),
  getHeaderComponent: vi.fn(),
  hasDict: vi.fn(),
  getDictType: vi.fn(),
  getDictColor: vi.fn(),
  getDictLabel: vi.fn(),
  formatCell: vi.fn(),
}

const crudBridge = {
  refresh: vi.fn(),
  rowInfo: vi.fn(),
  rowEdit: vi.fn(),
  rowDelete: vi.fn(),
  dict: { label: { detail: "详情", delete: "删除" } },
}

const baseScope = { row: { id: 1 }, column: { prop: "name" }, $index: 0 } as any
const mountVNode = (vnode: any) => mount(defineComponent({ render: () => vnode }))
const toVNodeArray = (node: any) => (Array.isArray(node) ? node : [node]).filter(Boolean)

describe("table render layer", () => {
  beforeEach(() => {
    Object.keys(recorded).forEach(key => (recorded[key] = []))
    vi.clearAllMocks()
  })

  it("renderActionButtons 覆盖隐藏、内置、插槽与动态组件", () => {
    const slotFn = vi.fn().mockReturnValue("slot-content")
    renderHelpers.getSlotName.mockReturnValue("custom")
    renderHelpers.getComponentIs.mockImplementation(component => (component as any)?.is)

    const nodes = toVNodeArray(renderActionButtons(baseScope, [{ hidden: true } as any], {}, renderHelpers as any, crudBridge as any))
    expect(nodes.length).toBe(0)

    const builtins = toVNodeArray(renderActionButtons(baseScope, [{ type: "delete" } as any], {}, renderHelpers as any, crudBridge as any))
    builtins[0]?.props?.onClick?.()
    expect(crudBridge.rowDelete).toHaveBeenCalledWith(baseScope.row)

    const slotResult = renderActionButtons(baseScope, [{ component: { slot: "custom" } } as any], { custom: slotFn }, renderHelpers as any, crudBridge as any)
    expect(slotResult[0]).toBe("slot-content")

    renderHelpers.getComponentProps.mockReturnValueOnce({ id: "btn" })
    renderHelpers.getComponentStyle.mockReturnValueOnce({ color: "red" })
    renderHelpers.getComponentEvents.mockReturnValueOnce({ onClick: vi.fn() })
    renderHelpers.getComponentSlots.mockReturnValueOnce({ default: "content", extra: undefined })

    const dynamic = toVNodeArray(renderActionButtons(baseScope, [{ component: { is: "button" } } as any], {}, renderHelpers as any, crudBridge as any))
    expect(dynamic[0]?.type).toBe("button")
    expect(renderHelpers.getComponentSlots).toHaveBeenCalled()
  })

  it("renderColumns 支持多种列类型与字典/动态渲染", () => {
    renderHelpers.hasDict.mockImplementation(column => column.prop === "status")
    renderHelpers.getDictType.mockReturnValue("success")
    renderHelpers.getDictColor.mockReturnValue("#0f0")
    renderHelpers.getDictLabel.mockReturnValue("已启用")
    renderHelpers.getSlotName.mockImplementation(component => (component as any)?.slot)
    renderHelpers.getComponentIs.mockImplementation(component => (component as any)?.is)
    renderHelpers.getComponentProps.mockReturnValue({})
    renderHelpers.getComponentStyle.mockReturnValue({})
    renderHelpers.getComponentEvents.mockReturnValue({ onClick: vi.fn() })
    renderHelpers.getComponentSlots.mockReturnValue({ default: "cell-slot", extra: undefined })
    renderHelpers.getHeaderComponent.mockImplementation(column => column.headerComp)

    const columns = renderColumns(
      [
        { type: "selection", __id: "sel" },
        { type: "index", __id: "idx" },
        { type: "expand", __id: "exp" },
        { type: "action", __id: "act", actions: [{ type: "detail" }] },
        { __id: "h", label: "带帮助", prop: "help", help: "tip" },
        { __id: "status", label: "状态", prop: "status" },
        { __id: "slot", label: "插槽", prop: "slot", component: { slot: "cell" } },
        { __id: "dyn", label: "动态", prop: "dyn", component: { is: "DynComp" } },
        { __id: "header", label: "头组件", prop: "header", headerComp: { is: "HeaderComp" } },
        { __id: "text", label: "文本", prop: "text" },
      ] as any,
      renderHelpers as any,
      { expand: vi.fn().mockReturnValue("expand-slot"), cell: vi.fn().mockReturnValue("cell-slot") } as any,
      crudBridge as any,
    )

    expect(columns).toHaveLength(10)
    const actionColumn = columns[3] as any
    expect(actionColumn?.props?.width).toBe(120)
    expect(actionColumn?.props?.fixed).toBe("right")
    expect(actionColumn?.props?.align).toBe("center")
    const dictColumn = columns.find(col => (col as any).props?.prop === "status") as any
    const dictChildren = dictColumn?.children as any
    const dictVNode = dictChildren?.default?.(baseScope as any)
    expect(dictVNode?.props?.type).toBe("success")
    const slotColumn = columns.find(col => (col as any).props?.prop === "slot") as any
    const slotChildren = slotColumn?.children as any
    expect(slotChildren?.default?.(baseScope as any)).toBe("cell-slot")
    const dynColumn = columns.find(col => (col as any).props?.prop === "dyn") as any
    const dynChildren = dynColumn?.children as any
    expect(dynChildren?.default?.(baseScope as any)?.type).toBe("DynComp")
    const headerColumn = columns.find(col => (col as any).props?.prop === "header") as any
    const headerChildren = headerColumn?.children as any
    const headerVNode = headerChildren?.header?.()
    expect(headerVNode?.type).toBe("HeaderComp")
    const expandColumn = columns.find(col => (col as any).props?.type === "expand") as any
    const expandChildren = expandColumn?.children as any
    expect(expandChildren?.default?.(baseScope as any)).toBe("expand-slot")
    const textColumn = columns.find(col => (col as any).props?.prop === "text") as any
    const textChildren = textColumn?.children as any
    textChildren?.default?.(baseScope as any)
    expect(renderHelpers.formatCell).toHaveBeenCalled()
  })

  it("renderContextMenu 根据可见性渲染并触发点击", () => {
    const handlers = { handleContextAction: vi.fn() }
    const engine = {
      state: { contextMenuState: { visible: true, x: 10, y: 20, items: [{ label: "查看", action: vi.fn() }] } },
      handlers,
    } as unknown as TableCore
    const vnode = renderContextMenu(engine)
    const menuVNode = (vnode.children as any)?.default?.()
    expect(menuVNode?.children?.length).toBeGreaterThan(0)
    menuVNode.children?.[0]?.props?.onClick?.()
    expect(handlers.handleContextAction).toHaveBeenCalled()
  })

  it("tableFooter 触发分页回调", () => {
    const onPageChange = vi.fn()
    const onSizeChange = vi.fn()
    const vnode = TableFooter({
      paginationStart: 1,
      paginationEnd: 10,
      selectedCount: 2,
      paginationProps: { pageSize: 10 },
      onPageChange,
      onPageSizeChange: onSizeChange,
    })
    const wrapper = mountVNode(vnode as any)
    const subTreeChildren = wrapper.vm.$.subTree.children as any[] | undefined
    const paginationVNode = subTreeChildren?.[1]
    paginationVNode?.props?.onCurrentChange?.(3)
    paginationVNode?.props?.onSizeChange?.(20)
    expect(onPageChange).toHaveBeenCalledWith(3)
    expect(onSizeChange).toHaveBeenCalledWith(20)
    expect((vnode.children as any)?.[0]?.children?.[0]).not.toBeNull()
    wrapper.unmount()
  })

  it("columnSettingsPanel 覆盖显隐、固定、拖拽与保存", () => {
    const toggleAllColumns = vi.fn()
    const resetColumns = vi.fn()
    const toggleFixed = vi.fn()
    const onColumnShowChange = vi.fn()
    const onDragMove = vi.fn().mockReturnValue(true)
    const onDragEnd = vi.fn()
    const saveColumns = vi.fn()
    const state: any = {
      isAllChecked: { value: false },
      isIndeterminate: { value: false },
      columnSettings: { value: [{ id: "a", label: "A", show: true, sort: true }] },
    }

    const vnode = ColumnSettings({
      state,
      toggleAllColumns,
      resetColumns,
      toggleFixed,
      onColumnShowChange,
      onDragMove,
      onDragEnd,
      saveColumns,
    })

    const panel = (vnode.children as any)?.default?.()
    const panelChildren = Array.isArray(panel?.children) ? panel.children : []
    const header = panelChildren[0] as any
    header.children?.[0]?.props?.onChange(true)
    expect(toggleAllColumns).toHaveBeenCalledWith(true)
    header.children?.[1]?.props?.onClick?.()
    expect(resetColumns).toHaveBeenCalled()

    const scrollVNode = panelChildren[1] as any
    const draggableVNode = (scrollVNode?.children as any)?.default?.()
    expect(draggableVNode).toBeTruthy()
    expect(draggableVNode.props.move({ draggedContext: { element: {} }, relatedContext: { element: {} } })).toBe(true)
    draggableVNode.props.onEnd()
    expect(onDragEnd).toHaveBeenCalled()
    draggableVNode.props["onUpdate:modelValue"]?.([{ id: "b" }])
    expect(state.columnSettings.value[0].id).toBe("b")

    const itemVNode = (draggableVNode?.children as any)?.item?.({ element: state.columnSettings.value[0] })
    const itemRow = itemVNode.children?.[0]
    itemRow.children?.[1]?.props?.onChange(false)
    expect(onColumnShowChange).toHaveBeenCalledWith("b", false)
    itemRow.children?.[3]?.children?.[0]?.props?.onClick?.()
    expect(toggleFixed).toHaveBeenCalledWith("b", "left")
    itemRow.children?.[3]?.children?.[1]?.props?.onClick?.()
    expect(toggleFixed).toHaveBeenCalledWith("b", "right")

    const footerBtn = (panel as any)?.children?.[2]?.children?.[0]
    footerBtn?.props?.onClick?.()
    expect(saveColumns).toHaveBeenCalled()
    expect(ElMessageSuccess).toHaveBeenCalled()
  })

  it("tableToolbar 在 show=false 时返回 null，启用工具交互", async () => {
    expect(TableToolbar({ show: false } as any)).toBeNull()
    const onRefresh = vi.fn()
    const onSizeChange = vi.fn()
    const onToggleFullscreen = vi.fn()
    const toolbarVNode = TableToolbar({
      show: true,
      slots: {},
      toolsEnabled: true,
      sizeOptions: [
        { label: "大", value: "large" },
        { label: "小", value: "small" },
      ] as any,
      currentSize: "small" as any,
      onRefresh,
      onSizeChange,
      columnSettings: h("div", { class: "column-settings" }),
      onToggleFullscreen,
      isFullscreen: false,
    })
    const wrapper = mountVNode(toolbarVNode as any)
    const subTreeChildren = wrapper.vm.$.subTree.children as any[] | undefined
    const tools = subTreeChildren?.find(node => String(node?.props?.class).includes("fd-table__tools"))
    expect(tools).toBeTruthy()
    const buttons = wrapper.findAll(".fd-table__tool-btn")
    await buttons[0].trigger("click")
    const dropdown = (tools?.children as any[])?.find((child: any) => child?.props?.onCommand)
    dropdown?.props?.onCommand?.("large")
    await buttons[buttons.length - 1].trigger("click")
    expect(onRefresh).toHaveBeenCalled()
    expect(onSizeChange).toHaveBeenCalledWith("large")
    expect(onToggleFullscreen).toHaveBeenCalled()
    expect((tools?.children as any[])?.[2]?.props?.class).toBe("column-settings")
    wrapper.unmount()
  })

  it("renderTable 事件映射、加载指令与工具栏/分页组合", () => {
    const emit = vi.fn()
    const handlers = {
      onSelectionChange: vi.fn(),
      onCellContextmenu: vi.fn(),
      onPageChange: vi.fn(),
      onPageSizeChange: vi.fn(),
      onSizeChange: vi.fn(),
    }
    const methods = { refresh: vi.fn(), toggleFullscreen: vi.fn() }
    const engine = {
      state: {
        tableOptions: { table: { tools: true, size: "default" }, columns: [], rowKey: undefined },
        namedExtraSlots: { value: [] },
        tableRows: { value: [] },
        rowKeyProp: { value: "id" },
        elTableProps: { value: {} },
        visibleColumns: { value: [] },
        tableRef: {},
        shouldShowToolbar: { value: true },
        paginationStart: { value: 1 },
        paginationEnd: { value: 10 },
        selectedRows: { value: [] },
        paginationProps: { value: {} },
        rootAttrs: { value: { class: "root-class", style: { width: "100%" } } },
        isFullscreen: { value: false },
        isAllChecked: { value: false },
        isIndeterminate: { value: false },
        columnSettings: { value: [{ id: "a", label: "A", show: true, sort: true }] },
        contextMenuState: { visible: false, x: 0, y: 0, items: [] },
      },
      handlers,
      methods,
      renderHelpers: {
        getSlotName: () => undefined,
        getHeaderComponent: () => undefined,
        getComponentIs: () => undefined,
        getComponentProps: () => ({}),
        getComponentStyle: () => ({}),
        getComponentEvents: () => ({}),
        getComponentSlots: () => ({}),
        hasDict: () => false,
        getDictType: () => "info",
        getDictColor: () => "",
        getDictLabel: () => "",
        formatCell: () => "",
      },
      crudBridge,
      isLoading: { value: true },
      sizeOptions: [{ label: "默认", value: "default" }],
      emitColumnsChange: vi.fn(),
      emit,
    } as unknown as TableCore

    const vnode = renderTable({ engine, slots: {} as any })
    const wrapper = mountVNode(vnode as any)
    const subTreeChildren = wrapper.vm.$.subTree.children as any[] | undefined
    const tableVNode = subTreeChildren?.[2]?.children?.[0] as any
    const tableProps = tableVNode?.props
    tableProps?.onSelectionChange?.(["row1"])
    expect(handlers.onSelectionChange).toHaveBeenCalledWith(["row1"])
    expect(emit).toHaveBeenCalledWith("selection-change", ["row1"])

    tableProps?.onRowContextmenu?.({ id: 1 }, {}, { preventDefault: vi.fn() } as any)
    expect(handlers.onCellContextmenu).toHaveBeenCalled()

    const footerVNode = subTreeChildren?.[3]?.children?.[1] as any
    footerVNode?.props?.onCurrentChange?.(2)
    footerVNode?.props?.onSizeChange?.(30)
    expect(handlers.onPageChange).toHaveBeenCalledWith(2)
    expect(handlers.onPageSizeChange).toHaveBeenCalledWith(30)

    expect((vnode.children as any)?.[0]?.props?.class).toContain("fd-table")
    expect((vnode.children as any)?.[0]?.props?.class).not.toContain("is-fullscreen")
    expect(tableVNode?.children).toBeDefined()
    wrapper.unmount()
  })

  it("renderTable 覆盖 loading 指令、全屏态与 cell-contextmenu 分支", () => {
    const emit = vi.fn()
    const handlers = {
      onSelectionChange: vi.fn(),
      onCellContextmenu: vi.fn(),
      onPageChange: vi.fn(),
      onPageSizeChange: vi.fn(),
      onSizeChange: vi.fn(),
    }
    const methods = { refresh: vi.fn(), toggleFullscreen: vi.fn() }
    const renderHelpersLite = {
      getSlotName: () => undefined,
      getHeaderComponent: () => undefined,
      getComponentIs: () => undefined,
      getComponentProps: () => ({}),
      getComponentStyle: () => ({}),
      getComponentEvents: () => ({}),
      getComponentSlots: () => ({}),
      hasDict: () => false,
      getDictType: () => "info",
      getDictColor: () => "",
      getDictLabel: () => "",
      formatCell: () => "text",
    }
    const engine = {
      state: {
        tableOptions: { table: { tools: true, size: "default", rowKey: undefined }, columns: [{ __id: "a", label: "A", prop: "a" }] },
        namedExtraSlots: { value: ["extra"] },
        tableRows: { value: [{ id: 1 }] },
        rowKeyProp: { value: "id" },
        elTableProps: { value: {} },
        visibleColumns: { value: [{ __id: "a", label: "A", prop: "a" }] },
        tableRef: {},
        shouldShowToolbar: { value: false },
        paginationStart: { value: 1 },
        paginationEnd: { value: 1 },
        selectedRows: { value: [] },
        paginationProps: { value: {} },
        rootAttrs: { value: { class: "root-class", style: { width: "100%" } } },
        isFullscreen: { value: true },
        isAllChecked: { value: false },
        isIndeterminate: { value: false },
        columnSettings: { value: [{ id: "a", label: "A", show: true, sort: true }] },
        contextMenuState: { visible: false, x: 0, y: 0, items: [] },
      },
      handlers,
      methods,
      renderHelpers: renderHelpersLite,
      crudBridge,
      isLoading: { value: true },
      sizeOptions: [{ label: "默认", value: "default" }],
      emitColumnsChange: vi.fn(),
      emit,
    } as unknown as TableCore

    const slots = { extra: vi.fn().mockReturnValue("extra-slot") } as any
    const vnode = renderTable({ engine, slots })
    const wrapper = mountVNode(vnode as any)
    const rootDiv = wrapper.vm.$.subTree as any
    expect(rootDiv.props?.class ?? "").toContain("is-fullscreen")
    const subTreeChildren = rootDiv.children as any[] | undefined
    const tableVNode = subTreeChildren?.[2]?.children?.[0]
    expect(tableVNode).toBeTruthy()
    const tableProps = (tableVNode as any)?.props
    tableProps?.onCellContextmenu?.({ id: 1 }, {}, { preventDefault: vi.fn() } as any)
    expect(emit).toHaveBeenCalledWith("cell-contextmenu", { id: 1 }, {}, expect.anything())
    tableProps?.onHeaderClick?.("col", "evt")
    expect(emit).toHaveBeenCalledWith("header-click", "col", "evt")
    wrapper.unmount()
  })
})

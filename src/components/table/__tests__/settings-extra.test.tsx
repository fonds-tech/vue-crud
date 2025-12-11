import type { Slots } from "vue"
import { mount } from "@vue/test-utils"
import { ColumnSettings } from "../render/settings"
import { defineComponent } from "vue"
import { it, vi, expect, describe } from "vitest"

// 简易 stub 组件收集 props
function createStub(name: string, renderSlots: Array<keyof Slots> = ["default"]) {
  return (props: any, { slots }: { slots: Slots }) => {
    const recorded = (globalThis as any).__tableSettingsRecorded
    recorded[name] = recorded[name] ?? []
    recorded[name].push(props)
    return (renderSlots.flatMap(slotName => slots[slotName]?.({ element: props.modelValue?.[0] }) ?? []) as any) || null
  }
}

const recorded: Record<string, any[]> = {}
;(globalThis as any).__tableSettingsRecorded = recorded

vi.mock("element-plus", () => {
  return {
    __esModule: true,
    ElPopover: createStub("ElPopover", ["default", "reference"]),
    ElTooltip: createStub("ElTooltip"),
    ElButton: createStub("ElButton"),
    ElCheckbox: createStub("ElCheckbox"),
    ElScrollbar: createStub("ElScrollbar"),
    ElIcon: createStub("ElIcon"),
    ElMessage: { success: vi.fn() },
  }
})

vi.mock("vuedraggable", () => {
  const stub = (props: any, { slots }: { slots: Slots }) => {
    const arr = (globalThis as any).__tableSettingsRecorded.Draggable || []
    arr.push(props)
    ;(globalThis as any).__tableSettingsRecorded.Draggable = arr
    return slots.item?.({ element: props.modelValue?.[0] })
  }
  return { __esModule: true, default: stub }
})

describe("columnSettings defaults", () => {
  it("缺省 onDragMove/onDragEnd 也能正常工作并更新列表", () => {
    recorded.Draggable = []
    const state: any = {
      isAllChecked: { value: true },
      isIndeterminate: { value: false },
      columnSettings: { value: [{ id: "a", label: "A", show: true, sort: true }] },
    }
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          ColumnSettings({
            state,
            toggleAllColumns: vi.fn(),
            resetColumns: vi.fn(),
            toggleFixed: vi.fn(),
            onColumnShowChange: vi.fn(),
            saveColumns: vi.fn(),
          }),
      }),
    )

    const draggableProps = recorded.Draggable?.[0]
    expect(draggableProps).toBeTruthy()

    expect(draggableProps.move({} as any)).toBe(true)
    expect(() => draggableProps.onEnd()).not.toThrow()

    draggableProps["onUpdate:modelValue"]?.([{ id: "b", label: "B", show: true, sort: true }])
    expect(state.columnSettings.value[0].id).toBe("b")
    wrapper.unmount()
  })
})

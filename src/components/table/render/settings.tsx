import type { VNode } from "vue"
import type { ColumnSetting } from "../core/state"
import type { DragMoveEvent, ColumnSettingsPanelProps } from "../core/settings"
import Draggable from "vuedraggable"
import IconTablerPinFilled from "~icons/tabler/pin-filled"
import { h } from "vue"
import { Setting } from "@element-plus/icons-vue"
import { ElIcon, ElButton, ElMessage, ElPopover, ElTooltip, ElCheckbox, ElScrollbar } from "element-plus"

/**
 * 渲染列设置面板
 *
 * @param props - 面板的属性
 * @returns 代表列设置面板的 VNode
 */
export function ColumnSettings(props: ColumnSettingsPanelProps): VNode {
  const { state } = props
  return h(
    ElPopover,
    {
      "width": "220px",
      "placement": "bottom-start",
      "trigger": "click",
      "teleported": false,
      "hide-after": 0,
      "popperClass": "fd-table__column-popover",
    },
    {
      reference: () =>
        h(
          "span",
          { class: "fd-table__tool-trigger" },
          h(
            ElTooltip,
            { content: "列设置", placement: "top" },
            {
              default: () =>
                h(
                  "div",
                  { class: "fd-table__tool-btn", role: "button", tabindex: 0 },
                  h(ElIcon, null, () => h(Setting)),
                ),
            },
          ),
        ),
      default: () =>
        h("div", { class: "fd-table__column-panel" }, [
          h("div", { class: "fd-table__column-header" }, [
            h(ElCheckbox, {
              modelValue: state.isAllChecked.value,
              indeterminate: state.isIndeterminate.value,
              label: "全选",
              onChange: (val: unknown) => props.toggleAllColumns(Boolean(val)),
            }),
            h(ElButton, { link: true, type: "primary", onClick: () => props.resetColumns() }, () => "重置"),
          ]),
          h(ElScrollbar, { class: "fd-table__column-scroll" }, () =>
            h(
              Draggable,
              {
                "modelValue": state.columnSettings.value,
                "item-key": "id",
                "animation": 180,
                "ghost-class": "fd-table__drag-ghost",
                "chosen-class": "fd-table__drag-chosen",
                "move": (evt: DragMoveEvent) => props.onDragMove(evt),
                "onUpdate:modelValue": (val: ColumnSetting[]) => {
                  state.columnSettings.value = val
                },
                "onEnd": () => props.onDragEnd(),
              },
              {
                item: ({ element }: { element: ColumnSetting }) =>
                  h("div", { class: "fd-table__column-wrapper" }, [
                    h(
                      "div",
                      {
                        class: [
                          "fd-table__column-item",
                          {
                            "is-locked": element.pinned,
                            "is-disabled": !element.sort,
                          },
                        ],
                      },
                      [
                        h("span", { "class": ["fd-table__drag", { "is-disabled": !element.sort }], "aria-hidden": "true" }, "⋮⋮"),
                        h(ElCheckbox, {
                          modelValue: element.show,
                          onChange: (val: unknown) => props.onColumnShowChange(element.id, Boolean(val)),
                        }),
                        h("span", { class: "fd-table__column-label" }, element.label),
                        h("div", { class: "fd-table__fixed-actions" }, [
                          h(
                            ElButton,
                            {
                              link: true,
                              size: "small",
                              class: { "is-active": element.fixed === "left" },
                              onClick: () => props.toggleFixed(element.id, "left"),
                            },
                            () => h(ElIcon, { class: "fd-table__pin-icon fd-table__icon-rotate-left" }, () => h(IconTablerPinFilled)),
                          ),
                          h(
                            ElButton,
                            {
                              link: true,
                              size: "small",
                              class: { "is-active": element.fixed === "right" },
                              onClick: () => props.toggleFixed(element.id, "right"),
                            },
                            () => h(ElIcon, { class: "fd-table__pin-icon fd-table__icon-rotate-right" }, () => h(IconTablerPinFilled)),
                          ),
                        ]),
                      ],
                    ),
                  ]),
              },
            )),
          h("div", { class: "fd-table__column-footer" }, [
            h(
              ElButton,
              {
                type: "primary",
                class: "fd-table__column-save",
                onClick: () => {
                  props.saveColumns()
                  ElMessage.success("保存成功")
                },
              },
              () => "保存",
            ),
          ]),
        ]),
    },
  )
}

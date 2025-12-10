import type { FormItem, FormRenderContext } from "../interface"
import { FdGridItem } from "../../grid-item"
import { renderControl } from "./control"
import { renderSlotOrComponent } from "./slots"

/**
 * 渲染表单项内部的插槽内容（label/extra 等）。
 * @param ctx 渲染上下文
 * @param item 表单项配置
 * @returns 插槽 VNode 列表
 */
export function renderItemSlots(ctx: FormRenderContext, item: FormItem) {
  const slotMap = ctx.helpers.slotsOf(item)
  return Object.entries(slotMap).map(([name, com]) => <span key={name}>{renderSlotOrComponent(ctx, com, { model: ctx.model, item })}</span>)
}

/**
 * 渲染单个表单项，包含栅格包装、el-form-item、额外插槽与控件主体。
 * @param ctx 渲染上下文
 * @param item 表单项配置
 * @param index 表单项索引
 * @param groupName 分组名称（可选）
 * @returns 表单项 VNode
 */
export function renderFormItem(ctx: FormRenderContext, item: FormItem, index: number, groupName?: string | number) {
  const { helpers, slots, model } = ctx
  const key = helpers.propKey(item.prop, index)

  const visible = groupName !== undefined ? helpers.showInGroup(item, groupName) : helpers.show(item)

  const extraContent = helpers.extra(item)

  const mainSlotName = helpers.slotNameOf(item.component)
  const mainContent = mainSlotName && slots[mainSlotName] ? slots[mainSlotName]!({ model, item }) : renderControl(ctx, item)

  return (
    <FdGridItem key={key} v-show={visible} span={helpers.resolveSpan(item)} offset={helpers.resolveOffset(item)}>
      <el-form-item
        {...item}
        prop={item.prop}
        rules={helpers.rules(item)}
        required={helpers.required(item)}
        v-slots={{
          extra: extraContent ? () => extraContent : undefined,
          default: () => (
            <>
              {renderItemSlots(ctx, item)}
              {mainContent}
            </>
          ),
        }}
      />
    </FdGridItem>
  )
}

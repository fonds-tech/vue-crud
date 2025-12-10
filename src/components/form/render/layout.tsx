import type { FormItem, FormRenderContext } from "../types"
import Grid from "../../grid"
import { renderFormItem } from "./item"
import { renderSlotOrComponent, renderComponentSlotMap } from "./slots"

/**
 * 渲染表单栅格容器。
 * @param ctx 渲染上下文
 * @param items 表单项列表
 * @param groupName 分组名称（可选）
 */
export function renderGrid(ctx: FormRenderContext, items: FormItem[], groupName?: string | number) {
  return <Grid {...ctx.options.grid}>{items.map((item, index) => renderFormItem(ctx, item, index, groupName))}</Grid>
}

/**
 * 渲染步骤条布局。
 * @param ctx 渲染上下文
 * @returns Steps VNode 或 null
 */
export function renderSteps(ctx: FormRenderContext) {
  const { options, step, helpers } = ctx
  if (!(options.group?.type === "steps" && options.group.children?.length)) return null

  const stepSlots = renderComponentSlotMap(ctx, helpers.slotsOf(options.group.component))

  return (
    <el-steps active={step.value} {...helpers.componentProps(options.group.component)} style={helpers.styleOf(options.group.component)} v-slots={stepSlots}>
      {options.group.children.map((child, index) => {
        const childSlots = renderComponentSlotMap(ctx, helpers.slotsOf(child.component), { step: index, model: ctx.model })
        return (
          <el-step key={child.name ?? index} title={child.title} {...helpers.componentProps(child.component)} v-slots={childSlots}>
            {renderSlotOrComponent(ctx, child.component, { step: index, model: ctx.model })}
          </el-step>
        )
      })}
    </el-steps>
  )
}

export function renderTabs(ctx: FormRenderContext) {
  const { options, activeGroupName, helpers } = ctx
  if (!(options.group?.type === "tabs" && options.group.children?.length)) return null

  const tabSlots = renderComponentSlotMap(ctx, helpers.slotsOf(options.group.component), { model: ctx.model })
  const lazy = options.group.lazy ?? true
  const keepAlive = options.group.keepAlive ?? true

  return (
    <el-tabs v-model={activeGroupName.value} {...helpers.componentProps(options.group.component)} style={helpers.styleOf(options.group.component)} v-slots={tabSlots}>
      {options.group.children.map((child, index) => {
        const childSlots = renderComponentSlotMap(ctx, helpers.slotsOf(child.component), { model: ctx.model, name: child.name })
        const groupName = child.name ?? index
        const isActive = activeGroupName.value === groupName
        const loaded = helpers.isGroupLoaded(groupName)
        const shouldRenderContent = !lazy || isActive || (keepAlive && loaded)

        return (
          <el-tab-pane key={groupName} label={child.title} name={groupName} {...helpers.componentProps(child.component)} v-slots={childSlots}>
            {renderSlotOrComponent(ctx, child.component, { model: ctx.model, scope: { name: child.name } })}
            {shouldRenderContent ? renderGrid(ctx, helpers.itemsOfGroup(groupName), groupName) : null}
          </el-tab-pane>
        )
      })}
    </el-tabs>
  )
}

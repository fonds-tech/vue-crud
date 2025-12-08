import type { FormRenderContext } from "../interface"
import { ElForm, ElSpace } from "element-plus"
import { renderGrid, renderTabs, renderSteps } from "./layout"

/**
 * 渲染完整表单容器，组合步骤、标签页与栅格布局。
 * @param ctx 渲染上下文，包含表单状态、配置与辅助方法
 * @returns 表单的 VNode 结构
 */
export function renderForm(ctx: FormRenderContext) {
  const { options, model, attrs, formRef, activeStepName, helpers } = ctx
  const groupType = options.group?.type
  const showTabs = groupType === "tabs"
  const showSteps = groupType === "steps"
  const stepGroupName = showSteps ? activeStepName.value : undefined
  const stepItems = showSteps ? helpers.itemsOfStep(stepGroupName) : options.items

  const inner = showTabs || showSteps
    ? (
        <ElSpace direction="vertical" fill size={24}>
          {showSteps && renderSteps(ctx)}
          {showTabs && renderTabs(ctx)}
          {!showTabs && renderGrid(ctx, stepItems, stepGroupName)}
        </ElSpace>
      )
    : renderGrid(ctx, stepItems, stepGroupName)

  return (
    <ElForm
      ref={formRef}
      key={options.key}
      class="fd-form"
      model={model}
      {...options.form}
      {...attrs}
    >
      {inner}
    </ElForm>
  )
}

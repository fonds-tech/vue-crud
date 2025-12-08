import type { Slots, VNode, Component } from "vue"
import IconTablerX from "~icons/tabler/x"
import { h } from "vue"
import { ElIcon, ElScrollbar } from "element-plus"

/**
 * 对话框渲染上下文
 * 包含渲染各区域所需的所有数据和回调
 */
export interface DialogRenderContext {
  /** 对话框标题 */
  title?: string
  /** 是否显示关闭按钮 */
  showClose: boolean
  /** 全屏按钮提示文本 */
  fullscreenLabel: string
  /** 全屏按钮图标组件 */
  fullscreenIcon: Component
  /** 内容区域固定高度 */
  scrollbarHeight?: string
  /** 内容区域最大高度（自适应模式下使用） */
  scrollbarMaxHeight?: string
  /** 组件插槽 */
  slots: Slots
  /** 全屏切换回调 */
  onToggleFullscreen: () => void
  /** 关闭对话框回调 */
  onClose: () => void
}

/**
 * 渲染对话框头部区域
 *
 * 包含以下元素：
 * - 标题文本（支持文本溢出省略）
 * - 全屏切换按钮
 * - 关闭按钮（可通过 showClose 控制显隐）
 *
 * @param ctx 渲染上下文
 * @returns 头部 VNode
 */
export function renderHeader(ctx: DialogRenderContext): VNode {
  return (
    <>
      <div class="fd-dialog__title">{ctx.title}</div>
      <div class="fd-dialog__actions">
        <div
          class="fd-dialog__action"
          role="button"
          aria-label={ctx.fullscreenLabel}
          title={ctx.fullscreenLabel}
          onClick={ctx.onToggleFullscreen}
        >
          <ElIcon>{h(ctx.fullscreenIcon)}</ElIcon>
        </div>
        {ctx.showClose && (
          <div
            class="fd-dialog__action"
            role="button"
            aria-label="关闭弹窗"
            title="关闭弹窗"
            onClick={ctx.onClose}
          >
            <ElIcon><IconTablerX /></ElIcon>
          </div>
        )}
      </div>
    </>
  )
}

/**
 * 渲染对话框内容区域
 *
 * 使用 ElScrollbar 组件包裹内容，支持：
 * - 固定高度模式：通过 scrollbarHeight 设置
 * - 自适应高度模式：通过 scrollbarMaxHeight 限制最大高度
 *
 * @param ctx 渲染上下文
 * @returns 内容区域 VNode
 */
export function renderContent(ctx: DialogRenderContext): VNode {
  return (
    <ElScrollbar height={ctx.scrollbarHeight} maxHeight={ctx.scrollbarMaxHeight}>
      <div class="fd-dialog__scrollbar" data-height={ctx.scrollbarHeight}>
        {ctx.slots.default?.()}
      </div>
    </ElScrollbar>
  )
}

/**
 * 渲染对话框底部区域
 *
 * 透传 footer 插槽内容，若未提供 footer 插槽则返回 undefined
 *
 * @param ctx 渲染上下文
 * @returns 底部 VNode 或 undefined
 */
export function renderFooter(ctx: DialogRenderContext): VNode | undefined {
  return ctx.slots.footer?.() as VNode | undefined
}

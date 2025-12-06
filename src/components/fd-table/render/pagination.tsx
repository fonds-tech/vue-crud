import { h } from "vue"
import { ElPagination } from "element-plus"

/**
 * TableFooter 组件的属性接口
 */
interface PaginationProps {
  /** 当前分页范围的起始索引 */
  paginationStart: number
  /** 当前分页范围的结束索引 */
  paginationEnd: number
  /** 已选中项目的数量 */
  selectedCount: number
  /** 传递给 ElPagination 组件的属性 */
  paginationProps: Record<string, unknown>
  /** 页码变更回调 */
  onPageChange: (page: number) => void
  /** 每页数量变更回调 */
  onPageSizeChange: (size: number) => void
}

/**
 * 渲染表格底部的分页与选中提示区域。
 * @param {PaginationProps} props - 分页配置对象，包含起止范围、选中数量、传递给 ElPagination 的属性以及页码与页容量变更回调。
 * @returns 组合提示信息与 Element Plus 分页器的表尾 VNode。
 */
export function TableFooter(props: PaginationProps) {
  // 左侧显示当前选择条数与分页范围，右侧复用 Element Plus 分页器，事件回调向上抛出
  return h("div", { class: "fd-table__footer" }, [
    h("div", { class: "fd-table__tips" }, [
      props.selectedCount > 0 ? h("span", null, `已选择 ${props.selectedCount} 条`) : null,
      h("span", null, `第 ${props.paginationStart}-${props.paginationEnd} 条`),
    ]),
    h(ElPagination, {
      ...props.paginationProps,
      onCurrentChange: (page: number) => props.onPageChange(page),
      onSizeChange: (size: number) => props.onPageSizeChange(size),
    }),
  ])
}

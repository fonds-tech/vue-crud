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
 * 渲染表格底部，包括分页和选择信息
 *
 * @param props - 底部组件的属性
 * @returns 代表表格底部的 VNode
 */
export function TableFooter(props: PaginationProps) {
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

export const components: { [key: string]: any } = {
  Crud,
  AddBtn,
  AdvBtn,
  AdvSearch,
  Flex,
  Form,
  FormTabs,
  FormCard,
  MultiDeleteBtn,
  Pagination,
  RefreshBtn,
  SearchKey,
  Table,
  Upsert,
  Dialog,
  Filter,
  Search,
  ErrorMessage,
  Row,
  ContextMenu,
}

/**
 * 注册所有全局组件到Vue应用实例。
 * @param app Vue应用实例
 */
export function useComponent(app: App): void {
  for (const i in components) {
    app.component(components[i].name, components[i])
  }
}

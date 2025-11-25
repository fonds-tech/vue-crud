export interface ContextMenuItem {
  label: string
  prefixIcon?: string
  suffixIcon?: string
  ellipsis?: boolean
  disabled?: boolean
  hidden?: boolean
  children?: ContextMenuItem[]
  showChildren?: boolean
  callback?: (close: () => void) => void
  [key: string]: any
}

export interface ContextMenuHoverOptions {
  target?: string
  className?: string
}

export interface ContextMenuOptions {
  class?: string
  list?: ContextMenuItem[]
  hover?: boolean | ContextMenuHoverOptions
}

export interface ContextMenuExpose {
  open: (event: MouseEvent, options?: ContextMenuOptions) => { close: () => void }
  close: () => void
}

import type { Ref } from "vue"

export interface DialogExpose {
  open: () => void
  close: () => void
  fullscreen: (value?: boolean) => void
  dialogVisible?: Ref<boolean>
  fullscreenActive?: Ref<boolean>
}

declare module "vue" {
  export interface GlobalComponents {
    "fd-crud": typeof import("../components/fd-crud")["default"]
    "fd-add-button": typeof import("../components/fd-add-button")["default"]
    "fd-delete-button": typeof import("../components/fd-delete-button")["default"]
    "ElDialog": typeof import("element-plus")["ElDialog"]
    "el-dialog": typeof import("element-plus")["ElDialog"]
    "fd-dialog": typeof import("../components/fd-dialog")["default"]
    "fd-form": typeof import("../components/fd-form/index.vue")["default"]
  }
}

export {}

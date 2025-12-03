declare module "vue" {
  export interface GlobalComponents {
    "fd-crud": typeof import("../components/fd-crud")["default"]
    "fd-add-button": typeof import("../components/fd-add-button/index.vue")["default"]
    "fd-delete-button": typeof import("../components/fd-delete-button/index.vue")["default"]
    "fd-grid": typeof import("../components/fd-grid/index.vue")["default"]
    "fd-grid-item": typeof import("../components/fd-grid-item/index.vue")["default"]
    "fd-search": typeof import("../components/fd-search/index.vue")["default"]
    "fd-table": typeof import("../components/fd-table/index.vue")["default"]
    "fd-detail": typeof import("../components/fd-detail/index.vue")["default"]
    "fd-dialog": typeof import("../components/fd-dialog/index.vue")["default"]
    "fd-form": typeof import("../components/fd-form/index.tsx")["default"]
    "fd-upsert": typeof import("../components/fd-upsert/index.vue")["default"]
    "fd-select": typeof import("../components/fd-select/index.vue")["default"]
    "fd-option": typeof import("../components/fd-option/index.vue")["default"]
    "fd-cascader": typeof import("../components/fd-cascader/index.vue")["default"]
    "fd-import": typeof import("../components/fd-import/index.vue")["default"]
    "fd-export": typeof import("../components/fd-export/index.vue")["default"]
    "fd-context-menu": typeof import("../components/fd-context-menu")["default"]
    "ElDialog": typeof import("element-plus")["ElDialog"]
    "el-dialog": typeof import("element-plus")["ElDialog"]
  }
}

export {}

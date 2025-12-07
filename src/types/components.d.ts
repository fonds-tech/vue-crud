declare module "vue" {
  export interface GlobalComponents {
    "fd-crud": typeof import("../components/crud")["default"]
    "fd-add-button": typeof import("../components/add-button/index.vue")["default"]
    "fd-delete-button": typeof import("../components/delete-button/index.vue")["default"]
    "fd-grid": typeof import("../components/grid")["default"]
    "fd-grid-item": typeof import("../components/grid-item")["default"]
    "fd-search": typeof import("../components/search")["default"]
    "fd-table": typeof import("../components/table/index")["default"]
    "fd-detail": typeof import("../components/detail/index.vue")["default"]
    "fd-dialog": typeof import("../components/dialog")["default"]
    "fd-form": typeof import("../components/form/form")["default"]
    "fd-upsert": typeof import("../components/upsert")["default"]
    "fd-select": typeof import("../components/select/index.vue")["default"]
    "fd-option": typeof import("../components/option/index.vue")["default"]
    "fd-cascader": typeof import("../components/cascader/index.vue")["default"]
    "fd-import": typeof import("../components/import/index.vue")["default"]
    "fd-export": typeof import("../components/export")["default"]
    "fd-context-menu": typeof import("../components/context-menu")["default"]
    "ElDialog": typeof import("element-plus")["ElDialog"]
    "el-dialog": typeof import("element-plus")["ElDialog"]
  }
}

export {}

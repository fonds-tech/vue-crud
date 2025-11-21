declare module "vue" {
  export interface GlobalComponents {
    "fd-crud": typeof import("../components/crud")["default"]
    "fd-add-button": typeof import("../components/add-button")["default"]
    "fd-delete-button": typeof import("../components/delete-button")["default"]
    "fd-dialog": typeof import("../components/dialog")["default"]
    "fd-form": typeof import("../components/form")["default"]
  }
}

export {}

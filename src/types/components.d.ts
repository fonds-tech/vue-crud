declare module "vue" {
  export interface GlobalComponents {
    FdCrud: typeof import("../components/crud")["default"]
    FdAddButton: typeof import("../components/add-button")["default"]
    FdDeleteButton: typeof import("../components/delete-button")["default"]
    FdDialog: typeof import("../components/dialog")["default"]
    "fd-crud": GlobalComponents["FdCrud"]
    "fd-add-button": GlobalComponents["FdAddButton"]
    "fd-delete-button": GlobalComponents["FdDeleteButton"]
    "fd-dialog": GlobalComponents["FdDialog"]
  }
}

export {}

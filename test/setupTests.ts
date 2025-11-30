import { vi } from "vitest"

// 提供统一的图标空实现，避免 vitest 缺少 unplugin-icons 导致解析失败
const iconStub = { default: () => null }

vi.mock("~icons/tabler/x", () => iconStub)
vi.mock("~icons/tabler/maximize", () => iconStub)
vi.mock("~icons/tabler/minimize", () => iconStub)

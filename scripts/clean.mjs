import process from "node:process"
import { rmSync } from "node:fs"
import { resolve } from "node:path"

const targets = ["dist", "types"]

for (const target of targets) {
  rmSync(resolve(process.cwd(), target), { recursive: true, force: true })
}

import { flatMap } from "lodash-es"

type DatasetRecord = Record<string, unknown>
type DatasetCursor = DatasetRecord | DatasetRecord[] | undefined

function isRecord(value: unknown): value is DatasetRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isRecordArray(value: unknown): value is DatasetRecord[] {
  return Array.isArray(value)
}

function normalizeSegments(path: string) {
  return flatMap(
    path.split(".").map((segment) => {
      if (segment.includes("[")) {
        return segment.split("[").map(token => token.replace(/"/g, ""))
      }
      return segment
    }),
  ).filter(Boolean)
}

function resolveKey(segment: string, cursor: DatasetCursor) {
  if (!segment.includes("]")) {
    return segment
  }

  const [key, value] = segment.replace("]", "").split(":")

  if (value) {
    if (!isRecordArray(cursor)) {
      return undefined
    }
    return cursor.findIndex(item => isRecord(item) && item[key] === value)
  }

  const index = Number(key)
  return Number.isNaN(index) ? undefined : index
}

function readValue(cursor: DatasetCursor, key: string | number) {
  if (typeof key === "number" && isRecordArray(cursor)) {
    return cursor[key]
  }
  if (typeof key === "string" && isRecord(cursor)) {
    return cursor[key]
  }
  return undefined
}

function writeValue(cursor: DatasetCursor, key: string | number, value: unknown) {
  if (typeof key === "number" && isRecordArray(cursor)) {
    cursor[key] = isRecord(value) ? value : {}
    return true
  }
  if (typeof key === "string" && isRecord(cursor)) {
    if (isRecord(value)) {
      const current = cursor[key]
      cursor[key] = {
        ...(isRecord(current) ? current : {}),
        ...value,
      }
    }
    else {
      cursor[key] = value
    }
    return true
  }
  return false
}

export function dataset(obj: DatasetRecord, key: string, value?: unknown): unknown {
  const isGet = value === undefined
  const segments = normalizeSegments(key)
  let cursor: DatasetCursor = obj

  try {
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const resolvedKey = resolveKey(segment, cursor)
      if (resolvedKey === undefined) {
        return {}
      }

      const isLast = i === segments.length - 1
      if (!isLast) {
        cursor = readValue(cursor, resolvedKey)
        continue
      }

      if (isGet) {
        return readValue(cursor, resolvedKey)
      }

      writeValue(cursor, resolvedKey, value)
    }
    return obj
  }
  catch {
    return {}
  }
}

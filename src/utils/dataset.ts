import { flatMap, isObject } from "lodash-es"

export function dataset(obj: any, key: string, value: any): any {
  const isGet = value === undefined
  let d = obj

  const arr = flatMap(
    key.split(".").map((e) => {
      if (e.includes("[")) {
        return e.split("[").map(item => item.replace(/"/g, ""))
      }
      return e
    }),
  )

  try {
    for (let i = 0; i < arr.length; i++) {
      const e: any = arr[i]
      let n: any = null

      if (e.includes("]")) {
        const [k, v] = e.replace("]", "").split(":")

        if (v) {
          n = d.findIndex((x: any) => x[k] === v)
        }
        else {
          n = Number(k)
        }
      }
      else {
        n = e
      }

      if (i !== arr.length - 1) {
        d = d[n]
      }
      else {
        if (isGet) {
          return d[n]
        }
        if (isObject(value)) {
          Object.assign(d[n], value)
        }
        else {
          d[n] = value
        }
      }
    }

    return obj
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e) {
    return {}
  }
}

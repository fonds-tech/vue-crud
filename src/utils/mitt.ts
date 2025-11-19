/**
 * @file mitt.ts
 * @description 一个类型安全的事件发射器实现，支持通用事件和通配符事件。
 *              每个Mitt实例拥有独立的事件存储，避免全局污染。
 */

// 事件处理函数类型，可以接受一个事件参数且不返回任何值
export type Handler<T> = (event: T) => void
// 通配符事件处理函数类型，可以接受事件类型和事件参数，不返回任何值
export type WildcardHandler<T> = (
  type: keyof T,
  event: T[keyof T],
) => void

// 特定事件类型处理函数列表
export type HandlerList<T> = Array<Handler<T>>
// 通配符事件处理函数列表
export type WildCardHandlerList<T> = Array<WildcardHandler<T>>

// 事件处理函数映射表类型，将事件名称或通配符映射到对应的处理函数列表
export type EventHandlerMap<Events extends Record<PropertyKey, unknown>> = Map<
  keyof Events | '*',
  HandlerList<Events[keyof Events]> | WildCardHandlerList<Events>
>

/**
 * Mitt 类是一个类型安全的事件发射器。
 * 每个Mitt实例都维护自己的事件监听器集合，确保实例间的事件隔离。
 * 通过泛型<Events>，可以为不同的事件定义不同的载荷类型，提供强大的类型检查。
 *
 * @template [Events=Record<string, unknown>] 一个可选的对象类型，用于定义事件名称及其对应的载荷类型。
 *                 例如：`{ 'foo': string, 'bar': number }`。
 */
export class Mitt<Events extends Record<PropertyKey, unknown> = Record<string, unknown>> {
  /**
   * 存储事件名称到处理函数列表的映射。
   * 这是每个Mitt实例私有的事件集合。
   */
  events: EventHandlerMap<Events> = new Map()

  /**
   * 注册一个事件处理函数。
   * 可以监听特定类型的事件，也可以通过'*'监听所有事件。
   *
   * @param {Key | '*'} type 要监听的事件类型，或通配符'*'。
   * @param {Handler<Events[Key]> | WildcardHandler<Events>} handler 事件触发时调用的处理函数。
   * @memberOf Mitt
   */
  on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void
  on(type: '*', handler: WildcardHandler<Events>): void
  on<Key extends keyof Events>(type: Key | '*', handler: Handler<Events[Key]> | WildcardHandler<Events>): void {
    const handlers: Array<Handler<Events[Key]> | WildcardHandler<Events>> | undefined = this.events.get(type)
    if (handlers) {
      // 如果已有处理函数列表，则添加新的处理函数
      handlers.push(handler)
    }
    else {
      // 否则，创建一个新的处理函数列表并添加处理函数
      this.events.set(type, [handler] as HandlerList<Events[keyof Events]>)
    }
  }

  /**
   * 移除一个事件处理函数。
   * 如果提供了`handler`，则只移除特定的处理函数；如果省略`handler`，则移除该类型的所有处理函数。
   *
   * @param {Key | '*'} type 要移除监听的事件类型，或通配符'*'。
   * @param {Handler<Events[Key]> | WildcardHandler<Events>} [handler] 要移除的特定处理函数。
   * @memberOf Mitt
   */
  off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]>): void
  off(type: '*', handler?: WildcardHandler<Events>): void
  off<Key extends keyof Events>(type: Key | '*', handler?: Handler<Events[Key]> | WildcardHandler<Events>): void {
    const handlers: Array<Handler<Events[Key]> | WildcardHandler<Events>> | undefined = this.events.get(type)
    if (handlers) {
      if (handler) {
        // 如果指定了处理函数，则从列表中移除它
        handlers.splice(handlers.indexOf(handler) >>> 0, 1)
      }
      else {
        // 如果未指定处理函数，则清空该类型的所有处理函数
        this.events.set(type, [])
      }
    }
  }

  /**
   * 触发一个事件，并调用所有注册的对应处理函数。
   * 如果存在通配符'*'处理函数，它们将在特定类型处理函数之后被调用。
   *
   * 注意：不支持手动触发'*'处理函数。
   *
   * @param {Key} type 要触发的事件类型。
   * @param {Events[Key]} [evt] 传递给处理函数的事件载荷（建议使用对象以增强表达力）。
   * @memberOf Mitt
   */
  emit<Key extends keyof Events>(type: Key, evt?: Events[Key]): void {
    let handlers = this.events.get(type)
    if (handlers) {
      // 调用特定事件类型的处理函数
      (handlers as HandlerList<Events[Key]>)
        .slice() // 使用slice创建副本，防止在迭代过程中修改数组
        .forEach((handler) => {
          handler(evt!)
        })
    }

    // 调用通配符事件处理函数
    handlers = this.events.get('*')
    if (handlers) {
      (handlers as WildCardHandlerList<Events>)
        .slice() // 使用slice创建副本
        .forEach((handler) => {
          handler(type, evt!)
        })
    }
  }

  /**
   * 移除此Mitt实例的所有事件处理函数。
   * @memberOf Mitt
   */
  clear(): void {
    this.events.clear()
  }
}

export default Mitt

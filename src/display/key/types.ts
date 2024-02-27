/**
 * Special keys
 */
export type KeyEventId = 'key' | 'backspace' | 'escape' | 'enter' | 'tab' | 'up' | 'down' | 'left' | 'right' | 'exit'
export type KeyEventMap<Event = any, Context = any> = Partial<Record<KeyEventId, (this: Context, event: Event) => any>>
export type KeyMap<Controller = any> = Partial<Record<KeyEventId, (this: Controller, key: string) => any>>

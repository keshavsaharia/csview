/**
 * Special keys
 */
export type KeyEvent = 'key' | 'backspace' | 'escape' | 'enter' | 'tab' | 'up' | 'down' | 'left' | 'right' | 'exit'
export type KeyMap<Controller = any> = Partial<Record<KeyEvent, (this: Controller, key: string) => any>>

// Escape sequences for 2 byte or 1 byte character width (followed by [ character)
export const ESCAPE_UTF16 = new Uint8Array([ 0x1b, 0x00, 0x5b, 0x00 ])
export const ESCAPE_UTF8 = new Uint8Array([ 0x1b, 0x5b ])

// UTF16 character references
export const SEMICOLON = new Uint8Array([ 0x3b, 0x00 ])
export const END_CURSOR_MOVE = new Uint8Array([ 0x48, 0x00 ])

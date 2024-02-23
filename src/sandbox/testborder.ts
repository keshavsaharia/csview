
console.log(`\u001b[32m
┏━━━━━━━━┱\u001b[0m──────────┬──────────┬──────────┐
\u001b[32m┃\u001b[0mtest    \u001b[32m┃\u001b[0m          │          │          │
\u001b[92m┣━━━━━━━━╉\u001b[0m──────────┼──────────┼──────────┤
\u001b[92m┃\u001b[0m        \u001b[92m┃\u001b[0m          │          │          │
\u001b[92m┣━━━━━━━━╉\u001b[0m──────────┼──────────┼──────────┤
\u001b[32m┃\u001b[0m        \u001b[32m┃\u001b[0m          │          │this text │
\u001b[32m┃\u001b[0m        \u001b[32m┃\u001b[0m          │          │wraps to… │
\u001b[92m▛▀▀▀▀▀▀▀▀▜\u001b[0m──────────┼──────────┼──────────┤
\u001b[92m▌        ▐\u001b[0m          │          │          │
\u001b[92m▙▄▄▄▄▄▄▄▄▟\u001b[0m──────────┴──────────┴──────────┘
`)
console.log(`
┏━━━━━━━━┱──────────┬──────────┬──────────┐
┃test    ┃          │          │          │
┣━━━━━━━━╉──────────┼──────────┼──────────┤
┃        ┃          │          │          │
┣━━━━━━━━╉──────────┼──────────┼──────────┤
┃        ┃          │          │this text │
┃        ┃          │          │wraps to… │
┣━━━━━━━━╉──────────┼──────────┼──────────┤
┃        ┃          │          │          │
┗━━━━━━━━┹──────────┴──────────┴──────────┘
`)
console.log(`
┌─────────┲━━━━━━━━┱──────────┬──────────┬──────────┐
│         ┃test    ┃          │          │          │
├─────────╊━━━━━━━━╉──────────┼──────────┼──────────┤
│abcdefghi┃        ┃          │          │          │
├─────────╊━━━━━━━━╉──────────┼──────────┼──────────┤
│         ┃        ┃          │          │this text │
│         ┃        ┃          │          │wraps to… │
├─────────╊━━━━━━━━╉──────────┼──────────┼──────────┤
│         ┃        ┃          │          │          │
└─────────┺━━━━━━━━┹──────────┴──────────┴──────────┘
`)
console.log(`
\u001b[90m╭─────────┬──────────┬──────────┐
│         │          │          │\u001b[0m
╞═════════╪══════════╪══════════╡▲
│         │          ├➞         │
╞═════════╪══════════╪══════════╡▼
\u001b[90m│         │          │this text │
│         │          │wraps to… │
├─────────┼──────────┼──────────┤
│         │          │          │
└─────────┴──────────┴──────────┘\u001b[0m
⒬ - quit    ⓕ  find`)

# clipse

**CLI parsing so easy** — a tiny, type-safe CLI builder for Bun & Node.

Declare your options and arguments, and clipse infers their types into a fully
typed `action` callback. Subcommands, default commands, global options,
auto-generated help, and bash completion are all included.

📖 **Documentation: <https://gouz.github.io/clipse/>**

## Install

```sh
bun add clipse   # or: npm install clipse
```

## Quick start

```ts
import { Clipse } from "clipse";

new Clipse("greet", "say hello", "1.0.0")
  .addOptions({
    loud: { short: "l", type: "boolean", description: "shout it" },
  })
  .addArguments([{ name: "who", description: "who to greet" }])
  .action((args, opts) => {
    const msg = `Hello, ${args.who ?? "world"}!`;
    console.log(opts.loud ? msg.toUpperCase() : msg);
  })
  .ready();
```

```sh
$ greet Alice --loud
HELLO, ALICE!
```

`opts.loud` is a `boolean`, `args.who` is a `string` — inferred from what you
declared. Unknown keys and wrong value types fail to compile.

## Documentation

The docs follow the [Diátaxis](https://diataxis.fr) framework:

- **[Tutorial](https://gouz.github.io/clipse/tutorials/first-cli)** — build your first CLI step by step.
- **[How-to guides](https://gouz.github.io/clipse/how-to/)** — options, arguments, subcommands, completion, and more.
- **[Reference](https://gouz.github.io/clipse/reference/)** — the full `Clipse` API and types.
- **[Explanation](https://gouz.github.io/clipse/explanation/)** — design philosophy and how type inference works.

## Contributing to the docs

```sh
bun install
bun run docs:dev     # local preview at http://localhost:5173
bun run docs:build   # production build
```

## License

[MIT](./LICENSE) © gouz

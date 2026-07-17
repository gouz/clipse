---
layout: home

hero:
  name: clipse
  text: CLI parsing so easy
  tagline: A tiny, type-safe CLI builder for Bun & Node. Declare options and arguments, get a fully typed action callback.
  actions:
    - theme: brand
      text: Build your first CLI
      link: /tutorials/first-cli
    - theme: alt
      text: How-to guides
      link: /how-to/
    - theme: alt
      text: API Reference
      link: /reference/

features:
  - title: Type-safe by design
    details: Options and arguments you declare are inferred into the action callback — wrong keys and wrong value types fail to compile.
  - title: Fluent builder
    details: Chain addOptions, addArguments, addSubcommands and action, then call ready(). That's the whole API.
  - title: Batteries included
    details: Subcommands, default commands, global options, auto-generated help, and a bash completion generator.
  - title: Zero runtime dependencies
    details: Ships as ESM + CJS with type declarations. TypeScript is the only peer dependency.
---

## Quick look

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

## Documentation, the Diátaxis way

This documentation follows the [Diátaxis](https://diataxis.fr) framework:

- **[Tutorials](/tutorials/)** — learning-oriented lessons that take you by the hand.
- **[How-to guides](/how-to/)** — recipes for solving specific problems.
- **[Reference](/reference/)** — the precise, exhaustive description of the API.
- **[Explanation](/explanation/)** — the background and design decisions.

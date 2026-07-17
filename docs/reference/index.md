# Reference

Reference is **information-oriented**: a precise, exhaustive description of the API.
For task-focused help, see the [How-to guides](/how-to/).

- **[Clipse class](/reference/clipse)** — constructor, accessors, and every method.
- **[Types](/reference/types)** — the exported type definitions.
- **[Parsing rules](/reference/parsing)** — how arguments and options are parsed.

## Installation

```sh
bun add clipse   # or: npm install clipse
```

clipse ships as ESM + CommonJS with bundled type declarations. `typescript` is a
peer dependency (`^5.8.3`).

```ts
import { Clipse } from "clipse";
```

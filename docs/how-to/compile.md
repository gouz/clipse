# Compile a standalone binary

With [Bun](https://bun.sh) you can compile a clipse CLI into a single executable
that runs without a separate runtime install.

## Build the executable

Given an entry file `index.ts` that ends with `.ready()`:

```sh
bun build ./index.ts --outfile mycli --compile --minify
```

This produces a self-contained `mycli` binary:

```sh
$ ./mycli --version
1.0.0
$ ./mycli sub --opt value
```

## As a package script

Add it to your `package.json`:

```json
{
  "scripts": {
    "make": "bun build ./index.ts --outfile mycli --compile --minify"
  }
}
```

```sh
bun run make
```

## Cross-compiling

Bun can target other platforms with `--target`:

```sh
bun build ./index.ts --outfile mycli-linux --compile --target=bun-linux-x64
bun build ./index.ts --outfile mycli-mac   --compile --target=bun-darwin-arm64
```

See the [Bun single-file executable docs](https://bun.sh/docs/bundler/executables)
for the full list of targets and flags.

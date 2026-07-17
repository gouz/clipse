// Shared base for an option definition.
type ClipseOptionBase = {
  short?: string;
  optional?: boolean;
  description?: string;
};

/**
 * A single option definition. The value type is discriminated by `type`:
 * a boolean option carries a boolean default, a string option a string default.
 */
export type ClipseOption =
  | (ClipseOptionBase & { type: "boolean"; default?: boolean })
  | (ClipseOptionBase & { type?: "string"; default?: string });

/** A map of option definitions keyed by their long name. */
export type ClipseOptions = Record<string, ClipseOption>;

/** A positional argument definition. */
export type ClipseArgument = {
  name: string;
  description?: string;
};

/** The runtime value produced for a given option definition. */
type OptionValue<O extends ClipseOption> = O["type"] extends "boolean"
  ? boolean
  : string;

/** Infer the shape of the parsed options object from an options map. */
type InferOptions<O extends ClipseOptions> = {
  [K in keyof O]: OptionValue<O[K]>;
};

/** Infer the shape of the parsed arguments object from an argument list. */
type InferArguments<A extends readonly ClipseArgument[]> = {
  [K in A[number]["name"]]: string;
};

/**
 * The action callback. `args` and `opts` are typed from the arguments and
 * options declared on the builder, so keys and value types are checked.
 */
export type ClipseFunction<
  TArgs extends Record<string, string> = Record<string, string>,
  TOpts extends Record<string, string | boolean> = Record<
    string,
    string | boolean
  >,
> = (
  args: { [K in keyof TArgs]?: string },
  opts: TOpts,
) => void | Promise<void>;

/** @deprecated Renamed to {@link ClipseOptions}. */
export type Clipse_Options = ClipseOptions;
/** @deprecated Renamed to {@link ClipseArgument}. */
export type Clipse_Argument = ClipseArgument;
/** @deprecated Renamed to {@link ClipseFunction}. */
export type Clipse_Function = ClipseFunction;

type ParsedOptions = Record<string, string | boolean | undefined>;
type ParsedArguments = Record<string, string | undefined>;

// Internal storage type for the action: values may be undefined at runtime
// (optional options/arguments), independent of the narrower public callback type.
type InternalAction = (
  args: ParsedArguments,
  opts: ParsedOptions,
) => void | Promise<void>;

// An empty object type with no index signature, so unknown keys are rejected
// while still satisfying the record constraints below.
type EmptyShape = NonNullable<unknown>;

// A type-erased handle for storing/passing subcommands whose option and
// argument shapes differ from one another.
// biome-ignore lint/suspicious/noExplicitAny: heterogeneous subcommand shapes
type AnyClipse = Clipse<any, any>;

export class Clipse<
  TOpts extends Record<string, string | boolean> = EmptyShape,
  TArgs extends Record<string, string> = EmptyShape,
> {
  #name: string;
  #description = "";
  #version = "0.0.1";
  #options: ClipseOptions = {
    help: { short: "h", description: "show help", type: "boolean" },
    version: { short: "v", description: "show version", type: "boolean" },
  };
  #globalOptions: ClipseOptions = {};
  // Maps a short flag (e.g. "o") to its long name (e.g. "opt").
  #shortMap: Record<string, string> = { h: "help", v: "version" };
  #arguments: ClipseArgument[] = [];
  #subcommands: AnyClipse[] = [];
  #action: InternalAction = async () => {};
  #parent = "";
  #defaultcmd: AnyClipse | null = null;

  constructor(name: string, description = "", version = "") {
    this.#name = name;
    this.#description = description;
    this.#version = version;
  }

  set name(name: string) {
    this.#name = name;
  }

  get name() {
    return this.#name;
  }

  set description(description: string) {
    this.#description = description;
  }

  get description() {
    return this.#description;
  }

  set version(version: string) {
    this.#version = version;
  }

  get version() {
    return this.#version;
  }

  #helpDesc(desc: string) {
    return `\x1b[3m${desc}\x1b[0m`;
  }

  #helpMain() {
    return `\n\x1b[1;36m${this.#parent}${this.#name}\x1b[0m ${this.#version}\n${this.#helpDesc(this.description)}\n`;
  }

  #helpUsage() {
    return `\nUsage: ${this.#parent}${this.#name} [options] [arguments]\n\n`;
  }

  #helpSubs() {
    let subs = "";
    if (this.#subcommands.length) {
      const maxLength =
        Math.max(...this.#subcommands.map((s) => s.name.length)) + 2;
      subs = this.#subcommands
        .map(
          (s) =>
            `  \x1b[1m${s.name.padEnd(maxLength)}\x1b[0m ${this.#helpDesc(s.description)}\n`,
        )
        .join("");
    }
    return subs !== "" ? `\x1b[4mSubcommands:\x1b[0m\n${subs}\n` : "";
  }

  #verboseOption(key: string, def: ClipseOption) {
    const short = typeof def.short !== "undefined" ? `-${def.short}, ` : "";
    const param = def.type === "boolean" ? "" : " <param>";
    return `${short}--${key}${param}`;
  }

  #helpOptions() {
    const options = [
      ...Object.entries(this.#options),
      ...Object.entries(this.#globalOptions),
    ];
    const maxLength =
      Math.max(...options.map(([k, v]) => this.#verboseOption(k, v).length)) +
      1;
    const opts = options
      .map(([k, v]) =>
        [
          `  \x1b[1m${this.#verboseOption(k, v).padEnd(maxLength)}\x1b[0m`,
          this.#helpDesc(v.description ?? ""),
          ` ${typeof v.default !== "undefined" ? `(default: ${v.default})` : ""}`,
          "\n",
        ].join(" "),
      )
      .join("");
    return opts !== "" ? `\x1b[4mOptions:\x1b[0m\n${opts}\n` : "";
  }

  #helpArguments() {
    let args = "";
    if (this.#arguments.length) {
      const maxLength =
        Math.max(...this.#arguments.map((a) => a.name.length)) + 1;
      args = this.#arguments
        .map(
          (a) =>
            `  \x1b[1m${a.name.padEnd(maxLength)}\x1b[0m ${this.#helpDesc(a.description ?? "")}\n`,
        )
        .join("");
    }
    return args !== "" ? `\x1b[4mArguments:\x1b[0m\n${args}\n` : "";
  }

  #helpCompletion() {
    return `
You can generate a completion script for your CLI by running:
\x1b[3m$ ${this.#name} generate-completion\x1b[0m
    `;
  }

  /** Build the full help text without printing it. */
  helpText() {
    return (
      this.#helpMain() +
      this.#helpUsage() +
      this.#helpSubs() +
      this.#helpOptions() +
      this.#helpArguments() +
      this.#helpCompletion()
    );
  }

  help(): never {
    console.log(this.helpText());
    process.exit(0);
  }

  #registerOptions(target: ClipseOptions, options: ClipseOptions) {
    for (const [k, v] of Object.entries(options)) {
      target[k] = v;
      if (typeof v.short !== "undefined") this.#shortMap[v.short] = k;
    }
  }

  addOptions<const O extends ClipseOptions>(
    options: O = {} as O,
  ): Clipse<TOpts & InferOptions<O>, TArgs> {
    this.#registerOptions(this.#options, options);
    return this as unknown as Clipse<TOpts & InferOptions<O>, TArgs>;
  }

  addGlobalOptions<const O extends ClipseOptions>(
    options: O = {} as O,
  ): Clipse<TOpts & InferOptions<O>, TArgs> {
    this.#registerOptions(this.#globalOptions, options);
    return this as unknown as Clipse<TOpts & InferOptions<O>, TArgs>;
  }

  addArguments<const A extends readonly ClipseArgument[]>(
    args: A,
  ): Clipse<TOpts, TArgs & InferArguments<A>> {
    this.#arguments.push(...args);
    return this as unknown as Clipse<TOpts, TArgs & InferArguments<A>>;
  }

  addSubcommands(subcommands: AnyClipse[]) {
    this.#subcommands.push(...subcommands);
    return this;
  }

  defineDefaultCommand(cmd: AnyClipse) {
    this.#defaultcmd = cmd;
    return this;
  }

  action(a: ClipseFunction<TArgs, TOpts>) {
    this.#action = a as InternalAction;
    return this;
  }

  // Resolve a long name from a short flag, throwing on an unknown flag.
  #longFromShort(short: string) {
    const long = this.#shortMap[short];
    if (typeof long === "undefined")
      throw new Error(`Unknown option: -${short}`);
    return long;
  }

  #assertKnownLong(name: string) {
    if (
      typeof this.#options[name] === "undefined" &&
      typeof this.#globalOptions[name] === "undefined"
    )
      throw new Error(`Unknown option: --${name}`);
  }

  #parseShortOptions(argv: string[], ar: string, options: ParsedOptions) {
    if (ar.includes("=")) {
      const [k, v] = ar.substring(1).split("=", 2);
      options[this.#longFromShort(k as string)] = v;
    } else {
      const shorts = ar.substring(1).split("");
      for (const [j, s] of shorts.entries()) {
        const long = this.#longFromShort(s);
        const def = this.#options[long];
        if (def?.type !== "boolean") {
          if (j === shorts.length - 1) {
            if (!argv[1]?.startsWith("-")) {
              options[long] = argv[1] ?? def?.default;
              argv.shift();
            } else {
              options[long] = def?.default;
            }
          } else {
            options[long] = def?.default;
          }
        } else {
          options[long] = true;
        }
      }
    }
    argv.shift();
  }

  #parseLongOptions(argv: string[], ar: string, options: ParsedOptions) {
    const a = ar.substring(2);
    if (a.includes("=")) {
      const [k, v] = a.split("=", 2);
      this.#assertKnownLong(k as string);
      options[k as string] = v;
    } else {
      this.#assertKnownLong(a);
      if (this.#options[a]?.type !== "boolean") {
        if (argv.length === 1) {
          options[a] = this.#options[a]?.default;
        } else {
          options[a] = argv[1];
          argv.shift();
        }
      } else {
        options[a] = true;
      }
    }
    argv.shift();
  }

  #parseOptions(argv: string[]) {
    const options: ParsedOptions = {};
    const args: string[] = [];
    while (argv.length) {
      const ar = argv[0] ?? "";
      if (ar.startsWith("--")) this.#parseLongOptions(argv, ar, options);
      else if (/^-[A-Za-z0-9=]+$/.test(ar))
        this.#parseShortOptions(argv, ar, options);
      else args.push(argv.shift() ?? "");
    }
    return { options, args };
  }

  #parseArguments(argv: string[]) {
    const args: { [key: string]: string | undefined } = {};
    for (const a of this.#arguments) {
      if (argv.length) args[a.name] = argv.shift();
    }
    return args;
  }

  getGenerationCompletionLine() {
    const allOptions = { ...this.#options, ...this.#globalOptions };
    return [
      ...new Set([
        ...this.#subcommands.map((c) => c.name),
        ...Object.keys(allOptions).map((o) => `--${o}`),
        ...Object.values(allOptions)
          .map((o) => o.short ?? "")
          .filter((f) => f !== "")
          .map((o) => `-${o}`),
      ]),
    ].join(" ");
  }

  /** Build the bash completion script without printing it. */
  generateCompletionScript() {
    return `
#!/usr/bin/env bash
_${this.#name}_completions()
{
    local cur prev

    cur=\${COMP_WORDS[COMP_CWORD]}
    prev=\${COMP_WORDS[COMP_CWORD-1]}

    case \${COMP_CWORD} in
        1)
            COMPREPLY=($(compgen -W "${this.getGenerationCompletionLine()}" -- \${cur}))
            ;;
        2)
            case \${prev} in
                ${this.#subcommands
                  .map(
                    (s) => `
                ${s.name})
                    COMPREPLY=($(compgen -W "${s.getGenerationCompletionLine()}" -- \${cur}))
                    ;;
                `,
                  )
                  .join("\n")}
            esac
            ;;
        *)
            COMPREPLY=()
            ;;
    esac
}
complete -F _${this.#name}_completions ${this.#name}
`;
  }

  #generateCompletion() {
    console.log(`Copy this into ~/.clipse.${this.#name}.bash`);
    console.log(this.generateCompletionScript());
    console.log(`Then execute: source ~/.clipse.${this.#name}.bash`);
  }

  async ready(argv: string[] = [], parent = "") {
    this.#parent = parent;
    if (argv.length === 0 && parent === "") argv.push(...process.argv.slice(2));
    const options: ParsedOptions = {};
    for (const [key, value] of Object.entries(this.#options)) {
      if (
        (typeof value.optional === "undefined" || !value.optional) &&
        !["help", "version"].includes(key)
      )
        options[key] = value.default ?? (value.type === "boolean" ? false : "");
    }
    if (argv.length) {
      if (argv[0] === "-h" || argv[0] === "--help") {
        this.help();
      }
      if (argv[0] === "-v" || argv[0] === "--version") {
        console.log(this.#version);
        process.exit(0);
      }
      const sub = this.#subcommands.find((s) => s.name === argv[0]);
      if (sub) {
        argv.shift();
        sub.addOptions(this.#globalOptions);
        await sub.ready(argv, `${this.#parent}${this.#name} `);
      } else if (argv[0] === "generate-completion") {
        this.#generateCompletion();
        process.exit(0);
      } else if (this.#defaultcmd) {
        this.#defaultcmd.addOptions(this.#globalOptions);
        await this.#defaultcmd.ready(argv, `${this.#parent}${this.#name} `);
      } else {
        const parsedOptions = this.#parseOptions([...argv]);
        const opts = {
          ...options,
          ...parsedOptions.options,
        };
        const args = this.#parseArguments([...parsedOptions.args]);
        await this.#action(args, opts);
      }
    } else if (this.#defaultcmd) {
      this.#defaultcmd.addOptions(this.#globalOptions);
      await this.#defaultcmd.ready(argv, `${this.#parent}${this.#name} `);
    } else await this.#action({}, options);
  }
}

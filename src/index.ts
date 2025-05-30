import { homedir } from "node:os";
import { writeFileSync } from "node:fs";

export type Clipse_Options = {
  [key: string]: {
    short?: string;
    long?: string;
    optional?: boolean;
    default?: string | boolean;
    description?: string;
    type?: "string" | "boolean";
  };
};

export type Clipse_Argument = {
  name: string;
  description?: string;
};

export type Clipse_Function =
  | ((
      args: { [key: string]: string | undefined },
      opts: { [key: string]: string | boolean | undefined },
    ) => Promise<void>)
  | ((
      args: { [key: string]: string | undefined },
      opts: { [key: string]: string | boolean | undefined },
    ) => void);

export class Clipse {
  #name: string;
  #description = "";
  #version = "0.0.1";
  #options: Clipse_Options = {
    help: { short: "h", description: "show help", type: "boolean" },
    version: { short: "v", description: "show version", type: "boolean" },
  };
  #arguments: Clipse_Argument[] = [];
  #subcommands: Clipse[] = [];
  #action: Clipse_Function = async () => {};
  #parent = "";

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

  #getVerboseOption(o: Clipse_Options) {
    const [k, v] = Object.entries(o).at(0) ?? [];
    if (k && v) {
      const short = typeof v.short !== "undefined" ? `-${v.short}, ` : "";
      const param = v.type === "boolean" ? "" : " <param>";
      return `${short}--${k}${param}`;
    }
    return "";
  }

  #helpOptions() {
    const options = Object.entries(this.#options).filter(
      ([_, v]) => typeof v.long === "undefined",
    );
    const maxLength =
      Math.max(
        ...options.map(([k, v]) => this.#getVerboseOption({ [k]: v }).length),
      ) + 1;
    const opts = options
      .map(([k, v]) =>
        [
          `  \x1b[1m${this.#getVerboseOption({ [k]: v }).padEnd(maxLength)}\x1b[0m`,
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

  help() {
    console.log(
      this.#helpMain() +
        this.#helpUsage() +
        this.#helpSubs() +
        this.#helpOptions() +
        this.#helpArguments() +
        this.#helpCompletion(),
    );
  }

  addOptions(options: Clipse_Options = {}) {
    Object.entries(options).forEach(([k, v], _) => {
      this.#options = { ...this.#options, [k]: v };
      if (typeof v?.short !== "undefined")
        this.#options = {
          ...this.#options,
          [v.short as string]: {
            ...v,
            long: k,
          },
        };
    });
    return this;
  }

  addArguments(args: Clipse_Argument[]) {
    this.#arguments.push(...args);
    return this;
  }

  addSubcommands(subcommands: Clipse[]) {
    this.#subcommands.push(...subcommands);
    return this;
  }

  action(a: Clipse_Function) {
    this.#action = a;
    return this;
  }

  #parseShortOptions(
    argv: string[],
    ar: string,
    options: { [key: string]: string | boolean | undefined },
  ) {
    if (ar.includes("=")) {
      const [k, v] = ar.substring(1).split("=", 2);
      options[this.#options[k as string]?.long ?? ""] = v;
    } else {
      const shorts = ar.substring(1).split("");
      shorts.forEach((s, j) => {
        if (this.#options[s]?.type !== "boolean") {
          if (j === shorts.length - 1) {
            if (!argv[1]?.startsWith("-")) {
              options[this.#options[s]?.long ?? ""] =
                argv[1] ?? this.#options[s]?.default;
              argv.shift();
            } else {
              options[this.#options[s]?.long ?? ""] = this.#options[s]?.default;
            }
          } else {
            options[this.#options[s]?.long ?? ""] = this.#options[s]?.default;
          }
        } else {
          options[this.#options[s].long ?? ""] = true;
        }
      });
    }
    argv.shift();
  }

  #parseLongOptions(
    argv: string[],
    ar: string,
    options: { [key: string]: string | boolean | undefined },
  ) {
    const a = ar.substring(2);
    if (a.includes("=")) {
      const [k, v] = a.split("=", 2);
      options[k as string] = v;
    } else if (this.#options[a]?.type !== "boolean") {
      if (argv.length === 1) {
        options[a] = this.#options[a]?.default;
      } else {
        options[a] = argv[1];
        argv.shift();
      }
    } else {
      options[a] = true;
    }
    argv.shift();
  }

  #parseOptions(argv: string[]) {
    const options: { [key: string]: string | boolean | undefined } = {};
    const args: string[] = [];
    while (argv.length) {
      const ar = argv[0] ?? "";
      if (/^-[a-z=]+$/.exec(ar)) this.#parseShortOptions(argv, ar, options);
      else if (ar.startsWith("--")) this.#parseLongOptions(argv, ar, options);
      else args.push(argv.shift() ?? "");
    }
    return { options, args };
  }

  #parseArguments(argv: string[]) {
    const args: { [key: string]: string | undefined } = {};
    this.#arguments.forEach((a, _) => {
      if (argv.length) args[a.name] = argv.shift();
    });
    return args;
  }

  getGenerationCompletionLine() {
    return [
      ...new Set([
        ...this.#subcommands.map((c) => c.name),
        ...Object.keys(this.#options).map((o) => `--${o}`),
        ...Object.values(this.#options)
          .map((o) => o.short ?? "")
          .filter((f) => f !== "")
          .map((o) => `-${o}`),
      ]),
    ].join(" ");
  }

  #generateCompletion() {
    const bash = `
#/usr/bin/env bash
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
    writeFileSync(`${homedir()}/.clipse.${this.#name}.bash`, bash, {
      flag: "w+",
    });
    console.log(`source ${homedir()}/.clipse.${this.#name}.bash`);
  }

  async ready(argv: string[] = [], parent = "") {
    this.#parent = parent;
    if (argv.length === 0 && parent === "") argv.push(...process.argv.slice(2));
    const options: { [key: string]: string | boolean | undefined } = {};
    Object.entries(this.#options).forEach(([key, value], _) => {
      if (
        typeof value.long === "undefined" &&
        (typeof value.optional === "undefined" || !value.optional) &&
        !["help", "version"].includes(key)
      )
        options[key] = value.default ?? (value.type === "boolean" ? false : "");
    });
    if (argv.length) {
      if (argv[0] === "-h" || argv[0] === "--help") {
        this.help();
        process.exit(0);
      }
      if (argv[0] === "-v" || argv[0] === "--version") {
        console.log(this.#version);
        process.exit(0);
      }
      // check if subcommand
      const sub = this.#subcommands.filter((s) => s.name === argv[0]).shift();
      if (sub) {
        argv.shift();
        sub.ready(argv, `${this.#parent}${this.#name} `);
      } else {
        if (argv[0] === "generate-completion") {
          this.#generateCompletion();
          process.exit(0);
        }
        const parsedOptions = this.#parseOptions([...argv]);
        const opts = {
          ...options,
          ...parsedOptions.options,
        };
        const args = this.#parseArguments([...parsedOptions.args]);
        await this.#action(args, opts);
      }
    } else {
      await this.#action({}, options);
    }
  }
}

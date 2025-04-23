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

export type Clipse_Function = (
  args: { [key: string]: string | undefined },
  opts: { [key: string]: string | boolean | undefined },
) => void;

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
  #action: Clipse_Function = () => {};

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
    return `\n\x1b[1;36m${this.#name}\x1b[0m ${this.#version}\n${this.#helpDesc(this.description)}\n`;
  }

  #helpUsage() {
    return `\nUsage: ${this.#name} [options] [arguments]\n\n`;
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

  #helpOptions() {
    const options = Object.entries(this.#options).filter(
      ([_, v]) => typeof v.long === "undefined",
    );
    const maxLength =
      Math.max(
        ...options.map(
          ([k, v]) =>
            `${typeof v.short !== "undefined" ? `-${v.short}, ` : ""}--${k}`
              .length,
        ),
      ) + 2;
    const opts = options
      .map(([k, v]) =>
        [
          `  \x1b[1m${`${typeof v.short !== "undefined" ? `-${v.short}, ` : ""}--${k}`.padEnd(maxLength)}\x1b[0m`,
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
        Math.max(...this.#arguments.map((a) => a.name.length)) + 2;
      args = this.#arguments
        .map(
          (a) =>
            `  \x1b[1m${a.name.padEnd(maxLength)}\x1b[0m ${this.#helpDesc(a.description ?? "")}\n`,
        )
        .join("");
    }
    return args !== "" ? `\x1b[4mArguments:\x1b[0m\n${args}\n` : "";
  }

  help() {
    console.log(
      this.#helpMain() +
        this.#helpUsage() +
        this.#helpSubs() +
        this.#helpOptions() +
        this.#helpArguments(),
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

  #parseOptions(argv: string[]) {
    const options: { [key: string]: string | boolean | undefined } = {};
    argv.forEach((ar, i) => {
      if (/^-[a-z]+$/.exec(ar)) {
        // shorts
        const shorts = ar.substring(1).split("");
        shorts.forEach((s, j) => {
          if (this.#options[s]?.type !== "boolean") {
            if (j === shorts.length - 1) {
              if (!argv[i + 1]?.startsWith("-")) {
                options[this.#options[s]?.long ?? ""] =
                  argv[i + 1] ?? this.#options[s]?.default;
                argv.splice(i + 1, 1);
              }
            } else {
              options[this.#options[s]?.long ?? ""] = this.#options[s]?.default;
            }
          } else {
            options[this.#options[s].long ?? ""] = true;
          }
        });
        argv.splice(i, 1);
      } else if (ar.startsWith("--")) {
        const a = ar.substring(2);
        if (a.includes("=")) {
          const [k, v] = a.split("=", 2);
          options[k as string] = v;
        } else if (this.#options[a]?.type !== "boolean") {
          if (i === argv.length - 1) {
            options[a] = this.#options[a]?.default;
          } else {
            options[a] = argv[i + 1];
            argv.splice(i + 1, 1);
          }
        } else {
          options[a] = true;
        }
        argv.splice(i, 1);
      } else if (ar.startsWith("-") && ar.includes("=")) {
        const [k, v] = ar.substring(1).split("=", 2);
        options[this.#options[k as string]?.long ?? ""] = v;
        argv.splice(i, 1);
      }
    });
    return options;
  }

  #parseArguments(argv: string[]) {
    const args: { [key: string]: string | undefined } = {};
    this.#arguments.forEach((a, _) => {
      if (argv.length) args[a.name] = argv.shift();
    });
    return args;
  }

  ready(argv: string[] = []) {
    if (argv.length === 0) argv.push(...Bun.argv.slice(2));
    const options: { [key: string]: string | boolean | undefined } = {};
    Object.entries(this.#options).forEach(([key, value], _) => {
      if (
        value.optional !== true &&
        typeof value.default !== "undefined" &&
        typeof value.long === "undefined"
      )
        options[key] = value.default;
    });
    if (argv.length) {
      if (argv[0] === "-h" || argv[0] === "--help") {
        this.help();
      } else if (argv[0] === "-v" || argv[0] === "--version") {
        console.log(this.#version);
      }
      // check if subcommand
      const sub = this.#subcommands.filter((s) => s.name === argv[0]).shift();
      if (sub) {
        argv.shift();
        sub.ready(argv);
      } else {
        const opts = {
          ...options,
          ...this.#parseOptions(argv),
        };
        const args = this.#parseArguments(argv);
        this.#action(args, opts);
      }
    } else {
      this.#action({}, options);
    }
  }
}

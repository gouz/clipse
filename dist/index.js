// src/index.ts
class Clipse {
  #name;
  #description = "";
  #version = "0.0.1";
  #options = {
    help: { short: "h", description: "show help", type: "boolean" },
    version: { short: "v", description: "show version", type: "boolean" }
  };
  #arguments = [];
  #subcommands = [];
  #action = async () => {};
  constructor(name, description = "", version = "") {
    this.#name = name;
    this.#description = description;
    this.#version = version;
  }
  set name(name) {
    this.#name = name;
  }
  get name() {
    return this.#name;
  }
  set description(description) {
    this.#description = description;
  }
  get description() {
    return this.#description;
  }
  set version(version) {
    this.#version = version;
  }
  get version() {
    return this.#version;
  }
  #helpDesc(desc) {
    return `\x1B[3m${desc}\x1B[0m`;
  }
  #helpMain() {
    return `
\x1B[1;36m${this.#name}\x1B[0m ${this.#version}
${this.#helpDesc(this.description)}
`;
  }
  #helpUsage() {
    return `
Usage: ${this.#name} [options] [arguments]

`;
  }
  #helpSubs() {
    let subs = "";
    if (this.#subcommands.length) {
      const maxLength = Math.max(...this.#subcommands.map((s) => s.name.length)) + 2;
      subs = this.#subcommands.map((s) => `  \x1B[1m${s.name.padEnd(maxLength)}\x1B[0m ${this.#helpDesc(s.description)}
`).join("");
    }
    return subs !== "" ? `\x1B[4mSubcommands:\x1B[0m
${subs}
` : "";
  }
  #helpOptions() {
    const options = Object.entries(this.#options).filter(([_, v]) => typeof v.long === "undefined");
    const maxLength = Math.max(...options.map(([k, v]) => `${typeof v.short !== "undefined" ? `-${v.short}, ` : ""}--${k}`.length)) + 2;
    const opts = options.map(([k, v]) => [
      `  \x1B[1m${`${typeof v.short !== "undefined" ? `-${v.short}, ` : ""}--${k}`.padEnd(maxLength)}\x1B[0m`,
      this.#helpDesc(v.description ?? ""),
      ` ${typeof v.default !== "undefined" ? `(default: ${v.default})` : ""}`,
      `
`
    ].join(" ")).join("");
    return opts !== "" ? `\x1B[4mOptions:\x1B[0m
${opts}
` : "";
  }
  #helpArguments() {
    let args = "";
    if (this.#arguments.length) {
      const maxLength = Math.max(...this.#arguments.map((a) => a.name.length)) + 2;
      args = this.#arguments.map((a) => `  \x1B[1m${a.name.padEnd(maxLength)}\x1B[0m ${this.#helpDesc(a.description ?? "")}
`).join("");
    }
    return args !== "" ? `\x1B[4mArguments:\x1B[0m
${args}
` : "";
  }
  help() {
    console.log(this.#helpMain() + this.#helpUsage() + this.#helpSubs() + this.#helpOptions() + this.#helpArguments());
  }
  addOptions(options = {}) {
    Object.entries(options).forEach(([k, v], _) => {
      this.#options = { ...this.#options, [k]: v };
      if (typeof v?.short !== "undefined")
        this.#options = {
          ...this.#options,
          [v.short]: {
            ...v,
            long: k
          }
        };
    });
    return this;
  }
  addArguments(args) {
    this.#arguments.push(...args);
    return this;
  }
  addSubcommands(subcommands) {
    this.#subcommands.push(...subcommands);
    return this;
  }
  action(a) {
    this.#action = a;
    return this;
  }
  #parseOptions(argv) {
    const options = {};
    argv.forEach((ar, i) => {
      if (/^-[a-z]+$/.exec(ar)) {
        const shorts = ar.substring(1).split("");
        shorts.forEach((s, j) => {
          if (this.#options[s]?.type !== "boolean") {
            if (j === shorts.length - 1) {
              if (!argv[i + 1]?.startsWith("-")) {
                options[this.#options[s]?.long ?? ""] = argv[i + 1] ?? this.#options[s]?.default;
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
          options[k] = v;
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
        options[this.#options[k]?.long ?? ""] = v;
        argv.splice(i, 1);
      }
    });
    return options;
  }
  #parseArguments(argv) {
    const args = {};
    this.#arguments.forEach((a, _) => {
      if (argv.length)
        args[a.name] = argv.shift();
    });
    return args;
  }
  async ready(argv = []) {
    if (argv.length === 0)
      argv.push(...process.argv.slice(2));
    const options = {};
    Object.entries(this.#options).forEach(([key, value], _) => {
      if (value.optional !== true && typeof value.default !== "undefined" && typeof value.long === "undefined")
        options[key] = value.default;
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
      const sub = this.#subcommands.filter((s) => s.name === argv[0]).shift();
      if (sub) {
        argv.shift();
        sub.ready(argv);
      } else {
        const opts = {
          ...options,
          ...this.#parseOptions(argv)
        };
        const args = this.#parseArguments(argv);
        await this.#action(args, opts);
      }
    } else {
      await this.#action({}, options);
    }
  }
}
export {
  Clipse
};

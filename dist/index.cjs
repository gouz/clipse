var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// src/index.ts
var exports_src = {};
__export(exports_src, {
  Clipse: () => Clipse
});
module.exports = __toCommonJS(exports_src);

class Clipse {
  #name;
  #description = "";
  #version = "0.0.1";
  #options = {};
  #arguments = [];
  #subcommands = [];
  #action = () => {};
  constructor(name) {
    this.#name = name;
  }
  get name() {
    return this.#name;
  }
  description(description) {
    this.#description = description;
    return this;
  }
  version(version) {
    this.#version = version;
    return this;
  }
  help() {
    console.log(`${this.#name} ${this.#version}
${this.#description}`);
  }
  addOption(option = {}) {
    this.#options = { ...this.#options, ...option };
    const opt = Object.values(option).at(0);
    if (typeof opt?.short !== "undefined")
      this.#options = {
        ...this.#options,
        [opt.short]: {
          ...opt,
          long: Object.keys(option).at(0)
        }
      };
    return this;
  }
  addOptions(options = {}) {
    Object.entries(options).forEach(([k, v], _) => {
      this.addOption({ [k]: v });
    });
    return this;
  }
  addArgument(arg) {
    this.#arguments.push(arg);
    return this;
  }
  addArguments(args) {
    this.#arguments.push(...args);
    return this;
  }
  addSubcommand(subcommand) {
    this.#subcommands.push(subcommand);
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
  ready(argv = []) {
    if (argv.length === 0)
      argv.push(...Bun.argv.slice(2));
    const options = {};
    Object.entries(this.#options).forEach(([key, value], _) => {
      if (value.optional !== true && typeof value.default !== "undefined" && typeof value.long === "undefined")
        options[key] = value.default;
    });
    if (argv.length) {
      if (argv[0] === "-h" || argv[0] === "--help") {
        this.help();
      } else if (argv[0] === "-v" || argv[0] === "--version") {
        console.log(this.#version);
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
        this.#action(args, opts);
      }
    } else {
      this.#action({}, options);
    }
  }
}

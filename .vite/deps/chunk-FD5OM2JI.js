import {
  __commonJS,
  __export,
  __publicField,
  __toESM
} from "./chunk-ZC22LKFR.js";

// browser-external:child_process
var require_child_process = __commonJS({
  "browser-external:child_process"(exports, module) {
    module.exports = Object.create(new Proxy({}, {
      get(_, key) {
        if (key !== "__esModule" && key !== "__proto__" && key !== "constructor" && key !== "splice") {
          console.warn(`Module "child_process" has been externalized for browser compatibility. Cannot access "child_process.${key}" in client code. See http://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
        }
      }
    }));
  }
});

// node_modules/@loaders.gl/loader-utils/dist/lib/env-utils/assert.js
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "loader assertion failed.");
  }
}

// node_modules/@loaders.gl/loader-utils/dist/lib/env-utils/globals.js
var globals = {
  self: typeof self !== "undefined" && self,
  window: typeof window !== "undefined" && window,
  global: typeof global !== "undefined" && global,
  document: typeof document !== "undefined" && document
};
var self_ = globals.self || globals.window || globals.global || {};
var window_ = globals.window || globals.self || globals.global || {};
var global_ = globals.global || globals.self || globals.window || {};
var document_ = globals.document || {};
var isBrowser = (
  // @ts-ignore process does not exist on browser
  Boolean(typeof process !== "object" || String(process) !== "[object process]" || process.browser)
);
var isWorker = typeof importScripts === "function";
var matches = typeof process !== "undefined" && process.version && /v([0-9]*)/.exec(process.version);
var nodeVersion = matches && parseFloat(matches[1]) || 0;

// node_modules/@loaders.gl/loader-utils/dist/lib/iterators/text-iterators.js
async function* makeTextDecoderIterator(arrayBufferIterator, options = {}) {
  const textDecoder = new TextDecoder(void 0, options);
  for await (const arrayBuffer of arrayBufferIterator) {
    yield typeof arrayBuffer === "string" ? arrayBuffer : textDecoder.decode(arrayBuffer, { stream: true });
  }
}
async function* makeTextEncoderIterator(textIterator) {
  const textEncoder = new TextEncoder();
  for await (const text of textIterator) {
    yield typeof text === "string" ? textEncoder.encode(text) : text;
  }
}
async function* makeLineIterator(textIterator) {
  let previous = "";
  for await (const textChunk of textIterator) {
    previous += textChunk;
    let eolIndex;
    while ((eolIndex = previous.indexOf("\n")) >= 0) {
      const line = previous.slice(0, eolIndex + 1);
      previous = previous.slice(eolIndex + 1);
      yield line;
    }
  }
  if (previous.length > 0) {
    yield previous;
  }
}
async function* makeNumberedLineIterator(lineIterator) {
  let counter = 1;
  for await (const line of lineIterator) {
    yield { counter, line };
    counter++;
  }
}

// node_modules/@loaders.gl/loader-utils/dist/lib/binary-utils/array-buffer-utils.js
function compareArrayBuffers(arrayBuffer1, arrayBuffer2, byteLength) {
  byteLength = byteLength || arrayBuffer1.byteLength;
  if (arrayBuffer1.byteLength < byteLength || arrayBuffer2.byteLength < byteLength) {
    return false;
  }
  const array1 = new Uint8Array(arrayBuffer1);
  const array2 = new Uint8Array(arrayBuffer2);
  for (let i = 0; i < array1.length; ++i) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}
function concatenateArrayBuffers(...sources) {
  return concatenateArrayBuffersFromArray(sources);
}
function concatenateArrayBuffersFromArray(sources) {
  const sourceArrays = sources.map((source2) => source2 instanceof ArrayBuffer ? new Uint8Array(source2) : source2);
  const byteLength = sourceArrays.reduce((length, typedArray) => length + typedArray.byteLength, 0);
  const result = new Uint8Array(byteLength);
  let offset = 0;
  for (const sourceArray of sourceArrays) {
    result.set(sourceArray, offset);
    offset += sourceArray.byteLength;
  }
  return result.buffer;
}

// node_modules/@loaders.gl/loader-utils/dist/lib/iterators/async-iteration.js
async function forEach(iterator, visitor) {
  while (true) {
    const { done, value } = await iterator.next();
    if (done) {
      iterator.return();
      return;
    }
    const cancel = visitor(value);
    if (cancel) {
      return;
    }
  }
}
async function concatenateArrayBuffersAsync(asyncIterator) {
  const arrayBuffers = [];
  for await (const chunk of asyncIterator) {
    arrayBuffers.push(chunk);
  }
  return concatenateArrayBuffers(...arrayBuffers);
}

// node_modules/@probe.gl/stats/dist/utils/hi-res-timestamp.js
function getHiResTimestamp() {
  let timestamp;
  if (typeof window !== "undefined" && window.performance) {
    timestamp = window.performance.now();
  } else if (typeof process !== "undefined" && process.hrtime) {
    const timeParts = process.hrtime();
    timestamp = timeParts[0] * 1e3 + timeParts[1] / 1e6;
  } else {
    timestamp = Date.now();
  }
  return timestamp;
}

// node_modules/@probe.gl/stats/dist/lib/stat.js
var Stat = class {
  constructor(name, type) {
    this.sampleSize = 1;
    this.time = 0;
    this.count = 0;
    this.samples = 0;
    this.lastTiming = 0;
    this.lastSampleTime = 0;
    this.lastSampleCount = 0;
    this._count = 0;
    this._time = 0;
    this._samples = 0;
    this._startTime = 0;
    this._timerPending = false;
    this.name = name;
    this.type = type;
    this.reset();
  }
  reset() {
    this.time = 0;
    this.count = 0;
    this.samples = 0;
    this.lastTiming = 0;
    this.lastSampleTime = 0;
    this.lastSampleCount = 0;
    this._count = 0;
    this._time = 0;
    this._samples = 0;
    this._startTime = 0;
    this._timerPending = false;
    return this;
  }
  setSampleSize(samples) {
    this.sampleSize = samples;
    return this;
  }
  /** Call to increment count (+1) */
  incrementCount() {
    this.addCount(1);
    return this;
  }
  /** Call to decrement count (-1) */
  decrementCount() {
    this.subtractCount(1);
    return this;
  }
  /** Increase count */
  addCount(value) {
    this._count += value;
    this._samples++;
    this._checkSampling();
    return this;
  }
  /** Decrease count */
  subtractCount(value) {
    this._count -= value;
    this._samples++;
    this._checkSampling();
    return this;
  }
  /** Add an arbitrary timing and bump the count */
  addTime(time) {
    this._time += time;
    this.lastTiming = time;
    this._samples++;
    this._checkSampling();
    return this;
  }
  /** Start a timer */
  timeStart() {
    this._startTime = getHiResTimestamp();
    this._timerPending = true;
    return this;
  }
  /** End a timer. Adds to time and bumps the timing count. */
  timeEnd() {
    if (!this._timerPending) {
      return this;
    }
    this.addTime(getHiResTimestamp() - this._startTime);
    this._timerPending = false;
    this._checkSampling();
    return this;
  }
  getSampleAverageCount() {
    return this.sampleSize > 0 ? this.lastSampleCount / this.sampleSize : 0;
  }
  /** Calculate average time / count for the previous window */
  getSampleAverageTime() {
    return this.sampleSize > 0 ? this.lastSampleTime / this.sampleSize : 0;
  }
  /** Calculate counts per second for the previous window */
  getSampleHz() {
    return this.lastSampleTime > 0 ? this.sampleSize / (this.lastSampleTime / 1e3) : 0;
  }
  getAverageCount() {
    return this.samples > 0 ? this.count / this.samples : 0;
  }
  /** Calculate average time / count */
  getAverageTime() {
    return this.samples > 0 ? this.time / this.samples : 0;
  }
  /** Calculate counts per second */
  getHz() {
    return this.time > 0 ? this.samples / (this.time / 1e3) : 0;
  }
  _checkSampling() {
    if (this._samples === this.sampleSize) {
      this.lastSampleTime = this._time;
      this.lastSampleCount = this._count;
      this.count += this._count;
      this.time += this._time;
      this.samples += this._samples;
      this._time = 0;
      this._count = 0;
      this._samples = 0;
    }
  }
};

// node_modules/@probe.gl/stats/dist/lib/stats.js
var Stats = class {
  constructor(options) {
    this.stats = {};
    this.id = options.id;
    this.stats = {};
    this._initializeStats(options.stats);
    Object.seal(this);
  }
  /** Acquire a stat. Create if it doesn't exist. */
  get(name, type = "count") {
    return this._getOrCreate({ name, type });
  }
  get size() {
    return Object.keys(this.stats).length;
  }
  /** Reset all stats */
  reset() {
    for (const stat of Object.values(this.stats)) {
      stat.reset();
    }
    return this;
  }
  forEach(fn) {
    for (const stat of Object.values(this.stats)) {
      fn(stat);
    }
  }
  getTable() {
    const table = {};
    this.forEach((stat) => {
      table[stat.name] = {
        time: stat.time || 0,
        count: stat.count || 0,
        average: stat.getAverageTime() || 0,
        hz: stat.getHz() || 0
      };
    });
    return table;
  }
  _initializeStats(stats = []) {
    stats.forEach((stat) => this._getOrCreate(stat));
  }
  _getOrCreate(stat) {
    const { name, type } = stat;
    let result = this.stats[name];
    if (!result) {
      if (stat instanceof Stat) {
        result = stat;
      } else {
        result = new Stat(name, type);
      }
      this.stats[name] = result;
    }
    return result;
  }
};

// node_modules/@loaders.gl/loader-utils/dist/lib/request-utils/request-scheduler.js
var STAT_QUEUED_REQUESTS = "Queued Requests";
var STAT_ACTIVE_REQUESTS = "Active Requests";
var STAT_CANCELLED_REQUESTS = "Cancelled Requests";
var STAT_QUEUED_REQUESTS_EVER = "Queued Requests Ever";
var STAT_ACTIVE_REQUESTS_EVER = "Active Requests Ever";
var DEFAULT_PROPS = {
  id: "request-scheduler",
  /** Specifies if the request scheduler should throttle incoming requests, mainly for comparative testing. */
  throttleRequests: true,
  /** The maximum number of simultaneous active requests. Un-throttled requests do not observe this limit. */
  maxRequests: 6,
  /**
   * Specifies a debounce time, in milliseconds. All requests are queued, until no new requests have
   * been added to the queue for this amount of time.
   */
  debounceTime: 0
};
var RequestScheduler = class {
  constructor(props = {}) {
    __publicField(this, "props");
    __publicField(this, "stats");
    __publicField(this, "activeRequestCount", 0);
    /** Tracks the number of active requests and prioritizes/cancels queued requests. */
    __publicField(this, "requestQueue", []);
    __publicField(this, "requestMap", /* @__PURE__ */ new Map());
    __publicField(this, "updateTimer", null);
    this.props = { ...DEFAULT_PROPS, ...props };
    this.stats = new Stats({ id: this.props.id });
    this.stats.get(STAT_QUEUED_REQUESTS);
    this.stats.get(STAT_ACTIVE_REQUESTS);
    this.stats.get(STAT_CANCELLED_REQUESTS);
    this.stats.get(STAT_QUEUED_REQUESTS_EVER);
    this.stats.get(STAT_ACTIVE_REQUESTS_EVER);
  }
  /**
   * Called by an application that wants to issue a request, without having it deeply queued by the browser
   *
   * When the returned promise resolved, it is OK for the application to issue a request.
   * The promise resolves to an object that contains a `done` method.
   * When the application's request has completed (or failed), the application must call the `done` function
   *
   * @param handle
   * @param getPriority will be called when request "slots" open up,
   *    allowing the caller to update priority or cancel the request
   *    Highest priority executes first, priority < 0 cancels the request
   * @returns a promise
   *   - resolves to a object (with a `done` field) when the request can be issued without queueing,
   *   - resolves to `null` if the request has been cancelled (by the callback return < 0).
   *     In this case the application should not issue the request
   */
  scheduleRequest(handle, getPriority = () => 0) {
    if (!this.props.throttleRequests) {
      return Promise.resolve({ done: () => {
      } });
    }
    if (this.requestMap.has(handle)) {
      return this.requestMap.get(handle);
    }
    const request = { handle, priority: 0, getPriority };
    const promise = new Promise((resolve2) => {
      request.resolve = resolve2;
      return request;
    });
    this.requestQueue.push(request);
    this.requestMap.set(handle, promise);
    this._issueNewRequests();
    return promise;
  }
  // PRIVATE
  _issueRequest(request) {
    const { handle, resolve: resolve2 } = request;
    let isDone = false;
    const done = () => {
      if (!isDone) {
        isDone = true;
        this.requestMap.delete(handle);
        this.activeRequestCount--;
        this._issueNewRequests();
      }
    };
    this.activeRequestCount++;
    return resolve2 ? resolve2({ done }) : Promise.resolve({ done });
  }
  /** We check requests asynchronously, to prevent multiple updates */
  _issueNewRequests() {
    if (this.updateTimer !== null) {
      clearTimeout(this.updateTimer);
    }
    this.updateTimer = setTimeout(() => this._issueNewRequestsAsync(), this.props.debounceTime);
  }
  /** Refresh all requests  */
  _issueNewRequestsAsync() {
    if (this.updateTimer !== null) {
      clearTimeout(this.updateTimer);
    }
    this.updateTimer = null;
    const freeSlots = Math.max(this.props.maxRequests - this.activeRequestCount, 0);
    if (freeSlots === 0) {
      return;
    }
    this._updateAllRequests();
    for (let i = 0; i < freeSlots; ++i) {
      const request = this.requestQueue.shift();
      if (request) {
        this._issueRequest(request);
      }
    }
  }
  /** Ensure all requests have updated priorities, and that no longer valid requests are cancelled */
  _updateAllRequests() {
    const requestQueue = this.requestQueue;
    for (let i = 0; i < requestQueue.length; ++i) {
      const request = requestQueue[i];
      if (!this._updateRequest(request)) {
        requestQueue.splice(i, 1);
        this.requestMap.delete(request.handle);
        i--;
      }
    }
    requestQueue.sort((a, b) => a.priority - b.priority);
  }
  /** Update a single request by calling the callback */
  _updateRequest(request) {
    request.priority = request.getPriority(request.handle);
    if (request.priority < 0) {
      request.resolve(null);
      return false;
    }
    return true;
  }
};

// node_modules/@loaders.gl/loader-utils/dist/lib/path-utils/file-aliases.js
var pathPrefix = "";
var fileAliases = {};
function setPathPrefix(prefix) {
  pathPrefix = prefix;
}
function getPathPrefix() {
  return pathPrefix;
}
function resolvePath(filename2) {
  for (const alias in fileAliases) {
    if (filename2.startsWith(alias)) {
      const replacement = fileAliases[alias];
      filename2 = filename2.replace(alias, replacement);
    }
  }
  if (!filename2.startsWith("http://") && !filename2.startsWith("https://")) {
    filename2 = `${pathPrefix}${filename2}`;
  }
  return filename2;
}

// node_modules/@loaders.gl/loader-utils/dist/json-loader.js
var VERSION = true ? "4.3.2" : "latest";
var JSONLoader = {
  dataType: null,
  batchType: null,
  name: "JSON",
  id: "json",
  module: "json",
  version: VERSION,
  extensions: ["json", "geojson"],
  mimeTypes: ["application/json"],
  category: "json",
  text: true,
  parseTextSync,
  parse: async (arrayBuffer) => parseTextSync(new TextDecoder().decode(arrayBuffer)),
  options: {}
};
function parseTextSync(text) {
  return JSON.parse(text);
}

// node_modules/@probe.gl/env/dist/lib/globals.js
var window_2 = globalThis;
var document_2 = globalThis.document || {};
var process_ = globalThis.process || {};
var console_ = globalThis.console;
var navigator_ = globalThis.navigator || {};

// node_modules/@probe.gl/env/dist/lib/is-electron.js
function isElectron(mockUserAgent) {
  var _a, _b;
  if (typeof window !== "undefined" && ((_a = window.process) == null ? void 0 : _a.type) === "renderer") {
    return true;
  }
  if (typeof process !== "undefined" && Boolean((_b = process.versions) == null ? void 0 : _b["electron"])) {
    return true;
  }
  const realUserAgent = typeof navigator !== "undefined" && navigator.userAgent;
  const userAgent = mockUserAgent || realUserAgent;
  return Boolean(userAgent && userAgent.indexOf("Electron") >= 0);
}

// node_modules/@probe.gl/env/dist/lib/is-browser.js
function isBrowser2() {
  const isNode = (
    // @ts-expect-error
    typeof process === "object" && String(process) === "[object process]" && !(process == null ? void 0 : process.browser)
  );
  return !isNode || isElectron();
}

// node_modules/@probe.gl/env/dist/lib/get-browser.js
function getBrowser(mockUserAgent) {
  if (!mockUserAgent && !isBrowser2()) {
    return "Node";
  }
  if (isElectron(mockUserAgent)) {
    return "Electron";
  }
  const userAgent = mockUserAgent || navigator_.userAgent || "";
  if (userAgent.indexOf("Edge") > -1) {
    return "Edge";
  }
  if (globalThis.chrome) {
    return "Chrome";
  }
  if (globalThis.safari) {
    return "Safari";
  }
  if (globalThis.mozInnerScreenX) {
    return "Firefox";
  }
  return "Unknown";
}

// node_modules/@probe.gl/env/dist/index.js
var VERSION2 = true ? "4.1.0" : "untranspiled source";

// node_modules/@probe.gl/log/dist/utils/local-storage.js
function getStorage(type) {
  try {
    const storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return storage;
  } catch (e) {
    return null;
  }
}
var LocalStorage = class {
  constructor(id, defaultConfig, type = "sessionStorage") {
    this.storage = getStorage(type);
    this.id = id;
    this.config = defaultConfig;
    this._loadConfiguration();
  }
  getConfiguration() {
    return this.config;
  }
  setConfiguration(configuration) {
    Object.assign(this.config, configuration);
    if (this.storage) {
      const serialized = JSON.stringify(this.config);
      this.storage.setItem(this.id, serialized);
    }
  }
  // Get config from persistent store, if available
  _loadConfiguration() {
    let configuration = {};
    if (this.storage) {
      const serializedConfiguration = this.storage.getItem(this.id);
      configuration = serializedConfiguration ? JSON.parse(serializedConfiguration) : {};
    }
    Object.assign(this.config, configuration);
    return this;
  }
};

// node_modules/@probe.gl/log/dist/utils/formatters.js
function formatTime(ms) {
  let formatted;
  if (ms < 10) {
    formatted = `${ms.toFixed(2)}ms`;
  } else if (ms < 100) {
    formatted = `${ms.toFixed(1)}ms`;
  } else if (ms < 1e3) {
    formatted = `${ms.toFixed(0)}ms`;
  } else {
    formatted = `${(ms / 1e3).toFixed(2)}s`;
  }
  return formatted;
}
function leftPad(string, length = 8) {
  const padLength = Math.max(length - string.length, 0);
  return `${" ".repeat(padLength)}${string}`;
}

// node_modules/@probe.gl/log/dist/utils/color.js
var COLOR;
(function(COLOR2) {
  COLOR2[COLOR2["BLACK"] = 30] = "BLACK";
  COLOR2[COLOR2["RED"] = 31] = "RED";
  COLOR2[COLOR2["GREEN"] = 32] = "GREEN";
  COLOR2[COLOR2["YELLOW"] = 33] = "YELLOW";
  COLOR2[COLOR2["BLUE"] = 34] = "BLUE";
  COLOR2[COLOR2["MAGENTA"] = 35] = "MAGENTA";
  COLOR2[COLOR2["CYAN"] = 36] = "CYAN";
  COLOR2[COLOR2["WHITE"] = 37] = "WHITE";
  COLOR2[COLOR2["BRIGHT_BLACK"] = 90] = "BRIGHT_BLACK";
  COLOR2[COLOR2["BRIGHT_RED"] = 91] = "BRIGHT_RED";
  COLOR2[COLOR2["BRIGHT_GREEN"] = 92] = "BRIGHT_GREEN";
  COLOR2[COLOR2["BRIGHT_YELLOW"] = 93] = "BRIGHT_YELLOW";
  COLOR2[COLOR2["BRIGHT_BLUE"] = 94] = "BRIGHT_BLUE";
  COLOR2[COLOR2["BRIGHT_MAGENTA"] = 95] = "BRIGHT_MAGENTA";
  COLOR2[COLOR2["BRIGHT_CYAN"] = 96] = "BRIGHT_CYAN";
  COLOR2[COLOR2["BRIGHT_WHITE"] = 97] = "BRIGHT_WHITE";
})(COLOR || (COLOR = {}));
var BACKGROUND_INCREMENT = 10;
function getColor(color) {
  if (typeof color !== "string") {
    return color;
  }
  color = color.toUpperCase();
  return COLOR[color] || COLOR.WHITE;
}
function addColor(string, color, background) {
  if (!isBrowser2 && typeof string === "string") {
    if (color) {
      const colorCode = getColor(color);
      string = `\x1B[${colorCode}m${string}\x1B[39m`;
    }
    if (background) {
      const colorCode = getColor(background);
      string = `\x1B[${colorCode + BACKGROUND_INCREMENT}m${string}\x1B[49m`;
    }
  }
  return string;
}

// node_modules/@probe.gl/log/dist/utils/autobind.js
function autobind(obj, predefined = ["constructor"]) {
  const proto = Object.getPrototypeOf(obj);
  const propNames = Object.getOwnPropertyNames(proto);
  const object = obj;
  for (const key of propNames) {
    const value = object[key];
    if (typeof value === "function") {
      if (!predefined.find((name) => key === name)) {
        object[key] = value.bind(obj);
      }
    }
  }
}

// node_modules/@probe.gl/log/dist/utils/assert.js
function assert3(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

// node_modules/@probe.gl/log/dist/utils/hi-res-timestamp.js
function getHiResTimestamp2() {
  var _a, _b, _c, _d, _e;
  let timestamp;
  if (isBrowser2() && window_2.performance) {
    timestamp = (_c = (_b = (_a = window_2) == null ? void 0 : _a.performance) == null ? void 0 : _b.now) == null ? void 0 : _c.call(_b);
  } else if ("hrtime" in process_) {
    const timeParts = (_e = (_d = process_) == null ? void 0 : _d.hrtime) == null ? void 0 : _e.call(_d);
    timestamp = timeParts[0] * 1e3 + timeParts[1] / 1e6;
  } else {
    timestamp = Date.now();
  }
  return timestamp;
}

// node_modules/@probe.gl/log/dist/log.js
var originalConsole = {
  debug: isBrowser2() ? console.debug || console.log : console.log,
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
};
var DEFAULT_LOG_CONFIGURATION = {
  enabled: true,
  level: 0
};
function noop() {
}
var cache = {};
var ONCE = { once: true };
var Log = class {
  constructor({ id } = { id: "" }) {
    this.VERSION = VERSION2;
    this._startTs = getHiResTimestamp2();
    this._deltaTs = getHiResTimestamp2();
    this.userData = {};
    this.LOG_THROTTLE_TIMEOUT = 0;
    this.id = id;
    this.userData = {};
    this._storage = new LocalStorage(`__probe-${this.id}__`, DEFAULT_LOG_CONFIGURATION);
    this.timeStamp(`${this.id} started`);
    autobind(this);
    Object.seal(this);
  }
  set level(newLevel) {
    this.setLevel(newLevel);
  }
  get level() {
    return this.getLevel();
  }
  isEnabled() {
    return this._storage.config.enabled;
  }
  getLevel() {
    return this._storage.config.level;
  }
  /** @return milliseconds, with fractions */
  getTotal() {
    return Number((getHiResTimestamp2() - this._startTs).toPrecision(10));
  }
  /** @return milliseconds, with fractions */
  getDelta() {
    return Number((getHiResTimestamp2() - this._deltaTs).toPrecision(10));
  }
  /** @deprecated use logLevel */
  set priority(newPriority) {
    this.level = newPriority;
  }
  /** @deprecated use logLevel */
  get priority() {
    return this.level;
  }
  /** @deprecated use logLevel */
  getPriority() {
    return this.level;
  }
  // Configure
  enable(enabled = true) {
    this._storage.setConfiguration({ enabled });
    return this;
  }
  setLevel(level) {
    this._storage.setConfiguration({ level });
    return this;
  }
  /** return the current status of the setting */
  get(setting) {
    return this._storage.config[setting];
  }
  // update the status of the setting
  set(setting, value) {
    this._storage.setConfiguration({ [setting]: value });
  }
  /** Logs the current settings as a table */
  settings() {
    if (console.table) {
      console.table(this._storage.config);
    } else {
      console.log(this._storage.config);
    }
  }
  // Unconditional logging
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || "Assertion failed");
    }
  }
  warn(message) {
    return this._getLogFunction(0, message, originalConsole.warn, arguments, ONCE);
  }
  error(message) {
    return this._getLogFunction(0, message, originalConsole.error, arguments);
  }
  /** Print a deprecation warning */
  deprecated(oldUsage, newUsage) {
    return this.warn(`\`${oldUsage}\` is deprecated and will be removed in a later version. Use \`${newUsage}\` instead`);
  }
  /** Print a removal warning */
  removed(oldUsage, newUsage) {
    return this.error(`\`${oldUsage}\` has been removed. Use \`${newUsage}\` instead`);
  }
  probe(logLevel, message) {
    return this._getLogFunction(logLevel, message, originalConsole.log, arguments, {
      time: true,
      once: true
    });
  }
  log(logLevel, message) {
    return this._getLogFunction(logLevel, message, originalConsole.debug, arguments);
  }
  info(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.info, arguments);
  }
  once(logLevel, message) {
    return this._getLogFunction(logLevel, message, originalConsole.debug || originalConsole.info, arguments, ONCE);
  }
  /** Logs an object as a table */
  table(logLevel, table, columns) {
    if (table) {
      return this._getLogFunction(logLevel, table, console.table || noop, columns && [columns], {
        tag: getTableHeader(table)
      });
    }
    return noop;
  }
  time(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.time ? console.time : console.info);
  }
  timeEnd(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.timeEnd ? console.timeEnd : console.info);
  }
  timeStamp(logLevel, message) {
    return this._getLogFunction(logLevel, message, console.timeStamp || noop);
  }
  group(logLevel, message, opts = { collapsed: false }) {
    const options = normalizeArguments({ logLevel, message, opts });
    const { collapsed } = opts;
    options.method = (collapsed ? console.groupCollapsed : console.group) || console.info;
    return this._getLogFunction(options);
  }
  groupCollapsed(logLevel, message, opts = {}) {
    return this.group(logLevel, message, Object.assign({}, opts, { collapsed: true }));
  }
  groupEnd(logLevel) {
    return this._getLogFunction(logLevel, "", console.groupEnd || noop);
  }
  // EXPERIMENTAL
  withGroup(logLevel, message, func) {
    this.group(logLevel, message)();
    try {
      func();
    } finally {
      this.groupEnd(logLevel)();
    }
  }
  trace() {
    if (console.trace) {
      console.trace();
    }
  }
  // PRIVATE METHODS
  /** Deduces log level from a variety of arguments */
  _shouldLog(logLevel) {
    return this.isEnabled() && this.getLevel() >= normalizeLogLevel(logLevel);
  }
  _getLogFunction(logLevel, message, method, args, opts) {
    if (this._shouldLog(logLevel)) {
      opts = normalizeArguments({ logLevel, message, args, opts });
      method = method || opts.method;
      assert3(method);
      opts.total = this.getTotal();
      opts.delta = this.getDelta();
      this._deltaTs = getHiResTimestamp2();
      const tag = opts.tag || opts.message;
      if (opts.once && tag) {
        if (!cache[tag]) {
          cache[tag] = getHiResTimestamp2();
        } else {
          return noop;
        }
      }
      message = decorateMessage(this.id, opts.message, opts);
      return method.bind(console, message, ...opts.args);
    }
    return noop;
  }
};
Log.VERSION = VERSION2;
function normalizeLogLevel(logLevel) {
  if (!logLevel) {
    return 0;
  }
  let resolvedLevel;
  switch (typeof logLevel) {
    case "number":
      resolvedLevel = logLevel;
      break;
    case "object":
      resolvedLevel = logLevel.logLevel || logLevel.priority || 0;
      break;
    default:
      return 0;
  }
  assert3(Number.isFinite(resolvedLevel) && resolvedLevel >= 0);
  return resolvedLevel;
}
function normalizeArguments(opts) {
  const { logLevel, message } = opts;
  opts.logLevel = normalizeLogLevel(logLevel);
  const args = opts.args ? Array.from(opts.args) : [];
  while (args.length && args.shift() !== message) {
  }
  switch (typeof logLevel) {
    case "string":
    case "function":
      if (message !== void 0) {
        args.unshift(message);
      }
      opts.message = logLevel;
      break;
    case "object":
      Object.assign(opts, logLevel);
      break;
    default:
  }
  if (typeof opts.message === "function") {
    opts.message = opts.message();
  }
  const messageType = typeof opts.message;
  assert3(messageType === "string" || messageType === "object");
  return Object.assign(opts, { args }, opts.opts);
}
function decorateMessage(id, message, opts) {
  if (typeof message === "string") {
    const time = opts.time ? leftPad(formatTime(opts.total)) : "";
    message = opts.time ? `${id}: ${time}  ${message}` : `${id}: ${message}`;
    message = addColor(message, opts.color, opts.background);
  }
  return message;
}
function getTableHeader(table) {
  for (const key in table) {
    for (const title in table[key]) {
      return title || "untitled";
    }
  }
  return "empty";
}

// node_modules/@probe.gl/log/dist/init.js
globalThis.probe = {};

// node_modules/@probe.gl/log/dist/index.js
var dist_default = new Log({ id: "@probe.gl/log" });

// node_modules/@loaders.gl/loader-utils/dist/lib/log-utils/log.js
var VERSION3 = true ? "4.3.2" : "latest";
var version = VERSION3[0] >= "0" && VERSION3[0] <= "9" ? `v${VERSION3}` : "";
function createLog() {
  const log2 = new Log({ id: "loaders.gl" });
  globalThis.loaders = globalThis.loaders || {};
  globalThis.loaders.log = log2;
  globalThis.loaders.version = version;
  globalThis.probe = globalThis.probe || {};
  globalThis.probe.loaders = log2;
  return log2;
}
var log = createLog();

// node_modules/@loaders.gl/loader-utils/dist/lib/option-utils/merge-loader-options.js
function mergeLoaderOptions(baseOptions, newOptions) {
  return mergeOptionsRecursively(baseOptions || {}, newOptions);
}
function mergeOptionsRecursively(baseOptions, newOptions, level = 0) {
  if (level > 3) {
    return newOptions;
  }
  const options = { ...baseOptions };
  for (const [key, newValue] of Object.entries(newOptions)) {
    if (newValue && typeof newValue === "object" && !Array.isArray(newValue)) {
      options[key] = mergeOptionsRecursively(options[key] || {}, newOptions[key], level + 1);
    } else {
      options[key] = newOptions[key];
    }
  }
  return options;
}

// node_modules/@loaders.gl/loader-utils/dist/lib/module-utils/js-module-utils.js
function registerJSModules(modules) {
  var _a;
  globalThis.loaders || (globalThis.loaders = {});
  (_a = globalThis.loaders).modules || (_a.modules = {});
  Object.assign(globalThis.loaders.modules, modules);
}

// node_modules/@loaders.gl/worker-utils/dist/lib/env-utils/version.js
var NPM_TAG = "latest";
function getVersion() {
  var _a;
  if (!((_a = globalThis._loadersgl_) == null ? void 0 : _a.version)) {
    globalThis._loadersgl_ = globalThis._loadersgl_ || {};
    if (false) {
      console.warn("loaders.gl: The __VERSION__ variable is not injected using babel plugin. Latest unstable workers would be fetched from the CDN.");
      globalThis._loadersgl_.version = NPM_TAG;
    } else {
      globalThis._loadersgl_.version = "4.3.2";
    }
  }
  return globalThis._loadersgl_.version;
}
var VERSION4 = getVersion();

// node_modules/@loaders.gl/worker-utils/dist/lib/env-utils/assert.js
function assert4(condition, message) {
  if (!condition) {
    throw new Error(message || "loaders.gl assertion failed.");
  }
}

// node_modules/@loaders.gl/worker-utils/dist/lib/env-utils/globals.js
var globals2 = {
  self: typeof self !== "undefined" && self,
  window: typeof window !== "undefined" && window,
  global: typeof global !== "undefined" && global,
  document: typeof document !== "undefined" && document
};
var self_2 = globals2.self || globals2.window || globals2.global || {};
var window_3 = globals2.window || globals2.self || globals2.global || {};
var global_3 = globals2.global || globals2.self || globals2.window || {};
var document_3 = globals2.document || {};
var isBrowser3 = (
  // @ts-ignore process.browser
  typeof process !== "object" || String(process) !== "[object process]" || process.browser
);
var isMobile2 = typeof window !== "undefined" && typeof window.orientation !== "undefined";
var matches2 = typeof process !== "undefined" && process.version && /v([0-9]*)/.exec(process.version);
var nodeVersion2 = matches2 && parseFloat(matches2[1]) || 0;

// node_modules/@loaders.gl/worker-utils/dist/lib/worker-farm/worker-job.js
var WorkerJob = class {
  constructor(jobName, workerThread) {
    __publicField(this, "name");
    __publicField(this, "workerThread");
    __publicField(this, "isRunning", true);
    /** Promise that resolves when Job is done */
    __publicField(this, "result");
    __publicField(this, "_resolve", () => {
    });
    __publicField(this, "_reject", () => {
    });
    this.name = jobName;
    this.workerThread = workerThread;
    this.result = new Promise((resolve2, reject) => {
      this._resolve = resolve2;
      this._reject = reject;
    });
  }
  /**
   * Send a message to the job's worker thread
   * @param data any data structure, ideally consisting mostly of transferrable objects
   */
  postMessage(type, payload) {
    this.workerThread.postMessage({
      source: "loaders.gl",
      // Lets worker ignore unrelated messages
      type,
      payload
    });
  }
  /**
   * Call to resolve the `result` Promise with the supplied value
   */
  done(value) {
    assert4(this.isRunning);
    this.isRunning = false;
    this._resolve(value);
  }
  /**
   * Call to reject the `result` Promise with the supplied error
   */
  error(error) {
    assert4(this.isRunning);
    this.isRunning = false;
    this._reject(error);
  }
};

// node_modules/@loaders.gl/worker-utils/dist/lib/node/worker_threads-browser.js
var NodeWorker = class {
  terminate() {
  }
};

// node_modules/@loaders.gl/worker-utils/dist/lib/worker-utils/get-loadable-worker-url.js
var workerURLCache = /* @__PURE__ */ new Map();
function getLoadableWorkerURL(props) {
  assert4(props.source && !props.url || !props.source && props.url);
  let workerURL = workerURLCache.get(props.source || props.url);
  if (!workerURL) {
    if (props.url) {
      workerURL = getLoadableWorkerURLFromURL(props.url);
      workerURLCache.set(props.url, workerURL);
    }
    if (props.source) {
      workerURL = getLoadableWorkerURLFromSource(props.source);
      workerURLCache.set(props.source, workerURL);
    }
  }
  assert4(workerURL);
  return workerURL;
}
function getLoadableWorkerURLFromURL(url) {
  if (!url.startsWith("http")) {
    return url;
  }
  const workerSource = buildScriptSource(url);
  return getLoadableWorkerURLFromSource(workerSource);
}
function getLoadableWorkerURLFromSource(workerSource) {
  const blob = new Blob([workerSource], { type: "application/javascript" });
  return URL.createObjectURL(blob);
}
function buildScriptSource(workerUrl) {
  return `try {
  importScripts('${workerUrl}');
} catch (error) {
  console.error(error);
  throw error;
}`;
}

// node_modules/@loaders.gl/worker-utils/dist/lib/worker-utils/get-transfer-list.js
function getTransferList(object, recursive = true, transfers) {
  const transfersSet = transfers || /* @__PURE__ */ new Set();
  if (!object) {
  } else if (isTransferable(object)) {
    transfersSet.add(object);
  } else if (isTransferable(object.buffer)) {
    transfersSet.add(object.buffer);
  } else if (ArrayBuffer.isView(object)) {
  } else if (recursive && typeof object === "object") {
    for (const key in object) {
      getTransferList(object[key], recursive, transfersSet);
    }
  }
  return transfers === void 0 ? Array.from(transfersSet) : [];
}
function isTransferable(object) {
  if (!object) {
    return false;
  }
  if (object instanceof ArrayBuffer) {
    return true;
  }
  if (typeof MessagePort !== "undefined" && object instanceof MessagePort) {
    return true;
  }
  if (typeof ImageBitmap !== "undefined" && object instanceof ImageBitmap) {
    return true;
  }
  if (typeof OffscreenCanvas !== "undefined" && object instanceof OffscreenCanvas) {
    return true;
  }
  return false;
}
function getTransferListForWriter(object) {
  if (object === null) {
    return {};
  }
  const clone = Object.assign({}, object);
  Object.keys(clone).forEach((key) => {
    if (typeof object[key] === "object" && !ArrayBuffer.isView(object[key]) && !(object[key] instanceof Array)) {
      clone[key] = getTransferListForWriter(object[key]);
    } else if (typeof clone[key] === "function" || clone[key] instanceof RegExp) {
      clone[key] = {};
    } else {
      clone[key] = object[key];
    }
  });
  return clone;
}

// node_modules/@loaders.gl/worker-utils/dist/lib/worker-farm/worker-thread.js
var NOOP = () => {
};
var WorkerThread = class {
  constructor(props) {
    __publicField(this, "name");
    __publicField(this, "source");
    __publicField(this, "url");
    __publicField(this, "terminated", false);
    __publicField(this, "worker");
    __publicField(this, "onMessage");
    __publicField(this, "onError");
    __publicField(this, "_loadableURL", "");
    const { name, source, url } = props;
    assert4(source || url);
    this.name = name;
    this.source = source;
    this.url = url;
    this.onMessage = NOOP;
    this.onError = (error) => console.log(error);
    this.worker = isBrowser3 ? this._createBrowserWorker() : this._createNodeWorker();
  }
  /** Checks if workers are supported on this platform */
  static isSupported() {
    return typeof Worker !== "undefined" && isBrowser3 || typeof NodeWorker !== "undefined" && !isBrowser3;
  }
  /**
   * Terminate this worker thread
   * @note Can free up significant memory
   */
  destroy() {
    this.onMessage = NOOP;
    this.onError = NOOP;
    this.worker.terminate();
    this.terminated = true;
  }
  get isRunning() {
    return Boolean(this.onMessage);
  }
  /**
   * Send a message to this worker thread
   * @param data any data structure, ideally consisting mostly of transferrable objects
   * @param transferList If not supplied, calculated automatically by traversing data
   */
  postMessage(data, transferList) {
    transferList = transferList || getTransferList(data);
    this.worker.postMessage(data, transferList);
  }
  // PRIVATE
  /**
   * Generate a standard Error from an ErrorEvent
   * @param event
   */
  _getErrorFromErrorEvent(event) {
    let message = "Failed to load ";
    message += `worker ${this.name} from ${this.url}. `;
    if (event.message) {
      message += `${event.message} in `;
    }
    if (event.lineno) {
      message += `:${event.lineno}:${event.colno}`;
    }
    return new Error(message);
  }
  /**
   * Creates a worker thread on the browser
   */
  _createBrowserWorker() {
    this._loadableURL = getLoadableWorkerURL({ source: this.source, url: this.url });
    const worker = new Worker(this._loadableURL, { name: this.name });
    worker.onmessage = (event) => {
      if (!event.data) {
        this.onError(new Error("No data received"));
      } else {
        this.onMessage(event.data);
      }
    };
    worker.onerror = (error) => {
      this.onError(this._getErrorFromErrorEvent(error));
      this.terminated = true;
    };
    worker.onmessageerror = (event) => console.error(event);
    return worker;
  }
  /**
   * Creates a worker thread in node.js
   * @todo https://nodejs.org/api/async_hooks.html#async-resource-worker-pool
   */
  _createNodeWorker() {
    let worker;
    if (this.url) {
      const absolute = this.url.includes(":/") || this.url.startsWith("/");
      const url = absolute ? this.url : `./${this.url}`;
      worker = new NodeWorker(url, { eval: false });
    } else if (this.source) {
      worker = new NodeWorker(this.source, { eval: true });
    } else {
      throw new Error("no worker");
    }
    worker.on("message", (data) => {
      this.onMessage(data);
    });
    worker.on("error", (error) => {
      this.onError(error);
    });
    worker.on("exit", (code) => {
    });
    return worker;
  }
};

// node_modules/@loaders.gl/worker-utils/dist/lib/worker-farm/worker-pool.js
var WorkerPool = class {
  /**
   * @param processor - worker function
   * @param maxConcurrency - max count of workers
   */
  constructor(props) {
    __publicField(this, "name", "unnamed");
    __publicField(this, "source");
    // | Function;
    __publicField(this, "url");
    __publicField(this, "maxConcurrency", 1);
    __publicField(this, "maxMobileConcurrency", 1);
    __publicField(this, "onDebug", () => {
    });
    __publicField(this, "reuseWorkers", true);
    __publicField(this, "props", {});
    __publicField(this, "jobQueue", []);
    __publicField(this, "idleQueue", []);
    __publicField(this, "count", 0);
    __publicField(this, "isDestroyed", false);
    this.source = props.source;
    this.url = props.url;
    this.setProps(props);
  }
  /** Checks if workers are supported on this platform */
  static isSupported() {
    return WorkerThread.isSupported();
  }
  /**
   * Terminates all workers in the pool
   * @note Can free up significant memory
   */
  destroy() {
    this.idleQueue.forEach((worker) => worker.destroy());
    this.isDestroyed = true;
  }
  setProps(props) {
    this.props = { ...this.props, ...props };
    if (props.name !== void 0) {
      this.name = props.name;
    }
    if (props.maxConcurrency !== void 0) {
      this.maxConcurrency = props.maxConcurrency;
    }
    if (props.maxMobileConcurrency !== void 0) {
      this.maxMobileConcurrency = props.maxMobileConcurrency;
    }
    if (props.reuseWorkers !== void 0) {
      this.reuseWorkers = props.reuseWorkers;
    }
    if (props.onDebug !== void 0) {
      this.onDebug = props.onDebug;
    }
  }
  async startJob(name, onMessage3 = (job, type, data) => job.done(data), onError = (job, error) => job.error(error)) {
    const startPromise = new Promise((onStart) => {
      this.jobQueue.push({ name, onMessage: onMessage3, onError, onStart });
      return this;
    });
    this._startQueuedJob();
    return await startPromise;
  }
  // PRIVATE
  /**
   * Starts first queued job if worker is available or can be created
   * Called when job is started and whenever a worker returns to the idleQueue
   */
  async _startQueuedJob() {
    if (!this.jobQueue.length) {
      return;
    }
    const workerThread = this._getAvailableWorker();
    if (!workerThread) {
      return;
    }
    const queuedJob = this.jobQueue.shift();
    if (queuedJob) {
      this.onDebug({
        message: "Starting job",
        name: queuedJob.name,
        workerThread,
        backlog: this.jobQueue.length
      });
      const job = new WorkerJob(queuedJob.name, workerThread);
      workerThread.onMessage = (data) => queuedJob.onMessage(job, data.type, data.payload);
      workerThread.onError = (error) => queuedJob.onError(job, error);
      queuedJob.onStart(job);
      try {
        await job.result;
      } catch (error) {
        console.error(`Worker exception: ${error}`);
      } finally {
        this.returnWorkerToQueue(workerThread);
      }
    }
  }
  /**
   * Returns a worker to the idle queue
   * Destroys the worker if
   *  - pool is destroyed
   *  - if this pool doesn't reuse workers
   *  - if maxConcurrency has been lowered
   * @param worker
   */
  returnWorkerToQueue(worker) {
    const shouldDestroyWorker = (
      // Workers on Node.js prevent the process from exiting.
      // Until we figure out how to close them before exit, we always destroy them
      !isBrowser3 || // If the pool is destroyed, there is no reason to keep the worker around
      this.isDestroyed || // If the app has disabled worker reuse, any completed workers should be destroyed
      !this.reuseWorkers || // If concurrency has been lowered, this worker might be surplus to requirements
      this.count > this._getMaxConcurrency()
    );
    if (shouldDestroyWorker) {
      worker.destroy();
      this.count--;
    } else {
      this.idleQueue.push(worker);
    }
    if (!this.isDestroyed) {
      this._startQueuedJob();
    }
  }
  /**
   * Returns idle worker or creates new worker if maxConcurrency has not been reached
   */
  _getAvailableWorker() {
    if (this.idleQueue.length > 0) {
      return this.idleQueue.shift() || null;
    }
    if (this.count < this._getMaxConcurrency()) {
      this.count++;
      const name = `${this.name.toLowerCase()} (#${this.count} of ${this.maxConcurrency})`;
      return new WorkerThread({ name, source: this.source, url: this.url });
    }
    return null;
  }
  _getMaxConcurrency() {
    return isMobile2 ? this.maxMobileConcurrency : this.maxConcurrency;
  }
};

// node_modules/@loaders.gl/worker-utils/dist/lib/worker-farm/worker-farm.js
var DEFAULT_PROPS2 = {
  maxConcurrency: 3,
  maxMobileConcurrency: 1,
  reuseWorkers: true,
  onDebug: () => {
  }
};
var _WorkerFarm = class _WorkerFarm {
  /** get global instance with WorkerFarm.getWorkerFarm() */
  constructor(props) {
    __publicField(this, "props");
    __publicField(this, "workerPools", /* @__PURE__ */ new Map());
    this.props = { ...DEFAULT_PROPS2 };
    this.setProps(props);
    this.workerPools = /* @__PURE__ */ new Map();
  }
  /** Checks if workers are supported on this platform */
  static isSupported() {
    return WorkerThread.isSupported();
  }
  /** Get the singleton instance of the global worker farm */
  static getWorkerFarm(props = {}) {
    _WorkerFarm._workerFarm = _WorkerFarm._workerFarm || new _WorkerFarm({});
    _WorkerFarm._workerFarm.setProps(props);
    return _WorkerFarm._workerFarm;
  }
  /**
   * Terminate all workers in the farm
   * @note Can free up significant memory
   */
  destroy() {
    for (const workerPool of this.workerPools.values()) {
      workerPool.destroy();
    }
    this.workerPools = /* @__PURE__ */ new Map();
  }
  /**
   * Set props used when initializing worker pools
   * @param props
   */
  setProps(props) {
    this.props = { ...this.props, ...props };
    for (const workerPool of this.workerPools.values()) {
      workerPool.setProps(this._getWorkerPoolProps());
    }
  }
  /**
   * Returns a worker pool for the specified worker
   * @param options - only used first time for a specific worker name
   * @param options.name - the name of the worker - used to identify worker pool
   * @param options.url -
   * @param options.source -
   * @example
   *   const job = WorkerFarm.getWorkerFarm().getWorkerPool({name, url}).startJob(...);
   */
  getWorkerPool(options) {
    const { name, source, url } = options;
    let workerPool = this.workerPools.get(name);
    if (!workerPool) {
      workerPool = new WorkerPool({
        name,
        source,
        url
      });
      workerPool.setProps(this._getWorkerPoolProps());
      this.workerPools.set(name, workerPool);
    }
    return workerPool;
  }
  _getWorkerPoolProps() {
    return {
      maxConcurrency: this.props.maxConcurrency,
      maxMobileConcurrency: this.props.maxMobileConcurrency,
      reuseWorkers: this.props.reuseWorkers,
      onDebug: this.props.onDebug
    };
  }
};
// singleton
__publicField(_WorkerFarm, "_workerFarm");
var WorkerFarm = _WorkerFarm;

// node_modules/@loaders.gl/worker-utils/dist/lib/worker-api/get-worker-url.js
function getWorkerName(worker) {
  const warning = worker.version !== VERSION4 ? ` (worker-utils@${VERSION4})` : "";
  return `${worker.name}@${worker.version}${warning}`;
}
function getWorkerURL(worker, options = {}) {
  const workerOptions = options[worker.id] || {};
  const workerFile = isBrowser3 ? `${worker.id}-worker.js` : `${worker.id}-worker-node.js`;
  let url = workerOptions.workerUrl;
  if (!url && worker.id === "compression") {
    url = options.workerUrl;
  }
  if (options._workerType === "test") {
    if (isBrowser3) {
      url = `modules/${worker.module}/dist/${workerFile}`;
    } else {
      url = `modules/${worker.module}/src/workers/${worker.id}-worker-node.ts`;
    }
  }
  if (!url) {
    let version2 = worker.version;
    if (version2 === "latest") {
      version2 = NPM_TAG;
    }
    const versionTag = version2 ? `@${version2}` : "";
    url = `https://unpkg.com/@loaders.gl/${worker.module}${versionTag}/dist/${workerFile}`;
  }
  assert4(url);
  return url;
}

// node_modules/@loaders.gl/worker-utils/dist/lib/worker-api/process-on-worker.js
async function processOnWorker(worker, data, options = {}, context = {}) {
  const name = getWorkerName(worker);
  const workerFarm = WorkerFarm.getWorkerFarm(options);
  const { source } = options;
  const workerPoolProps = { name, source };
  if (!source) {
    workerPoolProps.url = getWorkerURL(worker, options);
  }
  const workerPool = workerFarm.getWorkerPool(workerPoolProps);
  const jobName = options.jobName || worker.name;
  const job = await workerPool.startJob(
    jobName,
    // eslint-disable-next-line
    onMessage.bind(null, context)
  );
  const transferableOptions = getTransferListForWriter(options);
  job.postMessage("process", { input: data, options: transferableOptions });
  const result = await job.result;
  return result.result;
}
async function onMessage(context, job, type, payload) {
  switch (type) {
    case "done":
      job.done(payload);
      break;
    case "error":
      job.error(new Error(payload.error));
      break;
    case "process":
      const { id, input, options } = payload;
      try {
        if (!context.process) {
          job.postMessage("error", { id, error: "Worker not set up to process on main thread" });
          return;
        }
        const result = await context.process(input, options);
        job.postMessage("done", { id, result });
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error";
        job.postMessage("error", { id, error: message });
      }
      break;
    default:
      console.warn(`process-on-worker: unknown message ${type}`);
  }
}

// node_modules/@loaders.gl/worker-utils/dist/lib/async-queue/async-queue.js
var AsyncQueue = class {
  constructor() {
    __publicField(this, "_values");
    __publicField(this, "_settlers");
    __publicField(this, "_closed");
    this._values = [];
    this._settlers = [];
    this._closed = false;
  }
  /** Return an async iterator for this queue */
  [Symbol.asyncIterator]() {
    return this;
  }
  /** Push a new value - the async iterator will yield a promise resolved to this value */
  push(value) {
    return this.enqueue(value);
  }
  /**
   * Push a new value - the async iterator will yield a promise resolved to this value
   * Add an error - the async iterator will yield a promise rejected with this value
   */
  enqueue(value) {
    if (this._closed) {
      throw new Error("Closed");
    }
    if (this._settlers.length > 0) {
      if (this._values.length > 0) {
        throw new Error("Illegal internal state");
      }
      const settler = this._settlers.shift();
      if (value instanceof Error) {
        settler.reject(value);
      } else {
        settler.resolve({ value });
      }
    } else {
      this._values.push(value);
    }
  }
  /** Indicate that we not waiting for more values - The async iterator will be done */
  close() {
    while (this._settlers.length > 0) {
      const settler = this._settlers.shift();
      settler.resolve({ done: true });
    }
    this._closed = true;
  }
  // ITERATOR IMPLEMENTATION
  /** @returns a Promise for an IteratorResult */
  next() {
    if (this._values.length > 0) {
      const value = this._values.shift();
      if (value instanceof Error) {
        return Promise.reject(value);
      }
      return Promise.resolve({ done: false, value });
    }
    if (this._closed) {
      if (this._settlers.length > 0) {
        throw new Error("Illegal internal state");
      }
      return Promise.resolve({ done: true, value: void 0 });
    }
    return new Promise((resolve2, reject) => {
      this._settlers.push({ resolve: resolve2, reject });
    });
  }
};

// node_modules/@loaders.gl/worker-utils/dist/lib/worker-api/validate-worker-version.js
function validateWorkerVersion(worker, coreVersion = VERSION4) {
  assert4(worker, "no worker provided");
  const workerVersion = worker.version;
  if (!coreVersion || !workerVersion) {
    return false;
  }
  return true;
}

// node_modules/@loaders.gl/worker-utils/dist/lib/process-utils/child-process-proxy.js
var ChildProcess2 = __toESM(require_child_process(), 1);

// node_modules/@loaders.gl/worker-utils/dist/lib/process-utils/process-utils.js
var import_child_process = __toESM(require_child_process(), 1);

// node_modules/@loaders.gl/loader-utils/dist/lib/worker-loader-utils/parse-with-worker.js
function canParseWithWorker(loader, options) {
  if (!WorkerFarm.isSupported()) {
    return false;
  }
  if (!isBrowser3 && !(options == null ? void 0 : options._nodeWorkers)) {
    return false;
  }
  return loader.worker && (options == null ? void 0 : options.worker);
}
async function parseWithWorker(loader, data, options, context, parseOnMainThread) {
  const name = loader.id;
  const url = getWorkerURL(loader, options);
  const workerFarm = WorkerFarm.getWorkerFarm(options);
  const workerPool = workerFarm.getWorkerPool({ name, url });
  options = JSON.parse(JSON.stringify(options));
  context = JSON.parse(JSON.stringify(context || {}));
  const job = await workerPool.startJob(
    "process-on-worker",
    // @ts-expect-error
    onMessage2.bind(null, parseOnMainThread)
    // eslint-disable-line @typescript-eslint/no-misused-promises
  );
  job.postMessage("process", {
    // @ts-ignore
    input: data,
    options,
    context
  });
  const result = await job.result;
  return await result.result;
}
async function onMessage2(parseOnMainThread, job, type, payload) {
  switch (type) {
    case "done":
      job.done(payload);
      break;
    case "error":
      job.error(new Error(payload.error));
      break;
    case "process":
      const { id, input, options } = payload;
      try {
        const result = await parseOnMainThread(input, options);
        job.postMessage("done", { id, result });
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error";
        job.postMessage("error", { id, error: message });
      }
      break;
    default:
      console.warn(`parse-with-worker unknown message ${type}`);
  }
}

// node_modules/@loaders.gl/loader-utils/dist/lib/worker-loader-utils/encode-with-worker.js
function canEncodeWithWorker(writer, options) {
  if (!WorkerFarm.isSupported()) {
    return false;
  }
  if (!isBrowser && !(options == null ? void 0 : options._nodeWorkers)) {
    return false;
  }
  return writer.worker && (options == null ? void 0 : options.worker);
}

// node_modules/@loaders.gl/loader-utils/dist/lib/node/buffer.browser.js
function toArrayBuffer(buffer) {
  return buffer;
}

// node_modules/@loaders.gl/loader-utils/dist/lib/binary-utils/memory-conversion-utils.js
function isBuffer(value) {
  return value && typeof value === "object" && value.isBuffer;
}
function toArrayBuffer2(data) {
  if (isBuffer(data)) {
    return toArrayBuffer(data);
  }
  if (data instanceof ArrayBuffer) {
    return data;
  }
  if (ArrayBuffer.isView(data)) {
    if (data.byteOffset === 0 && data.byteLength === data.buffer.byteLength) {
      return data.buffer;
    }
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  }
  if (typeof data === "string") {
    const text = data;
    const uint8Array = new TextEncoder().encode(text);
    return uint8Array.buffer;
  }
  if (data && typeof data === "object" && data._toArrayBuffer) {
    return data._toArrayBuffer();
  }
  throw new Error("toArrayBuffer");
}

// node_modules/@loaders.gl/loader-utils/dist/lib/path-utils/path.js
var path_exports = {};
__export(path_exports, {
  dirname: () => dirname,
  filename: () => filename,
  join: () => join,
  resolve: () => resolve
});

// node_modules/@loaders.gl/loader-utils/dist/lib/path-utils/get-cwd.js
function getCWD() {
  var _a;
  if (typeof process !== "undefined" && typeof process.cwd !== "undefined") {
    return process.cwd();
  }
  const pathname = (_a = window.location) == null ? void 0 : _a.pathname;
  return (pathname == null ? void 0 : pathname.slice(0, pathname.lastIndexOf("/") + 1)) || "";
}

// node_modules/@loaders.gl/loader-utils/dist/lib/path-utils/path.js
function filename(url) {
  const slashIndex = url ? url.lastIndexOf("/") : -1;
  return slashIndex >= 0 ? url.substr(slashIndex + 1) : "";
}
function dirname(url) {
  const slashIndex = url ? url.lastIndexOf("/") : -1;
  return slashIndex >= 0 ? url.substr(0, slashIndex) : "";
}
function join(...parts) {
  const separator = "/";
  parts = parts.map((part, index) => {
    if (index) {
      part = part.replace(new RegExp(`^${separator}`), "");
    }
    if (index !== parts.length - 1) {
      part = part.replace(new RegExp(`${separator}$`), "");
    }
    return part;
  });
  return parts.join(separator);
}
function resolve(...components) {
  const paths = [];
  for (let _i = 0; _i < components.length; _i++) {
    paths[_i] = components[_i];
  }
  let resolvedPath = "";
  let resolvedAbsolute = false;
  let cwd;
  for (let i = paths.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    let path;
    if (i >= 0) {
      path = paths[i];
    } else {
      if (cwd === void 0) {
        cwd = getCWD();
      }
      path = cwd;
    }
    if (path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = path.charCodeAt(0) === SLASH;
  }
  resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute) {
    return `/${resolvedPath}`;
  } else if (resolvedPath.length > 0) {
    return resolvedPath;
  }
  return ".";
}
var SLASH = 47;
var DOT = 46;
function normalizeStringPosix(path, allowAboveRoot) {
  let res = "";
  let lastSlash = -1;
  let dots = 0;
  let code;
  let isAboveRoot = false;
  for (let i = 0; i <= path.length; ++i) {
    if (i < path.length) {
      code = path.charCodeAt(i);
    } else if (code === SLASH) {
      break;
    } else {
      code = SLASH;
    }
    if (code === SLASH) {
      if (lastSlash === i - 1 || dots === 1) {
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || !isAboveRoot || res.charCodeAt(res.length - 1) !== DOT || res.charCodeAt(res.length - 2) !== DOT) {
          if (res.length > 2) {
            const start = res.length - 1;
            let j = start;
            for (; j >= 0; --j) {
              if (res.charCodeAt(j) === SLASH) {
                break;
              }
            }
            if (j !== start) {
              res = j === -1 ? "" : res.slice(0, j);
              lastSlash = i;
              dots = 0;
              isAboveRoot = false;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = "";
            lastSlash = i;
            dots = 0;
            isAboveRoot = false;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0) {
            res += "/..";
          } else {
            res = "..";
          }
          isAboveRoot = true;
        }
      } else {
        const slice = path.slice(lastSlash + 1, i);
        if (res.length > 0) {
          res += `/${slice}`;
        } else {
          res = slice;
        }
        isAboveRoot = false;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

// node_modules/@loaders.gl/loader-utils/dist/lib/files/blob-file.js
var BlobFile = class {
  constructor(blob) {
    __publicField(this, "handle");
    __publicField(this, "size");
    __publicField(this, "bigsize");
    __publicField(this, "url");
    this.handle = blob instanceof ArrayBuffer ? new Blob([blob]) : blob;
    this.size = blob instanceof ArrayBuffer ? blob.byteLength : blob.size;
    this.bigsize = BigInt(this.size);
    this.url = blob instanceof File ? blob.name : "";
  }
  async close() {
  }
  async stat() {
    return {
      size: this.handle.size,
      bigsize: BigInt(this.handle.size),
      isDirectory: false
    };
  }
  async read(start, length) {
    const arrayBuffer = await this.handle.slice(Number(start), Number(start) + Number(length)).arrayBuffer();
    return arrayBuffer;
  }
};

// node_modules/@loaders.gl/loader-utils/dist/lib/files/node-file-facade.js
var NOT_IMPLEMENTED = new Error("Not implemented");
var NodeFileFacade = class {
  constructor(url, flags, mode) {
    __publicField(this, "handle");
    __publicField(this, "size", 0);
    __publicField(this, "bigsize", 0n);
    __publicField(this, "url", "");
    var _a;
    if ((_a = globalThis.loaders) == null ? void 0 : _a.NodeFile) {
      return new globalThis.loaders.NodeFile(url, flags, mode);
    }
    if (isBrowser) {
      throw new Error("Can't instantiate NodeFile in browser.");
    }
    throw new Error("Can't instantiate NodeFile. Make sure to import @loaders.gl/polyfills first.");
  }
  /** Read data */
  async read(start, length) {
    throw NOT_IMPLEMENTED;
  }
  /** Write to file. The number of bytes written will be returned */
  async write(arrayBuffer, offset, length) {
    throw NOT_IMPLEMENTED;
  }
  /** Get information about file */
  async stat() {
    throw NOT_IMPLEMENTED;
  }
  /** Truncates the file descriptor. Only available on NodeFile. */
  async truncate(length) {
    throw NOT_IMPLEMENTED;
  }
  /** Append data to a file. Only available on NodeFile. */
  async append(data) {
    throw NOT_IMPLEMENTED;
  }
  /** Close the file */
  async close() {
  }
};

// node_modules/@loaders.gl/loader-utils/dist/lib/filesystems/node-filesystem-facade.js
var NOT_IMPLEMENTED2 = new Error("Not implemented");

export {
  assert,
  self_,
  window_,
  global_,
  document_,
  isBrowser,
  isWorker,
  isBrowser2,
  getBrowser,
  Log,
  log,
  mergeLoaderOptions,
  registerJSModules,
  assert4 as assert2,
  processOnWorker,
  validateWorkerVersion,
  canParseWithWorker,
  parseWithWorker,
  canEncodeWithWorker,
  compareArrayBuffers,
  concatenateArrayBuffers,
  makeTextDecoderIterator,
  makeTextEncoderIterator,
  makeLineIterator,
  makeNumberedLineIterator,
  forEach,
  concatenateArrayBuffersAsync,
  Stats,
  RequestScheduler,
  setPathPrefix,
  getPathPrefix,
  resolvePath,
  JSONLoader,
  toArrayBuffer2 as toArrayBuffer,
  path_exports,
  BlobFile,
  NodeFileFacade
};
//# sourceMappingURL=chunk-FD5OM2JI.js.map

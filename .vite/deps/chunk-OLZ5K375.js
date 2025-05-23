import {
  BlobFile,
  Log,
  NodeFileFacade,
  assert,
  assert2,
  canEncodeWithWorker,
  canParseWithWorker,
  compareArrayBuffers,
  concatenateArrayBuffers,
  concatenateArrayBuffersAsync,
  isBrowser,
  log,
  mergeLoaderOptions,
  parseWithWorker,
  path_exports,
  processOnWorker,
  registerJSModules,
  resolvePath,
  toArrayBuffer,
  validateWorkerVersion
} from "./chunk-FD5OM2JI.js";
import {
  __publicField
} from "./chunk-ZC22LKFR.js";

// node_modules/@loaders.gl/core/dist/javascript-utils/is-type.js
var isBoolean = (x) => typeof x === "boolean";
var isFunction = (x) => typeof x === "function";
var isObject = (x) => x !== null && typeof x === "object";
var isPureObject = (x) => isObject(x) && x.constructor === {}.constructor;
var isPromise = (x) => isObject(x) && isFunction(x.then);
var isIterable = (x) => Boolean(x) && typeof x[Symbol.iterator] === "function";
var isAsyncIterable = (x) => x && typeof x[Symbol.asyncIterator] === "function";
var isIterator = (x) => x && isFunction(x.next);
var isResponse = (x) => typeof Response !== "undefined" && x instanceof Response || x && x.arrayBuffer && x.text && x.json;
var isBlob = (x) => typeof Blob !== "undefined" && x instanceof Blob;
var isBuffer = (x) => x && typeof x === "object" && x.isBuffer;
var isWritableDOMStream = (x) => isObject(x) && isFunction(x.abort) && isFunction(x.getWriter);
var isReadableDOMStream = (x) => typeof ReadableStream !== "undefined" && x instanceof ReadableStream || isObject(x) && isFunction(x.tee) && isFunction(x.cancel) && isFunction(x.getReader);
var isWritableNodeStream = (x) => isObject(x) && isFunction(x.end) && isFunction(x.write) && isBoolean(x.writable);
var isReadableNodeStream = (x) => isObject(x) && isFunction(x.read) && isFunction(x.pipe) && isBoolean(x.readable);
var isReadableStream = (x) => isReadableDOMStream(x) || isReadableNodeStream(x);
var isWritableStream = (x) => isWritableDOMStream(x) || isWritableNodeStream(x);

// node_modules/@loaders.gl/core/dist/lib/fetch/fetch-error.js
var FetchError = class extends Error {
  constructor(message, info) {
    super(message);
    /** A best effort reason for why the fetch failed */
    __publicField(this, "reason");
    /** The URL that failed to load. Empty string if not available. */
    __publicField(this, "url");
    /** The Response object, if any. */
    __publicField(this, "response");
    this.reason = info.reason;
    this.url = info.url;
    this.response = info.response;
  }
};

// node_modules/@loaders.gl/core/dist/lib/utils/mime-type-utils.js
var DATA_URL_PATTERN = /^data:([-\w.]+\/[-\w.+]+)(;|,)/;
var MIME_TYPE_PATTERN = /^([-\w.]+\/[-\w.+]+)/;
function compareMIMETypes(mimeType1, mimeType2) {
  if (mimeType1.toLowerCase() === mimeType2.toLowerCase()) {
    return true;
  }
  return false;
}
function parseMIMEType(mimeString) {
  const matches = MIME_TYPE_PATTERN.exec(mimeString);
  if (matches) {
    return matches[1];
  }
  return mimeString;
}
function parseMIMETypeFromURL(url) {
  const matches = DATA_URL_PATTERN.exec(url);
  if (matches) {
    return matches[1];
  }
  return "";
}

// node_modules/@loaders.gl/core/dist/lib/utils/url-utils.js
var QUERY_STRING_PATTERN = /\?.*/;
function extractQueryString(url) {
  const matches = url.match(QUERY_STRING_PATTERN);
  return matches && matches[0];
}
function stripQueryString(url) {
  return url.replace(QUERY_STRING_PATTERN, "");
}
function shortenUrlForDisplay(url) {
  if (url.length < 50) {
    return url;
  }
  const urlEnd = url.slice(url.length - 15);
  const urlStart = url.substr(0, 32);
  return `${urlStart}...${urlEnd}`;
}

// node_modules/@loaders.gl/core/dist/lib/utils/resource-utils.js
function getResourceUrl(resource) {
  if (isResponse(resource)) {
    const response = resource;
    return response.url;
  }
  if (isBlob(resource)) {
    const blob = resource;
    return blob.name || "";
  }
  if (typeof resource === "string") {
    return resource;
  }
  return "";
}
function getResourceMIMEType(resource) {
  if (isResponse(resource)) {
    const response = resource;
    const contentTypeHeader = response.headers.get("content-type") || "";
    const noQueryUrl = stripQueryString(response.url);
    return parseMIMEType(contentTypeHeader) || parseMIMETypeFromURL(noQueryUrl);
  }
  if (isBlob(resource)) {
    const blob = resource;
    return blob.type || "";
  }
  if (typeof resource === "string") {
    return parseMIMETypeFromURL(resource);
  }
  return "";
}
function getResourceContentLength(resource) {
  if (isResponse(resource)) {
    const response = resource;
    return response.headers["content-length"] || -1;
  }
  if (isBlob(resource)) {
    const blob = resource;
    return blob.size;
  }
  if (typeof resource === "string") {
    return resource.length;
  }
  if (resource instanceof ArrayBuffer) {
    return resource.byteLength;
  }
  if (ArrayBuffer.isView(resource)) {
    return resource.byteLength;
  }
  return -1;
}

// node_modules/@loaders.gl/core/dist/lib/utils/response-utils.js
async function makeResponse(resource) {
  if (isResponse(resource)) {
    return resource;
  }
  const headers = {};
  const contentLength = getResourceContentLength(resource);
  if (contentLength >= 0) {
    headers["content-length"] = String(contentLength);
  }
  const url = getResourceUrl(resource);
  const type = getResourceMIMEType(resource);
  if (type) {
    headers["content-type"] = type;
  }
  const initialDataUrl = await getInitialDataUrl(resource);
  if (initialDataUrl) {
    headers["x-first-bytes"] = initialDataUrl;
  }
  if (typeof resource === "string") {
    resource = new TextEncoder().encode(resource);
  }
  const response = new Response(resource, { headers });
  Object.defineProperty(response, "url", { value: url });
  return response;
}
async function checkResponse(response) {
  if (!response.ok) {
    const error = await getResponseError(response);
    throw error;
  }
}
async function getResponseError(response) {
  const shortUrl = shortenUrlForDisplay(response.url);
  let message = `Failed to fetch resource (${response.status}) ${response.statusText}: ${shortUrl}`;
  message = message.length > 100 ? `${message.slice(0, 100)}...` : message;
  const info = {
    reason: response.statusText,
    url: response.url,
    response
  };
  try {
    const contentType = response.headers.get("Content-Type");
    info.reason = !response.bodyUsed && (contentType == null ? void 0 : contentType.includes("application/json")) ? await response.json() : await response.text();
  } catch (error) {
  }
  return new FetchError(message, info);
}
async function getInitialDataUrl(resource) {
  const INITIAL_DATA_LENGTH = 5;
  if (typeof resource === "string") {
    return `data:,${resource.slice(0, INITIAL_DATA_LENGTH)}`;
  }
  if (resource instanceof Blob) {
    const blobSlice = resource.slice(0, 5);
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        var _a;
        return resolve((_a = event == null ? void 0 : event.target) == null ? void 0 : _a.result);
      };
      reader.readAsDataURL(blobSlice);
    });
  }
  if (resource instanceof ArrayBuffer) {
    const slice = resource.slice(0, INITIAL_DATA_LENGTH);
    const base64 = arrayBufferToBase64(slice);
    return `data:base64,${base64}`;
  }
  return null;
}
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// node_modules/@loaders.gl/core/dist/lib/fetch/fetch-file.js
function isNodePath(url) {
  return !isRequestURL(url) && !isDataURL(url);
}
function isRequestURL(url) {
  return url.startsWith("http:") || url.startsWith("https:");
}
function isDataURL(url) {
  return url.startsWith("data:");
}
async function fetchFile(urlOrData, fetchOptions) {
  var _a, _b;
  if (typeof urlOrData === "string") {
    const url = resolvePath(urlOrData);
    if (isNodePath(url)) {
      if ((_a = globalThis.loaders) == null ? void 0 : _a.fetchNode) {
        return (_b = globalThis.loaders) == null ? void 0 : _b.fetchNode(url, fetchOptions);
      }
    }
    return await fetch(url, fetchOptions);
  }
  return await makeResponse(urlOrData);
}

// node_modules/@loaders.gl/core/dist/lib/fetch/read-array-buffer.js
async function readArrayBuffer(file, start, length) {
  if (!(file instanceof Blob)) {
    file = new Blob([file]);
  }
  const slice = file.slice(start, start + length);
  return await readBlob(slice);
}
async function readBlob(blob) {
  return await new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      var _a;
      return resolve((_a = event == null ? void 0 : event.target) == null ? void 0 : _a.result);
    };
    fileReader.onerror = (error) => reject(error);
    fileReader.readAsArrayBuffer(blob);
  });
}

// node_modules/@loaders.gl/core/dist/lib/loader-utils/loggers.js
var probeLog = new Log({ id: "loaders.gl" });
var NullLog = class {
  log() {
    return () => {
    };
  }
  info() {
    return () => {
    };
  }
  warn() {
    return () => {
    };
  }
  error() {
    return () => {
    };
  }
};
var ConsoleLog = class {
  constructor() {
    __publicField(this, "console");
    this.console = console;
  }
  log(...args) {
    return this.console.log.bind(this.console, ...args);
  }
  info(...args) {
    return this.console.info.bind(this.console, ...args);
  }
  warn(...args) {
    return this.console.warn.bind(this.console, ...args);
  }
  error(...args) {
    return this.console.error.bind(this.console, ...args);
  }
};

// node_modules/@loaders.gl/core/dist/lib/loader-utils/option-defaults.js
var DEFAULT_LOADER_OPTIONS = {
  // baseUri
  fetch: null,
  mimeType: void 0,
  nothrow: false,
  log: new ConsoleLog(),
  // A probe.gl compatible (`log.log()()` syntax) that just logs to console
  useLocalLibraries: false,
  CDN: "https://unpkg.com/@loaders.gl",
  worker: true,
  // By default, use worker if provided by loader.
  maxConcurrency: 3,
  // How many worker instances should be created for each loader.
  maxMobileConcurrency: 1,
  // How many worker instances should be created for each loader on mobile devices.
  reuseWorkers: isBrowser,
  // By default reuse workers in browser (Node.js refuses to terminate if browsers are running)
  _nodeWorkers: false,
  // By default do not support node workers
  _workerType: "",
  // 'test' to use locally generated workers
  limit: 0,
  _limitMB: 0,
  batchSize: "auto",
  batchDebounceMs: 0,
  metadata: false,
  // TODO - currently only implemented for parseInBatches, adds initial metadata batch,
  transforms: []
};
var REMOVED_LOADER_OPTIONS = {
  throws: "nothrow",
  dataType: "(no longer used)",
  uri: "baseUri",
  // Warn if fetch options are used on top-level
  method: "fetch.method",
  headers: "fetch.headers",
  body: "fetch.body",
  mode: "fetch.mode",
  credentials: "fetch.credentials",
  cache: "fetch.cache",
  redirect: "fetch.redirect",
  referrer: "fetch.referrer",
  referrerPolicy: "fetch.referrerPolicy",
  integrity: "fetch.integrity",
  keepalive: "fetch.keepalive",
  signal: "fetch.signal"
};

// node_modules/@loaders.gl/core/dist/lib/loader-utils/option-utils.js
function getGlobalLoaderState() {
  globalThis.loaders = globalThis.loaders || {};
  const { loaders } = globalThis;
  if (!loaders._state) {
    loaders._state = {};
  }
  return loaders._state;
}
function getGlobalLoaderOptions() {
  const state = getGlobalLoaderState();
  state.globalOptions = state.globalOptions || { ...DEFAULT_LOADER_OPTIONS };
  return state.globalOptions;
}
function setGlobalOptions(options) {
  const state = getGlobalLoaderState();
  const globalOptions = getGlobalLoaderOptions();
  state.globalOptions = normalizeOptionsInternal(globalOptions, options);
  registerJSModules(options.modules);
}
function normalizeOptions(options, loader, loaders, url) {
  loaders = loaders || [];
  loaders = Array.isArray(loaders) ? loaders : [loaders];
  validateOptions(options, loaders);
  return normalizeOptionsInternal(loader, options, url);
}
function validateOptions(options, loaders) {
  validateOptionsObject(options, null, DEFAULT_LOADER_OPTIONS, REMOVED_LOADER_OPTIONS, loaders);
  for (const loader of loaders) {
    const idOptions = options && options[loader.id] || {};
    const loaderOptions = loader.options && loader.options[loader.id] || {};
    const deprecatedOptions = loader.deprecatedOptions && loader.deprecatedOptions[loader.id] || {};
    validateOptionsObject(idOptions, loader.id, loaderOptions, deprecatedOptions, loaders);
  }
}
function validateOptionsObject(options, id, defaultOptions, deprecatedOptions, loaders) {
  const loaderName = id || "Top level";
  const prefix = id ? `${id}.` : "";
  for (const key in options) {
    const isSubOptions = !id && isObject(options[key]);
    const isBaseUriOption = key === "baseUri" && !id;
    const isWorkerUrlOption = key === "workerUrl" && id;
    if (!(key in defaultOptions) && !isBaseUriOption && !isWorkerUrlOption) {
      if (key in deprecatedOptions) {
        probeLog.warn(`${loaderName} loader option '${prefix}${key}' no longer supported, use '${deprecatedOptions[key]}'`)();
      } else if (!isSubOptions) {
        const suggestion = findSimilarOption(key, loaders);
        probeLog.warn(`${loaderName} loader option '${prefix}${key}' not recognized. ${suggestion}`)();
      }
    }
  }
}
function findSimilarOption(optionKey, loaders) {
  const lowerCaseOptionKey = optionKey.toLowerCase();
  let bestSuggestion = "";
  for (const loader of loaders) {
    for (const key in loader.options) {
      if (optionKey === key) {
        return `Did you mean '${loader.id}.${key}'?`;
      }
      const lowerCaseKey = key.toLowerCase();
      const isPartialMatch = lowerCaseOptionKey.startsWith(lowerCaseKey) || lowerCaseKey.startsWith(lowerCaseOptionKey);
      if (isPartialMatch) {
        bestSuggestion = bestSuggestion || `Did you mean '${loader.id}.${key}'?`;
      }
    }
  }
  return bestSuggestion;
}
function normalizeOptionsInternal(loader, options, url) {
  const loaderDefaultOptions = loader.options || {};
  const mergedOptions = { ...loaderDefaultOptions };
  addUrlOptions(mergedOptions, url);
  if (mergedOptions.log === null) {
    mergedOptions.log = new NullLog();
  }
  mergeNestedFields(mergedOptions, getGlobalLoaderOptions());
  mergeNestedFields(mergedOptions, options);
  return mergedOptions;
}
function mergeNestedFields(mergedOptions, options) {
  for (const key in options) {
    if (key in options) {
      const value = options[key];
      if (isPureObject(value) && isPureObject(mergedOptions[key])) {
        mergedOptions[key] = {
          ...mergedOptions[key],
          ...options[key]
        };
      } else {
        mergedOptions[key] = options[key];
      }
    }
  }
}
function addUrlOptions(options, url) {
  if (url && !("baseUri" in options)) {
    options.baseUri = url;
  }
}

// node_modules/@loaders.gl/core/dist/lib/loader-utils/normalize-loader.js
function isLoaderObject(loader) {
  if (!loader) {
    return false;
  }
  if (Array.isArray(loader)) {
    loader = loader[0];
  }
  const hasExtensions = Array.isArray(loader == null ? void 0 : loader.extensions);
  return hasExtensions;
}
function normalizeLoader(loader) {
  assert(loader, "null loader");
  assert(isLoaderObject(loader), "invalid loader");
  let options;
  if (Array.isArray(loader)) {
    options = loader[1];
    loader = loader[0];
    loader = {
      ...loader,
      options: { ...loader.options, ...options }
    };
  }
  if ((loader == null ? void 0 : loader.parseTextSync) || (loader == null ? void 0 : loader.parseText)) {
    loader.text = true;
  }
  if (!loader.text) {
    loader.binary = true;
  }
  return loader;
}

// node_modules/@loaders.gl/core/dist/lib/api/register-loaders.js
var getGlobalLoaderRegistry = () => {
  const state = getGlobalLoaderState();
  state.loaderRegistry = state.loaderRegistry || [];
  return state.loaderRegistry;
};
function registerLoaders(loaders) {
  const loaderRegistry = getGlobalLoaderRegistry();
  loaders = Array.isArray(loaders) ? loaders : [loaders];
  for (const loader of loaders) {
    const normalizedLoader = normalizeLoader(loader);
    if (!loaderRegistry.find((registeredLoader) => normalizedLoader === registeredLoader)) {
      loaderRegistry.unshift(normalizedLoader);
    }
  }
}
function getRegisteredLoaders() {
  return getGlobalLoaderRegistry();
}
function _unregisterLoaders() {
  const state = getGlobalLoaderState();
  state.loaderRegistry = [];
}

// node_modules/@loaders.gl/core/dist/lib/api/select-loader.js
var EXT_PATTERN = /\.([^.]+)$/;
async function selectLoader(data, loaders = [], options, context) {
  if (!validHTTPResponse(data)) {
    return null;
  }
  let loader = selectLoaderSync(data, loaders, { ...options, nothrow: true }, context);
  if (loader) {
    return loader;
  }
  if (isBlob(data)) {
    data = await data.slice(0, 10).arrayBuffer();
    loader = selectLoaderSync(data, loaders, options, context);
  }
  if (!loader && !(options == null ? void 0 : options.nothrow)) {
    throw new Error(getNoValidLoaderMessage(data));
  }
  return loader;
}
function selectLoaderSync(data, loaders = [], options, context) {
  if (!validHTTPResponse(data)) {
    return null;
  }
  if (loaders && !Array.isArray(loaders)) {
    return normalizeLoader(loaders);
  }
  let candidateLoaders = [];
  if (loaders) {
    candidateLoaders = candidateLoaders.concat(loaders);
  }
  if (!(options == null ? void 0 : options.ignoreRegisteredLoaders)) {
    candidateLoaders.push(...getRegisteredLoaders());
  }
  normalizeLoaders(candidateLoaders);
  const loader = selectLoaderInternal(data, candidateLoaders, options, context);
  if (!loader && !(options == null ? void 0 : options.nothrow)) {
    throw new Error(getNoValidLoaderMessage(data));
  }
  return loader;
}
function selectLoaderInternal(data, loaders, options, context) {
  const url = getResourceUrl(data);
  const type = getResourceMIMEType(data);
  const testUrl = stripQueryString(url) || (context == null ? void 0 : context.url);
  let loader = null;
  let reason = "";
  if (options == null ? void 0 : options.mimeType) {
    loader = findLoaderByMIMEType(loaders, options == null ? void 0 : options.mimeType);
    reason = `match forced by supplied MIME type ${options == null ? void 0 : options.mimeType}`;
  }
  loader = loader || findLoaderByUrl(loaders, testUrl);
  reason = reason || (loader ? `matched url ${testUrl}` : "");
  loader = loader || findLoaderByMIMEType(loaders, type);
  reason = reason || (loader ? `matched MIME type ${type}` : "");
  loader = loader || findLoaderByInitialBytes(loaders, data);
  reason = reason || (loader ? `matched initial data ${getFirstCharacters(data)}` : "");
  if (options == null ? void 0 : options.fallbackMimeType) {
    loader = loader || findLoaderByMIMEType(loaders, options == null ? void 0 : options.fallbackMimeType);
    reason = reason || (loader ? `matched fallback MIME type ${type}` : "");
  }
  if (reason) {
    log.log(1, `selectLoader selected ${loader == null ? void 0 : loader.name}: ${reason}.`);
  }
  return loader;
}
function validHTTPResponse(data) {
  if (data instanceof Response) {
    if (data.status === 204) {
      return false;
    }
  }
  return true;
}
function getNoValidLoaderMessage(data) {
  const url = getResourceUrl(data);
  const type = getResourceMIMEType(data);
  let message = "No valid loader found (";
  message += url ? `${path_exports.filename(url)}, ` : "no url provided, ";
  message += `MIME type: ${type ? `"${type}"` : "not provided"}, `;
  const firstCharacters = data ? getFirstCharacters(data) : "";
  message += firstCharacters ? ` first bytes: "${firstCharacters}"` : "first bytes: not available";
  message += ")";
  return message;
}
function normalizeLoaders(loaders) {
  for (const loader of loaders) {
    normalizeLoader(loader);
  }
}
function findLoaderByUrl(loaders, url) {
  const match = url && EXT_PATTERN.exec(url);
  const extension = match && match[1];
  return extension ? findLoaderByExtension(loaders, extension) : null;
}
function findLoaderByExtension(loaders, extension) {
  extension = extension.toLowerCase();
  for (const loader of loaders) {
    for (const loaderExtension of loader.extensions) {
      if (loaderExtension.toLowerCase() === extension) {
        return loader;
      }
    }
  }
  return null;
}
function findLoaderByMIMEType(loaders, mimeType) {
  var _a;
  for (const loader of loaders) {
    if ((_a = loader.mimeTypes) == null ? void 0 : _a.some((mimeType1) => compareMIMETypes(mimeType, mimeType1))) {
      return loader;
    }
    if (compareMIMETypes(mimeType, `application/x.${loader.id}`)) {
      return loader;
    }
  }
  return null;
}
function findLoaderByInitialBytes(loaders, data) {
  if (!data) {
    return null;
  }
  for (const loader of loaders) {
    if (typeof data === "string") {
      if (testDataAgainstText(data, loader)) {
        return loader;
      }
    } else if (ArrayBuffer.isView(data)) {
      if (testDataAgainstBinary(data.buffer, data.byteOffset, loader)) {
        return loader;
      }
    } else if (data instanceof ArrayBuffer) {
      const byteOffset = 0;
      if (testDataAgainstBinary(data, byteOffset, loader)) {
        return loader;
      }
    }
  }
  return null;
}
function testDataAgainstText(data, loader) {
  if (loader.testText) {
    return loader.testText(data);
  }
  const tests = Array.isArray(loader.tests) ? loader.tests : [loader.tests];
  return tests.some((test) => data.startsWith(test));
}
function testDataAgainstBinary(data, byteOffset, loader) {
  const tests = Array.isArray(loader.tests) ? loader.tests : [loader.tests];
  return tests.some((test) => testBinary(data, byteOffset, loader, test));
}
function testBinary(data, byteOffset, loader, test) {
  if (test instanceof ArrayBuffer) {
    return compareArrayBuffers(test, data, test.byteLength);
  }
  switch (typeof test) {
    case "function":
      return test(data);
    case "string":
      const magic = getMagicString(data, byteOffset, test.length);
      return test === magic;
    default:
      return false;
  }
}
function getFirstCharacters(data, length = 5) {
  if (typeof data === "string") {
    return data.slice(0, length);
  } else if (ArrayBuffer.isView(data)) {
    return getMagicString(data.buffer, data.byteOffset, length);
  } else if (data instanceof ArrayBuffer) {
    const byteOffset = 0;
    return getMagicString(data, byteOffset, length);
  }
  return "";
}
function getMagicString(arrayBuffer, byteOffset, length) {
  if (arrayBuffer.byteLength < byteOffset + length) {
    return "";
  }
  const dataView = new DataView(arrayBuffer);
  let magic = "";
  for (let i = 0; i < length; i++) {
    magic += String.fromCharCode(dataView.getUint8(byteOffset + i));
  }
  return magic;
}

// node_modules/@loaders.gl/core/dist/iterators/make-iterator/make-string-iterator.js
var DEFAULT_CHUNK_SIZE = 256 * 1024;
function* makeStringIterator(string, options) {
  const chunkSize = (options == null ? void 0 : options.chunkSize) || DEFAULT_CHUNK_SIZE;
  let offset = 0;
  const textEncoder = new TextEncoder();
  while (offset < string.length) {
    const chunkLength = Math.min(string.length - offset, chunkSize);
    const chunk = string.slice(offset, offset + chunkLength);
    offset += chunkLength;
    yield textEncoder.encode(chunk);
  }
}

// node_modules/@loaders.gl/core/dist/iterators/make-iterator/make-array-buffer-iterator.js
var DEFAULT_CHUNK_SIZE2 = 256 * 1024;
function* makeArrayBufferIterator(arrayBuffer, options = {}) {
  const { chunkSize = DEFAULT_CHUNK_SIZE2 } = options;
  let byteOffset = 0;
  while (byteOffset < arrayBuffer.byteLength) {
    const chunkByteLength = Math.min(arrayBuffer.byteLength - byteOffset, chunkSize);
    const chunk = new ArrayBuffer(chunkByteLength);
    const sourceArray = new Uint8Array(arrayBuffer, byteOffset, chunkByteLength);
    const chunkArray = new Uint8Array(chunk);
    chunkArray.set(sourceArray);
    byteOffset += chunkByteLength;
    yield chunk;
  }
}

// node_modules/@loaders.gl/core/dist/iterators/make-iterator/make-blob-iterator.js
var DEFAULT_CHUNK_SIZE3 = 1024 * 1024;
async function* makeBlobIterator(blob, options) {
  const chunkSize = (options == null ? void 0 : options.chunkSize) || DEFAULT_CHUNK_SIZE3;
  let offset = 0;
  while (offset < blob.size) {
    const end = offset + chunkSize;
    const chunk = await blob.slice(offset, end).arrayBuffer();
    offset = end;
    yield chunk;
  }
}

// node_modules/@loaders.gl/core/dist/iterators/make-iterator/make-stream-iterator.js
function makeStreamIterator(stream, options) {
  return isBrowser ? makeBrowserStreamIterator(stream, options) : makeNodeStreamIterator(stream, options);
}
async function* makeBrowserStreamIterator(stream, options) {
  const reader = stream.getReader();
  let nextBatchPromise;
  try {
    while (true) {
      const currentBatchPromise = nextBatchPromise || reader.read();
      if (options == null ? void 0 : options._streamReadAhead) {
        nextBatchPromise = reader.read();
      }
      const { done, value } = await currentBatchPromise;
      if (done) {
        return;
      }
      yield toArrayBuffer(value);
    }
  } catch (error) {
    reader.releaseLock();
  }
}
async function* makeNodeStreamIterator(stream, options) {
  for await (const chunk of stream) {
    yield toArrayBuffer(chunk);
  }
}

// node_modules/@loaders.gl/core/dist/iterators/make-iterator/make-iterator.js
function makeIterator(data, options) {
  if (typeof data === "string") {
    return makeStringIterator(data, options);
  }
  if (data instanceof ArrayBuffer) {
    return makeArrayBufferIterator(data, options);
  }
  if (isBlob(data)) {
    return makeBlobIterator(data, options);
  }
  if (isReadableStream(data)) {
    return makeStreamIterator(data, options);
  }
  if (isResponse(data)) {
    const response = data;
    return makeStreamIterator(response.body, options);
  }
  throw new Error("makeIterator");
}

// node_modules/@loaders.gl/core/dist/lib/loader-utils/get-data.js
var ERR_DATA = "Cannot convert supplied data type";
function getArrayBufferOrStringFromDataSync(data, loader, options) {
  if (loader.text && typeof data === "string") {
    return data;
  }
  if (isBuffer(data)) {
    data = data.buffer;
  }
  if (data instanceof ArrayBuffer) {
    const arrayBuffer = data;
    if (loader.text && !loader.binary) {
      const textDecoder = new TextDecoder("utf8");
      return textDecoder.decode(arrayBuffer);
    }
    return arrayBuffer;
  }
  if (ArrayBuffer.isView(data)) {
    if (loader.text && !loader.binary) {
      const textDecoder = new TextDecoder("utf8");
      return textDecoder.decode(data);
    }
    let arrayBuffer = data.buffer;
    const byteLength = data.byteLength || data.length;
    if (data.byteOffset !== 0 || byteLength !== arrayBuffer.byteLength) {
      arrayBuffer = arrayBuffer.slice(data.byteOffset, data.byteOffset + byteLength);
    }
    return arrayBuffer;
  }
  throw new Error(ERR_DATA);
}
async function getArrayBufferOrStringFromData(data, loader, options) {
  const isArrayBuffer = data instanceof ArrayBuffer || ArrayBuffer.isView(data);
  if (typeof data === "string" || isArrayBuffer) {
    return getArrayBufferOrStringFromDataSync(data, loader, options);
  }
  if (isBlob(data)) {
    data = await makeResponse(data);
  }
  if (isResponse(data)) {
    const response = data;
    await checkResponse(response);
    return loader.binary ? await response.arrayBuffer() : await response.text();
  }
  if (isReadableStream(data)) {
    data = makeIterator(data, options);
  }
  if (isIterable(data) || isAsyncIterable(data)) {
    return concatenateArrayBuffersAsync(data);
  }
  throw new Error(ERR_DATA);
}
async function getAsyncIterableFromData(data, options) {
  if (isIterator(data)) {
    return data;
  }
  if (isResponse(data)) {
    const response = data;
    await checkResponse(response);
    const body = await response.body;
    return makeIterator(body, options);
  }
  if (isBlob(data) || isReadableStream(data)) {
    return makeIterator(data, options);
  }
  if (isAsyncIterable(data)) {
    return data;
  }
  return getIterableFromData(data);
}
function getIterableFromData(data) {
  if (ArrayBuffer.isView(data)) {
    return function* oneChunk() {
      yield data.buffer;
    }();
  }
  if (data instanceof ArrayBuffer) {
    return function* oneChunk() {
      yield data;
    }();
  }
  if (isIterator(data)) {
    return data;
  }
  if (isIterable(data)) {
    return data[Symbol.iterator]();
  }
  throw new Error(ERR_DATA);
}

// node_modules/@loaders.gl/core/dist/lib/loader-utils/get-fetch-function.js
function getFetchFunction(options, context) {
  const globalOptions = getGlobalLoaderOptions();
  const loaderOptions = options || globalOptions;
  if (typeof loaderOptions.fetch === "function") {
    return loaderOptions.fetch;
  }
  if (isObject(loaderOptions.fetch)) {
    return (url) => fetchFile(url, loaderOptions.fetch);
  }
  if (context == null ? void 0 : context.fetch) {
    return context == null ? void 0 : context.fetch;
  }
  return fetchFile;
}

// node_modules/@loaders.gl/core/dist/lib/loader-utils/loader-context.js
function getLoaderContext(context, options, parentContext) {
  if (parentContext) {
    return parentContext;
  }
  const newContext = {
    fetch: getFetchFunction(options, context),
    ...context
  };
  if (newContext.url) {
    const baseUrl = stripQueryString(newContext.url);
    newContext.baseUrl = baseUrl;
    newContext.queryString = extractQueryString(newContext.url);
    newContext.filename = path_exports.filename(baseUrl);
    newContext.baseUrl = path_exports.dirname(baseUrl);
  }
  if (!Array.isArray(newContext.loaders)) {
    newContext.loaders = null;
  }
  return newContext;
}
function getLoadersFromContext(loaders, context) {
  if (loaders && !Array.isArray(loaders)) {
    return loaders;
  }
  let candidateLoaders;
  if (loaders) {
    candidateLoaders = Array.isArray(loaders) ? loaders : [loaders];
  }
  if (context && context.loaders) {
    const contextLoaders = Array.isArray(context.loaders) ? context.loaders : [context.loaders];
    candidateLoaders = candidateLoaders ? [...candidateLoaders, ...contextLoaders] : contextLoaders;
  }
  return candidateLoaders && candidateLoaders.length ? candidateLoaders : void 0;
}

// node_modules/@loaders.gl/core/dist/lib/api/parse.js
async function parse(data, loaders, options, context) {
  if (loaders && !Array.isArray(loaders) && !isLoaderObject(loaders)) {
    context = void 0;
    options = loaders;
    loaders = void 0;
  }
  data = await data;
  options = options || {};
  const url = getResourceUrl(data);
  const typedLoaders = loaders;
  const candidateLoaders = getLoadersFromContext(typedLoaders, context);
  const loader = await selectLoader(data, candidateLoaders, options);
  if (!loader) {
    return null;
  }
  options = normalizeOptions(options, loader, candidateLoaders, url);
  context = getLoaderContext(
    // @ts-expect-error
    { url, _parse: parse, loaders: candidateLoaders },
    options,
    context || null
  );
  return await parseWithLoader(loader, data, options, context);
}
async function parseWithLoader(loader, data, options, context) {
  validateWorkerVersion(loader);
  options = mergeLoaderOptions(loader.options, options);
  if (isResponse(data)) {
    const response = data;
    const { ok, redirected, status, statusText, type, url } = response;
    const headers = Object.fromEntries(response.headers.entries());
    context.response = { headers, ok, redirected, status, statusText, type, url };
  }
  data = await getArrayBufferOrStringFromData(data, loader, options);
  const loaderWithParser = loader;
  if (loaderWithParser.parseTextSync && typeof data === "string") {
    return loaderWithParser.parseTextSync(data, options, context);
  }
  if (canParseWithWorker(loader, options)) {
    return await parseWithWorker(loader, data, options, context, parse);
  }
  if (loaderWithParser.parseText && typeof data === "string") {
    return await loaderWithParser.parseText(data, options, context);
  }
  if (loaderWithParser.parse) {
    return await loaderWithParser.parse(data, options, context);
  }
  assert2(!loaderWithParser.parseSync);
  throw new Error(`${loader.id} loader - no parser found and worker is disabled`);
}

// node_modules/@loaders.gl/core/dist/lib/api/parse-sync.js
function parseSync(data, loaders, options, context) {
  if (!Array.isArray(loaders) && !isLoaderObject(loaders)) {
    context = void 0;
    options = loaders;
    loaders = void 0;
  }
  options = options || {};
  const typedLoaders = loaders;
  const candidateLoaders = getLoadersFromContext(typedLoaders, context);
  const loader = selectLoaderSync(data, candidateLoaders, options);
  if (!loader) {
    return null;
  }
  options = normalizeOptions(options, loader, candidateLoaders);
  const url = getResourceUrl(data);
  const parse2 = () => {
    throw new Error("parseSync called parse (which is async");
  };
  context = getLoaderContext({ url, _parseSync: parse2, _parse: parse2, loaders }, options, context || null);
  return parseWithLoaderSync(loader, data, options, context);
}
function parseWithLoaderSync(loader, data, options, context) {
  data = getArrayBufferOrStringFromDataSync(data, loader, options);
  if (loader.parseTextSync && typeof data === "string") {
    return loader.parseTextSync(data, options);
  }
  if (loader.parseSync && data instanceof ArrayBuffer) {
    return loader.parseSync(data, options, context);
  }
  throw new Error(`${loader.name} loader: 'parseSync' not supported by this loader, use 'parse' instead. ${context.url || ""}`);
}

// node_modules/@loaders.gl/schema/dist/lib/table/simple-table/table-accessors.js
function isTable(table) {
  var _a;
  const shape = typeof table === "object" && (table == null ? void 0 : table.shape);
  switch (shape) {
    case "array-row-table":
    case "object-row-table":
      return Array.isArray(table.data);
    case "geojson-table":
      return Array.isArray(table.features);
    case "columnar-table":
      return table.data && typeof table.data === "object";
    case "arrow-table":
      return Boolean(((_a = table == null ? void 0 : table.data) == null ? void 0 : _a.numRows) !== void 0);
    default:
      return false;
  }
}
function getTableLength(table) {
  switch (table.shape) {
    case "array-row-table":
    case "object-row-table":
      return table.data.length;
    case "geojson-table":
      return table.features.length;
    case "arrow-table":
      const arrowTable = table.data;
      return arrowTable.numRows;
    case "columnar-table":
      for (const column of Object.values(table.data)) {
        return column.length || 0;
      }
      return 0;
    default:
      throw new Error("table");
  }
}

// node_modules/@loaders.gl/schema/dist/lib/table/simple-table/make-table-from-batches.js
function makeBatchFromTable(table) {
  return { ...table, length: getTableLength(table), batchType: "data" };
}

// node_modules/@loaders.gl/schema/dist/lib/table/arrow-api/enum.js
var Type;
(function(Type2) {
  Type2[Type2["NONE"] = 0] = "NONE";
  Type2[Type2["Null"] = 1] = "Null";
  Type2[Type2["Int"] = 2] = "Int";
  Type2[Type2["Float"] = 3] = "Float";
  Type2[Type2["Binary"] = 4] = "Binary";
  Type2[Type2["Utf8"] = 5] = "Utf8";
  Type2[Type2["Bool"] = 6] = "Bool";
  Type2[Type2["Decimal"] = 7] = "Decimal";
  Type2[Type2["Date"] = 8] = "Date";
  Type2[Type2["Time"] = 9] = "Time";
  Type2[Type2["Timestamp"] = 10] = "Timestamp";
  Type2[Type2["Interval"] = 11] = "Interval";
  Type2[Type2["List"] = 12] = "List";
  Type2[Type2["Struct"] = 13] = "Struct";
  Type2[Type2["Union"] = 14] = "Union";
  Type2[Type2["FixedSizeBinary"] = 15] = "FixedSizeBinary";
  Type2[Type2["FixedSizeList"] = 16] = "FixedSizeList";
  Type2[Type2["Map"] = 17] = "Map";
  Type2[Type2["Dictionary"] = -1] = "Dictionary";
  Type2[Type2["Int8"] = -2] = "Int8";
  Type2[Type2["Int16"] = -3] = "Int16";
  Type2[Type2["Int32"] = -4] = "Int32";
  Type2[Type2["Int64"] = -5] = "Int64";
  Type2[Type2["Uint8"] = -6] = "Uint8";
  Type2[Type2["Uint16"] = -7] = "Uint16";
  Type2[Type2["Uint32"] = -8] = "Uint32";
  Type2[Type2["Uint64"] = -9] = "Uint64";
  Type2[Type2["Float16"] = -10] = "Float16";
  Type2[Type2["Float32"] = -11] = "Float32";
  Type2[Type2["Float64"] = -12] = "Float64";
  Type2[Type2["DateDay"] = -13] = "DateDay";
  Type2[Type2["DateMillisecond"] = -14] = "DateMillisecond";
  Type2[Type2["TimestampSecond"] = -15] = "TimestampSecond";
  Type2[Type2["TimestampMillisecond"] = -16] = "TimestampMillisecond";
  Type2[Type2["TimestampMicrosecond"] = -17] = "TimestampMicrosecond";
  Type2[Type2["TimestampNanosecond"] = -18] = "TimestampNanosecond";
  Type2[Type2["TimeSecond"] = -19] = "TimeSecond";
  Type2[Type2["TimeMillisecond"] = -20] = "TimeMillisecond";
  Type2[Type2["TimeMicrosecond"] = -21] = "TimeMicrosecond";
  Type2[Type2["TimeNanosecond"] = -22] = "TimeNanosecond";
  Type2[Type2["DenseUnion"] = -23] = "DenseUnion";
  Type2[Type2["SparseUnion"] = -24] = "SparseUnion";
  Type2[Type2["IntervalDayTime"] = -25] = "IntervalDayTime";
  Type2[Type2["IntervalYearMonth"] = -26] = "IntervalYearMonth";
})(Type || (Type = {}));

// node_modules/@loaders.gl/schema/dist/lib/table/arrow-api/arrow-like-type.js
var DataType = class {
  static isNull(x) {
    return x && x.typeId === Type.Null;
  }
  static isInt(x) {
    return x && x.typeId === Type.Int;
  }
  static isFloat(x) {
    return x && x.typeId === Type.Float;
  }
  static isBinary(x) {
    return x && x.typeId === Type.Binary;
  }
  static isUtf8(x) {
    return x && x.typeId === Type.Utf8;
  }
  static isBool(x) {
    return x && x.typeId === Type.Bool;
  }
  static isDecimal(x) {
    return x && x.typeId === Type.Decimal;
  }
  static isDate(x) {
    return x && x.typeId === Type.Date;
  }
  static isTime(x) {
    return x && x.typeId === Type.Time;
  }
  static isTimestamp(x) {
    return x && x.typeId === Type.Timestamp;
  }
  static isInterval(x) {
    return x && x.typeId === Type.Interval;
  }
  static isList(x) {
    return x && x.typeId === Type.List;
  }
  static isStruct(x) {
    return x && x.typeId === Type.Struct;
  }
  static isUnion(x) {
    return x && x.typeId === Type.Union;
  }
  static isFixedSizeBinary(x) {
    return x && x.typeId === Type.FixedSizeBinary;
  }
  static isFixedSizeList(x) {
    return x && x.typeId === Type.FixedSizeList;
  }
  static isMap(x) {
    return x && x.typeId === Type.Map;
  }
  static isDictionary(x) {
    return x && x.typeId === Type.Dictionary;
  }
  get typeId() {
    return Type.NONE;
  }
  // get ArrayType(): AnyArrayType {
  //   return Int8Array;
  // }
  // get ArrayType() { return Array; }
  compareTo(other) {
    return this === other;
  }
};
var Null = class extends DataType {
  get typeId() {
    return Type.Null;
  }
  get [Symbol.toStringTag]() {
    return "Null";
  }
  toString() {
    return "Null";
  }
};
var Bool = class extends DataType {
  get typeId() {
    return Type.Bool;
  }
  // get ArrayType() {
  //   return Uint8Array;
  // }
  get [Symbol.toStringTag]() {
    return "Bool";
  }
  toString() {
    return "Bool";
  }
};
var Int = class extends DataType {
  constructor(isSigned, bitWidth) {
    super();
    __publicField(this, "isSigned");
    __publicField(this, "bitWidth");
    this.isSigned = isSigned;
    this.bitWidth = bitWidth;
  }
  get typeId() {
    return Type.Int;
  }
  // get ArrayType() {
  //   switch (this.bitWidth) {
  //     case 8:
  //       return this.isSigned ? Int8Array : Uint8Array;
  //     case 16:
  //       return this.isSigned ? Int16Array : Uint16Array;
  //     case 32:
  //       return this.isSigned ? Int32Array : Uint32Array;
  //     case 64:
  //       return this.isSigned ? Int32Array : Uint32Array;
  //     default:
  //       throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
  //   }
  // }
  get [Symbol.toStringTag]() {
    return "Int";
  }
  toString() {
    return `${this.isSigned ? "I" : "Ui"}nt${this.bitWidth}`;
  }
};
var Float = class extends DataType {
  constructor(precision) {
    super();
    __publicField(this, "precision");
    this.precision = precision;
  }
  get typeId() {
    return Type.Float;
  }
  // get ArrayType() {
  //   switch (this.precision) {
  //     case Precision.HALF:
  //       return Uint16Array;
  //     case Precision.SINGLE:
  //       return Float32Array;
  //     case Precision.DOUBLE:
  //       return Float64Array;
  //     default:
  //       throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
  //   }
  // }
  get [Symbol.toStringTag]() {
    return "Float";
  }
  toString() {
    return `Float${this.precision}`;
  }
};
var Binary = class extends DataType {
  constructor() {
    super();
  }
  get typeId() {
    return Type.Binary;
  }
  toString() {
    return "Binary";
  }
  get [Symbol.toStringTag]() {
    return "Binary";
  }
};
var Utf8 = class extends DataType {
  get typeId() {
    return Type.Utf8;
  }
  // get ArrayType() {
  //   return Uint8Array;
  // }
  get [Symbol.toStringTag]() {
    return "Utf8";
  }
  toString() {
    return "Utf8";
  }
};
var DateUnit = {
  DAY: 0,
  MILLISECOND: 1
};
var Date2 = class extends DataType {
  constructor(unit) {
    super();
    __publicField(this, "unit");
    this.unit = unit;
  }
  get typeId() {
    return Type.Date;
  }
  // get ArrayType() {
  //   return Int32Array;
  // }
  get [Symbol.toStringTag]() {
    return "Date";
  }
  toString() {
    return `Date${(this.unit + 1) * 32}<${DateUnit[this.unit]}>`;
  }
};
var TimeUnit = {
  SECOND: 1,
  MILLISECOND: 1e3,
  MICROSECOND: 1e6,
  NANOSECOND: 1e9
};
var Time = class extends DataType {
  constructor(unit, bitWidth) {
    super();
    __publicField(this, "unit");
    __publicField(this, "bitWidth");
    this.unit = unit;
    this.bitWidth = bitWidth;
  }
  get typeId() {
    return Type.Time;
  }
  toString() {
    return `Time${this.bitWidth}<${TimeUnit[this.unit]}>`;
  }
  get [Symbol.toStringTag]() {
    return "Time";
  }
};
var Timestamp = class extends DataType {
  constructor(unit, timezone = null) {
    super();
    __publicField(this, "unit");
    __publicField(this, "timezone");
    this.unit = unit;
    this.timezone = timezone;
  }
  get typeId() {
    return Type.Timestamp;
  }
  // get ArrayType() {
  //   return Int32Array;
  // }
  get [Symbol.toStringTag]() {
    return "Timestamp";
  }
  toString() {
    return `Timestamp<${TimeUnit[this.unit]}${this.timezone ? `, ${this.timezone}` : ""}>`;
  }
};
var IntervalUnit = {
  DAY_TIME: 0,
  YEAR_MONTH: 1
};
var Interval = class extends DataType {
  constructor(unit) {
    super();
    __publicField(this, "unit");
    this.unit = unit;
  }
  get typeId() {
    return Type.Interval;
  }
  // get ArrayType() {
  //   return Int32Array;
  // }
  get [Symbol.toStringTag]() {
    return "Interval";
  }
  toString() {
    return `Interval<${IntervalUnit[this.unit]}>`;
  }
};
var FixedSizeList = class extends DataType {
  constructor(listSize, child) {
    super();
    __publicField(this, "listSize");
    __publicField(this, "children");
    this.listSize = listSize;
    this.children = [child];
  }
  get typeId() {
    return Type.FixedSizeList;
  }
  get valueType() {
    return this.children[0].type;
  }
  get valueField() {
    return this.children[0];
  }
  // get ArrayType() {
  //   return this.valueType.ArrayType;
  // }
  get [Symbol.toStringTag]() {
    return "FixedSizeList";
  }
  toString() {
    return `FixedSizeList[${this.listSize}]<${JSON.stringify(this.valueType)}>`;
  }
};
var Struct = class extends DataType {
  constructor(children) {
    super();
    __publicField(this, "children");
    this.children = children;
  }
  get typeId() {
    return Type.Struct;
  }
  toString() {
    return `Struct<{${this.children.map((f) => `${f.name}:${JSON.stringify(f.type)}`).join(", ")}}>`;
  }
  get [Symbol.toStringTag]() {
    return "Struct";
  }
};

// node_modules/@loaders.gl/schema/dist/lib/utils/async-queue.js
var ArrayQueue = class extends Array {
  enqueue(value) {
    return this.push(value);
  }
  dequeue() {
    return this.shift();
  }
};
var AsyncQueue = class {
  constructor() {
    __publicField(this, "_values");
    __publicField(this, "_settlers");
    __publicField(this, "_closed");
    this._values = new ArrayQueue();
    this._settlers = new ArrayQueue();
    this._closed = false;
  }
  close() {
    while (this._settlers.length > 0) {
      this._settlers.dequeue().resolve({ done: true });
    }
    this._closed = true;
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  enqueue(value) {
    if (this._closed) {
      throw new Error("Closed");
    }
    if (this._settlers.length > 0) {
      if (this._values.length > 0) {
        throw new Error("Illegal internal state");
      }
      const settler = this._settlers.dequeue();
      if (value instanceof Error) {
        settler.reject(value);
      } else {
        settler.resolve({ value });
      }
    } else {
      this._values.enqueue(value);
    }
  }
  /**
   * @returns a Promise for an IteratorResult
   */
  next() {
    if (this._values.length > 0) {
      const value = this._values.dequeue();
      if (value instanceof Error) {
        return Promise.reject(value);
      }
      return Promise.resolve({ value });
    }
    if (this._closed) {
      if (this._settlers.length > 0) {
        throw new Error("Illegal internal state");
      }
      return Promise.resolve({ done: true });
    }
    return new Promise((resolve, reject) => {
      this._settlers.enqueue({ resolve, reject });
    });
  }
};

// node_modules/@loaders.gl/core/dist/lib/api/parse-in-batches.js
async function parseInBatches(data, loaders, options, context) {
  const loaderArray = Array.isArray(loaders) ? loaders : void 0;
  if (!Array.isArray(loaders) && !isLoaderObject(loaders)) {
    context = void 0;
    options = loaders;
    loaders = void 0;
  }
  data = await data;
  options = options || {};
  const url = getResourceUrl(data);
  const loader = await selectLoader(data, loaders, options);
  if (!loader) {
    return [];
  }
  options = normalizeOptions(options, loader, loaderArray, url);
  context = getLoaderContext({ url, _parseInBatches: parseInBatches, _parse: parse, loaders: loaderArray }, options, context || null);
  return await parseWithLoaderInBatches(loader, data, options, context);
}
async function parseWithLoaderInBatches(loader, data, options, context) {
  const outputIterator = await parseToOutputIterator(loader, data, options, context);
  if (!options.metadata) {
    return outputIterator;
  }
  const metadataBatch = {
    shape: "metadata",
    batchType: "metadata",
    metadata: {
      _loader: loader,
      _context: context
    },
    // Populate with some default fields to avoid crashing
    data: [],
    bytesUsed: 0
  };
  async function* makeMetadataBatchIterator(iterator) {
    yield metadataBatch;
    yield* iterator;
  }
  return makeMetadataBatchIterator(outputIterator);
}
async function parseToOutputIterator(loader, data, options, context) {
  const inputIterator = await getAsyncIterableFromData(data, options);
  const transformedIterator = await applyInputTransforms(inputIterator, (options == null ? void 0 : options.transforms) || []);
  if (loader.parseInBatches) {
    return loader.parseInBatches(transformedIterator, options, context);
  }
  return parseChunkInBatches(transformedIterator, loader, options, context);
}
async function* parseChunkInBatches(transformedIterator, loader, options, context) {
  const arrayBuffer = await concatenateArrayBuffersAsync(transformedIterator);
  const parsedData = await parse(
    arrayBuffer,
    loader,
    // TODO - Hack: supply loaders MIME type to ensure we match it
    { ...options, mimeType: loader.mimeTypes[0] },
    context
  );
  const batch = convertDataToBatch(parsedData, loader);
  yield batch;
}
function convertDataToBatch(parsedData, loader) {
  const batch = isTable(parsedData) ? makeBatchFromTable(parsedData) : {
    shape: "unknown",
    batchType: "data",
    data: parsedData,
    length: Array.isArray(parsedData) ? parsedData.length : 1
  };
  batch.mimeType = loader.mimeTypes[0];
  return batch;
}
async function applyInputTransforms(inputIterator, transforms = []) {
  let iteratorChain = inputIterator;
  for await (const transformBatches of transforms) {
    iteratorChain = transformBatches(iteratorChain);
  }
  return iteratorChain;
}

// node_modules/@loaders.gl/core/dist/lib/api/load.js
async function load(url, loaders, options, context) {
  let resolvedLoaders;
  let resolvedOptions;
  if (!Array.isArray(loaders) && !isLoaderObject(loaders)) {
    resolvedLoaders = [];
    resolvedOptions = loaders;
    context = void 0;
  } else {
    resolvedLoaders = loaders;
    resolvedOptions = options;
  }
  const fetch2 = getFetchFunction(resolvedOptions);
  let data = url;
  if (typeof url === "string") {
    data = await fetch2(url);
  }
  if (isBlob(url)) {
    data = await fetch2(url);
  }
  return Array.isArray(resolvedLoaders) ? await parse(data, resolvedLoaders, resolvedOptions) : await parse(data, resolvedLoaders, resolvedOptions);
}

// node_modules/@loaders.gl/core/dist/lib/api/load-in-batches.js
function loadInBatches(files, loaders, options, context) {
  let loadersArray;
  if (!Array.isArray(loaders) && !isLoaderObject(loaders)) {
    context = void 0;
    options = loaders;
    loadersArray = void 0;
  } else {
    loadersArray = loaders;
  }
  const fetch2 = getFetchFunction(options || {});
  if (!Array.isArray(files)) {
    return loadOneFileInBatches(files, loadersArray, options || {}, fetch2);
  }
  const promises = files.map((file) => loadOneFileInBatches(file, loadersArray, options || {}, fetch2));
  return promises;
}
async function loadOneFileInBatches(file, loaders, options, fetch2) {
  if (typeof file === "string") {
    const url = file;
    const response = await fetch2(url);
    return Array.isArray(loaders) ? await parseInBatches(response, loaders, options) : await parseInBatches(response, loaders, options);
  }
  return Array.isArray(loaders) ? await parseInBatches(file, loaders, options) : await parseInBatches(file, loaders, options);
}

// node_modules/@loaders.gl/core/dist/lib/api/encode-table.js
async function encodeTable(data, writer, options) {
  if (writer.encode) {
    return await writer.encode(data, options);
  }
  if (writer.encodeText) {
    const text = await writer.encodeText(data, options);
    return new TextEncoder().encode(text);
  }
  if (writer.encodeInBatches) {
    const batches = encodeTableInBatches(data, writer, options);
    const chunks = [];
    for await (const batch of batches) {
      chunks.push(batch);
    }
    return concatenateArrayBuffers(...chunks);
  }
  throw new Error("Writer could not encode data");
}
async function encodeTableAsText(data, writer, options) {
  if (writer.text && writer.encodeText) {
    return await writer.encodeText(data, options);
  }
  if (writer.text) {
    const arrayBuffer = await encodeTable(data, writer, options);
    return new TextDecoder().decode(arrayBuffer);
  }
  throw new Error(`Writer ${writer.name} could not encode data as text`);
}
function encodeTableInBatches(data, writer, options) {
  if (writer.encodeInBatches) {
    const dataIterator = getIterator(data);
    return writer.encodeInBatches(dataIterator, options);
  }
  throw new Error("Writer could not encode data in batches");
}
function getIterator(data) {
  const dataIterator = [{ ...data, start: 0, end: data.length }];
  return dataIterator;
}

// node_modules/@loaders.gl/core/dist/lib/api/encode.js
async function encode(data, writer, options_) {
  const globalOptions = getGlobalLoaderOptions();
  const options = { ...globalOptions, ...options_ };
  if (writer.encodeURLtoURL) {
    return encodeWithCommandLineTool(writer, data, options);
  }
  if (canEncodeWithWorker(writer, options)) {
    return await processOnWorker(writer, data, options);
  }
  return await writer.encode(data, options);
}
function encodeSync(data, writer, options) {
  if (writer.encodeSync) {
    return writer.encodeSync(data, options);
  }
  if (writer.encodeTextSync) {
    return new TextEncoder().encode(writer.encodeTextSync(data, options));
  }
  throw new Error(`Writer ${writer.name} could not synchronously encode data`);
}
async function encodeText(data, writer, options) {
  if (writer.encodeText) {
    return await writer.encodeText(data, options);
  }
  if (writer.encodeTextSync) {
    return writer.encodeTextSync(data, options);
  }
  if (writer.text) {
    const arrayBuffer = await writer.encode(data, options);
    return new TextDecoder().decode(arrayBuffer);
  }
  throw new Error(`Writer ${writer.name} could not encode data as text`);
}
function encodeTextSync(data, writer, options) {
  if (writer.encodeTextSync) {
    return writer.encodeTextSync(data, options);
  }
  if (writer.text && writer.encodeSync) {
    const arrayBuffer = encodeSync(data, writer, options);
    return new TextDecoder().decode(arrayBuffer);
  }
  throw new Error(`Writer ${writer.name} could not encode data as text`);
}
function encodeInBatches(data, writer, options) {
  if (writer.encodeInBatches) {
    const dataIterator = getIterator2(data);
    return writer.encodeInBatches(dataIterator, options);
  }
  throw new Error(`Writer ${writer.name} could not encode in batches`);
}
async function encodeURLtoURL(inputUrl, outputUrl, writer, options) {
  inputUrl = resolvePath(inputUrl);
  outputUrl = resolvePath(outputUrl);
  if (isBrowser || !writer.encodeURLtoURL) {
    throw new Error();
  }
  const outputFilename = await writer.encodeURLtoURL(inputUrl, outputUrl, options);
  return outputFilename;
}
async function encodeWithCommandLineTool(writer, data, options) {
  if (isBrowser) {
    throw new Error(`Writer ${writer.name} not supported in browser`);
  }
  const tmpInputFilename = getTemporaryFilename("input");
  const file = new NodeFileFacade(tmpInputFilename, "w");
  await file.write(data);
  const tmpOutputFilename = getTemporaryFilename("output");
  const outputFilename = await encodeURLtoURL(tmpInputFilename, tmpOutputFilename, writer, options);
  const response = await fetchFile(outputFilename);
  return response.arrayBuffer();
}
function getIterator2(data) {
  const dataIterator = [{ ...data, start: 0, end: data.length }];
  return dataIterator;
}
function getTemporaryFilename(filename) {
  return `/tmp/${filename}`;
}

// node_modules/@loaders.gl/core/dist/lib/api/create-data-source.js
function createDataSource(data, sources, props) {
  const { type = "auto" } = props;
  const source = type === "auto" ? selectSource(data, sources) : getSourceOfType(type, sources);
  if (!source) {
    throw new Error("Not a valid image source type");
  }
  return source.createDataSource(data, props);
}
function selectSource(url, sources) {
  for (const service of sources) {
    if (service.testURL && service.testURL(url)) {
      return service;
    }
  }
  return null;
}
function getSourceOfType(type, sources) {
  for (const service of sources) {
    if (service.type === type) {
      return service;
    }
  }
  return null;
}

// node_modules/@loaders.gl/core/dist/lib/api/select-source.js
function selectSource2(url, sources, options) {
  const type = (options == null ? void 0 : options.type) || "auto";
  let selectedSource = null;
  if (type === "auto") {
    for (const source of sources) {
      if (typeof url === "string" && source.testURL && source.testURL(url)) {
        return source;
      }
    }
  } else {
    selectedSource = getSourceOfType2(type, sources);
  }
  if (!selectedSource && !(options == null ? void 0 : options.nothrow)) {
    throw new Error("Not a valid image source type");
  }
  return selectedSource;
}
function getSourceOfType2(type, sources) {
  for (const service of sources) {
    if (service.type === type) {
      return service;
    }
  }
  return null;
}

// node_modules/@loaders.gl/core/dist/iterators/make-stream/make-stream.js
function makeStream(source, options) {
  if (globalThis.loaders.makeNodeStream) {
    return globalThis.loaders.makeNodeStream(source, options);
  }
  const iterator = source[Symbol.asyncIterator] ? source[Symbol.asyncIterator]() : source[Symbol.iterator]();
  return new ReadableStream(
    {
      // Create a byte stream (enables `Response(stream).arrayBuffer()`)
      // Only supported on Chrome
      // See: https://developer.mozilla.org/en-US/docs/Web/API/ReadableByteStreamController
      // @ts-ignore
      type: "bytes",
      async pull(controller) {
        try {
          const { done, value } = await iterator.next();
          if (done) {
            controller.close();
          } else {
            controller.enqueue(new Uint8Array(value));
          }
        } catch (error) {
          controller.error(error);
        }
      },
      async cancel() {
        var _a;
        await ((_a = iterator == null ? void 0 : iterator.return) == null ? void 0 : _a.call(iterator));
      }
    },
    // options: QueingStrategy<Uint8Array>
    {
      // This is bytes, not chunks
      highWaterMark: 2 ** 24,
      ...options
    }
  );
}

// node_modules/@loaders.gl/core/dist/null-loader.js
var VERSION = true ? "4.3.2" : "latest";
var NullWorkerLoader = {
  dataType: null,
  batchType: null,
  name: "Null loader",
  id: "null",
  module: "core",
  version: VERSION,
  worker: true,
  mimeTypes: ["application/x.empty"],
  extensions: ["null"],
  tests: [() => false],
  options: {
    null: {}
  }
};
var NullLoader = {
  dataType: null,
  batchType: null,
  name: "Null loader",
  id: "null",
  module: "core",
  version: VERSION,
  mimeTypes: ["application/x.empty"],
  extensions: ["null"],
  parse: async (arrayBuffer, options, context) => parseSync2(arrayBuffer, options || {}, context),
  parseSync: parseSync2,
  parseInBatches: async function* generator(asyncIterator, options, context) {
    for await (const batch of asyncIterator) {
      yield parseSync2(batch, options, context);
    }
  },
  tests: [() => false],
  options: {
    null: {}
  }
};
function parseSync2(arrayBuffer, options, context) {
  return null;
}

// node_modules/@loaders.gl/core/dist/lib/progress/fetch-progress.js
async function fetchProgress(response, onProgress, onDone = () => {
}, onError = () => {
}) {
  response = await response;
  if (!response.ok) {
    return response;
  }
  const body = response.body;
  if (!body) {
    return response;
  }
  const contentLength = response.headers.get("content-length") || 0;
  const totalBytes = contentLength ? parseInt(contentLength) : 0;
  if (!(totalBytes > 0)) {
    return response;
  }
  if (typeof ReadableStream === "undefined" || !body.getReader) {
    return response;
  }
  const progressStream = new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      await read(controller, reader, 0, totalBytes, onProgress, onDone, onError);
    }
  });
  return new Response(progressStream);
}
async function read(controller, reader, loadedBytes, totalBytes, onProgress, onDone, onError) {
  try {
    const { done, value } = await reader.read();
    if (done) {
      onDone();
      controller.close();
      return;
    }
    loadedBytes += value.byteLength;
    const percent = Math.round(loadedBytes / totalBytes * 100);
    onProgress(percent, { loadedBytes, totalBytes });
    controller.enqueue(value);
    await read(controller, reader, loadedBytes, totalBytes, onProgress, onDone, onError);
  } catch (error) {
    controller.error(error);
    onError(error);
  }
}

// node_modules/@loaders.gl/core/dist/lib/filesystems/browser-filesystem.js
var BrowserFileSystem = class {
  /**
   * A FileSystem API wrapper around a list of browser 'File' objects
   * @param files
   * @param options
   */
  constructor(files, options) {
    __publicField(this, "_fetch");
    __publicField(this, "files", {});
    __publicField(this, "lowerCaseFiles", {});
    __publicField(this, "usedFiles", {});
    this._fetch = (options == null ? void 0 : options.fetch) || fetch;
    for (let i = 0; i < files.length; ++i) {
      const file = files[i];
      this.files[file.name] = file;
      this.lowerCaseFiles[file.name.toLowerCase()] = file;
      this.usedFiles[file.name] = false;
    }
    this.fetch = this.fetch.bind(this);
  }
  // implements IFileSystem
  /**
   * Implementation of fetch against this file system
   * Delegates to global fetch for http{s}:// or data://
   */
  async fetch(path, options) {
    if (path.includes("://")) {
      return this._fetch(path, options);
    }
    const file = this.files[path];
    if (!file) {
      return new Response(path, { status: 400, statusText: "NOT FOUND" });
    }
    const headers = new Headers(options == null ? void 0 : options.headers);
    const range = headers.get("Range");
    const bytes = range && /bytes=($1)-($2)/.exec(range);
    if (bytes) {
      const start = parseInt(bytes[1]);
      const end = parseInt(bytes[2]);
      const data = await file.slice(start, end).arrayBuffer();
      const response2 = new Response(data);
      Object.defineProperty(response2, "url", { value: path });
      return response2;
    }
    const response = new Response(file);
    Object.defineProperty(response, "url", { value: path });
    return response;
  }
  /**
   * List filenames in this filesystem
   * @param dirname
   * @returns
   */
  async readdir(dirname) {
    const files = [];
    for (const path in this.files) {
      files.push(path);
    }
    return files;
  }
  /**
   * Return information (size) about files in this file system
   */
  async stat(path, options) {
    const file = this.files[path];
    if (!file) {
      throw new Error(path);
    }
    return { size: file.size };
  }
  /**
   * Just removes the file from the list
   */
  async unlink(path) {
    delete this.files[path];
    delete this.lowerCaseFiles[path];
    this.usedFiles[path] = true;
  }
  // implements IRandomAccessFileSystem
  // RANDOM ACCESS
  async openReadableFile(pathname, flags) {
    return new BlobFile(this.files[pathname]);
  }
  // PRIVATE
  // Supports case independent paths, and file usage tracking
  _getFile(path, used) {
    const file = this.files[path] || this.lowerCaseFiles[path];
    if (file && used) {
      this.usedFiles[path] = true;
    }
    return file;
  }
};

export {
  isPureObject,
  isPromise,
  isIterable,
  isAsyncIterable,
  isIterator,
  isResponse,
  isReadableStream,
  isWritableStream,
  FetchError,
  fetchFile,
  readArrayBuffer,
  getGlobalLoaderOptions,
  setGlobalOptions,
  registerLoaders,
  _unregisterLoaders,
  selectLoader,
  selectLoaderSync,
  makeIterator,
  parse,
  parseSync,
  parseInBatches,
  load,
  loadInBatches,
  encodeTable,
  encodeTableAsText,
  encodeTableInBatches,
  encode,
  encodeSync,
  encodeText,
  encodeTextSync,
  encodeInBatches,
  encodeURLtoURL,
  createDataSource,
  selectSource2 as selectSource,
  makeStream,
  NullWorkerLoader,
  NullLoader,
  fetchProgress,
  BrowserFileSystem
};
//# sourceMappingURL=chunk-OLZ5K375.js.map

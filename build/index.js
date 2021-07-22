var JSZip = require('jszip');
var uint8arrayFromString = require('uint8arrays/from-string');
var uint8arrayToString = require('uint8arrays/to-string');
var nacl = require('tweetnacl');
var naclUtil = require('tweetnacl-util');
var contracts = require('@ethersproject/contracts');
var wallet = require('@ethersproject/wallet');
var providers = require('@ethersproject/providers');
var detectEthereumProvider = require('@metamask/detect-provider');
var pako = require('pako');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var JSZip__default = /*#__PURE__*/_interopDefaultLegacy(JSZip);
var uint8arrayFromString__default = /*#__PURE__*/_interopDefaultLegacy(uint8arrayFromString);
var uint8arrayToString__default = /*#__PURE__*/_interopDefaultLegacy(uint8arrayToString);
var nacl__default = /*#__PURE__*/_interopDefaultLegacy(nacl);
var naclUtil__default = /*#__PURE__*/_interopDefaultLegacy(naclUtil);
var detectEthereumProvider__default = /*#__PURE__*/_interopDefaultLegacy(detectEthereumProvider);
var pako__default = /*#__PURE__*/_interopDefaultLegacy(pako);

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

createCommonjsModule(function (module) {
var runtime = (function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  module.exports 
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
});

// used this as an example
// https://github.com/infotechinc/symmetric-encryption-in-browser/blob/master/crypto.js

/**
 * Encrypt a blob with a symmetric key
 * @param {Object} symmKey The symmetric key
 * @param {Blob} data The blob to encrypt
 * @returns {Blob} The encrypted blob
 */
var encryptWithSymmetricKey = function encryptWithSymmetricKey(symmKey, data) {
  try {
    // encrypt the zip with symmetric key
    var iv = window.crypto.getRandomValues(new Uint8Array(16));
    return Promise.resolve(crypto.subtle.encrypt({
      name: 'AES-CBC',
      iv: iv
    }, symmKey, data)).then(function (encryptedZipData) {
      var encryptedZipBlob = new Blob([iv, new Uint8Array(encryptedZipData)], {
        type: 'application/octet-stream'
      });
      return encryptedZipBlob;
    });
  } catch (e) {
    return Promise.reject(e);
  }
}; // borrowed from eth-sig-util from meatmask.

/**
 * Encrypt a blob with the public key of a receiver
 * @param {string} receiverPublicKey The base64 encoded 32 byte public key.  The corresponding private key will be able to decrypt this blob
 * @param {Blob} data The blob to encrypt
 * @param {string} version The encryption algorithm to use.  This should be set to "x25519-xsalsa20-poly1305" as no other algorithms are implemented right now.
 * @returns {Blob} The encrypted blob
 */

/**
 * Decrypt an encrypted blob with a symmetric key.  Uses AES-CBC via SubtleCrypto
 * @param {Blob} encryptedBlob The encrypted blob that should be decrypted
 * @param {Object} symmKey The symmetric key
 * @returns {Blob} The decrypted blob
 */
var decryptWithSymmetricKey = function decryptWithSymmetricKey(encryptedBlob, symmKey) {
  try {
    return Promise.resolve(encryptedBlob.slice(0, 16).arrayBuffer()).then(function (recoveredIv) {
      return Promise.resolve(encryptedBlob.slice(16).arrayBuffer()).then(function (encryptedZipArrayBuffer) {
        return Promise.resolve(crypto.subtle.decrypt({
          name: 'AES-CBC',
          iv: recoveredIv
        }, symmKey, encryptedZipArrayBuffer));
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var generateSymmetricKey = function generateSymmetricKey() {
  try {
    return Promise.resolve(crypto.subtle.generateKey(SYMM_KEY_ALGO_PARAMS, true, ['encrypt', 'decrypt']));
  } catch (e) {
    return Promise.reject(e);
  }
};
var importSymmetricKey = function importSymmetricKey(symmKey) {
  try {
    return Promise.resolve(crypto.subtle.importKey('raw', symmKey, SYMM_KEY_ALGO_PARAMS, true, ['encrypt', 'decrypt']));
  } catch (e) {
    return Promise.reject(e);
  }
};
var SYMM_KEY_ALGO_PARAMS = {
  name: 'AES-CBC',
  length: 256
};
function canonicalResourceIdFormatter(resId) {
  // need to return in the exact format below:
  return {
    baseUrl: resId.baseUrl,
    path: resId.path,
    orgId: resId.orgId
  };
}
function hashResourceId(resourceId) {
  var resId = canonicalResourceIdFormatter(resourceId);
  var toHash = JSON.stringify(resId);
  var encoder = new TextEncoder();
  var data = encoder.encode(toHash);
  return crypto.subtle.digest('SHA-256', data);
}
function canonicalAccessControlConditionFormatter(cond) {
  // need to return in the exact format below:

  /*
  pub struct JsonAccessControlCondition {
    pub contract_address: String,
    pub chain: String,
    pub standard_contract_type: String,
    pub method: String,
    pub parameters: Vec<String>,
    pub return_value_test: JsonReturnValueTest,
  }
  */
  return {
    contractAddress: cond.contractAddress,
    chain: cond.chain,
    standardContractType: cond.standardContractType,
    method: cond.method,
    parameters: cond.parameters,
    returnValueTest: cond.returnValueTest
  };
}
function hashAccessControlConditions(accessControlConditions) {
  var conds = accessControlConditions.map(function (c) {
    return canonicalAccessControlConditionFormatter(c);
  });
  var toHash = JSON.stringify(conds);
  var encoder = new TextEncoder();
  var data = encoder.encode(toHash);
  return crypto.subtle.digest('SHA-256', data);
}
function encryptWithPubKey(receiverPublicKey, data, version) {
  switch (version) {
    case 'x25519-xsalsa20-poly1305':
      {
        // generate ephemeral keypair
        var ephemeralKeyPair = nacl__default['default'].box.keyPair(); // assemble encryption parameters - from string to UInt8

        var pubKeyUInt8Array;

        try {
          pubKeyUInt8Array = naclUtil__default['default'].decodeBase64(receiverPublicKey);
        } catch (err) {
          throw new Error('Bad public key');
        } // padding?  not needed for c decryption?
        // const paddingBytes = new Uint8Array(32)
        // paddingBytes.fill(0)
        // const msgParamsUInt8Array = new Uint8Array([...paddingBytes, ...naclUtil.decodeUTF8(data)])


        var msgParamsUInt8Array = naclUtil__default['default'].decodeUTF8(data);
        var nonce = nacl__default['default'].randomBytes(nacl__default['default'].box.nonceLength); // encrypt

        var encryptedMessage = nacl__default['default'].box(msgParamsUInt8Array, nonce, pubKeyUInt8Array, ephemeralKeyPair.secretKey); // handle encrypted data

        var output = {
          version: 'x25519-xsalsa20-poly1305',
          nonce: naclUtil__default['default'].encodeBase64(nonce),
          ephemPublicKey: naclUtil__default['default'].encodeBase64(ephemeralKeyPair.publicKey),
          ciphertext: naclUtil__default['default'].encodeBase64(encryptedMessage)
        }; // return encrypted msg data

        return output;
      }

    default:
      throw new Error('Encryption type/version not supported');
  }
} // borrowed from eth-sig-util from meatmask.

/**
 * Decrypt a blob with a private key
 * @param {Blob} encryptedData The blob to decrypt
 * @param {string} receiverPrivateKey The base64 encoded 32 byte private key.  The corresponding public key was used to encrypt this blob
 * @param {string} version The encryption algorithm to use.  This should be set to "x25519-xsalsa20-poly1305" as no other algorithms are implemented right now.
 * @returns {Blob} The decrypted blob
 */

function decryptWithPrivKey(encryptedData, receiverPrivateKey) {
  switch (encryptedData.version) {
    case 'x25519-xsalsa20-poly1305':
      {
        var recieverEncryptionPrivateKey = naclUtil__default['default'].decodeBase64(receiverPrivateKey); // assemble decryption parameters

        var nonce = naclUtil__default['default'].decodeBase64(encryptedData.nonce);
        var ciphertext = naclUtil__default['default'].decodeBase64(encryptedData.ciphertext);
        var ephemPublicKey = naclUtil__default['default'].decodeBase64(encryptedData.ephemPublicKey); // decrypt

        var decryptedMessage = nacl__default['default'].box.open(ciphertext, nonce, ephemPublicKey, recieverEncryptionPrivateKey); // return decrypted msg data

        var output;

        try {
          output = naclUtil__default['default'].encodeUTF8(decryptedMessage);
        } catch (err) {
          throw new Error('Decryption failed.  Could not encode result as utf8');
        }

        if (output) {
          return output;
        }

        throw new Error('Decryption failed.  Output is falsy');
      }

    default:
      throw new Error('Encryption type/version not supported.');
  }
}

var contractName = "LIT";
var abi = [
	{
		inputs: [
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "operator",
				type: "address"
			},
			{
				indexed: false,
				internalType: "bool",
				name: "approved",
				type: "bool"
			}
		],
		name: "ApprovalForAll",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "userAddress",
				type: "address"
			},
			{
				indexed: false,
				internalType: "address payable",
				name: "relayerAddress",
				type: "address"
			},
			{
				indexed: false,
				internalType: "bytes",
				name: "functionSignature",
				type: "bytes"
			}
		],
		name: "MetaTransactionExecuted",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "operator",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256[]",
				name: "ids",
				type: "uint256[]"
			},
			{
				indexed: false,
				internalType: "uint256[]",
				name: "values",
				type: "uint256[]"
			}
		],
		name: "TransferBatch",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "operator",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "id",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "TransferSingle",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "string",
				name: "value",
				type: "string"
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "id",
				type: "uint256"
			}
		],
		name: "URI",
		type: "event"
	},
	{
		inputs: [
		],
		name: "ERC712_VERSION",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function",
		constant: true
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "id",
				type: "uint256"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function",
		constant: true
	},
	{
		inputs: [
			{
				internalType: "address[]",
				name: "accounts",
				type: "address[]"
			},
			{
				internalType: "uint256[]",
				name: "ids",
				type: "uint256[]"
			}
		],
		name: "balanceOfBatch",
		outputs: [
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]"
			}
		],
		stateMutability: "view",
		type: "function",
		constant: true
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "userAddress",
				type: "address"
			},
			{
				internalType: "bytes",
				name: "functionSignature",
				type: "bytes"
			},
			{
				internalType: "bytes32",
				name: "sigR",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "sigS",
				type: "bytes32"
			},
			{
				internalType: "uint8",
				name: "sigV",
				type: "uint8"
			}
		],
		name: "executeMetaTransaction",
		outputs: [
			{
				internalType: "bytes",
				name: "",
				type: "bytes"
			}
		],
		stateMutability: "payable",
		type: "function",
		payable: true
	},
	{
		inputs: [
		],
		name: "getChainId",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "pure",
		type: "function",
		constant: true
	},
	{
		inputs: [
		],
		name: "getDomainSeperator",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function",
		constant: true
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "user",
				type: "address"
			}
		],
		name: "getNonce",
		outputs: [
			{
				internalType: "uint256",
				name: "nonce",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function",
		constant: true
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256[]",
				name: "ids",
				type: "uint256[]"
			},
			{
				internalType: "uint256[]",
				name: "amounts",
				type: "uint256[]"
			},
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			}
		],
		name: "safeBatchTransferFrom",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "id",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			},
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			}
		],
		name: "safeTransferFrom",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "operator",
				type: "address"
			},
			{
				internalType: "bool",
				name: "approved",
				type: "bool"
			}
		],
		name: "setApprovalForAll",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes4",
				name: "interfaceId",
				type: "bytes4"
			}
		],
		name: "supportsInterface",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function",
		constant: true
	},
	{
		inputs: [
		],
		name: "tokenIds",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function",
		constant: true
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		name: "uri",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function",
		constant: true
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "quantity",
				type: "uint256"
			}
		],
		name: "mint",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_owner",
				type: "address"
			},
			{
				internalType: "address",
				name: "_operator",
				type: "address"
			}
		],
		name: "isApprovedForAll",
		outputs: [
			{
				internalType: "bool",
				name: "isOperator",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function",
		constant: true
	},
	{
		inputs: [
			{
				internalType: "bool",
				name: "enabled",
				type: "bool"
			}
		],
		name: "setOpenseaProxyEnabled",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "newAdmin",
				type: "address"
			}
		],
		name: "changeAdmin",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "uri",
				type: "string"
			}
		],
		name: "setURI",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "getAdmin",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function",
		constant: true
	}
];
var metadata = "{\"compiler\":{\"version\":\"0.7.6+commit.7338295f\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"bool\",\"name\":\"approved\",\"type\":\"bool\"}],\"name\":\"ApprovalForAll\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"address\",\"name\":\"userAddress\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"address payable\",\"name\":\"relayerAddress\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"functionSignature\",\"type\":\"bytes\"}],\"name\":\"MetaTransactionExecuted\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256[]\",\"name\":\"ids\",\"type\":\"uint256[]\"},{\"indexed\":false,\"internalType\":\"uint256[]\",\"name\":\"values\",\"type\":\"uint256[]\"}],\"name\":\"TransferBatch\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"id\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"TransferSingle\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"string\",\"name\":\"value\",\"type\":\"string\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"id\",\"type\":\"uint256\"}],\"name\":\"URI\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"ERC712_VERSION\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"id\",\"type\":\"uint256\"}],\"name\":\"balanceOf\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address[]\",\"name\":\"accounts\",\"type\":\"address[]\"},{\"internalType\":\"uint256[]\",\"name\":\"ids\",\"type\":\"uint256[]\"}],\"name\":\"balanceOfBatch\",\"outputs\":[{\"internalType\":\"uint256[]\",\"name\":\"\",\"type\":\"uint256[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newAdmin\",\"type\":\"address\"}],\"name\":\"changeAdmin\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"userAddress\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"functionSignature\",\"type\":\"bytes\"},{\"internalType\":\"bytes32\",\"name\":\"sigR\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"sigS\",\"type\":\"bytes32\"},{\"internalType\":\"uint8\",\"name\":\"sigV\",\"type\":\"uint8\"}],\"name\":\"executeMetaTransaction\",\"outputs\":[{\"internalType\":\"bytes\",\"name\":\"\",\"type\":\"bytes\"}],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getAdmin\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getChainId\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getDomainSeperator\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"}],\"name\":\"getNonce\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"nonce\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"_operator\",\"type\":\"address\"}],\"name\":\"isApprovedForAll\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"isOperator\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"quantity\",\"type\":\"uint256\"}],\"name\":\"mint\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256[]\",\"name\":\"ids\",\"type\":\"uint256[]\"},{\"internalType\":\"uint256[]\",\"name\":\"amounts\",\"type\":\"uint256[]\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"safeBatchTransferFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"id\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"safeTransferFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"approved\",\"type\":\"bool\"}],\"name\":\"setApprovalForAll\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bool\",\"name\":\"enabled\",\"type\":\"bool\"}],\"name\":\"setOpenseaProxyEnabled\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"uri\",\"type\":\"string\"}],\"name\":\"setURI\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"tokenIds\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"uri\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"}],\"devdoc\":{\"kind\":\"dev\",\"methods\":{\"balanceOf(address,uint256)\":{\"details\":\"See {IERC1155-balanceOf}. Requirements: - `account` cannot be the zero address.\"},\"balanceOfBatch(address[],uint256[])\":{\"details\":\"See {IERC1155-balanceOfBatch}. Requirements: - `accounts` and `ids` must have the same length.\"},\"changeAdmin(address)\":{\"details\":\"admin function to set new root admin.\",\"params\":{\"newAdmin\":\"address the new admin to assign, which manages delegates\"}},\"safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)\":{\"details\":\"See {IERC1155-safeBatchTransferFrom}.\"},\"safeTransferFrom(address,address,uint256,uint256,bytes)\":{\"details\":\"See {IERC1155-safeTransferFrom}.\"},\"setApprovalForAll(address,bool)\":{\"details\":\"See {IERC1155-setApprovalForAll}.\"},\"supportsInterface(bytes4)\":{\"details\":\"See {IERC165-supportsInterface}. Time complexity O(1), guaranteed to always use less than 30 000 gas.\"},\"uri(uint256)\":{\"details\":\"See {IERC1155MetadataURI-uri}. This implementation returns the same URI for *all* token types. It relies on the token type ID substitution mechanism https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP]. Clients calling this function must replace the `\\\\{id\\\\}` substring with the actual token type ID.\"}},\"version\":1},\"userdoc\":{\"kind\":\"user\",\"methods\":{\"getAdmin()\":{\"notice\":\"Read APIs\"},\"isApprovedForAll(address,address)\":{\"notice\":\"Override isApprovedForAll to whitelist opensea proxy account\"},\"setOpenseaProxyEnabled(bool)\":{\"notice\":\"Admin APIs\"}},\"version\":1}},\"settings\":{\"compilationTarget\":{\"/Users/chris/Documents/WorkStuff/LIT/mintlit/contracts/src/contracts/LIT.sol\":\"LIT\"},\"evmVersion\":\"istanbul\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":false,\"runs\":200},\"remappings\":[]},\"sources\":{\"/Users/chris/Documents/WorkStuff/LIT/mintlit/contracts/src/contracts/ERC1155.sol\":{\"keccak256\":\"0x1c4d9a18579d74ca8fd18e4afaba77118e491612d2bcea04f5a097ade602556f\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://611a4f1b3b4d0073d2732ef8b5ca50c0f33a061cb90ed9d612f8fdc726722aef\",\"dweb:/ipfs/QmS6oqtn2nWkQWepekkaVP4prJWLAHYakHw3qCUvziMxG5\"]},\"/Users/chris/Documents/WorkStuff/LIT/mintlit/contracts/src/contracts/LIT.sol\":{\"keccak256\":\"0x16fbbc97e76ad8a9e2fa54556addc30b73df9e5b8b2e6975dba9ec41b2fde60b\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://79a87e165eb6648bbce6e2cd9e312e7aa95f674b338fbc3dc8e0648f52257bcf\",\"dweb:/ipfs/QmdP81pH4XtzMZJuiVgxQn2aNzzBNsEHU6XbP2aYThr8CE\"]},\"/Users/chris/Documents/WorkStuff/LIT/mintlit/contracts/src/contracts/MetaTxns.sol\":{\"keccak256\":\"0x321dcd01acff55ccc5372c1de2b71ee9d1d4a391e628c436a9cbd4c3dae2b8f4\",\"urls\":[\"bzz-raw://edc30cfa28ef73745a6ddbcbb6f27261435fc33747a47af18cd4419aef67b974\",\"dweb:/ipfs/QmQUwEvnpiygdSEWoG2z4qww6xB4YbSLHkvkxKz1wX9W5v\"]},\"/Users/chris/Documents/WorkStuff/LIT/mintlit/contracts/src/contracts/SafeMath.sol\":{\"keccak256\":\"0x0044002cb0b1570ad75c4da298e8c7f2ca0d57266ace04b5b8ca6c7fd33b0c7e\",\"urls\":[\"bzz-raw://251409859e2b62251da6927ff9ff5fba6a213e81f69c52c37ef077d4e3d5269d\",\"dweb:/ipfs/QmXzpYZLJ5TTDDJdkLXghoM4KV3JUkmVGXcvERJjjYkNxa\"]}},\"version\":1}";
var bytecode = "0x60806040526000600460006101000a81548160ff0219169083151502179055503480156200002c57600080fd5b506040518060600160405280602981526020016200391b602991396200005f6301ffc9a760e01b6200014960201b60201c565b62000070816200025260201b60201c565b6200008863d9b67a2660e01b6200014960201b60201c565b620000a0630e89341c60e01b6200014960201b60201c565b5033600860006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506001600860146101000a81548160ff021916908315150217905550620001436040518060400160405280600381526020017f4c495400000000000000000000000000000000000000000000000000000000008152506200026e60201b60201c565b620004bf565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161415620001e6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f4552433136353a20696e76616c696420696e746572666163652069640000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b80600390805190602001906200026a92919062000409565b5050565b600460009054906101000a900460ff1615620002f2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600e8152602001807f616c726561647920696e6974656400000000000000000000000000000000000081525060200191505060405180910390fd5b62000303816200032160201b60201c565b6001600460006101000a81548160ff02191690831515021790555050565b6040518060800160405280604f815260200162003944604f91398051906020012081805190602001206040518060400160405280600181526020017f3100000000000000000000000000000000000000000000000000000000000000815250805190602001203062000398620003fc60201b60201c565b60001b604051602001808681526020018581526020018481526020018373ffffffffffffffffffffffffffffffffffffffff168152602001828152602001955050505050506040516020818303038152906040528051906020012060058190555050565b6000804690508091505090565b828054600181600116156101000203166002900490600052602060002090601f0160209004810192826200044157600085556200048d565b82601f106200045c57805160ff19168380011785556200048d565b828001600101855582156200048d579182015b828111156200048c5782518255916020019190600101906200046f565b5b5090506200049c9190620004a0565b5090565b5b80821115620004bb576000816000905550600101620004a1565b5090565b61344c80620004cf6000396000f3fe6080604052600436106101135760003560e01c80633408e470116100a05780638f283970116100645780638f28397014610aba578063a0712d6814610b0b578063a22cb46514610b5a578063e985e9c514610bb7578063f242432a14610c3e57610113565b80633408e470146108385780634cc63d6c146108635780634e1273f4146108a05780636e9960c314610a4e578063714cff5614610a8f57610113565b80630e89341c116100e75780630e89341c146104345780630f7e5970146104e857806320379ee5146105785780632d0335ab146105a35780632eb2c2d61461060857610113565b8062fdd58e1461011857806301ffc9a71461018757806302fe5305146101f75780630c53c51c146102bf575b600080fd5b34801561012457600080fd5b506101716004803603604081101561013b57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610d5a565b6040518082815260200191505060405180910390f35b34801561019357600080fd5b506101df600480360360208110156101aa57600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19169060200190929190505050610e3a565b60405180821515815260200191505060405180910390f35b34801561020357600080fd5b506102bd6004803603602081101561021a57600080fd5b810190808035906020019064010000000081111561023757600080fd5b82018360208201111561024957600080fd5b8035906020019184600183028401116401000000008311171561026b57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050610ea1565b005b6103b9600480360360a08110156102d557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019064010000000081111561031257600080fd5b82018360208201111561032457600080fd5b8035906020019184600183028401116401000000008311171561034657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019092919080359060200190929190803560ff169060200190929190505050610f70565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156103f95780820151818401526020810190506103de565b50505050905090810190601f1680156104265780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561044057600080fd5b5061046d6004803603602081101561045757600080fd5b810190808035906020019092919050505061137d565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156104ad578082015181840152602081019050610492565b50505050905090810190601f1680156104da5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156104f457600080fd5b506104fd611421565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561053d578082015181840152602081019050610522565b50505050905090810190601f16801561056a5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561058457600080fd5b5061058d61145a565b6040518082815260200191505060405180910390f35b3480156105af57600080fd5b506105f2600480360360208110156105c657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611464565b6040518082815260200191505060405180910390f35b34801561061457600080fd5b50610836600480360360a081101561062b57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019064010000000081111561068857600080fd5b82018360208201111561069a57600080fd5b803590602001918460208302840111640100000000831117156106bc57600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561071c57600080fd5b82018360208201111561072e57600080fd5b8035906020019184602083028401116401000000008311171561075057600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290803590602001906401000000008111156107b057600080fd5b8201836020820111156107c257600080fd5b803590602001918460018302840111640100000000831117156107e457600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506114ad565b005b34801561084457600080fd5b5061084d611938565b6040518082815260200191505060405180910390f35b34801561086f57600080fd5b5061089e6004803603602081101561088657600080fd5b81019080803515159060200190929190505050611945565b005b3480156108ac57600080fd5b506109f7600480360360408110156108c357600080fd5b81019080803590602001906401000000008111156108e057600080fd5b8201836020820111156108f257600080fd5b8035906020019184602083028401116401000000008311171561091457600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561097457600080fd5b82018360208201111561098657600080fd5b803590602001918460208302840111640100000000831117156109a857600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290505050611a25565b6040518080602001828103825283818151815260200191508051906020019060200280838360005b83811015610a3a578082015181840152602081019050610a1f565b505050509050019250505060405180910390f35b348015610a5a57600080fd5b50610a63611b37565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b348015610a9b57600080fd5b50610aa4611b61565b6040518082815260200191505060405180910390f35b348015610ac657600080fd5b50610b0960048036036020811015610add57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611b67565b005b348015610b1757600080fd5b50610b4460048036036020811015610b2e57600080fd5b8101908080359060200190929190505050611c6e565b6040518082815260200191505060405180910390f35b348015610b6657600080fd5b50610bb560048036036040811015610b7d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803515159060200190929190505050611ca9565b005b348015610bc357600080fd5b50610c2660048036036040811015610bda57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611e42565b60405180821515815260200191505060405180910390f35b348015610c4a57600080fd5b50610d58600480360360a0811015610c6157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019092919080359060200190640100000000811115610cd257600080fd5b820183602082011115610ce457600080fd5b80359060200191846001830284011164010000000083111715610d0657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611ec7565b005b60008073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610de1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b81526020018061321e602b913960400191505060405180910390fd5b6001600083815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b600860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610f64576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600a8152602001807f4f6e6c792041646d696e0000000000000000000000000000000000000000000081525060200191505060405180910390fd5b610f6d8161223c565b50565b606060006040518060600160405280600660008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205481526020018873ffffffffffffffffffffffffffffffffffffffff168152602001878152509050610ff38782878787612256565b611048576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602181526020018061335b6021913960400191505060405180910390fd5b61109b6001600660008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461238a90919063ffffffff16565b600660008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055507f5845892132946850460bff5a0083f71031bc5bf9aadcd40f1de79423eac9b10b873388604051808473ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff16815260200180602001828103825283818151815260200191508051906020019080838360005b8381101561117a57808201518184015260208101905061115f565b50505050905090810190601f1680156111a75780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a16000803073ffffffffffffffffffffffffffffffffffffffff16888a6040516020018083805190602001908083835b6020831061120857805182526020820191506020810190506020830392506111e5565b6001836020036101000a0380198251168184511680821785525050505050509050018273ffffffffffffffffffffffffffffffffffffffff1660601b8152601401925050506040516020818303038152906040526040518082805190602001908083835b6020831061128f578051825260208201915060208101905060208303925061126c565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d80600081146112f1576040519150601f19603f3d011682016040523d82523d6000602084013e6112f6565b606091505b50915091508161136e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f46756e6374696f6e2063616c6c206e6f74207375636365737366756c0000000081525060200191505060405180910390fd5b80935050505095945050505050565b606060038054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156114155780601f106113ea57610100808354040283529160200191611415565b820191906000526020600020905b8154815290600101906020018083116113f857829003601f168201915b50505050509050919050565b6040518060400160405280600181526020017f310000000000000000000000000000000000000000000000000000000000000081525081565b6000600554905090565b6000600660008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b8151835114611507576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806133ce6028913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16141561158d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806132da6025913960400191505060405180910390fd5b611595612412565b73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff1614806115db57506115da856115d5612412565b611e42565b5b611630576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260328152602001806132ff6032913960400191505060405180910390fd5b600061163a612412565b905061164a818787878787612421565b60005b845181101561181b57600085828151811061166457fe5b60200260200101519050600085838151811061167c57fe5b60200260200101519050611703816040518060600160405280602a8152602001613331602a91396001600086815260200190815260200160002060008d73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546124299092919063ffffffff16565b6001600084815260200190815260200160002060008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055506117ba816001600085815260200190815260200160002060008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461238a90919063ffffffff16565b6001600084815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505080600101905061164d565b508473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb8787604051808060200180602001838103835285818151815260200191508051906020019060200280838360005b838110156118cb5780820151818401526020810190506118b0565b50505050905001838103825284818151815260200191508051906020019060200280838360005b8381101561190d5780820151818401526020810190506118f2565b5050505090500194505050505060405180910390a46119308187878787876124e3565b505050505050565b6000804690508091505090565b600860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614611a08576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600a8152602001807f4f6e6c792041646d696e0000000000000000000000000000000000000000000081525060200191505060405180910390fd5b80600860146101000a81548160ff02191690831515021790555050565b60608151835114611a81576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260298152602001806133a56029913960400191505060405180910390fd5b6000835167ffffffffffffffff81118015611a9b57600080fd5b50604051908082528060200260200182016040528015611aca5781602001602082028036833780820191505090505b50905060005b8451811015611b2c57611b09858281518110611ae857fe5b6020026020010151858381518110611afc57fe5b6020026020010151610d5a565b828281518110611b1557fe5b602002602001018181525050806001019050611ad0565b508091505092915050565b6000600860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60075481565b600860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614611c2a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600a8152602001807f4f6e6c792041646d696e0000000000000000000000000000000000000000000081525060200191505060405180910390fd5b80600860006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600760008154809291906001019190505550611c9f336007548460405180602001604052806000815250612872565b6007549050919050565b8173ffffffffffffffffffffffffffffffffffffffff16611cc8612412565b73ffffffffffffffffffffffffffffffffffffffff161415611d35576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602981526020018061337c6029913960400191505060405180910390fd5b8060026000611d42612412565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff16611def612412565b73ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c318360405180821515815260200191505060405180910390a35050565b600073207fa8df3a17d96ca7ea4f2893fcdcb78a30410173ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16148015611ea6575060011515600860149054906101000a900460ff161515145b15611eb45760019050611ec1565b611ebe8383612a75565b90505b92915050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161415611f4d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806132da6025913960400191505060405180910390fd5b611f55612412565b73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff161480611f9b5750611f9a85611f95612412565b611e42565b5b611ff0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602981526020018061328c6029913960400191505060405180910390fd5b6000611ffa612412565b905061201a81878761200b88612b09565b61201488612b09565b87612421565b612097836040518060600160405280602a8152602001613331602a91396001600088815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546124299092919063ffffffff16565b6001600086815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061214e836001600087815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461238a90919063ffffffff16565b6001600086815260200190815260200160002060008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f628787604051808381526020018281526020019250505060405180910390a4612234818787878787612b7a565b505050505050565b8060039080519060200190612252929190613042565b5050565b60008073ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff1614156122dd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806132b56025913960400191505060405180910390fd5b60016122f06122eb87612e87565b612f17565b83868660405160008152602001604052604051808581526020018460ff1681526020018381526020018281526020019450505050506020604051602081039080840390855afa158015612347573d6000803e3d6000fd5b5050506020604051035173ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff1614905095945050505050565b600080828401905083811015612408576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b600061241c612f7e565b905090565b505050505050565b60008383111582906124d6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561249b578082015181840152602081019050612480565b50505050905090810190601f1680156124c85780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b5082840390509392505050565b6125028473ffffffffffffffffffffffffffffffffffffffff1661302f565b1561286a578373ffffffffffffffffffffffffffffffffffffffff1663bc197c8187878686866040518663ffffffff1660e01b8152600401808673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff168152602001806020018060200180602001848103845287818151815260200191508051906020019060200280838360005b838110156125ba57808201518184015260208101905061259f565b50505050905001848103835286818151815260200191508051906020019060200280838360005b838110156125fc5780820151818401526020810190506125e1565b50505050905001848103825285818151815260200191508051906020019080838360005b8381101561263b578082015181840152602081019050612620565b50505050905090810190601f1680156126685780820380516001836020036101000a031916815260200191505b5098505050505050505050602060405180830381600087803b15801561268d57600080fd5b505af19250505080156126c157506040513d60208110156126ad57600080fd5b810190808051906020019092919050505060015b6127cb576126cd61310b565b806126d8575061277a565b806040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561273f578082015181840152602081019050612724565b50505050905090810190601f16801561276c5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b6040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260348152602001806131c26034913960400191505060405180910390fd5b63bc197c8160e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614612868576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806131f66028913960400191505060405180910390fd5b505b505050505050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1614156128f8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806133f66021913960400191505060405180910390fd5b6000612902612412565b90506129238160008761291488612b09565b61291d88612b09565b87612421565b612986836001600087815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461238a90919063ffffffff16565b6001600086815260200190815260200160002060008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508473ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f628787604051808381526020018281526020019250505060405180910390a4612a6e81600087878787612b7a565b5050505050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b60606000600167ffffffffffffffff81118015612b2557600080fd5b50604051908082528060200260200182016040528015612b545781602001602082028036833780820191505090505b5090508281600081518110612b6557fe5b60200260200101818152505080915050919050565b612b998473ffffffffffffffffffffffffffffffffffffffff1661302f565b15612e7f578373ffffffffffffffffffffffffffffffffffffffff1663f23a6e6187878686866040518663ffffffff1660e01b8152600401808673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff16815260200184815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015612c52578082015181840152602081019050612c37565b50505050905090810190601f168015612c7f5780820380516001836020036101000a031916815260200191505b509650505050505050602060405180830381600087803b158015612ca257600080fd5b505af1925050508015612cd657506040513d6020811015612cc257600080fd5b810190808051906020019092919050505060015b612de057612ce261310b565b80612ced5750612d8f565b806040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b83811015612d54578082015181840152602081019050612d39565b50505050905090810190601f168015612d815780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b6040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260348152602001806131c26034913960400191505060405180910390fd5b63f23a6e6160e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614612e7d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806131f66028913960400191505060405180910390fd5b505b505050505050565b6000604051806080016040528060438152602001613249604391398051906020012082600001518360200151846040015180519060200120604051602001808581526020018481526020018373ffffffffffffffffffffffffffffffffffffffff168152602001828152602001945050505050604051602081830303815290604052805190602001209050919050565b6000612f2161145a565b8260405160200180807f190100000000000000000000000000000000000000000000000000000000000081525060020183815260200182815260200192505050604051602081830303815290604052805190602001209050919050565b60003073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561302857600080368080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509050600080369050905073ffffffffffffffffffffffffffffffffffffffff81830151169250505061302c565b3390505b90565b600080823b905060008111915050919050565b828054600181600116156101000203166002900490600052602060002090601f01602090048101928261307857600085556130bf565b82601f1061309157805160ff19168380011785556130bf565b828001600101855582156130bf579182015b828111156130be5782518255916020019190600101906130a3565b5b5090506130cc91906130d0565b5090565b5b808211156130e95760008160009055506001016130d1565b5090565b6000601f19601f8301169050919050565b60008160e01c9050919050565b600060443d101561311b576131be565b60046000803e61312c6000516130fe565b6308c379a0811461313d57506131be565b60405160043d036004823e80513d602482011167ffffffffffffffff82111715613169575050506131be565b808201805167ffffffffffffffff8111156131885750505050506131be565b8060208301013d85018111156131a3575050505050506131be565b6131ac826130ed565b60208401016040528296505050505050505b9056fe455243313135353a207472616e7366657220746f206e6f6e2045524331313535526563656976657220696d706c656d656e746572455243313135353a204552433131353552656365697665722072656a656374656420746f6b656e73455243313135353a2062616c616e636520717565727920666f7220746865207a65726f20616464726573734d6574615472616e73616374696f6e2875696e74323536206e6f6e63652c616464726573732066726f6d2c62797465732066756e6374696f6e5369676e617475726529455243313135353a2063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f7665644e61746976654d6574615472616e73616374696f6e3a20494e56414c49445f5349474e4552455243313135353a207472616e7366657220746f20746865207a65726f2061646472657373455243313135353a207472616e736665722063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f766564455243313135353a20696e73756666696369656e742062616c616e636520666f72207472616e736665725369676e657220616e64207369676e617475726520646f206e6f74206d61746368455243313135353a2073657474696e6720617070726f76616c2073746174757320666f722073656c66455243313135353a206163636f756e747320616e6420696473206c656e677468206d69736d61746368455243313135353a2069647320616e6420616d6f756e7473206c656e677468206d69736d61746368455243313135353a206d696e7420746f20746865207a65726f2061646472657373a26469706673582212200038f017570fc347d421eb6064ab6c0786b1e20a0ddfbd2194cd4a889c7c7d2164736f6c6343000706003368747470733a2f2f6d696e746c69742e636f6d2f6d657461646174612f706f6c79676f6e2f7b69647d454950373132446f6d61696e28737472696e67206e616d652c737472696e672076657273696f6e2c6164647265737320766572696679696e67436f6e74726163742c627974657333322073616c7429";
var deployedBytecode = "0x6080604052600436106101135760003560e01c80633408e470116100a05780638f283970116100645780638f28397014610aba578063a0712d6814610b0b578063a22cb46514610b5a578063e985e9c514610bb7578063f242432a14610c3e57610113565b80633408e470146108385780634cc63d6c146108635780634e1273f4146108a05780636e9960c314610a4e578063714cff5614610a8f57610113565b80630e89341c116100e75780630e89341c146104345780630f7e5970146104e857806320379ee5146105785780632d0335ab146105a35780632eb2c2d61461060857610113565b8062fdd58e1461011857806301ffc9a71461018757806302fe5305146101f75780630c53c51c146102bf575b600080fd5b34801561012457600080fd5b506101716004803603604081101561013b57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610d5a565b6040518082815260200191505060405180910390f35b34801561019357600080fd5b506101df600480360360208110156101aa57600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19169060200190929190505050610e3a565b60405180821515815260200191505060405180910390f35b34801561020357600080fd5b506102bd6004803603602081101561021a57600080fd5b810190808035906020019064010000000081111561023757600080fd5b82018360208201111561024957600080fd5b8035906020019184600183028401116401000000008311171561026b57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050610ea1565b005b6103b9600480360360a08110156102d557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019064010000000081111561031257600080fd5b82018360208201111561032457600080fd5b8035906020019184600183028401116401000000008311171561034657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019092919080359060200190929190803560ff169060200190929190505050610f70565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156103f95780820151818401526020810190506103de565b50505050905090810190601f1680156104265780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561044057600080fd5b5061046d6004803603602081101561045757600080fd5b810190808035906020019092919050505061137d565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156104ad578082015181840152602081019050610492565b50505050905090810190601f1680156104da5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156104f457600080fd5b506104fd611421565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561053d578082015181840152602081019050610522565b50505050905090810190601f16801561056a5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561058457600080fd5b5061058d61145a565b6040518082815260200191505060405180910390f35b3480156105af57600080fd5b506105f2600480360360208110156105c657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611464565b6040518082815260200191505060405180910390f35b34801561061457600080fd5b50610836600480360360a081101561062b57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019064010000000081111561068857600080fd5b82018360208201111561069a57600080fd5b803590602001918460208302840111640100000000831117156106bc57600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561071c57600080fd5b82018360208201111561072e57600080fd5b8035906020019184602083028401116401000000008311171561075057600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290803590602001906401000000008111156107b057600080fd5b8201836020820111156107c257600080fd5b803590602001918460018302840111640100000000831117156107e457600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506114ad565b005b34801561084457600080fd5b5061084d611938565b6040518082815260200191505060405180910390f35b34801561086f57600080fd5b5061089e6004803603602081101561088657600080fd5b81019080803515159060200190929190505050611945565b005b3480156108ac57600080fd5b506109f7600480360360408110156108c357600080fd5b81019080803590602001906401000000008111156108e057600080fd5b8201836020820111156108f257600080fd5b8035906020019184602083028401116401000000008311171561091457600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561097457600080fd5b82018360208201111561098657600080fd5b803590602001918460208302840111640100000000831117156109a857600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290505050611a25565b6040518080602001828103825283818151815260200191508051906020019060200280838360005b83811015610a3a578082015181840152602081019050610a1f565b505050509050019250505060405180910390f35b348015610a5a57600080fd5b50610a63611b37565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b348015610a9b57600080fd5b50610aa4611b61565b6040518082815260200191505060405180910390f35b348015610ac657600080fd5b50610b0960048036036020811015610add57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611b67565b005b348015610b1757600080fd5b50610b4460048036036020811015610b2e57600080fd5b8101908080359060200190929190505050611c6e565b6040518082815260200191505060405180910390f35b348015610b6657600080fd5b50610bb560048036036040811015610b7d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803515159060200190929190505050611ca9565b005b348015610bc357600080fd5b50610c2660048036036040811015610bda57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611e42565b60405180821515815260200191505060405180910390f35b348015610c4a57600080fd5b50610d58600480360360a0811015610c6157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019092919080359060200190640100000000811115610cd257600080fd5b820183602082011115610ce457600080fd5b80359060200191846001830284011164010000000083111715610d0657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611ec7565b005b60008073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610de1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b81526020018061321e602b913960400191505060405180910390fd5b6001600083815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b600860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610f64576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600a8152602001807f4f6e6c792041646d696e0000000000000000000000000000000000000000000081525060200191505060405180910390fd5b610f6d8161223c565b50565b606060006040518060600160405280600660008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205481526020018873ffffffffffffffffffffffffffffffffffffffff168152602001878152509050610ff38782878787612256565b611048576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602181526020018061335b6021913960400191505060405180910390fd5b61109b6001600660008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461238a90919063ffffffff16565b600660008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055507f5845892132946850460bff5a0083f71031bc5bf9aadcd40f1de79423eac9b10b873388604051808473ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff16815260200180602001828103825283818151815260200191508051906020019080838360005b8381101561117a57808201518184015260208101905061115f565b50505050905090810190601f1680156111a75780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a16000803073ffffffffffffffffffffffffffffffffffffffff16888a6040516020018083805190602001908083835b6020831061120857805182526020820191506020810190506020830392506111e5565b6001836020036101000a0380198251168184511680821785525050505050509050018273ffffffffffffffffffffffffffffffffffffffff1660601b8152601401925050506040516020818303038152906040526040518082805190602001908083835b6020831061128f578051825260208201915060208101905060208303925061126c565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d80600081146112f1576040519150601f19603f3d011682016040523d82523d6000602084013e6112f6565b606091505b50915091508161136e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f46756e6374696f6e2063616c6c206e6f74207375636365737366756c0000000081525060200191505060405180910390fd5b80935050505095945050505050565b606060038054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156114155780601f106113ea57610100808354040283529160200191611415565b820191906000526020600020905b8154815290600101906020018083116113f857829003601f168201915b50505050509050919050565b6040518060400160405280600181526020017f310000000000000000000000000000000000000000000000000000000000000081525081565b6000600554905090565b6000600660008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b8151835114611507576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806133ce6028913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16141561158d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806132da6025913960400191505060405180910390fd5b611595612412565b73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff1614806115db57506115da856115d5612412565b611e42565b5b611630576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260328152602001806132ff6032913960400191505060405180910390fd5b600061163a612412565b905061164a818787878787612421565b60005b845181101561181b57600085828151811061166457fe5b60200260200101519050600085838151811061167c57fe5b60200260200101519050611703816040518060600160405280602a8152602001613331602a91396001600086815260200190815260200160002060008d73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546124299092919063ffffffff16565b6001600084815260200190815260200160002060008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055506117ba816001600085815260200190815260200160002060008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461238a90919063ffffffff16565b6001600084815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505080600101905061164d565b508473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb8787604051808060200180602001838103835285818151815260200191508051906020019060200280838360005b838110156118cb5780820151818401526020810190506118b0565b50505050905001838103825284818151815260200191508051906020019060200280838360005b8381101561190d5780820151818401526020810190506118f2565b5050505090500194505050505060405180910390a46119308187878787876124e3565b505050505050565b6000804690508091505090565b600860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614611a08576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600a8152602001807f4f6e6c792041646d696e0000000000000000000000000000000000000000000081525060200191505060405180910390fd5b80600860146101000a81548160ff02191690831515021790555050565b60608151835114611a81576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260298152602001806133a56029913960400191505060405180910390fd5b6000835167ffffffffffffffff81118015611a9b57600080fd5b50604051908082528060200260200182016040528015611aca5781602001602082028036833780820191505090505b50905060005b8451811015611b2c57611b09858281518110611ae857fe5b6020026020010151858381518110611afc57fe5b6020026020010151610d5a565b828281518110611b1557fe5b602002602001018181525050806001019050611ad0565b508091505092915050565b6000600860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60075481565b600860009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614611c2a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600a8152602001807f4f6e6c792041646d696e0000000000000000000000000000000000000000000081525060200191505060405180910390fd5b80600860006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600760008154809291906001019190505550611c9f336007548460405180602001604052806000815250612872565b6007549050919050565b8173ffffffffffffffffffffffffffffffffffffffff16611cc8612412565b73ffffffffffffffffffffffffffffffffffffffff161415611d35576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602981526020018061337c6029913960400191505060405180910390fd5b8060026000611d42612412565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff16611def612412565b73ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c318360405180821515815260200191505060405180910390a35050565b600073207fa8df3a17d96ca7ea4f2893fcdcb78a30410173ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16148015611ea6575060011515600860149054906101000a900460ff161515145b15611eb45760019050611ec1565b611ebe8383612a75565b90505b92915050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161415611f4d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806132da6025913960400191505060405180910390fd5b611f55612412565b73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff161480611f9b5750611f9a85611f95612412565b611e42565b5b611ff0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602981526020018061328c6029913960400191505060405180910390fd5b6000611ffa612412565b905061201a81878761200b88612b09565b61201488612b09565b87612421565b612097836040518060600160405280602a8152602001613331602a91396001600088815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546124299092919063ffffffff16565b6001600086815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061214e836001600087815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461238a90919063ffffffff16565b6001600086815260200190815260200160002060008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f628787604051808381526020018281526020019250505060405180910390a4612234818787878787612b7a565b505050505050565b8060039080519060200190612252929190613042565b5050565b60008073ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff1614156122dd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001806132b56025913960400191505060405180910390fd5b60016122f06122eb87612e87565b612f17565b83868660405160008152602001604052604051808581526020018460ff1681526020018381526020018281526020019450505050506020604051602081039080840390855afa158015612347573d6000803e3d6000fd5b5050506020604051035173ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff1614905095945050505050565b600080828401905083811015612408576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b600061241c612f7e565b905090565b505050505050565b60008383111582906124d6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561249b578082015181840152602081019050612480565b50505050905090810190601f1680156124c85780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b5082840390509392505050565b6125028473ffffffffffffffffffffffffffffffffffffffff1661302f565b1561286a578373ffffffffffffffffffffffffffffffffffffffff1663bc197c8187878686866040518663ffffffff1660e01b8152600401808673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff168152602001806020018060200180602001848103845287818151815260200191508051906020019060200280838360005b838110156125ba57808201518184015260208101905061259f565b50505050905001848103835286818151815260200191508051906020019060200280838360005b838110156125fc5780820151818401526020810190506125e1565b50505050905001848103825285818151815260200191508051906020019080838360005b8381101561263b578082015181840152602081019050612620565b50505050905090810190601f1680156126685780820380516001836020036101000a031916815260200191505b5098505050505050505050602060405180830381600087803b15801561268d57600080fd5b505af19250505080156126c157506040513d60208110156126ad57600080fd5b810190808051906020019092919050505060015b6127cb576126cd61310b565b806126d8575061277a565b806040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561273f578082015181840152602081019050612724565b50505050905090810190601f16801561276c5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b6040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260348152602001806131c26034913960400191505060405180910390fd5b63bc197c8160e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614612868576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806131f66028913960400191505060405180910390fd5b505b505050505050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1614156128f8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806133f66021913960400191505060405180910390fd5b6000612902612412565b90506129238160008761291488612b09565b61291d88612b09565b87612421565b612986836001600087815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461238a90919063ffffffff16565b6001600086815260200190815260200160002060008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508473ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f628787604051808381526020018281526020019250505060405180910390a4612a6e81600087878787612b7a565b5050505050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b60606000600167ffffffffffffffff81118015612b2557600080fd5b50604051908082528060200260200182016040528015612b545781602001602082028036833780820191505090505b5090508281600081518110612b6557fe5b60200260200101818152505080915050919050565b612b998473ffffffffffffffffffffffffffffffffffffffff1661302f565b15612e7f578373ffffffffffffffffffffffffffffffffffffffff1663f23a6e6187878686866040518663ffffffff1660e01b8152600401808673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff16815260200184815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015612c52578082015181840152602081019050612c37565b50505050905090810190601f168015612c7f5780820380516001836020036101000a031916815260200191505b509650505050505050602060405180830381600087803b158015612ca257600080fd5b505af1925050508015612cd657506040513d6020811015612cc257600080fd5b810190808051906020019092919050505060015b612de057612ce261310b565b80612ced5750612d8f565b806040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b83811015612d54578082015181840152602081019050612d39565b50505050905090810190601f168015612d815780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b6040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260348152602001806131c26034913960400191505060405180910390fd5b63f23a6e6160e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614612e7d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806131f66028913960400191505060405180910390fd5b505b505050505050565b6000604051806080016040528060438152602001613249604391398051906020012082600001518360200151846040015180519060200120604051602001808581526020018481526020018373ffffffffffffffffffffffffffffffffffffffff168152602001828152602001945050505050604051602081830303815290604052805190602001209050919050565b6000612f2161145a565b8260405160200180807f190100000000000000000000000000000000000000000000000000000000000081525060020183815260200182815260200192505050604051602081830303815290604052805190602001209050919050565b60003073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561302857600080368080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509050600080369050905073ffffffffffffffffffffffffffffffffffffffff81830151169250505061302c565b3390505b90565b600080823b905060008111915050919050565b828054600181600116156101000203166002900490600052602060002090601f01602090048101928261307857600085556130bf565b82601f1061309157805160ff19168380011785556130bf565b828001600101855582156130bf579182015b828111156130be5782518255916020019190600101906130a3565b5b5090506130cc91906130d0565b5090565b5b808211156130e95760008160009055506001016130d1565b5090565b6000601f19601f8301169050919050565b60008160e01c9050919050565b600060443d101561311b576131be565b60046000803e61312c6000516130fe565b6308c379a0811461313d57506131be565b60405160043d036004823e80513d602482011167ffffffffffffffff82111715613169575050506131be565b808201805167ffffffffffffffff8111156131885750505050506131be565b8060208301013d85018111156131a3575050505050506131be565b6131ac826130ed565b60208401016040528296505050505050505b9056fe455243313135353a207472616e7366657220746f206e6f6e2045524331313535526563656976657220696d706c656d656e746572455243313135353a204552433131353552656365697665722072656a656374656420746f6b656e73455243313135353a2062616c616e636520717565727920666f7220746865207a65726f20616464726573734d6574615472616e73616374696f6e2875696e74323536206e6f6e63652c616464726573732066726f6d2c62797465732066756e6374696f6e5369676e617475726529455243313135353a2063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f7665644e61746976654d6574615472616e73616374696f6e3a20494e56414c49445f5349474e4552455243313135353a207472616e7366657220746f20746865207a65726f2061646472657373455243313135353a207472616e736665722063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f766564455243313135353a20696e73756666696369656e742062616c616e636520666f72207472616e736665725369676e657220616e64207369676e617475726520646f206e6f74206d61746368455243313135353a2073657474696e6720617070726f76616c2073746174757320666f722073656c66455243313135353a206163636f756e747320616e6420696473206c656e677468206d69736d61746368455243313135353a2069647320616e6420616d6f756e7473206c656e677468206d69736d61746368455243313135353a206d696e7420746f20746865207a65726f2061646472657373a26469706673582212200038f017570fc347d421eb6064ab6c0786b1e20a0ddfbd2194cd4a889c7c7d2164736f6c63430007060033";
var immutableReferences = {
};
var generatedSources = [
];
var deployedGeneratedSources = [
	{
		ast: {
			nodeType: "YulBlock",
			src: "0:1063:5",
			statements: [
				{
					body: {
						nodeType: "YulBlock",
						src: "55:54:5",
						statements: [
							{
								nodeType: "YulAssignment",
								src: "65:38:5",
								value: {
									"arguments": [
										{
											"arguments": [
												{
													name: "value",
													nodeType: "YulIdentifier",
													src: "83:5:5"
												},
												{
													kind: "number",
													nodeType: "YulLiteral",
													src: "90:2:5",
													type: "",
													value: "31"
												}
											],
											functionName: {
												name: "add",
												nodeType: "YulIdentifier",
												src: "79:3:5"
											},
											nodeType: "YulFunctionCall",
											src: "79:14:5"
										},
										{
											"arguments": [
												{
													kind: "number",
													nodeType: "YulLiteral",
													src: "99:2:5",
													type: "",
													value: "31"
												}
											],
											functionName: {
												name: "not",
												nodeType: "YulIdentifier",
												src: "95:3:5"
											},
											nodeType: "YulFunctionCall",
											src: "95:7:5"
										}
									],
									functionName: {
										name: "and",
										nodeType: "YulIdentifier",
										src: "75:3:5"
									},
									nodeType: "YulFunctionCall",
									src: "75:28:5"
								},
								variableNames: [
									{
										name: "result",
										nodeType: "YulIdentifier",
										src: "65:6:5"
									}
								]
							}
						]
					},
					name: "round_up_to_mul_of_32",
					nodeType: "YulFunctionDefinition",
					parameters: [
						{
							name: "value",
							nodeType: "YulTypedName",
							src: "38:5:5",
							type: ""
						}
					],
					returnVariables: [
						{
							name: "result",
							nodeType: "YulTypedName",
							src: "48:6:5",
							type: ""
						}
					],
					src: "7:102:5"
				},
				{
					body: {
						nodeType: "YulBlock",
						src: "168:53:5",
						statements: [
							{
								nodeType: "YulAssignment",
								src: "178:36:5",
								value: {
									"arguments": [
										{
											kind: "number",
											nodeType: "YulLiteral",
											src: "203:3:5",
											type: "",
											value: "224"
										},
										{
											name: "value",
											nodeType: "YulIdentifier",
											src: "208:5:5"
										}
									],
									functionName: {
										name: "shr",
										nodeType: "YulIdentifier",
										src: "199:3:5"
									},
									nodeType: "YulFunctionCall",
									src: "199:15:5"
								},
								variableNames: [
									{
										name: "newValue",
										nodeType: "YulIdentifier",
										src: "178:8:5"
									}
								]
							}
						]
					},
					name: "shift_right_224_unsigned",
					nodeType: "YulFunctionDefinition",
					parameters: [
						{
							name: "value",
							nodeType: "YulTypedName",
							src: "149:5:5",
							type: ""
						}
					],
					returnVariables: [
						{
							name: "newValue",
							nodeType: "YulTypedName",
							src: "159:8:5",
							type: ""
						}
					],
					src: "115:106:5"
				},
				{
					body: {
						nodeType: "YulBlock",
						src: "270:790:5",
						statements: [
							{
								body: {
									nodeType: "YulBlock",
									src: "310:9:5",
									statements: [
										{
											nodeType: "YulLeave",
											src: "312:5:5"
										}
									]
								},
								condition: {
									"arguments": [
										{
											"arguments": [
											],
											functionName: {
												name: "returndatasize",
												nodeType: "YulIdentifier",
												src: "286:14:5"
											},
											nodeType: "YulFunctionCall",
											src: "286:16:5"
										},
										{
											kind: "number",
											nodeType: "YulLiteral",
											src: "304:4:5",
											type: "",
											value: "0x44"
										}
									],
									functionName: {
										name: "lt",
										nodeType: "YulIdentifier",
										src: "283:2:5"
									},
									nodeType: "YulFunctionCall",
									src: "283:26:5"
								},
								nodeType: "YulIf",
								src: "280:2:5"
							},
							{
								expression: {
									"arguments": [
										{
											kind: "number",
											nodeType: "YulLiteral",
											src: "344:1:5",
											type: "",
											value: "0"
										},
										{
											kind: "number",
											nodeType: "YulLiteral",
											src: "347:1:5",
											type: "",
											value: "0"
										},
										{
											kind: "number",
											nodeType: "YulLiteral",
											src: "350:1:5",
											type: "",
											value: "4"
										}
									],
									functionName: {
										name: "returndatacopy",
										nodeType: "YulIdentifier",
										src: "329:14:5"
									},
									nodeType: "YulFunctionCall",
									src: "329:23:5"
								},
								nodeType: "YulExpressionStatement",
								src: "329:23:5"
							},
							{
								nodeType: "YulVariableDeclaration",
								src: "361:45:5",
								value: {
									"arguments": [
										{
											"arguments": [
												{
													kind: "number",
													nodeType: "YulLiteral",
													src: "403:1:5",
													type: "",
													value: "0"
												}
											],
											functionName: {
												name: "mload",
												nodeType: "YulIdentifier",
												src: "397:5:5"
											},
											nodeType: "YulFunctionCall",
											src: "397:8:5"
										}
									],
									functionName: {
										name: "shift_right_224_unsigned",
										nodeType: "YulIdentifier",
										src: "372:24:5"
									},
									nodeType: "YulFunctionCall",
									src: "372:34:5"
								},
								variables: [
									{
										name: "sig",
										nodeType: "YulTypedName",
										src: "365:3:5",
										type: ""
									}
								]
							},
							{
								body: {
									nodeType: "YulBlock",
									src: "446:9:5",
									statements: [
										{
											nodeType: "YulLeave",
											src: "448:5:5"
										}
									]
								},
								condition: {
									"arguments": [
										{
											"arguments": [
												{
													name: "sig",
													nodeType: "YulIdentifier",
													src: "428:3:5"
												},
												{
													kind: "number",
													nodeType: "YulLiteral",
													src: "433:10:5",
													type: "",
													value: "0x08c379a0"
												}
											],
											functionName: {
												name: "eq",
												nodeType: "YulIdentifier",
												src: "425:2:5"
											},
											nodeType: "YulFunctionCall",
											src: "425:19:5"
										}
									],
									functionName: {
										name: "iszero",
										nodeType: "YulIdentifier",
										src: "418:6:5"
									},
									nodeType: "YulFunctionCall",
									src: "418:27:5"
								},
								nodeType: "YulIf",
								src: "415:2:5"
							},
							{
								nodeType: "YulVariableDeclaration",
								src: "465:21:5",
								value: {
									"arguments": [
										{
											kind: "number",
											nodeType: "YulLiteral",
											src: "483:2:5",
											type: "",
											value: "64"
										}
									],
									functionName: {
										name: "mload",
										nodeType: "YulIdentifier",
										src: "477:5:5"
									},
									nodeType: "YulFunctionCall",
									src: "477:9:5"
								},
								variables: [
									{
										name: "data",
										nodeType: "YulTypedName",
										src: "469:4:5",
										type: ""
									}
								]
							},
							{
								expression: {
									"arguments": [
										{
											name: "data",
											nodeType: "YulIdentifier",
											src: "510:4:5"
										},
										{
											kind: "number",
											nodeType: "YulLiteral",
											src: "516:1:5",
											type: "",
											value: "4"
										},
										{
											"arguments": [
												{
													"arguments": [
													],
													functionName: {
														name: "returndatasize",
														nodeType: "YulIdentifier",
														src: "523:14:5"
													},
													nodeType: "YulFunctionCall",
													src: "523:16:5"
												},
												{
													kind: "number",
													nodeType: "YulLiteral",
													src: "541:1:5",
													type: "",
													value: "4"
												}
											],
											functionName: {
												name: "sub",
												nodeType: "YulIdentifier",
												src: "519:3:5"
											},
											nodeType: "YulFunctionCall",
											src: "519:24:5"
										}
									],
									functionName: {
										name: "returndatacopy",
										nodeType: "YulIdentifier",
										src: "495:14:5"
									},
									nodeType: "YulFunctionCall",
									src: "495:49:5"
								},
								nodeType: "YulExpressionStatement",
								src: "495:49:5"
							},
							{
								nodeType: "YulVariableDeclaration",
								src: "554:25:5",
								value: {
									"arguments": [
										{
											name: "data",
											nodeType: "YulIdentifier",
											src: "574:4:5"
										}
									],
									functionName: {
										name: "mload",
										nodeType: "YulIdentifier",
										src: "568:5:5"
									},
									nodeType: "YulFunctionCall",
									src: "568:11:5"
								},
								variables: [
									{
										name: "offset",
										nodeType: "YulTypedName",
										src: "558:6:5",
										type: ""
									}
								]
							},
							{
								body: {
									nodeType: "YulBlock",
									src: "705:29:5",
									statements: [
										{
											nodeType: "YulLeave",
											src: "719:5:5"
										}
									]
								},
								condition: {
									"arguments": [
										{
											"arguments": [
												{
													name: "offset",
													nodeType: "YulIdentifier",
													src: "610:6:5"
												},
												{
													kind: "number",
													nodeType: "YulLiteral",
													src: "618:18:5",
													type: "",
													value: "0xffffffffffffffff"
												}
											],
											functionName: {
												name: "gt",
												nodeType: "YulIdentifier",
												src: "607:2:5"
											},
											nodeType: "YulFunctionCall",
											src: "607:30:5"
										},
										{
											"arguments": [
												{
													"arguments": [
														{
															name: "offset",
															nodeType: "YulIdentifier",
															src: "658:6:5"
														},
														{
															kind: "number",
															nodeType: "YulLiteral",
															src: "666:4:5",
															type: "",
															value: "0x24"
														}
													],
													functionName: {
														name: "add",
														nodeType: "YulIdentifier",
														src: "654:3:5"
													},
													nodeType: "YulFunctionCall",
													src: "654:17:5"
												},
												{
													"arguments": [
													],
													functionName: {
														name: "returndatasize",
														nodeType: "YulIdentifier",
														src: "673:14:5"
													},
													nodeType: "YulFunctionCall",
													src: "673:16:5"
												}
											],
											functionName: {
												name: "gt",
												nodeType: "YulIdentifier",
												src: "651:2:5"
											},
											nodeType: "YulFunctionCall",
											src: "651:39:5"
										}
									],
									functionName: {
										name: "or",
										nodeType: "YulIdentifier",
										src: "591:2:5"
									},
									nodeType: "YulFunctionCall",
									src: "591:113:5"
								},
								nodeType: "YulIf",
								src: "588:2:5"
							},
							{
								nodeType: "YulVariableDeclaration",
								src: "744:28:5",
								value: {
									"arguments": [
										{
											name: "data",
											nodeType: "YulIdentifier",
											src: "759:4:5"
										},
										{
											name: "offset",
											nodeType: "YulIdentifier",
											src: "765:6:5"
										}
									],
									functionName: {
										name: "add",
										nodeType: "YulIdentifier",
										src: "755:3:5"
									},
									nodeType: "YulFunctionCall",
									src: "755:17:5"
								},
								variables: [
									{
										name: "msg",
										nodeType: "YulTypedName",
										src: "748:3:5",
										type: ""
									}
								]
							},
							{
								nodeType: "YulVariableDeclaration",
								src: "781:24:5",
								value: {
									"arguments": [
										{
											name: "msg",
											nodeType: "YulIdentifier",
											src: "801:3:5"
										}
									],
									functionName: {
										name: "mload",
										nodeType: "YulIdentifier",
										src: "795:5:5"
									},
									nodeType: "YulFunctionCall",
									src: "795:10:5"
								},
								variables: [
									{
										name: "length",
										nodeType: "YulTypedName",
										src: "785:6:5",
										type: ""
									}
								]
							},
							{
								body: {
									nodeType: "YulBlock",
									src: "848:9:5",
									statements: [
										{
											nodeType: "YulLeave",
											src: "850:5:5"
										}
									]
								},
								condition: {
									"arguments": [
										{
											name: "length",
											nodeType: "YulIdentifier",
											src: "820:6:5"
										},
										{
											kind: "number",
											nodeType: "YulLiteral",
											src: "828:18:5",
											type: "",
											value: "0xffffffffffffffff"
										}
									],
									functionName: {
										name: "gt",
										nodeType: "YulIdentifier",
										src: "817:2:5"
									},
									nodeType: "YulFunctionCall",
									src: "817:30:5"
								},
								nodeType: "YulIf",
								src: "814:2:5"
							},
							{
								nodeType: "YulVariableDeclaration",
								src: "867:38:5",
								value: {
									"arguments": [
										{
											"arguments": [
												{
													name: "msg",
													nodeType: "YulIdentifier",
													src: "886:3:5"
												},
												{
													kind: "number",
													nodeType: "YulLiteral",
													src: "891:4:5",
													type: "",
													value: "0x20"
												}
											],
											functionName: {
												name: "add",
												nodeType: "YulIdentifier",
												src: "882:3:5"
											},
											nodeType: "YulFunctionCall",
											src: "882:14:5"
										},
										{
											name: "length",
											nodeType: "YulIdentifier",
											src: "898:6:5"
										}
									],
									functionName: {
										name: "add",
										nodeType: "YulIdentifier",
										src: "878:3:5"
									},
									nodeType: "YulFunctionCall",
									src: "878:27:5"
								},
								variables: [
									{
										name: "end",
										nodeType: "YulTypedName",
										src: "871:3:5",
										type: ""
									}
								]
							},
							{
								body: {
									nodeType: "YulBlock",
									src: "954:9:5",
									statements: [
										{
											nodeType: "YulLeave",
											src: "956:5:5"
										}
									]
								},
								condition: {
									"arguments": [
										{
											name: "end",
											nodeType: "YulIdentifier",
											src: "920:3:5"
										},
										{
											"arguments": [
												{
													name: "data",
													nodeType: "YulIdentifier",
													src: "929:4:5"
												},
												{
													"arguments": [
													],
													functionName: {
														name: "returndatasize",
														nodeType: "YulIdentifier",
														src: "935:14:5"
													},
													nodeType: "YulFunctionCall",
													src: "935:16:5"
												}
											],
											functionName: {
												name: "add",
												nodeType: "YulIdentifier",
												src: "925:3:5"
											},
											nodeType: "YulFunctionCall",
											src: "925:27:5"
										}
									],
									functionName: {
										name: "gt",
										nodeType: "YulIdentifier",
										src: "917:2:5"
									},
									nodeType: "YulFunctionCall",
									src: "917:36:5"
								},
								nodeType: "YulIf",
								src: "914:2:5"
							},
							{
								expression: {
									"arguments": [
										{
											kind: "number",
											nodeType: "YulLiteral",
											src: "980:2:5",
											type: "",
											value: "64"
										},
										{
											"arguments": [
												{
													"arguments": [
														{
															name: "msg",
															nodeType: "YulIdentifier",
															src: "992:3:5"
														},
														{
															kind: "number",
															nodeType: "YulLiteral",
															src: "997:4:5",
															type: "",
															value: "0x20"
														}
													],
													functionName: {
														name: "add",
														nodeType: "YulIdentifier",
														src: "988:3:5"
													},
													nodeType: "YulFunctionCall",
													src: "988:14:5"
												},
												{
													"arguments": [
														{
															name: "length",
															nodeType: "YulIdentifier",
															src: "1026:6:5"
														}
													],
													functionName: {
														name: "round_up_to_mul_of_32",
														nodeType: "YulIdentifier",
														src: "1004:21:5"
													},
													nodeType: "YulFunctionCall",
													src: "1004:29:5"
												}
											],
											functionName: {
												name: "add",
												nodeType: "YulIdentifier",
												src: "984:3:5"
											},
											nodeType: "YulFunctionCall",
											src: "984:50:5"
										}
									],
									functionName: {
										name: "mstore",
										nodeType: "YulIdentifier",
										src: "973:6:5"
									},
									nodeType: "YulFunctionCall",
									src: "973:62:5"
								},
								nodeType: "YulExpressionStatement",
								src: "973:62:5"
							},
							{
								nodeType: "YulAssignment",
								src: "1044:10:5",
								value: {
									name: "msg",
									nodeType: "YulIdentifier",
									src: "1051:3:5"
								},
								variableNames: [
									{
										name: "ret",
										nodeType: "YulIdentifier",
										src: "1044:3:5"
									}
								]
							}
						]
					},
					name: "try_decode_error_message",
					nodeType: "YulFunctionDefinition",
					returnVariables: [
						{
							name: "ret",
							nodeType: "YulTypedName",
							src: "266:3:5",
							type: ""
						}
					],
					src: "227:833:5"
				}
			]
		},
		contents: "{\n\n    function round_up_to_mul_of_32(value) -> result {\n        result := and(add(value, 31), not(31))\n    }\n\n    function shift_right_224_unsigned(value) -> newValue {\n        newValue :=\n\n        shr(224, value)\n\n    }\n\n    function try_decode_error_message() -> ret {\n        if lt(returndatasize(), 0x44) { leave }\n\n        returndatacopy(0, 0, 4)\n        let sig := shift_right_224_unsigned(mload(0))\n        if iszero(eq(sig, 0x08c379a0)) { leave }\n\n        let data := mload(64)\n        returndatacopy(data, 4, sub(returndatasize(), 4))\n\n        let offset := mload(data)\n        if or(\n            gt(offset, 0xffffffffffffffff),\n            gt(add(offset, 0x24), returndatasize())\n            ) {\n            leave\n        }\n\n        let msg := add(data, offset)\n        let length := mload(msg)\n        if gt(length, 0xffffffffffffffff) { leave }\n\n        let end := add(add(msg, 0x20), length)\n        if gt(end, add(data, returndatasize())) { leave }\n\n        mstore(64, add(add(msg, 0x20), round_up_to_mul_of_32(length)))\n        ret := msg\n    }\n\n}\n",
		id: 5,
		language: "Yul",
		name: "#utility.yul"
	}
];
var sourceMap = "132:1822:1:-:0;;;933:5:2;919:19;;;;;;;;;;;;;;;;;;;;407:158:1;;;;;;;;;;20016:354:0;;;;;;;;;;;;;;;;;9439:40;9106:10;9458:20;;9439:18;;;:40;;:::i;:::-;20066:13;20074:4;20066:7;;;:13;;:::i;:::-;20168:41;19804:10;20187:21;;20168:18;;;:41;;:::i;:::-;20309:54;19956:10;20328:34;;20309:18;;;:54;;:::i;:::-;20016:354;488:10:1::1;480:5;;:18;;;;;;;;;;;;;;;;;;526:4;504:19;;:26;;;;;;;;;;;;;;;;;;536:24;;;;;;;;;;;;;;;;;::::0;:17:::1;;;:24;;:::i;:::-;132:1822:::0;;10178:198:0;10276:10;10261:25;;:11;:25;;;;;10253:66;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;10365:4;10329:20;:33;10350:11;10329:33;;;;;;;;;;;;;;;;;;:40;;;;;;;;;;;;;;;;;;10178:198;:::o;25581:86::-;25654:6;25647:4;:13;;;;;;;;;;;;:::i;:::-;;25581:86;:::o;1804:144:2:-;987:6;;;;;;;;;;;986:7;978:34;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1916:25:::1;1936:4;1916:19;;;:25;;:::i;:::-;1042:4:::0;1033:6;;:13;;;;;;;;;;;;;;;;;;1804:144;:::o;1954:350::-;1453:110;;;;;;;;;;;;;;;;;1434:135;;;;;;2147:4;2131:22;;;;;;2187:14;;;;;;;;;;;;;;;;;2171:32;;;;;;2229:4;2260:12;:10;;;:12;;:::i;:::-;2252:21;;2063:224;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2040:257;;;;;;2022:15;:275;;;;1954:350;:::o;2415:155::-;2458:7;2477:10;2526:9;2520:15;;2561:2;2554:9;;;2415:155;:::o;132:1822:1:-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;";
var deployedSourceMap = "132:1822:1:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;21016:228:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;9636:148;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;1773:75:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;4089:1108:2;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;20769:105:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1333:43:2;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2310:99;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;5605:105;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;23574:1184:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;2415:155:2;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;1436:103:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;21401:530:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1879:73:1;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;213:23;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;1686:83;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;569:146;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;21999:306:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;797:328:1;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;22605:897:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;21016:228;21102:7;21148:1;21129:21;;:7;:21;;;;21121:77;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;21215:9;:13;21225:2;21215:13;;;;;;;;;;;:22;21229:7;21215:22;;;;;;;;;;;;;;;;21208:29;;21016:228;;;;:::o;9636:148::-;9721:4;9744:20;:33;9765:11;9744:33;;;;;;;;;;;;;;;;;;;;;;;;;;;9737:40;;9636:148;;;:::o;1773:75:1:-;371:5;;;;;;;;;;;357:19;;:10;:19;;;349:42;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1831:12:::1;1839:3;1831:7;:12::i;:::-;1773:75:::0;:::o;4089:1108:2:-;4284:12;4308:29;4340:148;;;;;;;;4377:6;:19;4384:11;4377:19;;;;;;;;;;;;;;;;4340:148;;;;4416:11;4340:148;;;;;;4460:17;4340:148;;;4308:180;;4520:45;4527:11;4540:6;4548:4;4554;4560;4520:6;:45::i;:::-;4499:125;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;4710:26;4734:1;4710:6;:19;4717:11;4710:19;;;;;;;;;;;;;;;;:23;;:26;;;;:::i;:::-;4688:6;:19;4695:11;4688:19;;;;;;;;;;;;;;;:48;;;;4752:113;4789:11;4814:10;4838:17;4752:113;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;4973:12;4987:23;5022:4;5014:18;;5063:17;5082:11;5046:48;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;5014:90;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;4972:132;;;;5122:7;5114:48;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;5180:10;5173:17;;;;;4089:1108;;;;;;;:::o;20769:105:0:-;20831:13;20863:4;20856:11;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;20769:105;;;:::o;1333:43:2:-;;;;;;;;;;;;;;;;;;;:::o;2310:99::-;2361:7;2387:15;;2380:22;;2310:99;:::o;5605:105::-;5658:13;5691:6;:12;5698:4;5691:12;;;;;;;;;;;;;;;;5683:20;;5605:105;;;:::o;23574:1184:0:-;23828:7;:14;23814:3;:10;:28;23806:81;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;23919:1;23905:16;;:2;:16;;;;23897:66;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;24002:12;:10;:12::i;:::-;23994:20;;:4;:20;;;:60;;;;24018:36;24035:4;24041:12;:10;:12::i;:::-;24018:16;:36::i;:::-;23994:60;23973:157;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;24141:16;24160:12;:10;:12::i;:::-;24141:31;;24183:60;24204:8;24214:4;24220:2;24224:3;24229:7;24238:4;24183:20;:60::i;:::-;24259:9;24254:349;24278:3;:10;24274:1;:14;24254:349;;;24309:10;24322:3;24326:1;24322:6;;;;;;;;;;;;;;24309:19;;24342:14;24359:7;24367:1;24359:10;;;;;;;;;;;;;;24342:27;;24406:123;24447:6;24406:123;;;;;;;;;;;;;;;;;:9;:13;24416:2;24406:13;;;;;;;;;;;:19;24420:4;24406:19;;;;;;;;;;;;;;;;:23;;:123;;;;;:::i;:::-;24384:9;:13;24394:2;24384:13;;;;;;;;;;;:19;24398:4;24384:19;;;;;;;;;;;;;;;:145;;;;24563:29;24585:6;24563:9;:13;24573:2;24563:13;;;;;;;;;;;:17;24577:2;24563:17;;;;;;;;;;;;;;;;:21;;:29;;;;:::i;:::-;24543:9;:13;24553:2;24543:13;;;;;;;;;;;:17;24557:2;24543:17;;;;;;;;;;;;;;;:49;;;;24254:349;;24290:3;;;;;24254:349;;;;24648:2;24618:47;;24642:4;24618:47;;24632:8;24618:47;;;24652:3;24657:7;24618:47;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;24676:75;24712:8;24722:4;24728:2;24732:3;24737:7;24746:4;24676:35;:75::i;:::-;23574:1184;;;;;;:::o;2415:155:2:-;2458:7;2477:10;2526:9;2520:15;;2561:2;2554:9;;;2415:155;:::o;1436:103:1:-;371:5;;;;;;;;;;;357:19;;:10;:19;;;349:42;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1527:7:::1;1505:19;;:29;;;;;;;;;;;;;;;;;;1436:103:::0;:::o;21401:530:0:-;21574:16;21633:3;:10;21614:8;:15;:29;21606:83;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;21700:30;21747:8;:15;21733:30;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;21700:63;;21779:9;21774:120;21798:8;:15;21794:1;:19;21774:120;;;21853:30;21863:8;21872:1;21863:11;;;;;;;;;;;;;;21876:3;21880:1;21876:6;;;;;;;;;;;;;;21853:9;:30::i;:::-;21834:13;21848:1;21834:16;;;;;;;;;;;;;:49;;;;;21815:3;;;;;21774:120;;;;21911:13;21904:20;;;21401:530;;;;:::o;1879:73:1:-;1920:7;1942:5;;;;;;;;;;;1935:12;;1879:73;:::o;213:23::-;;;;:::o;1686:83::-;371:5;;;;;;;;;;;357:19;;:10;:19;;;349:42;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1756:8:::1;1748:5;;:16;;;;;;;;;;;;;;;;;;1686:83:::0;:::o;569:146::-;617:7;632:8;;:10;;;;;;;;;;;;;648:41;654:10;666:8;;676;648:41;;;;;;;;;;;;:5;:41::i;:::-;702:8;;695:15;;569:146;;;:::o;21999:306:0:-;22117:8;22101:24;;:12;:10;:12::i;:::-;:24;;;;22093:78;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;22227:8;22182:18;:32;22201:12;:10;:12::i;:::-;22182:32;;;;;;;;;;;;;;;:42;22215:8;22182:42;;;;;;;;;;;;;;;;:53;;;;;;;;;;;;;;;;;;22279:8;22250:48;;22265:12;:10;:12::i;:::-;22250:48;;;22289:8;22250:48;;;;;;;;;;;;;;;;;;;;21999:306;;:::o;797:328:1:-;904:15;954:42;933:64;;:9;:64;;;:95;;;;;1024:4;1001:27;;:19;;;;;;;;;;;:27;;;933:95;929:133;;;1049:4;1042:11;;;;929:133;1077:43;1102:6;1110:9;1077:24;:43::i;:::-;1070:50;;797:328;;;;;:::o;22605:897:0:-;22834:1;22820:16;;:2;:16;;;;22812:66;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;22917:12;:10;:12::i;:::-;22909:20;;:4;:20;;;:60;;;;22933:36;22950:4;22956:12;:10;:12::i;:::-;22933:16;:36::i;:::-;22909:60;22888:148;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;23047:16;23066:12;:10;:12::i;:::-;23047:31;;23089:96;23110:8;23120:4;23126:2;23130:21;23148:2;23130:17;:21::i;:::-;23153:25;23171:6;23153:17;:25::i;:::-;23180:4;23089:20;:96::i;:::-;23218:77;23242:6;23218:77;;;;;;;;;;;;;;;;;:9;:13;23228:2;23218:13;;;;;;;;;;;:19;23232:4;23218:19;;;;;;;;;;;;;;;;:23;;:77;;;;;:::i;:::-;23196:9;:13;23206:2;23196:13;;;;;;;;;;;:19;23210:4;23196:19;;;;;;;;;;;;;;;:99;;;;23325:29;23347:6;23325:9;:13;23335:2;23325:13;;;;;;;;;;;:17;23339:2;23325:17;;;;;;;;;;;;;;;;:21;;:29;;;;:::i;:::-;23305:9;:13;23315:2;23305:13;;;;;;;;;;;:17;23319:2;23305:17;;;;;;;;;;;;;;;:49;;;;23401:2;23370:46;;23395:4;23370:46;;23385:8;23370:46;;;23405:2;23409:6;23370:46;;;;;;;;;;;;;;;;;;;;;;;;23427:68;23458:8;23468:4;23474:2;23478;23482:6;23490:4;23427:30;:68::i;:::-;22605:897;;;;;;:::o;25581:86::-;25654:6;25647:4;:13;;;;;;;;;;;;:::i;:::-;;25581:86;:::o;5716:470:2:-;5888:4;5930:1;5912:20;;:6;:20;;;;5904:70;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;6025:154;6052:47;6071:27;6091:6;6071:19;:27::i;:::-;6052:18;:47::i;:::-;6117:4;6139;6161;6025:154;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;6003:176;;:6;:176;;;5984:195;;5716:470;;;;;;;:::o;2657:175:4:-;2715:7;2734:9;2750:1;2746;:5;2734:17;;2774:1;2769;:6;;2761:46;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2824:1;2817:8;;;2657:175;;;;:::o;1255:148:1:-;1333:22;1374:24;:22;:24::i;:::-;1367:31;;1255:148;:::o;30292:235:0:-;;;;;;;:::o;5399:163:4:-;5485:7;5517:1;5512;:6;;5520:12;5504:29;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;5554:1;5550;:5;5543:12;;5399:163;;;;;:::o;31280:778:0:-;31524:15;:2;:13;;;:15::i;:::-;31520:532;;;31576:2;31559:43;;;31603:8;31613:4;31619:3;31624:7;31633:4;31559:79;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;31555:487;;;;:::i;:::-;;;;;;;;31918:6;31911:14;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;31555:487;31965:62;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;31555:487;31699:52;;;31687:64;;;:8;:64;;;;31683:161;;31775:50;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;31683:161;31639:219;31520:532;31280:778;;;;;;:::o;26055:572::-;26188:1;26169:21;;:7;:21;;;;26161:67;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;26239:16;26258:12;:10;:12::i;:::-;26239:31;;26281:107;26302:8;26320:1;26324:7;26333:21;26351:2;26333:17;:21::i;:::-;26356:25;26374:6;26356:17;:25::i;:::-;26383:4;26281:20;:107::i;:::-;26424:34;26451:6;26424:9;:13;26434:2;26424:13;;;;;;;;;;;:22;26438:7;26424:22;;;;;;;;;;;;;;;;:26;;:34;;;;:::i;:::-;26399:9;:13;26409:2;26399:13;;;;;;;;;;;:22;26413:7;26399:22;;;;;;;;;;;;;;;:59;;;;26510:7;26473:57;;26506:1;26473:57;;26488:8;26473:57;;;26519:2;26523:6;26473:57;;;;;;;;;;;;;;;;;;;;;;;;26541:79;26572:8;26590:1;26594:7;26603:2;26607:6;26615:4;26541:30;:79::i;:::-;26055:572;;;;;:::o;22372:166::-;22471:4;22494:18;:27;22513:7;22494:27;;;;;;;;;;;;;;;:37;22522:8;22494:37;;;;;;;;;;;;;;;;;;;;;;;;;22487:44;;22372:166;;;;:::o;32064:193::-;32130:16;32158:22;32197:1;32183:16;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;32158:41;;32220:7;32209:5;32215:1;32209:8;;;;;;;;;;;;;:18;;;;;32245:5;32238:12;;;32064:193;;;:::o;30533:741::-;30752:15;:2;:13;;;:15::i;:::-;30748:520;;;30804:2;30787:38;;;30826:8;30836:4;30842:2;30846:6;30854:4;30787:72;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;30783:475;;;;:::i;:::-;;;;;;;;31134:6;31127:14;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;30783:475;31181:62;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;30783:475;30920:47;;;30908:59;;;:8;:59;;;;30904:156;;30991:50;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;30904:156;30860:214;30748:520;30533:741;;;;;;:::o;5203:396:2:-;5310:7;3447:98;;;;;;;;;;;;;;;;;3428:123;;;;;;5458:6;:12;;;5492:6;:11;;;5535:6;:24;;;5525:35;;;;;;5379:199;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;5352:240;;;;;;5333:259;;5203:396;;;:::o;2930:249::-;3026:7;3124:20;:18;:20::i;:::-;3146:11;3095:63;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;3068:104;;;;;;3049:123;;2930:249;;;:::o;163:622::-;231:22;295:4;273:27;;:10;:27;;;269:487;;;316:18;337:8;;316:29;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;359:13;375:8;;:15;;359:31;;622:42;593:5;586;582:17;576:24;551:131;541:141;;413:283;;;;;735:10;726:19;;269:487;163:622;:::o;11150:413:0:-;11210:4;11413:12;11522:7;11510:20;11502:28;;11555:1;11548:4;:8;11541:15;;;11150:413;;;:::o;-1:-1:-1:-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;:::o;7:102:5:-;;99:2;95:7;90:2;83:5;79:14;75:28;65:38;;55:54;;;:::o;115:106::-;;208:5;203:3;199:15;178:36;;168:53;;;:::o;227:833::-;;304:4;286:16;283:26;280:2;;;312:5;;280:2;350:1;347;344;329:23;372:34;403:1;397:8;372:34;:::i;:::-;433:10;428:3;425:19;415:2;;448:5;;;415:2;483;477:9;541:1;523:16;519:24;516:1;510:4;495:49;574:4;568:11;673:16;666:4;658:6;654:17;651:39;618:18;610:6;607:30;591:113;588:2;;;719:5;;;;;588:2;765:6;759:4;755:17;801:3;795:10;828:18;820:6;817:30;814:2;;;850:5;;;;;;;814:2;898:6;891:4;886:3;882:14;878:27;935:16;929:4;925:27;920:3;917:36;914:2;;;956:5;;;;;;;;914:2;1004:29;1026:6;1004:29;:::i;:::-;997:4;992:3;988:14;984:50;980:2;973:62;1051:3;1044:10;;270:790;;;;;;;;:::o";
var source = "pragma solidity ^0.7.6;\n\n// SPDX-License-Identifier: MIT\nimport \"./SafeMath.sol\";\nimport \"./ERC1155.sol\";\nimport \"./MetaTxns.sol\";\n\ncontract LIT is ERC1155, ContextMixin, NativeMetaTransaction {\n  // token vars\n  uint256 public tokenIds;\n\n  // admin func vars\n  address private admin;\n  bool private openseaProxyEnabled;\n\n  modifier onlyAdmin {\n    require(msg.sender == admin, \"Only Admin\");\n    _;\n  }\n\n  constructor() ERC1155(\"https://mintlit.com/metadata/polygon/{id}\") {\n    admin = msg.sender;\n    openseaProxyEnabled = true;\n    _initializeEIP712(\"LIT\");\n  }\n\n  function mint(uint256 quantity) public returns (uint256) {\n    tokenIds++;\n    _mint(msg.sender, tokenIds, quantity, \"\");\n    return tokenIds;\n  }\n\n  /**\n   * Override isApprovedForAll to whitelist opensea proxy account\n   */\n  function isApprovedForAll(\n      address _owner,\n      address _operator\n  ) public override view returns (bool isOperator) {\n      if (_operator == address(0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101) && openseaProxyEnabled == true) {\n          return true;\n      }\n\n      return ERC1155.isApprovedForAll(_owner, _operator);\n  }\n\n  /**\n   * This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea.\n  */\n  function _msgSender()\n      internal\n      override\n      view\n      returns (address payable sender)\n  {\n      return ContextMixin.msgSender();\n  }\n\n  /**\n   * Admin APIs\n   */\n\n  function setOpenseaProxyEnabled(bool enabled) public onlyAdmin {\n    openseaProxyEnabled = enabled;\n  }\n\n  /**\n   * @dev admin function to set new root admin.\n   *\n   * @param newAdmin address the new admin to assign, which manages delegates\n   */\n  function changeAdmin(address newAdmin) public onlyAdmin {\n    admin = newAdmin;\n  }\n\n  function setURI(string memory uri) public onlyAdmin {\n    _setURI(uri);\n  }\n\n  /**\n   * Read APIs\n   */\n  function getAdmin() public view returns (address) {\n    return admin;\n  }\n}";
var sourcePath = "/Users/chris/Documents/WorkStuff/LIT/mintlit/contracts/src/contracts/LIT.sol";
var ast = {
	absolutePath: "/Users/chris/Documents/WorkStuff/LIT/mintlit/contracts/src/contracts/LIT.sol",
	exportedSymbols: {
		Address: [
			556
		],
		Context: [
			205
		],
		ContextMixin: [
			1757
		],
		EIP712Base: [
			1889
		],
		ERC1155: [
			1556
		],
		ERC165: [
			260
		],
		IERC1155: [
			131
		],
		IERC1155MetadataURI: [
			144
		],
		IERC1155Receiver: [
			183
		],
		IERC165: [
			11
		],
		Initializable: [
			1776
		],
		LIT: [
			1718
		],
		NativeMetaTransaction: [
			2077
		],
		SafeMath: [
			2489
		]
	},
	id: 1719,
	license: "MIT",
	nodeType: "SourceUnit",
	nodes: [
		{
			id: 1558,
			literals: [
				"solidity",
				"^",
				"0.7",
				".6"
			],
			nodeType: "PragmaDirective",
			src: "0:23:1"
		},
		{
			absolutePath: "/Users/chris/Documents/WorkStuff/LIT/mintlit/contracts/src/contracts/SafeMath.sol",
			file: "./SafeMath.sol",
			id: 1559,
			nodeType: "ImportDirective",
			scope: 1719,
			sourceUnit: 2490,
			src: "57:24:1",
			symbolAliases: [
			],
			unitAlias: ""
		},
		{
			absolutePath: "/Users/chris/Documents/WorkStuff/LIT/mintlit/contracts/src/contracts/ERC1155.sol",
			file: "./ERC1155.sol",
			id: 1560,
			nodeType: "ImportDirective",
			scope: 1719,
			sourceUnit: 1557,
			src: "82:23:1",
			symbolAliases: [
			],
			unitAlias: ""
		},
		{
			absolutePath: "/Users/chris/Documents/WorkStuff/LIT/mintlit/contracts/src/contracts/MetaTxns.sol",
			file: "./MetaTxns.sol",
			id: 1561,
			nodeType: "ImportDirective",
			scope: 1719,
			sourceUnit: 2078,
			src: "106:24:1",
			symbolAliases: [
			],
			unitAlias: ""
		},
		{
			abstract: false,
			baseContracts: [
				{
					baseName: {
						id: 1562,
						name: "ERC1155",
						nodeType: "UserDefinedTypeName",
						referencedDeclaration: 1556,
						src: "148:7:1",
						typeDescriptions: {
							typeIdentifier: "t_contract$_ERC1155_$1556",
							typeString: "contract ERC1155"
						}
					},
					id: 1563,
					nodeType: "InheritanceSpecifier",
					src: "148:7:1"
				},
				{
					baseName: {
						id: 1564,
						name: "ContextMixin",
						nodeType: "UserDefinedTypeName",
						referencedDeclaration: 1757,
						src: "157:12:1",
						typeDescriptions: {
							typeIdentifier: "t_contract$_ContextMixin_$1757",
							typeString: "contract ContextMixin"
						}
					},
					id: 1565,
					nodeType: "InheritanceSpecifier",
					src: "157:12:1"
				},
				{
					baseName: {
						id: 1566,
						name: "NativeMetaTransaction",
						nodeType: "UserDefinedTypeName",
						referencedDeclaration: 2077,
						src: "171:21:1",
						typeDescriptions: {
							typeIdentifier: "t_contract$_NativeMetaTransaction_$2077",
							typeString: "contract NativeMetaTransaction"
						}
					},
					id: 1567,
					nodeType: "InheritanceSpecifier",
					src: "171:21:1"
				}
			],
			contractDependencies: [
				11,
				131,
				144,
				205,
				260,
				1556,
				1757,
				1776,
				1889,
				2077
			],
			contractKind: "contract",
			fullyImplemented: true,
			id: 1718,
			linearizedBaseContracts: [
				1718,
				2077,
				1889,
				1776,
				1757,
				1556,
				144,
				131,
				260,
				11,
				205
			],
			name: "LIT",
			nodeType: "ContractDefinition",
			nodes: [
				{
					constant: false,
					functionSelector: "714cff56",
					id: 1569,
					mutability: "mutable",
					name: "tokenIds",
					nodeType: "VariableDeclaration",
					scope: 1718,
					src: "213:23:1",
					stateVariable: true,
					storageLocation: "default",
					typeDescriptions: {
						typeIdentifier: "t_uint256",
						typeString: "uint256"
					},
					typeName: {
						id: 1568,
						name: "uint256",
						nodeType: "ElementaryTypeName",
						src: "213:7:1",
						typeDescriptions: {
							typeIdentifier: "t_uint256",
							typeString: "uint256"
						}
					},
					visibility: "public"
				},
				{
					constant: false,
					id: 1571,
					mutability: "mutable",
					name: "admin",
					nodeType: "VariableDeclaration",
					scope: 1718,
					src: "262:21:1",
					stateVariable: true,
					storageLocation: "default",
					typeDescriptions: {
						typeIdentifier: "t_address",
						typeString: "address"
					},
					typeName: {
						id: 1570,
						name: "address",
						nodeType: "ElementaryTypeName",
						src: "262:7:1",
						stateMutability: "nonpayable",
						typeDescriptions: {
							typeIdentifier: "t_address",
							typeString: "address"
						}
					},
					visibility: "private"
				},
				{
					constant: false,
					id: 1573,
					mutability: "mutable",
					name: "openseaProxyEnabled",
					nodeType: "VariableDeclaration",
					scope: 1718,
					src: "287:32:1",
					stateVariable: true,
					storageLocation: "default",
					typeDescriptions: {
						typeIdentifier: "t_bool",
						typeString: "bool"
					},
					typeName: {
						id: 1572,
						name: "bool",
						nodeType: "ElementaryTypeName",
						src: "287:4:1",
						typeDescriptions: {
							typeIdentifier: "t_bool",
							typeString: "bool"
						}
					},
					visibility: "private"
				},
				{
					body: {
						id: 1584,
						nodeType: "Block",
						src: "343:60:1",
						statements: [
							{
								expression: {
									"arguments": [
										{
											commonType: {
												typeIdentifier: "t_address",
												typeString: "address"
											},
											id: 1579,
											isConstant: false,
											isLValue: false,
											isPure: false,
											lValueRequested: false,
											leftExpression: {
												expression: {
													id: 1576,
													name: "msg",
													nodeType: "Identifier",
													overloadedDeclarations: [
													],
													referencedDeclaration: 4294967281,
													src: "357:3:1",
													typeDescriptions: {
														typeIdentifier: "t_magic_message",
														typeString: "msg"
													}
												},
												id: 1577,
												isConstant: false,
												isLValue: false,
												isPure: false,
												lValueRequested: false,
												memberName: "sender",
												nodeType: "MemberAccess",
												src: "357:10:1",
												typeDescriptions: {
													typeIdentifier: "t_address_payable",
													typeString: "address payable"
												}
											},
											nodeType: "BinaryOperation",
											operator: "==",
											rightExpression: {
												id: 1578,
												name: "admin",
												nodeType: "Identifier",
												overloadedDeclarations: [
												],
												referencedDeclaration: 1571,
												src: "371:5:1",
												typeDescriptions: {
													typeIdentifier: "t_address",
													typeString: "address"
												}
											},
											src: "357:19:1",
											typeDescriptions: {
												typeIdentifier: "t_bool",
												typeString: "bool"
											}
										},
										{
											hexValue: "4f6e6c792041646d696e",
											id: 1580,
											isConstant: false,
											isLValue: false,
											isPure: true,
											kind: "string",
											lValueRequested: false,
											nodeType: "Literal",
											src: "378:12:1",
											typeDescriptions: {
												typeIdentifier: "t_stringliteral_c13c296baebb1f79b18541a06c39b3d56ce1654fd26fe72a62e2fb7efe67be9a",
												typeString: "literal_string \"Only Admin\""
											},
											value: "Only Admin"
										}
									],
									expression: {
										argumentTypes: [
											{
												typeIdentifier: "t_bool",
												typeString: "bool"
											},
											{
												typeIdentifier: "t_stringliteral_c13c296baebb1f79b18541a06c39b3d56ce1654fd26fe72a62e2fb7efe67be9a",
												typeString: "literal_string \"Only Admin\""
											}
										],
										id: 1575,
										name: "require",
										nodeType: "Identifier",
										overloadedDeclarations: [
											4294967278,
											4294967278
										],
										referencedDeclaration: 4294967278,
										src: "349:7:1",
										typeDescriptions: {
											typeIdentifier: "t_function_require_pure$_t_bool_$_t_string_memory_ptr_$returns$__$",
											typeString: "function (bool,string memory) pure"
										}
									},
									id: 1581,
									isConstant: false,
									isLValue: false,
									isPure: false,
									kind: "functionCall",
									lValueRequested: false,
									names: [
									],
									nodeType: "FunctionCall",
									src: "349:42:1",
									tryCall: false,
									typeDescriptions: {
										typeIdentifier: "t_tuple$__$",
										typeString: "tuple()"
									}
								},
								id: 1582,
								nodeType: "ExpressionStatement",
								src: "349:42:1"
							},
							{
								id: 1583,
								nodeType: "PlaceholderStatement",
								src: "397:1:1"
							}
						]
					},
					id: 1585,
					name: "onlyAdmin",
					nodeType: "ModifierDefinition",
					parameters: {
						id: 1574,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "343:0:1"
					},
					src: "324:79:1",
					virtual: false,
					visibility: "internal"
				},
				{
					body: {
						id: 1604,
						nodeType: "Block",
						src: "474:91:1",
						statements: [
							{
								expression: {
									id: 1594,
									isConstant: false,
									isLValue: false,
									isPure: false,
									lValueRequested: false,
									leftHandSide: {
										id: 1591,
										name: "admin",
										nodeType: "Identifier",
										overloadedDeclarations: [
										],
										referencedDeclaration: 1571,
										src: "480:5:1",
										typeDescriptions: {
											typeIdentifier: "t_address",
											typeString: "address"
										}
									},
									nodeType: "Assignment",
									operator: "=",
									rightHandSide: {
										expression: {
											id: 1592,
											name: "msg",
											nodeType: "Identifier",
											overloadedDeclarations: [
											],
											referencedDeclaration: 4294967281,
											src: "488:3:1",
											typeDescriptions: {
												typeIdentifier: "t_magic_message",
												typeString: "msg"
											}
										},
										id: 1593,
										isConstant: false,
										isLValue: false,
										isPure: false,
										lValueRequested: false,
										memberName: "sender",
										nodeType: "MemberAccess",
										src: "488:10:1",
										typeDescriptions: {
											typeIdentifier: "t_address_payable",
											typeString: "address payable"
										}
									},
									src: "480:18:1",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								id: 1595,
								nodeType: "ExpressionStatement",
								src: "480:18:1"
							},
							{
								expression: {
									id: 1598,
									isConstant: false,
									isLValue: false,
									isPure: false,
									lValueRequested: false,
									leftHandSide: {
										id: 1596,
										name: "openseaProxyEnabled",
										nodeType: "Identifier",
										overloadedDeclarations: [
										],
										referencedDeclaration: 1573,
										src: "504:19:1",
										typeDescriptions: {
											typeIdentifier: "t_bool",
											typeString: "bool"
										}
									},
									nodeType: "Assignment",
									operator: "=",
									rightHandSide: {
										hexValue: "74727565",
										id: 1597,
										isConstant: false,
										isLValue: false,
										isPure: true,
										kind: "bool",
										lValueRequested: false,
										nodeType: "Literal",
										src: "526:4:1",
										typeDescriptions: {
											typeIdentifier: "t_bool",
											typeString: "bool"
										},
										value: "true"
									},
									src: "504:26:1",
									typeDescriptions: {
										typeIdentifier: "t_bool",
										typeString: "bool"
									}
								},
								id: 1599,
								nodeType: "ExpressionStatement",
								src: "504:26:1"
							},
							{
								expression: {
									"arguments": [
										{
											hexValue: "4c4954",
											id: 1601,
											isConstant: false,
											isLValue: false,
											isPure: true,
											kind: "string",
											lValueRequested: false,
											nodeType: "Literal",
											src: "554:5:1",
											typeDescriptions: {
												typeIdentifier: "t_stringliteral_cc6d7d84473dcc72642b2f5d66c702663d241f6c9c8fc2cbecc2e0aa18dc943a",
												typeString: "literal_string \"LIT\""
											},
											value: "LIT"
										}
									],
									expression: {
										argumentTypes: [
											{
												typeIdentifier: "t_stringliteral_cc6d7d84473dcc72642b2f5d66c702663d241f6c9c8fc2cbecc2e0aa18dc943a",
												typeString: "literal_string \"LIT\""
											}
										],
										id: 1600,
										name: "_initializeEIP712",
										nodeType: "Identifier",
										overloadedDeclarations: [
										],
										referencedDeclaration: 1813,
										src: "536:17:1",
										typeDescriptions: {
											typeIdentifier: "t_function_internal_nonpayable$_t_string_memory_ptr_$returns$__$",
											typeString: "function (string memory)"
										}
									},
									id: 1602,
									isConstant: false,
									isLValue: false,
									isPure: false,
									kind: "functionCall",
									lValueRequested: false,
									names: [
									],
									nodeType: "FunctionCall",
									src: "536:24:1",
									tryCall: false,
									typeDescriptions: {
										typeIdentifier: "t_tuple$__$",
										typeString: "tuple()"
									}
								},
								id: 1603,
								nodeType: "ExpressionStatement",
								src: "536:24:1"
							}
						]
					},
					id: 1605,
					implemented: true,
					kind: "constructor",
					modifiers: [
						{
							"arguments": [
								{
									hexValue: "68747470733a2f2f6d696e746c69742e636f6d2f6d657461646174612f706f6c79676f6e2f7b69647d",
									id: 1588,
									isConstant: false,
									isLValue: false,
									isPure: true,
									kind: "string",
									lValueRequested: false,
									nodeType: "Literal",
									src: "429:43:1",
									typeDescriptions: {
										typeIdentifier: "t_stringliteral_0bd17257abeadb2bfefe922052ef706783deb524e065d6fe3f9726c4e9c6971e",
										typeString: "literal_string \"https://mintlit.com/metadata/polygon/{id}\""
									},
									value: "https://mintlit.com/metadata/polygon/{id}"
								}
							],
							id: 1589,
							modifierName: {
								id: 1587,
								name: "ERC1155",
								nodeType: "Identifier",
								overloadedDeclarations: [
								],
								referencedDeclaration: 1556,
								src: "421:7:1",
								typeDescriptions: {
									typeIdentifier: "t_type$_t_contract$_ERC1155_$1556_$",
									typeString: "type(contract ERC1155)"
								}
							},
							nodeType: "ModifierInvocation",
							src: "421:52:1"
						}
					],
					name: "",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 1586,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "418:2:1"
					},
					returnParameters: {
						id: 1590,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "474:0:1"
					},
					scope: 1718,
					src: "407:158:1",
					stateMutability: "nonpayable",
					virtual: false,
					visibility: "public"
				},
				{
					body: {
						id: 1625,
						nodeType: "Block",
						src: "626:89:1",
						statements: [
							{
								expression: {
									id: 1613,
									isConstant: false,
									isLValue: false,
									isPure: false,
									lValueRequested: false,
									nodeType: "UnaryOperation",
									operator: "++",
									prefix: false,
									src: "632:10:1",
									subExpression: {
										id: 1612,
										name: "tokenIds",
										nodeType: "Identifier",
										overloadedDeclarations: [
										],
										referencedDeclaration: 1569,
										src: "632:8:1",
										typeDescriptions: {
											typeIdentifier: "t_uint256",
											typeString: "uint256"
										}
									},
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								id: 1614,
								nodeType: "ExpressionStatement",
								src: "632:10:1"
							},
							{
								expression: {
									"arguments": [
										{
											expression: {
												id: 1616,
												name: "msg",
												nodeType: "Identifier",
												overloadedDeclarations: [
												],
												referencedDeclaration: 4294967281,
												src: "654:3:1",
												typeDescriptions: {
													typeIdentifier: "t_magic_message",
													typeString: "msg"
												}
											},
											id: 1617,
											isConstant: false,
											isLValue: false,
											isPure: false,
											lValueRequested: false,
											memberName: "sender",
											nodeType: "MemberAccess",
											src: "654:10:1",
											typeDescriptions: {
												typeIdentifier: "t_address_payable",
												typeString: "address payable"
											}
										},
										{
											id: 1618,
											name: "tokenIds",
											nodeType: "Identifier",
											overloadedDeclarations: [
											],
											referencedDeclaration: 1569,
											src: "666:8:1",
											typeDescriptions: {
												typeIdentifier: "t_uint256",
												typeString: "uint256"
											}
										},
										{
											id: 1619,
											name: "quantity",
											nodeType: "Identifier",
											overloadedDeclarations: [
											],
											referencedDeclaration: 1607,
											src: "676:8:1",
											typeDescriptions: {
												typeIdentifier: "t_uint256",
												typeString: "uint256"
											}
										},
										{
											hexValue: "",
											id: 1620,
											isConstant: false,
											isLValue: false,
											isPure: true,
											kind: "string",
											lValueRequested: false,
											nodeType: "Literal",
											src: "686:2:1",
											typeDescriptions: {
												typeIdentifier: "t_stringliteral_c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
												typeString: "literal_string \"\""
											},
											value: ""
										}
									],
									expression: {
										argumentTypes: [
											{
												typeIdentifier: "t_address_payable",
												typeString: "address payable"
											},
											{
												typeIdentifier: "t_uint256",
												typeString: "uint256"
											},
											{
												typeIdentifier: "t_uint256",
												typeString: "uint256"
											},
											{
												typeIdentifier: "t_stringliteral_c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
												typeString: "literal_string \"\""
											}
										],
										id: 1615,
										name: "_mint",
										nodeType: "Identifier",
										overloadedDeclarations: [
										],
										referencedDeclaration: 1104,
										src: "648:5:1",
										typeDescriptions: {
											typeIdentifier: "t_function_internal_nonpayable$_t_address_$_t_uint256_$_t_uint256_$_t_bytes_memory_ptr_$returns$__$",
											typeString: "function (address,uint256,uint256,bytes memory)"
										}
									},
									id: 1621,
									isConstant: false,
									isLValue: false,
									isPure: false,
									kind: "functionCall",
									lValueRequested: false,
									names: [
									],
									nodeType: "FunctionCall",
									src: "648:41:1",
									tryCall: false,
									typeDescriptions: {
										typeIdentifier: "t_tuple$__$",
										typeString: "tuple()"
									}
								},
								id: 1622,
								nodeType: "ExpressionStatement",
								src: "648:41:1"
							},
							{
								expression: {
									id: 1623,
									name: "tokenIds",
									nodeType: "Identifier",
									overloadedDeclarations: [
									],
									referencedDeclaration: 1569,
									src: "702:8:1",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								functionReturnParameters: 1611,
								id: 1624,
								nodeType: "Return",
								src: "695:15:1"
							}
						]
					},
					functionSelector: "a0712d68",
					id: 1626,
					implemented: true,
					kind: "function",
					modifiers: [
					],
					name: "mint",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 1608,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1607,
								mutability: "mutable",
								name: "quantity",
								nodeType: "VariableDeclaration",
								scope: 1626,
								src: "583:16:1",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 1606,
									name: "uint256",
									nodeType: "ElementaryTypeName",
									src: "583:7:1",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								visibility: "internal"
							}
						],
						src: "582:18:1"
					},
					returnParameters: {
						id: 1611,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1610,
								mutability: "mutable",
								name: "",
								nodeType: "VariableDeclaration",
								scope: 1626,
								src: "617:7:1",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_uint256",
									typeString: "uint256"
								},
								typeName: {
									id: 1609,
									name: "uint256",
									nodeType: "ElementaryTypeName",
									src: "617:7:1",
									typeDescriptions: {
										typeIdentifier: "t_uint256",
										typeString: "uint256"
									}
								},
								visibility: "internal"
							}
						],
						src: "616:9:1"
					},
					scope: 1718,
					src: "569:146:1",
					stateMutability: "nonpayable",
					virtual: false,
					visibility: "public"
				},
				{
					baseFunctions: [
						767
					],
					body: {
						id: 1657,
						nodeType: "Block",
						src: "921:204:1",
						statements: [
							{
								condition: {
									commonType: {
										typeIdentifier: "t_bool",
										typeString: "bool"
									},
									id: 1646,
									isConstant: false,
									isLValue: false,
									isPure: false,
									lValueRequested: false,
									leftExpression: {
										commonType: {
											typeIdentifier: "t_address",
											typeString: "address"
										},
										id: 1642,
										isConstant: false,
										isLValue: false,
										isPure: false,
										lValueRequested: false,
										leftExpression: {
											id: 1637,
											name: "_operator",
											nodeType: "Identifier",
											overloadedDeclarations: [
											],
											referencedDeclaration: 1631,
											src: "933:9:1",
											typeDescriptions: {
												typeIdentifier: "t_address",
												typeString: "address"
											}
										},
										nodeType: "BinaryOperation",
										operator: "==",
										rightExpression: {
											"arguments": [
												{
													hexValue: "307832303746613844663361313744393643613745413466323839336663644362373861333034313031",
													id: 1640,
													isConstant: false,
													isLValue: false,
													isPure: true,
													kind: "number",
													lValueRequested: false,
													nodeType: "Literal",
													src: "954:42:1",
													typeDescriptions: {
														typeIdentifier: "t_address_payable",
														typeString: "address payable"
													},
													value: "0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101"
												}
											],
											expression: {
												argumentTypes: [
													{
														typeIdentifier: "t_address_payable",
														typeString: "address payable"
													}
												],
												id: 1639,
												isConstant: false,
												isLValue: false,
												isPure: true,
												lValueRequested: false,
												nodeType: "ElementaryTypeNameExpression",
												src: "946:7:1",
												typeDescriptions: {
													typeIdentifier: "t_type$_t_address_$",
													typeString: "type(address)"
												},
												typeName: {
													id: 1638,
													name: "address",
													nodeType: "ElementaryTypeName",
													src: "946:7:1",
													typeDescriptions: {
													}
												}
											},
											id: 1641,
											isConstant: false,
											isLValue: false,
											isPure: true,
											kind: "typeConversion",
											lValueRequested: false,
											names: [
											],
											nodeType: "FunctionCall",
											src: "946:51:1",
											tryCall: false,
											typeDescriptions: {
												typeIdentifier: "t_address",
												typeString: "address"
											}
										},
										src: "933:64:1",
										typeDescriptions: {
											typeIdentifier: "t_bool",
											typeString: "bool"
										}
									},
									nodeType: "BinaryOperation",
									operator: "&&",
									rightExpression: {
										commonType: {
											typeIdentifier: "t_bool",
											typeString: "bool"
										},
										id: 1645,
										isConstant: false,
										isLValue: false,
										isPure: false,
										lValueRequested: false,
										leftExpression: {
											id: 1643,
											name: "openseaProxyEnabled",
											nodeType: "Identifier",
											overloadedDeclarations: [
											],
											referencedDeclaration: 1573,
											src: "1001:19:1",
											typeDescriptions: {
												typeIdentifier: "t_bool",
												typeString: "bool"
											}
										},
										nodeType: "BinaryOperation",
										operator: "==",
										rightExpression: {
											hexValue: "74727565",
											id: 1644,
											isConstant: false,
											isLValue: false,
											isPure: true,
											kind: "bool",
											lValueRequested: false,
											nodeType: "Literal",
											src: "1024:4:1",
											typeDescriptions: {
												typeIdentifier: "t_bool",
												typeString: "bool"
											},
											value: "true"
										},
										src: "1001:27:1",
										typeDescriptions: {
											typeIdentifier: "t_bool",
											typeString: "bool"
										}
									},
									src: "933:95:1",
									typeDescriptions: {
										typeIdentifier: "t_bool",
										typeString: "bool"
									}
								},
								id: 1650,
								nodeType: "IfStatement",
								src: "929:133:1",
								trueBody: {
									id: 1649,
									nodeType: "Block",
									src: "1030:32:1",
									statements: [
										{
											expression: {
												hexValue: "74727565",
												id: 1647,
												isConstant: false,
												isLValue: false,
												isPure: true,
												kind: "bool",
												lValueRequested: false,
												nodeType: "Literal",
												src: "1049:4:1",
												typeDescriptions: {
													typeIdentifier: "t_bool",
													typeString: "bool"
												},
												value: "true"
											},
											functionReturnParameters: 1636,
											id: 1648,
											nodeType: "Return",
											src: "1042:11:1"
										}
									]
								}
							},
							{
								expression: {
									"arguments": [
										{
											id: 1653,
											name: "_owner",
											nodeType: "Identifier",
											overloadedDeclarations: [
											],
											referencedDeclaration: 1629,
											src: "1102:6:1",
											typeDescriptions: {
												typeIdentifier: "t_address",
												typeString: "address"
											}
										},
										{
											id: 1654,
											name: "_operator",
											nodeType: "Identifier",
											overloadedDeclarations: [
											],
											referencedDeclaration: 1631,
											src: "1110:9:1",
											typeDescriptions: {
												typeIdentifier: "t_address",
												typeString: "address"
											}
										}
									],
									expression: {
										argumentTypes: [
											{
												typeIdentifier: "t_address",
												typeString: "address"
											},
											{
												typeIdentifier: "t_address",
												typeString: "address"
											}
										],
										expression: {
											id: 1651,
											name: "ERC1155",
											nodeType: "Identifier",
											overloadedDeclarations: [
											],
											referencedDeclaration: 1556,
											src: "1077:7:1",
											typeDescriptions: {
												typeIdentifier: "t_type$_t_contract$_ERC1155_$1556_$",
												typeString: "type(contract ERC1155)"
											}
										},
										id: 1652,
										isConstant: false,
										isLValue: false,
										isPure: false,
										lValueRequested: false,
										memberName: "isApprovedForAll",
										nodeType: "MemberAccess",
										referencedDeclaration: 767,
										src: "1077:24:1",
										typeDescriptions: {
											typeIdentifier: "t_function_internal_view$_t_address_$_t_address_$returns$_t_bool_$",
											typeString: "function (address,address) view returns (bool)"
										}
									},
									id: 1655,
									isConstant: false,
									isLValue: false,
									isPure: false,
									kind: "functionCall",
									lValueRequested: false,
									names: [
									],
									nodeType: "FunctionCall",
									src: "1077:43:1",
									tryCall: false,
									typeDescriptions: {
										typeIdentifier: "t_bool",
										typeString: "bool"
									}
								},
								functionReturnParameters: 1636,
								id: 1656,
								nodeType: "Return",
								src: "1070:50:1"
							}
						]
					},
					documentation: {
						id: 1627,
						nodeType: "StructuredDocumentation",
						src: "719:75:1",
						text: " Override isApprovedForAll to whitelist opensea proxy account"
					},
					functionSelector: "e985e9c5",
					id: 1658,
					implemented: true,
					kind: "function",
					modifiers: [
					],
					name: "isApprovedForAll",
					nodeType: "FunctionDefinition",
					overrides: {
						id: 1633,
						nodeType: "OverrideSpecifier",
						overrides: [
						],
						src: "881:8:1"
					},
					parameters: {
						id: 1632,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1629,
								mutability: "mutable",
								name: "_owner",
								nodeType: "VariableDeclaration",
								scope: 1658,
								src: "830:14:1",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 1628,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "830:7:1",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								visibility: "internal"
							},
							{
								constant: false,
								id: 1631,
								mutability: "mutable",
								name: "_operator",
								nodeType: "VariableDeclaration",
								scope: 1658,
								src: "852:17:1",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 1630,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "852:7:1",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								visibility: "internal"
							}
						],
						src: "822:51:1"
					},
					returnParameters: {
						id: 1636,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1635,
								mutability: "mutable",
								name: "isOperator",
								nodeType: "VariableDeclaration",
								scope: 1658,
								src: "904:15:1",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_bool",
									typeString: "bool"
								},
								typeName: {
									id: 1634,
									name: "bool",
									nodeType: "ElementaryTypeName",
									src: "904:4:1",
									typeDescriptions: {
										typeIdentifier: "t_bool",
										typeString: "bool"
									}
								},
								visibility: "internal"
							}
						],
						src: "903:17:1"
					},
					scope: 1718,
					src: "797:328:1",
					stateMutability: "view",
					virtual: false,
					visibility: "public"
				},
				{
					baseFunctions: [
						193
					],
					body: {
						id: 1669,
						nodeType: "Block",
						src: "1359:44:1",
						statements: [
							{
								expression: {
									"arguments": [
									],
									expression: {
										argumentTypes: [
										],
										expression: {
											id: 1665,
											name: "ContextMixin",
											nodeType: "Identifier",
											overloadedDeclarations: [
											],
											referencedDeclaration: 1757,
											src: "1374:12:1",
											typeDescriptions: {
												typeIdentifier: "t_type$_t_contract$_ContextMixin_$1757_$",
												typeString: "type(contract ContextMixin)"
											}
										},
										id: 1666,
										isConstant: false,
										isLValue: false,
										isPure: false,
										lValueRequested: false,
										memberName: "msgSender",
										nodeType: "MemberAccess",
										referencedDeclaration: 1756,
										src: "1374:22:1",
										typeDescriptions: {
											typeIdentifier: "t_function_internal_view$__$returns$_t_address_payable_$",
											typeString: "function () view returns (address payable)"
										}
									},
									id: 1667,
									isConstant: false,
									isLValue: false,
									isPure: false,
									kind: "functionCall",
									lValueRequested: false,
									names: [
									],
									nodeType: "FunctionCall",
									src: "1374:24:1",
									tryCall: false,
									typeDescriptions: {
										typeIdentifier: "t_address_payable",
										typeString: "address payable"
									}
								},
								functionReturnParameters: 1664,
								id: 1668,
								nodeType: "Return",
								src: "1367:31:1"
							}
						]
					},
					documentation: {
						id: 1659,
						nodeType: "StructuredDocumentation",
						src: "1129:123:1",
						text: " This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea."
					},
					id: 1670,
					implemented: true,
					kind: "function",
					modifiers: [
					],
					name: "_msgSender",
					nodeType: "FunctionDefinition",
					overrides: {
						id: 1661,
						nodeType: "OverrideSpecifier",
						overrides: [
						],
						src: "1298:8:1"
					},
					parameters: {
						id: 1660,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "1274:2:1"
					},
					returnParameters: {
						id: 1664,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1663,
								mutability: "mutable",
								name: "sender",
								nodeType: "VariableDeclaration",
								scope: 1670,
								src: "1333:22:1",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address_payable",
									typeString: "address payable"
								},
								typeName: {
									id: 1662,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "1333:15:1",
									stateMutability: "payable",
									typeDescriptions: {
										typeIdentifier: "t_address_payable",
										typeString: "address payable"
									}
								},
								visibility: "internal"
							}
						],
						src: "1332:24:1"
					},
					scope: 1718,
					src: "1255:148:1",
					stateMutability: "view",
					virtual: false,
					visibility: "internal"
				},
				{
					body: {
						id: 1682,
						nodeType: "Block",
						src: "1499:40:1",
						statements: [
							{
								expression: {
									id: 1680,
									isConstant: false,
									isLValue: false,
									isPure: false,
									lValueRequested: false,
									leftHandSide: {
										id: 1678,
										name: "openseaProxyEnabled",
										nodeType: "Identifier",
										overloadedDeclarations: [
										],
										referencedDeclaration: 1573,
										src: "1505:19:1",
										typeDescriptions: {
											typeIdentifier: "t_bool",
											typeString: "bool"
										}
									},
									nodeType: "Assignment",
									operator: "=",
									rightHandSide: {
										id: 1679,
										name: "enabled",
										nodeType: "Identifier",
										overloadedDeclarations: [
										],
										referencedDeclaration: 1673,
										src: "1527:7:1",
										typeDescriptions: {
											typeIdentifier: "t_bool",
											typeString: "bool"
										}
									},
									src: "1505:29:1",
									typeDescriptions: {
										typeIdentifier: "t_bool",
										typeString: "bool"
									}
								},
								id: 1681,
								nodeType: "ExpressionStatement",
								src: "1505:29:1"
							}
						]
					},
					documentation: {
						id: 1671,
						nodeType: "StructuredDocumentation",
						src: "1407:25:1",
						text: " Admin APIs"
					},
					functionSelector: "4cc63d6c",
					id: 1683,
					implemented: true,
					kind: "function",
					modifiers: [
						{
							id: 1676,
							modifierName: {
								id: 1675,
								name: "onlyAdmin",
								nodeType: "Identifier",
								overloadedDeclarations: [
								],
								referencedDeclaration: 1585,
								src: "1489:9:1",
								typeDescriptions: {
									typeIdentifier: "t_modifier$__$",
									typeString: "modifier ()"
								}
							},
							nodeType: "ModifierInvocation",
							src: "1489:9:1"
						}
					],
					name: "setOpenseaProxyEnabled",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 1674,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1673,
								mutability: "mutable",
								name: "enabled",
								nodeType: "VariableDeclaration",
								scope: 1683,
								src: "1468:12:1",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_bool",
									typeString: "bool"
								},
								typeName: {
									id: 1672,
									name: "bool",
									nodeType: "ElementaryTypeName",
									src: "1468:4:1",
									typeDescriptions: {
										typeIdentifier: "t_bool",
										typeString: "bool"
									}
								},
								visibility: "internal"
							}
						],
						src: "1467:14:1"
					},
					returnParameters: {
						id: 1677,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "1499:0:1"
					},
					scope: 1718,
					src: "1436:103:1",
					stateMutability: "nonpayable",
					virtual: false,
					visibility: "public"
				},
				{
					body: {
						id: 1695,
						nodeType: "Block",
						src: "1742:27:1",
						statements: [
							{
								expression: {
									id: 1693,
									isConstant: false,
									isLValue: false,
									isPure: false,
									lValueRequested: false,
									leftHandSide: {
										id: 1691,
										name: "admin",
										nodeType: "Identifier",
										overloadedDeclarations: [
										],
										referencedDeclaration: 1571,
										src: "1748:5:1",
										typeDescriptions: {
											typeIdentifier: "t_address",
											typeString: "address"
										}
									},
									nodeType: "Assignment",
									operator: "=",
									rightHandSide: {
										id: 1692,
										name: "newAdmin",
										nodeType: "Identifier",
										overloadedDeclarations: [
										],
										referencedDeclaration: 1686,
										src: "1756:8:1",
										typeDescriptions: {
											typeIdentifier: "t_address",
											typeString: "address"
										}
									},
									src: "1748:16:1",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								id: 1694,
								nodeType: "ExpressionStatement",
								src: "1748:16:1"
							}
						]
					},
					documentation: {
						id: 1684,
						nodeType: "StructuredDocumentation",
						src: "1543:140:1",
						text: " @dev admin function to set new root admin.\n @param newAdmin address the new admin to assign, which manages delegates"
					},
					functionSelector: "8f283970",
					id: 1696,
					implemented: true,
					kind: "function",
					modifiers: [
						{
							id: 1689,
							modifierName: {
								id: 1688,
								name: "onlyAdmin",
								nodeType: "Identifier",
								overloadedDeclarations: [
								],
								referencedDeclaration: 1585,
								src: "1732:9:1",
								typeDescriptions: {
									typeIdentifier: "t_modifier$__$",
									typeString: "modifier ()"
								}
							},
							nodeType: "ModifierInvocation",
							src: "1732:9:1"
						}
					],
					name: "changeAdmin",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 1687,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1686,
								mutability: "mutable",
								name: "newAdmin",
								nodeType: "VariableDeclaration",
								scope: 1696,
								src: "1707:16:1",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 1685,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "1707:7:1",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								visibility: "internal"
							}
						],
						src: "1706:18:1"
					},
					returnParameters: {
						id: 1690,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "1742:0:1"
					},
					scope: 1718,
					src: "1686:83:1",
					stateMutability: "nonpayable",
					virtual: false,
					visibility: "public"
				},
				{
					body: {
						id: 1707,
						nodeType: "Block",
						src: "1825:23:1",
						statements: [
							{
								expression: {
									"arguments": [
										{
											id: 1704,
											name: "uri",
											nodeType: "Identifier",
											overloadedDeclarations: [
											],
											referencedDeclaration: 1698,
											src: "1839:3:1",
											typeDescriptions: {
												typeIdentifier: "t_string_memory_ptr",
												typeString: "string memory"
											}
										}
									],
									expression: {
										argumentTypes: [
											{
												typeIdentifier: "t_string_memory_ptr",
												typeString: "string memory"
											}
										],
										id: 1703,
										name: "_setURI",
										nodeType: "Identifier",
										overloadedDeclarations: [
										],
										referencedDeclaration: 1022,
										src: "1831:7:1",
										typeDescriptions: {
											typeIdentifier: "t_function_internal_nonpayable$_t_string_memory_ptr_$returns$__$",
											typeString: "function (string memory)"
										}
									},
									id: 1705,
									isConstant: false,
									isLValue: false,
									isPure: false,
									kind: "functionCall",
									lValueRequested: false,
									names: [
									],
									nodeType: "FunctionCall",
									src: "1831:12:1",
									tryCall: false,
									typeDescriptions: {
										typeIdentifier: "t_tuple$__$",
										typeString: "tuple()"
									}
								},
								id: 1706,
								nodeType: "ExpressionStatement",
								src: "1831:12:1"
							}
						]
					},
					functionSelector: "02fe5305",
					id: 1708,
					implemented: true,
					kind: "function",
					modifiers: [
						{
							id: 1701,
							modifierName: {
								id: 1700,
								name: "onlyAdmin",
								nodeType: "Identifier",
								overloadedDeclarations: [
								],
								referencedDeclaration: 1585,
								src: "1815:9:1",
								typeDescriptions: {
									typeIdentifier: "t_modifier$__$",
									typeString: "modifier ()"
								}
							},
							nodeType: "ModifierInvocation",
							src: "1815:9:1"
						}
					],
					name: "setURI",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 1699,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1698,
								mutability: "mutable",
								name: "uri",
								nodeType: "VariableDeclaration",
								scope: 1708,
								src: "1789:17:1",
								stateVariable: false,
								storageLocation: "memory",
								typeDescriptions: {
									typeIdentifier: "t_string_memory_ptr",
									typeString: "string"
								},
								typeName: {
									id: 1697,
									name: "string",
									nodeType: "ElementaryTypeName",
									src: "1789:6:1",
									typeDescriptions: {
										typeIdentifier: "t_string_storage_ptr",
										typeString: "string"
									}
								},
								visibility: "internal"
							}
						],
						src: "1788:19:1"
					},
					returnParameters: {
						id: 1702,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "1825:0:1"
					},
					scope: 1718,
					src: "1773:75:1",
					stateMutability: "nonpayable",
					virtual: false,
					visibility: "public"
				},
				{
					body: {
						id: 1716,
						nodeType: "Block",
						src: "1929:23:1",
						statements: [
							{
								expression: {
									id: 1714,
									name: "admin",
									nodeType: "Identifier",
									overloadedDeclarations: [
									],
									referencedDeclaration: 1571,
									src: "1942:5:1",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								functionReturnParameters: 1713,
								id: 1715,
								nodeType: "Return",
								src: "1935:12:1"
							}
						]
					},
					documentation: {
						id: 1709,
						nodeType: "StructuredDocumentation",
						src: "1852:24:1",
						text: " Read APIs"
					},
					functionSelector: "6e9960c3",
					id: 1717,
					implemented: true,
					kind: "function",
					modifiers: [
					],
					name: "getAdmin",
					nodeType: "FunctionDefinition",
					parameters: {
						id: 1710,
						nodeType: "ParameterList",
						parameters: [
						],
						src: "1896:2:1"
					},
					returnParameters: {
						id: 1713,
						nodeType: "ParameterList",
						parameters: [
							{
								constant: false,
								id: 1712,
								mutability: "mutable",
								name: "",
								nodeType: "VariableDeclaration",
								scope: 1717,
								src: "1920:7:1",
								stateVariable: false,
								storageLocation: "default",
								typeDescriptions: {
									typeIdentifier: "t_address",
									typeString: "address"
								},
								typeName: {
									id: 1711,
									name: "address",
									nodeType: "ElementaryTypeName",
									src: "1920:7:1",
									stateMutability: "nonpayable",
									typeDescriptions: {
										typeIdentifier: "t_address",
										typeString: "address"
									}
								},
								visibility: "internal"
							}
						],
						src: "1919:9:1"
					},
					scope: 1718,
					src: "1879:73:1",
					stateMutability: "view",
					virtual: false,
					visibility: "public"
				}
			],
			scope: 1719,
			src: "132:1822:1"
		}
	],
	src: "0:1954:1"
};
var legacyAST = {
	attributes: {
		absolutePath: "/Users/chris/Documents/WorkStuff/LIT/mintlit/contracts/src/contracts/LIT.sol",
		exportedSymbols: {
			Address: [
				556
			],
			Context: [
				205
			],
			ContextMixin: [
				1757
			],
			EIP712Base: [
				1889
			],
			ERC1155: [
				1556
			],
			ERC165: [
				260
			],
			IERC1155: [
				131
			],
			IERC1155MetadataURI: [
				144
			],
			IERC1155Receiver: [
				183
			],
			IERC165: [
				11
			],
			Initializable: [
				1776
			],
			LIT: [
				1718
			],
			NativeMetaTransaction: [
				2077
			],
			SafeMath: [
				2489
			]
		},
		license: "MIT"
	},
	children: [
		{
			attributes: {
				literals: [
					"solidity",
					"^",
					"0.7",
					".6"
				]
			},
			id: 1558,
			name: "PragmaDirective",
			src: "0:23:1"
		},
		{
			attributes: {
				SourceUnit: 2490,
				absolutePath: "/Users/chris/Documents/WorkStuff/LIT/mintlit/contracts/src/contracts/SafeMath.sol",
				file: "./SafeMath.sol",
				scope: 1719,
				symbolAliases: [
					null
				],
				unitAlias: ""
			},
			id: 1559,
			name: "ImportDirective",
			src: "57:24:1"
		},
		{
			attributes: {
				SourceUnit: 1557,
				absolutePath: "/Users/chris/Documents/WorkStuff/LIT/mintlit/contracts/src/contracts/ERC1155.sol",
				file: "./ERC1155.sol",
				scope: 1719,
				symbolAliases: [
					null
				],
				unitAlias: ""
			},
			id: 1560,
			name: "ImportDirective",
			src: "82:23:1"
		},
		{
			attributes: {
				SourceUnit: 2078,
				absolutePath: "/Users/chris/Documents/WorkStuff/LIT/mintlit/contracts/src/contracts/MetaTxns.sol",
				file: "./MetaTxns.sol",
				scope: 1719,
				symbolAliases: [
					null
				],
				unitAlias: ""
			},
			id: 1561,
			name: "ImportDirective",
			src: "106:24:1"
		},
		{
			attributes: {
				abstract: false,
				contractDependencies: [
					11,
					131,
					144,
					205,
					260,
					1556,
					1757,
					1776,
					1889,
					2077
				],
				contractKind: "contract",
				fullyImplemented: true,
				linearizedBaseContracts: [
					1718,
					2077,
					1889,
					1776,
					1757,
					1556,
					144,
					131,
					260,
					11,
					205
				],
				name: "LIT",
				scope: 1719
			},
			children: [
				{
					attributes: {
					},
					children: [
						{
							attributes: {
								name: "ERC1155",
								referencedDeclaration: 1556,
								type: "contract ERC1155"
							},
							id: 1562,
							name: "UserDefinedTypeName",
							src: "148:7:1"
						}
					],
					id: 1563,
					name: "InheritanceSpecifier",
					src: "148:7:1"
				},
				{
					attributes: {
					},
					children: [
						{
							attributes: {
								name: "ContextMixin",
								referencedDeclaration: 1757,
								type: "contract ContextMixin"
							},
							id: 1564,
							name: "UserDefinedTypeName",
							src: "157:12:1"
						}
					],
					id: 1565,
					name: "InheritanceSpecifier",
					src: "157:12:1"
				},
				{
					attributes: {
					},
					children: [
						{
							attributes: {
								name: "NativeMetaTransaction",
								referencedDeclaration: 2077,
								type: "contract NativeMetaTransaction"
							},
							id: 1566,
							name: "UserDefinedTypeName",
							src: "171:21:1"
						}
					],
					id: 1567,
					name: "InheritanceSpecifier",
					src: "171:21:1"
				},
				{
					attributes: {
						constant: false,
						functionSelector: "714cff56",
						mutability: "mutable",
						name: "tokenIds",
						scope: 1718,
						stateVariable: true,
						storageLocation: "default",
						type: "uint256",
						visibility: "public"
					},
					children: [
						{
							attributes: {
								name: "uint256",
								type: "uint256"
							},
							id: 1568,
							name: "ElementaryTypeName",
							src: "213:7:1"
						}
					],
					id: 1569,
					name: "VariableDeclaration",
					src: "213:23:1"
				},
				{
					attributes: {
						constant: false,
						mutability: "mutable",
						name: "admin",
						scope: 1718,
						stateVariable: true,
						storageLocation: "default",
						type: "address",
						visibility: "private"
					},
					children: [
						{
							attributes: {
								name: "address",
								stateMutability: "nonpayable",
								type: "address"
							},
							id: 1570,
							name: "ElementaryTypeName",
							src: "262:7:1"
						}
					],
					id: 1571,
					name: "VariableDeclaration",
					src: "262:21:1"
				},
				{
					attributes: {
						constant: false,
						mutability: "mutable",
						name: "openseaProxyEnabled",
						scope: 1718,
						stateVariable: true,
						storageLocation: "default",
						type: "bool",
						visibility: "private"
					},
					children: [
						{
							attributes: {
								name: "bool",
								type: "bool"
							},
							id: 1572,
							name: "ElementaryTypeName",
							src: "287:4:1"
						}
					],
					id: 1573,
					name: "VariableDeclaration",
					src: "287:32:1"
				},
				{
					attributes: {
						name: "onlyAdmin",
						virtual: false,
						visibility: "internal"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 1574,
							name: "ParameterList",
							src: "343:0:1"
						},
						{
							children: [
								{
									children: [
										{
											attributes: {
												isConstant: false,
												isLValue: false,
												isPure: false,
												isStructConstructorCall: false,
												lValueRequested: false,
												names: [
													null
												],
												tryCall: false,
												type: "tuple()",
												type_conversion: false
											},
											children: [
												{
													attributes: {
														argumentTypes: [
															{
																typeIdentifier: "t_bool",
																typeString: "bool"
															},
															{
																typeIdentifier: "t_stringliteral_c13c296baebb1f79b18541a06c39b3d56ce1654fd26fe72a62e2fb7efe67be9a",
																typeString: "literal_string \"Only Admin\""
															}
														],
														overloadedDeclarations: [
															4294967278,
															4294967278
														],
														referencedDeclaration: 4294967278,
														type: "function (bool,string memory) pure",
														value: "require"
													},
													id: 1575,
													name: "Identifier",
													src: "349:7:1"
												},
												{
													attributes: {
														commonType: {
															typeIdentifier: "t_address",
															typeString: "address"
														},
														isConstant: false,
														isLValue: false,
														isPure: false,
														lValueRequested: false,
														operator: "==",
														type: "bool"
													},
													children: [
														{
															attributes: {
																isConstant: false,
																isLValue: false,
																isPure: false,
																lValueRequested: false,
																member_name: "sender",
																type: "address payable"
															},
															children: [
																{
																	attributes: {
																		overloadedDeclarations: [
																			null
																		],
																		referencedDeclaration: 4294967281,
																		type: "msg",
																		value: "msg"
																	},
																	id: 1576,
																	name: "Identifier",
																	src: "357:3:1"
																}
															],
															id: 1577,
															name: "MemberAccess",
															src: "357:10:1"
														},
														{
															attributes: {
																overloadedDeclarations: [
																	null
																],
																referencedDeclaration: 1571,
																type: "address",
																value: "admin"
															},
															id: 1578,
															name: "Identifier",
															src: "371:5:1"
														}
													],
													id: 1579,
													name: "BinaryOperation",
													src: "357:19:1"
												},
												{
													attributes: {
														hexvalue: "4f6e6c792041646d696e",
														isConstant: false,
														isLValue: false,
														isPure: true,
														lValueRequested: false,
														token: "string",
														type: "literal_string \"Only Admin\"",
														value: "Only Admin"
													},
													id: 1580,
													name: "Literal",
													src: "378:12:1"
												}
											],
											id: 1581,
											name: "FunctionCall",
											src: "349:42:1"
										}
									],
									id: 1582,
									name: "ExpressionStatement",
									src: "349:42:1"
								},
								{
									id: 1583,
									name: "PlaceholderStatement",
									src: "397:1:1"
								}
							],
							id: 1584,
							name: "Block",
							src: "343:60:1"
						}
					],
					id: 1585,
					name: "ModifierDefinition",
					src: "324:79:1"
				},
				{
					attributes: {
						implemented: true,
						isConstructor: true,
						kind: "constructor",
						name: "",
						scope: 1718,
						stateMutability: "nonpayable",
						virtual: false,
						visibility: "public"
					},
					children: [
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 1586,
							name: "ParameterList",
							src: "418:2:1"
						},
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 1590,
							name: "ParameterList",
							src: "474:0:1"
						},
						{
							children: [
								{
									attributes: {
										overloadedDeclarations: [
											null
										],
										referencedDeclaration: 1556,
										type: "type(contract ERC1155)",
										value: "ERC1155"
									},
									id: 1587,
									name: "Identifier",
									src: "421:7:1"
								},
								{
									attributes: {
										hexvalue: "68747470733a2f2f6d696e746c69742e636f6d2f6d657461646174612f706f6c79676f6e2f7b69647d",
										isConstant: false,
										isLValue: false,
										isPure: true,
										lValueRequested: false,
										token: "string",
										type: "literal_string \"https://mintlit.com/metadata/polygon/{id}\"",
										value: "https://mintlit.com/metadata/polygon/{id}"
									},
									id: 1588,
									name: "Literal",
									src: "429:43:1"
								}
							],
							id: 1589,
							name: "ModifierInvocation",
							src: "421:52:1"
						},
						{
							children: [
								{
									children: [
										{
											attributes: {
												isConstant: false,
												isLValue: false,
												isPure: false,
												lValueRequested: false,
												operator: "=",
												type: "address"
											},
											children: [
												{
													attributes: {
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1571,
														type: "address",
														value: "admin"
													},
													id: 1591,
													name: "Identifier",
													src: "480:5:1"
												},
												{
													attributes: {
														isConstant: false,
														isLValue: false,
														isPure: false,
														lValueRequested: false,
														member_name: "sender",
														type: "address payable"
													},
													children: [
														{
															attributes: {
																overloadedDeclarations: [
																	null
																],
																referencedDeclaration: 4294967281,
																type: "msg",
																value: "msg"
															},
															id: 1592,
															name: "Identifier",
															src: "488:3:1"
														}
													],
													id: 1593,
													name: "MemberAccess",
													src: "488:10:1"
												}
											],
											id: 1594,
											name: "Assignment",
											src: "480:18:1"
										}
									],
									id: 1595,
									name: "ExpressionStatement",
									src: "480:18:1"
								},
								{
									children: [
										{
											attributes: {
												isConstant: false,
												isLValue: false,
												isPure: false,
												lValueRequested: false,
												operator: "=",
												type: "bool"
											},
											children: [
												{
													attributes: {
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1573,
														type: "bool",
														value: "openseaProxyEnabled"
													},
													id: 1596,
													name: "Identifier",
													src: "504:19:1"
												},
												{
													attributes: {
														hexvalue: "74727565",
														isConstant: false,
														isLValue: false,
														isPure: true,
														lValueRequested: false,
														token: "bool",
														type: "bool",
														value: "true"
													},
													id: 1597,
													name: "Literal",
													src: "526:4:1"
												}
											],
											id: 1598,
											name: "Assignment",
											src: "504:26:1"
										}
									],
									id: 1599,
									name: "ExpressionStatement",
									src: "504:26:1"
								},
								{
									children: [
										{
											attributes: {
												isConstant: false,
												isLValue: false,
												isPure: false,
												isStructConstructorCall: false,
												lValueRequested: false,
												names: [
													null
												],
												tryCall: false,
												type: "tuple()",
												type_conversion: false
											},
											children: [
												{
													attributes: {
														argumentTypes: [
															{
																typeIdentifier: "t_stringliteral_cc6d7d84473dcc72642b2f5d66c702663d241f6c9c8fc2cbecc2e0aa18dc943a",
																typeString: "literal_string \"LIT\""
															}
														],
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1813,
														type: "function (string memory)",
														value: "_initializeEIP712"
													},
													id: 1600,
													name: "Identifier",
													src: "536:17:1"
												},
												{
													attributes: {
														hexvalue: "4c4954",
														isConstant: false,
														isLValue: false,
														isPure: true,
														lValueRequested: false,
														token: "string",
														type: "literal_string \"LIT\"",
														value: "LIT"
													},
													id: 1601,
													name: "Literal",
													src: "554:5:1"
												}
											],
											id: 1602,
											name: "FunctionCall",
											src: "536:24:1"
										}
									],
									id: 1603,
									name: "ExpressionStatement",
									src: "536:24:1"
								}
							],
							id: 1604,
							name: "Block",
							src: "474:91:1"
						}
					],
					id: 1605,
					name: "FunctionDefinition",
					src: "407:158:1"
				},
				{
					attributes: {
						functionSelector: "a0712d68",
						implemented: true,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "mint",
						scope: 1718,
						stateMutability: "nonpayable",
						virtual: false,
						visibility: "public"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										mutability: "mutable",
										name: "quantity",
										scope: 1626,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint256",
												type: "uint256"
											},
											id: 1606,
											name: "ElementaryTypeName",
											src: "583:7:1"
										}
									],
									id: 1607,
									name: "VariableDeclaration",
									src: "583:16:1"
								}
							],
							id: 1608,
							name: "ParameterList",
							src: "582:18:1"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										mutability: "mutable",
										name: "",
										scope: 1626,
										stateVariable: false,
										storageLocation: "default",
										type: "uint256",
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "uint256",
												type: "uint256"
											},
											id: 1609,
											name: "ElementaryTypeName",
											src: "617:7:1"
										}
									],
									id: 1610,
									name: "VariableDeclaration",
									src: "617:7:1"
								}
							],
							id: 1611,
							name: "ParameterList",
							src: "616:9:1"
						},
						{
							children: [
								{
									children: [
										{
											attributes: {
												isConstant: false,
												isLValue: false,
												isPure: false,
												lValueRequested: false,
												operator: "++",
												prefix: false,
												type: "uint256"
											},
											children: [
												{
													attributes: {
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1569,
														type: "uint256",
														value: "tokenIds"
													},
													id: 1612,
													name: "Identifier",
													src: "632:8:1"
												}
											],
											id: 1613,
											name: "UnaryOperation",
											src: "632:10:1"
										}
									],
									id: 1614,
									name: "ExpressionStatement",
									src: "632:10:1"
								},
								{
									children: [
										{
											attributes: {
												isConstant: false,
												isLValue: false,
												isPure: false,
												isStructConstructorCall: false,
												lValueRequested: false,
												names: [
													null
												],
												tryCall: false,
												type: "tuple()",
												type_conversion: false
											},
											children: [
												{
													attributes: {
														argumentTypes: [
															{
																typeIdentifier: "t_address_payable",
																typeString: "address payable"
															},
															{
																typeIdentifier: "t_uint256",
																typeString: "uint256"
															},
															{
																typeIdentifier: "t_uint256",
																typeString: "uint256"
															},
															{
																typeIdentifier: "t_stringliteral_c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
																typeString: "literal_string \"\""
															}
														],
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1104,
														type: "function (address,uint256,uint256,bytes memory)",
														value: "_mint"
													},
													id: 1615,
													name: "Identifier",
													src: "648:5:1"
												},
												{
													attributes: {
														isConstant: false,
														isLValue: false,
														isPure: false,
														lValueRequested: false,
														member_name: "sender",
														type: "address payable"
													},
													children: [
														{
															attributes: {
																overloadedDeclarations: [
																	null
																],
																referencedDeclaration: 4294967281,
																type: "msg",
																value: "msg"
															},
															id: 1616,
															name: "Identifier",
															src: "654:3:1"
														}
													],
													id: 1617,
													name: "MemberAccess",
													src: "654:10:1"
												},
												{
													attributes: {
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1569,
														type: "uint256",
														value: "tokenIds"
													},
													id: 1618,
													name: "Identifier",
													src: "666:8:1"
												},
												{
													attributes: {
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1607,
														type: "uint256",
														value: "quantity"
													},
													id: 1619,
													name: "Identifier",
													src: "676:8:1"
												},
												{
													attributes: {
														hexvalue: "",
														isConstant: false,
														isLValue: false,
														isPure: true,
														lValueRequested: false,
														token: "string",
														type: "literal_string \"\"",
														value: ""
													},
													id: 1620,
													name: "Literal",
													src: "686:2:1"
												}
											],
											id: 1621,
											name: "FunctionCall",
											src: "648:41:1"
										}
									],
									id: 1622,
									name: "ExpressionStatement",
									src: "648:41:1"
								},
								{
									attributes: {
										functionReturnParameters: 1611
									},
									children: [
										{
											attributes: {
												overloadedDeclarations: [
													null
												],
												referencedDeclaration: 1569,
												type: "uint256",
												value: "tokenIds"
											},
											id: 1623,
											name: "Identifier",
											src: "702:8:1"
										}
									],
									id: 1624,
									name: "Return",
									src: "695:15:1"
								}
							],
							id: 1625,
							name: "Block",
							src: "626:89:1"
						}
					],
					id: 1626,
					name: "FunctionDefinition",
					src: "569:146:1"
				},
				{
					attributes: {
						baseFunctions: [
							767
						],
						functionSelector: "e985e9c5",
						implemented: true,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "isApprovedForAll",
						scope: 1718,
						stateMutability: "view",
						virtual: false,
						visibility: "public"
					},
					children: [
						{
							attributes: {
								text: " Override isApprovedForAll to whitelist opensea proxy account"
							},
							id: 1627,
							name: "StructuredDocumentation",
							src: "719:75:1"
						},
						{
							attributes: {
								overrides: [
									null
								]
							},
							id: 1633,
							name: "OverrideSpecifier",
							src: "881:8:1"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										mutability: "mutable",
										name: "_owner",
										scope: 1658,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 1628,
											name: "ElementaryTypeName",
											src: "830:7:1"
										}
									],
									id: 1629,
									name: "VariableDeclaration",
									src: "830:14:1"
								},
								{
									attributes: {
										constant: false,
										mutability: "mutable",
										name: "_operator",
										scope: 1658,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 1630,
											name: "ElementaryTypeName",
											src: "852:7:1"
										}
									],
									id: 1631,
									name: "VariableDeclaration",
									src: "852:17:1"
								}
							],
							id: 1632,
							name: "ParameterList",
							src: "822:51:1"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										mutability: "mutable",
										name: "isOperator",
										scope: 1658,
										stateVariable: false,
										storageLocation: "default",
										type: "bool",
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "bool",
												type: "bool"
											},
											id: 1634,
											name: "ElementaryTypeName",
											src: "904:4:1"
										}
									],
									id: 1635,
									name: "VariableDeclaration",
									src: "904:15:1"
								}
							],
							id: 1636,
							name: "ParameterList",
							src: "903:17:1"
						},
						{
							children: [
								{
									attributes: {
									},
									children: [
										{
											attributes: {
												commonType: {
													typeIdentifier: "t_bool",
													typeString: "bool"
												},
												isConstant: false,
												isLValue: false,
												isPure: false,
												lValueRequested: false,
												operator: "&&",
												type: "bool"
											},
											children: [
												{
													attributes: {
														commonType: {
															typeIdentifier: "t_address",
															typeString: "address"
														},
														isConstant: false,
														isLValue: false,
														isPure: false,
														lValueRequested: false,
														operator: "==",
														type: "bool"
													},
													children: [
														{
															attributes: {
																overloadedDeclarations: [
																	null
																],
																referencedDeclaration: 1631,
																type: "address",
																value: "_operator"
															},
															id: 1637,
															name: "Identifier",
															src: "933:9:1"
														},
														{
															attributes: {
																isConstant: false,
																isLValue: false,
																isPure: true,
																isStructConstructorCall: false,
																lValueRequested: false,
																names: [
																	null
																],
																tryCall: false,
																type: "address",
																type_conversion: true
															},
															children: [
																{
																	attributes: {
																		argumentTypes: [
																			{
																				typeIdentifier: "t_address_payable",
																				typeString: "address payable"
																			}
																		],
																		isConstant: false,
																		isLValue: false,
																		isPure: true,
																		lValueRequested: false,
																		type: "type(address)"
																	},
																	children: [
																		{
																			attributes: {
																				name: "address"
																			},
																			id: 1638,
																			name: "ElementaryTypeName",
																			src: "946:7:1"
																		}
																	],
																	id: 1639,
																	name: "ElementaryTypeNameExpression",
																	src: "946:7:1"
																},
																{
																	attributes: {
																		hexvalue: "307832303746613844663361313744393643613745413466323839336663644362373861333034313031",
																		isConstant: false,
																		isLValue: false,
																		isPure: true,
																		lValueRequested: false,
																		token: "number",
																		type: "address payable",
																		value: "0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101"
																	},
																	id: 1640,
																	name: "Literal",
																	src: "954:42:1"
																}
															],
															id: 1641,
															name: "FunctionCall",
															src: "946:51:1"
														}
													],
													id: 1642,
													name: "BinaryOperation",
													src: "933:64:1"
												},
												{
													attributes: {
														commonType: {
															typeIdentifier: "t_bool",
															typeString: "bool"
														},
														isConstant: false,
														isLValue: false,
														isPure: false,
														lValueRequested: false,
														operator: "==",
														type: "bool"
													},
													children: [
														{
															attributes: {
																overloadedDeclarations: [
																	null
																],
																referencedDeclaration: 1573,
																type: "bool",
																value: "openseaProxyEnabled"
															},
															id: 1643,
															name: "Identifier",
															src: "1001:19:1"
														},
														{
															attributes: {
																hexvalue: "74727565",
																isConstant: false,
																isLValue: false,
																isPure: true,
																lValueRequested: false,
																token: "bool",
																type: "bool",
																value: "true"
															},
															id: 1644,
															name: "Literal",
															src: "1024:4:1"
														}
													],
													id: 1645,
													name: "BinaryOperation",
													src: "1001:27:1"
												}
											],
											id: 1646,
											name: "BinaryOperation",
											src: "933:95:1"
										},
										{
											children: [
												{
													attributes: {
														functionReturnParameters: 1636
													},
													children: [
														{
															attributes: {
																hexvalue: "74727565",
																isConstant: false,
																isLValue: false,
																isPure: true,
																lValueRequested: false,
																token: "bool",
																type: "bool",
																value: "true"
															},
															id: 1647,
															name: "Literal",
															src: "1049:4:1"
														}
													],
													id: 1648,
													name: "Return",
													src: "1042:11:1"
												}
											],
											id: 1649,
											name: "Block",
											src: "1030:32:1"
										}
									],
									id: 1650,
									name: "IfStatement",
									src: "929:133:1"
								},
								{
									attributes: {
										functionReturnParameters: 1636
									},
									children: [
										{
											attributes: {
												isConstant: false,
												isLValue: false,
												isPure: false,
												isStructConstructorCall: false,
												lValueRequested: false,
												names: [
													null
												],
												tryCall: false,
												type: "bool",
												type_conversion: false
											},
											children: [
												{
													attributes: {
														argumentTypes: [
															{
																typeIdentifier: "t_address",
																typeString: "address"
															},
															{
																typeIdentifier: "t_address",
																typeString: "address"
															}
														],
														isConstant: false,
														isLValue: false,
														isPure: false,
														lValueRequested: false,
														member_name: "isApprovedForAll",
														referencedDeclaration: 767,
														type: "function (address,address) view returns (bool)"
													},
													children: [
														{
															attributes: {
																overloadedDeclarations: [
																	null
																],
																referencedDeclaration: 1556,
																type: "type(contract ERC1155)",
																value: "ERC1155"
															},
															id: 1651,
															name: "Identifier",
															src: "1077:7:1"
														}
													],
													id: 1652,
													name: "MemberAccess",
													src: "1077:24:1"
												},
												{
													attributes: {
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1629,
														type: "address",
														value: "_owner"
													},
													id: 1653,
													name: "Identifier",
													src: "1102:6:1"
												},
												{
													attributes: {
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1631,
														type: "address",
														value: "_operator"
													},
													id: 1654,
													name: "Identifier",
													src: "1110:9:1"
												}
											],
											id: 1655,
											name: "FunctionCall",
											src: "1077:43:1"
										}
									],
									id: 1656,
									name: "Return",
									src: "1070:50:1"
								}
							],
							id: 1657,
							name: "Block",
							src: "921:204:1"
						}
					],
					id: 1658,
					name: "FunctionDefinition",
					src: "797:328:1"
				},
				{
					attributes: {
						baseFunctions: [
							193
						],
						implemented: true,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "_msgSender",
						scope: 1718,
						stateMutability: "view",
						virtual: false,
						visibility: "internal"
					},
					children: [
						{
							attributes: {
								text: " This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea."
							},
							id: 1659,
							name: "StructuredDocumentation",
							src: "1129:123:1"
						},
						{
							attributes: {
								overrides: [
									null
								]
							},
							id: 1661,
							name: "OverrideSpecifier",
							src: "1298:8:1"
						},
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 1660,
							name: "ParameterList",
							src: "1274:2:1"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										mutability: "mutable",
										name: "sender",
										scope: 1670,
										stateVariable: false,
										storageLocation: "default",
										type: "address payable",
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "payable",
												type: "address payable"
											},
											id: 1662,
											name: "ElementaryTypeName",
											src: "1333:15:1"
										}
									],
									id: 1663,
									name: "VariableDeclaration",
									src: "1333:22:1"
								}
							],
							id: 1664,
							name: "ParameterList",
							src: "1332:24:1"
						},
						{
							children: [
								{
									attributes: {
										functionReturnParameters: 1664
									},
									children: [
										{
											attributes: {
												"arguments": [
													null
												],
												isConstant: false,
												isLValue: false,
												isPure: false,
												isStructConstructorCall: false,
												lValueRequested: false,
												names: [
													null
												],
												tryCall: false,
												type: "address payable",
												type_conversion: false
											},
											children: [
												{
													attributes: {
														argumentTypes: [
															null
														],
														isConstant: false,
														isLValue: false,
														isPure: false,
														lValueRequested: false,
														member_name: "msgSender",
														referencedDeclaration: 1756,
														type: "function () view returns (address payable)"
													},
													children: [
														{
															attributes: {
																overloadedDeclarations: [
																	null
																],
																referencedDeclaration: 1757,
																type: "type(contract ContextMixin)",
																value: "ContextMixin"
															},
															id: 1665,
															name: "Identifier",
															src: "1374:12:1"
														}
													],
													id: 1666,
													name: "MemberAccess",
													src: "1374:22:1"
												}
											],
											id: 1667,
											name: "FunctionCall",
											src: "1374:24:1"
										}
									],
									id: 1668,
									name: "Return",
									src: "1367:31:1"
								}
							],
							id: 1669,
							name: "Block",
							src: "1359:44:1"
						}
					],
					id: 1670,
					name: "FunctionDefinition",
					src: "1255:148:1"
				},
				{
					attributes: {
						functionSelector: "4cc63d6c",
						implemented: true,
						isConstructor: false,
						kind: "function",
						name: "setOpenseaProxyEnabled",
						scope: 1718,
						stateMutability: "nonpayable",
						virtual: false,
						visibility: "public"
					},
					children: [
						{
							attributes: {
								text: " Admin APIs"
							},
							id: 1671,
							name: "StructuredDocumentation",
							src: "1407:25:1"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										mutability: "mutable",
										name: "enabled",
										scope: 1683,
										stateVariable: false,
										storageLocation: "default",
										type: "bool",
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "bool",
												type: "bool"
											},
											id: 1672,
											name: "ElementaryTypeName",
											src: "1468:4:1"
										}
									],
									id: 1673,
									name: "VariableDeclaration",
									src: "1468:12:1"
								}
							],
							id: 1674,
							name: "ParameterList",
							src: "1467:14:1"
						},
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 1677,
							name: "ParameterList",
							src: "1499:0:1"
						},
						{
							attributes: {
							},
							children: [
								{
									attributes: {
										overloadedDeclarations: [
											null
										],
										referencedDeclaration: 1585,
										type: "modifier ()",
										value: "onlyAdmin"
									},
									id: 1675,
									name: "Identifier",
									src: "1489:9:1"
								}
							],
							id: 1676,
							name: "ModifierInvocation",
							src: "1489:9:1"
						},
						{
							children: [
								{
									children: [
										{
											attributes: {
												isConstant: false,
												isLValue: false,
												isPure: false,
												lValueRequested: false,
												operator: "=",
												type: "bool"
											},
											children: [
												{
													attributes: {
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1573,
														type: "bool",
														value: "openseaProxyEnabled"
													},
													id: 1678,
													name: "Identifier",
													src: "1505:19:1"
												},
												{
													attributes: {
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1673,
														type: "bool",
														value: "enabled"
													},
													id: 1679,
													name: "Identifier",
													src: "1527:7:1"
												}
											],
											id: 1680,
											name: "Assignment",
											src: "1505:29:1"
										}
									],
									id: 1681,
									name: "ExpressionStatement",
									src: "1505:29:1"
								}
							],
							id: 1682,
							name: "Block",
							src: "1499:40:1"
						}
					],
					id: 1683,
					name: "FunctionDefinition",
					src: "1436:103:1"
				},
				{
					attributes: {
						functionSelector: "8f283970",
						implemented: true,
						isConstructor: false,
						kind: "function",
						name: "changeAdmin",
						scope: 1718,
						stateMutability: "nonpayable",
						virtual: false,
						visibility: "public"
					},
					children: [
						{
							attributes: {
								text: " @dev admin function to set new root admin.\n @param newAdmin address the new admin to assign, which manages delegates"
							},
							id: 1684,
							name: "StructuredDocumentation",
							src: "1543:140:1"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										mutability: "mutable",
										name: "newAdmin",
										scope: 1696,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 1685,
											name: "ElementaryTypeName",
											src: "1707:7:1"
										}
									],
									id: 1686,
									name: "VariableDeclaration",
									src: "1707:16:1"
								}
							],
							id: 1687,
							name: "ParameterList",
							src: "1706:18:1"
						},
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 1690,
							name: "ParameterList",
							src: "1742:0:1"
						},
						{
							attributes: {
							},
							children: [
								{
									attributes: {
										overloadedDeclarations: [
											null
										],
										referencedDeclaration: 1585,
										type: "modifier ()",
										value: "onlyAdmin"
									},
									id: 1688,
									name: "Identifier",
									src: "1732:9:1"
								}
							],
							id: 1689,
							name: "ModifierInvocation",
							src: "1732:9:1"
						},
						{
							children: [
								{
									children: [
										{
											attributes: {
												isConstant: false,
												isLValue: false,
												isPure: false,
												lValueRequested: false,
												operator: "=",
												type: "address"
											},
											children: [
												{
													attributes: {
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1571,
														type: "address",
														value: "admin"
													},
													id: 1691,
													name: "Identifier",
													src: "1748:5:1"
												},
												{
													attributes: {
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1686,
														type: "address",
														value: "newAdmin"
													},
													id: 1692,
													name: "Identifier",
													src: "1756:8:1"
												}
											],
											id: 1693,
											name: "Assignment",
											src: "1748:16:1"
										}
									],
									id: 1694,
									name: "ExpressionStatement",
									src: "1748:16:1"
								}
							],
							id: 1695,
							name: "Block",
							src: "1742:27:1"
						}
					],
					id: 1696,
					name: "FunctionDefinition",
					src: "1686:83:1"
				},
				{
					attributes: {
						functionSelector: "02fe5305",
						implemented: true,
						isConstructor: false,
						kind: "function",
						name: "setURI",
						scope: 1718,
						stateMutability: "nonpayable",
						virtual: false,
						visibility: "public"
					},
					children: [
						{
							children: [
								{
									attributes: {
										constant: false,
										mutability: "mutable",
										name: "uri",
										scope: 1708,
										stateVariable: false,
										storageLocation: "memory",
										type: "string",
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "string",
												type: "string"
											},
											id: 1697,
											name: "ElementaryTypeName",
											src: "1789:6:1"
										}
									],
									id: 1698,
									name: "VariableDeclaration",
									src: "1789:17:1"
								}
							],
							id: 1699,
							name: "ParameterList",
							src: "1788:19:1"
						},
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 1702,
							name: "ParameterList",
							src: "1825:0:1"
						},
						{
							attributes: {
							},
							children: [
								{
									attributes: {
										overloadedDeclarations: [
											null
										],
										referencedDeclaration: 1585,
										type: "modifier ()",
										value: "onlyAdmin"
									},
									id: 1700,
									name: "Identifier",
									src: "1815:9:1"
								}
							],
							id: 1701,
							name: "ModifierInvocation",
							src: "1815:9:1"
						},
						{
							children: [
								{
									children: [
										{
											attributes: {
												isConstant: false,
												isLValue: false,
												isPure: false,
												isStructConstructorCall: false,
												lValueRequested: false,
												names: [
													null
												],
												tryCall: false,
												type: "tuple()",
												type_conversion: false
											},
											children: [
												{
													attributes: {
														argumentTypes: [
															{
																typeIdentifier: "t_string_memory_ptr",
																typeString: "string memory"
															}
														],
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1022,
														type: "function (string memory)",
														value: "_setURI"
													},
													id: 1703,
													name: "Identifier",
													src: "1831:7:1"
												},
												{
													attributes: {
														overloadedDeclarations: [
															null
														],
														referencedDeclaration: 1698,
														type: "string memory",
														value: "uri"
													},
													id: 1704,
													name: "Identifier",
													src: "1839:3:1"
												}
											],
											id: 1705,
											name: "FunctionCall",
											src: "1831:12:1"
										}
									],
									id: 1706,
									name: "ExpressionStatement",
									src: "1831:12:1"
								}
							],
							id: 1707,
							name: "Block",
							src: "1825:23:1"
						}
					],
					id: 1708,
					name: "FunctionDefinition",
					src: "1773:75:1"
				},
				{
					attributes: {
						functionSelector: "6e9960c3",
						implemented: true,
						isConstructor: false,
						kind: "function",
						modifiers: [
							null
						],
						name: "getAdmin",
						scope: 1718,
						stateMutability: "view",
						virtual: false,
						visibility: "public"
					},
					children: [
						{
							attributes: {
								text: " Read APIs"
							},
							id: 1709,
							name: "StructuredDocumentation",
							src: "1852:24:1"
						},
						{
							attributes: {
								parameters: [
									null
								]
							},
							children: [
							],
							id: 1710,
							name: "ParameterList",
							src: "1896:2:1"
						},
						{
							children: [
								{
									attributes: {
										constant: false,
										mutability: "mutable",
										name: "",
										scope: 1717,
										stateVariable: false,
										storageLocation: "default",
										type: "address",
										visibility: "internal"
									},
									children: [
										{
											attributes: {
												name: "address",
												stateMutability: "nonpayable",
												type: "address"
											},
											id: 1711,
											name: "ElementaryTypeName",
											src: "1920:7:1"
										}
									],
									id: 1712,
									name: "VariableDeclaration",
									src: "1920:7:1"
								}
							],
							id: 1713,
							name: "ParameterList",
							src: "1919:9:1"
						},
						{
							children: [
								{
									attributes: {
										functionReturnParameters: 1713
									},
									children: [
										{
											attributes: {
												overloadedDeclarations: [
													null
												],
												referencedDeclaration: 1571,
												type: "address",
												value: "admin"
											},
											id: 1714,
											name: "Identifier",
											src: "1942:5:1"
										}
									],
									id: 1715,
									name: "Return",
									src: "1935:12:1"
								}
							],
							id: 1716,
							name: "Block",
							src: "1929:23:1"
						}
					],
					id: 1717,
					name: "FunctionDefinition",
					src: "1879:73:1"
				}
			],
			id: 1718,
			name: "ContractDefinition",
			src: "132:1822:1"
		}
	],
	id: 1719,
	name: "SourceUnit",
	src: "0:1954:1"
};
var compiler = {
	name: "solc",
	version: "0.7.6+commit.7338295f.Emscripten.clang"
};
var networks = {
	"137": {
		events: {
			"0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31": {
				anonymous: false,
				inputs: [
					{
						indexed: true,
						internalType: "address",
						name: "account",
						type: "address"
					},
					{
						indexed: true,
						internalType: "address",
						name: "operator",
						type: "address"
					},
					{
						indexed: false,
						internalType: "bool",
						name: "approved",
						type: "bool"
					}
				],
				name: "ApprovalForAll",
				type: "event"
			},
			"0x5845892132946850460bff5a0083f71031bc5bf9aadcd40f1de79423eac9b10b": {
				anonymous: false,
				inputs: [
					{
						indexed: false,
						internalType: "address",
						name: "userAddress",
						type: "address"
					},
					{
						indexed: false,
						internalType: "address payable",
						name: "relayerAddress",
						type: "address"
					},
					{
						indexed: false,
						internalType: "bytes",
						name: "functionSignature",
						type: "bytes"
					}
				],
				name: "MetaTransactionExecuted",
				type: "event"
			},
			"0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb": {
				anonymous: false,
				inputs: [
					{
						indexed: true,
						internalType: "address",
						name: "operator",
						type: "address"
					},
					{
						indexed: true,
						internalType: "address",
						name: "from",
						type: "address"
					},
					{
						indexed: true,
						internalType: "address",
						name: "to",
						type: "address"
					},
					{
						indexed: false,
						internalType: "uint256[]",
						name: "ids",
						type: "uint256[]"
					},
					{
						indexed: false,
						internalType: "uint256[]",
						name: "values",
						type: "uint256[]"
					}
				],
				name: "TransferBatch",
				type: "event"
			},
			"0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62": {
				anonymous: false,
				inputs: [
					{
						indexed: true,
						internalType: "address",
						name: "operator",
						type: "address"
					},
					{
						indexed: true,
						internalType: "address",
						name: "from",
						type: "address"
					},
					{
						indexed: true,
						internalType: "address",
						name: "to",
						type: "address"
					},
					{
						indexed: false,
						internalType: "uint256",
						name: "id",
						type: "uint256"
					},
					{
						indexed: false,
						internalType: "uint256",
						name: "value",
						type: "uint256"
					}
				],
				name: "TransferSingle",
				type: "event"
			},
			"0x6bb7ff708619ba0610cba295a58592e0451dee2622938c8755667688daf3529b": {
				anonymous: false,
				inputs: [
					{
						indexed: false,
						internalType: "string",
						name: "value",
						type: "string"
					},
					{
						indexed: true,
						internalType: "uint256",
						name: "id",
						type: "uint256"
					}
				],
				name: "URI",
				type: "event"
			}
		},
		links: {
		},
		address: "0xb9A323711528D0c5a70df790929f4739f1cDd7fD",
		transactionHash: "0x298c338c8761350d67a68a0bfaf6d346931c65905a5ad852cdda8f6a529a08dc"
	}
};
var schemaVersion = "3.3.4";
var updatedAt = "2021-04-23T00:12:09.625Z";
var networkType = "ethereum";
var devdoc = {
	kind: "dev",
	methods: {
		"balanceOf(address,uint256)": {
			details: "See {IERC1155-balanceOf}. Requirements: - `account` cannot be the zero address."
		},
		"balanceOfBatch(address[],uint256[])": {
			details: "See {IERC1155-balanceOfBatch}. Requirements: - `accounts` and `ids` must have the same length."
		},
		"changeAdmin(address)": {
			details: "admin function to set new root admin.",
			params: {
				newAdmin: "address the new admin to assign, which manages delegates"
			}
		},
		"safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)": {
			details: "See {IERC1155-safeBatchTransferFrom}."
		},
		"safeTransferFrom(address,address,uint256,uint256,bytes)": {
			details: "See {IERC1155-safeTransferFrom}."
		},
		"setApprovalForAll(address,bool)": {
			details: "See {IERC1155-setApprovalForAll}."
		},
		"supportsInterface(bytes4)": {
			details: "See {IERC165-supportsInterface}. Time complexity O(1), guaranteed to always use less than 30 000 gas."
		},
		"uri(uint256)": {
			details: "See {IERC1155MetadataURI-uri}. This implementation returns the same URI for *all* token types. It relies on the token type ID substitution mechanism https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP]. Clients calling this function must replace the `\\{id\\}` substring with the actual token type ID."
		}
	},
	version: 1
};
var userdoc = {
	kind: "user",
	methods: {
		"getAdmin()": {
			notice: "Read APIs"
		},
		"isApprovedForAll(address,address)": {
			notice: "Override isApprovedForAll to whitelist opensea proxy account"
		},
		"setOpenseaProxyEnabled(bool)": {
			notice: "Admin APIs"
		}
	},
	version: 1
};
var LIT = {
	contractName: contractName,
	abi: abi,
	metadata: metadata,
	bytecode: bytecode,
	deployedBytecode: deployedBytecode,
	immutableReferences: immutableReferences,
	generatedSources: generatedSources,
	deployedGeneratedSources: deployedGeneratedSources,
	sourceMap: sourceMap,
	deployedSourceMap: deployedSourceMap,
	source: source,
	sourcePath: sourcePath,
	ast: ast,
	legacyAST: legacyAST,
	compiler: compiler,
	networks: networks,
	schemaVersion: schemaVersion,
	updatedAt: updatedAt,
	networkType: networkType,
	devdoc: devdoc,
	userdoc: userdoc
};

/**
 * @typedef {Object} LITChain
 * @property {string} contractAddress - The address of the token contract
 * @property {string} chainId - The chain ID of the chain that this token contract is deployed on.  Used for EVM chains.
 * @property {string} name - The human readable name of the chain
 */

/**
 * Pre-deployed token contracts that you may use for minting LITs.  These are ERC1155 contracts that let you mint any quantity of a given token.  Use the chain name as a key in this object.  Currently "polygon" and "ethereum" are supported.
 * @constant
 * @type {LITChain}
 * @default
*/
var LIT_CHAINS = {
  polygon: {
    contractAddress: '0xb9A323711528D0c5a70df790929f4739f1cDd7fD',
    chainId: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
    rpcUrls: ['https://floral-rough-flower.matic.quiknode.pro/a17b25f97cc396bb2b6aaf85a005f579bf93dc73/'],
    blockExplorerUrls: ['https://explorer.matic.network'],
    type: 'ERC1155',
    websocketUrl: 'wss://floral-rough-flower.matic.quiknode.pro/a17b25f97cc396bb2b6aaf85a005f579bf93dc73/'
  },
  fantom: {
    contractAddress: '0x3110c39b428221012934A7F617913b095BC1078C',
    chainId: 250,
    name: 'Fantom',
    symbol: 'FTM',
    decimals: 18,
    rpcUrls: ['https://rpcapi.fantom.network'],
    blockExplorerUrls: ['https://ftmscan.com'],
    type: 'ERC1155',
    websocketUrl: 'wss://wsapi.fantom.network'
  },
  xdai: {
    contractAddress: '0x3110c39b428221012934A7F617913b095BC1078C',
    chainId: 100,
    name: 'xDai',
    symbol: 'xDai',
    decimals: 18,
    rpcUrls: ['https://rpc.xdaichain.com'],
    blockExplorerUrls: [' https://blockscout.com/xdai/mainnet'],
    type: 'ERC1155',
    websocketUrl: 'wss://wsapi.fantom.network'
  },
  ethereum: {
    contractAddress: '0x55485885e82E25446DEC314Ccb810Bda06B9e01B',
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    type: 'ERC1155',
    websocketUrl: 'wss://mainnet.infura.io/ws/v3/ddf1ca3700f34497bca2bf03607fde38'
  },
  kovan: {
    contractAddress: '0xA9b2180C2A479Ba9b263878C4d81AE4e0E717846',
    chainId: 42,
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://kovan.infura.io/v3/ddf1ca3700f34497bca2bf03607fde38'],
    blockExplorerUrls: ['https://kovan.etherscan.io'],
    type: 'ERC20'
  }
};

// export async function decryptWithWeb3PrivateKey (encryptedData) {
//   const { web3, account } = await connectWeb3()
//   try {
//     const decryptedMessage = ethereum
//       .request({
//         method: 'eth_decrypt',
//         params: [encryptedData, account]
//       })
//     return decryptedMessage
//   } catch (error) {
//     console.log(error)
//     return false
//   }
// }
//
// async function deriveKeysViaSignature () {
//   const { signature, address } = await signMessage({ body: KEY_DERIVATION_SIGNATURE_BODY })
//   console.log('Signed message: ' + signature)
//
//   // derive keypair
//   const data = Buffer.from(signature.substring(2), 'hex')
//   const hash = await crypto.subtle.digest('SHA-256', data)
//   const uint8Hash = new Uint8Array(hash)
//   const { publicKey, secretKey } = nacl.box.keyPair.fromSecretKey(uint8Hash)
//   return {
//     publicKey: naclUtil.encodeBase64(publicKey),
//     secretKey: naclUtil.encodeBase64(secretKey)
//   }
// }
//
// // this only works on metamask :(
// async function deriveKeysViaPrivateKey () {
//   try {
//     const { web3, account } = await connectWeb3()
//     /* global ethereum */
//     /* eslint no-undef: "error" */
//     const publicKey = await ethereum
//       .request({
//         method: 'eth_getEncryptionPublicKey',
//         params: [account] // you must have access to the specified account
//       })
//     return { publicKey }
//   } catch (error) {
//     console.log(error)
//     if (error.code === 4001) {
//       // EIP-1193 userRejectedRequest error
//       console.log("We can't encrypt anything without the key.")
//       error('You must accept the metamask request to derive your public encryption key')
//     } else {
//       console.error(error)
//     }
//     return { error }
//   }
// }
//
// export async function deriveEncryptionKeys () {
//   let keypair = {}
//   // key derivation via metamask is more desirable because then even this SDK can't see the secret key :-D
//   const { error, publicKey } = await deriveKeysViaPrivateKey()
//   if (!error) {
//     keypair = {
//       publicKey,
//       derivedVia: 'eth_getEncryptionPublicKey'
//     }
//   } else {
//     const { publicKey, secretKey } = await deriveKeysViaSignature()
//     keypair = {
//       publicKey,
//       secretKey,
//       derivedVia: 'web3.eth.personal.sign',
//       signedMessage: KEY_DERIVATION_SIGNATURE_BODY
//     }
//   }
//
//   const { web3, account } = await connectWeb3()
//   keypair.address = account
//
//   console.log('public key: ' + keypair.publicKey)
//   const asString = JSON.stringify(keypair)
//   localStorage.setItem('lit-keypair', asString)
//
//   // is it already saved on the server?
//   const { pubkey, errorCode } = await getPublicKey({
//     address: account
//   })
//   if (errorCode === 'not_found' || pubkey !== keypair.publicKey) {
//     // add it
//     const msg = `I am saving my public key so that others can send me LITs.  It is ${pubkey}`
//     const res = await signMessage({ body: msg })
//     await savePublicKey({
//       sig: res.signature,
//       msg,
//       pubkey: keypair.publicKey
//     })
//   }
// }

/**
 * This function mints a LIT using our pre-deployed token contracts.  You may our contracts, or you may supply your own.  Our contracts are ERC1155 tokens on Polygon and Ethereum.  Using these contracts is the easiest way to get started.
 * @param {Object} params
 * @param {string} params.chain The chain to mint on.  "ethereum" and "polygon" are currently supported.
 * @param {number} params.quantity The number of tokens to mint.  Note that these will be fungible, so they will not have serial numbers.
 * @returns {Object} The txHash, tokenId, tokenAddress, mintingAddress, and authSig.
 */
function _catch$1(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}
/**
 * Finds the tokens that the current user owns from the predeployed LIT contracts
 * @param {Object} params
 * @param {string} params.chain The chain that was minted on. "ethereum" and "polygon" are currently supported.
 * @param {number} params.accountAddress The account address to check
 * @returns {array} The token ids owned by the accountAddress
 */


/**
 * Send a token to another account
 * @param {Object} params
 * @param {string} params.tokenMetadata The token metadata of the token to be transferred.  Should include tokenId, tokenAddress, and chain
 * @param {number} params.to The account address to send the token to
 * @returns {Object} Success or error
 */
var sendLIT = function sendLIT(_ref8) {
  var tokenMetadata = _ref8.tokenMetadata,
      to = _ref8.to;

  try {
    console.log('sendLIT for ', tokenMetadata);
    return Promise.resolve(_catch$1(function () {
      return Promise.resolve(connectWeb3()).then(function (_ref9) {
        var web3 = _ref9.web3,
            account = _ref9.account;
        var tokenAddress = tokenMetadata.tokenAddress,
            tokenId = tokenMetadata.tokenId,
            chain = tokenMetadata.chain;
        var contract = new contracts.Contract(tokenAddress, LIT.abi, new providers.Web3Provider(web3).getSigner());
        console.log('transferring');
        return Promise.resolve(contract.safeTransferFrom(account, to, tokenId, 1, [])).then(function (maxTokenId) {
          console.log('sent to chain');
          return {
            success: true
          };
        });
      });
    }, function (error) {
      console.log(error);

      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        console.log('User rejected request');
        return {
          errorCode: 'user_rejected_request'
        };
      } else {
        console.error(error);
      }

      return {
        errorCode: 'unknown_error'
      };
    }));
  } catch (e) {
    return Promise.reject(e);
  }
};
var findLITs = function findLITs() {
  try {
    console.log('findLITs');
    return Promise.resolve(_catch$1(function () {
      return Promise.resolve(connectWeb3()).then(function (_ref7) {
        var web3 = _ref7.web3,
            account = _ref7.account;
        return Promise.resolve(web3.request({
          method: 'eth_chainId',
          params: []
        })).then(function (chainHexId) {
          var chain = chainHexIdToChainName(chainHexId);
          var tokenAddress = LIT_CHAINS[chain].contractAddress;
          var contract = new contracts.Contract(tokenAddress, LIT.abi, new providers.Web3Provider(web3).getSigner());
          console.log('getting maxTokenid');
          return Promise.resolve(contract.tokenIds()).then(function (maxTokenId) {
            var accounts = [];
            var tokenIds = [];

            for (var i = 0; i <= maxTokenId; i++) {
              accounts.push(account);
              tokenIds.push(i);
            }

            console.log('getting balanceOfBatch');
            return Promise.resolve(contract.balanceOfBatch(accounts, tokenIds)).then(function (balances) {
              // console.log('balances', balances)
              var tokenIdsWithNonzeroBalances = balances.map(function (b, i) {
                return b.toNumber() === 0 ? null : i;
              }).filter(function (b) {
                return b !== null;
              });
              return {
                tokenIds: tokenIdsWithNonzeroBalances,
                chain: chain
              };
            });
          });
        });
      });
    }, function (error) {
      console.log(error);

      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        console.log('User rejected request');
        return {
          errorCode: 'user_rejected_request'
        };
      } else {
        console.error(error);
      }

      return {
        errorCode: 'unknown_error'
      };
    }));
  } catch (e) {
    return Promise.reject(e);
  }
};
var mintLIT = function mintLIT(_ref5) {
  var chain = _ref5.chain,
      quantity = _ref5.quantity;

  try {
    console.log("minting " + quantity + " tokens on " + chain);
    return Promise.resolve(_catch$1(function () {
      return Promise.resolve(checkAndSignAuthMessage({
        chain: chain
      })).then(function (authSig) {
        return authSig.errorCode ? authSig : Promise.resolve(connectWeb3()).then(function (_ref6) {
          var web3 = _ref6.web3,
              account = _ref6.account;
          var tokenAddress = LIT_CHAINS[chain].contractAddress;
          var contract = new contracts.Contract(tokenAddress, LIT.abi, new providers.Web3Provider(web3).getSigner());
          console.log('sending to chain...');
          return Promise.resolve(contract.mint(quantity)).then(function (tx) {
            console.log('sent to chain.  waiting to be mined...');
            return Promise.resolve(tx.wait()).then(function (txReceipt) {
              console.log('txReceipt: ', txReceipt);
              var tokenId = txReceipt.events[0].args[3].toNumber();
              return {
                txHash: txReceipt.transactionHash,
                tokenId: tokenId,
                tokenAddress: tokenAddress,
                mintingAddress: account,
                authSig: authSig
              };
            });
          });
        });
      });
    }, function (error) {
      console.log(error);

      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        console.log('User rejected request');
        return {
          errorCode: 'user_rejected_request'
        };
      } else {
        console.error(error);
      }

      return {
        errorCode: 'unknown_error'
      };
    }));
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * @typedef {Object} AuthSig
 * @property {string} sig - The actual hex-encoded signature
 * @property {string} derivedVia - The method used to derive the signature
 * @property {string} signedMessage - The message that was signed
 * @property {string} address - The crypto wallet address that signed the message
 */
var signMessage = function signMessage(_ref3) {
  var body = _ref3.body;

  try {
    return Promise.resolve(connectWeb3()).then(function (_ref4) {
      var web3 = _ref4.web3,
          account = _ref4.account;
      console.log('signing with ', account);
      return Promise.resolve(web3.request({
        method: 'personal_sign',
        params: [account, body]
      })).then(function (signature) {
        var address = wallet.verifyMessage(body, signature).toLowerCase();
        console.log('Signature: ', signature);
        console.log('recovered address: ', address);

        if (address !== account) {
          var msg = "ruh roh, the user signed with a different address (" + address + ") then they're using with web3 (" + account + ").  this will lead to confusion.";
          console.error(msg);
          alert('something seems to be wrong with your wallets message signing.  maybe restart your browser or your wallet.  your recovered sig address does not match your web3 account address');
          throw new Error(msg);
        }

        return {
          signature: signature,
          address: address
        };
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var signAndSaveAuthMessage = function signAndSaveAuthMessage() {
  try {
    var now = new Date().toISOString();
    var body = AUTH_SIGNATURE_BODY.replace('{{timestamp}}', now);
    return Promise.resolve(signMessage({
      body: body
    })).then(function (signedResult) {
      localStorage.setItem('lit-auth-signature', JSON.stringify({
        sig: signedResult.signature,
        derivedVia: 'web3.eth.personal.sign',
        signedMessage: body,
        address: signedResult.address
      })); // store a keypair in localstorage for communication with sgx

      var commsKeyPair = nacl__default['default'].box.keyPair();
      localStorage.setItem('lit-comms-keypair', JSON.stringify({
        publicKey: naclUtil__default['default'].encodeBase64(commsKeyPair.publicKey),
        secretKey: naclUtil__default['default'].encodeBase64(commsKeyPair.secretKey)
      }));
      console.log('generated and saved lit-comms-keypair');
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
// taken from the excellent repo https://github.com/zmitton/eth-proof
// export async function getMerkleProof({ tokenAddress, balanceStorageSlot, tokenId }) {
//   console.log(`getMerkleProof for { tokenAddress, balanceStorageSlot, tokenId } ${tokenAddress}, ${balanceStorageSlot}, ${tokenId}`)
//   const { web3, account } = await connectWeb3()
//   console.log(`getting mappingAt(${balanceStorageSlot}, ${tokenId}, ${account})`)
//   const storageAddress = mappingAt(balanceStorageSlot, parseInt(tokenId), account)
//   console.log('storageAddress: ', storageAddress)
//   // you may need to try the below twicce because sometimes the proof isn't available for the latest block on polygon because the node just isn't fast enough
//   let tries = 0
//   let rpcProof = null
//   let rpcBlock = null
//   while (!rpcProof && tries < 6) {
//     try {
//       if (!rpcBlock) {
//         // only set the rpc block once
//         rpcBlock = await web3.request({ method: 'eth_getBlockByNumber', params: ['latest', false] })
//         console.log('rpcBlock: ', rpcBlock)
//       }
//       rpcProof = await web3.request({ method: 'eth_getProof', params: [tokenAddress, [storageAddress], rpcBlock.number] })
//       console.log('rpcProof: ', rpcProof)
//     } catch (e) {
//       console.log(e)
//       console.log(`error getting rpc proof, have made ${tries} attempts`)
//       tries++
//     }
//   }
//   return {
//     header: rpcBlock,
//     accountProof: rpcProof.accountProof,
//     storageProof: rpcProof.storageProof[0].proof,
//     blockHash: rpcBlock.hash
//   }
// }
// export async function checkAndDeriveKeypair () {
//   let keypair = localStorage.getItem('lit-keypair')
//   if (!keypair) {
//     await deriveEncryptionKeys()
//     keypair = localStorage.getItem('lit-keypair')
//   }
//   keypair = JSON.parse(keypair)
//   const { web3, account } = await connectWeb3()
//   // make sure we are on the right account
//   if (account !== keypair.address) {
//     await deriveEncryptionKeys()
//     keypair = localStorage.getItem('lit-keypair')
//     keypair = JSON.parse(keypair)
//   }
//   return keypair
// }

/**
 * Check for an existing cryptographic authentication signature and create one of it does not exist.  This is used to prove ownership of a given crypto wallet address to the LIT nodes.  The result is stored in LocalStorage so the user doesn't have to sign every time they perform an operation.
 * @param {Object} params
 * @param {string} params.chain The chain you want to use.  "polygon" and "ethereum" are currently supported.
 * @returns {AuthSig} The AuthSig created or retrieved
 */
var checkAndSignAuthMessage = function checkAndSignAuthMessage(_ref) {
  var chain = _ref.chain;

  try {
    return Promise.resolve(connectWeb3()).then(function (_ref2) {
      var web3 = _ref2.web3,
          account = _ref2.account;
      return Promise.resolve(web3.request({
        method: 'eth_chainId',
        params: []
      })).then(function (chainId) {
        var _exit;

        function _temp5(_result2) {
          if (_exit) return _result2;

          function _temp3() {
            authSig = JSON.parse(authSig); // make sure we are on the right account

            var _temp = function () {
              if (account !== authSig.address) {
                return Promise.resolve(signAndSaveAuthMessage()).then(function () {
                  authSig = localStorage.getItem('lit-auth-signature');
                  authSig = JSON.parse(authSig);
                });
              }
            }();

            return _temp && _temp.then ? _temp.then(function () {
              return authSig;
            }) : authSig;
          }

          var authSig = localStorage.getItem('lit-auth-signature');

          var _temp2 = function () {
            if (!authSig) {
              return Promise.resolve(signAndSaveAuthMessage()).then(function () {
                authSig = localStorage.getItem('lit-auth-signature');
              });
            }
          }();

          return _temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2);
        }

        var selectedChain = LIT_CHAINS[chain];
        var selectedChainId = '0x' + selectedChain.chainId.toString('16');
        console.debug("checkAndSignAuthMessage with chainId " + chainId + " and chain set to " + chain + " and selectedChain is ", selectedChain);

        var _temp4 = function () {
          if (chainId !== selectedChainId) {
            // the metamask chain switching thing does not work on mainnet
            return function () {
              if (selectedChain.chainId !== 1) {
                var data = [{
                  chainId: selectedChainId,
                  chainName: selectedChain.name,
                  nativeCurrency: {
                    name: selectedChain.name,
                    symbol: selectedChain.symbol,
                    decimals: selectedChain.decimals
                  },
                  rpcUrls: selectedChain.rpcUrls,
                  blockExplorerUrls: selectedChain.blockExplorerUrls
                }];
                return Promise.resolve(web3.request({
                  method: 'wallet_addEthereumChain',
                  params: data
                })["catch"]()).then(function (res) {
                  if (res) {
                    console.log(res);
                  }
                });
              } else {
                _exit = 1;
                return {
                  errorCode: 'wrong_chain'
                };
              }
            }();
          }
        }();

        return _temp4 && _temp4.then ? _temp4.then(_temp5) : _temp5(_temp4);
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var connectWeb3 = function connectWeb3() {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error({
        errorCode: 'no_wallet',
        message: 'No web3 wallet was found'
      });
    }

    return Promise.resolve(detectEthereumProvider__default['default']()).then(function (provider) {
      // trigger metamask popup
      return Promise.resolve(provider.request({
        method: 'eth_requestAccounts'
      })).then(function (accounts) {
        var account = accounts[0].toLowerCase();
        return {
          web3: provider,
          account: account
        };
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var AUTH_SIGNATURE_BODY = 'I am creating an account to use LITs at {{timestamp}}';

function chainHexIdToChainName(chainHexId) {
  for (var i = 0; i < Object.keys(LIT_CHAINS).length; i++) {
    var chainName = Object.keys(LIT_CHAINS)[i];
    var litChainHexId = '0x' + LIT_CHAINS[chainName].chainId.toString('16');

    if (litChainHexId === chainHexId) {
      return chainName;
    }
  }
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it) return (it = it.call(o)).next.bind(it);

  if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it) o = it;
    var i = 0;
    return function () {
      if (i >= o.length) return {
        done: true
      };
      return {
        done: false,
        value: o[i++]
      };
    };
  }

  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var listenForChildFrameMessages = function listenForChildFrameMessages() {
  try {
    console.log('calling listenForChildFrameMessages from ' + window.origin); // listen for requests from child frames

    window.addEventListener('message', function (event) {
      try {
        // console.log('onMessage in sdk: ', event)
        var childFrameThatSentMessageIndex = false;

        for (var i = 0; i < frames.length; i++) {
          if (frames[i] === event.source) {
            childFrameThatSentMessageIndex = i;
          }
        }

        return Promise.resolve(function () {
          if (childFrameThatSentMessageIndex !== false) {
            console.log('onMessage in parent: ', event);
            var _event$data = event.data,
                command = _event$data.command,
                params = _event$data.params;

            if (command === 'LIT_SYN') {
              window.frames[childFrameThatSentMessageIndex].postMessage({
                response: 'LIT_ACK'
              }, '*');
              return;
            } //       if (command === 'signAndGetEncryptionKey') {
            //         authSig = await checkAndSignAuthMessage({ chain: params.chain })
            //         if (authSig.errorCode && authSig.errorCode === 'wrong_chain') {
            //           alert('You are connected to the wrong blockchain.  Please switch your metamask to ' + params.chain)
            //         }
            //
            //         // get the merkle proof
            //         const { balanceStorageSlot } = LIT_CHAINS[params.chain]
            //         try {
            //           merkleProof = await getMerkleProof({ tokenAddress: params.tokenAddress, balanceStorageSlot, tokenId: params.tokenId })
            //         } catch (e) {
            //           console.log(e)
            //           alert('Error - could not obtain merkle proof.  Some nodes do not support this operation yet.  Please try another ETH node.')
            //           return
            //         }
            //         const encryptionKey = await window.litNodeClient.getEncryptionKey({
            //           ...params, authSig, merkleProof
            //         })
            //         window.frames[childFrameThatSentMessageIndex].postMessage({ respondingToCommand: command, encryptionKey }, '*')
            //         return
            //       }


            var _temp3 = function () {
              if (event.data.target === 'LitNodeClient') {
                var _temp4 = function () {
                  if (command === 'getEncryptionKey') {
                    return Promise.resolve(window.litNodeClient.getEncryptionKey(_extends({}, params))).then(function (encryptionKey) {
                      window.frames[childFrameThatSentMessageIndex].postMessage({
                        respondingToCommand: command,
                        encryptionKey: encryptionKey
                      }, '*');
                    });
                  }
                }();

                if (_temp4 && _temp4.then) return _temp4.then(function () {});
              }
            }();

            if (_temp3 && _temp3.then) return _temp3.then(function () {});
          }
        }());
      } catch (e) {
        return Promise.reject(e);
      }
    }, false);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};
var listenForFrameParentMessages = function listenForFrameParentMessages() {
  try {
    console.log('calling listenForFrameParentMessages from ' + window.origin); // listen for requests from child frames

    window.addEventListener('message', function (event) {
      try {
        var messageIsFromFrameParent = event.source === window.parent;

        if (messageIsFromFrameParent) {
          console.log('onMessage in frame: ', event);
        } // console.log('messageIsFromFrameParent: ', messageIsFromFrameParent)


        if (messageIsFromFrameParent) {
          var _event$data2 = event.data,
              response = _event$data2.response,
              respondingToCommand = _event$data2.respondingToCommand;

          if (response === 'LIT_ACK') {
            window.useLitPostMessageProxy = true;
            return Promise.resolve();
          }

          if (respondingToCommand === 'getEncryptionKey') {
            var encryptionKey = event.data.encryptionKey;
            unlockLitWithKey({
              symmetricKey: encryptionKey
            });
          }
        }

        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    }, false);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};
var sendMessageToFrameParent = function sendMessageToFrameParent(data) {
  window.parent.postMessage(data, '*');
};
var inIframe = function inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

/**
 * Convert a file to a data URL, which could then be embedded in a LIT.  A data URL is a string representation of a file.
 * @param {File} file The file to turn into a data url
 * @returns {string} The data URL.  This is a string representation that can be used anywhere the original file would be used.
 */
function fileToDataUrl(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();

    reader.onloadend = function () {
      resolve(reader.result);
    };

    reader.readAsDataURL(file);
  });
}
/**
 * Inject an iFrame into the current page that will display a LIT.  This function safely sandboxes the content in the iFrame so that the LIT cannot see cookies or localStorage of the parent website.
 * @param {Object} params
 * @param {Object} params.symmetricKey The decryption key obtained by calling "LitNodeClient.getEncryptionKey"
 * @returns {promise} A promise that will resolve when the LIT is unlocked
 */

function injectViewerIFrame(_ref) {
  var destinationId = _ref.destinationId,
      title = _ref.title,
      fileUrl = _ref.fileUrl,
      className = _ref.className;

  if (fileUrl.includes('data:')) {
    // data urls are not safe, refuse to do this
    throw new Error('You can not inject an iFrame with a data url.  Try a regular https URL.');
  }

  var url = new URL(fileUrl);

  if (url.host.toLowerCase() === window.location.host.toLowerCase()) {
    throw new Error('You cannot host a LIT on the same domain as the parent webpage.  This is because iFrames with the same origin have access to localstorage and cookies in the parent webpage which is unsafe');
  }

  var iframe = document.createElement('iframe');
  iframe.src = fileUrl;
  iframe.title = title;
  iframe.sandbox = 'allow-forms allow-scripts allow-popups  allow-modals allow-popups-to-escape-sandbox allow-same-origin';
  iframe.loading = 'lazy';
  iframe.allow = 'accelerometer; ambient-light-sensor; autoplay; battery; camera; display-capture; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr; screen-wake-lock; web-share; xr-spatial-tracking';

  if (className) {
    iframe.className = className;
  }

  document.getElementById(destinationId).appendChild(iframe);
}

/**
 * Create a ready-to-go LIT using provided HTML/CSS body and an encrypted zip data url.  You need to design your LIT with HTML and CSS, and provide an unlock button with the id "unlockButton" inside your HTML.  This function will handle the rest.
 * @param {Object} params
 * @param {string} params.title The title that will be used for the title tag in the outputted HTML
 * @param {number} params.htmlBody The HTML body for the locked state of the LIT.  All users will be able to see this HTML.  This HTML must have a button with an id of "unlockButton" which will be automatically set up to decrypt and load the encryptedZipDataUrl
 * @param {string} params.css Any CSS you would like to include in the outputted HTML
 * @param {number} params.encryptedZipDataUrl a data URL of the encrypted zip that contains the locked content that only token holders will be able to view.
 * @param {string} params.tokenAddress The token address of the corresponding NFT for this LIT.  ERC721 and ERC 1155 tokens are currently supported.
 * @param {number} params.tokenId The ID of the token of the corresponding NFT for this LIT.  Only holders of this token ID will be able to unlock and decrypt this LIT.
 * @param {string} params.chain The chain that the corresponding NFT was minted on.  "ethereum" and "polygon" are currently supported.
 * @param {Array} [params.npmPackages=[]] An array of strings of NPM package names that should be embedded into this LIT.  These packages will be pulled down via unpkg, converted to data URLs, and embedded in the LIT HTML.  You can include any packages from npmjs.com.
 * @returns {string} The HTML string that is now a LIT.  You can send this HTML around and only token holders will be able to unlock and decrypt the content inside it.  Included in the HTML is this LIT JS SDK itself, the encrypted locked content, an automatic connection to the LIT nodes network, and a handler for a button with id "unlockButton" which will perform the unlock operation when clicked.
 */
function _settle(pact, state, value) {
  if (!pact.s) {
    if (value instanceof _Pact) {
      if (value.s) {
        if (state & 1) {
          state = value.s;
        }

        value = value.v;
      } else {
        value.o = _settle.bind(null, pact, state);
        return;
      }
    }

    if (value && value.then) {
      value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
      return;
    }

    pact.s = state;
    pact.v = value;
    var observer = pact.o;

    if (observer) {
      observer(pact);
    }
  }
}
/**
 * Lock and unlock the encrypted content inside a LIT.  This content is only viewable by holders of the NFT that corresponds to this LIT.  Locked content will be decrypted and placed into the HTML element with id "mediaGridHolder".  The HTML element with the id "lockedHeader" will have it's text automatically changed to LOCKED or UNLOCKED to denote the state of the LIT.  Note that if you're creating a LIT using the createHtmlLIT function, you do not need to use this function, because this function is automatically bound to any button in your HTML with the id "unlockButton".
 * @returns {Promise} the promise will resolve when the LIT has been unlocked or an error message has been shown informing the user that they are not authorized to unlock the LIT
 */


/**
 * Manually unlock a LIT with a symmetric key.  You can obtain this key by calling "checkAndSignAuthMessage" to get an authSig, then calling "getMerkleProof" to get the merkle proof, and then "LitNodeClient.getEncryptionKey" to get the key.  If you want to see an example, check out the implementation of "toggleLock" which does all those operations and then calls this function at the end (unlockLitWithKey)
 * @param {Object} params
 * @param {Object} params.symmetricKey The decryption key obtained by calling "LitNodeClient.getEncryptionKey"
 * @returns {promise} A promise that will resolve when the LIT is unlocked
 */
var unlockLitWithKey = function unlockLitWithKey(_ref2) {
  var symmetricKey = _ref2.symmetricKey;

  try {
    var mediaGridHolder = document.getElementById('mediaGridHolder');
    var lockedHeader = document.getElementById('lockedHeader'); // convert data url to blob

    return Promise.resolve(fetch(window.encryptedZipDataUrl)).then(function (_fetch) {
      return Promise.resolve(_fetch.blob()).then(function (encryptedZipBlob) {
        return Promise.resolve(decryptZip(encryptedZipBlob, symmetricKey)).then(function (decryptedFiles) {
          return Promise.resolve(decryptedFiles['string.txt'].async('text')).then(function (mediaGridHtmlBody) {
            mediaGridHolder.innerHTML = mediaGridHtmlBody;
            lockedHeader.innerText = 'UNLOCKED';
            window.locked = false;
          });
        });
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var toggleLock = function toggleLock() {
  try {
    var mediaGridHolder = document.getElementById('mediaGridHolder');
    var lockedHeader = document.getElementById('lockedHeader');
    return Promise.resolve(function () {
      if (window.locked) {
        // save public content before decryption, so we can toggle back to the
        // locked state in the future
        window.publicContent = mediaGridHolder.innerHTML;

        if (!window.useLitPostMessageProxy && !window.litNodeClient.ready) {
          alert('The LIT network is still connecting.  Please try again in about 10 seconds.');
          return;
        }

        return Promise.resolve(checkAndSignAuthMessage({
          chain: window.chain
        })).then(function (authSig) {
          if (authSig.errorCode && authSig.errorCode === 'wrong_chain') {
            alert('You are connected to the wrong blockchain.  Please switch your metamask to ' + window.chain);
            return;
          } // get the merkle proof
          // const { balanceStorageSlot } = LIT_CHAINS[window.chain]
          // let merkleProof = null
          // try {
          //   merkleProof = await getMerkleProof({ tokenAddress: window.tokenAddress, balanceStorageSlot, tokenId: window.tokenId })
          // } catch (e) {
          //   console.log(e)
          //   alert('Error - could not obtain merkle proof.  Some nodes do not support this operation yet.  Please try another ETH node.')
          //   return
          // }


          if (window.useLitPostMessageProxy) {
            // instead of asking the network for the key part, ask the parent frame
            // the parentframe will then call unlockLit() with the encryption key
            sendMessageToFrameParent({
              command: 'getEncryptionKey',
              target: 'LitNodeClient',
              params: {
                tokenAddress: window.tokenAddress,
                tokenId: window.tokenId,
                chain: window.chain,
                authSig: authSig
              }
            });
            return;
          } // get the encryption key


          return Promise.resolve(window.litNodeClient.getEncryptionKey({
            accessControlConditions: window.accessControlConditions,
            toDecrypt: window.encryptedSymmetricKey,
            authSig: authSig,
            chain: window.chain
          })).then(function (symmetricKey) {
            return Promise.resolve(unlockLitWithKey({
              symmetricKey: symmetricKey
            })).then(function () {});
          });
        });
      } else {
        mediaGridHolder.innerHTML = window.publicContent;
        lockedHeader.innerText = 'LOCKED';
        window.locked = true;
      }
    }());
  } catch (e) {
    return Promise.reject(e);
  }
};

var _Pact = /*#__PURE__*/function () {
  function _Pact() {}

  _Pact.prototype.then = function (onFulfilled, onRejected) {
    var result = new _Pact();
    var state = this.s;

    if (state) {
      var callback = state & 1 ? onFulfilled : onRejected;

      if (callback) {
        try {
          _settle(result, 1, callback(this.v));
        } catch (e) {
          _settle(result, 2, e);
        }

        return result;
      } else {
        return this;
      }
    }

    this.o = function (_this) {
      try {
        var value = _this.v;

        if (_this.s & 1) {
          _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
        } else if (onRejected) {
          _settle(result, 1, onRejected(value));
        } else {
          _settle(result, 2, value);
        }
      } catch (e) {
        _settle(result, 2, e);
      }
    };

    return result;
  };

  return _Pact;
}();

function _isSettledPact(thenable) {
  return thenable instanceof _Pact && thenable.s & 1;
}

function _forTo(array, body, check) {
  var i = -1,
      pact,
      reject;

  function _cycle(result) {
    try {
      while (++i < array.length && (!check || !check())) {
        result = body(i);

        if (result && result.then) {
          if (_isSettledPact(result)) {
            result = result.v;
          } else {
            result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
            return;
          }
        }
      }

      if (pact) {
        _settle(pact, 1, result);
      } else {
        pact = result;
      }
    } catch (e) {
      _settle(pact || (pact = new _Pact()), 2, e);
    }
  }

  _cycle();

  return pact;
}

var createHtmlLIT = function createHtmlLIT(_ref) {
  var title = _ref.title,
      htmlBody = _ref.htmlBody,
      css = _ref.css,
      encryptedZipDataUrl = _ref.encryptedZipDataUrl,
      accessControlConditions = _ref.accessControlConditions,
      encryptedSymmetricKey = _ref.encryptedSymmetricKey,
      chain = _ref.chain,
      _ref$npmPackages = _ref.npmPackages,
      npmPackages = _ref$npmPackages === void 0 ? [] : _ref$npmPackages;

  try {
    var _temp3 = function _temp3() {
      var formattedAccessControlConditions = accessControlConditions.map(function (c) {
        return canonicalAccessControlConditionFormatter(c);
      }); // console.log('scriptTags: ', scriptTags)

      return "\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>" + title + "</title>\n    <style id=\"jss-server-side\">" + css + "</style>\n    " + scriptTags + "\n    <script>\n      var encryptedZipDataUrl = \"" + encryptedZipDataUrl + "\"\n      var accessControlConditions = " + JSON.stringify(formattedAccessControlConditions) + "\n      var chain = \"" + chain + "\"\n      var encryptedSymmetricKey = \"" + uint8arrayToString__default['default'](encryptedSymmetricKey, 'base16') + "\"\n      var locked = true\n      var useLitPostMessageProxy = false\n\n      document.addEventListener('lit-ready', function(){\n        var unlockButton = document.getElementById('unlockButton')\n        if (unlockButton) {\n          unlockButton.disabled = false\n        }\n\n        var loadingSpinner = document.getElementById('loadingSpinner')\n        if (loadingSpinner) {\n          loadingSpinner.style = 'display: none;'\n        }\n\n        var loadingText = document.getElementById('loadingText')\n        if (loadingText){\n          loadingText.innerText = ''\n        }\n      })\n    </script>\n    <script onload='LitJsSdk.default.litJsSdkLoadedInALIT()' src=\"https://jscdn.litgateway.com/index.web.js\"></script>\n  </head>\n  <body>\n    <div id=\"root\">" + htmlBody + "</div>\n    <script>\n      var unlockButton = document.getElementById('unlockButton')\n      unlockButton.onclick = function() {\n        LitJsSdk.default.toggleLock()\n      }\n      unlockButton.disabled = true\n    </script>\n  </body>\n</html>\n  ";
    };

    // uncomment this to embed the LIT JS SDK directly instead of retrieving it from unpkg when a user views the LIT
    // npmPackages.push('lit-js-sdk')
    // console.log('createHtmlLIT with npmPackages', npmPackages)
    var scriptTags = '';

    var _temp4 = _forTo(npmPackages, function (i) {
      return Promise.resolve(getNpmPackage(npmPackages[i])).then(function (scriptDataUrl) {
        var tag = "<script src=\"" + scriptDataUrl + "\"></script>\n";
        scriptTags += tag;
      });
    });

    return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
  } catch (e) {
    return Promise.reject(e);
  }
};

var getNpmPackage = function getNpmPackage(packageName) {
  try {
    // console.log('getting npm package: ' + packageName)
    if (PACKAGE_CACHE[packageName]) {
      // console.log('found in cache')
      return Promise.resolve(PACKAGE_CACHE[packageName]);
    }

    return Promise.resolve(fetch('https://unpkg.com/' + packageName)).then(function (resp) {
      if (!resp.ok) {
        console.log('error with response: ', resp);
        throw Error(resp.statusText);
      }

      return Promise.resolve(resp.blob()).then(function (blob) {
        // console.log('got blob', blob)
        return Promise.resolve(fileToDataUrl(blob)).then(function (dataUrl) {
          // console.log('got dataUrl', dataUrl)
          PACKAGE_CACHE[packageName] = dataUrl;
          return dataUrl;
        });
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Encrypt a zip file created with JSZip using a new random symmetric key via WebCrypto.
 * @param {JSZip} zip The JSZip instance to encrypt
 * @returns {Object} The encryptedZip as a Blob and the symmetricKey used to encrypt it, as a JSON string.
 */
var encryptZip = function encryptZip(zip) {
  try {
    return Promise.resolve(zip.generateAsync({
      type: 'blob'
    })).then(function (zipBlob) {
      return Promise.resolve(zipBlob.arrayBuffer()).then(function (zipBlobArrayBuffer) {
        console.log('blob', zipBlob);
        return Promise.resolve(generateSymmetricKey()).then(function (symmKey) {
          return Promise.resolve(encryptWithSymmetricKey(symmKey, zipBlobArrayBuffer)).then(function (encryptedZipBlob) {
            // to download the encrypted zip file for testing, uncomment this
            // saveAs(encryptedZipBlob, 'encrypted.bin')
            return Promise.resolve(crypto.subtle.exportKey('raw', symmKey)).then(function (_crypto$subtle$export) {
              var exportedSymmKey = new Uint8Array(_crypto$subtle$export);
              console.log('exportedSymmKey in hex', uint8arrayToString__default['default'](exportedSymmKey, 'base16')); // encrypt the symmetric key with the
              // public key derived from the eth wallet
              // const keypair = await checkAndDeriveKeypair()
              // const pubkey = keypair.publicKey
              // const privkey = keypair.secretKey
              // encrypt symm key
              // const encryptedSymmKeyData = encryptWithPubkey(pubkey, JSON.stringify(exportedSymmKey), 'x25519-xsalsa20-poly1305')
              // const packed = JSON.stringify(encryptedSymmKeyData)
              //   console.log('packed symmetric key ', packed)
              //   const unpacked = JSON.parse(packed)
              //   // test decrypt
              //   const decryptedSymmKey = decryptWithPrivkey(unpacked, privkey)
              //   console.log('decrypted', decryptedSymmKey)
              //
              //   // import the decrypted symm key
              //   const importedSymmKey = await importSymmetricKey(decryptedSymmKey)
              //
              //   const decryptedZipArrayBuffer = await decryptWithSymmetricKey(
              //     encryptedZipBlob,
              //     importedSymmKey
              //   )
              //
              //   // compare zip before and after as a sanity check
              //   const isEqual = compareArrayBuffers(
              //     zipBlobArrayBuffer,
              //     decryptedZipArrayBuffer
              //   )
              //   console.log('Zip before and after decryption are equal: ', isEqual)
              //   if (!isEqual) {
              //     throw new Error('Decrypted zip does not match original zip.  Something is wrong.')
              //   }
              // to download the zip, for testing, uncomment this
              //   const decryptedBlob = new Blob(
              //     [decryptedZipArrayBuffer],
              //     { type: 'application/zip' }
              //   )
              //   console.log('decrypted blob', decryptedBlob)
              //
              //   saveAs(decryptedBlob, 'decrypted.zip')
              // console.log('saved')

              return {
                symmetricKey: exportedSymmKey,
                encryptedZip: encryptedZipBlob
              };
            });
          });
        });
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Decrypt and unzip a zip that was created using encryptZip, zipAndEncryptString, or zipAndEncryptFiles.
 * @param {Blob} encryptedZipBlob The encrypted zip as a Blob
 * @param {Object} symmKey An object containing the symmetric key used that will be used to decrypt this zip.
 * @returns {Array} An array of the decrypted files inside the zip.
 */
var decryptZip = function decryptZip(encryptedZipBlob, symmKey) {
  try {
    // const keypair = await checkAndDeriveKeypair()
    // console.log('Got keypair out of localstorage: ' + keypair)
    // const privkey = keypair.secretKey
    // let decryptedSymmKey = await decryptWithWeb3PrivateKey(symmKey)
    // if (!decryptedSymmKey) {
    //   // fallback to trying the private derived via signature
    //   console.log('probably not metamask')
    //   decryptedSymmKey = decryptWithPrivkey(symmKey, privkey)
    // }
    // console.log('decrypted', decryptedSymmKey)
    // import the decrypted symm key
    return Promise.resolve(importSymmetricKey(symmKey)).then(function (importedSymmKey) {
      return Promise.resolve(decryptWithSymmetricKey(encryptedZipBlob, importedSymmKey)).then(function (decryptedZipArrayBuffer) {
        // unpack the zip
        var zip = new JSZip__default['default']();
        return Promise.resolve(zip.loadAsync(decryptedZipArrayBuffer)).then(function (unzipped) {
          // load the files into data urls with the metadata attached
          // const files = await Promise.all(unzipped.files.map(async f => {
          //   // const dataUrl = await fileToDataUrl(f)
          //   return {
          //     type: f.type,
          //     name: f.name,
          //     file: f
          //   }
          // }))
          return unzipped.files;
        });
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Zip and encrypt multiple files.
 * @param {array} files An array of the files you wish to zip and encrypt
 * @returns {Object} The encryptedZip as a Blob and the symmetricKey used to encrypt it, as a JSON string.  The encrypted zip will contain a folder "encryptedAssets" and all of the files will be inside it.
 */
var zipAndEncryptFiles = function zipAndEncryptFiles(files) {
  try {
    // let's zip em
    var zip = new JSZip__default['default']();

    for (var i = 0; i < files.length; i++) {
      zip.folder('encryptedAssets').file(files[i].name, files[i]);
    }

    return encryptZip(zip);
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Zip and encrypt a string.  This is used to encrypt any string that is to be locked and included in a LIT.  For example, on MintLIT, we render the HTML/CSS containing the locked files and a grid to view them to a string using ReactDOMServer.renderToString().
 * @param {string} string The string to zip and encrypt
 * @returns {Object} The encryptedZip as a Blob and the symmetricKey used to encrypt it, as a JSON string.  The encrypted zip will contain a single file called "string.txt"
 */
var zipAndEncryptString = function zipAndEncryptString(string) {
  try {
    var zip = new JSZip__default['default']();
    zip.file('string.txt', string);
    return encryptZip(zip);
  } catch (e) {
    return Promise.reject(e);
  }
};
var PACKAGE_CACHE = {};

var printError = function printError(e) {
  console.log('Error Stack', e.stack);
  console.log('Error Name', e.name);
  console.log('Error Message', e.message);
};
var mostCommonString = function mostCommonString(arr) {
  return arr.sort(function (a, b) {
    return arr.filter(function (v) {
      return v === a;
    }).length - arr.filter(function (v) {
      return v === b;
    }).length;
  }).pop();
};

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

var initWasmBlsSdk = function initWasmBlsSdk() {
  try {
    var b = "";
    b += "eNrsvQt4XddVIHze99yXdGXLtizJ9jknDsht0qqNLTuJ4/g4TzdJ47ZpG/ogaRs36XUefjW0gxL";
    b += "fFlFEMaD5P/8gigsCDNbMOKBhzI/5JwUV/INoXSqmBsxMADFjGAEGRDGMaE39r9c+j3uPHo4cJ6";
    b += "Q3ju7Ze6/9XHuttffae511tA8deErXNE3/U9171Dh0SMMf/dCj5iEM6/CHIUjQ8cc6JMn684/ah";
    b += "ziiQTqHVQZ4atqjziHJYB56/vkoCjBs4PlHc4cUPM+B5zEXpD7PqVDlc/Ls524B2OI0i5OgYu5q";
    b += "Pzfdzx19HtOej0YBbUHS80aHbn7Phx+vPPLI93z4Y08/9vjupx85+MT+Z75H08x/db7pIA7kP9P";
    b += "QHNM0Xc3QbMcoOJrehsmGYZiQZBZ0SHGhgGFoRlGznIJjQBHN0Lt0UzN117U03TA6Lc2wsVbHcC";
    b += "Bn0bGgOABsTWuFiqEm+s/BDJZRMmwA6CZk1qg2qF4raboDcFP6ZUM15jJd0y1do/7CHzZhG1oB8";
    b += "tiYYtplyl+G7piYAcqvgd448J9RLhtURhoyIF1zHNPIW1hfBZp0KpptYtXY1+UWDRGGndfXmVzS";
    b += "slzXsR3CBnZHc3XsMsB0HWKQhjBbeqxDuzguwAp2YSXWp5BsQm5HywGGXRc7axqmTi0XdMQAVaT";
    b += "rUFCHstBV0y4aqmLKSv0sQ005lxJzWByzWhZU3oIx3dBc7KWj24hPKGdhr6E1GzpmYoJJ3cRiOH";
    b += "wHK9exWSiqY9cpBxQ1kSQ027bN1YA9F/oPOaALFkSgfRfDNs4Q04lmWxC0sc80GO61gXVghaYB0";
    b += "4gB27QhwXIsC7qIU0b/WbrOGXWHkAeZuZNYgQnTYbomdQcywn/dkBHrZgyaJmLJWJuLKVprNWGG";
    b += "7fg/t7CiHWvOIyVgBzQiMxsQrAN55eE/xEiRsIGkZ0IqTQWhFX5aYLhQo0m9MwFTtl7CotyjEgB";
    b += "0ahDGonEJHRPyJqIQ/jfzpRz9Z2pWTt+rfx7+Iem91cmDdAlrtXGtmPsxt895avdTz+z/pKEtf3";
    b += "z3wUf2P/34I89+6MmP7z7wyIGP/bvd2ted8oFksva7dhETDux55MOfPLhbO2sXH09EzzN0r0T/g";
    b += "KEq+hd2icp+7HGO/6FdejwZ/0uGP3VA4n/E8Cj+v7n2jxzk6DmuXUWn7WVqBE/v/gSkP/Pxpw9q";
    b += "0zyAvc88+UnO9sd2+fFUwl+pVqWX/121KvG/Frgaxf8QuIr/DffqqY9w9CXulYpesCuMrwNPfGj";
    b += "/bk77E7vyeH3a33K+vcm0P+V8qbS/s5dhvg9/7NkP7X8EpCunXrZo7HWpP2J3xnk/8sxTT33s4F";
    b += "O7nz54gKE/Z3c+Pjf0VLId6CmnHrMT7USpv5bMu1el/nwyb5T6/9odQgNPf+jgx2FUibH9gt3x+";
    b += "Fyw/2q3UTlKgeVl9yd2H9C+ZLc93pD4FR71Y7s/sv+Tew9+7JmnGS7tH+dRzwF90W57bPf+jz27";
    b += "G2n2o/ufeQoGqf2j42KXkA61v3KcZyHDRz+p/bWT2/00VaL9jZOT+rQLDlDX07v3f+jgbiIx7W+";
    b += "d1ojcHtv9+P7dMIVOWShEEv7eUa0+9aEDB3fvf2TP7k9qM05FEiHGndRewsqkdsLrAe1PnA6YO1";
    b += "hwd9fj7YD2p86qj+zfjZnrh6v9mbNaFWtAhfa7Tv7XQX6GevGoPmx+yfmGM25/w/kt67edn3Hee";
    b += "8b5SUj4YecX4fek+Q34/Q9ODZ5/DqEpB+Nfhr+fdT5l/LD1DedzEP40FP4M/P0ehL/iTDiX7W/C";
    b += "v7+P/n1dnjP2P9DvKfPP7N93/sH6V/unoNTvwN//gZIX4e+f4e+U9SmpcwD+vgbhf3L+wfm8jX/";
    b += "/Yv8v+x+tf9L/o/Pz1v+Cv8Pm95ufMTn352AP8g3n16zf0X/E+oz9L84POb9u/6r1WeeX7J+1P2";
    b += "1/zfl7KDVif9n+ZeeM/VX9uPF16784s1D3F63vd/7VPOscodK/5QxZv+L8mfmL+v8HyPg0jPBfn";
    b += "K/pL+g/Zxyx/kT/HeenjX9v/Q/nsFH4/T9Z8U3nJ99r7DnkPn+dFs7k9gTGes3Te4ya4WueEU5o";
    b += "VU+vjDnGdmO7Bwk9xv0PWtsBsH2PpGPanZCkh0eMao+hQTE9HOKgBcHDHDQhOGpUg/sw4kDkBKf";
    b += "nIDhmVDeYmv80tjto+DZUP6xXg1YAjQDI0IKnNpvYm1FIvd+TyCmIFFRkAiJ5iUCxYWhplxQc0i";
    b += "EJniPyHJPnODzDSRifEQ7p1XBcq3zL6vTy3tNYSYEf9/PD8JwXvNwLO7zPDARP7TD7g2e2GVT8t";
    b += "F71ntnhDW4zMNNTOwwCYQvhyTqQ3h88tc3AToTHAPRUBIIWhrFLuT7jCD6dPgO7HI5Z0rXKD5oc";
    b += "4ETVU8CAU/XuB8wFTwsSIF7AuCDlHMTzGH9G0OdgFaesauBi6l4emrEBUBPsA8Q4HBvTg/2AHom";
    b += "N68GBzeakglnBQUClgwN0aAKXQ/BFDt6KGOHgVgie4eBtEDzLwW0QfImDtyPdHHN8op8Tjh8CaE";
    b += "s11MJC5eeRPAaNqv8O75nj/g7vwHH/Du+p4/6d3v7j/l3e08f9u719x/17vL3H/Xu9g8f9nVjHl";
    b += "sDBx9YgBwQaXvzSp/7Y8deGfzHzxR9y/J7w7yY+9ROmvyH85f8++OWc/wZJf6Ok3yDpN0q5twj8";
    b += "rQK/SeAbBb5J4H0C3yzwLQK/2bOBxk0gbssveJqfh3g7xFdAfCXEV0G8A+JrIF6E+OqSUURidKp";
    b += "+CZ7j8CzjZMOzxct5zh7/nZgMKFmHyfD04Am84ftYDJ5vQ7he9QOEw/M6hMNzPcLheQtSEOR7Fz";
    b += "ynrKpfwXR4tmE5eC7D9FzVR7IagecDCIdnF5aD59sxHzy74VmD54NISHbVfxOSFTzfjDwLz94FM";
    b += "QOjpVHj6BELiA3ECmIHsYTYQqwh9gCLEcbVDKgZUTOkZkzNoJpRNcMLUIK53Wv13tBHnLi6zzgM";
    b += "VO4V+0AMwXNNnzGAz44+EIfwXNVnXEIOXdlnzOJzRZ9xEZ/tfcYMPvN9xgV8FvqMaeHo88LRU/j";
    b += "U+oyX8Gn1GefwafYZZ/Fp9xmT+Ly5zziDzy19xgQ+N/cZp/HZ10fSxtvUZ7yIz419xil83tRnnM";
    b += "TnW/tI5Hhv6TNO4PPGPmMUnzf0Gcfw+cY+kjve2j7jKD43iKTpIUnzLhaDLFYA+YZ3O+ABRI63A";
    b += "/CAz22AB3zeAXjA522AB8THnYAHfG4FPODzLsADPm8FPODzbsADPpcDHvB5D+ABnyHgAZ/3Ah7w";
    b += "uR3wgM+dgAdDJN8tCTGXqwaa1woiKxJYQzqIqxzSpl0NbMjsVoN2kPec4RYKDdqx1Mzh76Bdrcx";
    b += "YsIqtx+w9Ufb1FILqbG8ZQpwIskxVtL6xkusw64Yo63VxJW0IyUWQNlXJdY2VBJj1DVHWIK6kgp";
    b += "BCBKmoSoL6SijgvS1GV7RuxEnDZjWwIA9UuSKq8m0UGsK15RzAzUYMTyJshBaNIRN/J81q5ZtAv";
    b += "14vVrUqqqpXVWV69ciDOloay78Zy3dEWd8cl6/HG5QvN5Z/E5ZfE2V9U1y+HmVQvlRfXmEQhqZw";
    b += "5HpacvRjOZgGKxo9oLTyQzZk6sZ2r4+a6Ob5smiIUaYuzPQdUaYulamczNSJmb4zytSpMpXiTEY";
    b += "449R1k2f3bQzixKCogJqXx0pXRpXmY3KKp72oKCnfSI4+ln9jlNWPy2fwhN9Y3sPyN0RZvbh8Bj";
    b += "t4jeXXYfkbo6zr4vIZnLAumxNuSeMqr6KWVy8giF7qsTU3zS+B3JdA6deWyD+LpDkPfRN8HtIm+";
    b += "DxU/dl5qPqWFFWvjqk6S/LbidlcvYC4z5T0ixPymfJ9caI9U6ovXqAX5xHoVgM7E1Vcgfz+dqDl";
    b += "wQVoeXABWh5cgJYH56HlYoqW18a0vIBwXjuPcF6CXF6CSF6CNEbcrE7gJTeHNF79cqTxg7hUvCX";
    b += "K/mBcR/2UZ5Px27H8W6Osb4/L15NENi0/gOVvirI+EJevJ5k5CNqqIxzNc1MEbckOVwg6V638oA";
    b += "2Z6icc8rQk4fWzCvByEl4/dQAvxXCWPal+reZEUQ+KXitq76tR1R7SUfnvAV3C34jPo7q/CZ8ju";
    b += "t9H2r3ub8bnqO5vIS1fB/UPnmM6nhT0gO6CxwQ9oMvgGUEP6DZ4QNADug6fDpzW+XRgQsfTgR7Q";
    b += "jfwd+Dyr+3fg85zu34nPl3T/LnxO6v7d+Dyv+/fgc1r378XnBZ1PCKZ0/yF8XtT9d+NzVvffg89";
    b += "Luv9efM7o/sP4HDD878LnoOG/D5+HDf/9+KwZ/gfkyCiiY2ze8D9IzRv+d1P3DP8R6p7hP0rNG/";
    b += "6HqHnD/zB1z/A/Qt0z/MeoecPfTc0b/kepe4b/OHXP8J+g5k3/Y9S86Vepe6a/h7pn+k9GTBcpc";
    b += "CgZYUOvVZPEtKtBOF4y5xeOBJ9HOBJ8HuF4yZxbOCZEYyco36tZ+f6AKN/vF+X7faJ8f5co3w+L";
    b += "8v1eUb7fI8r3u0X5fkiU752ifN8ryvc9onzfLcr3XaJ83ynK9x2ifO8Q5TsU5Xu7KN+3i/K9TZT";
    b += "v20T53irK962ifN8syvcWUb43i/LdJ8r3JlG+N4ryvZyU73zyTA/ZyXtSlO89onxXRfn+mCjfT4";
    b += "jy/bgo3x8V5Xu3KN+PifL9EVG+PyzK94dE+X5UlO9HRPn+blG+P5hQvouL33wVX4+br7WL3Hytb";
    b += "W6+5tOWF1KUF9KRX6Z6vDa1+cpnbb6WZ22+8ooqlr8ONl8ZOsTyrM1XMWvztbypCr+qqnBxrgOe";
    b += "b0tpnF+kNM43pfFrUBXON6Ux46aYVoWvnjRegha8BAX420H3LSZ1305Wfd8gqm+PqL4bRPVdK6r";
    b += "vG0X1vUFU3xtF9X2LqL5vFdX3JlF9N4rqu0lU3z5RfTeL6rtFVN+bRcU1RQW2RAXWRAW2RcXNiQ";
    b += "pcEBU4LyqwIyruClGBV4oKvEpU4HZRcdeIClwUFXi1qMAd9bsIVk13iCq6TVTTO0RVvV1U2ztFl";
    b += "d0qqu1doureJqrx3aIKLxfV+B5RlW8V1fpeUaW3i2q9U1TtMGKyhElEayMdkSmFsI1OemlrA29A";
    b += "npYkvJ4BAF5OwuupHOClGL44vVeZniR6/87wUDV4Z1krlvRieGR0XAs3hWfgUTlvaUVP32COGmg";
    b += "jA+My/KfQvgK46mZSnsMJCG7h4GkIbubgixDcxMFTENzIwZMQvImDJyD4Fg6OQvBGDh6D4A2slO";
    b += "PNsyk3zKbcJJtyk4zPN/QZw6bcKJtyo4wYOAzDZb0+HMT9DAcHILiGg5egjVUcnIXgSg5ehOAKD";
    b += "l6AYJ6D0xAscPA8BHPcNbyUt+Ty3ZRLdlMu2U25ZDflkt2US/ZYhCbOSwANQEe3CxoguEPQAMFt";
    b += "HDwKwds4OAzBOzl4BIJbOXgYgrfKeCF4t4wXxTz39g5AXI5PH4ZyfCpRy/FpwyWHTytmHT51uOj";
    b += "wKcYMGtkMA8reEbrxac47KDSEi8oowHYlYbsoNIKwaWhaWQHFwYk4eAqC9+EZZrx3eFosm6ZQ9J";
    b += "7PJc2XnhbLpkkEna0D6WwPhaDTKdB9VDVKcmyVjJye3mH1B09vIwsniGDOI2ljp087ieXgPsXG2";
    b += "OVetYh83omEdbSyoFjoxZ+NlXHLux8n2kZDI56JEdoMD9sKV61sOpAUFoO2CIseYV5uJuoY1k0y";
    b += "/4bKn6btsXqFjDxh8VT/uKCHP+sr/2BGNeKycloRYIda5qhkVDMW6sCf7srXzRSSvpDKF56LDyP";
    b += "1QOOFYCeZ6Z3Vq7gSkG0Q7sROwLOd7ev8FaHm2+Z25JlQr/LxmOrwhO5p1SDHa1WVTasAiYFZ+S";
    b += "UHlp4VHgVMr91zMODANi+HgZxX8DQMEOXZ1WClZyKJKoFp8rYAV9tpgK7ynCSUF/gphM4CtMPLJ";
    b += "aG8vM/QSu1g57QkVKNQDREz7aDBiJWEWlwzQHeg4c/v/OJPDP0N8hFUtgMtg/7yh39i6CalOZGE";
    b += "mHISOzg7rBl3l00xOMHnsIOGIkktw5HiccGjjqd7kB97wnt0DbqFmaccDOIeOFHDpE09NJntU3V";
    b += "bc3cNlZUFu2EhiUU9CCvVZCdWJctPxZ0YTXdiZOmd6El2wkt1oiNZfkZ1IpdMrTlL7sCWZAd6Ex";
    b += "2ww+17eAuV4CBYinEHWGETWAi5xBsV/Gmv/ACaKWp4Ol1Em1PMQXazXNwK7AfLOoZgdKFxEGURU";
    b += "ANzGh5ohzO56nqttRhe+gVY6d8YXvgFtdJjbwZw3f+WqRV/5T3Gk2ycOyXGuQaNIrK93erp9wGr";
    b += "a8r81oSgmN/CnleZ34L+Qua397PNrabMb0F3VOa3z3gabfhIeAGrVwAk5rdiX4pGuQ+IRSzZ4hZ";
    b += "VhG1xxVZWI/Pbd0jBms42rkPyHJEnGclu34P2hLE6X/DIVLXIjwf4AZz/guey9S2tUXsTJrZ702";
    b += "vU3oSJ7d70GiWrTngEQE9HIGhhEHvk9hkDYrNXoy0jydqasr6tkawdSVrfojXtAwnrWrTGLWZZ4";
    b += "+4V7BEpAlMFZJO7L3E+gfa2I05ki3sgZYt7MLbFHbGCjwMmcYaOsRktyvITscntydjk9sXY5PZ0";
    b += "ZHKrbHKJco44fK921MFdPLCDsr7VyPr2nWhfewfa196JNrd3oR3u3WiRew/a4d6LJrg7vY8fR9N";
    b += "TWHp5rdgYuLH17TqxudwgNpdvEJvLN0r6DZJ+o6S/Scq9VeA3CXyjwDcJvE/gmwW+ReA3C/wWzy";
    b += "HLW9ezyc60AHG2vLVB2zFBk3HIBnUtxEsQ72Tr27TVLW0BfFAovNwespqtt7pFa9pArHLvy7C6h";
    b += "YXUv15WXjSMrkG+hzKsbmH9JhvqhaxtYXuAuhluMPxd9Va3LOMiu+W5MQOjpVHj6BELiA1bLHAR";
    b += "S4gtxBpiD7AYYVzNgJoRNUNqxtQMqhlVM7wAJcDuo4JKBelScsFXkgu+tXLBt1ou+Drkgm+VXPC";
    b += "tlAu+FXLBV5ALvqJc8LlywZeTCz5TLvhsueCz5ILPkQu+W+SC72a54NsiF3yb5YKvTy74NskF30";
    b += "a54LtJLvjeKhd8bwKdSKxwj4gVLsm+dX3GYZ11pgGxwgVJ8xBJQbn/K7AGQPd7d8j93u1yv3en3";
    b += "O9tk/u9u+R+7za537tb7ve2yv3ePXK/1y73e/fy/R7dc4qx7YQY457G59sADYYIvlsTUi6H+51K";
    b += "ah3WQVrhbr9m487w1rRZ6a0UmrVioUla+qwl6/T1abtZ1sWhOsdbnrabXa4qur6xkvVpu9n1cSV";
    b += "kwevWHRRBJesbK7kube14XVwJWfAW606ToJLr6iuhAOhREbqiZSNOGjTRRPm+tGnmfbxbNVl3D6";
    b += "xGDI+b0U6nRkrOOB+f2d5b0sazb1FVWV498sZN0nTqypPx7uq6Y28qX4+3cT40rCtPxrtr686+q";
    b += "Xw9ysb55DBVXmFwyEm8c2OmNpo5UWJ59CN83Zf31qTtavkIHTK2JjN1p+1qu1WmlmSmrrQBeJfK";
    b += "VI4zqa3jUPLIBmf3PgbJeXZJAU2vkLaJLsTkFE97SVFSoZEcg7TxbBCXz+CJoLG8nzae9ePyGez";
    b += "gN5Yn49031R2PU/kMTvCyOeHWNK4KKpo82L81ppd6bM1N80sg9yVQ+rUl8s8iac5D3wSfh7QJPg";
    b += "9Vf3Yeqr41RdWdMVVnSX4nMZudC4j7TEm/OCGfKd8XJ9ozpfriBXppHoFuN7AzUcUVyO9vB1oeX";
    b += "ICWBxeg5cEFaHlwHloupWh5XUzLCwjndfMI5yXI5SWI5CVIY8RNZwIvuTmkcefLkca70sazu+I6";
    b += "6qc8m4wfTBvPPhiXryeJbFom492NdXeXVL6eZOYgaKuOcEx6TzZ11EU7XCFoviA0GyYc8rQm4fW";
    b += "zOsIXlBG8fupG+IJyRF1Aztb3q5MTRT0oeRVU3umgtyY3dgNyc3hYbg6H5ObwiNwcDsvN4VEd3w";
    b += "GlG8qtckN5m9xQbpMbytvlhnK73FCGckO5Q24o75CbyTvlZvIuuZm8W24u75GbyXvlZnKn3Ey+T";
    b += "W4u3y03k++Rm8n3ys3kw3Jz+V1yM/k+uZl8v9xMfkBuLj/IB0aFxAXkGbG5HReb29NiczshNrcv";
    b += "ic3tpNjcnhWb23Nic3tBbG6nxOb2vNjcThtsc3vJYJvbGYNtbi8aaHNLF5pPRTyn1LdOsnWYSJv";
    b += "ebm8QjZfM+UUjwecRjQSfRzTSFeQcojEhGDtB8+5kzfuDonl/QDTv94vm/T7RvL9LNO+HRfN+r2";
    b += "je7xHN+92ieb9NNO+donnfK5r3PaJ53y2a912ied8pmvcdonnvEM07FM17u2jet4vmvU0079tE8";
    b += "94qmvctonnfLJr3FtG8N4vm3Sea9ybRvNtJ8y4kD/SQmbynRPV+UlTvPaJ6V0X1/pio3k+I6v24";
    b += "qN4fFdV7t6jej4nq/RFRvT8sqveHRPV+VFTvR0T1/u6E6l1a/Nar9Hrceq1b5NZrXXPrNZ+uvJC";
    b += "avJCG/DKV43WprVcha+vVnrX1KiiqaH8dbL0yNIj2rK1XKWvr1d5UhF9VRbg01/HOt6U0LixSGh";
    b += "ea0vg1qAgXmtKYcVNKK8JXTxovQQdegvr77aD5lpKabycrvm8UxXeDKL5vEMV3nSi+N4jie6Mov";
    b += "m8SxfetovjeJIrvRlF8N4ni2yeK72ZRfLeI4nuzKL63iIJriQJsiwJsigLsiILrigJcFAW4IApw";
    b += "ThTclaIArxIFuEMU4BWi4K4VBbgkCnCnKMCr63cRrJneIZro7aKZ3ima6nbRbO8STfY20WzvFk1";
    b += "3m2jG94gm3C6a8b2iKW8VzXqnaNKhaNZvE017R8RkCXuISiMdkR2FsA2bxlYaeAPytCbh9QxQY9";
    b += "PcCF5P5TU2za3pV6D3itlJovPvQsvbd4nl7eQvkeXt4Fhkj0OWt8/gcwwtcNmw9pbYsPbm2LB2S";
    b += "2xY2xcb1m6KDWvFCPcoBN8qFqUQfJNYlEZGuHTrbMrtsim3yKbcIosl7qBY4A6IBS7dJqJhbWds";
    b += "WFuKDWvXxoa1HbFh7arYsFaMcF+KzW3PmZHt7lkIupGbLLK4XSEWtzm2rKULdrG0nRAL3NNimZu";
    b += "QoPFpCdvVbo/tau+I7Wpvj+1qt8V2tXfFdrVijnvJiWxwZyF4jwwXgu3c2TvF4PZuMbi9lw1r8a";
    b += "zhghjaTjt85nDe4TOMKUfMlt+ZNK59J4XQ5Hheo1y0tn06trZ9Ora2VXZTELwfzy/jncMzYtQUW";
    b += "dfGlkvPiFFTZF2bBOlsCoWgkynQ/WwInGNLK7JvegYNb5/ZRsZNYqI7kLZz+rSTWAzuV0ysKYvY";
    b += "cWV4y6I6WlcSdrHjlvcAm0hGhrdsozoYmdpW2GwgKSpmlajwhHW5mahjCfvZP02bYvUmzWennHT";
    b += "/9KT5LBneco24qESGtxW1yFHJqOaEld/XzRSSvpDKJ4a3bIh3Rg9MXgjY9Pa0XsWVgAyDcCd2FE";
    b += "1u2bbOXxlqvkOmtyYZBOLxmOryKd0zq4HLa5XY4AIaAwvNamHT7VnKBjeyuHUx4HpFZZULtEfGt";
    b += "RkmsOO2GOZmGtdGhrmrPTcJddOGuW6WUS8Z5p5z0FzETkJtrrne9LZWZ3rLmhMb5zuJHZxDpreG";
    b += "mJtYyvi33jCUiscFj6IVOeTDnvAeHY08ycqW7D3NtNXruE09tJjxU3Vbc3fN8hbRDRvJM+qBmN6";
    b += "qTnTU2/9KJzLsf5fYiZ5kJ7xUJ1bX2/9SJ9x6g9wldmBLsgO9iQ44aHrr1HGQmN66bOmKNfcYxB";
    b += "IltLvVPF2MaKfEiPbFE2REe+KELNp/9B5j7yETzWbH8+LTFq1S/QfZDa2/S1yMPsR8h3cSuHTin";
    b += "QQui/S2Eyx5eDeBQo78ZQLl4x1FOG2x5d85iy3+Jiy2+IOhkuUerJrkR3MCnqt5HSZLvVMAfx/2";
    b += "WWcLQPTLuUwsBOklxzxbAM646PoUBEyeLQCn3Cr5/xzKswXgpMt+PGFFxK0uLnzkh3ManhuwnMt";
    b += "uRIdcNmiswbMFHfiiwKHXjvTK93rvoV+yWE74+Z3Xwy9srg105AvyCM2EdXovzIq89sIT9kk5fJ";
    b += "4wQBzxm0r7QebTfd/70SD4ANLJalJ5goObYYlYjaCt3gEMd3qURK7xbuOkDk7qwKRtnGRAknkKh";
    b += "dysUeUdWLSj8PaDHDL5OSXPSXnSi0ywhXlR9iynzJRl8X5chA9sM6Yx+QAtkBeoJK7AkH4uTn+J";
    b += "02H53b+Ntzr7Kf2MyeKeO8WGw6donRxLGoTN0t4ZTabJEHg/oqSMpH6b8FHZ65RQCyZvVZGIU0u";
    b += "YvE1F0lJkjOyHZ2jZuJjjzf2lHCsJR11WDoZd3tQfcflyb8hlZeKwy0rEoMvKw4DLSkPNZWVhxG";
    b += "Ul4ZjLysEJl5WCUZdMYGP/vfuP+/ejvfAD7Jk3x555E7bB14tF6BvEIvSNYhGq/Lb2Srry66r8v";
    b += "Cq/r8oPrPIL2yfwzQLfIvCbBX6LwG/1bLENdsjHbBHiK8T6FW2D10Hcg7gP8VaIr0XbYLIBfveC";
    b += "NZtkU9tKpbEWrM0R21qbbGuL1CpbJueiHqsRqBGpEaoRKwwojCgMLYBJsq2V9/hg738SX5ZrBa0";
    b += "Cn36fcQKfXp8xarFWccxi21o8v0JV4KjFW/xhi21qj1hsY4u7XGSjwxaz0aDFW/8Bi7f69FIebP";
    b += "0viSowa7KTnIsm39QRe4LGRMwF6hLxG2g7502+qSO23SQv8W2Ul/hukpf43iqqxltE1egVVeN6U";
    b += "TXeKOz9BmLv97GMiFxX0e7+pI3ml4AHm3f/J2zWCkZtvnE8ZrM2MGKzlnDU5hvKYZu1iSO2vMZn";
    b += "s1Zx2OYbTjyIQ7VlAJ/3Ax5svmm8hPh4APBgiXB4c8I0NN9gXHvKhK1Rnvezgdharqg7sTznRIK";
    b += "llq/yrovPybbWOVWDmuxsu1qoY3Vj+dvq7ULyyilu/QEPlO9sLL8tytURl29Lu7JtU+U76suzx/";
    b += "K3J96a1esFfDhONsdvT1vT8jHYKZs3KPXWtIjSWZvfuGG31byY44mY423AqtZFVW1QVTWeREMdL";
    b += "Y3lyRWtV+fOgco3HG3adFZRV/5GLO9HWW+My9ejDMqX6ssrDMLQ5jiTruXlXRsePaB0HmvaMT5u";
    b += "iTJlWtOO8ZlLlCnTmnaM34mWTDBvbl03eXbfziA5om6NTyWLaWvaYkxO8bS3KkoqNlJipoU4lc/";
    b += "ghPWN5TONw6l8Bidc11g+05qXymdwQpDNCW9O4ypyIJG8dnpzTC/12Jqb5pdA7kug9GtL5JmXiA";
    b += "n6zrxETJB25iVigqo/Ow9VvzlF1WvnuEQUUd/o//MK5fsSRPsSpPriBXrrPALdaWBnooorkN/fD";
    b += "rQ8uAAtDy5Ay4ML0PLgPLTcmqLl67MuETOF8/XzCOclyOUliOQlSGPETcIpIEIzpfHalyON34VL";
    b += "RW+U/V1xHfVTnk3G70y7wn1nXL6eJLJp+R1pa953xOXrSSaboJmpE4RTd6c4psuWlkcPyMu+U4Q";
    b += "8LUl4/awCvJyE108dwEsxnGVPql9rOVH0gVa+VKRLt1MmK8ovmnxJeNrkS8IJky8Jz5h8SThp8i";
    b += "XhWZMvCc+ZfEn4ksmXhFMmO645Lw5wpk25jTNZ4Z4RhzkXxVHOJZMV7polCrfFCvesyQr3YYsV7";
    b += "iGLFe4jFivcgxYq3KDQW6Bno2Jusap9zGJr2WGLfdKesNg+dsxi+9iTFtvHjlpoH0sHKMXEpeKA";
    b += "zeaysxaby16y2Fy2ZrO57BGbzWUHbTaXPWyzueyQzeayx2w2lx222Vz2qM3msiM2mstC8zZen0H";
    b += "ztv8Mdc/291L3bH9fxHSRxsb2tDUzfVtgNEjHTIPahHTMNKhNSMdMg9qEdKSLxTmkY0I24h0o37";
    b += "GhoSep24+Kuv2IqNvfLer2B0Xd/oCo2w+Iun2/qNv3ibr9NlG3d4q6fa+o2/eIun23qNt3ibp9p";
    b += "6jbd4i6vUPU7VDU7e2ibt8u6vatom7fIur2zaJubxF1e7Oo232ibm8SdXujqNs3ibrdTup2MXnQ";
    b += "RQa1+0Td3ivq9jOibj8t6vZTom4/Ker2HlG3q6Juf0zU7SdE3X5c1O2Pirq9W9Ttx0Td/oio2x9";
    b += "OqNuti999tb4ed1/XL3L3dX1z9zWfuryQpryQkvwy9ePrU7uv4twmXHW7r6KiivbXwe4rQ4loz9";
    b += "p9tWbtvtqbuvCrqgu3znXC820pjYuLlMbFpjR+DerCxaY0Zty0pnXhqyeNl6AGL0ED/nZQfluTy";
    b += "q8Y1N4guu8bRPd9o+i+14vu2yu671tE932r6L43ie67UXTfTaL79onuu1l03y2i+94suu8tovve";
    b += "KjquJTqwIzqwKTqwLTquKzpwQXTgoujAOdFxV4oOvEp04HWiA68QHdcXHbhVdOC1ogN79bsI1k3";
    b += "vE110p+im94qu+jbRbUPRZXeIbnuH6LrbRTe+S3Thu0U3vkd05TtFt75fdOl20a0fEF379ojJEn";
    b += "YClUY6IqMHYRtzDoPaU2wxHsHrGeAUm4VH8HoqP8UemwW+OL1XWWIkev9utKh9t1jUzv4yWdSO/";
    b += "Ze0L9v9YiFyQC6IbbkgtuWC2JYLYlsuiG25ILblgtiWC2JbLohtuSC25YLYlgtiWy6IbTajRQs4";
    b += "uii25aLYlgtyRy7IHbkgd+SC3JELckcuyB25IHfkgtyRC3JHLsgduSB35ILckQtyRy7IHbkgt+W";
    b += "CPBaGiaMPUv4vuXwYMOvyIcBFVyxYXVbmL7is3E+7rOyfd1n5n3L5MOAlVz544/JhwVmXDw8mXT";
    b += "4EOOPyocOEy0r8aZcPI8Zd9ocWFL2HknauD1HolMPWXcEK7/0R6EEKTTh8q80eAuKl/ACUyvNzV";
    b += "J7D+chjLcpHj+xvDm4zxjBykOxpTuaV/Q2kj8Tpx/LK/gbSh+L0I1L1OJvkWGSfcyq2z3kxbZ+T";
    b += "MnjdpZgs8jSLIp7MQlmUotz/rrSXWXE8iy7ZxOB1NWy8YkPXqXofoeccYeIeYSrxMau6VO9jNjY";
    b += "eSvmYBdZL9cxs9DGry5Jd52MWl4fPO8maG3zMRuj5QipfwsfsgMVmeoPWTmt75EOWDVnxWEp1aM";
    b += "ZEQ1Z+CUJZtKKzqxzbr1aU/erDyn61wytgoOC9NzZkRf9jK7NMVektFfw08KosU1Uyip7IYauFJ";
    b += "FQ8W+TYUhs6l+WdlmpG+s0yoB1z6wxZyalswpCVNJYp3q+6iZ0T+5C1PIfdM6dNWKdyUjAukvIe";
    b += "aya9x465bLi5sv7dM+ibQz4oY33BmbtDjreILlhJ81XlOVZ1YFXDdydc2gImUieW3oGeZAe8VAd";
    b += "SRqrjqgOFlFVtbskd2JLsQG+iA7HX2ARPvEyvsWbkNdZgr7GmeI1Fy0rhLjLVZJZEB+ZTDaok9E";
    b += "jfV0FnBzdqM0YI9KalmHhCl+8tMIv/guVplRkTeoxSJc+mtFP/mUxpJ/+zWq3Rnnv6l8Uf7eHv0";
    b += "CuHrtPCmiPeaLH7MB50QbmxihGLLf+3UIRfGQm3UkReRkHDUsCHuKvXCNQufuw5Ju+nnOFYN8cm";
    b += "OebJ+ygcWy8vqnCsR95g4ZjYvqE4B0YvhDN/OK4FegWdo46RTz4QBx7HZ3Ty6kwzgvEpcn5tR/F";
    b += "JA9dCQISCkzzLQYqUt6pBK9rfS3wc7fU9N4rXTLRaao3ikzb617Wi+BCUL3lOHIfyZZCQUX3oNR";
    b += "Y2ZhL30OqaISNQUxuqzSoOPW3BjQXFycRVyvDoPvgqhCpXuQfOFdd3dXBQvMrjyC+hPnPesvZV6";
    b += "an1GqrFXWQt9lWeoyvv/dUZr3NVamlbZC2FV0xGWK8hnml9DdFzyxXX4r5ic9TyKtH41ZnVxYZK";
    b += "r5jEvNrrwtVesa8O5SxljlqWULb0KpW9thxQvgYcsJQ1xXqV1t8r7739muSea7HaXx0aMl+xXen";
    b += "VLvvq0+TV5tp/O7i/cootvoZw1fJvBs/fbmWtV0kS8p5Li9I0+tcYUidGNae6Xiv+4/XZp2F0UX";
    b += "7RSp6HzVrJA7FLVvJErGZXE0diA3bySGzQTh6JHbaTR2JDdvJI7IidPBIbtpNHYkft9JEYHli1e";
    b += "C3JM7GanIm1JM6wkmdivekjMTxoKiSOxMbqjsTG6UiskDrSSh6J4ZHafEdieMRWTByJ4ZFcKXEk";
    b += "NkRHYsVFHInN0GFa80jslVAyCs0jseaR2OvySKyleST2ml+03dfQxv7f4pFY8RWTmIXmkdgrqDo";
    b += "WX0OHla8cB5SaR2LNI7HXBA01j8RePa59PR+JFV5DuCo3j6Ze10dipSUeicWHXl9Zb+TZt+KMtS";
    b += "cw12vGdk+/UXu0rIVTmo/f/57Sqn5O/A0O6XeXdaylSqZwvrHB1HahxZmJJ0xeTkxbKVapwHMGU";
    b += "vUoFWMMQ6ejIwbBqhEYE3IRSDJCfzQuCvn+m1XGL7D3VjlPlFIpoWs3E8+horxkGwdZfTvs8Q0Z";
    b += "wCdU/9FZX0lKcKz4EH7iPfwEjArwW3yYh3UK6pr83Be1sPaTX9TQG56JXsTx95QeWHtC89lAD9E";
    b += "M0NnZFeh3lbUdmi898Q2ypTW4qWJ/UPYsCPcHRfYLWHroBdjAlR96od8vCjrJRhW9MKLFvU7Ghy";
    b += "YZBGqeLY2fpMbHMhq3ts/ZNjUcYBee47aL0HaJ2t6hv+OF+dtH78BUaTRRkEKzO0YQiDEEmw81a";
    b += "pphBlTi0RsC0PgO/TMD9D34HbcPSoOBEfbeA60kJ+geKy7NvTdoAtQcGak50qmHoxmTdILwNDrv";
    b += "JEErVw1Rr9rgRzIGf4wGP3LNBg/VTTVQCadAM8TSQ1bMtMyaKFhcZtF8eE6LsNCT5lGQslWsa24";
    b += "eHc7AwFHCwPC8GIAuXS0eRdfYec+Vxo9Q40Pz8Whj21eJ9BDPL5/0uPRiSW8wA/GHaeyDV4j4JZ";
    b += "HeOHRai5ceKyY7jRsjWGCRzMK2C/UrAhNrTHHWPNRWyxj0AA26pgfaXIO2MihNW4jSNHxo6cHOa";
    b += "lXpbkEa78efTzQ2LbRW3zI1uxhUZ7U+A9hzGrE3bi0WezNaI/YO4s/ea4C7acIddtaRpp/Enyeu";
    b += "Ae6WgrOpDJw9hj+PXgOcnWvA2Qfw5+FrQ29I5/mKm5JwzKqBFlV9RRJu6ooW18kM1D+EP7vmRj2";
    b += "1cfWQkGf0kwwD3tsFmWxf40HdhR9duns/rpfQ9UDj1lwMuwl6ctP0NJExqPvx597MQdF7Mr6BY7";
    b += "sCkpKBSOOpSd2+B9QgtZ+9E3+2Z1HTXO0ujMs523Z4AYCVwULC9pEPB0GkaWG8/diV3n7o86oHW";
    b += "xoxuRV/tlwbTPbWrwUb8af3GmHTpLe5ROlCnYD7cAP+9MzRB9z0XTUEWPT9jdTkIZMn9o7h7AIM";
    b += "7jVO4Hr88eaawOwBLAGLOdiW8ECQGqdxQKzDguL6Mqmyo3FQ3fjTcWWDetlkWRHtPWLydvypXBF";
    b += "JLAGjMTZHTcYm6jovG5tuIzZL+ONeG2yKBq5QaeGPltW0fvVxWdKLaC5Faw8Km8RxTS4cQaRQRH";
    b += "aG67Xi165Tx0mTNh0n1Z0iLXSOpFNGG55D+KUdWfNhMaevxnj2lZw72clzJ0rFYyUtddzEMFekW";
    b += "HxSNWkkT6oQ/6inBvnkEQhMiRsdj6hqUHdPHWphQi4CxYdaqv3J+BhL1TVmNp5sNarXeMrjNm4r";
    b += "R+IDrfRuJ0HbRa+0xOOtxh0OkLWozmXaixF5E6Ut4niLu+0u/oiroX3SH8vUjee4/TLReHFRGiQ";
    b += "fTkxlHmRdLYW6mNxulhKrEc3G0g6yGhTqJaOD+GU8jZYohbdQxPMRuUbUnkWUNTNJlDPW/ET5ck";
    b += "+0ZqyrRpTDuuxpIqKc+0ApIsqZqzgLKRKcWRIJzlwRCQ5lIH/u86x5kL80Ehyx08eFKoVJT+MG+";
    b += "VxHY4m/0MlEMV7wM6nu5R1maVeL4mp6vZ4dHSrNRXHa1UT4pJ2JP8T64vA3m6FVytHUK4+9GTql";
    b += "wM466UOlVx53S8HZdAbO5EjqlcfZVAPO5FDpGtBbnltmBnZIMw13QRbeZfk6IdS6Cy/i6XhDxyM";
    b += "NXckwCBsRUqXyGKnnMpAqZ1ZZSOUbiKz9+nx4lVaztB/0baF5+fRpUQZO52h4EWids3GHBWFiXz";
    b += "qOsdRiUlvS3VRyJV94MZnnpGmepaR2NTd3WnTQg8qgVa8ERievkRKYzanb9zQMRE6urglNbanfj";
    b += "sgp07UhKzposusPmbLbnkv5fVkD11iTrz/g0RMkOLsACfY0UqAcUM0xcZkDWAr28IBHSx3wWHMd";
    b += "8CyWGuc+tbqSQb18cuyoP+CR46UrIImlYDTGJn4G1OKN4svHZqURm3JgdW2w6VbViUX6eOkaYTP";
    b += "HOl7FVac9Q7o61IFN4Xqt+K11hnFoDR7qDMn3V0Hy4ztv2KjFh0t25ffpk+2c7AaOJykznFLB98";
    b += "04hV6Q22B2BK5KGeIUL8irlBFO6QkKKmUMUjSs2fYsqcdBoeRwZJIiOSmdw4grHaBIniPoARMFG";
    b += "Ue4ykpc5VCyyqlklWPJKmtuosrJZJWTXGVHXOVIssqZZJXjySqHklVOJauc4iq9uMqxZJW1XKLK";
    b += "yWSVI8kqZ5JVznCVPXGV48kqh5JVTiWrHEtWiV5OY1xa/BVgK7B3/Ovlf7z81cuX/+UHDz0fWDv";
    b += "+0x986/Lly79x+dcOSR2Q09px+fJXP/s3ly//wVopbmLisQu/9Ss/evbk8P/WZDgGpv7Gzx85+t";
    b += "WZ//Zfz0vqlI6pf/THv/i58//8Vz/8ZUlFDcDa8bmvXP7yz33hdK1TUEDf+p4gMcBfjB63Aqvfs";
    b += "4At8EOmG8wxqz8gwJiNTg03mFNWkOfvARMrF/qDUn/gLDCmoawx1aysMc2YmWMys8Y0aWaMCY8R";
    b += "gbuAvekrxDyyHAwID5hxhKaMqObQAjnNeQpeHgfdQl+AhkG3EgLQE+YG+u6sSzW4/AHt/qDSj2j";
    b += "Ar1X3o9fHcJRroQ/JA887jMOFMTNiZmBmKHO2a5mYmTGyMDNlZGBm3EDMFAgzw8lR9wdt/PlvHE";
    b += "tecDdhCu7KlGMZka9BuMP3exHW6rUgzlqpsC0YmXT68Y4VUc7fL8ecOZK0/UJUQw7NBX64fQO5D";
    b += "00gd5KRuxxXC8SmSXOCHvwEv2PmleB3zMjA74iRhd+hTG6qZeJ3Rs/A76SO+G2hcY9yf1t43EE7";
    b += "DZvGUpQZGFQz0EY5VhDhmTgDy2UGzhkyA8viGZjSeQYGGXV5rxVnYDlVbyuc5XBOcrS+kmdHpuA";
    b += "8zwBN0pRMUpmJgbOUmU1kkkZkks5lTNIUNLWyP1jVH3TAbNGsGERE4YSh5mncuJJ5Gtcz5mlMz5";
    b += "qnET1rnoYypV4ta55QsXcQ7UhX3N82r0LdXE0jp7FUZCaH1Uy2U45OInaayQ6ZyVlTZnJFPJNTN";
    b += "JOrZCZhU5ucyVWYYy9P5DCjt+gtx4nsoPZtQepMDmed5pi9wzLTCSsV2RFpcq6ns+Z6JjXXo1lz";
    b += "PSZzPc2dWZmc6xme667+oLs/WCO0Nq4TTYfndDXdk/qVTPekljHdaPfQMNu9WZPtZc11pWGqcSM";
    b += "2rakePhp3MFiLCbv6MQXnFQmXR9JO8yAMOwajdIAdmVRGFamsjklliEhljZDKoCKVzphUZgwklW";
    b += "4hlekMUpk0ZQlRjNYRUcK4i/guItnwt9QxwzKmVaGRmpukkVNZNDKeopHZLBqp5ZI0ciqLRsaFR";
    b += "mbraaRLiHxWEyJfxaUiGSGkg/tuBEO5YB0McznjnVxuA5I7qDoa9qSLvKGGPehmDHsoNeyJrGFP";
    b += "poY9mMsY9lBq2BN1w/Zw5Ctl5s6lZk7JQYO5nKd/1khOv2w3ajT/XUJDwykaknV3RMdZ7vYcRj4";
    b += "TosPyBgkQsmxHilyDtMsOYDGH5a3lHCs2m3jkn/PWAZgWXsA8IFhWEVempSOWPVMukr5C8HAdgm";
    b += "l3NOLi6BWCz2UheIoQ7AmCh+sQvAxxXFZ0bwj23AT2ZnTEXptiHoW9Mmcp0QTpiEZHaGVUF1pp4";
    b += "yy0WetFilihuFgTLnYEv5vNCh42eisJNXleLG1B5LQriFwV8/yMoIa3L6OubF/sBGrGXJyVZYKa";
    b += "6XrUIN5KamnQM8Zd0xE1LWrx1YXqSpylgFk8HD8tSuRdmOVCi5DVZrODpnt5PN0t0Zhm1Zh4ueK";
    b += "9WZ7HJATmCoHZUYdt3gjiLOiyr3AT1FfBIZVlnntkmgsyos2mR2yNs8h1orkyV5aXvrRS3mhT2C";
    b += "FI5UnabPaEPXKkrfM5KmjZVVae9fgM1cYDLDzo9nW0j+MDLKPB/MTA8wEDzwd0Oh8wQzz1xfMBk";
    b += "49QLRMbYK2cdXTHg52vRQcDFiGJkMkHA9gFF5sUExATDwZM8Xs9lG/q/039v6n/N/X/pv7f1P+b";
    b += "+n9T/2/q/039v6n/N/X/pv7f1P+b+v/V0P/PHV1Q/8cs4eDnm/p/U/9v6v9N/b+p/zf1/6b+39T";
    b += "/m/p/U/9v6v9N/b+p/zf1/6b+/29V/z/1Uwvq/5glnP6ppv7f1P+b+n9T/2/q/039v6n/N/X/pv";
    b += "7f1P+b+n9T/2/q/039v6n//1vV/2s/u6D+j1nCsZ99tfT/r/uGK04dTdb/2QuBLUPqRWcLOjpn5";
    b += "KqUc0be4CiHixSrVESBI0c/TgSaEtAQeYScij7gQSkEGTeSVQGnSEWcg/FyQsffUT0w6zwnWNZ2";
    b += "rsLXsceMFSAJpFMz9smZJ6ouEhv5eYUYdNDgm56FiLHE41NqNrlzPKP55BsdhcSMQt1qRhv82xn";
    b += "k384g/3YNXedJzWf132TvFjiM57j/6NiTdR6a3LnHwNWp6fBzyTGR7wyaOzWm5AgLD4k/JjUomu";
    b += "nhjDEdpTENX9mYXuacyA6Zu52TDhyhDgxl0sMrhlPyf1iHyyHjSnA5mIHLwzSUwWuFy5riLHY4Z";
    b += "JA3OoO80V0bXGKVoUbVKYSBtMyzo5O8clmVR5dVXAn0SLmsWhJzNrixM9CNnYFu7K4da84YQsqR";
    b += "P9IYGTNLQsbMFSFjJgMZB/Fn73zImLm6yMCvNqT5+kn8eWIeSpy5epyAVeWWisepDDw+hj+PXkM";
    b += "84lEcVRqtoiP0HSc893VlSbcSpAa7EPyIfN6zFyIzcciEztUUmsRPlxWhaHYBFJ3LQNEH8OfhTB";
    b += "RJf3Xs7xWiSHAjmEqgSGOUiFdR9emwOlGelCbavGJ8MmNED+HPrrknXbtaZDtBTDNuxExzP/7cO";
    b += "yfTaFeN1JaCs3o3ewa62TPQzd4rj7It9Rjbij9brgHGQK+glhPuMIGDIIvtW4RJ8y5ohz1hWuj9";
    b += "0lJcpbxiEjal3hibvY0EuBF/eudiqd4MjloAoXNyE2pS6rt1BjrdM9DpXtbOPLvdpXCyw4KOPF/";
    b += "GK+fQklbOoSuS+F4j6tfjjzefwB96pTZQ13LkHY0j78afjtf9yCuNI2/Hn8q1Grk4O7X43J8cIk";
    b += "brsdLRZTCyMmdL4bldDlwLuVGneFj4o11Jy0uRHHTpul4r/tk6o/uQhWce4wX5Lmr8jxtat+sua";
    b += "ztbO/gqWAkCCq7zgv7A89a9j8L+c966hzHDDVqn3+bpb9Y7fAcnBz1Y5quhFo7olV+1Oz3nhR29";
    b += "n9nR+wOet+NQ/yef2/Gbn/vitPX8jtrPfGXkpNG/wxs8Hthh5WBY+bjf6jkSynMtslTo/P1Ey1u";
    b += "3zcCPkVjsD5f8Za6DGrDb7PbS2i/Nj6C/R38Ffs22z9Cy+pXZgN/YgI8N+KoB/JpBupFObmNUX3";
    b += "QjQWMjATYSqEbwkxiZjUwa6DLXwgaOSgM7PlWr1SqbzVkT5jAfHrqfXBrPwpYPiGQPo7Pyozr6w";
    b += "TRhU/yjOg9CBdEcAYNFKN0aam9XpT07vHzZ3Ff5HJeEylqlskCHRKlEgvSdEQgW6TsuviM9hyGs";
    b += "iLvv9BnDeaE18gg6aQQufuvrvq4AlJEHoOVcGZGYKxnFEn+xgCrx9QglgLCcbzNfIANVPAse1aD";
    b += "sFapBHibaK3uVncAc5Z37/QIg12JWIFTbyBE2YriAfJYLv/M+mI5ciG7Vq+FRaAtJBRLw7Aixlc";
    b += "MeY09nTWgp58Ef9FUPN+xEuodyKOSQc4A7wkOAIr3Ltxhd0HMPqxFk6vz9l37cAx3ybOx63svhw";
    b += "74HlRHmfZC4KY60vLZ7LZwWKN6K9TrhhgfLNuIPWwREy6xCVwIgCvpyBeILhMc6RtImQ9tReN5b";
    b += "B4yLRCcI8YDa/HWAl34WEd664+wG1kGc2MQyEIZmnSLPnCbf68hjD4jSuAd57kFeenCCHP4zjyy";
    b += "hG3nsBnMuhKEbeWoEmcxzsQdt0AOXe+ByD1zpwdnoAzRL6oGLPTC4By72wKVGkAPlSw7MoMhn1v";
    b += "5gucib1ZCp0meM2JJHJyZDAiIinnComMotTD3hCMhI557JpXJ3ce6ZnIBMyJ0gFvqCUg4fM7mgH";
    b += "ai1HWjVYb6KOKk7xk2FaSUfz9caaXsZfZXE9lfic8LxVwEGi36ZyGxuikeTNMQTINtspHbLc4Xa";
    b += "rQS1w/SVAPmX9X2hjv10oFYd+DYP44eKPSfJ6y7xenjoQBXWQWD3HM5N0XN3oqHKQuzeqeg4dKF";
    b += "JB/k7563CP8ISkNTqBcYHE3TF40Me5tHdh9KN+TU5yM5XZpBeCeezhDrDSvyDMRLbrCI2mXuMZK";
    b += "FIq1LWGHPUNxxjbs4xOsyPbmKMq6E+NznGXN0YHR5jbid0dXFjdHmMsB2EMbreMvyjVQTGuJIk+";
    b += "txjFHE8xxidaIzOnGN0YYWCqnKJMS6vX5jc7DG6ix9jjseo4xgTbF4O22gb75WrAO2t3qLhpRwL";
    b += "5xJenPMK9WDZg6xQuDjXQsVrB6/ii0aHQ+jwutW6jnKKl0nqXE6W9RYItRDRkfhxaVl3cVlfhzx";
    b += "f8Cr1NLFWFvIORFYBh97hrd0J+9uOhRdyl1cLt34hT8ltWMiXManECFrUEu7OvYRnMz2aKb09xF";
    b += "vJtrd30WqNIVxceTk3o1UB7zJ5dwFKjKerjgULdEx642RPWd5zMvYVEf1CBGnowTKoIF6xGh4Cf";
    b += "JYjjeoQbVBDIQj6ehyg2vH1GzUtvPlu0qQ8B5APWaDTlKwTDdLyUN0Jxe0QD308C7en2GEjfAtl";
    b += "IOUTT/+9MoKKXhG7YYS9COU9DvQMeLpIoPugh5B+q45mEsU+A2MGbURAewFtphXywL+LZ0Cd+5a";
    b += "pUZnwyFdUDEgvPPzPSdgAwi6r2LEoxlIDqZc3FDneUOSiTRVuIpDLX9ZGIpfYyqR2lsjcspcqcc";
    b += "MlbrgU76Wo5TUvs+VSYi8ncgRrp01Ui9pItnDTLdx0S7yJoqYrL7PpFmw6x023YNMtVDvpL7AxS";
    b += "WxOUD8trcJJSE5XScUup2IEa0nBWlKw9KTns2NUzknCSmX8P92HUgl1kFKhGF748he1cHN4DAnt";
    b += "vKUVw2OY0Be+9GWVMPslSOgOj0QJE5iwJpz+kkr4Sc5xSiXEbV1O9Rtj4VEIhZ2cQJmdVGY9lbk";
    b += "n2elf8IzOQzYq+LVlZNQAs0fKgZi2V0lkgHhgPoKNay4G5GKAOxegtD+zKgfoAaZzSL+Hz1pGiq";
    b += "CN4c4d9NSZPxwHuW5W+vEYooinViBfPI7XSrg8FqP4GMRdlNsSn4J4CYlX4kNlvLyxozga6OuVm";
    b += "+mSAy33KaWyH2SURj0btzho9RmnJQhLwYQEgRXOSBD27JMSbO8zzkqwo884J8HuPuMlCXp9xpQE";
    b += "1/cZ5yXY02dMS/CGPuMCfvVpS3UDKMPdENq+B0NrIIS2ThBcC8FJDq7ztA1Gr++xWSmfdkE6nvH";
    b += "wSyTrODgIwbUcxJdN1nBwFjDQTUHP22zOSA8eJRXECI9Rhec1NU9krwgp04mUE5RyIZFCb6XgNW";
    b += "mUcpJSLiZSTlHKbCLlRUq5lEihV1Hw1j1KOU0pA4mUCUoZTKScoZTDUYqGNhAKkcMcREyO6BEmR";
    b += "3WFSbxRxaDHNo+QcEqPsYmviHgcnI4ROxUj9lyM2Em7GqxSqAWUjoMwq+ER/ICD1Z5O9HiQUiYS";
    b += "KYcp5UwiZYhSJhMpRyjlbCJlmFLOJVKOUspLiZQRSplKpByjlPOJlFFKmU6knKCUCwmczsQ4nY1";
    b += "xWjMinA4aEU6HjAin56iiYSPGKb6jJDhFDUlwiq/eCE5PORFOxxw8qWGcoq4RVLyKVwhrP/RFkB";
    b += "AtwNOt/AZU0Oa1QfrMYUxHXr8Nthdlj0M0GyOwE5jC2ThPHTpmxGOdppTRRMoFSjmRSJmhlLFEy";
    b += "kVKOZlImaWUU4mUS5TyYiIF31PS8JIrShmglNOJlEFKmUikHKaUM0Y8G5NGNBvnjGg2puLZmI5n";
    b += "YyaejVNU0WxiNvCNLpmN0Vw0G/jqmMzGcC6ajaEcbrdlNsYh4iAFmAlupeoHEikTlDKYSDlDKYc";
    b += "TKZOUMpRIOUspRxIp5yhlOJHyEqUcTaRMUcpIIuU8pRxLpExTymgi5QKlnDBj3I6ZEW5PmRFux8";
    b += "0ItxNmhNtJM8LtsEvMaCZksRvhdtCNcIuvzQluZ2PczgA6V0eU7oIej/OZ6Ocxqv58ImWUUqYTK";
    b += "Sco5UIiZYxSZhIpJynlYiLlFKXMJlJepJRLiZRxSqlZibmmlIFEygSlDCZSzlDKYSshma1YMlux";
    b += "ZLZiyWzFktmKJTNVdMpKSOYYt9Mxbqdi3J5zY8kM6Gxl3Dr46g7JjRz8Y/nQCv9EUuDbjiBXWkC";
    b += "WTA0qWdJKpfRUqVa0LY13D+E4KNda5TvlTc9ob1GuVtD6TqLwS1nGVRYAqis60uAC/MJ2vEkyeM";
    b += "dVwMRCMtHNSsSdVqo47rkDPbHHou8d6rjHCgqyy9J5lwWQZd4y2CVxHHg6WO4tj+LAEUG71x7Fg";
    b += "S6DFaDRqzjMarDSWxmXz0c4AOzQvo4gvJPDEO/hMMS7Nwzxvg1DvGNrqCvGdgKBURSB30n3ZhhC";
    b += "ALT+nUtrnarDdpY6irE87GhRkVcYK6TjMwXZ/yoMc36gw5HPIh0W8dWpoAuguOKNFxR0nFY8+oo";
    b += "p7Ht1oGGoxeNQ3M+4dynMlmhv7alap3gvLaUhp4R4d45xWHmJK2zqTZ7KYQ0cwrIcwlW6SH1yKY";
    b += "6rM349ES29ZWnmEDIWZ0HG4jRkRw4hI9pUjUV5MLeVyt06H4FkEEccE+7cn0rTKJ5RIV2+inZgb";
    b += "DCszawdQLC0mVUCCLZvZj0Agt2befMPwfWbecdvqG0+GaRE9BVtvXG54n28cYyjFyR6gqMXJXqS";
    b += "o5ck+iJHB3jXapzmqNoNn7G9VWwUnGxSbU1RjEu5AY6ekehhjp6V6BGOviTRoxw9L9FjHFW7xRO";
    b += "OV+aXJ6VNIoeYECIa4BD1SG3PcKHj3YlxnqMnJHqBoyclepGjL0r0koxGogM5Ho3smA7nvI6EeM";
    b += "NXzpdHktPADQvjjksdlugZjh6R6FmOHpXoSxw9JtHzHFX7iAs5b3UsML0VlDjiMtqkyDGOXpDoC";
    b += "Y5elOhJjl6S6IscHbCkqxxVS+sZF5hGyV9kk2LEJmbEVGbMVBE72VE+DjXoxWFtGRoCfGmtUTzU";
    b += "Qc4P9D2BtV7DEx4Lb/HDjdVNsEovg9BLGgWXoztHDrZD8CwHV6DpCAdXQvAMB1dBcIKDHRA8zcH";
    b += "VENy+B0OdENpKaSClQD/GUAXbvgH2EPDogf0DPNbD3gEeHuwb4NHt+/jo8AN8tPvX4aPir8dHyb";
    b += "8eH67/HShANhk0kN7+oHXHZfiv9fs8E9KeC7zjeJHyKORZBiTbusMbxNeMEnksOsvaoX9fP2V2+";
    b += "4zHIHPF+w6vjTMvS2R2E5krx/Ha+QmSu9d7yzhzVyJzyaskMxf6jCchc6e33uvizJ2JzJV05mKf";
    b += "sRcyr/au8zo58+pE5vZ05lKfcRAyd3iBt5ozdyQyd6Qzl/uMT0BmfIENX1Fb4a31VnrrQLj4Xgc";
    b += "XXsWPlfxYwY92fixHow1veaL6G7z2RKzHW5GIrfdWJmKetyoR6052Kwp1R6E1UWhtFEKDj+Ohvm";
    b += "8PLGKtx/chsYeHDgTOvv08xbbXBqmwEmHCY5SwjBLymPAEJXRRQgETnqSETkooYsJeSlhNCSVMO";
    b += "EgJHZRQxoRPUMJySFh33KN2D9PbTV47JK2VpEFOWgFJayRpgJNWQlK3JNU4aRUkVSQJJAwzoxEx";
    b += "oxEzoxEzoxEzoxEzoxEzoxEzoxEzoxExoxExoxExo8HMaDAzGsyMBjOjwcxoMDMazIwGM6PBzGg";
    b += "oZjSQGY25mbH3Sphx45Uw45YrYcatV8KM26+EGe+ci7+SDHpNWW1OeXAFjMchfx4W7K1nwY31LL";
    b += "ilngW31rPg9noWvDPiOF+45AMRwykefDjiN8WCD0XspjhwV8RtigHvj5hb8d+9sNHGF9j5B/0Oo";
    b += "DLJIVRDKIZvCFb5TXeMa561CYUPEXgrXpFQymP4YxGNM+IAZDHoCfxx0yCXQU/iTykNKjFoL/5U";
    b += "0qAKgw7iT3sa1M6gT+BPRxrUwaB+/OlOg7oZhKIJiSgF8xg2QLD1adh6hg0SrCcN62HYYYLdkIb";
    b += "dgNr3JjTSo3QmLL4g3YeeShidJlpN6vtewKyWEhuCT/yytIK5CZjLsJKClRKwEsMqClZJwCoMa1";
    b += "ew9gSsnWEdCtaRgHUwrFvBuhOwboZ5CuYlYB7D1ivY+gRsPcN6FKwnAUOs4oUD463K34HX91X7C";
    b += "KeA6V6iS8Jyr6fBehIYmLKRiTM1CxrdWKD3pE3IoUihDfCteEgIoK1Mpg3w7XvQuGMT8i/SagP8";
    b += "NOmQALuTKbYhA6xXoIgC7F6m24YMsLYFBYTdz9TbkGES1WuE7RIabshxlpRrAD4klNyQ4xxZFAL";
    b += "wYaHnhhwv0YE1AD8gVF2fA2eqd26C7kU5ogialsp4UvG97Iig7XqYExO0Uw/LxQSdq4e5MUG79b";
    b += "B8TND5elghJuhCPawYE3SxHlaKCbpUDyvHBF2uh4FC0yNJKYJWOI1lLOKQUNcoYxGFtoDcepDDi";
    b += "GuUsYjAnIAq9SCX0dYoYxF9eQF11IMKjLRGGYvIKwrIqweVGGWNEhZRVxZQTz0IMCegGxZBjlom";
    b += "OWrzkKM2Dzlq85CjNg85avOQozYPOWrzkKM2Dzlq85Cjtkhy1JgcLTyGAV36x7sM89Aq1KVHcsD";
    b += "lqEuTI0Hy65d0JKiTI0HyzSeOBHU6XibXejmVUlOe8VyVMqQc2+VVCl7QOuzlTqdb1pyKoKs+V0";
    b += "XwYjOvIuhYMMfO8HS6jXRVBK8U8yoyTpCc1EYQicxQxJUyNrrJU4OAiKXaQT9+jqptihqVCvCyz";
    b += "FUVoDu+PDvd0/kaH10oBbl5XRDpWX72dHKIV++DSBf3dWknRLr4r0t7IdLFf13KDZFO7ut0cfAD";
    b += "a45OjgDxVZt+dkGBXvbwxQ3xxJfDtNgTX/+CY5k0M8YyZWSNZUbPHIueNZZKxlDQEyH234RlTUf";
    b += "vUHi6TG4BW/B0R9wCujA2eoVoAN9ysclZCA98xELvMeT7A517WmlfJK2EEOUmCetFb2+5xbmV0s";
    b += "n3X+OcmplzambiwcycUyMDEfSiArmjaxPvKbryjZRnXy5BBYfCI3TZVV4L4cxCfypYFn3mIaZcx";
    b += "pSLiehRsMTuZJBmLHEPVlDeYXR2O1QUJ4e68kxkK8c5ZcbhRITD8SvwmKfTG54NOBzLpKURIwuH";
    b += "Q0YWDmtZOEQHJTq5ilsBopNHLK6CZMRBK2FMxwEXyAONrnwXKp+MyzAH+y500WMOop1dmrk4JYq";
    b += "lWtj3j86uColo0ZFjGalQTVtOuC0m3nZyYpUnyiWnbwrrpxTWxRfRKsa6+OxDDjGuBOuTegbWx/";
    b += "UsrI9lcvBIJgcP6RlYR1egOnls65B3v3TlqKjIrnqC1YQnwjo7wNJjf4XLYqyzv8J2nAhEiSOkX";
    b += "omof1C5z1weYR/dFBKho6dHPGEuU2HxBRm5QaIJqqHPMZyNXHI2iHfQmWKbuN7SY3eLkXcvnX0S";
    b += "xhM2obwprkhNmLjmQ67Sr2TCprSMCWO3dvUTRn7t6uerN2u6vAwXdjp6rusEJCNpt1NHnX7yjCS";
    b += "uA90EcqfIdWCJXFPpynVja+x9Smfnm604NU4S4UEJ0VxmNJejSY9cGy5LiJ8KOq7LCeEMKsJZrT";
    b += "yD6ewfEb2ztTG/muL0LHInpysni2r+ThkZ84dOBuP5O6cn/ZgRIeD8idc5BwvsDWD6HHZzxt7my";
    b += "uSJSleOEZVXrHYmUgQop3vs9o+QOEL4VUgU55itsUcsnZ3h0RpXYoyVAEUofgF1RSQwKMdOrlak";
    b += "BDc6A0SSX8aoM8XvWjGBOvQoWIlQF/kcTKIO3RK2wRQx6sRxYRp1uxBzqwRz08oxX2fKXxw79JJ";
    b += "+sxDNBfiOB6NsVKEsgZlJobwJxemMbDuxhjmAOEQy8qrL8gRnyRAkJrGBrvHwPQOeCXGNV0lhY4";
    b += "T8vylsiGu8NDa2I0pXCDLENV6EjBb2/+YSxtkLG6CuXXYf4hPQQe9wJLBsGfu59NhX0Nzh2HGgN";
    b += "g90Gfso5CVJnNdFXtGISNB5nRsJuFHl562YmKdeREWLIEmc17Wq4RXZ0RstMbJFYrE4lKNla1b1";
    b += "cgVtLbBvFvfNEmd+vJ/Ki3wWT3Ouco5HnSQnh0Vh9y1Jp8CRb7dWwYp4+LN4o+G1QFtoN1CKeqc";
    b += "8vOniJC7t4c2gFwMM5eHNEA9vRt0X3g1829qIPbzpDa9b63Rqga9bG4vw8GYs7OEN3+iGJhs9vO";
    b += "lo79ZUzJqKWVMxaypmTcWsqZg1FbOmYtZUzJqKWVMxaypmr3/FLP3prUzFLPXpraZi1lTMmopZU";
    b += "zFrKmZNxaypmDUVs6Zi1lTMmopZUzFrKmZXWTFLfxMpUzFLfRPp2itmg13GSvkmkrMncNL+gRfz";
    b += "j30Id8U+hLt3lXV2IbxmFwy6y1vT73U9VDYh1P2c1/WessWOg8mrs+eg7hD7zrWV4+CuOR0H58R";
    b += "dMNB05DiYavFblcNdBya2C005W9FpVatyuIsv/GBPy+RfySVPm9y+OKx10H0VEBGyY+xu11Huds";
    b += "f02N2uQ181aXC3i9WCxse+dSvsW9fhb34kfetS6yARVGF0o+v0GGM6udwctaVrY+SkM3Dj/pX7j";
    b += "FH04WUGdljYWdbIO2APeigs+1Rzmd13Rc5qgWa6yCPUKPl5DMRwGVDxmYGga0ftyN+8ZNaCbkQW";
    b += "zA/Hn3+O3tXsrwY60Yodfg++MZ5/AKYTejlqkz9c5cbLhnbCC7/zRfICFNh3AfajTORkDWnEOiT";
    b += "9gRn2u6BT3clOieV2N3Wq2+uqBWuwQ91IPNCZ7rgzXDWQTjHQMeySD/B8ljvhOn9bCq1EczT3fi";
    b += "vktL2cXyCHZzZ7JYTFkbwS2tWgpY8soUs78YXbnfvJ7R45QROyKiA7FbBXduT2zWXnwk4VnSyln";
    b += "Qs76AJu1EaxiX/K9d/KaKKJUjO9ANpMNPwpK+iHwpyfiz0B5tjPpp3y12krX5Z27HG1gv2pYI3k";
    b += "2Tdf59nXYc++0PtSNUKVoqPYL1xXf9CV8AuHvAVUY+NEkZvGrqRf32Lar6+Dfn3dYqj74uYS+iR";
    b += "+pj1LQva91KUCdqniWcIp+Aq0Z+/xTBhb4a44h4PqCTKN8Iq/ipnlnCEg8r/ILIYEgP60E7k7mP";
    b += "VrloCMdG5hSDfy+Eu5R2UeyCtvPImdEdLILaPruzFr90CH/HZ81tBRORGzvxLwutxvYy/HXV4bI";
    b += "mm5eG318uwx867yKplpmmDAM2DdJknm4ic+yd8rORdsIWeCc9OQEI7NomrRJBTiO6lMRAa6wi6R";
    b += "J9SieHsFJvFzsWfPFqqCPKHCRqmK71HSOcFOcoe6nxyUEtXwMIBDgJFyOJjiXeW1SB8loI/QhSZ";
    b += "L6M3ThV0Q/Kkhti4wRDy+ehlDjLmEPb6Sb8bkODtemXF6y5BYlhVxe4l/MEzy1Vgh34xzD/OccR";
    b += "WGWWI/kC2JYa6CKluSwyxlD7O0+GG28DCNKg6zBeRfC8k/oXh3sULv5Q+zJemjuCh+mG1065s5m";
    b += "6VomCWezdKihunyMHUapum13Y2bPq+tCmnstZcHXOfI3GFH5iRwUcw2+B1drKglp7jL0g7MpVMF";
    b += "bzl9GURDT6tloi7cOnAvytyLMvYCZNhJckKK0r7Va8Uu2HEXZOWTLsTLsupCOdEF8kVcLrIgHpP";
    b += "lWienbtHi1yErHi8DLOn0rEnPx5OeZ5e3dsrlLctCmfG7yzpuAHSoqgidonVa98wH0Skr7M7Jg+";
    b += "0+pBJ8t+i+8nKYpEKVtqOG38rd8Ar0oRHeOBa81ioMHafbx0fsGTeHvostz4qd4hbgn74HIg+IW";
    b += "92wlzzqimtc41D4FuxUp/jIBWgBO0wJlLkgmcPeIi+LNVyRYEWsqLXxfuz2g/vLGrWHXSyokZRW";
    b += "IOGZ4ZHfUz5Q0av8MRVTTklPfqXObenpr9Q5Nj37lTrXp+ejBHGOejFKSPkjDb+Grky7Eq5Mc/P";
    b += "4ZM0vxgfs5UYfsGmvr+UUrJyCAV7Ck7+nYBg7nYi1ofdiQp2BMZgHYlicBq9tD/sshn06eyQuJD";
    b += "wSO3jvgx6JyW3hAFZZs6SBgd/L9Nu6gMvXL3QZaw4Z5KAlx1+nNdg5Ox2pBU7kV9WqvJ89fOG3t";
    b += "Dyr8knx32VK/DakAPjH+aboa3lYEZexyB8Unr/a4cjsOH1ebYrSW6N84/TVzBmdXv2lWkYMla5a";
    b += "RI9iZiIt3Wot0SqdpVOrnMq/dAIMebEMt6IJDPr1RzhOScXBF+iLF71VyYf7n5FvYt+519xf/NU";
    b += "oRSPvVigOxv8Pj7AmI9TYr2dghb957CsdB9D/IHkYYg+XHDiiAkMqcFgFBlVgQAVqKnBJl8CsCl";
    b += "xUgRkVuKAC0ypwXgWmVOAlFTinAmdVYFIFzqjAhAqwb1LP2p/9X4Du08lhw75wHeyt93nWgT7AA";
    b += "yyGfKJgoewHpQXxllPLqhOOf2Oc1LoDHhTJHeB3IJEswo67ybc3znCRhwhtaABI0ijOfBEPJIBi";
    b += "TAktgk68YmLGOOSEU/+cnkkuhfI2botjn2R3WaBVcpw9odmKH7QsyuTUqUQL76cyZqoU/mqpXjE";
    b += "VGpK2UC3UKnmQCKLuOJhkS7fRjZ8p8TSimAG521gmyVBTiS5IPiONKmolAePSeAvNLdwW5eHfMa";
    b += "eqJkilVn5F980U5mCj/S8xD7LXRCwOc4Xpga1kDfv6c5AAiYVvo+8BGLDLM/cE9FmsGQuH3WNMO";
    b += "Qf2eeYB5Umsx7gogPPOAc9i0HkBzQpoOgZNC+iSgC7EoAsCqtkMmolBMwIaENDFGHRRQIMCmo1B";
    b += "swI6LKBLMeiSgIYEVMtFoFqOQUcENBCDBgQ0LKDBGDQooKMCOhyDDgtoXIZci7tRk26cFtBADBo";
    b += "Q0ISABmPQoIDOCOhwDDosoEkBDcWgIQGdFdCRGHREQOcENByDhgX0koCOxqCjApoS0EgMGhHQeQ";
    b += "Edi0HHBDQtoNEYNCqgCwI6EYNOOCADC8pnOhA4nUjxtxqY1E0WgpDfPiB+1KsMxMwOf37Bkcx2l";
    b += "NmRzG510TUXQlhXC2GHePxMMiVwEEnXwI64NykRbJIgUw2p72duAyw7Pn3G75yD3qNgrhx0HQXT";
    b += "6aDfKJhxB51G0ed/VhPdOOgvCkjLQW9RPcaLjk8fQDzloJco4F6iRPQaj8QKqiHRM34ZHEk+KDF";
    b += "XBGVmHFCviLeCVmY/2M4ShwZtzMTBMubzYDkLgsBJrl94co3H17x+0QSOAdoPII6DteTdwAkvX/";
    b += "7mV7933wsegU863nIALz/wQj9IpP/0B88DYO0L/eTRqB99TC0P1x301h0P9Wf3i7zBGr76WaxhG";
    b += "fxbc8Az92Fpj0qsOx4swxLLucB5LvCty7/0T+jTAt0idqsC61SBNiywjAuQbEI/il2cDQrjbeqh";
    b += "fckCFSzQxgVIYqHXv86owMjP/9avOakCrVigwgVIjqFzwNVRAbyaTbfQggVauQBJN3Tj2BEVGPj";
    b += "xP/m5dAtlLNDCBUjmleDfqqgA3vNaqQIlLFDmAiQJ0Z/pyqjA//PVvzuXLpDHAiUuQPIR3ZCuiA";
    b += "rgpbGZKuBigTwXIKmJ3g/bowJ//XMDk3qqgIkFXC5AspT9yUGiyYmHc/wdZmJTXuw62Qs9cTUaj";
    b += "NmVQ+Rv0fRsWZoVg6mFmtiusqVTIjUBOvQV10Qs1CHUr3LhhjfazpiyGbcTm3HWASAFT6tps4Yn";
    b += "7kEOD2N400sfawC+c5UoyR9g5yk5FFMuHvpzRrfK3ynKq4xulBH9VdfXmItr5L2fjcLJFuHEH67";
    b += "GHtksPKU89neOHtmpHmHGOXpkp3oU19jQo5S4RIzqLCL1yhrylrnmAMgGcj7bHzmf7ScNgv1r0i";
    b += "SIG9ohvBDDTaNzBZtho0qf6CkW/0On0X7IoYu0/0vfE9jrtdCjzbUdDpGtCn1VJ+zfV6XP6dyo0";
    b += "cJwEEQbY1YyPQ97Z8lk1WfC762En5r4sf/573wr/DSI6Rx+DxDXkxNDelD2DQyOQrDgmyZ+vgoI";
    b += "HNa8FzwLZOILXu6F58j9HDuJWQV8dMBbRVdqRcQ7FDe9DkrlOH7iTz+IR36Aw/2hfsDP4+7/Wfz";
    b += "uFbKNn6PvBcKgPEK/jU2ZL+y4/Kt/9fkV/dzQc+J8hqrCOoAN1318fwBy5wXIDv2BcTxP7vC8jh";
    b += "04tsLz6GUPooUXvMjbnr3JODak42MEHh3ROKD/36IcA89RHTy01SokjQfGnj5EEWJL8KawCIvYH";
    b += "hAPkAhCXLnO60exAHHlPA99BKIk6TiOKA5HcKagK0eHdL8Lb03If6a3uv84lKOK91WTU2Ai8i0c";
    b += "Lk1Bop+E7NWJKUBiXJWYAuOKp8DEdhY5BQWaglU8BYTzVdEUdPOMCP67VSByltjlrYpnYfWiZ2H";
    b += "0as3CJmO4if4rRv+xq4f+I030XzH6Rwj9sINglBt1CO7YhlhFOdowFx2M+21I9WgoplBuKJT3oT";
    b += "iSZaRyVof/sRXY2VB+TofND8X0yqdRjgGIP9lNXy41nqxCh2rr8TjbqPw2uc2fkFM4jl3Q8LPBF";
    b += "J5aLx914tXWYo/415MqBNsbjk9d0NIJQ3+roTNCQxJMnDszrPDc3aj9OGDHfBYPwTXfoI2OAQsx";
    b += "ZlHfrqqqkBuFSlGoEoXao1BHFOqOQp6EjDCPI57Q6GIEqCqPruqfq/p4L40aoQO7Fli0gVx8A6e";
    b += "NumTy59LUvgCN4hxGXs6zeHdg7PPKsq/CjxcGZTy/LGDuAt77R5kKUSbY6mA+r8xVWrzbSdRk4j";
    b += "bHlL4qom+Lt2GEVT4fDgzc4NDW1aRvOGPcDsf/PX0YEggBA+VwK+iETBV+PjRBCOggENb5JdKED";
    b += "yFicvvIC7H5rN8CPSpUMdSGVyOyY8OLGbcLdnJtdB/iwpbca8Hgfm/Zs15pH/TXfhali08nPTiv";
    b += "+rOBs4fMdOxwbIgOba/VBAOWbwfy3YcfvPasPfv2B+3hun2gCONWs7b+ySpN/cpo6lfUTz1PvHQ";
    b += "cv0bSyh+jXqnmvzUx/xXZHVr4vSNVZDm5rIdHq1eJci6XnEgCUU5QE+VL115rXZ3zUAJqcu2Ac5";
    b += "I2TAsmf+KCPNj2y8E5NhFqlS66TgTNwu3ydbJRCWBzziTlaZWPzvUb3u6XQovmFV0ADw7xDVn4v";
    b += "WwKowikwARSAAKhu7GD4TbsFVMEigAihZKw+qtBDoeIHEpMDqhT7kMDnBQ5LIvIoXUBcgClmK+Q";
    b += "lylyKCXIoSUmh5aoSJvXhkXa8Io5ytmWRQ7skBCdj3qlujoXIAf3ysmh0EAOtI4MDcmCckQFhlX";
    b += "gqAqMqMAxFRhVgRMUAM0IbQ5PrzE62eZwTN107dA2m+d0/thZBQ/46AUKjg44EvhNSwL/0ebrKc";
    b += "q5A78WQR9a+L5x/gRgDWOTZJ6no1UlnnHpfGh0Vg9sNF+BJW8P6a5cIX5zg76rR98uCxw0aZQvO";
    b += "fG5Nn7GzMVU+SDRNKWOQmoOU/mLRTiIKQuohYq6/PGinBcDR6gvgwYfeg8YfIdSI/OkizbDfKtI";
    b += "B2ig/4X2QTqRQLttrAP5wMP2OFIB+RtFOoCaJWLQHQ0s9kb81Vw8S5xIYWRC5xO7M3rQihhxw8K";
    b += "TsCa44bD1pE8fG7Lkm+H0ET0MtjG26DvTjAM/xx9+85cxKvFFPXRXD1PzUzJZnFz5lsFTphCuy7";
    b += "f5GPoTdpQZEitfM8QsjA5+Q52+foyvkAG7AmeQGDX52x+lDQZNFX7Yheaj3RNIN+ObXjPkRn9d7";
    b += "iv56PKcJZgYF9o4rQfWg2WTRnKKegpFKz9OeV7U8bu9aABpommIHc7gd1xR/n3+tzFrj3EKv40J";
    b += "ou4WjRe7wIaNHvAwslDJLPLh8zEHPyQZ/jhQavhGJHLA8WmMDPzwuFb5Y5MOMezwCMbo9hobCs/";
    b += "/gIomkfSSmeKSH0MEj6WmeEwGdlIPVuAUm7iKTxtPkkwzyEyK54z7W7mMVYxSjUCTMPLIxhfPy/";
    b += "EdEhNtafBcXffj6YV6Kj9DvKs64y2jHtCrnFCI6Bi/jeRV+TR4RCdk6JUvYC3jdC0FeSt/azHDB";
    b += "SvlLmxVghGBPQP8qME5SF8t335B8puAeEtE+ga+c0Vs2H1crnMsGLtYnBo01D4DP5pJvTMrLzio";
    b += "TnAAJ8wiLve6QQnwTHrjj/i321vz0AveWq/7oRf6+Rhc3VlB/cJgwzq+rlkW7B+l+7IeY5hxhWJ";
    b += "2cACmehR+GD2DTDlDhI0jegpnJAwIcFivjNkNaALGNXx6Thh8TH/a4PbGDb+LbFhMr+se+iZ15z";
    b += "1d9A3qT4A0IYSCgIAwjxQN02FwbJFu4OuS9d3EHuU9mrga9Wgga+JWevFkdXjxBM0/NQ+SVfuVT";
    b += "Q2NYS3N0HM8NWthatbQ1JDZ+xzTE1PrLxlKsqCRT4uXKVAMr0GUTKVFyawmomRaiZJPcJv9Qf7B";
    b += "skVMNqMpHLEgwU0DyBGyesCjvpGfMPC73FY4/X2nmRz21skRi8aeJzlioXywwmORfJhfqpxMSBU";
    b += "rPB2VombD05FYcfDVRF9GWPk+R9BE6y0GYL3Fm8cV9wgmJzlXW+UvLBHgP2N5FcxWCAtVWEWK+C";
    b += "ajXyQrNFhmWu9JTQEIrcofGGnhPky0dMKhY171XacNMDSciyFDhLvtaekZkSttNSPTakZGDZgRJ";
    b += "bqe4Fl5MrBICkLf6Oe+Ll+jORKTAEPN0WOgtdIcwQygCZ8Z1i7/Fk/Oo3WTw4Tp8PiQSxOfYEWC";
    b += "n9Klo2NRR+mLssw6kFj583jpg0QQE2Tpn6S1b5j8BZiwF/Zp3y9fIvtAn3HW5ODDiK9Jk1ZenPp";
    b += "eqaG3zzhn8mdiQDfsFYQwSnYxSh7i3ZAZ9uJfhJAJQsikqRByvyLaCCGT3xKE3JtJrXZ6wnGrlu";
    b += "Q5nM5pc54JnzLVN23T0z1jpqZ7+x6e7VkzMdvbeWh3qqFNG/QTDW5LlSuSsW1tGNvEN2VsW+YfW";
    b += "29yre0NaP+2MXBpexn2Pokn87Dy+Vq8a2KR0JO9wN4QwBb5PmYGi9rvoQrwC5D0xp18khR36bD3";
    b += "ixIGKcGNEuiFnM1mTVhTWPiniW4wAURserf1f1LSkPdZqIHgxOiMf6tul+Xp8+6xvPotlsdzsj7";
    b += "IKbnYkd5fdaN9pswCDnicpKIezv62bK866uYCF1fQU5RUxFczjv3IIqXij8RSUQ9PR6Ww1XBgMN";
    b += "5rTakNUuV/mrHwshJMKjtYGPfvIU4raR5tjw0SKojJEfwGKe+mEzyKhgmk4AqLYnaX8VVCfGm4m";
    b += "GOytMQIsxhhGq8j6IfhwTJ+gvTU7wrCtLkQpsNulId+NjH0KTM8NhivB724HGgwkYp8eVWYVMsD";
    b += "ImWKPkWJQtlVLIFsxRlVAEUcrxKGWlmMhAJHSwwGKGUsxyaV+PHjcOAzqju4eB2J+gp4Ck+nYBc";
    b += "XuRwORBOP364NzycqccLzi6zkrFpT/9w3Kod01GIre4Ji/OIcWf49YG0PKxBCy93QrfzfTvi9IM";
    b += "zu66KwD+vvH/82HZOgibD5bKCF60BJfxb0CnOftZ1M1w/hzaVHnwY1D0KGMSjBb1gJa+JbfaOYG";
    b += "GigR1KNMI/Pe+b37APmRJNuA8VniS1WXToeh6oqs+iS5C9h4SrZuBMYe4l6grxnY9MhkOjByk/j";
    b += "hwWNg/sqv+E8ERh1PTCVcGjsgRoY9MOI+qGrfujUDzQ4+6JDj/MOGcKYBz1rT2BUftBR3Qk0fJO";
    b += "SUWMe5Fb83P/P3ttA2XVdZYLv/r7/qltSSSr93/usJOVEjguwJZHYjq46duJJmHhmeVgm9lrjNY";
    b += "s1kyl5aFfJuOOmJBVYSQoimoIWRIASClCQOmOTIjGNaNxQISaIRiQFKB0l0ZAClKAEAzXgBJE40";
    b += "exv733OPfe9V3I5dprQ46q13j1/955z9tnnf+9v52ckNov9wwUJc5Rj+wQVceJ2QwjKa5LXn8i/";
    b += "Sh2qmbHS5i62DxSjOKyOhUeFdZHw6TSid7gIIuQbGDrlJzWzyu0Yo0AVaL3Nf1Yp4iWfjKkK6GL";
    b += "JO+NOheXPaST4Qsz2etHo+/NhfSb6vHL1h8bzfzORH8SxVMXwif8Q7MZQAd60OeVWYSZSttFi3N";
    b += "72+dgqC5jloC9BA/bDKF1lU76dPFevXq2+CULlYU4V/D86lf1EoYeZo3Lvof35bePNTlyqAghOK";
    b += "5lkJgYt+WpZVDIqVDeYELqTZaPRTpCkr6QsLg9tUpyIYYdbyYeVMWHBFEIFWx/OwwnqAZLBGzYj";
    b += "YjNrTniUQ1rh0yVMl1lF5PVBtAwNyoUgLjQ1nkDdwj6UR3CTT+Y9KSn1qLeQO4SdsuBO6lU4z4I";
    b += "IJjnQdNw8GPKoJZsFu9FbOKXGcfz+t2zGUIowYlCMg8kyND8DbaI7WcmX2Hec+hL4qyIMTSxNHE";
    b += "zJrrKaXQDu9QrujRyexRWI91DHKxiWaMkMyx+MmGFRbGZYzzBsJA90I1HZCJLLyB98FrQDomEg7";
    b += "aXNhE3VnR2pOHIAKSwFmkUVo9VWMeIqWqqJmmm5mv07KVeYO2mfOjud1DOd1OvqpF6/Tortma2+";
    b += "V25NysQUxOdWpUJK5d6CNZZUXL+D1Yx8W4ycUy/+0ZjTUJ19GQR8yZ3Pkk1G+r6eL1NBaGzV5FS";
    b += "aJ4rSfA/r2UAEOpRRobIfOtlUmHEdFsw8Mc464dMhOZOvhGmTL1ugE9OEKmErX0Apm5j/G+xmXV";
    b += "Uu/1MoyVM2Tx4D37SZYmRayp+UKCrJWXLxYriS/G6c1rDqrWDNAa5APS+aj+Q4xay8ZTNaDIHQJ";
    b += "ao08yXkdHU7Mj2P0BZc5+BqwHXWpMyfwIwAtoDnSXjm1TPvxjwFzxn1nHGTnYNnQT0LbrLz8JxV";
    b += "z1k32UV4FtWz6Ca7BM8F9Vxwkz0Nz5J6ltxkz8BzWT2X3WTLbsyz8Cyr54rrOfIZ8lxRz7TrOQo";
    b += "PQuCZcT3H4JlRz6zrOQHPrHqOu56T8BxXz5zreQyeOfWcdj1PwHNaPU/CM6+eeTfmKXjOqOeMm+";
    b += "wcPAvqWXCTnYfnrHrOuskuwrOonkU32SV4LqjngpvsaXiW1LPkJnsGnsvquewmexaeZfUsu8mOf";
    b += "BatoJ4rbrKjiJn+rDaWm+wYPDMaM+MmOwHPrHpm3WQn4TmunuNussfgmVPPnJvstBsjI5tM/pEO";
    b += "FJmvIwWNlQCKw2DC/rSyv1PhCYtHHj7thaq0vz/19iMy4FZGVLxLzHjlWCTpiBSZr2s2ZrTMOCV";
    b += "9V6YQ+uL4OF66gEFgenoaBcXkXUk+FWNVkFyI09Yb4Op4slzVgafjf094WLTssa96E5T4oTLIKj";
    b += "m4YMZXdcyk3J+0I1ll5Tp6qOO3tmqejIfFoMjiqRUeWcnRgE6iDKiqOIg7KMYBkSEVK8F+1EEtM";
    b += "S3X1M6dpYG0qSkzr0E7nilvTYrJUhlEhiqrTvFimqpA4VSj/VgY0lLJUBBLcyZNlbs86qJUpum9";
    b += "o6e0FaEXrf949gqxmjtTvH/Gvs/z3Xzv+5gwnZepNrSVyb07QruEjHRdVMlbdv+i+4g+uwfaCT0";
    b += "sGwgsDLEcb+FoQ1c+WK40cRYzjprSfgZzObQxsUT84wgLYM4r7NpB+N37hr6bBp83T7pp8FFvbB";
    b += "p4IVKVklR50+BUGNiSlz0TQAtLJX5Wd5kDjZ7WmQiYeetvavvNYuqlFQI0IjmuU1Vm7ST78/+TZ";
    b += "vhSHwBmBrS+hI3T+vidmzttZA3V6kQWNsz5sfBNYDg/Mpzvm7FDOIt4h7Kg9walX8XoV8F+O3x0";
    b += "YtvBBkGhQVw1Fx3sGkMUpUQH4+5FX+ztYFzij8RMpuuJYEPpABuSEO9utsc3tPs5lxpIDzVzXtb";
    b += "k3DmwLayCqatY6dIu6k1tpm8bWp640KjDJCLofSkG01Qsg74ITFMXpqmDW+rCNHVmGsbdoDxp4Y";
    b += "4lYWmV2JauqctVQ/JiAJUds1mjapctL1N13fkCPtFMm7Rj20HL/+Zy4m+Ui/qEWAAAFjsgHT22v";
    b += "1PrWGdDnUs0DseQe4YYFbkHWAbay9aqv0W+Ft+510TdsApxg6o5LgdwSjjZqSOw7gbW+gW2Jrte";
    b += "h3BFFhZK8UTbMBewhoZk57EpZ5O+AXmHyQ4r5EVuYK1fIGVXfl2zqyK7qmTn5SNZnYVFoNLe8VX";
    b += "sBEde4aTjqbmelutJXM+w6xlxPVuMB6e+gAjBZV5d5T942WDLMlAuy4BblgG3LANuWQbcsgy4ZR";
    b += "lwyzJwrbJQIdbyaVgjHx3PhumxczxbBxXo8Ww9Pci3IW3TVJCN0IPe3UgPoKdQqYd54EzXyd5tP";
    b += "R7VdIMsC+qdKJR51p/ssBBPaLSCwMf1AxOpf4BBtog5yOMdYP19Vploso5sXRUSIEyaAs8CgUha";
    b += "PcASTUZiAuoWDBYBlYOMvye5ejj23z9JWQpSBYCdGIAomdCA5GHKN60id0p91ePY2sSkRtdK0YM";
    b += "cG9rYsBQrX/YnJtGSRUzuPTy+H/fpg8m5IEtYvJCosw0CGTS8cChElepUA5a3SxOWwvX4qAjqUk";
    b += "MTj1tD79B5n3hczb13tp7qrKEXBg9MdDYfAJLWgc4gxe/PAApXT5sH0jUTHfqFE+J/FIOzxgThQ";
    b += "nwvDdnDxB/EYc8gy98Sybciu63pNpVsfccUl+EUBW1/xylciHoPZ4lIDm9j3SzuZQZoo43pp4Wh";
    b += "G8NrG0cBIXDnBKkDIY10UwLl/Vq6kX5HkjEdCPxi3OGe3CpGEzMQROXAWr9AMxC0ugYCHwOBz3y";
    b += "PU5EiM9zzuak9pPYYkILPYHC2AbFPIKLQoim5ZVM6IEE1CWpREHWjtXzOFlK/9nmM6VOTuF9N4n";
    b += "41iVdbE1qfF7k9V1W24DJgS76R5WnXdFoMSSJ9hx4hNb5wKR4hcafHAFyJ6WeUUb2LR2tlHq2Ve";
    b += "LRB3JgQj1bBeVXwYpVS7AcuHPFu2iAexbNGXopDzCAPEBTjcGlDuZSPJPnC+iHi89Vwab2LS1ug";
    b += "RAtHKJ4dO3BwhlOzgbSZ3EKrse0/SJ2UmHFfJduaV6zufWucBR9rfJtBLvADRMO3sqHkqSmBQ2O";
    b += "qAA1Ok+NQs+YmZxC1rWLJmN+AO9uqWkrUsodMy7IQZpxuPTW+vyhQuTBqMntrV5moAdzCxEXZ2a";
    b += "ZzwMpTRQWsPLwtD3n7FIkGf6w5mp9d440cpvXGcps2dViDpF6yK/UFVpFckJug2D9bqCTf0aRd3";
    b += "kKb6cAy0FQEi5HhQSsvn22zGCWLvMO/1EK9ItYCg3++xWLb1j/dYlP06B/sX2xCdDu2/jmgAuFM";
    b += "Uv3LjXGG+TT+BfJvIF9d/bONcQYiNv6l+nhnI/kaJn9a2DSsb5p9TZN3bZxlNTVn9rXMe/F4Z1O";
    b += "6Pl9aQl1VZdB8JWYhKwEMN98CmJ3BLDBfjCCyzGJWRX1YXlmkKkyZF0KIqorsnikp0EbWqKqgKS";
    b += "GVAaq7jMtsyxlAHk8ELDaY8lHYOr49T0dM8Xhk2WgK5oseJF90FyH8u4lC7i2FBD1p2qtIM7CKN";
    b += "IOrSJOsIs3QKtKsWUWatatIM7yKNOtWkUbaBOnaxGZznxc2m7dsZphJGMywkbCWYSBhKsM6wk6G";
    b += "aYSRDLsICxlGEeZRFtlQYhHDMPhgYBuafRrmxPPvwCrSDK4iTbKKNEOrSLNmFWnWriLN8CrSrFt";
    b += "FmqKh3VBu5HyQlxq+aIOMPQCBA6SmBT9NgNNfBPQHvzHHCF00pPPQC2wCVsblhg6wisgX/5YTl8";
    b += "ZmiZXf5SrGZSpFPsB5dsWKQm/3S8wSpnBSh1LG8juG2RpfuHaFqvn033VXqNpdoVkmoUDcOGXlY";
    b += "P11yuoGr1RWTE01LV7pFelmNdsqCPNE01w7qBOClSm5Qj6ZFFeobxa+BfXhVpvPB+D4V6zTIV4b";
    b += "mtPc2hu+uujVP160D33bP/75aqo5Eyu0sbj60aZXxeJqKd7fqe6o+IfzkI8kO7RWnYCwAEMLTDL";
    b += "wIQSObuc9B2tJiE48LV9qcslPXJvos6VPPsvFChtHDBzEQKUC4MFIftCsyMcUhzBOHUyqyht5o1";
    b += "GVbMrnL9iTAwQZgTU3sNYvsNV9fBND68bJ9ltUo7SEsJXVuIZV9Do+iKnbmim6mehI+QYspmbUA";
    b += "etS2+dOSN9jHC5VAlwMIbHVzJMJIE7jnCi5Ti7uKWxSToViTecX9ed9YbUQWTWkrhZU9S2puwJb";
    b += "k12vK6lFGamJwwyWR2FY8/vwcw9+7sbPXfh5M37eiJ/X44c1x27Bzx783ISfMfzsxM8ofnbgJ8X";
    b += "PFvyM4GcYP0kBnc4XTKyEthIYGkZiDMfKeED6WB4Zl4N4SNm98o7NGV+JtzLI41WgwLZQAWGreZ";
    b += "gffWKBRSNAwmQb2jhk+01YvCS7WZQh91dIRd1xd9N66Dd5QNqFb0xoplrwHhiHESm3jQJNK1hBQ";
    b += "v1AmUQiIjeitlIEtVfvp9zuATqsgcZRSHWBOjBTUV4HUeWoGDTG6Qu7WnovQy2wixqBXcO7qE3Y";
    b += "NbKLmohdW3ZRi7Er3UUNyK4du6g92TW6i5qXXTt3UWuza2wXNT67btpFvMCuPbuINdh1yy7iFHb";
    b += "t3cWykWCiXcRH7HrjLmIrdr15F3EZu+7aRUzHrrt3EQ+y655dxJLsum8XcaiC23l57Y7wMIhB7e";
    b += "AZBki5/RlOs5bcgMsXvoNJq8kk9zOoY9lIHlbzdJLFJSo0mTf5rgRNvwTYyOYnh7xbMBQvVPd3w";
    b += "h3ImOdnA18S0QIhlAmcsR9xiMBBbATM+rASEN8j5IPK76D6b2XkoEFNh91xom/LWxEv1BN67tV0";
    b += "kP5i2y9QVtb3xrDN8xQGRzL1DWCibwATfQOY6BvARN8AJvoGMNE3gIm+AUz0DWCibwATfQOYKMi";
    b += "TNXE+bcIuG8cl41gyjovGccE4zhvHonGcM46zxqGQiawAplThzUkHB4lSf9hfEx/oi91xrH6B9X";
    b += "FbRb4g7yA+5J34erF11KnTewD18ZR82ajYBYHzenIKCbNXipEpOF9FTiFjtlPMcMB5AzmFlNmrx";
    b += "fQUnDeSU8iZjYnFIzi/g5xC0uw7xTxaByeN2XeRR8ia3SRmguC8mZxC2myX2K+Cczc5hbzZHrFU";
    b += "A+d3Q3hYnK8RC09wvpacQubsFrHeAuetkLEW523oaQte9jolE+7glEFj4wOhoflVU/+tvKitOQw";
    b += "v74YGfOm5ES/T0fT69JXpq9Kd6Q3pq9Mb07H0O9LvTL8rvSm9Od2V7k73pN+dviZ9bXpLemt6W/";
    b += "q65/5iVk0Dvl2WkqBUNbfjMkCjBJsqRTiVKcJuZfVcU/05Pp/pqhhDeQXMNeipA5wWfZXfamKVM";
    b += "UTjCT2G9RMR7IgZTd9BwbyU0Z58IZ+8tHSTXecwQHlJmYwPAn4oL05uUL5Qz44kVPhcxiD5pjQI";
    b += "9x0NWeLzHRMjuXNfCtmaovqK90yaR7iZEf8I31uImjWbIqhKUgA9yVKtoUu1hi7VGrpUky9WzXK";
    b += "twVLwulwDmhF1yLpOdSVAOckOOHkGCLAq5cJxH4vgNc1d44G0PpE2D4hdhxDxmtBq93typcQJ12";
    b += "rC2viqvqhoVrKAMkrmDVN7C0UFQRHzooHBCscLMtkcwj451MZX9cWyYvl6+ud3Cu4qMb+2qsv3a";
    b += "NE1ju9WBtVbIylLvB7wXBQ6nMgzUyo8HLo8DItAaZE7boKKnMX3CFD12WXG6MAZo8u5uhwd6rsx";
    b += "l/GRUu95hPtibMNbqelfiY0d7OJcbrvINLqFiPTMQn7IwENGvAIzCWu8yeiwAKxNqKBoaLvVfLH";
    b += "UdnyqX9fbIu28IsVv7rMPpMOCgykiAeHkalLWsf2oF2gKC2xN6C/X+MHh9RAYmI4MhrXaLa102Z";
    b += "2LuuzO+Wy2NCrbnRMNpqjL7pycDUddhudEoTnqsjwnOmNR2fScomLDOqlY2qrBKJdvjJTGrKoad";
    b += "qIpsf1EZXVLHveUHEZK4+6Sw0hp3FNyrOni3pJzaHfJEwR2FXxBCr4Y4EAfNkfF9F0ixkhhuM43";
    b += "pkeb1pjYFI/7l41dR5+Nj666dvP9ajcX9KvdbNC3dkG/2i37farHB2VserSJ52woprxGYCutyqZ";
    b += "IfWM4tG7M1jW4Qr5QoMVJ1HBoi01jCgWgOn7WocDCihSo9VAA2pq1bgrMc2A3BXi466HALId2U2";
    b += "CaQ7s50xsXTWlp4Glt4BRG3NiinegHisG12FiU9MWSaEEktTVaL8zS+WLnsy52BsEmQo0RY7Ytl";
    b += "k5wwS+ItOivRKRqbyfAkWk3kRhMsodIbA+rh0hzHNpNpFkO7SISa1Wznc+NXPVAuvEoDOa12Oqe";
    b += "b6x6JoZNhpicHgwCGjpe8cqWOdcyzwWwohgbZgvKdFzH7EnMtt52t7PGrOuApeMG2bAU3c1bPbN";
    b += "hedbDbIuVfsy2d38fXhvrx2ppH04T84oAD1BjjID/VdONDPvBWqeZMJeftZk4fsacNO9ldTzvYq";
    b += "gQsU2YDYjO8/3EsUNs+M83VjYHjf1ZxCdopbVst9A3RjbXGGOz0kpsZHMdrC2C2+Ubw2KyUFsJR";
    b += "jaHxb4hWFmaYL2xgMqtBCObaKUNMiRIRhuMNU9tpSuVopUedBppd7AYMhI9bmvbWp9WUZGiDklR";
    b += "+I3oZ1LskaK8PDZLSTcVRWyht5rCqR3LDYZXKfsLId+JKhn9XjLCxmRMuTeESL4aONzo9nc209h";
    b += "SVlYbk3UxYotC+WxjsikGltkuT8vmv4T8G2xR0DdGIGM3f9iAjNUCo29sQNZMP+HBawzZ225S0W";
    b += "5St3lcDhmxWPJQG46lPNIpvq+XLPY45qblfWBFQEmKo0fd13cHV8J8FKc3bBPw7QIysMhLGqxFY";
    b += "EPozPtc44wejDNCxisyUBi1cU6SX36fGGeEQq4q5+4XpSfI0cA4YyjGGSPJwljvkXwiwauIqCaM";
    b += "ViFGX8V+JKNVRIzrA9VBEaFjoNiQJWoq8kGrLTwdscnGNf7Gw+vYUIgniyzvZn9n1sFjNLsOjx3";
    b += "ZDjzS7GV4bMlejsdI9go8hnH2cLOf4NzhZr+FM4eb/RrOG272Q5w13MznDLKKpV0dhdLOOcBCMM";
    b += "y/fvXAA493Nh+CnM7m9IZDUyJtsuU2/35JW6PgVx2CKT8N/34Jb1H4K93wt0l4QuHXu+EPSPgwh";
    b += "Y/a8K23+Q9K+AiFv+KQkXLZdpv/kITDVuDLD6XbJHz7bf7bJTyl8JcdEijoqU56mz8l4TsofMch";
    b += "wfae6mS3MbQJIkYp4rpDaSYRr77NP6IROymicyh9NUfsDgDOwgjIgWpB5y3BbE/9m4kYoOLBzuZ";
    b += "TLDktgd/PFGbbSSITs/k2PlClqLdxG5SjcMJqkSc9pqAbjWPXrU50Uo7GWew2J3q4HD3MINhF9E";
    b += "g5eiQXbhaMd69TfZx5TEBpOjX2jQoUTKfOvh1EseJzKRG28G1xP25dWwrZIOvaZl3bDW5muF904";
    b += "e+fYDk09I2JSaXpKNE0mGB1+JRDVfH+bRpak9CahD6goS0JbUnogxqaSGgioQ9p6LCEDkvo2zV0";
    b += "REJHJHQKodSupxC2RWByAKaSBpDVDNPtHLGTA2oI2MYBoxxQR8BWDtjBATECtnBAysZvMDKgf++";
    b += "Q/v0y6d8vl/79Cunfo9K/r5f+/Urp2K+Sjr1TOvYN0rFfzWf1jxvIHTDkDdK5K0XnrqBzv9p07q";
    b += "2lzr3zkCNi5nTuV7nhTufe4nZWp3O/0u2sTue+3u2sTucedTur07lfYftqp9S5aTDoSPh15c5No";
    b += "8F1EnFjuXPTcHDjc3du4sRO8HjRvxt8T5HfxLip/Tt5hSevTlTqr7XeNLdgV79t5S5f4SUfzSm2";
    b += "52p0uqVI8BRLwqUrd/2KzMU0/WcrDwByY2S6f7PU/Vul7t/W7n9dqft3XqzuP7C/U5mgdcgAmy6";
    b += "emBR6h9L3KSbkMz4KDwU3nns/hUcmPFKxefR/Co9NeKz4YRgBKLxqwqsi6stjAIXXTHhNbmd5FK";
    b += "DwugmvC7bkucq4jAUUF/BYIOZjZTSAhNRFNh7URDRGBDEvyGtnCm4hGONCpyXB5zm4jWCMDp22B";
    b += "C9y8CCCMUYY0Cov+YDHSB1j4+JmnK5KxrY2woxNbdQytrTRytjQRpKxnY1hMQkyIhZBtohBkFTs";
    b += "gewQcyCjYg1kJ28UZgHgSIubTbQ0HaH16nosd7EQxgo5TVa4Zd3+cMefgLxt2phMo8k0nkyrk2l";
    b += "tMq1PpgOTaTCZtifT1mTadA19wGrDw+SbYDmGbQ9PTLIYPIOHjk8AEbo5O+w1cIs2T5NEI6umjR";
    b += "2irhE/RH5WSiGW2NyJaaf9Fr69rewCqFo1P+qp2kKVcdnUeaxwHi+cJwrnXOE8WThPF87HCud84";
    b += "XyicJ4pnE8WzoXC+ZR1AjCSxi3aaH/4J579yV/+8PJnKeDt2GKf/M2Z3/vJz/zIzx/eHTxI/r//";
    b += "wm/95S+f+vqp95P/beT/q3OnFv/r4l9/+LfIf79U+qwn99P59JcXKvlQcp94sXZm9yzfR+MC+6E";
    b += "8ZcGFWZi4xH0ltvVx/iXcIOZ7J8Y77XwvDv4qcghYwZzLj5o8WvJI5DEsjxF5bJFHKo8d8hiVx0";
    b += "55jMnjJnnskcctVIz/F4IU/t40hlR5nAcTtC+NgckavIVNbE9NZAMsdV9HrWoG+qYOiW7qawhsu";
    b += "oF+v8CgO7AGmXjacUAmfkDk9UUkvjsfMbdZyICzjWMM+TFiMYfsm/Z2V2AU8xDoGTyEMyFoeT78";
    b += "Gg7F1RJc/8J4dMEw6Zf+4WufevdvfennR4RHf/I/vOevzpw9/sW9wqI/+8E/+slf+fTffeIfK8K";
    b += "iv/1rn/mT9/7431zc0MOhsHlj2RMQMXDj6pIWo0Kfv+Nb8fgh8f0t41xDN0b88hqkGroZG5N3Ya";
    b += "bzBXcrzBizNOksYs9Yvd4/Fu72z6v7BLkvqvskuS95kv4xSv+0qah0rSSPH+4EyQ/QuFXF0sLPR";
    b += "x7C3hNmP5+t0nhH7ofz6W9g4ZmPPDw5KSppVaDUrSJtKGnftpq0NUn7wGrStiTtg6tJm0jah1aT";
    b += "dljSvn01aUck7dRq0sKEvPdQ/o2rV183QX2NhrhGVoPE2QtmA14gMC8cUGaAsgtCjiHkvIbUEHI";
    b += "cIRc0pIWQEwi5qCEJQuYQsqQhwwg5iZBLGjKCkNMIuawhW4SzDghrpdUbKsseM/lymdPAZLXVMl";
    b += "kllbSrYbLKDkm7GiarjEra1TBZZaekXQ2TVcYk7WqYrHKTpF0Nk1X2SNrVMFnlFpoGUkwDMdv6Y";
    b += "fvAZszkibIqE2VVJsqqTJRVmSirMlFWZaKsykRZlYmyKhNlVSbKqkyUVZkoqzJRVs1EWYE8FD9e";
    b += "L483yuPN8rhLHnfL4x553JeyzhqLRy5UqAINlpEk9sIMC2tEEUwRxWyKyJeFc40mMhPlMWGcqIM";
    b += "2yu+OmoL9J8QEGhPvsvbs05rAz4vkdfI/pWz19JmFihGR5v0wbrH37s8aru5ZFbeHOyrNLyV+dH";
    b += "gNzsaWQnMBOeOPm8O4Ch41Of4+LsE1mKmSkNMSknQaJuSMhIx0mibkLMyM4i1qRgm5whfcdf1EA";
    b += "E9DPBfY01SPvJgUL84Ezotn3Bcvuy9elhdHihePuy+edV+84r54RW6SZvxOg3dj/xq3Nj88PT39";
    b += "oH6Yb1a+8Rv/dPWD01/8sz/Vm4LjHPqO+Xf90fQPf+XEd2kmGEX2nf3ql8996Etf/Mo/aNILksF";
    b += "ZXy6gjvt8fzTLZ8VTnTYOfyn4ssdHzbjtkhNqCrvidapTetDbv3Bn+xbuTL/Cnfb6FW6G1Uzk5H";
    b += "vZc28MofZEpdVizfl6B4RbMGg/XR+c9qfk+vGKP8W6VIu+Hj3z8bhU6wLFDenV21mPD7xxd4d0i";
    b += "KUKpo1rV/FKpV8VL1f6VPFCX/rvQQ0HuIaLkvOAlnANynCGS2VO/+cMDQY5BV+ivFFIMG8usHAx";
    b += "AIUtetfXqp0OQK+aXphNBw6xppRKM4FQaUk+M6RUlsan76yb6qxXyr6dL3iwnlU6zayCTqP9yDT";
    b += "Sh0q1XiJxJqOdDRCg4hosGEKt4RxHuI4eXzfgmldujYctHS4EoGFTr2HmzW1Wy7l3PVOi0Gw/Ch";
    b += "1XCi1LBusshdZr4yxWtHHMFZfezrxNbiuHhPie0lfvb4aYqDQU2m61h2gt90uddbhrqNDOnLKix";
    b += "m5p9ZcCrf4wp+I6Xg6mWJlW6rjQr45nmQymjnNddRycYnG9qtBISlnFJfOUuce5B4QY0iu/5Ype";
    b += "+dWdeyi+4V+nV7djenO7QS/QdgfA0qiBOphD0DowmyE3X8uBjivDBetfCVCkQdM5Ardz8NVbA9r";
    b += "rQpFKl7AE3md5kESrm2ptTXF3Bwlblh7i0uC+C0Kh0kShDhTMXVM2k6SUx+5gREF+K4yx2jEwuS";
    b += "dCObg5HmYq5ZIvH6PZb/anLWS8IAPP8gHYMXlPhJRSfnOGI46GAhkv8L8LBln/MbZIIijxp8OMD";
    b += "8tOapZzIWTd+eIqfgMjIUaMGo9rsY7OngWCfA03ZtQS5qqsq5QLXLVQYGhxAiV48V3FEdDg+VAu";
    b += "5ATM+ILY4Ait3Dpkctgqp0h9WCT5uZDRiKunOp7YHRYk+Sofa3uMJL8YGukjAMiLLvHjDAuj6wB";
    b += "ZFRDjUqsfFFsd6I41bia+m6uquWPNwyDJL7201nhprfHSWuOltcZLa42X1hr//aw1zr6HZvHL7/";
    b += "k2X2t0lfKltcZLa42X1hovrTVeWmu8tNZ4aa3xL2et8V7M4u/9dl9rlEv5/4+1xrOJXxXU1yWPU";
    b += "diA48nAOSkMREEXjAeljIpbuUuUKWkg36eWSBetE4830sPbzfpwVxgDyJqyCliLwzFlFfAc4Ziy";
    b += "CtSU1f0w1+aN52fmPlKxaSETMe8G0MSYn3YD5oxnGnr5kGo47kZD+GHWDYCMxIwbMG08c/gArQp";
    b += "sFQvnWc+t7YIY0WAhBFgnS5M/gWw4gmAaA4WCJRCB48kA70ODH5vjZJf7EmV5Q+X+nM1l7AMcaq";
    b += "zoRW8HMAOPLdTG+7yZI8i9vu9176Q0krX/BhiNwvtzXvEBhY4MxEwnMT8wufp9RLLI3/4GwTKkN";
    b += "/aMMzHzhTmRhA+A00E/ezqhSsIDOyC8czOwL7mwUlEBseCS0sCEETHkJVRzt1GpUXUABlOsCSIg";
    b += "GMu52vumi940VLOEZC4nz7RDlTRaFVnROAVZF/qRdeF5k3Wsl6w34WfsGmRd+FaQdeF5kzUSsgo";
    b += "lGe2FvmXHCVa3UKKNy1iknMm+xt1sAfDtKBEVVwZbtmcsqWIlxjB+kmsQY7qbGGwhtMk0OSjEwD";
    b += "zFy2UZ+FYmiFRAio9hzjCbKf6C5xTfKxWfR8Bab2O28FPrLb9oi3wzraml1jo499+BlremWYeqs";
    b += "NGbtbdS1qug3QrZCzePjmuTR1oGVhoZvUbzQcD6W9d8C6Xmm3uO5kt7m28HftJrNd/ci9Z8WPdL";
    b += "kaua+xb8jDyv3L/5Fmx2T1r9wrDCwFwuwGICrweyeps7Mk/XeNXnzvEV1MuZ4gUlx87wDJzD02d";
    b += "Tpkhaffz2oLfDQcZRy8D+Qx0ovyv+Q6T4D5HiP0QWqqtmsB9Y/jtW7AfYA4mhEj9mtNXBDVhjC5";
    b += "qBAdvBCr0TMfSAgQzwrU9ALgxABjBx2uo3YB6BBdsZKIHCBAbMI9mr6QC241uwncCA7QzKHtIWw";
    b += "aDFWKwYixRjcWIsSozFiLEIMRYfxqLDWGwYiwyjuDA1cT5twi4bxyXjWDKOi8ZxwTjOG8eicZwz";
    b += "jrPGoWA7noLt8OqVgXGqFjwC0AxVBY4QDJhI/bcy1EJUgg4p4BwEyAHgJjUDAMLwDIATaViXJ7x";
    b += "swU0AReEJ4CKH9QcyebkFWSpATCLBZGr0IJl4Fh+ioR+dtngYXKSVgGUKmXeWHMOPwJIMKSxJbP";
    b += "Ak6ha5Q3tCVXtCVXtCtYSEYoHrqtfoDeUsTXaxi4JioEqwpTWQIgEw9BUGZXJ1KRWyTqD4KK9GD";
    b += "mB/JhPj8on1hLpA9dMGvYUPtairNO2HWvKhtAnQjBZQrRIkAnxIyyZKbCIaM679pTqgMuqCogeJ";
    b += "N+QdGyLXWctDEKF7qhKOF63hAK7UbcKmJqyNr+qLVZSkWgBqFOgqkTtMFRArMhINOj4D+tUfYmW";
    b += "gBLGC8UhQg2L2xz1AKy93gFZqBriFv1ZTiBSBxIrUX+6lq4NbQfpBC7xSwK0I7BCAtSMbW9Nyxq";
    b += "nAESG2raAr4J6qab/AQKREPAvAwqjg3THae6QQKaGDpWJBVyzMYsOArmBht6ovavuZGWa6G8PPv";
    b += "FtjWEeAlnfl5Euhag4sTySAi5yoahOhQE6Zg54yxyiKQkMSYXyGgPEVSjAs8P8YPCboAo+pCLbg";
    b += "KlL66M5+NwTMbyZ+7fBGnB6M7YdlGNgnNaZxrYlc3mW07ro93CtXFe272p5cUTTvakPrvoWDqtb";
    b += "d7QBYPgepf7e+t029d9+0/qVvbUfAm77RG+lEr/UAHJXsZj3+KL+fVTg4aXJ3J6DVSf4gBqbmvv";
    b += "Sd9GkKMN9ZqGj82yU+6YqfnvY0wZQkqPUkMDkckgRhTwLk4W2mKB9RtFYa3ve6d52i4XYcauTJQ";
    b += "3nyg/T64Te3ibP3HU69x/e97tHOwAzO6R7FiVySNr+3DRB6rWZLlMiJOhzd4uh87nBqvpYvVh7I";
    b += "509F4/nHk/+LPv3Hlbe0oe4ePkSeCx9Xnfe2Kuh11uEM9Z1UYFhVONRp4bkpbeMxkm49NAV8EJO";
    b += "2fUjSbZzKhtKWUfFrp+sOQW/SppviytegPppt28fmUvIlZHyjB6vU+/PXTTzeGXxnZ/2+w1MZcB";
    b += "4SW4Lth2zJKNxm3NQM0hGUoDeXlEq5/VA2gDaeyTIuPhTi87/QbLOAERmG9x1+x77XzWhmmw91h";
    b += "imXzVrr6/rWde3U6mraSWiNDUyJwZlTnTD/iY9XxADZpcqd/Ky/KavlXg7srcadm1u0Y/FzjCuX";
    b += "q3cSf1DcpQq5iUFaDe5MR269s40FzdWPfOpGmA+Nc54qH/+LUNNTCvbKK3ktx3Q0feyvLwaaYPp";
    b += "3P3WjBCBJvZn//H+hDc6W/PSnaYtzKaSx4SwCtuZnbMAVSXHWBpz8QwrYlV+wAU8jYHd+2QbMfI";
    b += "YCbsjPfMYEfP5j/NGTv68BKVgwP44XYF47D3OMu3M/HmsxZz9egY/K2KTVwFC6Dcy1Jt3waAaoR";
    b += "eJqaH6lG2jU70yl2VSaTh0Eobekax7N2rB11D268DYwTKs/kGGpNmTOLDvQ5cXCDeo/W2A8Lq0+";
    b += "QHuMx1NixXU84nwvHwzzCR29CAv0W9LmQVrNVznR4FtpC7QhHTpIPOpNZSjS4N3Ea4dxOt+8Z5L";
    b += "aa21KXJTgzH94ihJS31o3dZDq006h27z9IPWn7GDaOZimiBvkywGqjz+VDVOaTVPpxikiACXemm";
    b += "5G4usOpmsPpslBSpWtpX1fi6rWlPfW3E1fGJpK1751EsbIvMwD5wRpA5s6rmSLCkGF52JT+rfSM";
    b += "DKYrqUPIeuDRN521kQd3oo9fB2AdDVY4htiGoACtN8E6GEW7BP7LE2UknoZzQV3EHGG9zUOZWyd";
    b += "bxwvtMhLiyzif5C5ihIwMb10ADFtynXNo50Wb7g5IhAqR8AdOdjZmK5/K+1Jm0zhQ52htDmVJSm";
    b += "F3k1D4xDaYU1KL7MtOfNR+uR6oi9gVdYczDYS27SI2kSntVRaxNEwSnQaStGLibaGVGGrxvh7bF";
    b += "gIBV1LtCdSaQmIVGjK9QeJVE2iEyJAo2rT1KhKnRg/P5BVcfyVL6EXbMzP2l4wRP/PfkZ5nhhvK";
    b += "D/xWdd3FL6rsvEdyh+zvlbWbNIEGd6OgZ9YCrcr63Fblbw1x9VRE3yTHLx7M2xIsnIJTG8P7xs+";
    b += "RBNBCtc9h9L21PeiopjLoXZSEWvmMLeY1l/rVcRYd0WNKzazNnL0bifCtznHNhiM2gE5UthBtEk";
    b += "pR9q2t/f5xPrpln1TNq+ob16eyQs7jTFaIQzCwbouMSOc0WNkPHk3Ee3jg94rWZ03EOMvPmCjfc";
    b += "BG+4CN9gEb7QM22gdstA/YaB+w0T6Oo33ARvs4QfUBGw2NZdZeZk1m1mpmDWeBb2BkBwZ9sKAug";
    b += "iLBNzt6VmnOB+psHWGMwTOBBk4rWUBl1mkXL3hLjJRZ5/36UbPhnTGOI8YxbRzPVsxe3DieMY5l";
    b += "43jaOC4bxyV2ZGw/9X6D/89HCFjy1415hI4xVCBhsCDTti5sXMnzSMnUgK8vMz6s+XAqlS5Sefo";
    b += "esNzcDCJ3I1vYY8saK212SzbbaCwJRqG3Rr+X+fcS/y7x70X+vcC/5/l3kX/P8e9Z/n2Kfxf490";
    b += "n+PcO/T/DvPP8+xr+n+fck/87x7wn+Pc6/sx6W0qP+MW91Ba+6++RIrDKMGyxGNkWnq3JAgBicx";
    b += "8nVpSxBuwf5kQDYEqGkxtmukzSAtE0ptlaKPdoV2yrFznbFJqXYY12xw24sAqaDjp4zRzZqGifR";
    b += "x7veHCl990RX7JZS7FxXbFqKPdkVu6MUe7ordrQU+1hX7M5SfWivxX5soWY9mkWpkWOaKqAlWjO";
    b += "NTHzvfqOn5aAGToyy4w7cf7j9x6ADY+gwEZEOJGweBHaq2FaHsfARqW0PAUGWMPThqNtUjyAMs4";
    b += "0PeU98Tf1eyMjT2CTbmjSUCYua+Ab/NTY1acgGuTdh1JOwtrqENexKa4arlX/8/OtXm5zIV+ZBx";
    b += "BFETE+fnK/aqCMaNYOoH5men5uyUTMadRRR755e/NwhG3VUo2YR9Z9+7b3vi2zUrEYdQ9Sn5n/p";
    b += "q0XUMY06jqjf+9U/+JGiGMc16gSi/nT+N3+7iDqhUXOI+psLn/2pf2uj5jTqJKLe8+snloq8Tmr";
    b += "UaUT9+z949G4bc1pjHkPMR//zpz/o2ajHArViURHDlqFhhlAtK3viOpAOyAtir43Gn1WkjHIGJt";
    b += "iho898QHN2JBYAV9cFaHUGK7fN5t8P+IEILc7CGO0OPbU29+r0Oj8iCDR5jC6s1+8AfZPAed9e0";
    b += "uM8RAIXfHuVD3w5CVw0AoxUVgmZDgTgQj7Enqp4xF5aTT1GgNG+OOu+uOC+uOy+uGwEGO2Lc+6L";
    b += "i+6LDE1rXpwW6ctZv1M1gmFhIRjGJ/Jp2CUZ5vFVS1gWDfMYDybskg3jw3pksOh3+EJ3zodMiEI";
    b += "ETnUaU1RiTwBDY7k2EMkmD6CCnXAqDQWBr2/hFvsWbqFf4ea9foVjQE/G7PMMAGesqIstLq0W67";
    b += "SRq2S5qDaigLvJ0i3TLNrlFVildUFtRByQYAempOaLHhaynsHi9BiJk7aG167idN8qLlf6VHGpL";
    b += "/337odBSq6hwk4q6iHsMwgwJYAlhQanDQ1ExDFBiruEBGeMfGZbRMPwrq9Vmw9Ar4gvGD1F7VRi";
    b += "TSmVZpVKigU7YLAtufHpO2tYII8pO80ylZ4BYcTLqyDUWD86pX3IlPRSiTMZ6wyLuJ3cFQmlRJB";
    b += "zHVeSioVryrMGzXbIEmIpABFZdBWUMoC/VvYOtCqR6Hg/Es0piRRgc40l0VptHYE2xfGiBfNkRO";
    b += "IH0ZZVFsTzDIjpALfTFLNfG6WuFB1rL1FbZTPXyBVqgryouetaf4VnbgqYqFRyOZjiGzKp5Nl+l";
    b += "VwMBMFTKnm6q5It1CVGI4JIUszQQJCGeP9+UGKAhSQ9g4Y6aICFY4UebhBl2pxijwoNDkuCtogw";
    b += "RizgGDL1iI9EZtIz6K9VrRIz/3SIIrVM9wjKoKB11DdmqUPPoKLWhAe1vAnK29bqjmptTXFFhFG";
    b += "aJWRxNxhUkjYKdagYFBFGk8lIKY/dwYgrSfAGMTw6LrOVzyICBWSoChGEBjLU6xECsUaJOj7f4w";
    b += "c5lmm4xw/kHl8swMo0KNf41FhUU76/D5kHIy4a399buQdsryH5x6BofFfv4W5yR6X51KAYUIWNL";
    b += "1ETwDToyZ3lQHGThJlf7lHE3EpL/bIkbfEtjsA3yxd8jtOv8W3roMyqnUTTzkXYEyb6TdjdU6+s";
    b += "QkNJZj7HyeWTuGilPqgXVyweSkwwkLof9s37WphQs3mC4dD9k9FuvpB4UryPqfcp8T6h3nPifVK";
    b += "958X7lHovBiyCei6y4JJz5JwPbInll+UeuCSo/MZ0oyUWytngm957VUBTfLiqEtetfGklKRqmZn";
    b += "rpdStbgjXfl+utFrs43IaZmrO9ICyaMFLwDmKNU44hc0Wnru42kIYt2kC+hvODtSoSMOzUY206r";
    b += "LkuspkR8bsXfrYunlsj1kJgCem1mkpMu6xJ3a/Lu1GJ5UzII2IWiNsp3G3sBsF7Tr1HGDHeP6/e";
    b += "o+K9qN5j4r2k3hM+t/HToW3jBXIue0XJPWH1e8U2ilPKpgoq+LC+qz7YLGmqiIKYqUGKpq3XvF5";
    b += "8Yt/mWxsn0oIcpi0g4VpfPdVZp4aX1jtlWJeu12tTcfVpAZf6stLtbJDBoTPilH9DOmI6f4hjH/";
    b += "G7gixaB6cWIrBSp7w3mJ7KhqHWp+6X5b12wWnqe4RBMrk7xrsV7pJ7o/qeqkgrq/eceM+p97x4z";
    b += "6v3oqAtXoxtO87HYi/Mt0TlO3BLnHm2MBSbQcT6cLcsLtdcSN1WZlorX+cw01xs+oldEm7urREu";
    b += "lS1GXvZhPPRorBjQSDG/eS8GZhUuqdhXTPhGCWeqGw5dp58TKaGW8kPxlYIf+NLDjlbGagm+h14";
    b += "O2NO1+q1l/laofXzFb9mw0OG3uiVYQU4dObn7eaXh+YRXGp5PeqXh+TGvNDw/4ZWG5yc9Z3iu8M";
    b += "ACedUhrZQcocQqp1BUohj2EFK3YbG+h5nMSxs6+VR4UKeVg04+K32nYcOqppH4O03tGhXucFhWj";
    b += "PRp5qLpmzbMDC5iHu69A95tmMXnanIS/t9MEKzx31QQjK2Q67zTTBuyOgn55BlbdAqinfUjapi8";
    b += "pX6zQpF0C3KiEY3rO6EYI4/lTEoG7lCN9YhtBfiMFbvsemvHLnultWSXvcrasst2Wmt22Q3Wnl3";
    b += "2amvRLrvR2rTLxqxVu+w7rF277DutZbvsu3Sx1Rbba8a6XXaztW+X7bIW7rLd1sZdtsdaucu+29";
    b += "q5y15jLd1lr7W27rJbrLW77FZr7y67zVq8y14nNu+yvXqcL1bvgP4fWsPg4ntEbb0Pqt8IGBVNZ";
    b += "C4E+EjJOZlE3ACT2j2r9GwD8Miib3EuVTExKGehCYfK+IO8ZGCWXHVQ1cYeNIK+2thFiPllM+XC";
    b += "RJ6IFPGZloaJgGuRPjTXHtBKxWoLfk1X09jl6rgT8ghbaTY+sw5QCjEYpbwRqvVmycvQoXySKyG";
    b += "wG1izlC1S4iuRpcOC9aEeIi4lfrPK1NaMxm2ZF6q2lSLbbfgLQpcxQ5YiuuZEz8cs87ZiirqSo6";
    b += "Yxoc6PVRsecVU0hV+kSNw3e8Ij2FZRRmhYNl2ZHLElRME4UQ8RhAWFaWTmblm2M+wl4YNOuDDJ4";
    b += "HNfEj0/m4Pp3tVdO4V68BuJoCLT2REYs0bDQiMwFotlOE1o5Q+t7bmwkGhkQcXn/mKEc/xIxb5Q";
    b += "pghCGLyP9YrD6MgcMQMIX4+Yo0LGzDmMvmZKD4fRnpExY9PsND3ODhoNtXm/rKE2tqKG2tnKeF7";
    b += "JR5PfiDYVKmmigSbmNViYXSx+mIBFaIS5ATTQ5/DRR3zzPsvHj1lFr3lfFL0WVdFr2hdFrzmr6D";
    b += "XnlV5iRa8Hn7ei13JJ0WvR1UgaVbWexW9G0atk8qRX0cuYPCm0OBZfTI2kb6boJUWvB11Fr7nnr";
    b += "+g1V1L0mvb7kBXH989b0aubrF2KXr1kBd+86GR9PkUvKXrNFYpeo72KXmVNqeVVKXotr6zo1UuM";
    b += "uRdT0Wu0W1NosVR8odE1Fb26G7NL0cuWv9DVeb6teU1Fr8WVFb2crL2Vsn5RFL3mVlb06m2+5cq";
    b += "3svmKBquXGnNFRa/u5utS9OrTfIsvsqIXiryCotdqcn9hil6lSUvsTEFaS0olBOxKtFknQFH/Km";
    b += "tt0XxHM/I7Bv1YZuQ53xw8Y+Vasbar1EdLh6SpZv2KyAtsi4CPOhQyQAS/ei1tsR2vWa9kZKvGm";
    b += "u5sZ4thDCoCpiDXEFNZ1VjWUjtbhYGtXgthLOpkLYRN/5Ie99dKFsIsPMAiLCpQmnz+l6yJMJFT";
    b += "W8lEWLVf6YPnVtdfqQZ6xBNZSi5DrlKkYrlevCDS891x/YxZFHFqqYB5HYA45tRI6iPSdv0aQqu";
    b += "z/OJXRwrGZWqKmcMK844WScT+rlGkhW8Zfyw8L/7Y08seIqh4LfZY+FbQk3jOdLssdqsl7IHOaa";
    b += "rlVrKGIdStF3PNWG+1ROryeVXrm2wTAc7xC0VxK+n5fBjihdBUD5Jsn0m7iyPipn3HLgYw9xTQY";
    b += "7WkWMk+IA2btiFH5aqy4M3FX7w2b470NqIIx/ZtxBUKvgoyrmjckO0blwknMrn/Ajp2rZd41zYN";
    b += "+aIzYUU+aJlwjqfhT7S8TTg3Xoz2dyLaFh/Ow7TCe+vcn2hXaAanfb4HGyIQm0a7YqrtDMlky4a";
    b += "h7u6slRmMG+PNnXUy/rNhqNd3NsjQyxLUt3Q2ymC2iUeAzmYZA5iLdna2Sp/cxh2iU5UuwVLWWz";
    b += "p1YbQGtzmgpNDqTMAWlKpBxwGWx+6wAatKJ1npdKRQXiVn5Y1tXPC3YFUh4hUMbARtf7gTT4jw3";
    b += "6TYCBuAEYaI0WbidGBCxAk1bhBC7BGkrXHwMyFSiBpXhS2GCBLdMDPKRzIizCfRNVhsiMSWNywn";
    b += "ULSIAUp0HXYdIkh/s5IrokWAUKIbkIiPGCQnhg4HRYvooUQ3YSMigqQ4K7YiWoQWJboNgxIRxMZ";
    b += "xA8XRIgkp0UOw8RCla2DxIUrXwv5DlA7DGkSUroNtiChdD0sRUboBdiOidARWJKJ0I2xKROkmWJ";
    b += "iI0s2wNxGlW3DTFqVbYYsiSrfBMkWUJpJRnCacOaQ6d/n3U5FmmBzgBY5gEUc5RjpqYnZyjIg4y";
    b += "u0OrKjGwrnVPJmAhSckTV7Ga09oPaNJoNtoErPqMOs48kFg1QAtxaKfXBs3ypQmsNYvsDXZ9bqP";
    b += "4zNfhCGbUGS7nXsRrKnVoHOq6pWeaJ7WIbYtitmxKmbHqpgdq2K2Vyhlsyk6X5WyffpCbBVIc9T";
    b += "Fmk8DX2/CRd0ITltr+Svv2IyKw5ZbTM1UgVWjhQqoFOV+fvSJBcgzQwQ3TrZR0ALLHkL3KdkI+k";
    b += "W5t0KivJJsbFoPAK3e4QmRkVtIlVvwHhjPl+NxNg4bCMGhy59aZKtAzvaqVhXcBNb6BbYmu15Xg";
    b += "osaLVV5DU5rYpolHsCxRSQX9iAjOZ8K0VnZeTZEn2bnuRB9gZ2LIYYCdp4P0YHYeSFEV2PnxZBN";
    b += "A8G5FKL7svNSiI7Ozssh2JudEBrYKc7lEF2Anc+E6BTsvBKim7Dz2RAdh53TEboSO49E6FzsnIn";
    b += "Q3dh5NEIHZOdshC7JzmMROik7j0fotuw8EaEj8yCOY9HaHeFhEInawzOMkDIf8OVvLbmBETc6OH";
    b += "GNkknRxQECh4nkLpan6EzE3fQWDTNhzipKi2xr+MNtL8aEsiyWhvMxKKCw1JJIA8RpZEzEhDARE";
    b += "7BJl0D6U2RMxIQwEdMVddBG+d1RU7RJ5JjAjQlhIobGZnQPLgZWJAqjwR0xkBPg8ZWLpLErlEpj";
    b += "VyiYFIsTXbNscsnFh+IBlTPUiV8GqLBkT6dU7bBkT6cryrWn0xVFpQrVnk6ptGxPJ5QCzfJZtBb";
    b += "EKVixE12xYN7KBfNWLpi3qoL5mAKoV3tgQsiXehMiz0Gt2QnzxU8t4O6Lb4XHk3uhtodVi2pC8f";
    b += "rgANtj5TXCgUkBGdWoGvuftv4W+5etP2H/M9Y/zP4r1j/C/metfwv7VYcLaxn2H7H+Heyfsf5R8";
    b += "nvq3nlgEire2H5jOD/8P7RZaAX7qApFSD09U0+7nZLajdnaqYJbTdy32FqpClwi7tfb2qiS3Ii4";
    b += "32xroWp0qbjvtqVXRbtRcd+3csnj/sU2d/u26Ate0TJnvXLLnPPKLbPolVvmvFdumQteuWUueuW";
    b += "WWepqmUtdLXO51DLm5v1arcMiNivU9FhXTWedmh7vqumJrprOddX0ZFdNT3fV9LGums531fSJrp";
    b += "qe6arpk9euKQY9ZcUwX/rsAgsbaafrmMtkz96YevZeVVx4NflND2q1fhbSDEPDS6iDcUVAaxRYK";
    b += "fXMHI9rPejCaXjkhtdWCKeFQs93GC9DYWz0NGsHjcXNxwa85mE9igQcaIhQvll+YH+n2TFeWlPs";
    b += "79R3YBkZWmSKYMD3K15TB0WBnXruNV2ttKar6poOCvsx9MFkNfPPpM66iqtq6EHLhmYyP/zmcK+";
    b += "iqVRkVUu7TIYs8XtaUOSCu5qvN1DaDreyGljlS2nqYXxFFjTT4PY2cw5yrbPVwgc6MVvUTmMWDB";
    b += "HRoJoC2xDBkymGzGKdYqgjUci9quMGa3DU1AhmdbeYV528dKVNZmwKEeJufLLTgJhuyw2s9QukO";
    b += "sTYrtjAGoO1GLyXfV+/+m6AfRz5CqOAUtmO+woMGkKUyDhnCud04bziWedy4aQhax9tl87/zoX3";
    b += "fG2dBNEotw97yq/+yccevajJgEuKneJv/NjP/NU/ahgASrHj/fKP/crJz2kYkEqx033yh6e/up+";
    b += "PG3IWiAneoKdazbSZ3EYTNNZ1LM4hRPfR81XUE7KS4l9gERkY/WX6S6AIkkNulvy5kW5HN2L7rW";
    b += "Z9b1w162pZV2Jdw9Y1Yl1brCtVV5jX0cOElUpZdgSvrWBEX5s7EmVHE1jrF0jNXX4dKzzbk0Vss";
    b += "MHbEU92rEeg7aUzoITMcMhZJ+Qoh5xzQljTTOc+CTnGIeedkOMccsEJOcEhF50QVjzTOVBCTnLI";
    b += "JSfkNIdcdkIe45CnnRBIPw5IQ9qwJzjVM07IGQ654oQ8ySHPOiGsNqeCcRLyFIcccULOcsiME3K";
    b += "OQ446IaxFp8J4EnKeQ445IRc45LgTcpFDTvjFTAED4LSCxGY9EslrGSFCYnmRXfJlk9k2Uoi3qj";
    b += "SvEepqi6a/EUAUl+ys/he2SU4DpPYlKLSwsGnuJ//Fc7xB2Vsve9OyN2GvSrp6uaw/Oh6NfCLui";
    b += "kUKRZC/kTbUNZAOqEtEUos0RiS1In5s8eTM8ANtPyrgnuXqbrF0dQefx9cH0565xLOR03ytREEB";
    b += "p5j3CokauU5SNbnnvE6Sl79Fx7vzz+t4d+/+nuPdle6ciuPd+Rf33mbPuF56UYv3uTqilQVWF8X";
    b += "p+D/3fcLzuxT6FtwnRNIGCYbnCxXZ8NJ+jhHnp3Xja2p3l4iJBaZ2NM6vfN012luzlS6cVq7ZN9";
    b += "kk5npp8YVcL70Qqha0PO0JLedfCC1flFunb56WfOPEB/TPeeP0raCligxgdMyi3lvYaXeQuiYZv";
    b += "4n7p+hFun3tIqDsMToeZxvlOL5DtoEdlJ6PUQJVa7SZW+1GX8GB39/yNx1uYa5asHPVmKg38uQY";
    b += "q9oTpiOaeGLdoOoP+e8t/MmveZtYDZJDYtVaLPx8ELMz47ux0YzvxnZkfDeWZsw2WzK+GxvJ+G5";
    b += "sOOO7sSTj7Vgr47uxWoZZsCLjoJDqgFy5VeXKLZIrt5pcudXlyq0hc2RTrtxaMvO05cptQCaBQb";
    b += "lyS9KwP5Bsvv0HOwEgGTqbc2+CtsH51atf+8QPTTyeJnpqwTipj2MX9X9/8hCFb358qrMF4Hadr";
    b += "ac6Sb79oXTLqdx7eFLUqiD1vwkvHXgcmHRXP/Fj9K2pdCu/sOVUZxAvJJKehn2GF91o03/j6ge/";
    b += "7CH9FpN+AOkHJT3tc1nrbMSmP/n0R3/9cCl9G+kHJD3Ng7wC22DTz73/o78Zl9K3kL4t6SE4BW2";
    b += "79Tb977z/2Iny95tI35L0rwccCv2vs+mPvOf/+eXy9xtI35T0bwSEEv0P2/Sf+vSv/lxYSl9H+o";
    b += "akfzNwqmH1xab/j5/42wvl9DWkr0v6uxhmOkrX2PQ/90dX/zAopY+Qvibp78YJKpSubfov/fKRx";
    b += "TL9A6SPJP09lB4RpxAWSNh9ejPPHeXXqaN40Lm72a9kW0QpHs6t0PkR5zbBooBzO/R+xJmKEjyc";
    b += "GXR/xNlhhAS4riPXLRy2Q5XFoGB+M272cHhKXYaZNygYzstvQnwaGH6eIqcwcEgM/DKu38v59xW";
    b += "AYaQavfxUpyqVqqgZsB30jmXJV3DiHUrCsEgJZbXrADlkmHEHp7xOPxsVKSEL2cH5kmHD6zhlp/";
    b += "eb0HjLKKVlwA6nzHq/CeNfKcCfDOtlnDLt/SbU5rZTSst0Kafc3vtNLIK3UUrLbts55bbeb0L3b";
    b += "iultIy2zYwM3d+E5bItlNKy2NYSiznfhAJfN5vJYT/5X6ZjDQ5S+awh4NtFEQ651TKjYUkOrJSC";
    b += "vWSP3HDQNPF01a8d9jFN7MU5015I4PsiBkHjYj2ND6T1/VkTHWyC1jKtrAHsYFGqaGEKkPO9OnW";
    b += "eGNgjt+HMioaHcFIOk2Ib3ebacgI4T2Ux4+fQgqmRHxrvNDBdNx/PBiiPmCbEtqpvaF4e47+Dnw";
    b += "cA2mcywtlaKabIhGfma0W2Jnm32BvJkKhtc/8S43omRumqIGf7FGRIJ/bzSQfP50IozyWUh0poB";
    b += "WpSgQa2dw1LDc8Qqwb8KD31C1YmlmeIFYNYsUOswCFWzRKLNuRdxKopsZyYIpOaEmvFyFUSKwCx";
    b += "sBChEbZMLCqp19usASvSpDUeqdqc+ZRtIkVXdlJw4Tjz7tx9QSI9JLK7lDEvAiMLKB2k5gAa0NL";
    b += "j47sU6p0Wl1Sw8il8jdH1RRZCJYLQkbdJNyR6MEg91G2QnJMgI2oaTVKUA10pg7YOmJ34xKc1jb";
    b += "AOM09q/dCe0JvQlqoIBSIxoApGlPTxNDJcI2pBBl2K43pYJuIy8vJai9P826a33cBG8tm+jAdmT";
    b += "RgZ6woxq9xGerATsREGXioKrNq9ch/JOduLPHvDZ6/+7J2gvSy0t4j2etHeO9oLSefS8n5jZ4AP";
    b += "WlkrzlowSFT5v6qhBlAy22AhJWl9aUAlaY1pYCWzTRZYMttsoSV5spbS8WQt5ePJWkrIk7WUkSd";
    b += "rBZnMGGSSJupQ0ZoAvXWru9LEFTvu2Q9MMHTAxnRTupnmga00v2yneStLO/1TQ56d4ZDFvoN8Py";
    b += "wQ8lpGMS9tmXYi172sZ9aiYYgebX07APRCgasXsDyJQc4L9YCaJwsuvahlWuA91jUUsLySCQd52";
    b += "ZYKSy8OwdH2oI2RbO4tpQwL+D2GtAwZ0jJkSMuQIS1DhrQMGdIyZEjLkCEtQ4a0DBnSMmRIy1Ds";
    b += "ZDCkZciQliFDWoYMaRkypGXIkJYhQ1qGDGkZMqRlyJCWIUNa1vFcGdKyaBcQtumC6EfGZAHNNBg";
    b += "LGgax8gANfWnDIFoiXhPSkh8JgQ7csAkHNGFtfFVfVBB9wZ4LUy6+xNcZljH3Cu3HqtC9ZFShOu";
    b += "6mR8Yefw94jIBSD8tYjGGpAWVkCEu+mJnkVhaVcrgrBbaNMMYcm8mtOT79ZVZwuVJ8NYvsGCsuY";
    b += "9RtvICpFPNdogu83zJKkXzvaW1KWEMAVlWz1WO84Lm+6NK9gBW0TM1DTCcwV3gH0vZEGhxwLgJX";
    b += "kbIEKxgaWMHq6lsSkyHDCn615VVZyFU0TfzDONG+oYIpbZqV1DbRpCXycArmHeevm5AzK0YGjzD";
    b += "HheMi6RLo09enJ0/8SL/hM5wIlz+fE5VXzCxXvQmVPB3ni3Rvk6IcyyOUR00eLXkk8hiWx4g8ts";
    b += "gjlccOeYzKY6c8xuRxkzz2yOMWeeyVx+vl8UZ5vFked8njbnncI4/75HG/PL5fHm+TxwPyeFAeD";
    b += "8nj7fKYkse0J88j+pzR51F9zurzmD6P6/OEPuf0eVKfp/X5mD7n9fmEPs/o80lazUB8zRepUSy9";
    b += "biyEv9KYxdKC4DB0zY0oUwB5pYhFjxg0pFqIMgWQV+qKOojrXI0M3MhaeFjFmSgaWOes1n9DJXQ";
    b += "TgaGyoOVF+VgWqGyaMhzPQUFJJs3jFz0rdRaUZNJ6Y12ZNCdWFqauTJoTqTJpwTUlrWQREuRY7I";
    b += "mYS2TlrQ6LWMRLElf/7BJXfWR0Iiuj4+l0Qj3AQG4p21DAvSIWUwQodJhKMnKQQZHyLKZTYD+Dd";
    b += "00GcjwKKAqZ1L7MEkL8GgN1SDTjZSQ3QiDokBUIKi7lVxIGCkwZ+0iT9IT3EwbquqBn0CSmULKV";
    b += "gsM7WcAkDfdD3AT7gDiPHqbtCZ9QHNCknUAuSj0RmQViz1ROO4ymIJftqDSfaPsDhz0+gI7MAXR";
    b += "NgE1w5alCRP7OSo0+WfkfcY3AgJljojcpxm90ckJXft3Eayo1HSfwkTtYYbqmynq4UaTh4nauEn";
    b += "9ngc3mBU1+eTtelj5oUAnkhMvxLRFxLoWpfHWXvxSqKXY29pvM+J0EJzWYzsI3tAM9IOsbGUqw5";
    b += "mBueI8HJvlTvn+YjTwHNJZ4d/C16xIz0UnbeNBg9U8Eu4MLfv6Fn/4IBOiHZFiXlPNFyvwy5/Vk";
    b += "MH69L+aRgQIkoH425AqHnHO/rxCYyIK9T2hyrvkcp+TrWilUk6+0BDyKC2Gzn+cCXS6sMwONVQp";
    b += "hQxY45EroVo/y3R2c9cW9FO4OTtNMA5QHacDUmkGE+XF/N68YWuNpYK0mVMU1Ms6LXzXSwHai3U";
    b += "YO4COmE+8V8uKC1ujp4juSaMHTECNzQW3nvaaik6m05+XKc7RnzbTnbLBCe84E+T+iPUPTnpLyx";
    b += "WzPmWDF9gyd9owERQ1oIiiEzZ7aFvcrpRa97GM3Ihh4LRu6zJiFPe06Q9W84rQr8VftdqYKW1Dk";
    b += "xbVktchHVXX7wQsesm5Y/xKf+zVt+jnNcNFhv1mf7UuCxWzYjI9dlq+wwPKtaV/MRs77JTPiV4g";
    b += "JL3sOQ6qbOC44rpU4Te4rHqBYbQ7PEv0H8R05+4jG0wHrO0q+tk15DACNapFMR5iqDC/49HFkr+";
    b += "4r3m7/GbhDWh6idY5HzPyXPakBYwjZ7z4JEE3rewIQc7YEj5EvNj6uDX36JJ8vuZwLDOKJvPKG5";
    b += "CiUIvwbKhdo5rkj1KUyjfdYpzXdTnLWE1Vjtpei+u09nfVK0Vkj21lD21m1+VnlNhIzJ0Sa11SO";
    b += "g22TfXtmbqn8gjhHZ26tvFectZnbKj8b5L9zjLruq7QwT8Mz8zMfqSSfhob9C/jIcfORP2/RrFX";
    b += "DrDWtgHIB7NPzfbyVkDrNAYnpjIGata/ZADU//wRQ330OPB4aNI/jNGC8j42f4y6ftpjfw/T21A";
    b += "KMxxZiGGWAlk20EiKeN+OSDkYBz3rJ70NbgLdADH7f6tSxKwoEYMPHRkmgfKaPLxSG2vfuz6+8x";
    b += "/HvoT2+679sPGNp/XZGLElpFEyeiRi4IhM7ExmGWWz1WFjxcvG+SC0cd/zJuJsfX8e7+WFNMY4q";
    b += "xPnoA8BPgYhBnU8ufN6UHpbrbcg4J6m0BSN+CWC0WqPnsxXUrTBoH4p5lz02FW7wx6QdGIGD0Sz";
    b += "u6FNDiHuN8lk2JIelknz/fzwUUVAiflO/CpuidrSqgrdrPTXz83sYlkMRXV5Ai/CSKM49yBuBXv";
    b += "xhBqvhK/v6OCjE9UneI4gnvHa9B400+gMd73vaTGAsC6lS/Bq94SvWxSKt778eKu1CBi+x2mdU+";
    b += "9TQ7kSYMYjL8TCDrT25A8Eq8U2bO23GaMq/Egiw02/HuE7ipuXbEFPxbMhUOVtjKputNTXNhrlO";
    b += "EAptUFuA/oo93VknJBFkZTaV3FkvQVd8ay25s0H7INwju4NlX+2dDKT6/hxjMuubx/kwWd+h5LB";
    b += "2wfKWQxIP8cw14oQ051pJOLw7mA+AmE2VG8+atK320jpaw5ht5FVrM3kyJpKw3DY6vgDqJR1hp3";
    b += "3e/0zkqqXh9V5ltwc5aaxkUFXjBxg86mn8GEZRSfEHbGSBihWP5y9X2C0IeFY1CZd5iQOSIuAyB";
    b += "4zYgLTKrsVArNyAEwLmJHwXE16afAJXCTOhTnHSBGb6E+rTe4nb02ZpBbAc2ErjS1za5P2BsJoO";
    b += "hPfIuWOUtmnV3Iqbzmjrdm8ZbYPu0dZk6LOLh1jk10z+jSIXSiapzGE/7L8WRIPS8wkMzI1dvnk";
    b += "l+UDUikSAjRF0qGN5rUoT/zh6zZ8lvhWDZCu9boBhILRUGrAFxSk5zQBnDMnmTDGRmWLmgq4pRq";
    b += "ZoZ4qRVWLPFMNGUWSKgXEXmWKo6yTvfT5TzKz30hRjp5i5oHeKOR70TDGwCNV3ipkJvukpBgvn/";
    b += "86nmI9G1ppWnylmRs0TyRQzE6w4xXxBsQPfF76AKeaKt+IUw6c55SnmsrfiFAMjbJCqL6aYWd+Z";
    b += "Ymb88hQzjRkJe2SdYrCB1inmtO9OMXP+85tiZgzCrEwxM8ELn2KWfB1G7RRz1u+aYhb9rinmgt9";
    b += "3ilnwLXIW7dW4r/FwjSlmMdJJvJhiYDSomGJoA1qeYqZp47Tk20rLREOlTX6lmGIwEFZ7pxgz2r";
    b += "rduzzF2NG2PMXwEIv8ZIoRQFpk0jvFsD2thpjc4iTPb4rp87o7xZQG7NIUw7ro/6HlbTlcQhhjf";
    b += "qZsK3oUGvEBqBhdW/zcQsWcYEbWxoHE+vaGr4T7r6H3GnAVEEPOxBWkm5h6CfmsTYucFMqMQyp6";
    b += "pU/vae4Lmk+FD+DVbFY1/9UTF2DFD1pCMLUg13IVHG531skNWAUn3531clFawbF4Z4PYmK/gzLw";
    b += "zIhbtKzhQ72yEpw0kAPJsklvYCo7iO5vhGSTPZfJsYSgV8lwiz1Z4hgAAcH9nzYqAsx0L+zrMlj";
    b += "rP/cmT/+4gwGA5bB3kHvOv/tYvf9izYetZG+U//s0Hfy20YRsgf5n/zPu/9A++DRuBDGf+i3/zt";
    b += "z9epNsIOdD85/76Zz9ThG1inZavfPUXfz+wYZshj5o/++7Pv+uHbNgWXPDmn3/mL99blGVrOpQO";
    b += "5XPvfe/XqjYMRn7W5Fd+6fee+rcadr+2k7nF5XPlmtN4hhmW/6zcqApqp41fllFbUFZyQyvO19a";
    b += "qjuuKL7LqR9URX3bZ1crBRaqgWxSKfMmve1nYFeyzdM/0krDzrWopwXYOFoQWRsUhucgqz3qdgB";
    b += "EiDhTXvT7kCSSY24gjQok4rhE1G1GTiBMa0bIRLYmY04jERiQScVIjhm3EsESc1ogRGzEiEY9px";
    b += "BYbsUUi5jUitRGpRDyhETtsxA6JOKMRozZiVCKe1IidNmKnRFQkfMyG4872Jr5IYdwUXj5wpAIg";
    b += "02pFImv9Im/RyFa/yL37JTLpF/lURV8d7hd71sSO9Is9Z2K39ItdNLFpv9jzJnZHv9gLJna0X+x";
    b += "Fjg0FNkrwTA8Ya4KifB4lb2EhnrccwI1NhEsaNplQcL/tH6LT9smm18JUsdDQvQgt+4d5ZUzNRS";
    b += "7MQzRYf4Vmp81Na0VgQfRh+Ty3bicVz4LdQ0vQE7j6BuZe8bvXZ5SuznqA+kW85YlpXjamYlMFx";
    b += "oevzdf5uFpv8ASzXNJN1wWTu/trczVWZ5DbOCCa0yRRy+e+wTdyCogvcWIJQUTiTHrYNAn1K/qF";
    b += "cNwKqjghasRIyrIciqI146jDvpljf0He735TaivvAOC/uYp3pHTFe8Ccb+kdI9Xwhz/CNRT7zG5";
    b += "tTN3YKIGl86ye+sD2Vdp0iG8SOi8ZewZO9q2eNyRTEHvpRz7SReznJjMj+pfIPG1tKBgyiwGSMD";
    b += "UELlIEPe8UBG6uInX/urnxS3qhqzV8B2pYK9Ww1lPDWqmGYsfA1AX3ajHbjvCsZQmTxuuyfiB1A";
    b += "es3V5G6qIsA93tibQijRVdKKXnVtqKlfWE8pAix7y9GprsbGwpO52dVX9P5fZk8marynlo1UTkx";
    b += "020H1TetPhiB+d8xjiUf8/Vh74GhvC5kLWEpsAJ71UQELkpZbaUIKLL3+ZSH23IHVx8DTZeSsYx";
    b += "LhQKxkJw/pUUWT05jqPooAfuEI4LkQ55x6q8Tqb/FK8XXP+T1fG+hgWH9F1redRbYgyV9hTfZ3F";
    b += "zLEfdlDSER7pzlQV38xjKGiG6yZQ0x6GCk+tRih7zJFt/FLAabmWXBzvuyATzuyQbxuDtL8LgrG";
    b += "8LjzdkaPN6YrcXj9dkwHnuzdXjckq3HY0+2AY+bshE8xrKNeOzMNuExmm3GY0e2BY8024rHlmwb";
    b += "HiPZdjyGsxSPJMvwaEFCF0pm1+ERZjt4e5G9LA0BIXHcl+esPmf0Oa3PK548l/F0cCYgtFoCmYD";
    b += "kaglhAuKrJXgJyLC62BKQY+1BxHCoC+tqIuJ8L9OUKcr0ZGoyLZmSTEemItOQKcj0Y+ox7ZhyTD";
    b += "emGtOMKcb0YmoxrZhSTCem0koisQXsXuflxriF2A1ggxvML1aEtZlPP7uADVpszVY0C6sbTZPai";
    b += "jU20qZNWLK6oQmbfBVLj9iI0Nov+pDQ9NV6tqFlzSB0PMIEpSXWtzVBm89J0Hq+1E3QekHQuknd";
    b += "5otoetQdOrX7ENRS3iVofRUEvdcS9JFvY4K2QNDAJWhkaq4GXGj2/voCm86W6gdGNJhlt2smtRU";
    b += "NropGCSeMy7LbnNAKG0dGQtd+sURQgYBbUGFrTH6yMk9fDluztFWHWUqYkYQhwxU0CNLr0h3py1";
    b += "YiQwVkqDBmUdqcTFuT+faHm0tNbwgTxHTdHBHJ5P59LC/FchZwsw0g36oIYL0fF6ZRcQ7g2LJbq";
    b += "ErtjBnKatkMZbVshrJaNkNZLZuhrJbNUFat/If+1oyZTdaOiLQYRqAlViOSYnpULA+OjWsQ0D5k";
    b += "L4RVXEtDZ/kWuWFOxSRlbLKLHHOIRQhbhayKRJQJK9kPVfItlQwkiiBHzAbxBotcGMxLrIa6dkJ";
    b += "d+57nIxZ1IfIY644Ry7lc7z+tAZciFnK53n9GA56OcPZMAc9qwDMR7KBSwBHTPNG44BkfrVobkU";
    b += "vxLn8xKpq/Ou6YdDTGIh/ROlXVyJ8YdxQfU7QqBgIbPVQp6OFaQBX/kuwFnHQmBN88VmX2OKKVO";
    b += "SHeo+o9Kd5j6n1MvCfU+4R4T6r3ySqz1mOFZcxpcs5WC8r748xWg6WS9KcDahGr0URqxZrxPSLm";
    b += "MdngYr2HDgUF5J2COyR3wyHTDr365S5vLMXFG/LN6bioQcFNhub3qqm/ZdaRKEpetjLbzYXMf+d";
    b += "roCFz3kV2Ms9dYidz29PsZD57hp3MYc/WLK0Xa4bDQofDsBe5Zml7y+na5p1jnOJIfZJGU9aMLe";
    b += "I5E5o84ZXM6ppEt7IqleuLc5ZvFSOt1aJIgzT1GaYwIbUuxh7kAd5P/leLT9RkH28h0sBCFLl+s";
    b += "bRZ+Oe7/Etd/gKuiEuJLQoMjbQE22+hric7tISlqZivA7GLen8sN8R75STp9Z0GgJ+eeXShwnqR";
    b += "uNEIc+gsNd60OcM6YewBvnKj2mX1Ip3cR+Fc4Q2sruY/lF84/zFRtWtKpid8rGV3+cd9uXyE8KV";
    b += "YdNlD5YblrE7rLW1fcPSwj14KyIsKAeOilk9/8mOsawLrYKP+nE9jIARRfGD68r1b7iVfjiQuSt";
    b += "tNFk/BHPGaSkVuq+d8viqdw2asxVB6Pi0d80b+zIy5dkGu+bEfNd66bHfd+0mI6l2J9JIuyK9E4";
    b += "8lvB3I1ymF8JYpgNljFpquSn+Psr0RypRqw+Za6ub6RS0AOLIL4fYaDakqC5C99Vj1m4iObR2O+";
    b += "+aVma9zR9lue2Dqi3kUkPuPn76GWyV8l7+ZPwXNsdkFF5Lg5nvakOS5D71WuYYEiwAxR/MslNjf";
    b += "Pzk71ThYZOB7yD/GDWrG7g5tp+upHpX24TaHQJy1z2StaZtmjlRG3DO5RY9syyx5XhU1Lo8E7cc";
    b += "YA42/QO2PZ6xYoa9wSEIjklrjilVoiHZewUkukfA+fnO1qiVkm/ZHY/TCRkHd/XVyrZAK4HvVd4";
    b += "dwRIc2Wjq+kIc7Rh0se3FWdftePCHkiYVtDnm7GDS3jRmXGBXnmpD90ogwDaOSQp1NZPasm/Vg1";
    b += "YcNiyS9YAqFVhTeBTlfiyxnfcKfw5rvY5pm8FFgroULVTlii6z1iEayShkrCmpCwZUg4PcMkxEN";
    b += "JGEjnsLIGxH7f064KZaExdvrqRyrjInBQAYVBNqZSyFQK5cgGCrqgLX/qUVT8cqQO7U5cr+TzoX";
    b += "IPh1Adkyt89FVnrNTB5+plJ20v86iP5M+8s7jQvdZrTxSdE6T8J2r7e4pkGBouwfOU+3VisvyZd";
    b += "5jv43Tn/KzxeUzA/CkT/eWGN4BpYCm2J0GhWdIrFGxnwNX/FnvCA3q0gwVpS/3GnrCkY3OUYhWU";
    b += "31FlYnM+jgUD72aW7IHpEGuPmzDzW6RkA7Tm/J9zx8wHLWaRfx9TpWE5ieLk7dIJlQl5RBWf606";
    b += "YGCavm8L79kSL37Wa0CXNVEkrQuvFu5Kq+I10J1TrKYuJH9T77qpWWnYeDS5pRQFDQ0zj9mb9Ee";
    b += "f8LVYtfDmtK74ZsuH1qonTtTjryoq2vq9ec/QasS1teU2Ss+Y8hwkRHuF0chQ4KB9CrBMzhu1Eb";
    b += "0SiVJe647fBZfQU+56ND3C5ZlmkP9EmjnkfhJRsftYWo8GGxk2KfuFiCxtn4EJrrhy3lc/n6EKT";
    b += "eV4B+w6FYs3ZV5dLnLiHOJK7sKjUtOWUymgr+4xrVPBmlc/uBrXcQ9wIg12cY2oEvpEaVXq4qiL";
    b += "36zUVq/AERHUBM+VTLI3koqie5RAXRfUch7goqosc4qKonucQF0X1Aoe4KKoXOcRFUV3iEBdF9R";
    b += "KHuCiqIi/loqg+zSEuiuqymKpX3zMc7+KnXuEQFz/1WQ5x8VOnWfTXxU89wiEufuoMh7j4qUc5x";
    b += "MVPneUQFz/1GIe4+KnHOcTFTz3BIQV+aqh26Rcjv3o4ZKzQyv4OcJr3A1oHgiIxYD9iAfwYoaW0";
    b += "HEpV5ViqMW5QAdLYRfyoCk5MNG6wADi6D+iHD/VvYkeAftQx/9G4X388a1FWXjmryOK9tA6lA1O";
    b += "dAckncmFiEMN52MjatSIBE0MbsN5IOLMBxjRm8acpBUjBcSJIogTxqJTm2LNmbaYEYvSEawzgnJ";
    b += "ag0oRdwDmIbnGWg0gwqMA5ShAYs+hECg4TgiqxUkVhaZw8A7cWBYBOwJRxYlyMnIAps2IkKEMTf";
    b += "G+kQtj0UGbwVBaAGlS6VtlsNF/VCSBOCxd544Ka07qtwG52kmgCoYymgjtrscloRhYylGmdSgdO";
    b += "cYuk9Yn9gO8J4I4n9o+PN5+IDUczVNQYK4QBkawFtCNmq1DYillUa9qc6jQLvuqOZDJwPJwZxnI";
    b += "fqtgFylFVtNaap3gtSZ7HswHkxUhElPzrVw888HindWiK34fli7yhCEOhQJpDV51GUcZCS+OiXJ";
    b += "oxwE34zDwulQrzEhO2X/EKimkuIQAbKJdIcgl7cmF6QTU+DW/WzxFjuR9v0ZarnrM8RYtVsLSOB";
    b += "zkN4Dw43SkB4mooQ0SWIara2oEgJT0+JS+mxlBQbxp8bp/3qElYfL0XT6mAufD0I15PRsQ85hP7";
    b += "oZh9IPNZwZFq5T/E0HVt4mWxetDFMDgsl48Ka7RdyhnG6ZdIeHo1DNSghULLTdrGxpkKEpW1rhV";
    b += "vqipoURNqempCoZ9cSKq+SboZpPl7dW+Qz9ljI+sv61tfsKEVQduIF0CyJZSrcz6OFv+tvOxppK";
    b += "EjYqESIFhkFlIzvNhqq2r6gKbHYqKNviISNCzdLv5bddkaOuINVr7HfNcIfbLuJJZXiSkHLWBwP";
    b += "yHfZcVQ9Zt9QujKsHi6C3C+K3nWnO8VIY+oUETdCTNL+NAReuj3Xd9S5l6VUcKJXjmfBTapFooS";
    b += "vvVhYVf4jIRRQUd9u1QHDef8ZGHY0PK78byp0Ph6n3ih+L2lHKWk8uW9Kk5R5a/vtQIUSFM1FCm";
    b += "FPCL38U0n6FZG92zaahcyGILQHqi4UGikKrGDiNjrWTqFZnuB7ZwQjVGNbeQQr3hDu0avErsNyk";
    b += "e4MSJiPsNEIj0SORWoaheI1GWExpCi2lPmqghrKvEjbeZHNJw3pxreUpJYeZcczfi/sVyuuGSvE";
    b += "mlNPK3BLMOBxFQn8yXDboPqM03rMRq9sm4EIVbfqZf4sFcQl9l3MK37tEXFYSqfcVZD3iPw/KJh";
    b += "Tc3NSiblPtcEpu/EpdIhzneEPhXDXJVxSyfsUnX3YkP4hImWs19q+JGgOUBpyaOBzMMZ2d1Yr8t";
    b += "JMNtjY90Tc7hc/sfu5Y0d3sS82Zz4XPb5502bDfyenCee/dpHzYGZx/fIOC9j1FQ5L6PAe/i4jB";
    b += "x36WkZI7bco4dl9/Q5K/NY840RWY1kD/Q37todLCnuPn4DPigD6qpi8b8nlmB8nuvw+uQPAnEtB";
    b += "XKWyBhy2NjQ0Fpxvu1fCnYHDwrwnEDKJUdi4Sj1/iJO8cUOAMwO/0KYasAufz4w+bLK4D/6JkfG";
    b += "EOdNGht9dHPrxCxgwjXFWZlExaaGXqmGe8YFOvYyg+Z7chbv4SxeGwdAS6k2jccAIvgEEwSAyhH";
    b += "O4iJpNJxyzn/jox5TaazrLK7UCqFF3LMt8KCWb9mWbzqWDZ0EKtHMLi/588hShgLNwTmTSd//Kj";
    b += "43Op6P5ZXkHaGwxk7WlWPnKIg2F/Byml5SQAeq4i7/NN5M7Q2FBxlepsqOTihUgbjymKXKCLKcC";
    b += "wxVttCASVSpCVWgmrBoqDLSRRW/OKFs2voQoySfdFoaNb0SKm/1a+3lUPm6q60LWnBbJ9rWZwKt";
    b += "VSK1Gja1Kg72pV41w3dSr5bUqyH1apojf0TVrl0vfOPRWIn0qLYrTlqlaX/XOD4QKXtxGhgnWIq";
    b += "UIJx4qWJeV8QAbslLwS5/1h6qCj/woeqld9vT0mume8amg4ZRfuydxZlqlB85ak9w8zQ/aePsJ+";
    b += "eD4pNgJDkGPmo+yeIMzjfG8qec7/v5E07c8TC/ZCLfHxlM3jGcHIztZ+DdoFgw11kGNK2Pi9yK9";
    b += "9CkCIDXyycEAJcB1PX2h8tL0+0PMzboIUFqpU/XHUtksbHlxQIusl2QZ2BX+rGgowYiQLmaLUVg";
    b += "ci+OJagI+wGreIAhT+u6CrfZ0+JXJWwgiASRpzSQJXZssFlXTtKdGZb5Zu9RkJHLL7u+ptnPFLu";
    b += "OwFYxLm14Vt5z2EW/QsqGinVbMTtRs6dkW114RiCp7ttjbbzIponsvl1IarfuTNLIZFvs0pqn0s";
    b += "hsvXp3NjEOIOJi2xKUdjaxQDavnKRnZ/OHDT8UazjzocAL8jwv2qI8L6a8LIFdhOuDyl1tr+Xzm";
    b += "KCAb4Gk5MumNCylZEMG+37lH67+/emf+MkFGtTOBuT/9f/6h+/89H/+T3/5U4d3BwsI+OCPvuOv";
    b += "/v3FZ/7d9+0OzsD/o1+b/5tHf/rHv/B9rJzv77t69U//4qtXf+eT1d3Bafg/8EkAuv3d7/zA7mA";
    b += "uEHshnkDjJF821hrYXpZAVElI8kpjbyJ5tSDSiL9IBF3PMF+e+0glabopOP2yb8CIGHplgbxzDv";
    b += "yQf4hh4+QdRI4lfxK2xeqeOPcpAFHKJVCYuenu9AJZHhTeucAFQVosox6pqRRU/NXy9UWbnI8Q5";
    b += "7rTj2j6NCrbIgm7jGiwUiobkRGzx4HY6IincAfANjRqUKiMYcsCwmOwoREXxjNqwtCHFa84H80C";
    b += "5Si1ToSKi/0UvGWtE1Xv5ivLt+Mr9G1jaSfpNf6hZkx6yi3GP+J+hQ/FKgfqcFAKDwMgVS48m+N";
    b += "YuQKCUKYmpUvWR/oTDhZjAOgdPw/iaabWlool3oWKpd5oP+pZO0UrUK+bdGrApB/pVir6Kki3Uv";
    b += "Gpv/7RF65+/o/f90vTbeq/lPm+v37sPT/+oa8987GXUf+F/3M/9WMfP3Xmi+/90GFGf/D3/dRX/";
    b += "vwz7/rAz537MAXMhjwCnPq9L1+9+oHB3cEM/J/8AEaAz129b3cwrahYtjdNh6VhAF3AdvHUdmmL";
    b += "hmSHiX1eUyDrGP+IetEod7oKy9lYzx41VljBgxZN+4DpxGbAQuyv/qDuB4cHeDC1Oru8AubG2od";
    b += "S/+tDnYixlh5M/jgwGon7vvEb/3T1g9Nf/LM/rUjoEoe+Y/5dfzT9w1858V0SuMiBZ7/65XMf+t";
    b += "IXv/IPmpSPSq4Plj0Y0bk+qE2xiOcMw2Phcgw61p1oKo2osaYoby1E7BYCo07cWwhovnQXIkFYd";
    b += "xnmpAzzHgspBksAYqayJFO4HWVm8XH9gxKJ/RsqSSwFPSvBEd5b8PoUtOoWlNG5ewo6zaFdBV3G";
    b += "aUlPSaFRTjnNeixwSfssodrIlAihc0kvS5EasNeDkraQ8v6pTtvW5YypS2LrMiQ2LGxd5vrVpe7";
    b += "WhTan9Z6q0Aat3l2TFGHdFZnhvGCmR1TgM8juBQ9mDTzG+JKKMS2yRKDD9lKTtNImF/+ClLMpTQ";
    b += "FtEW4rUKAtFOARJW2nLYcC056QYIiTHJdvDKUDlgS4GLpQKUhwl0MBVsvAsUVDSzFYZD/VGdSc1";
    b += "xRZNqZY6HqAMxMQj3TAtEikoG6NdFB4S+IH3QqlU3JeeDdMANXQtPrmHN8TY/BiPf7rzVg8NQXs";
    b += "QlwllU3p8Z7VmoWbm9PhNiqZhYvMcFsb5yT5wtxKlqows4SFpapIsnCtVeHIjIfeqBhxo/KIG13";
    b += "T6hYxuC9Qbjzjn7ZYeYLthrMuGyCgcA7C3jxrlM7VvG0scBLIibdB5re4/BaV32LyW0R+ezpg0f";
    b += "gtFr9F4rc4/BaFnzH4jXoaH+LVjUlWOaidFxsQnKBuzxS5z4hlZrUdsM7C5MJSlbEdsMGC68Jil";
    b += "bEdsNFC8rLlqmeMRQED5JttsRi/2VYL/5ttsyDB2XYGCM5ShRvxrTlZKbSAMyx7410hs2pG0tZD";
    b += "gszpZOQcV3v6AXldznbNeeWtxQFzZdw5vVV5xiJKPjc27vyEgnOriUyAUz5zQi7S+OaM2yZc9Me";
    b += "1pManv8XBv/7GK4Qw3jz7jS+yB/YFPcq+CEbbuDqRzb18giu+ZW+856z31hXsQa+glLEiSoTdFE";
    b += "ai1MN1sDoo1QKZ3qJJ8N1k1SR0IOyrNmHN1ed57i9GUD9RfHmjZ+RcL4eG0qFYP8FxjtUIUk10u";
    b += "XtfRUpcMdPItUOVJ5eAZd98vO5FGCFmvS5Y+sjC0kcuLD12nSVYevrqJIPPw+mJk0YywaMHED3O";
    b += "jgJYebvxDhizpfe7YeiDfzEw9HmlFUSshgqcKq1lNMnQnAwf40NK9T5GeY8Y2V0GNgOj7gEoPWC";
    b += "088ACpVt8dw9A6b2xB6Hno/GBGx+H9vuK885pQjeNlLXlRSLqf5/FUb/vGtDi+WFMnwIX/u0EMe";
    b += "5YClwJYtwCjAcGo6TjOXAkgQrZlTxhPssYKQHfrXnJr3mCA+7xRuL/Y+/do+y6zjrBs8/rnlv33";
    b += "qojqWSVVOXo3BMFlx051pplLHXiODq1Istq29jp5T+yJqzBa1bWmsyVJ5OSheN0K6pKrEqXiCEK";
    b += "USYGDC1Aaam7XUTdKLS6xyFlcAcxOJkKLYgCIhQZJVHAgGbGDAaSePbv9337PKpKlmmgh+nV8nL";
    b += "dsx9nv8/e3/4ev489L2FEbi9xQ3aVQCF3lsggu0sokLeX2B/3lGAf95XoHg+WcB4Plfgd7ywBO3";
    b += "6wROh4mAsYT+/mGsbTe7iM8fQIVzKe3sfFjKeDXM94epxLGk+HuKppVWO4svF4xHB143HecIXT7";
    b += "siIswW4ohQjuAdA7CgOuSEOOWHbFYfcAIdcMh4ixggRSIhPQvQSYpsQ+YS4KERNIaYKEVeIx0LZ";
    b += "ydo2cnZHLIJpQTI/Rh9pnxnyWzMRVbkS6tDaDctuPJ/LO6TO+c974kFsW2VM64l8ZGpW/iVHbLz";
    b += "5yNT3JGnkCRu8ff5U8crIdB6P590p80R/2MZp9pdtYXnvQSyHoPCzkQfHs14t7R09s8UFs8y+/B";
    b += "H7x9X0jrw13u9O+VP2eBjv94rfeH/xwvvtoz0D7FV7+FRhHsX6iosvvt9GTJl+TyIBBh1m8VvMx";
    b += "QSACjuDJfuLK+p5hLs7g0X8Rm/2fifxZ3B2YVu9/IXneO3tTO2an5q1negAN6Qw/XYx+zVLyL7y";
    b += "e8/Zq8KD45KnNX/KJuCdMqHT91dKCbkDCI+xCHTbDvaN89fsHw6MH9Apit1n5qEBdsRWdId/JOm";
    b += "26rEfcrFxp/CFU/oWM5uoQ6VjiYKI27P4LeZJvODri9/5PX3R71DjJiyMpqDhTLGL8mABRynpwS";
    b += "L9YdtM757xLHrEPnz+u969PTCBZgmitpjQXL4IHys2Yje1R9P+Ynb2MMiiWd+S8VF6n01mMf1Ir";
    b += "GJniZMdFmdqJUB5dINY45xj9HxSKhuCwTKb7AzOJB0UcJs5l+QtbZm9BN1np6PRf4DnvdYBoCOl";
    b += "JI/32NsKvCkl+ZA9eYod9/cg/0wKA8z+ECBlR5JGLfZOdD/rOW6vNOpgw1ZZfI9lo9Utre0E7eR";
    b += "a+/NEcj1NscPQQPnNbzFPJfL7ZFIEfcj2gwc4wqcTMub3WyKo7MfJpAj7ETYLLbgqc6jZ2WM0Q7";
    b += "DfcmtFRSsGwfWIddvqiG4IzcEAPfTLdiSrGoHRQwPmtTpcwPbXG6EzcbqaiRPVYD1dHywp1bWSp";
    b += "ZtrLU7UajtxJumGneLZ37WfWr84ZwtKL4eW1Dv/e4x4sYz4p/hK31A88zWNKGdQS0EtiHw2USDv";
    b += "MGvfYdcEtTZn0etzCWlBu1zTj1CLnAinf5IIppDSd8UO8ETJU21SJnQdVPMM06RMVjqlKSmTNf3";
    b += "SCDmiDl5W+qURlzMZbrk1hzPwP8M2ObWPa/idia7tdCa6tscZ5wzxOu5m/hoEkoGXmb/3HlgcAW";
    b += "S7EGgXgsp9zP9/HORULg6vTwcG6momdF3NSzJPbVF3DNInSOH59PSiFJ6sB6HxQDo7Kg86LI7Ow";
    b += "wp2lF4eV7QeNi9H7WH/dPQeMHodxZcPVTRf3qmovrxb0X157/9ryq8Hxh6YpmDxyk0enItXI89g";
    b += "z6XkWRZ2fjbxzcybDsN9+qLpD+H3KdO/Eb/v66f4uae/Dj9Z/3X4OWf6W/F7zPQz/L7HUi72Z3d";
    b += "/PX7G4F4dLOl+H7/zpr8Bvw/3u/jZ1U/wk/bb+Dlt+qP4nTX9HL/v7G/Ez46+j5/E7jkeGLqWzL";
    b += "K/j/dvwM+D/dfjZ7K/if7e+8PF4mHea7dm2VzWmcvWz2WtOQCWZjfMZa+fyzbNZcNzuaXWjs7B5";
    b += "nOuf1s2bIfrxrksncvWzWWvm8uHstEsn8s2zmX+XBbM5cPMPDKXwwXmuY8L43EORlxMiLLu3NQb";
    b += "j+abaQWzIevP2YgsmcvacyBHbQ5/bmr70XzL1MzcE3PQ289G56b8o/m4naohZohtM6d2Hs0nwFa";
    b += "Zm7rraL5NMsM+54a5qZuP5m+w85jOTd10NP8+JGUTc/AGbxs5NXQ0v8lWvHVuatfRfNKWsGFuau";
    b += "RofrOUsMG+97q5qfGj+S3ZTba0TXNT247mb5TEG6BMODe1/qgw1eem4qP5drC15myz8lslUwpsr";
    b += "LmpzUfzN9nsoR2qqeSoJdeZiMX2JjZo+5ydrsj2fuqtR4HwYQdzavQoMVBac1MTR/OWvLHOlp/P";
    b += "Td16lPqQiUSuty17/dxUcDSHp0JfIhO0hGW354A1nbUZaM3ZyY7t9E5tRPax7Lap4aN5KO+0sEk";
    b += "w2+Y5u6q22Lc2S0qQvTG7hSmTdjLtgt6SjTEY2oVgl/K2bJzBN9gZtSv6lmySwZvt7NiFfau9Ni";
    b += "DYsavALvDx7A0Mft9cvtmu7Juzmxh841y+xa7d78smGNw2l9t7g333Tdl2NiKfoO/xpFQEH98Zw";
    b += "DUdsI0ftz8TOwN84pt2BthQhskZBnQx3NVlW3YGcIMHUGR+8cD8tqcxBWDZZku2InHDzgC+8XDL";
    b += "eBhYhTsDbDjtnQF2umhnAMd2UGyCwzygJ78HwKQ7xVh8Z4Btb4iwSV42sjOAF70shdqdB3RlbEn";
    b += "hziDrnGz7Q6K/eCZR+Rr0F+/UHXxNjUU5OHcIHuPtebKPdsOAAYdFvPAGH6FHnWMwiafcMxIz2L";
    b += "oR/JCIIepOiCY1JFx+WFkT0bEjyljLtLCCDWxLtDdwe1hsPUDL19bddC8FC1wI2Yqnvii28aUCl";
    b += "thPd/aq+Pk0OcuovxRmzhOewCakJ8VdT9wHjgHUyNoOvN7uAv+IMgzJbNM0pYOkd7ANUrTN4F6S";
    b += "MphQRUkBuwaEVrHp6WVfrN8o9KULtUQbixl5ASKqUqX0vEix1DxdMDXlxF5Dc61kYwZiHVyapUd";
    b += "4wxZs7ibz6nygeqSAoQBrjX6a4fKBmqQCT8Gm2eNpKai0GEOnxcgZF62Jut+j83DvBBWCi4GODN";
    b += "TvVHniomjT6YCAOQHCBGbpOBNjqPuFTsxYHI8bfqOejLGU3Vie92RE01/z4bNH3o3K0T8Wrxp9D";
    b += "PtfiQzWjrxoRbKbo/Qn6YtOhDqZ1Dktl8uyOJukgKq2ahOZiG4erFy19OSoK+xTojkgltttsdwG";
    b += "SvP578Fy21/bcjtw+oNSxhOxdBqagDKOjLED8BcUQSeiEQgbu+LyjzmduqiO7uD09GQlX6Dq348";
    b += "5PT18XMWFEgiCo/GkpbSuBM3XqN535GOLpbshO/hH4zd7K/PRXvv4xyrNwoY1OOj/kx+rrLVto0";
    b += "86W+2fbpl4xu5F34qB55H+Vpz76eVY+KIgudLfji3lSdwNuyzTxZgQ8LbKdNAX52c2AKYKMRO/Y";
    b += "Uspzl36Alw9CubBK+oJoivm+ZThUVFwb88vTnz1C4Z/4PkSXIrgsffD9yVu1F56FdpbELSFlvwq";
    b += "gr09U5yxReOiSArWfqBfjkag1heCXg1xYSRTwqRnYxC+z0pD8BFKgDqrxVn7xD8ktQeOIgZbHx6";
    b += "otPmZh7dQIXn2jOZTp7joyn2gB9TEb6LTSfpJO2rFqDwERSoPvnsIXWv29KgGvD8L9mf+/uLlV/";
    b += "7JoHj/NLjfRHe2+/h+eh6wy3rPtYqvler5u11fAARGqGhv/2CQ+/f3PFenffO8fep7FBZ7bDunJ";
    b += "f2VODP39uwwe/y8IJ7x+lgy6Vc47zJvW7qIT79r9u+1TdLq3DDcb6PwWMzYwYGarBtBnEsGK8p+";
    b += "MrJE3HIw5XIwuhw4RddcDlgGbpLtbCV0KWLXBy816VHogrtFV18kI51ymeDDlrp9CLZt0QeL07a";
    b += "mgV3pM67OHGiawcE8mN6jrcHqpioieeTQPYZPQq4jGPGJ3AZN6op7skSqTK/YjwxDsqxDNTMQPW";
    b += "o7wHYUt3RGOmywrEeusTOr16PtWOcbiR8LEbFUoqbZXeilQKmIIlvL7qFOQ8RCQ0DkC9X6kDRDK";
    b += "HgbL3/3Oc8dV5ZCkLJl/9wOAeD9PQGGztxBFci5BAzf2O2Xy6H4JN29v34w7doZXAzLk+NiqOdS";
    b += "pqeJnEsXQ27IGY/X9J9zG7wYiomDKMXQ0V/lEtBb6eRRsNZrbgOpiwDaj0f7oUL8D5an++PizaU";
    b += "63MdKVG0ZJ4KqBHVQFSOHe1AHVcGdU2xEyAMoz/ZZgZzB5bR+tM86xJlZc80hNCW7oBzDx3UM50";
    b += "1jDKkVMW+aY5jybAWiio7h3aXDUOMQVTQzEYGYlP4s3UxcpF+osESqYnOclYN7CdivF/yqdCyZc";
    b += "22kXBZZbFDSDpdCaA2eaWPoJDLRniy2Gz0hUxSEUDsPyzNewdWNGj88wiXry8vl4e5hcbYpm8w9";
    b += "gjfhiCdqkxzxgTviOd48vDJDkTDrk9s8SpSjPtSHeXf4A7hlOdLFypilEpSFo3AphAPt6hiG31U";
    b += "e18+Xx3BYZMVLRypMllZx9mONI/+aZVxwZRQvfhhpxWVEkGFavrjYrl60HVHrgo9dE7MFVOWREr";
    b += "MFg1YccdhTH09EPH7V259H28hJxJ4WYRtNssiHLdSHfIB14ejqJ8Wsj5sCN5sWzkGPOFrbPa/4/";
    b += "Mx9NtTqx9gxW3B1ZK+2WDAeVeezuG9De6mAFIFfPWp/KPiOipNXwFMeKwgEFmFbrSUKw3ms8Dp3";
    b += "+BPVTmePL+xU9ufAHiFN7u3Rs+QeiD/vZqR9gHQAmytauPueHvxNwd8TO5iVmakkpbq49nGfQNL";
    b += "LSz/Q45KZGdBBrZDOdmewPfXhAhgkC4TPdpbHwemKgPZfBKL8cMk+flRYtADjd89TwU7/dhv1Av";
    b += "u9wz61wMiC7q5ddeB44XFsAOYVntIBmFsRXTnd4d/DKsHdLMteWU9LHtGSUGoMpcb5b1+vxofLG";
    b += "qXubll3wrpB+fVbpLZwQYS1OECrEl8R1QI7aJBAQWID0RV5zduED0mbHZ6tdrBJJt7qwdsywNaI";
    b += "DwACeet0v03PUJDDLXMuEntZjA8e4NICmZL5drOwh8WMzho1Omw5ds0AXA1ZPS3gqk5mu+hWBRC";
    b += "yE68H7r24Y3OsP1jMzl71pu03Yos4YHsxO/s8nD/rit2GvtpyZ80+229fnlM8BwXMwGdnw33jsr";
    b += "paXAo0gwfLU6Yikll5sTZZKyfxydok/qgulkim7tJ1p+495dQ9XC4WmcRt5SRmnEQ7Cn/wNTomD";
    b += "WVziURh6rOR1zmb+MlM67A/U1lTQsuPUuJKOjyb/bdwjrUHxLydhtvMmD05HoYamGRJH8rNeB4V";
    b += "74P2VW8q+wjg5sdz9/6ip+mPS3q6In121miGQ5IhWZXB1XBYMoSrMkgdNskvk972T08VM4/aY3i";
    b += "/CC7tFfiR4sypaFB8Kf2fbAe+7EHmZ4rwoA18/UuWSLrNwDG1KS5+STUqh6dEsJ6PwC3O1Mzc1N";
    b += "vmP5IDWSNPD+frALYAAJJ8OEsPHwI6kMvfO5wTpCRbpzHgLh5mjCvzENueHBJgkQIza0lJbcYA5";
    b += "jZvm17Ie/On7NL82Je8++k57bK3j7/te+32bIohYA3uG++2OoWleG3gSmtfHo3btMuefc6icTim";
    b += "svfQI2/d18OqfeW5r9xmSyriooU1vPD1UPPbHAzKK0VStJF+/I8uBZph9le+cptEIEvUKX7qf7N";
    b += "raqJY/l0n9bsKueC24vglF6GCwpMuIsOYF0999Tm9O4cUd5/40VirOPYlDyFbfqcfTdnF9ZH+MF";
    b += "j3nD/7vQ0gfYaNlcih2/fJzg1Qe+jfZSNTQ7NZtGDfy4bTf2HsGT5iR3vmUL7uiT4Qo155JZjuE";
    b += "1pDVwS9DbTtJW3feN7Gpk9AFDU2su14b39ICEND6cHQI/vtbmK3tEE2ZD8hsQ5WTA3yZNmKmA0Y";
    b += "OdRsickSeuzjJpbDys5WarfHDoSDdqL766dMP7XVptn6+Qf3OFfJYpEY4RxKp4YO91N08nC+IWO";
    b += "XYMqVbcjsGtHmtNUnmQJAV40agWm8toQ+7cHG2Ic/7+1HONmK5d+xk7XZXvvcZIHd+Pyl50rbxK";
    b += "C44EJfaJnODNVfYAgiLAQQdT2HgQhjYvEcRyKAYwYhI7XURsW8kGe2wIGKDDfA3OLK0kILobjQw";
    b += "vESFDP/EMeLuIzG5RJnxgw4AbhOgg9KyVdLj5ch+74/wA2urSdKwFrsK7gS8ZWOvKInQp8NHUBX";
    b += "pa1niNRG+FGtxd5KpQWRvtSVsQ4gyq4dJ0M4e+y02kMFiNhyqAQdqiOAiQIrQ3tRTNRq2U6th10";
    b += "dPW1RAChds0VjvYTgPrJWHJkBKkcnbelobcsdm3xLemdfSQr1tWngw1A72dHcV5Fbnu1eB3U/W5";
    b += "1dmzOFF2VJlbfsUMDzUTvCMYn3QLxDqos3L3vCPtCjH8Ua5WVAfFNz056SFLzZBxvfI5Uog+uzA";
    b += "HsVgF6lu7SiCYu2obNmr5g+qaLmjCLjiBurPH6g5/+1XxaKwJXAZmgPYDPqFjPY9rd6GXRii+Du";
    b += "cfClzP5h33g47QvzWF/mB0+BKzFCd6U67h6i/Q5lDKcvRt2wCfvNrDMevzh8jIjvR5DASz7QS5K";
    b += "tuy70LNESRgz3pZy+h+b6M2IKha/FbHGdBD1vquLZAjta+zpSjZZdTODrk+I7n0/89syoGARbwu";
    b += "7pryx6gNNZXzylTxuK4/o0WhzTp43Fk/p0QzGvT5uKI/o0Vszq0+biO78tT1uKl/VpvHhJnyYoz";
    b += "8bTjUKGf78doImMDJpAwZc6h7NgIetkNxKEyWFMMW9io8cP17CnQomHDG5LPT6R+NTGb67HdyV+";
    b += "1MaPlfG9u3DDRvyYjd+kcFpEGhuV+Akbf4MCkBEObEziMxu/8TChwWx8ehfMGBG/zcaPHrZ7N+P";
    b += "X3YVrCOInbfyGw9k6iX/dXTYj47fb+PWHs9cxHqIvn5YU4CsUXber21Fzo1dhMdnxc4PbtJYOJT";
    b += "Vxk9BMhcCsqxSJm7BmDjC9HF3jJreZA/I0R9W4hdDMAX2CEZdjfq0cELelLseTq3OcAmMF6geOo";
    b += "HLrsZkpKvUStuXxglu9zTytUl9hMk8W3Fpv5mmr6rUwyYYW3LdRz6UG03kAVi7YEdNU9VGHfc7+";
    b += "mfaNZlp2AJqRqzJGorGJxKpaRldjuxKrChqpxqYSq6oaoxo7KrGqtDGmsWMSq+obEzS7zkJE0cQ";
    b += "2gyoBIAER3TmF+O2MSBDRRniS4RjhFsLbBHIc4QjhrHOl5ceygQCMEIxLrGEQW3aJW2IFX0B/HT";
    b += "+Q/np+P/0N/Lz6o/z6+hv5cfZv4Lfb38RPuz/G3aC/GT929+D+4GF/2CzQJG5/SLg/JPaD1/2hf";
    b += "Rf0lpAX6FP2u26X8bdLfNfGb6rH75J42GPdUI+/U+JHbfzGMn7oLl/bMmbj7Xc9VNrsv13iJ2z8";
    b += "hhI/zO4z90h8ZuPX1/eZ+yR+m41fV99nHpT4SVjylfvM+F3Ql0L8doB6Hs7GdX94JxnEkCDWtwg";
    b += "f3/sOjt4H8+SUwCUz8nbZZ5NyESeyc9qkXbKtNpKwebbdBYa7ayMZe+hQLTltJmMr7dSSR5vJ2F";
    b += "G7teSxZjIsolSRyBLS3BqpYRQvyP5J1aPWgmyyw7VysnK3kg27Vmr51C6fhhrfs+Ih1L5s0aeap";
    b += "t08vm35rH3RlrNfvF/7rH1RlpPY8rP2RW1OYsvP2hcFOoktP2tfVOkktvysfVGqk9jys/ZFvQ67";
    b += "TpacKr/rB8EKz4hcEWRd/a4REVcf+iQjWogYOiVfNiJCfvmM4DGV/ksjzPdtXufnk1XuHInBFYo";
    b += "8Nw/SW5wlmBjKOTkvI5nocM40mlbC6Zuc9VyVIEZTF40CtSWK7hVLFJxQ31LCbaHs3zIEwgSeVg";
    b += "cBTXPx8CFWj35TBUlXgS04p3DMJ+DQhCJrScxyiYNV9SrQXjm/kLWehYP0475i10XyqHEaEkA1G";
    b += "1frdaRVSANjByZWNTB2RoiRNjMGFp8CH0uUoAvbx+FMY5Zj5+KtannsBh4+J1Y0A1EApDD1t3Jj";
    b += "u2qkkShW4dLwaOQdFwunNf6qeMao5z3MYpz18BPaUkOZqDjrujwYWMYQq1BnLmmukKRaIQnA5HR";
    b += "tzLYHUm1t1NrVtNpHnU/JaPsnwwAr9ubClK5qok4m9DY4h1KAvKA5bKlDrh7IUG4pvevpCoVDdZ";
    b += "mQtoA0u8loNzK3NTP9m5YzKA2A2xsjj8uloz4OtV+NUtgYJeT25RV09rSp+25sfHHIlOCPcykoE";
    b += "+/g3Gor0XMfcr0EcQ74pdBvCXKLvU+0FMRVL2dhg7IHhmmwQGzVIXv7CUps1aCOrRoqnI2DtbEX";
    b += "giE5hmHp7tfhVTt6GLt3NNcQaxCGc1CDV2U1ABlCNQ5XtQQbqlXTKrYPWAoDxP4RKNW9gscDZIq";
    b += "hBvxPidU7RGus7kBRSssScVgfyCNmVcBjQ967ZnRURb0DCpJTB1eCdWVQIvEEq2BUff6GNbxWU+";
    b += "IaN/NcC1wpXD1uQ6fgmvpaSEB/2xinX2s5A6lZw2PHGUgNrTKQGqoZSA3XDKSGmgZSQ6WBVDRuT";
    b += "3zzRL9n4+oGUt3SQGr4wfHKAmqVgRQsryrbquQdeTje79BAyj501UAqHM8iAN72nIFURAOpaMrY";
    b += "76InBlIhyOm3mMdxXEO/MIB51HtwVkNv0a7NN3v/GDyhyjYKw47Chpx91BA5KZVt1NCD42AqgDd";
    b += "R2UUx0r7Tmj/VgQRnlT4BDCRysJH9VdZRfuCRoZRVFtwjg3SbOHPJ9pDnt+Q1EnvCgrrI8GTDiU";
    b += "i2M3iQ7jMeyv09PToJejBvqQ0Q+H7Bm4wl9MQQKIB4ZRvU27Ea32Iyfvdg5eYx5H1Bcbvat+CoL";
    b += "81bAshwJumUCC/sx40OWe4UsCwJ2OJ2yc/2IuC37T3Qi9QPSZz5+yWb9xbz9iLsh92oowWWZbXK";
    b += "HNulfg91tZrFS0PE+Geb9gL1gb69v8ef/dAAvh9jIboUdhNbUTccjWRa1I4VrdsuvNZAUsV0bZu";
    b += "0VuM+pHF0V8L6jahJSrKIXbd1xDHNg7a461v5uOmQVwojrlAuwWpVJiCBZr54zxHFfK4R2PME0I";
    b += "GAAWTid2bMYfvukNNoGStyu/6USQVeFtmjsHBwUkXo1EPvXUTTwixOREYNJmoo0siQDE7l+yZZx";
    b += "7GKO2uximHqtFWQz+xbduUJ33jIfq4QL0bCrSxLaWUdMbZQdqmNSETFMOkQTx8vde0qFV4yGMWQ";
    b += "R0ZZAp3sPmzgyOTV4mKJpyWeFqiOmFpoWlSxYrvkKsc4PMCO3UvkM7zdKV4CLJzfj1dZPL5/MLw";
    b += "lMkHgBWv8C/1O8X95XF3Fn+CXwuZLZPRaQvLXMe72d9BjvDnwPxT+Y0Xr0QVue0vekf6wXccxmJ";
    b += "/c3OwSYK3tLACTOdhD6Qml8wH0ByCdD0r9AftGGznakqPtcrTrOXjjwVsodD85GcK83NMzwkElg";
    b += "nC7OPcNuy7v9TqQ3Nj91y4p2w97QBqOyeFyRLpi7hl5fqeMG+aJp5tdFPjGi+3HI5fKjz38BHu7";
    b += "Qztb/JktFVahzeTMJf8VkuNOsaP4ChR7hyG+8w8WE9OPFfbUCSCugxggWPF+eiSL7V64hQIrd3+";
    b += "Vg+x9TxzBd1vm14q+i4pCkXBDNBF0iHcQicR6SwErNgqst1BiHYnE2o75gO+tqH/RO9KRgnXMAx";
    b += "1rx0/GK+2stz9LBv22pYR6dqV3RMPDzXPPk2n2G9NMi9eh2kSa5kT2vPK7LyvsD9nTrZxcU5zXy";
    b += "f1E4tCCT4Q1bfu315W/dlPBbZXjMbF/Mmr6tI/6iVd8/lGFOSPSJ1PBBMdyHQ9EBWz3/lID7B57";
    b += "SHCcdqvLMbmiUx4EeyUjCvOmrv71VCDqX+e9hvrX7p3BsRIGqjgWqNIUbcCWnArdsWBQGuXdLjj";
    b += "B9ulY4JToRGXuaaDzNpW0jgd5C2REqaPV0uqultXNxiU0GSK99I+DTNHK7vCXfVd7sewTLVjrhU";
    b += "xUNPVZo1lR4wkjPc5Ms9ozptHLSVUNO2dKkwUjLNdAZijD/zo/qld4ptT+3gY5KrCCOXOAjXvqi";
    b += "eeNKhuWxgsicCXERallv+i6CwxggTGTSC/9ibDssY2u9OOWfdfyL0WiXrijpu8+cYftuDyOQQn0";
    b += "WEB992V/UCId7rjDf0pV5RUFmMrx7K/i5ZpiB/63/fXY38RVKf3tQhGm5qfMFOdcf5MV/Q0E0qO";
    b += "0KnC67YtGtd3POBW4WaMqcBiNXwn14V9GuvyY50QomvDs33G7kpZq6mxLpUrckzUN9lfJd+HJSn";
    b += "WugY2LzetyiV0Lvboj/3SxJn9+6clKr21HcdKlfTIRR2THWnVPCLgVf1p2j2VeOsTZQOkZYURYD";
    b += "fkQwKLouDdywOQBwO3FV3FSxvLKLeykhqOAEpn9AkLOg64lhCT4ogYvS/AlDb4owe9o8CUJiudc";
    b += "Syr6dD4nfnPp5Y1+c33ZlJW+BecRXEc+JaKqjEUC7iKfUnAUA7XGGJWnsTvKrR38Qj5lYPfxaRv";
    b += "pU36HpAv5KYJ/GChuyA55uh1WnIHihuySpzthxRkobshueXo7rDgDxQ25R57ugz5ToLghD8rTQ0";
    b += "IpCm7IO+XpB2HBWeMolvhTx4zzZuYrotK71AUqtOITDYv7ZoUXFzind6kH1ERR2Vsad4az7+DTz";
    b += "wQu7zI9PJuaRwfxiBqXmOLHQsnr0yv0p408NLwDOAcWoXrkImMJrudKXwJLkbjU+ABdUIjnxZEa";
    b += "yhTYfGmJsr8SU2qJ/Xald2rlCjaZK3eojltFRWRZtVjWZFTYbgzpEzwO6JrDajweNhb202FjYZ8";
    b += "MGwv7mbCxsM+GjYX9bFhb2O5LHSrdQlhS2bjB9+BcxPX2XeLNDo6BNYRJGVGPE+LuK61WSAuXi7";
    b += "+AzYva5dGvgKrUm2up1BNjPvcVhX4fD9YM/yt6uS9uBPxKoT4kHLyULIDm27HRQKEecPBQFApJH";
    b += "cjtwK8MvQzVr306BKhj1otCPd0dQA8tVJz1bCBx4jUAqtqGZ5wq1JtKoZ6odoLursryRLVDfC1G";
    b += "nBJUCvUGlAgV6o1TqA/qHhgeJyS9mjMSdV7GacKNExXqfadQ75El5ONM9iuF+hBvHBJqylQK9UY";
    b += "U6gNaXjyuI2YkWgmqWXPNIayw/soxfFzHcN40xjAdSFxjDFOi1UOh3lQK9YYK9c5FqY4FFOn/wu";
    b += "cI811yNiT6KzoDe0iDnCbG/XJNXZ6tuhhaqiihKQwQW3QcExnHrhtHuir1natSTwAYycmV9RVCc";
    b += "V4M3nwYvPnqqlStSpQE8IUE8B3Jg+TTST/oaFlPxHhSdXjj1OGNU4c3Th3eiA1cFjhc/KYqu6lU";
    b += "2S//SGWVVleHB6/mwo80AO6vWcZLZRneCq12px9/5KOVfrzdlz5akQMrXJMmxswIzD1h4NYCA1r";
    b += "F/vJw97b3v3V+EEZxK2kPdbq94ZF0nUcFNq8QX3Fq2pY+GXfXoR32NfNmD+Cm25UP5U/5OyGLK4";
    b += "4cpzI77QxUjkeF3Uk+QcM6JXrXmB3ssJuyNBvNL3HNAq98whV4y/XLG/nrlPfV19DAYVfgGwPvH";
    b += "6xd4Atlgb/zGgrsSYGhfL1rFvhMWeDvvoYCu67Am/1VXTZS4FNlgZdeQ4Eknm0Zcl0rlj7+HDH5";
    b += "ytLmtbTqjaHrvPHSj698o32dN5ZXvZFc540XVr3Rus4bZ1e9EV/njZOr3oiu88ZTq94Ir/PGk6v";
    b += "eCK7zxssfX/mGf73RXfWGuc4b51e+0eF13VIcn2uZBNvOCUtxtLeBRoGODUgVaLOqWjGI1r1qcs";
    b += "IV1/drTgxIyhBFyBdUI1IcWdjIKqffosuoxdI1wsqszjUCSg3qpQaUdq0ste3koLlP9wTO625ps";
    b += "S1eC3hTrqIXHcgsHRM4sFxNRNBnAiTs6q645giB5LZLrkoRvzXLdXgB8QXtEn34LCgrP1H3WCCg";
    b += "t0v1KC08qPs1EKP2sIzy0h81sl7E511N5ulXvq0pn1W/0VddEMJ7vy5IZxSlrxSU8wEx9PkQr8o";
    b += "sUSJy9kVAX1cpcFGzgdYHUXAgfchjiXJiYqkLYny/ruDgoqQOT15wQl7bLE9agbIEMBGla1hepo";
    b += "wZnbZ1J6viE5X0V9J3e6fypLhj9HMduBzL8aA24bNVCE2P8adV9TXJ2L9I5P38PEjzYegvwvXzL";
    b += "bC8cc3ZMZDMvhO7e3JVdLHQwniTChJK3Ik2aCL7+V6EVrviS4sNrkAdUxFkSPgGAbGmSD7be0uA";
    b += "SxmvYC0Nv1Xda0s+rv3q81DIJlcqvgR7VU9HyjzVX3kfnRXPhFW9Xad4o29WF2RXx7vUT6P4YJQ";
    b += "wb7WqSNPROH56WUd7sUO8aXfYSHEWGMjVVr8U6szAg5zwUQDfyBwyJ3hTrtCB4iAbPoVA8qs1Iq";
    b += "LGh6teQh8AUa+IViH/kzJW1izY2qLF8wHma/EpEps8jYurOB1KiW/X4mWgJD7RATjj9h8dNK8W+";
    b += "oAoUZ4JBIP3dvLczgaC8ruLoXMaupOhZzW0m5zuRQ09L9AUz2vwvATPa/AFCb6gwSUJLmnwggQv";
    b += "aPCiBC9q8JIEL0mQbZdxUn+L0BJp1abB1+n1HKisDpt8rKHrLJ1Vm0ZvnzKN7j5tGv09IUHX4ZO";
    b += "m0eHTptHhZ0yjw2dMo8NnTaPD50yjw8+aWocFBNd9N26y3yWbqP2yv9zy2yI2uFo6weAtjbxZkQ";
    b += "5s9xJgy0F26NEnwg5xviGcAUWNxoX9bdOW3FdIGKMHNEsbqGmNvUdQAV+KWcQFm4SLTd46LVeFX";
    b += "XUfOjvu8J/3S/Jz0RdUG3rhSed9aCPT6KUI9/bU04+U4BjLF53PnvR535/hIBm46LqbN0rhbV9u";
    b += "2Jz7l4DAaorffOo5Dz7A1FWPY6m5nMV5VvUdI/S0J3sdLjZ+FXORMZW/c790V4EqGHxJC2DXxLc";
    b += "7HeJIozp99RlClMWlWvUn6OOTzSihAE5zY5NNt105CDB0aovGNHBzDFGe+LzoE8QpokkGZyar3A";
    b += "8Aum2nL0gYma4wh/RJjwWhFAvyYIUzlsT5X8GUnPjJygOTAwG/AkaHvZXLIB+TvbPs41Wi+7XKn";
    b += "rxMqP6kDM+yv0P1XtmmAtiKz09RV8RHm7mGYi4gS8bVX5jHbGPswZOG55ydrBos6VYZAkc6qb/1";
    b += "np0+kACq5QU+1HQRPZb+dxnMjfxbvXM+lVIU6bwQiGmRWti3bM+Ff9IBnoq4rFIxQvBm7yJ14qZ";
    b += "2zd/p/b48Ts6/1fs9eUzm7/K+aopf/NRzIjtAacsILNsVSx7BR1t+ODN2GDpm2/uJqJ1vQGiy3x";
    b += "bt81GEtsGCDz8bEcr6HdFFvwGhCeim4WcTQmP9nmimjyE02h8WBfXNCKWi0Z7CIQP01FNRVx+nX";
    b += "YXotydwywCt9fWivH5jRl14sdY4lL/OiXQDKmVvFYWs9YD1F2Wv9bUMYba11Mi6UQw41mUT2Xo1";
    b += "IqnlTLIby5wTYsyRZuPOrCSt5exmE2XOcTHqGMm2OMOUkVrOlNrlknOLGndkm51py3At52i2pcy";
    b += "5WYw8etmYU1rv1XKOZZvLnGNi7NHNNjm1924t50Q2VubcVBp9dLIbnO58p5Y5yzaVmW8ojT+Gso";
    b += "1OAX+olnlbdkOZeeMpIF7CnqGdjTp9u3Yt82S2scw8SpMRGEMk2QZnCgBd8lNZUntlezZavrKh8";
    b += "leeve7UNHFMc79hF2Ky9afUKsR3ViEmW3dKbUJ8ZxNisvSUWoT4ziLEZCOn1B7Ed/YgJhs+pdYg";
    b += "vrMGMVAMzzackhgx72jbGF/sOcS+Y4gRcWXg0WGEWHgwossINR1BRO+UWpiw3LHOH8WmNQOy4+Y";
    b += "gy/yFQzvtjs5DlWANYjZp878nD6sIf8aeqVAmtPTYvYLYA70XoNIVkwK/MDMoggeYdGhaDfxaVB";
    b += "9wfE6IOQw8NqKn9Uh/rchgZaRD7yXCL++/cbh7jWoCwR2Aiwe6fpfO0KQ182XPm6QOEk4XKH0ka";
    b += "H/EDhVvg7UxuxFdpxvQVM7aK7qxOjJYGblGN2wzXls/oLiUvpc2kKW/Ccf78Cgokafby6dd5dOd";
    b += "5RMckpUUrns8Xz2+UD0uVY8XqseL1eOl6nG5erzsHuGClKgS0f4O4V5CgULw7yXch11T+wD1EIn";
    b += "qSBE/lr6XD7un6eUCxq10c+TeDGWWPA6gW3AhZ0qm1RfJT2MgfZkw9Yhai/TXigxWRl5zwqAeQ4";
    b += "HSq8xZ5ydbvpnZzJMPYGA4+Q6LSUx0WKxh5DfT3wn9HdPfUf1N9berv4n+hvrr2d88JjpBwr/c+";
    b += "Wgwc4jGModoKHOIcAiHBO4g5ymR81QhPMIh+yFgb7THInZVe0RjJ7ZnM3Zveyhjx7enMY4Iewzj";
    b += "TLHnLw4he/Di1LInLo45e9TiXLRnbECTUfXy2eImvD6LT6leuW15BPurCMZZESy3Iph1RbD5imA";
    b += "QFsEKNIKJaAT70SibwJ8bD2dxicoAJXK3rx+SASiNoHQoSqsnHZTSzEmHp7Rr0oEqLZJ0yCoMCB";
    b += "m80jZSh7G0hNQBLY0edWhtx12YQ1BBXhZdcAHDBVmNVCf/u14j1dDpYCUrBqu9YrCGVgxWZ8Vgd";
    b += "VcMVm/FYA2vGKyRFYOVXnOwhC7qt7qGe18oZ2LrLp6E6V08/0bu4qk3fBfPup4SK0LdqK3rkNBP";
    b += "bSG4EqHQYkvSdf40dq5rTwROGWWsvGgykKYalyaiB1ss/0R5aQhwGwnEnSZVdD4dQ14+ij8pgEy";
    b += "Cx/KwgHYoHGTG1LseG4h9hfOJ2YK3uYhePdu4Q7TocK5Nf3LQMxW3mED46Ue1faWYLC3XH9+rBW";
    b += "ehOpkLi6WfVEiU5CE6KHgchdiixckcPL8xSzH7U+JkLqCtGwScq1otTuZaazQdrc7b7MEHpeltO";
    b += "iRtOR9z126+Kk5zhOehHxfcHNwjWLNe4b/Ze1jU0Zc5sku4dJVDDm96VchedMSsQQdjx91UMmem";
    b += "gVav/HKdv6Xq0hdozkiHgLrt3loTpyMAn7B/i0NwzNflI+3pSH9q6++qWM3ZlTVRrjP7Ujoh0+8";
    b += "WAKFKkA0Uzp6eL/rlV2UM5L1wQH3px2U4dMnlyTvUH5fR9fFQ5j8qJzM8CoZlMWWLpA2LpaJcoA";
    b += "6Hr5YxnvtOcJ0s7Kn4MEo5Qc7On8YmJaRZ6D43Cg5w2azUvGadLIGcA3HKICkiqwDvoac8iGGn7";
    b += "kXOX6/SOaKiGG0MlY26TtLgEbJ0ZZeP6BW/rdzb9TWneWocoRVIjPwVIcgH1MhM1X4Cp/bTzHvC";
    b += "HzQd1alykbNErLSV6u85d3cvGerjPB+qopkEX9DgEVFDu6DBJyV4SYPHVcFNg0+LktqLYamktmg";
    b += "frxrtp1PFGhL+eaK6OgE9XeJpRJjOnaxdqfzQH101SqLItKyj4ynzJFIVpnZN2cmNIFLTxnhgvL";
    b += "o6HqUtW+bG7HhzPJ5ujsdJ0xiPZ0xjPM6axniAI7l6PI4Z1wv1eIgWDtXaY3SRDcESvByiYR2iT";
    b += "ra+UnjK/cboiDpYNTo0UMTFYA1lMcR3a/GzquWG+FRqqFZpqQFHOxOn7XiV/oS/VrJSlyaVlYov";
    b += "KKTMkIaEp41Kb/iw7B6ok5n+si/OQBdDu5mFhyFCJ1jkeXvrYyFgaJ7viYCsEbT50k8G1Qu95gu";
    b += "Fn/5huEbm9asy26j0w0g7f8NAgmXa1OzsEbBsZ//RzmB+Gz7lbYMq47ZB+i2/DNqkqswrYzDNZD";
    b += "/Pb4aTDj6e3mKPGXmcH9eC6nV92NZ1YvbbXqMyyVlWJsFGZadvhAmwFPs6yP/4eOV1sFaWJmxd1";
    b += "ekrfQjtJDW3n4428PWwHJZYdsq+iXFjV9iJsJ5q26KjulZv1hq563WG3WAHGk23+a47J1ubc7J1";
    b += "RcnsLLvJDq7u0VbtwrX6WwSyoNAWt7bWHIWtf/ujoC+sb1bU0+B1m8E2mzXarLzZauKmTJR1Osr";
    b += "an8T3/aPQmqxbTRTJ/bRS8gWkml6K0k/G+xWler+CVDcwrk3haTSBrikNvHccYK5RkfL665L/id";
    b += "1w7h0XmOtIAMqNwEnHACgP7TPByBFFmmfW39eLxP3Z4IGC0Pn7iw/NJvvGRekS3kJD4paDA2MHZ";
    b += "XY2VAztPNrTQ1Niar/CTs8r3mc3VfDeoC1+OQbYYkhdr4MDBMnVXgRw86ICN1uaZr+gPBeXEH9J";
    b += "Qbl9ESzeO46U55HyfJmCLdJjSpeQWBFYDPZnv6UIZRj2oe12Gdgex3z4fMQTW38+amiQ55pgqfM";
    b += "Svjx08OUIxKAdon292F9R/gOER0X5GB1U06pXczTO6NU1LA5P2x4Tkc2ux8+TDIZ9keJYxw7Hmh";
    b += "Z+6EyYno0xHZiwFupPUD/8qUX7YXdFnLH7yVERLPA2qVeigq+BBd6qY4HTJ1gXx49igYfEAo/dm";
    b += "LFPiW0lGqKjF7puhWw/f2T0zjbG6N6eUYPK9N+b3CeQmejLwWAA/Jd7x4X2TPddo3iMb6Rg8iic";
    b += "jswEfz6kvMPsIQyaXb9b7N9vxiMQrW/KySKMpCI7bMXjxSFmGpfDWypGvWhP5xOxP2aP24yKp5P";
    b += "+9j71ZSnjmPS39akTmmE2gRGWUDNX9GxHIfgAQB+VP7sQddjLGGQcQBwb5qfSHyHPaaQwB/N0QU";
    b += "UTEyKaGLaRNmXrYwfydQsilJioixpw5e0hzzDzrF8QccTESnFEF3l6zLNhYaUgYkIu0h3k6TLP6";
    b += "IKIIBp5eOdGng7zbFwQ4UMjzyht0G2eIea5YUHEDo08Y8LvPAhrT5tn04IIHGp5TuVjwuNuIVvC";
    b += "bMmCiBoa2TYLbzxGthaztRZEyNDItkWFDMgWM1u8IOKFRrZx4cUDAHnrYzC0PGhfQe5oQSQLtdy";
    b += "VZEHFCqGKFfIRJ1hYp3KF0EYOO8nCehUsILLnRAsbVLKAyK6TLYyqaAGRHSdc2KiyBUQOOelCNJ";
    b += "1NnGJU5MQLMaByxm1M28kXWojZYmNiJ2BIELPZxrSchGETYsZsTOJEDDeohAGFh6Kwae+5Pjmgz";
    b += "8eCY30icpc+KC7/UijW5e8EbBqfHt4Z7HAHWdEtwvTn4zzkZkR105BS4JTUO77ZXS4PZcRRQbXe";
    b += "qJ4poo2LWMFPDtIjprRn5w2ep09hBuI0G6aPUvA9OBzWTIxoDAOexZcCuTNMYFAekucxDNmDECv";
    b += "c6iUiWQjBUQlZDIyWgckdCEI2oSfwUeN6RC/PYpIfqRE+sCgCgFNgF7R/7LHCSu7rR9iQWIOPiH";
    b += "vy1dXsU0XCCNfvhBiYCQ6xdImMATKtdu+HZX36I0aYVYb+isDYP/GVRc/RJqhQ3pVWeek3AmEf8";
    b += "f6c/rwRppGnuABd4Fq6dwqxGcFkv6dntnSKqGPJkuAgfVzsI6LAfbm4MaFjNxEdGGFmvGDf+mTU";
    b += "kR5eK9N5l8n2Jv12KL8f4jjdec2X7iwL3nXNPLtcubaP3wrlF+ViGbGeSQ2fiKBw7490uBi/Gnv";
    b += "Vg8c6RunHxoidFN14v3jWjm+ig734izbw7FkHLL/0i9SyD4qnokHxnUbaU7Hfm/HJqzTuO8Jz+m";
    b += "8jMcevkF3hw8Pfxy/n5gd6IVWs80CWHF08+Qfhoxeiih5ZSPYyyzT4mUrACKKf0y5gbEG4kYkl4";
    b += "KSiCwKSMB+GnEOhKyfx/77x4p2D/kgWL/TXTXn9lFKaDg69fssXQd0IuHO48gNx5VDWAkt63WEi";
    b += "MHoUbvdTqVHccPYBz8/6YwhfYqKl2cj0VN6CjS8cDQTFTfC2OyQMdEF46NE+hZ2mNt6+cXsCD1O";
    b += "O2aHvxiwZFJPFk/+Pg8sNGiEdNsORwojJLoTh4lja8xhjyeEasqccMkG+gb7CRSxQhnuBdASyII";
    b += "Ig8ARP6BOdQOsJhy62QxdXQ5dUQ2d3Ypt9mAUbDFxYG7jgVQYOnjgpO2PtAOYhem0W9iGbzgOgl";
    b += "JKoxsBFZPhg4AIdONBsoG0wcIYDZ1vbxXJmQ7p3y2Y7ENLGKztEOgmb/lqvctjsWX/CKIuQ8B4I";
    b += "i4oJTsas05wTs2JONPTKqtAfxWI5BhtzsRyzuwAtx3atthxDo3eJFc+dYrVcWY2JT4twhdVYaZZ";
    b += "oSxWrnttrVmM7oBcelVY8UWXF0xFjGVqNVUbkNC7aTS92hhs+uZRi8kTbtCVnNkb7RpilgZBUs7";
    b += "FjxpmNvcxXz5jKSEwMyU6blYZkJ8xKs7GHxWzsiKnbjM0aGq7VjMYyGaZtbpiaxk64aXhuwCJn2";
    b += "aQDBkef8NU0I+ZepeXYvKEbABqL6bAZiadDkDv8ebPmOJ4P1BqsPoqzZmewGJSWoGIktxjYHdvI";
    b += "g47tXwViDuc8nrHGiTv8s4E80gL8DH2R4C2ngm3o8eyc2KKVHs9ApMu4qBE4ONT84wzARFXxTOB";
    b += "swLpiAxaLDRgV5L6nNmDJmjZgoev1mUDNupadodeSM/RyJt7swHF7vCwGlYnWonNSdvno2l5PaO";
    b += "Z1tLLcpjnWhbkqOSheOlpzSlJzTfYjsRhNzJZa18IVJdc4qmtdQ/cQm72o6wqnXMINheWavrW8I";
    b += "1rXS34lBBBGfl1LO1FVYl/1XyVcV0eul+iUa99ahsndbWh9uxjVrW7VohpK4msUWSlzVzrUUVYN";
    b += "wqtXFzZqun4H6grkdX3pWBtfS1+hd7228nm9xrpC+26dot1lG0QwsVJV3ikiY/prUaL+HZWq2c1";
    b += "ueKW6tlPyDlVt+xrx5KfHKvxxGvae2nU7Tjri0OhEdO2ho2Sf/ntMnj6V+tOsw6vpUHs6aR9oaC";
    b += "ePSKhsmxvIWUqzlvRbWI7poAeHy63eouk1TInCv4YhUbDSkGi1yU/kDHxqJj+mYfKj5juLZpVFz";
    b += "qJxxjsK5inum5nJGdUIkskxU4sp11oVVZrzrzbGKdd306bIE7MXQQgVHXeJEbOShvHObCCWN8vO";
    b += "nKBhVCQWM5AoqfGMxjlTmmsZAy0HavAUrbK1QZQsjUCbGWELkJURlzZDtHWRWmAB5K00CJIaPMm";
    b += "8wlhnMXTgj0QYaDlrFzXiMWK/k7dXxbelekrHZO7CqiGB5HSgrjLKsSJbluZDQVV/LJCaoQxR3U";
    b += "YnqSA+V9jnhJV5jxpi2UdnlSNSXrcKyzGN0JtSaT5iI5d+thS8hxoluXFRXY7xRX1USTl8UT6/K";
    b += "LnOFNn0HkEWE40/oBdqH3hVdnRBCMzCqEqIqoTkWgndA2sWxTsORMl7xREB/JhMhw56L5i2pO6w";
    b += "75lQbFiX7PDOGV14SxdIKJn0VvHFKcmPVNvmf7THLVJNx3VGX5XbN1wwlpROo0dh1XDT6FEjwfb";
    b += "IXK9HajdHAYGRY9ukh3R14mYLvv4hWUKN8NKKMPAv6uEzK8Inyo0fmvjpgXpUOqygmJZwcj2X4U";
    b += "Af2CPNzudHXW+c2aJEegdoK2XHyasl8vlRSUrWTIIjKh2TMcHqB05mzLsXV7xgdgbi6se2qgU1F";
    b += "LpDwWLQ367+kk0O71K2IRJFj3fiuJ6QBLxzveztFZULcWQ/IM4zHNpPF1sf69Nglp+CvcAejcw4";
    b += "7zW+3PdJwKcbYcXjq237U+7huHs45h6edA/z7uGIe5h1D98x+vCye3jJPWBTiOTxRRd3xT1cdg/";
    b += "L7uGSe7joHi64hyX38IJ7OO8enteHSX/R0BWeSM19tx7fKioWYp+GEDV2eOiLjJuHdOhwZ8q0t6";
    b += "oOSCiILhoX4g7PValvKt1lVqh8IOYDoh8S1aIcRcPsZRGLWrinIoIRbSR3RBuSY6VMPbD2P3Kgu";
    b += "P7sMvhhug0R78lcd3T8fQxDEsn6h/BGlv501npUTEBCAdclMBK9RltyqeUyxWWmZMDi3IZhh6gs";
    b += "KXxUtg8An+kXQY0Euy8vxA0xo2M1AdcT4sYX/vA5fDRekTxGHMc4ECss6GahE7d6Jgc3goIuGFz";
    b += "lwmfL/H09cJN+3n+AF6Of+SN7MWLPwz1UW5uBWhJecG6QPJS/Vzzi0obdHmn3QuPL0luRbTZK2N";
    b += "ujlncziiqE4lLKLrM/RnsLQToWN3XwpoiG+cXYwWLsh+1VZuY+sgL/7E+f83BtQyfsOfWKN10kB";
    b += "w/0OTUD1tPp82CEfNK7h802jxJrBq+60wN1tzBWiPxPHas21a0eIJDIc1f/pmOFElaMlUQ1xurq";
    b += "//nax+oTf4axGvpPGSu8Wo3V1z96cFB8vbPPPv6z0/bxn43tO2Cfv/cKivyZq0N328DXvm4Thvc";
    b += "dQMLP/ZsfHhT5vgMkTn/j4zbQsSuKHn6mxYKpeMau0XRWgFB/zpcguEfqbK949g+fq4GV1HN/xr";
    b += "xabjtCT+xCQz/71UcHxdnffeO9051/F4tp8mxc6dysRbTjxrymtb6/inBn0jVoawPSTWjr0OHgX";
    b += "1QKoHrPkXI71B68dolzSVdr5K5gjIdK7qqxbY1A/7iaGjsqnFmI6y6kZIUJUMMD8B2kvK8qYYEE";
    b += "hEJvUPogWG9R2lyufUHTWv+WzNTt8h3JI2broSOqmzFBFqFCZ1gtjIUuWw1Y98oQ3dn+DdUpaY1";
    b += "XKP2ofs2A1jYiu0JfR9pTvWuVlvKvFoqquehmcX2GGuOixFNUojfUpqnU51qu36BQVDvTOZdZ0N";
    b += "tAW+g9TfFY1JBeqpqhEuyBbw051Hs38kYbZGq49KaBSW9WY9KbOmaCASFpT5pvheZGR/TQQY0jd";
    b += "owjdowjdowjdowjdowjdowjdowjdowjdowjdowjdmQ1hPL4oou74h4uu4dl93DJPVx0Dxfcw5J7";
    b += "eME9nHcPSuwYEju+rukYsMPCM3urA8hTVpDYGF+towvYuTzrmBdxmfjWyk61FgeHoljWh0qEDUH";
    b += "lW8l0iyqmV1iLarCiyiIWjePfCFdkRFspHBuldpQXy/Rr0TsQUpDrT3onUnrHU7tiI+j0QvO0sk";
    b += "A8EAIkXCj+aDpLSKyEDqXeYdTjAlHL5UgavyJpfCVpXopA0swQq5q3zH67uLU/RNkGkNjfSMxmu";
    b += "X+24V3GjNO9ZDQgHHvWLsJp8agnJygdF7Yg8QjcyV25tovdmQzfy3lLjIhgd5YAbdeULhkLZREN";
    b += "cfQuhoIY7ak2jn3j/tXJJTnWLpJp6UvYb4PHQl2CWz2Y0XoQj2f1VznmaIT9zuD9WXzogXSt+dD";
    b += "zTdCp8rUcXrXLvZbHvRb87BnifOOp9OrbgjdBGQUSEpAUQWr8qv72fCnM18JaUhhH2RVG5por7r";
    b += "W47/Mx4qqtkEU1933ydum7D/fSWF2LtuhTFPXF1Pc19YIxPFjOrX3wRuxlHRnpNlSNPFdrS2qtx";
    b += "t9bswmeNMGv3Acaug8E6zym+0BH3AF1peY+0NB9YLyPA+NcCLLwhgvBfxWZMWyvuwfihUBWfipt";
    b += "XMc12F9PJZP+BvEYOkpFkv5GadEN0r5NgbiShL7Spn4vu8HSrhv7STZq52ZDv5ut7w9n68RLaJ9";
    b += "gluImxI4bPYSOHYQOAWDSv9OaPoDnx4rZ7wW4CY89ZneHQLQujl1alGt7y95/trzfxmx8/6P2b8";
    b += "v+TfIxe3UeZD27XeWbMQGPTg/sNoALUMdW8br328I22IxBMYS/9tQazkcenba/I9OPDgZ0LNsd0";
    b += "H9wSAerthsJDDRsN0ZsF9qU8tJlUqobh6Ww/SIVm1CbC90amaZfEKoceIxpDzTSRcBKoYqyTduM";
    b += "pg2zacFjtinMNTxo5BlBnp403+aREcEo1gclwqBEHJSIgxLnPbvrDbLNg2wsB4799QYlydr5Fjs";
    b += "o9rcclBEMSrdvx7Q/ZkcltiMxYkcG4xcWi556Nexmmwb5JlH/sfM/yG8Q33V2HQzyjaJx1MpGB/";
    b += "moqCRtyLYM8g2is5Rk6wf5elFqCrJ1g3ydaD11snSQp7ypiuJQ5EdinlXhgIh5Fi7EDk9jbJCuF";
    b += "5zu0nCGIcYCLQLvSIyAOI8KknNIK5+gwAUUVj4RhXk2m6xbaAqV9lnhNe2zoAtD49Ck4bkU9lmB";
    b += "KD2IfZY0MFADraCY/bm6gVYAw5ygMtAC059ZijM/JwZadEbmU89nZbudgdYajQ+vb550rQ4IuIU";
    b += "O3M2sgKYAjztLgGNCm5oK2eSMqU8BbLdklriDK5S4pVDpX1iffLEzAp9NR4sGXLCo1ZY54y1iWs";
    b += "iYaA0En5WhIQKOd40phYnY39qoGG2IGmypivaZUpoAFe2WqmgTQKPzmdiB4F+NnILCZMUbF6E7E";
    b += "cabWgql+F3FzDvwfxPblioDnIanvifCd4iSQxEm+06MLMink26eSBIreuinfQrSfbG8c1ktEe2A";
    b += "1Kko8KJZCTB7xVwTYTa8FjIqxd+rFQVeNA5i9kpNUeBqCTF7paEocNVhzF6tKQpUGLPAdnkZbbs";
    b += "YqWCwrjBwxewMlqL6AMhtAHS7vb6cMfIgGdLfZIeWgMwjbgaYcknYZmWh/oUoj3cGi5FWqgmx1r";
    b += "QcudJ/2SkSsFNRHlxDm2A1NK9qFNiirqlRQNDe62gUSL2CKouyBDDWPVyNFDm2UiOAftoFBE7W0";
    b += "GJ3FMfnGviwF6I7/OWoessWLcoHZ2v4sGsoGDz/I5WCAeFjL7vkj8RmszMSlE2fTA6FeG+v0DHI";
    b += "1WKtJcDhdbi0vFtTIZill8ASUqt0xTciihZ5WkFQ5ev0drZe0eidfBw8iw16XxwVQPG8VGMIByq";
    b += "Ff5fDrq9J5a86mK5F8e6Ju2e+EdhOYstG2Kb8BkS8oBH2BptvQsQFjbCXXEv0+M6izcc92JI+vr";
    b += "Np83FVzreglhfVh6gpL3zEi2vVdQuAW1QCbwkA3UjWUSy39VlPtQNGs7Qh8xde0g+x8Lb99SSGZ";
    b += "K0iuZfKHQRwL3UnCN1egtx5AhDpVAQEnF3b5+bcr3QLgNfnVA3osBKslpr8figbdtBvHPxOtk6v";
    b += "tiLL6FoKxOl3YKqiErauArUrp6c2MbUpqU1GbRpqE1Abeo+kkFMnkAqgtiA9Gio708k62o1u1i2";
    b += "x7cR270IkPjxXO0r4odIW9oQ/cNLLPEI8FYfVmFaMXFei6ge1O7opLQsD1aJqouqrfKNi1zjjQq";
    b += "d3UUPVF1B/UxqMOlB/5xylAeofl3oos6X5ogD7O18BTWD/pOJZlPHCQXSsCdcMUQT5oUx9Wq7C9";
    b += "q8j60O22VmB7V/H/odss1fD+hcXns5Acy1s/6hWuvSzifDfqpW+HDhcfyn9WOh8AwjOv1H0fKNP";
    b += "MAb9z4jzbyqr0qESxx9z1lmF898tpxxz1CvdL1ylD4BWA+ffrmryxpdg8LQN1IrneOOilLMSclb";
    b += "Qa/FNJ2UkfZ7W+ejtms4L994S27bdZJ1GFa880J28W/GgW02lEWVky7JR4MySs+7wSet8ecctLp";
    b += "3brmCyB00m+3JQgeFWTQxczmXHK5c996LEAu1VomebDHYidEqKOJOodcxbo2NDWViVU3Vm1vGMo";
    b += "yyoq+ige4BwzTqNtxxaa61LK5j+7YrhH6pK5rXa1ZJ2eVWm5UbbSn526NrW4EyHWacB8Fu7m1Av";
    b += "TTRghHteL10qC8UvrddUH2o1sX2Tlfz4JRBOnbOR78Pwy1KZmfqZELruPeBjzhqHDVT8AzHug3b";
    b += "Ie202YjiZEsPJlBhOpsRwMiWGkykxnEyJ4WQqDCdTYTiZCsPJVBhOpsJwMhWGk6kwnEyF4WRKDC";
    b += "fQi9+EDHwqmr+T0sVvMNTT0GWGNmro/2DoRg19naE3aOgPGLpVQ5SrT32/hr6F0KkiOCikvoyPJ";
    b += "yaikDPiSlwyjPySYeSTYXSH50ne8LXkDSVv8lryJpK3+1rydiVv+lryppJ39LXkHZW8Y68l75jk";
    b += "ncg95PVqeb0yr6d5Jzo/WzFYPEdrTwqpnQm3hCrqEKpmPMonxZP79vRzYd3p2R+H5XG+ez85HHI";
    b += "BvuIYCCV+5kVP6JVdJUQoeAo7dgYPZq1T4lzr3fsEbkX1H2DU9LA2xKQLMW7l8mBWMGnMNZk0tt";
    b += "SHXeHK28jQrUjZB9v6TMwIbWqvtVeP2/vIsU8uCueFTCTC59mBrUYFpBadwYOllJ6JVg3InbTvE";
    b += "r9LfVKXt0s9O5SvbDejvQWt2faO8/r9uCUIHIPIPgclf6jJGFrRPJmiSPyKgU/0N5qd4Dqz84Bw";
    b += "m641O6LnwtkhwCBmx1yf37LGDF2lI/v/ukTXXqLnP2XXwJVP/X1doiua91/0Ev3pyLlRX2OJ5i2";
    b += "dwO0yzJMYZplarthYBmhM3SBipqshU29xOq3XnL9Q5i+S+RPnb5BRkueZ7BXYhb3je4iM5SatTT";
    b += "SonLzQoYd6FOu/Uxit6TXmL64tpuvMX/vV5i9ae/7ap/KgNn9t4XM25i/AtImivn5m0v6sfQjKJ";
    b += "Py6yHy1nbHz18EsHoIdGuYuaMwdsUVbq7r32pbnq3bPXKd7snlcs3tEwpTu6fIckj2kw15+ULrX";
    b += "sd0bYve4PNfs4n/dQV91B/1pLPGf/nu7gzab91/0DvqJyNi7Uw2B+4N5KLgWBK8EULe9KjhMhVD";
    b += "gLIhvCUTvZlIiSV1CfzeTupKUEiO8mZRKEkHIR5tJo5JEnPGxZtKYJBFKfKKZNCFJGXHMm0mZJG";
    b += "0j4HkzaZskTRIZvZk0KUnbCaHeTAKUg2dHDRt9DckaIunphUNuKIlvaKYXkFWG89AhN5YBXdJKW";
    b += "lJLSySt69K6tbSupKUuLa2lpZI26tJGa2mjkjbm0sZqaWOSNuHSJmppE5KWubSslpZJ2jaXtq2W";
    b += "tk3SJl3aZC0Ng+pN6nieIhNsu81n1/v2zk9EpdwubnihWKGLuETcOsdnSMTbQx46nUqYfpDXkJQ";
    b += "6n2RlJKqqtxQ2GCZLqvbIcvRdGuBEJe/pijfIavVfUb3RJepQXvEqnod8+085flNcb83qatVZk7";
    b += "y05MyFQmGonIcUrsp+3lR1rihFjJTOm1opPoVsWtJpv9H60762mq/NB41q5smeQWVvKrPOO6bYR";
    b += "V/2sXPgdVWdYr5yCE7X+Wll5+ebTKp5NbNbXUvgGGpXAi05/Z9FDH4lcHJwqfQqtebLIs9EZQ1g";
    b += "fcVlqF+1UyuUvpuyo1459+ryqCFSppLkUuS3KywILE2waYWkEHZP6a2ELKEipnSZnn2FRrgvDx8";
    b += "gQkmwH7AOIjG/dxykxn5SqDz8gEAi8mbAhZj0TFwXUM/6Qi28PadWm0I8RVC2i++wqXIA4y0q1S";
    b += "EXZPst8QXeguN50rwR1F5utqcondbbvpJFVvipulZhCeIHvjAwu8dZW+bnGShNEwrOOYOFbX6so";
    b += "Mp9aouxwMmqwO2giEHu2BxT2UeyzhFbZETMr+LFX3DOLO22WnynDJ341nNesb148jPOtWWctSRE";
    b += "9XDfvlqGiBsRZJw61c9XvYIEA5ao7edQEReXFkppqE4hVnBO+naSgMj4t/UJgOXwthBmbaVrJoT";
    b += "sGOurt/ITtvpi6TOOcEgGNQKmRteENVKCdI34lHe0xKT/pBGyZt7IzeKIkYpmjaVsZqAABo6p0D";
    b += "Zyu9hSvGJqt4pOjcDpPgTdtU7WfSdV5jo2p9PGBARE5+uh35vpHOYGDPAPgI+vE/Dx9QI+vkHAx";
    b += "0cFfHyjgI/fIODjmwR8fEzAxzcL+DiRaL/fVx5iuPDBfPxU4YnyHvz+Alshb4mKRSIKF23hnQ0J";
    b += "u60jHLquMPV6wgccFtbhiHAb7ZlX12r1Uf7+A8XWx6Zz2MdPU0HVTnXg3EhsydKFusMO+HpgUVn";
    b += "gvEpszkYW6p46XJZEsuBIHsuGF+ouOlyWrmTBybwp6y00fHNollSy4IC+IesuNDxyaJZRyYJzem";
    b += "PWWWj44dAsY5IFx/VoNrTQ8L6hWSYkywR1v9oLdW8bLksmWTK6VkkWsg1llvUuyzbJso0+VVoLd";
    b += "KoiWda5LJOSZZLkcUxnKqCABvs1fbukb+98IRIcqkzFqVBt6UI29lPPeerS1G4He2FhKhucl8e3";
    b += "eg/3BOOEwNC3et2eJ+BQLfwkdot+hMjKJJMEPCjBWfe/MyYlhDJxvIruI3QdhEkOxVURtIuIQyf";
    b += "4USm1De3cdKjyAUpZ1FrEs4Nu6V5lR5urz4ViOWAS3CnQTXxx7qfo9NIXXPD0yyFMgez55N/d80";
    b += "qwbEP7I9v2PfR24e3l/tTIvrcHND4UQ752yIeEZ1j3EZqqE/6lJdrJRowg7+ZdJoYQRRY9vzUv/";
    b += "SMI3Lp0B1EcVHAw54RDyten1RXEkwKM7yogoF9VQXTtCjIP6LFrdqtD9PPijcXJp9WYx0WcdRHX";
    b += "6XckGueuWeFuV8DzZQGw1y/bGb5aO531hufQeD2Hxosllf6biFBmdq/8bGTa6i5Z1AK2DTIjMuH";
    b += "gzZ79HKZm8S+ES11iTmUCMTYmP6k4WFZlQjkpPbmdhZSzO2XzOEvuJf47tY2pcsorhKoq20lGJ+";
    b += "hpL+23s7g/RIZTWEyICtIkA/TuO5UdRWtCOw2ozO6TovPvO3tqWtVSidzz6XgrOJi1B3kHKJc/Z";
    b += "o8Kk3WoxGzfpcY1wSCxRxFbK3X2uPCuqiV21y7RVCWaeomRljghMG9jALJEAcBgI84Rv2u8vc54";
    b += "wJvCtj6ELyfuR8BbD+3k0AnJoYFokHt9cb/cd9cWGiDzmiIjCL1tGoivGP/RleOvQxytOQ2Gitg";
    b += "xFyWMOnOvbK36akaDfQXkcw0mYGcLbVMVRzZRnWU7g4OVbbXDmGTRvfI1ZBl95hzUCj1Fz9/mmm";
    b += "UJJ2jrG0FRs8v2hdBPLNHqhHrBQkGRqL2qkszgVbUjV1VfDsQFuf6rc6iOXFV9OQkX5P5fpSWS1";
    b += "nVp3VpaV9JSl5bW0lJJG3Vpo2Ua3VmNSvKYSx6rJUdyAvpy2C0IK6BKjuX08+WgWxB2QJWsaIq+";
    b += "HHILwhKokhM59Xw54BaELVAlE6+RbGVfvKl15Sob2v1t60Guv8I8plQH1PrzIcQbiQwlsiuZhyQ";
    b += "yIfTlVgBpMryN+JtbD9KkQ8/pFsKxhCeIqGnDkYSp/o1wKGEOHdverTXcR4625MCZ3eF5vfUgbT";
    b += "3U7VWoXYAolZGcpFr7u50/DwUp4gxsSfUCBNAvT3Rr66BfKGky5ze5XbQsTZHhf1WmNU6ZtoT88";
    b += "skLlTI/FePFbTh9cPfw+ClbSvnNamhLMDffgTbRaSbqshcX5biRQ7ZjZ3DCiINRet2EOig9FXoK";
    b += "Kya+OJ31ygTwvuzvCcX7oltC0YJRpp2nyjLnajFEaKxhgnlkyoGxp6WTuv86ar7KrGjIXwbiInG";
    b += "HgGNxXYze4Z808pjmdn89YYiyfLXkLdC4iEdU4pSXZZEZWVY6yjvwv46yuhvV8QyhHXF/L5LBB+";
    b += "lADWauWzu8qsK61viijCdi7ctyJAPIiDPqr5DtPmmb/T6nlSpNF63Uo5Uuax0SCxfXk0erkF88X";
    b += "4ag9XqkBMAyxsfCW3QuLKiR9z9mntiCiaIzMSzEMVS5CohQEfLqVY9M1ooEgkfjdZ8oe8WOveo5";
    b += "ZJEagv8qko8AGoKiWD5WVyxPVyqWr6VvvKZa+dhrUCs/RwXEsUqt/CKZQTZa1covhk6tXGwzlsN";
    b += "KrZwuIqn8I01NGghribSxuxphrWxlJGVIM89ft5kXTc3StGroybKh72C/JfMyNJWU+aJQea2VGv";
    b += "Cz0Deu1N89aXEoXJBrqr/Hq3HyWk79fbZVw8lrOfV3G1vHyWup+vt8q1J/t7ce6Swo0flWEyOvt";
    b += "dN2r5wCHYxwkH4S3aVGXl3lG22gyveRtVW+18h5vJZz2X5fc5Vad1Pr+0JodhDbx3OLdYdInTzq";
    b += "qw5oAmtKhVUva4b94tjXFhWzTJ2ei9LxWwnD2Bc4+T6n4XYB1Q5liHcJ7nYiuNt3Cu52VzC5dzd";
    b += "wt98uuNujgrt9j+Buj/V52b8PbkTBbVmHnwfhOHSSbAn781B/VAC+N+Lnnf0bBPV7E35+sD8mUO";
    b += "CbhSjcIrZ242JrNyG2djeKrd3rxNZuq9jaZWJr1+eZ0895DPVfz9Osv42nWf8N+NnR/z783N6/C";
    b += "T+7+pP4ubN/M35292/Bz9v7b8TPPf3t+Lmvfyt+Huy/CT8P9W/Dzzv7O/Dzg8KktvOzI7ste1N2";
    b += "a7Y9e2N2S3ZzNpndlH1f9oZsW/b6LM9s67Kt2euyG7OJbEs2fn1cExCnj2LCHj0Anpn9m2Rt+3c";
    b += "o69i/3axn/w5nI/Zvmq2zf9dnG+zf0Wyj/XtDtsn+Hcs2P1ovEXyWzsuhHwuXfvdAIKNWwZQYvQ";
    b += "gEfuhZivTMr9lVOVmc/HXHwQObMv0SIEUJJx0Qyxg83mwnSM0aojSIAic489VZGPiPZZjmZpOD0";
    b += "ktvIlZMeZS+SCI3gSPlW70uLIzE11SoGNMhMKbVtBQkeYGl/TmfxD3Zb17hPxDSXXRo75TCdzTT";
    b += "6f/qi6Piv7MujK3owph0YeIaXfBFlMpeWGInSL8ZVH1Iyz6MNvvQWbMsI56S4ZnDB/lpbhYIXe0";
    b += "YqMtkZ5BJ778tehXphwJ6AED9E84wMw+02ADFqqagJhlNMsXMP+wFHbvHTTokZ/eAvYg0M5rhkR";
    b += "luD9+PR2Kmgv0s4H72pMIIEDJ23gjbghamR6C9TBtzAUTN4SGaTOnv2I2vi0BPQF3zYSL946ixg";
    b += "RSBdQLumq9HAOYnL9rAKAIbBeQ1vwGBTaKLmY8hsBl9fBjuGGUDhYLsWcrSEcYfMRLw1ZgfrhUc";
    b += "vhI2W0SXW68kEtwKmgdZLxvJ1mUbso3ZpmxztqXJAZ3B+hG7fjkTHy6++0rHhvEXcmR6B83QymJ";
    b += "29uSZlt0UpvWp9MCdoUfFh2fPnDjEZHmSZNv7DL0vPjq79PuHmSxPkgzKFiNV/Pt//dM/EzFZni";
    b += "TZjmqGUS2+cubn/lKS5UmSYfKIGSj+wy/8+oelafIkyXa2MsxW8R/P/LtflmR5kmSw0DGzxR9f/";
    b += "N0f/8dMlidJtquAPruLT3326WWpW54keR4qykj+xK8/8RBT+SCJTxrxal786ue++hnDVHmSZc0t";
    b += "u/O1UDhDKVXrV2AKmPTjpq/+b7sKPQ82CXlR5DgIooJys+BoJRFgNbFJFsYlaR1ym4gskMhpBgD";
    b += "yGcTYCwFQETIcts6P8Fgm4F41O/QeAIVaJSqBQBUQ5x8/l7/wHF220IQG7IEgiywVFRUe4IPgXy";
    b += "YGG64d7PZnnN+b24wwe3zPiALFpLgl8aX5skn6A5stj4tvEYkJZvtD+yC2AFBobJflvnGwLMICb";
    b += "vqOfckGxdl9dwCywhLjtvY2OHZtsi5nwHcUQIbQjq1gE4AcAz57ydtqKTpCYDyDfQ44BqL3Q2wD";
    b += "eYugTArJLgCgYNaIef4acAbkXsrIB1q7Ay9oCe0A7ppP5ABajxA5QErHmIKDVCIH+EQOMPs6uPZ";
    b += "micJEiGMZO0s+kQ+Jct/5buhE4pnScOQxpZeD2kEr+NRJReLau96t3g5AJ2ZRz15WxH+MrTv9c/";
    b += "gy8LEIOD2g37uEwLMxO4RFOQly+mZLFIF09sSzxPnPKhE+KraRPnZ6ryR7Y3v3pVMcWU+mOPmlR";
    b += "a9CTRz0SZzKtQpHsvCbINwCqQ98aDDh0bc7xFa8S4moD8GKaAPlZLMz31jJcHSsxuLp3yCBcemF";
    b += "ksBQ7T/UuT0LgBry7BdBRxcvlnmCgjYCntCxY3sAJYHbVfoL6uAHA3kHvyUd3Dd7E8W3vqjkuL2";
    b += "GHbe9LF54Qanx1zTYvCOmXwhzLxRVJQ4wq/3xSKGx1/SQwCwncc66ApSZH4BbaXBcXrecvT2vVk";
    b += "7680Ky596eDFzXPQfknKanCCOM7990PJ9YTYcE8zxdwkZ2EXZhvOdfkXteCJ+TkpAeM1zEEpc+E";
    b += "5MTjf00xZ/R9Mex7cyTcxOCGPI8kdnOihkn6CEXhRMipOami8rCm72xncH7iqVP28H/CrA+LugT";
    b += "WN4w82pnK3NfBG9cXGuigU/DcZ9Rvk1I55yaZ1ctS1icFpux4mV/UGYObw6u+juDE0E5Cujkh2O";
    b += "aAlIZrMy3S7NdqWcLs+QO/xlIhFt3+KftLz4DZnu5ka1qrkNxZbt+GUknZfT9Kilx7T4TY4y7fa";
    b += "PzJSXM+ppvl1ZR3F6VqRPp8oDFfxHTcCka8A2XFwz7p1D90zGNRZV0tKv4dMxuBCeQev7TkIsdo";
    b += "7d6NumXADx3hqoU36zfH0ScQhh+SHd0X+P3DQ0i2dtAIGFvC0VYDfGM/ZZuEvTnHbJqt/WoJOIJ";
    b += "A4TSp9/3VesJFz0QsQFB6FO5jBIgCBtMgMnYDhAjsEdjyKrU78gvhNhm1vimjX7Tht90+q/FPwl";
    b += "cYAXabAjMuMHctKr14mc3hUGsbXBC6p08OIzjXpt00yA9bpt+qzdqSfW+SjVNR+67kfYaAkSe6T";
    b += "70J6Ky9+8Qphhev2lPL+oUl7E3XvSKZ2sbHxWjRgfpZ6npCaQRZNcWpJfljMnaO7lt8IwI9b6w/";
    b += "Q5/l5Ks3BDvdBsiPLjIhnjhN5xvFd2Wn/5iWfNrLOKZL1aG7LJJg/trXtNsiG8au85eCf1Q1tkx";
    b += "o9TZNS6pQe2Sevq8ayz3xkjlZHDGlolLYbJAnvHxiYEY4PUD/n/ThSiP8cd+091i0RS2IPGVBMc";
    b += "k9nN4MIum4EEB3o7sWns7qPs7cGrASIwg44Niu2A5Yz940ki+ef09YuSFWTBOj4OZh5GJik+CTi";
    b += "2+f1C8Ud+Vq2fgrelUCX3Yvb+v+7G7+sJr2+dKSZ79aCrKjr6OJnCN4H4es/ufYL9FTovtXHwM+";
    b += "fbkKF4+z3P2XDmO7BhOpRDKqL7ghvh6Kvlyukkeeyw5cC/uZvW6ujLUCakjyAvfDQIAzSrvqCEc";
    b += "WpGgTuBxQ8r8dqgP9pbqi8ywvCpXpW+T0jNX+WQ5NMz0lwap2yXTZJ+YU75a7goBfUzcqui0izO";
    b += "ir4bGXr1xDbgcl2JSL/3tWDCnQHh46rzRbqTwyEj6WcheAsUH6Tdie4CrL0PZCsVdoAMoC50EMY";
    b += "/29vyV7gKD0l1gALH8VaPCT6JpB3vt/kFnhcb5RfPTL0cjlKBjY+QwJ6Ax/PRsTBpKfQT6d2uA4";
    b += "Bv07lf6D8SR7pjqRgRfZQd6ASskJchIPhF1TLPAi48PZ4mWKJNRcD32yx777rq0hoPEoO4g0Xf9";
    b += "8NVBok8HiZiRo3G9WbVxoDRDRqJDfY37SXwFj+WQZxenbU1o14yrE4yOzD+Y+4SmQyRWDKWA3On";
    b += "BBu3wMkN1Fx8/1IqWH7RMqkyvmM6I+pH0nB/J0nNlbVRt2zs/GfqBqCMei51OQlLTsKT+wi0aCT";
    b += "x6wCQW5/+Xyg87AFeqCNWTk3xUwySVIE+i/WoLLMRr/HtqXuMX9Tg7RvSgq3QbX7bhajDImkHRr";
    b += "WjosAbU3AzoRmZCGgBr91Bcrhu3XVMB5HFxNU9VT0I5xfqChFoPUaTw+IDwea13Cp7yMd4iKyft";
    b += "Ut2xRnVoGqvTavillS+Sv+WqLWskzwl1SUPo3b31jnqdtg307u6XYyTlMXQVobLYajSkQUvhoDZ";
    b += "AVOA9E1Vonjqhi0Ydvi9KBaSvngnFRwbEZRHltIuEEHaDuGOv7jhyNTOrfGL4ig1pxCeGyfxGVv";
    b += "GJ4SAEDFBhazACcd2ZDyFjV/vFMAqvaxSkvow+4VzQCGQsIAP8yn7dKLqu5hNEVAXf/S1Tvq728";
    b += "b5DGS3TCKyKP6Zpx28cuq7A0iS1LKg2ERt5o4b2sw1/RUR9taQjvjGCsKLOEo01KH1SaAt+S+Uo";
    b += "gfP4UEZrTFyHbYVrXHlF/KUErl8CdGscmG0oLb52yK+GxaNWOPw/iEDz/w5MMKM0kuwjIAvST8W";
    b += "OBp/IQ1USGxPXrLI1FNHBzC7Ih/HBj7mbETmZIBPK8OSAR7kL03gMDOSAvDe//qpow9beFTC02s";
    b += "viS+t94kqRu036J6HQ0mixbmGUoAu1P2pbSYMrZha1QGgNpj8el87uUcpsjOj39PnSu/u8NzxM1";
    b += "MEQ6FH70VncxHCi2MBjxH68dxzjOs5jCF8k3Vx6omMQVLY+njh/3FGFE/GOKeFuEDmHmbv3p30n";
    b += "LrDj6qeP40O0e4d4NmRLn7df3lS9nJe9FRXN1tQT2JJ5F9ERyBk76R8OTYsC0CHRGogew71ilUt";
    b += "DYbTR2Z5PXTo74QjE1K2mH0BaLLXEVSeWAj0DUknaE5Lz0IB8pEMDsuD41ozITiOeISEZZPDtF6";
    b += "rrB7v58/qE26XwjEJ1GqEKCTx1bXVEOd86nSd7xMmPIyWA9yoN8aEelrXQaOWpxjKf9q3WY7khW";
    b += "UGffKJBgFxCDZFzB934giwK+nYMpP+Z3cgOOSX9wwO832IDoT52UEQcducXTaCAWandAP6iGGF5";
    b += "ooBfiDMQHO/JQVVXlD4Eazviozx4spHWaoT8Rs6ZRuiX7FNxo0SALv9uYK9HQdOiQRQZ7Ewsmj6";
    b += "Y2US3fxhELM3wyJwTVp2vjKAJfcKHmz7h5/GpnCD4RQh9PxFMiZ8yZx9iLx8CsrrbHTEu34pTRk";
    b += "ouln6ywh8U1mM6yFYANHpEITQFdk+gEAY0dYylBDnLMrUAVNu5+FAe02gupkljK4ud0VysrSg1C";
    b += "blo1XiOorpSKacjVhpRcxSUbKkIFjHlGLgx43qoEQ5BRTiAYBAvtuDrZwd4neXz7MyBjkDMOQeO";
    b += "9ot8swfVjHhq1/yd3l4+Tc6/1dvDp2T+Lq8ofvFTUI5lC4plPF996jm5Wf8CtgARXMCR1oyyjcm";
    b += "k95RrQr/sTSHClg5dJwgprj63E9Lk3UfwpUdFSxzLdwf9JFgpFw4bMgMBzKUfZmzMFSbvnl7U5b";
    b += "0jFO265zxuU5ZIieG+B+8Vly7b3ix6dSRfSPp2wyZo0bvX7RQT/UC7AyBVbnZ4c7DdjunnITztM";
    b += "CzHBUtp0W37bYYeQ90dG7T7in6A8Heqrshuw99q3dsD1jF2uqF99rJDd2iUcpBDYJOgtip+U+UW";
    b += "HD+AbYoqpb6tmJKQQCQhFE8ojGZLrIfhIKIYeq/t4tAj+4sdBwTjRtdnV/tiO1oQxf0bdqrv5Xc";
    b += "UFS9cdo48ORrKx6gNXoDVB+FULnpfpS5pRFFE5ydwmYXsNXR+ouh5jXu4eTOQWISV7xXfOa7K/S";
    b += "ICkmi/Fi14niRJ9LNOG8Zh8iWdqEP+4LJSWViB9K25tvKphH/OkjlTs7Mfnp2dPTH7bXvenaG7B";
    b += "Etd/bZoodtR36u+rKiFD2kSGG7wWGHpmi3aLH7D+2VfofidrB9wAZbEgIcug0TjF6YIik6qukvO";
    b += "vjwBS2VFqXa7fPBvodwOZSMrOub8S63oQFirKCwrCrWicK2KhI1c3jd5g5TDyVcNBbIEu/SbRBL";
    b += "yuG4llX6euxwEtYtBaWQY6I3UOc4LSmh8ve4s100SJShoZC25jwLWKlFwsFii1JUQyeKaYyES1o";
    b += "oEKf6J2hI1G6gnofI6vOjsJUNJrpUrBqH0TqQ3YndPabSwEWzJzSGu8lfNqxDHeMNRi88yl9x+Y";
    b += "gHxCppXlaDm9IOXFSM+4xheoxmRNKNE93I9d01hSBx3hPWR0bFTX3iejpXzNCfZKriuoI7e5TQl";
    b += "50JjhPt1UyZ8iwP4ldC1466X8lr+/s3e/vvz9++6Hwof2XBH5+mt21fHXQIeWQ+fWRFeXhHG50l";
    b += "xI8KdZ+sCbA8HR3FcuXUGplEIgIEb8WnKyAaT4hh/WvKBF4bHQnV1I9i1RKf29BxWGc01VrGVKe";
    b += "xMPxZ20p/xc1M4QC/Q+Xfn/rgoz2Nnq53rNNaAhDS3h1vI+4U922gDAX8UPp71sHZSiHB3+ucRX";
    b += "CpRehzSI1QRQbJB1knJIgzGeR3YA0fpImIywgIu+0VOMtMgdvKvJeiIcCEQQQdvQlqH0Z4bYah7";
    b += "6Dl16kVB21JxWg8E18/+2+ckgPHu4sz+1efInqTcB3t+ejQUy1ge7aD5k2Lp3HOi2p0Miu/g+dK";
    b += "iEpPFi/ap2FQcec5G/IfIu36FZ59bWeGP0BrMtqPYUrzwq1rOPw/EgHAHqVSxHBDHBtf1Cwhdk7";
    b += "pfQF/9AuIkhcNE0ezOQPrWVKjoVssrqCr9+1SVLsjiLHaIngk22x/I9KJKB0IzaMqhaa07OFiMT";
    b += "T9Guoyph9dMNZr6QWiYa6pfpqKFAW4JMFOj+7sfYPW0OP/PV7Gw7LAxpDf26X6EGvUHi2z6QHkf";
    b += "icTS6JMUdaiLsmUzvUf1n7bzQj5rpjX834x0/JmCUJSeEF3i38xGvG2aHAB+XMEMqITCP4DviI9";
    b += "GHsG2xK8vM2mK4IAlLD5vl7yUipvnzIDsiWloF/pbnN6JJ6op/Enkpys/qfyMys+Y/EzITyY/2+";
    b += "RnUn62y88O+bldfnbJz53ys1t+3i4/98jPffLzoPw8JD/vlJ8flJ+H5efd8vMe+XlEft4nPwfl5";
    b += "3H5OSQ/s0Z+j+jvvP4+qb/H9Pe4/j6lv0/r7wn9Pam/p/X3Gf09o79n9fec/j5rpyty/jzAH5HJ";
    b += "oRjN/ptTVvSJllMfmY8GTt1Ndd/s5r8zmKU9r9CgdkKBCBEBgAPQxumygRzzSgh4HzydVqFhVFw";
    b += "OxQQR5GKosEARlO1FCzQClTxJ6WBUXJJYQzdNZ4FiXpz0KfoQWfDyWN6mJNL2pUPLPnObObb5Dv";
    b += "9lKOG17/Bfol9vUuFXIfJD8zqObA7Z5hDAtVmiiWDpfoOSw9M8jygyvoxjxf4uq+z4Ymgban/P+";
    b += "FBdmfQvAa8izLRxW1zL1BSnizo0xYNQeBHbwrOg+mWRw9wgkMezvqPcKUBoleR8oupAKiUry8nC";
    b += "m/1n/J3uK/FcfWf9QXWfq3JHa+WOqty4Op5oKSnIZXA1cMvgir/mMlj2MyHUZRk8JRAoviyDP+A";
    b += "yOO+7ZfCUccvgeb9cBot+uQzO+eUyOGHKZfCsX1sGJ6EXXBw3tWVwprvGMlju3uFf9GUZXPDLZb";
    b += "AEpRY0r+OsbEK2OST0dqKJWAbf5DJAi3UZPO/LMlj0ZRmc82UZnDCyDJ71dRkcN24ZoGX1ZaApn";
    b += "BB+n8+YchmcNuUyOGnKZQCLtFdfBmeMLIOnzeplcNKsXAbMHa2VO6pyYxlcpfP2L4Pj6B+uFDCK";
    b += "1jRYdULH+MXND/SMEmGljy/433n+157zCCnSIpOWJr9h6WAEeBOtw2To3aUul+2QxlPZPPnUh+w";
    b += "5SNbaqZyacr5whmv83qDk95ZyfcIBTDdaFqxomZqchQMhYFApWI5lm6Zmf+Urt/01mxVdqy0p21";
    b += "IcP2+pIz99N9XzJOppRIUSZY9Uxj2DuJbE6dFbnEfcsMb5Ejf76zZu3MaN1DjHr6ziI79a2r9Q6";
    b += "VHmFPJf8AZOxSMELI3fILBVbxO28uqix/sBS06f/twiqL7nP1eq3kgWHJmBwCmrenRI8alY1Scc";
    b += "1OKlZxdF+l08hfc/Iu/LK9C6ALX8A6jLvhjwE39QLauNnMa+mm6IeH6tawSF3073Uuyd/l/23j/";
    b += "cjqq+G5211szeO9n7kMGm7YHQlzn74bk99oX29Hkt4UXbZs4jYIoU2se3D/fe/uG9971tnx1rTU";
    b += "ipbUNykIjxFSUiYkTUU6UmaqKHNpYIEU4gYqyokWKNNdWIqGlLNW1RU6Xlrs/n+11rZvbZJwSIP";
    b += "3qfymPOnjUza9asmVnru77fz/fzyceY9abotxeNma4iishcrCn+WOEQ/D1jn28S4LQ0IL+HEaYO";
    b += "95ePfoTAoxvumY/6pgkOdxX6qRTy+N5Kfqrl43ezvx7dWyG6BFxQ64yH0RmvkZ2Ecj7hBKl+MKu";
    b += "AxKNCuFXwVh03aQg1jgrivjGEWTVqOiKgqwFYLCvbGsrMqniteHboJ2mrT8c2g70zdRSBbLbYpE";
    b += "XisWwHlQo0EIrITK3VpPtqhGcnEpHT1DJNuNVIrQRnTWAwTyQo7CSsob4hU4mi1upCWagrE8r2e";
    b += "jWBBD0TbviWlAwFjEGFJc4kbbGULAlNEVXQEEtWkVE+E/lplC39MSc+uhmzJuRsCfNOgA/zjT9L";
    b += "SdPy21J1VCoVQg+ERMIyWc5sm08CjyG+s36rPP6WWtEBigkcqxcdDRurgnIlYMYPtSQ0ImTyVzM";
    b += "JCqST8TRqzLTi5gX0ldUpFFetdAXTRP0Hq1pIhOlxqY8khhQJrIR6wwXoP/PVK/K/cBF9LpFEq5";
    b += "Fb0lAUEgFvxSh0Pogt4tfbie0Zh1PTqMy3xMacxMaOJ5KoS6MmCYEfxLZDwdFEDKBQoAbQS0OMC";
    b += "T2yT2JQBPFFDyxyyjj/BHf7lrcFqL0stZ7B0377fz7tH/7Tvu8ZP+0vONsbpps9KFgBdnJLH2aj";
    b += "qzsqSbSk3uFLpa39biicTiTbb5w8AT2ALITNDGmJ7GNQcRBl8ab4fA8SUREYb17YZ5B2VT+9RKb";
    b += "FF01kfDMQEPHj4nf4gPKLhJtuOR9vh5dj0lhK/gK8lNCSuoxYWmKvuspLgotD4DKgHpbwKeqGyM";
    b += "rFl8gpOYNyPednC2GeNPn3JcnAAQtX9CSighdj4jS+BRPLiqX4kwe3W3iRmLufyy9/T8vkl7+F0";
    b += "4QRgsQgxSDY3ZqXoZhc5WNd1i0fvNlP2H8mKOmx8vDNmsP9RReIB48kIUxfUErUPzBaxFODiQ4f";
    b += "9MQSRp3bgg/pyJ8l08NPsoTBKOHzcYlEqYQcqQnhniTeAkQ4gZqwqDMTmvx+N9EtUuCaR1Lt1bT";
    b += "7kthLcAOCjKsOVunUITFL6lkTSSTgezK5Tl5PRP2LpUFQUr7nXN+WIX7+Gs8e6feKyL4niUfCvs";
    b += "d3tQjcey8W6r0XCfPeC6X+VaeUd++IPGn4Jcsjb9Lne4da0DpUq95mwF/ZOGjLBydLhQsGfO2Ll";
    b += "Pir2rtvJdU0r7YnB6O+gELHnL91ITD5lhpxIdFTtoaeip+8dupNQ5+6dJyTjjPScQE85Qieosi2";
    b += "UfCUE/AUfOJ9cVY33pI6UXIi42MTPGUb4Cn9gnE7E8p/iV4xRE+5gJ6SA4bQUxzsmlc6ljTQU7b";
    b += "CV1Xj7bdlHYuIZw05Q2KNCafQGWDnNEKu6Jkj9Otx0nip4haBG9GWLYTOCLhm9G5B9B2p0Lb9RO";
    b += "nLElUUy89SoSgy6kQkrYBShN+GxyqKVo6NKFrXQNEGbCjlY6qKG4DZMRtrjJUtDpAlzoWMYq4Gd";
    b += "HFNoMt8Heiy1USky1tMhLq82USsyxtNee/NCnbxly8fw8aOWzRA8Wwq2RMq+aqzTkJZU2JWbbKr";
    b += "3AnID4xraxoJvg28d+MVQYHI6N4qY1VJdjROco6ugRKeJbt6BX6BeQW5jhcBPS9JKkcbSSoLaue";
    b += "n6Wt/j4m1J4vXnmrtNtR+6EAtjTKXD7rXa+vFTONiJt7KVguSAl4sw68lvCngSLKYXHOgqpl1c0";
    b += "EvTg8JAgrTgPAgINDn/+Rf98cgewM87SdswWtNyKVCFEHhYWzSxSskG1l3cleXibxGmLnU78JYx";
    b += "pPxMQNM1Egb2lRqUqWV2EWRPNemK0FgDffBpJgCUKLCoEgiEyfIqqJvS2ZAJwC/0RdxpiPUSgIa";
    b += "FyFSYRl46oves8WB4qWghCm8iJ83wpUiokddEOoJY0DRYKAZB2WtSpj6pvyDkYQ3q7kIrjx2+AG";
    b += "EavwV8Et8DAYfyHiBPPFj/7aPKLl0etOv+bcCm0U6bTZwdr5iTM5nCLIsyg5ynBLKystDSYQlMB";
    b += "Hr2J+BcG1SJSUZZmcV+LKl9c+1Z7EcJ5wreRKT5Y67/Jf3cyKiO4dY46G7wqdc1+S6oAotMnZ8L";
    b += "vgdGMusPwzEMsvPfNjXsrLccpeGFsvH7yRx5La7AhUlbgaZOw84SXo94gIkmhgMzA6i8risBgGJ";
    b += "wooUIlxW12/0NnYoE6ix4FLg4mjXtB7l37bKED5u6Or5n0IN8oRsvUy2NlturZetG2Rrg2zdLFu";
    b += "bjWoTWtEXNJHr9KVU8FUpStULDBKUU0GHkoVRT1KIKZQKyAwqQcJ+qMjx/kSaUWQlgzqoCDTORU";
    b += "HGE8s3ihcIUBVbq7GSPDzGvSaIHsaeq6Qsp9CF4a6O0N98oD5ey4MkO/YnTcC2F+rfm7TnYFoFw";
    b += "l6SRpkQI1DeTHJEAZA5YsFPWMCnSHM5rfkKS3I1y0CO6+S3M4u8SknN8jsQ30yFfiAdyv7M35+O";
    b += "xQa+zWAuDI3zb7CMWtJQiWI2wVk92w0weN7cJuWPlQAJgfAttSsIVM9X2gggHw9efSeuQnG7F4N";
    b += "un9Zi3qeAZVK0avw648EfqyRZOfsgV6uKi9OUflrMOaPy0NFHvdBHip23NWx8WOIqkeX94YvM6r";
    b += "IAYrTmDcsUz+C44qJiCrlwxTtah7FI+OWxKAlF/oEkfog64mJaeRbTyluyQIYuffNokLkddPKZI";
    b += "GG8HXPKg7GNI47a6ghCG9nAQ64hCHLQrXTbXPjgtoWMcqqa1487avU4zvN6nEVA5nZ+u+cjlZy4";
    b += "Sx51MKlVVzWlUo2XjHJb3sbbOFpx+etOoW4XHv0pFYQNmeIW7x+RlrutXkZTxWU+zamqSRfkWyP";
    b += "gXHijFM9Qx4Eno0DgeVODns6BwjUB4G4IAE6SXTjra9jvgLQusg397BrJj22/ZBd4jQP2OwvY7y";
    b += "hGv0niNBLvyWsi9FNCPesHwYVwdj9WPOVtQIVV7yG4pngPSQlrHPeQEMSenYr7wLcnhBEk68sb+";
    b += "HUEaAGzEe6UonNlugpfpf91TdgIxCreTDbX+1L/70uwdU3RunLdRQJjXe3XCWTy71zp1w8YizvX";
    b += "9HHEb5BkC/sltdXP4GSvEbGsJeiwJXDpLPFbSwdC8zs2gT9YD/z3i8fEJcIpBSVmICiXJWtKzAG";
    b += "Xjxm6hMopX82mASA7aPGm8udJjQGX/8/DVJmCX/DiADnhphxdTnUnIM2VQ7jRL6nz3+8jSdpv5r";
    b += "//YrT8MhBjdIslQVGUPsbCXjpmJS3elo8eDtExbD3e2Nr8txF5HbJdA7lVUY3i6fNN0j1uCZkEa";
    b += "aotz4aL1KwXKlVsrtulajRaek6tdDKWFrXSc2LpWbXSIpaO10rPiqXLa6XjsTSvlS6Ppb1aaR5L";
    b += "O7XSXixNa6WdWIqJIZRyYlvPn8k1gXb++/CXcj2lhS6nWbuutFd1H1Kc2VYnEwztN0ACYvKpk7x";
    b += "JsIbqV1XLm2QIjAxAksDEvEnAYeqHCkJ7mwlIdvquIB5TQdmZchMUZR5KCfk7ZkTshptJgAL3k0";
    b += "qKOWaFSiao8Pkc5WL99zBfIF93zITsmWNJXUrXSIpdo4Q6M3O2gcmf4+h+0EQBlealq5rqijYir";
    b += "iJnN5ottzjUbES8uequePfVq6Ks+zXIPwOjAsy7mQv28vgt+yK54FanmLQQmx5iKRTaLCzRHdM3";
    b += "kkC4pdJ+tAAZHyHfEBZm5yVcJcHt8ndYmmT5Q8ShsvO+gRI8uMexlrjXlJvvRgRevK033M2y/Ii";
    b += "bEKqlcDkJJZhy9m5G9VHfuJzyrru1vh1yLobsC5N2dZ32IF5qeWl0Baaswtvu25dMJgkFetG4rX";
    b += "4bNgu3t1QbdvpmvySbt8BjMiu9UzXbn7an1myZY4266Hv4a/LV8sAEVSV38qf37IPwjfYMLy/0U";
    b += "fU+8ve38x7WfaZcVw+YxcmZHLA3HoA3ij1nuvExxIX/beynfFsW3u1x7Zd/N/l2N6FEk7LYZEdh";
    b += "dXe72pL5mn6Lr8WmwqoABYYuLsbVRX/gy2wzxq7IyV7i+5IoVBB1wKQGttqOryoNy/wMTuO4zPc";
    b += "zNGezpRdjoZ9KWmHGhT6sTN5eC72wlAtBv9BvSRiuhSW7mvGSYSm53BgnLmcsL5WKL0HTJjryho";
    b += "nbnnNjl0lExAp3QDUmlOUTqTBQZOJlLtwlMolfqqnh/bYkSP0KSbGA0/Bj0INf1oQickgXsU/8f";
    b += "IrUJdMsH3NnFu2QZpUGWgs2TvQXSjgCmVy0jNfgbHlYr8HsRLOx5PJivPxp/7Q1D40sar6LH/fP";
    b += "oLSBV6Oet5qUfzA47ezM+K/bLfa/1HbLf4Z/2Df8G/hLtMXhBIANMOaXZt1vl/bqsn3VLmo7HEw";
    b += "2e3vt4wb2Q5IPkCYHRG44ceHR3YlW6fQQDDH+GSDqNZH6i0zgUaHhG2ugGHoMs8R2Y1mLUxVcvn";
    b += "5f5qxJWlm3/Ba+thbjIze+9Dpebmpzr9Utv7dwR7EZzrep8nOwl1rb4e9bX5619upy2VrfS0tXr";
    b += "yhgvg6dlG/Gi+sH2db0pg3cs+w6/xu7XnHdZnTYvzWuJN+Df3wyvoXnFcnzEPFoXGA+9o4crQLa";
    b += "FUFet/tF5y0hpdmWBZ87n+OUEZzLwaAf9g15/mQ4PejkQ/E/H3a6+D4E0TAg9ssj74C6o/8n/6T";
    b += "rMr0zEGoI8V6MxbrAmS3xl56kCRcCsO+Fi/vPKX+vk2uJRzFcvlkxegRuUNNowMjrVytC4HB5r7";
    b += "OmfrP/aE/mVu2Jb1VSSPPrWnLPcybcdEwAk+vlkTrcguIas5Gppi1/vVmz0s20JQtMKgpVBD01X";
    b += "+m8C3O8hqxJgN39c7W3AEYSRCjOyGcRVAMzx7fh8j5ilPfNhtAg+cdThuJj0UEjlAP9Vj2A2Fnp";
    b += "Dhgh8mGN4CTzd/0ep5tKYXcgG/TV5czK5jOs8avK92Tw4g3XPJdJdbHquaxWNXdFQCgohnD4nup";
    b += "wTUlI8y0m1jNZnVFVIqflD5n65fJPRy85A9yhsSObKaGYcDaa+aekr4zXA7sQLzdvKjZ8f/oes9";
    b += "LOOd/464BWFAzRHc6Mb6oFolUHLiq00otIFykowm2tWCnDzxWqxUnhCj9HuCoL4Qo/S7jCx4Urf";
    b += "LlwhefCFd4TrvCOcIULI6p8c+dOnCYSz8tEbzYXvdnTRaXtOcKe/GMSMV4u4YwfF4TLT0gq5E9W";
    b += "C3DQhVPD7vygiPK884P+yQXnB7WTF5wftE1WnR+UTF4YRUteFPVJXhylSK6IqiMviQIjV4oSh//";
    b += "1m+dzScfY8FX+wZ5Bam6Qb3eLnyBZN+i4lxTLSd8Ngu528RwSeoOyOyty/29KEm9XnNYg6wZX9w";
    b += "dEkyL/LUknK5N8BZO/fqv6d3TpU+87mX+f7fk/Ov/+YO6k+6Cf5YehPKlEyZSWguPk16yqSZUhf";
    b += "u5f6coxrBNCTsdzqQCk8tg7F596BEIw4TSa7i/AD6lW/TkLqp+U6s3JVM8A/oQoVMfqL6hV/4IF";
    b += "1a+S6u3JVH+AQXr6yujtZAfJTHlFnChfohVfKdOka1Y80iRIqhQ2iUYSJZBW9CvyKwAQKqCAiCw";
    b += "/4MxpjQETb1GQXsCw+vp9ySDH+hIYzl/jXz/tfUFEF35RB1CKk/+iPPDfFMDOlZLY/RJRA72i3x";
    b += "KB0bbIjXYEdrVEYFdLRciTwdwLBIv1vP4YB7r+aXUi8WUYOZZROGAs8ISfRg5xPyIpH7gflZT62";
    b += "49MyvLtRycl9PYjlHJ3+1FKabr9SKWM3H60UvJtP2IJ0bYftJRTex14YeDooMqAZOFFFhlB7cTB";
    b += "uBMH414cjPM4GC+vFKQqsahKF6qSgKrUnuJgfK4fjHvKEJdGyE53x6IT36hZr5LI+M/57gc9321";
    b += "GyC9tjp+Un/1zoyBI09BhZzDTBQX3CNYkocmBpBZ1CRCkK5QjW4hpOVoSAZYFkKg451sRs2YqZX";
    b += "gMPlf0O5Tlk+HEkTnb94Ie0BFw4mSAJH7D1C6m48yBYYRSbLpCmC4YAkvVwFNJIEakcJUtn1c36";
    b += "O25/urlzKxfO5yT32dFNjlR6afhIVd4eBvl1bj3FmfbMosd9E+hI7z4CITaXxtLSEcwKewQQKfl";
    b += "2xjQwGwyloSkMIF4qryMY7CFnpZMkjQCLNjwCfTb5wfdjLSOhcsbXGRKbBGxcAojrRrRnrDakF9";
    b += "Tam1EecjmpPzqqi1BbvjyXHEZin8+vRQwL+nPCfKcrYntd1BJTvKz6eDBNLWEbg/8WioAU5mAfW";
    b += "mz8Utjs5fI66GK1IVQZinIkhcr2gMoVuvsKYNGTK/r+mH5IB/MG9T3dexpkL0VXHeYl4H86tjGu";
    b += "Exx5VEj2IcahdsRQhsaJG6HjGCNF9C4HSSFReBTfEoiN98CYBHF0yDk1hQITaEkSTyxZB0zGHQV";
    b += "D0dzA+xwq3k5u+zSFWRSLlIlbfO3p3cELCGufMDUwcOV/BugxpX0G4mT54zeRhHu4karMXxcu2/";
    b += "yNj2BIgJBHGKS3880oGNEEv6DlecBHKEINDHtJv+W058hD6cSbFrW2OPX8t+aZ8oVRZqIvCAqW1";
    b += "Zd/6dm+Qx8jfBZqlyaJtGnED1rSbI8a+Pvq+hTrApTKbTrSA+druvb2k7+vkp2dUbukoT7lDBV+";
    b += "Ds1RiIUaCeTx58M5fE7zeMHzrhFYrFLJFudeMGiMiNqaf3ULboWSFt8FuTPzX9yWbfMy07+Zj8d";
    b += "X+oNTfk9gWCnN/W/BgZax6I15XL9m+vf40/+8aD8g7XIovddqsX+dtaIPhawrWuK5DIOZzl95OG";
    b += "YP/YP89IV/N13oRR0cvlPKo9F/vUWqdcMQ8+FlVR6YQ23QPyCv24tjrKhyYgkf7ZVKFOnLZI1yI";
    b += "SAMKBv0BruJstwIoMTRRTwWfirDcKIUaT5vWTBC39eJxlt/kzyaHy21Q/XK9zgMskiAa+x/JCTK";
    b += "B0ivx0q8Od9Dc1DLWd2i7T7bSshmbkIdgYLpM7Ox3R23maqUfC4Ts+ztbIZI/PzDlOfn7fq1u/I";
    b += "BL3FhBma73A8GfOeq+ez1OAaCJWBndvGiVYnYF0HCSb0v8hks2XbvOTX2/L0C5MtRu4l/xc3wt9";
    b += "WDPJ/z2Tebc7YdmjGtkMztq1hnUM9Oq3n7wwZtzof32BGTchzHGc2B3dbEIIDOGR5XVwvV0VAgh";
    b += "ICjLXTT0QUMFstipiW//gx1AZ5PZQc+N791I8Ua3c5xtZNAlsM4nrj1J6Cget7P0rrjav69rjgH";
    b += "t2E4OtVRfCAZtXUkY35SoIsOMCuWgNFT8NNzBmGLHuToj6f5h9nY1YJ2IiX81brVKWmN6XqlPtf";
    b += "F6jmAX0pb74+ClJiqcqE1loL7AtXuqlSlPTYP2R1xDeHjx54l/tS+fu+TFp2XUuyUZGBaeUpHEu";
    b += "ijiWzWAsrEDP/ahf8Z/WK/GMuKkjr+5qHeQbkLLaGYLtY8Bq0kgSGosoJY0reTBnv+ixN0KJpzN";
    b += "JID5IUpTC/BSFTJ7Q5mISFFhmvbP5xyhKMw4WPeRocc+vJsuVNXHGddqpMKiGOjxtYTFfGABNhx";
    b += "hs3V0HzuhEflg+nmNeQa0FQYRgg5x+C8qb63r8+2D42jD3+6dyfDSc3kYssJJQ1k5vEVY6szSq7";
    b += "abeRxfec6TvNb9pjTpzglC6a4NQu0lqCU2xLRwywmj/+qJX7r5Yxdijv45Admfhx0IZqAb6EuaK";
    b += "DHe6qzYfQJzFFELhMhCFGrKSj7syQz7TVLJ7QJKKw5c6Y0AS+hL0hoenWmD2xagBSH8hSSUieAI";
    b += "fzkkwkrrzZjcBmilx1Mry2MGI8hpAspKPqrJRWprYW6VovTH7S/3neoJz7sgCDvVn3XDtO0ii/4";
    b += "ycJVPQlUL3wf7Dk9keclxQXJhf4X0sBns5gcRdyJkHNGRkTwflC5kTww+8yBB6BC+kIA/gswNMT";
    b += "nZseRMBJWTFVfhOttvj9PGnyRJsRX9zRP2Hfv/h/is4KEkZ2VgzdngIoW6LrZUfv5XgqLalipXq";
    b += "Ak8eojZpoa2I51c1BaZUpJLv7LickjzWtqZ8a1DVZanpTiCJbG4Wnnlr5SEWxnSQFEVaNJP9LVz";
    b += "CoTaqADvn+WSyRNKUBgLpDoipQwKhLyAt595nIeFqeWM/zR3EYP4Tlh3n+RhgyFqMLQ5I/+g0IM";
    b += "Xs5QO2UEAh6SMsWlYWaf6CShXoMv5+4bz7i1RWsDjDI/fP4tfV+ZSooH9vHVP7D92liRPmg31U+";
    b += "tzx+fyiYvZ9H7A0FfhbpbKocHPXMXjXtF8vklrwH5gweICFjI7d31Rr/HBqpvcjAXSSzd0qNpyq";
    b += "zdyr4LK4WVG2nlspbNFJ5kZK6JM4ANLumML3x7eDzxOKMEAusEk4+1fdAquNVVk6+bCCpvrnMMu";
    b += "2Y6ruknurbGpXqK64BvnTsWAVuHQtz+NPp/bf/Z++fyt7/R3tK7NhtKf+JMulO7NiZJ9WOtSdjx";
    b += "9rF7FhLNNSpsmP/8iTt2IdfV4lCb0vLx0/CjhVD9WBL/n41XWCwftEG7saD6k01wl6Ll+VS0TLX";
    b += "NPPxoXVMMbTOmWy6LpnABW+yJKDmX3FdtYrUGOpIAi6ZCArTd1Et0xYt4U7xZpmsriA5QEiVL6n";
    b += "l+O5Nw/JqSnJ8Q8Jv5ZDls7Ex3UA+urTu0rL6Fk8V7e0SennhanIIBz7eVcHV8p4WY/3vaeWvlL";
    b += "iLHi1WVP7nYL3F2gALA6v9+141SYsYHsofD3imTcHCFMJsSFRFo9IfJYm6Dvl7ImW4RozP5RPyN";
    b += "ESLs9yx378aP17O+z/5fZlk9KUTWZDQ6UosAnmB187Mc/pk3EFZKWvTsWiGiEJ8wdyYIv0VP3Ov";
    b += "EYlGvhdtuiL57bb1rDFTI/PpdMPFILzcVWkxWc+2xJpMB3DxCkUFurcXJHSqVvj+ADtOAOywM5J";
    b += "KlZRZL8owXt7wUaYd7v5oRa0DrMpz7fKVVtPraAmZ0nSZgmp1mi8P7uc0/MR+PfNDViyjrdFzIX";
    b += "lU9dBPUO+VHhoBgajhJOics7X8qgWHKHVG/of1suHt4Oaz6g2UU7g2b5T8ImPYevgfDm1o9prRz";
    b += "C5pGzK0qrsAEuT/FkIczQJJeC4zxeM1jMD42EQRmviKOnxyzZOmB0oTlEBOdbmQQPElKmdy5ggA";
    b += "hb9aIVe/vNYftO7C5DRu9a4uj2CLQLCydXXcPVY6AT5WZyzj1nOuLo+NPCNWWFWREtCqA5zgWi+";
    b += "mfpd/FfOPc43RyQqBUuLZVzatTFiiOFW1YCxcc54tKK2EmMW3yoWT6G/70X41r4PR4eNc/CacZ+";
    b += "Q6loLBypztRAtKsVTATpZJ95+tbUvQa2pNv02aVLj2+ljBUxhNnmyY8w0vLYEIp3LWLu7LhdLAr";
    b += "4pSFcGOwRYYFhqvaKl0tomBGOGBkJiFk4BFhngWXrSJ1Rq1EP+vHdFApP8t1sADZvEGHjSLNxCh";
    b += "h6ffQNJQURPLBg4oEeER2m1NEv4KLBG/twvdkrMnrP+/C9ngWE5cDcUuMMSVe7+zj1OvPxTJjny";
    b += "zscCnR9dPW1SIkJQSswbO8sJcqmkFclxXyfL+iyiRUSnljoxj9H+5hFSF8+ESP371BMGYmbiPba";
    b += "HKaWdTZaDRGjBrrJ3IqCDrq9hbVUF99ouZbJCtIZ3xHRn/gd+PBi4znkgFAheg40Pac9xX4I0nI";
    b += "hsulVwussgLyy6jLqVZy6zfs8u936rI5e7Iygdrm2eXh8PWTjW2Zy2jiEWHaRZL/F9kZyz1f/0o";
    b += "M4HwFtKwesjK9I3qkPoXzPZ+RmpzvTyP4NHzi14BNxu4wPy+MRm5237c6lJhHb+W+v/G8Mhlc4n";
    b += "/T36hNzr5/yigpQhzOkrY8F1O8rWMLjEFpLWwHdCd+qXm5duVGjwu36bgOy7fFiIkq5dvqxL8yM";
    b += "vz3w7yZP0r+TeNsfY/B9lTOMjCElYt0SO1pYcbFyNeVZX/KlXjHWb0B21YfawKAt01O7xfs8SBH";
    b += "ZjShYIWZ7I+YHgiLBCEBsDXdyXSBg29IVynCHlP3TvPT1NSJLAmfIsaeRYxKSfrnTT47WldFYn4";
    b += "MZL6CiYNKxgFAfC27tNVwvvUXqh8In5ZckW1LPHnyLrk9rguwUC7+3VhWeLgbd8cVimvVsKymiW";
    b += "8x1Ymnf9MSysq2NJ/6iPCMENmgflkZUA2SJg+E0tXO6pm3pKhMhWOWOoWJyOM3HyBkZvLjhf3O8";
    b += "HIfXHRGWXkvrgbLilGbrBk86LNiHNrOH87q/Ov1lzcYVdl6O6pGbrB1N00CGI6ZQZshtCG0sD1d";
    b += "9fYBBmRvtNq5B6/xz+g+5Ny771q5f4TrNwhQpNN8Ml+xkj88ICJNvNnjBT4We7j5nLmlx0wF4sv";
    b += "9kEJLvZJCUKn7kFzFZIwMSnxcKeHp/UD/Sd9FV/C/BLphwN+GdKVsLVW69b0s7JAvLaYSHvtLv5";
    b += "wXVSIihdCoGVR2DXwxOYfTFmXpVgYfRp+wl3TT6WyfnY5PIQZEYSmPPwGP+1cC5cbUHrcUsLTE+";
    b += "4syodv1H3YuoyOz6J8NBY2G5WyUcwjxP3V1tiaFS0iAjJ0+Imk3PnhfZKqo0uhROle6GTSnSApI";
    b += "IzQD0PnM+3zAo0H2DovVI2AzvEX0kbPGZQ337lP1uj5RlHj0Vz5OtofDnRtVL91UYXUwc8WFONT";
    b += "8hms1Mg9B1F926YE7RjZniEfpcJuzxVEDV02OvQJ2tUv0CfLXpkit80g3Qe/kb4l2PfJlVZJ1lz";
    b += "ACJYHPrIvqaXVamrzvVYySeCwa50DvS8qr7ZEjrWFTNzlEKxjVKC08N21yu9+CVWNiwJVwuADxo";
    b += "3yRiOidvtrvx/zv0kf05pOV9rf9CWHj+wjsXurfJ0BI3zL/7rAP5ffkSyvIJEoj6IVJRJ1m52C6";
    b += "INUncpVHk4QgZHfi7QkXH7PYpfnLxDRXdHlz3wAavoWcUnwZLSIQAKVfYtx8iz/UJZ0D9nopHDi";
    b += "AUoYsJE3oXTeqr1IM8Yp5udWqbjQQCNdBCu9UhnhmkxJAv1A/6bCqtwCDZFAZpB3sAzma1tm84v";
    b += "GqPycYrBIV49xWISAV2Bl5jkcLenfYFakr851I+e/OhnkFXNFInob4w2uRsEgVY/DKVWjkg3v37";
    b += "9P6YA3UiReB1IAdHZ8VK3WfH+Lr72kG5YHfHn534SUdw9+3/yAMtl8Tn0K8zagseAlIxqLOunlv";
    b += "uTyKuJKWBTyXxhvRTg2vyn1w5+Vqov8TUpZ0oEvckpAUlzDPzc5ZJDxKd8lQFqaApqKYuTRWsG4";
    b += "MtRIQeAC0csDaqpd5ph/Hq85Duccr3kWkhYxGAjBAIPbFwjZ5vNUhpO5N3ovTEc+GpSDKOvpy/O";
    b += "thgrx3vTZ2RIaGqdaJ8zNHeRf4CAK1952I3+vw4HztIQ/ba2VMXVGgW7R8bBK+JgQ+hFSbeLS/X";
    b += "HYC1teXiadOd2AahLbkS/nx7F1/ql+jtbi0tUrxFrCYqhIp9Mt/XQ6+XUudcprMb9xuVM++AgDc";
    b += "qwJGg1r8t+VCb14RhdfeVLXTk94bVyU2jyH+XBnTFCImTHl3kfipNXYPIAOdRsLsUvyXRbgIuT2";
    b += "m119Nz0zs3nr2EbfiGILSjv4x78X0/n1ftcTTy677pp+Jtn3vrVSgr1bNm+4hifV0/L7Zo0KcxT";
    b += "AxGGZsnZXkWka4oa++yXh68K10g3baXdt3nrNWsqVdQrxIaKB3oTcVdhd/TQ0D03w52k+YwLa+L";
    b += "TeRKdNzEIT0xM1sTPcRFdvYjKyiYDkzGO6JzQ2D5TpU4MJPwkghElD5pXCIGIHqlepvzovoYn1S";
    b += "gynIOkQt29HSUXm/D/UuQUjiowBa0SzHNEhsIkAzTmNyVb8L5zTIYTZ3kBSG5ds6C8R0CP0MJeA";
    b += "UWQDJAkwgNfG8cjsiZBFSy+ZytdpF5Kw4IqyQpar8aJLeNFr5GpL/NU6vBqZS9rhUqq+WWNgcbI";
    b += "U+7QdLTVz8ZDUzAtHS82kIjWTlaEfIMJapqIuUzr9a/Wvkb9UoQmwQ1tmsGK/RJ42KDsF1ZksqM";
    b += "4k/2FUZ7x5LR2KGI8J3BfwpqR15gvKrg8xX1CYdlbEWR9K9SnQcdZPgic8sjX4teVLhZeCsvLPx";
    b += "YtwQYOWYtWaSPBzTHWf6wV5LihAvcSZuiX7OlKvqbMahUrCznCkSqjWGordzYaS2EBYKHhIuM3I";
    b += "PPFSEE9sobZqufXWinjiIJ3ee611jW9cWP8lzNb4SEd8MUXS5PoByQ8/mw0StMqgVIu0T3yfWfh";
    b += "alO6n+lrqGrSXyLPhMIJlO0YM4f18CZgchOnT13sl2QLcghFFP28zNKJYGVGy6vtuBZHdk2Am0u";
    b += "9bZJHr3/f98KzaxioUAYhBuWGtX0EpPp0RPwfoiCxFIOjZ4ucsEkQt0lo2aBaEorcF1h4jfL0TQ";
    b += "JNzssQHfO2rNndeJsgtjAlqdRbZVf1Ouekqv9h/8t++9weDtUVbS9sobWvpunLGn/9KDkYYMv0S";
    b += "s3UZuxPNhOXqmyykMOkajCEwj616atF4eeba/EuoakMSPXfJGMgV6CkeTGR+vOlZuZnjXw0r0qR";
    b += "LmetMFj9YMHS/pkb7MRfCVUeptdCr1nSkroTiTqJrSiUujCAzfpYqYEN82FuNwNvODO6HTsDFCq";
    b += "9mGrFlywdRnYZ+KiwVHAFw5W4T/DPA0xG2JS1o5ze2+iSBPAo/ZfJ880hPwpBzPWB7nm+O9AQyO";
    b += "deriDvbRI4qlcr59rAVPtFDVttuy/2mBpw7JCru3OXfyvwJ2/Quiipx3q8XdoU/job+XmTH/Nfy";
    b += "wJ+owyT082zkKYDA1Yh+nsmqfj5Iap263qoNelFE5W1jPx+wJ+rng1b7OYhBDfezaiJlou7a6Oc";
    b += "3aD9vO0P6+aYzpJ+PjEs/bz1D+vnI+KL9/ITyth5Pte22fLiuIXs8lX7GLvTzv51kP1MvakQ/z0";
    b += "cviSgBlj9NEpRkeuunkpdw0ESdDp/NkgH4S6Cwg0vigJl+B382XrPdr1cpofxo8nL//Zr15ae8h";
    b += "Tv4uSR5Phc/G9HYtt/7sjVy3NARKuaeTD+573M/9xtFZ0Io1Tog1vhK8itcq22EswOtGLDc1xqv";
    b += "mC5aM7WuyyUvZg2bqhpSP2NcGJZhG+vlQ+fTC/6oX1iWSeiC8qcL503+oND3YVvxjJ94RUQEDJY";
    b += "hgo0ZlE9yKvWrkBSrkJRLoHRoGWLL9GqO41w5wD7CSsSOWIgQnDO0DnrKS6482Su6p7hi8vPJqN";
    b += "WPba5+mpufsYFHdC6s1ANkWwDcQLDc1eKK1f/a2YrwDaea6oUwS5Uyt9N/cByM3n41MQbu6Rl73";
    b += "RVjTngDW37Z8QI1PvsZGXMUS+RE1gvXOMgIxg5NctCFMxg4jiYVAwfXz591IU0gZQ3EBe81lb9D";
    b += "VId3VyXwDe40K902/xm/3X+GPyfJgK7c5sem72YL+U3IUyNZJGxiuWMR6hE0YI4r9L+KXTqbLtq";
    b += "le2KXvv/716V7FDmdf5pduseGLj0mlL1+VDtg6n0KM/LmZqduo2X8oK06dStL9ttGp+61K92WdK";
    b += "hTt6Qn0am+keXRty/eqbNUXP5awKgIqUrw0WU/50f4cullNE0O8nYDTwtNDhbm77UqJqhxhwbW3";
    b += "jDpOhGinkRzQKUy7MpnMc4dCtNMOmkftpIomVDFzhcctKqgl6mCnlH5vI7K5eU3QJC9LTNdKpJ4";
    b += "bFGqkn0SLqdSopaL0mCXl2id7ydMqXa/Hb7PVHTR453SUn7Yit/Vd24w7CMGiQf664ZewgVxw1u";
    b += "zej8jk6DZz4/0Qj8LPfFW0+hnGFE7rKr1PY1+njf1fj5gqn7eb4b6ed4gqiD9vN9Ih8yb0M9owO";
    b += "uH+3mHYYtS6AfW+3k2lIuUX+znPVrtbjN8n6mkSMQ7ZT/vN9rPO8yIfobi1U5T9fMcb5gpBN0/V";
    b += "+MKmKv2OQofpzR9R/gk2eP91mU0l3f3AGztQNWvAJ0n/raQ+mnXI3EBrGUsxIFKvBmJ0DoTUB+z";
    b += "ch8i+wzjmzVjFYHsC8JN+MMvc5BQ+jKpNhbb+LjJlifOhkTwdvAoQN0Ifzqr2d6jbG97qL1mYXu";
    b += "P9oKWI5ZiQADQNI6mU9HJ/95FxFXoNGAmFuu0m84Infbo+El22qPji3YaP7IRnQbkA3uHP3hr/l";
    b += "fVaSy2cSw6qU7bdsZJdpo/cEGn3XRGo9P+jomFfNOOVNAJTcyCF/GBFJ70tEp9mCwSst0aca2bM";
    b += "kxZmprQEz834mQZQYiJdd3ytk8QhLj/EwHRrx5ezlkfwAyWKOV4FCU8t3siBXA5yptCsBp1OSyT";
    b += "pq/wpkxcCwtlwetKhrCd5cxkwZmj+LobZ6aSIZ72hSlxkcNTkUzUVf0h7eFjqYThhNQCi+iBH4j";
    b += "CEJpWU1VLZlt9OyTtBUNm/hUdPFMZKNvnD+WF6RgaGBXjwNmK6g+kVkTsr8VDDwFSnHJaaqG6g3";
    b += "qpFmeL11s/XOoCjGfotNSqTUssnwvlYVpKJdZ4QKvfb6XG6qZaOi1JcXVnrQWzEm7lWCpLo9tf5";
    b += "V+nXygPv0pfp9CzB+1T9GyYnLRndbCq9ewjp7pnDxi9dSM9O29Cz2J+eMNwz+pE1KpNRCyfDeVh";
    b += "ItKe3aPV7zZSY3VTLZ2IpLi6s9aCeagrvT+yZz+poeOZLLjx4GTMP2MlJIdNicodb0TlDjAZ6bz";
    b += "keLTOGXx/ow3c80I5Ub62VsDcx2urAgTt/tUAYMSrXKeUCBZcck6C+xKE69CbmL8rFSswMObKab";
    b += "eY0Djsy29nFuBxQ/4jhs9mqjU7Ksxvy+JfKxedyWSBxCjfE2Ak9AbsLQT5yAVvfwu4Bt+qIJ/mv";
    b += "t3Ydzzs2yWQSUAXcgBZmEbbuVq0VMqz4Qh78sn2peKpbxX2t+EePXvt1d6iJ1v0mvKXIEog2TV2";
    b += "fTn3hQcoHZ+Ir7q8XcZKqPQBRrh2fb8FfxzL4d5cJ1IYMWNU3TH5ltYEJTT9O8UE1wnbU9JTXwc";
    b += "dglh2/9TVZbp2QJ5BLpbFRbceDpa+nAxPnYNmXCHAB7J8j8OWwhDLP71lXeXS5ZbwC2MfJ5JU1j";
    b += "4SEOj+WXPBPmqlTnqRH+xK/SkveepW6r9gn/ZKfV6Nn5ng9lRwu1P2aeDKfjZg9yvualkCNzZFk";
    b += "CQTxC90SlqiQiIFSr1hB7E2S91V5d8QLUspEYfokaSmt5CoJq76S6XKoK/baEOzhaISy9zb6pyq";
    b += "GdySi4IzvK2g5TpNt3pyw6bIkuklZkiafbeNGaCuTppNi4hISsn1sBcrjhm3u3osVXVsSVrPxWE";
    b += "1PihVfoaKQE4XNTmd4bLoPiroBfFqOjH7XFBOFjSQIKLErY0PhjBAwis+bkOrhGCrM6HfLZ6cZp";
    b += "BRqHEgiSbeKAUw2cgHnsJPCj0ZooqAYSGlL4ithRADhMb5LS2MT4zHq3+d+aMB+SFYjyxQS1vbk";
    b += "sDPlNCa0viUzDoCUMl74i/xCTWgM02Z4/oI7/qftiSPSUThO30u8nr9Nk71lvCaiQ5l9QgI+YZC";
    b += "MdKKIsIJ51ExqGfW1TiRHCK9eZhy/EU68DZ2xsjp3B7gAhkBa+mmQNkzsSTw+UBzUsD1TtK9xhu";
    b += "XXRovuEQu1Q0sS1mRdTnMiSdyJ3qpiXgjzRIGY8EsC1UU3iYw9/YsQep835hU+UQmGWKZZIhJCl";
    b += "lf5XhSTitCzkT05+QawsBb0LMMVFGUggDT9uVr+0IsXG7CFCGpO9nqFeqjblywR5B+5YdHftWWW";
    b += "/0Md3p5/NZo28eLO704pY4uXdEFpYOVhIcISOpETR1TXhBVU+DKMgG/tgfQC1vLwSvHecfjgzqp";
    b += "gyBEh8iuTD3/PyRCqGodAmDK+c1QIO2HWY0LZogLMkJGwKTEBS2xZgKtg9TW8+Dzf+c+hqRt+Qg";
    b += "jzVZy6pgWhw8lcqlMDXLgRWFF1vLtVPfR+k+NvZ3/b4HkbHyI4ywfkmnsNDnOZKNMugL8k+y6We";
    b += "WQzhfw/5/ov6gN8Bzr0qzV7ixZ2u2NnbYsP/05zGWHwNhH/JzVzbdlvedIwbZ5X9BBwelSsAUFO";
    b += "QpyKfjOvb7gdBQsk4KjKFiGgtOk4HPxiDEp+AQKeijoScF9KFiCgq4U/Nm94SpLpWAHCpaiYIkU";
    b += "vA0FYyjoSMEb4xFtKXh1vEpLCr57T7i5TAr++Z5wc6kU/N09oR2aDfDFeIqC8z9PKn8UaI89eI+";
    b += "2Aw95uwuo+t1iEYJHBBMIx8veJWJmdPpWBEaMZBjaEDYql5NTafmgz+HdrRAtKoFOGRm7+ZY4Ac";
    b += "I7mmiAGkoqAKcpfCpCV5Nj0qBxkglHtS6qQ3vOiqZm3zJZYVXgYjV+cIJtGQzPciOP/4O1IvLiR";
    b += "+lyOcYk39qLV6j3xFw0JpMLIR9UVZHpjAQFOGactyg5AhLbXq5pAYns7r7N1mTNxP+IrxiY3ctT";
    b += "tRGhtWKQb+Rk9OlHUd9d05Mb+204l9EP7e0TfsgOnHGw7LrQBJC5nPD4IsKOW0IbTQclTJfJlwG";
    b += "iQpdg0VUsIf0vxSD/ruVkmkomqsxmSE1NmZ4pOPuY6Dn58vMBVtdpmWtR0XdKhMha3aCwLWJpwl";
    b += "FjQvDtbJFMLu+IiRpTasFEK2Vh50CELSX/BPyq7Jytptk76aK944Z7x8XeEW8cu8dp98jMTNW7q";
    b += "nuUwkZMn+Vi+gx3D6hf6v3jpH9S6QlX9Q/TGWLpgv5xsX+e1csz3D/P+O3R/jkFr0+zf37I78+s";
    b += "PUXvz6w9Ve/PrD2l709jUt2kBAtU1hIlwPBrXEzbhm6Hxv2pF6MJaUy90theoslqiWapIc0nvZx";
    b += "qx0kjqSxpZKklI7PUEqSDGZmSkka+WFLPF1NhmUZKW9JIaUuGU9qSoZS2bn5ZTBT7U+2fg/apOb";
    b += "7uPCHH1zdPnuOrAdwZzdf1lwv4uhiz4LnxzBFkXN88dWRc7yUZF51tfg6TZeYz+cj6gFQ8+ctrZ";
    b += "SmY+uXSM//KsvWn6CPLrj5139hsAGQmFUSYfpcYBK9WSBYrpAkK0VkqbsYViyON0cW8qeGFka2t";
    b += "TeylK5hScflaLGgWHkM6UaT+yp0hv5HVw9BXft5J+8LuWBIWQ4++LbIt+BfvcQU+6YrXagt1ueO";
    b += "EgkM9c8xDeSG9A1b4PVYpFSyQDHfi7sS0f5v6xp7JHOZ/yevj5PPwr88znsTk9TkFc1jj9XmWU9";
    b += "jd1lgdojU6fV5ylozJnXJmy8zMK180xjVw/oFMqG6SSIsVFV07faXhYSxr08US9coZ5gtsWkYcl";
    b += "/7CiB2lmqAxFHXiN4pIkN4dc/my8snX+Hb8imYiR44vEgxlOghl5PFKIykKr6BhNdOtjt4kR2Pi";
    b += "IS8YHCelWw/jmSorq3tg3l3AtFWpMGrncfzejs5TjW+Mf4fp2RI8HxTQkrD61yuYfDVjdWE9Qp1";
    b += "dzoD519MGbdppLjHWCQcolxIjQ3RwSH9PJfxOdBwyyo+mgVN08ePAVHe3CxoPix+HT/WjdLSEaN";
    b += "7FIbaXKk1aGmjSEn/P3bef0FAqU35D1YeIlKDWsLHUG7KV6h+hUBOcYAxPwxjeO1WGUu8U2kn/0";
    b += "3Q3lQcPS0SCCYxHIJr+5NmQivbLQ8B9+xpE13C3+NYDePRMlRr1y0z/8uJkJBqczX8uXYErLe3u";
    b += "hzEfqBQJ6mPGQ3Je0mEOQlVvP41ciuLpxKcxXr5WvO9pk03xTB2xySsEOkVXp1OED1HoFGG+CJ1";
    b += "iCjpFZi7mE2QBUjpFxzxOobkv5ExmzZNaGXSKpQh9j5O4SRgTacFEykQXKRMBuddmkzLxdb7tRQ";
    b += "bKRP8IVwzdA2JIyl0p9XYvTDr6OnN4STmnkPRwX70XadRKH6bsQ/BRilhe38U+TKUPYVGVb0Af4";
    b += "iZG9SG/Y/ahrfch82/HRSXRah+659Kl6dCHIHN22ocWnTcJyBr6MGTuSrZv1YfUPtxzJ7OBtRtt";
    b += "rRttvRvxsqebQvv/STu60X4j7QcTQ61WxZ4Jc6QBc6Q6Kd9xgvl4xFDgkHe7cE5+0sVJ2a4X2bw";
    b += "Ro8HoKTkNU7I9VVOyPYVT8q3VlCykgTLIxrXPjzZNBykBQXZDGrxnz9CR72jV2ItuhbUr0UQwwl";
    b += "uyq9Y8xKCch5x2kdYLO6MKe+uGTlfi+QOJkNAgVMYY4G8hvpeSy8rPZkiwOtLi+8o9M0swjWHmx";
    b += "J7Zbu0cqlCDyo3nLEMNTs55zoB0WTxjOQJ8PP4nCIeTozHIybEr8C5p7T8FfAKPPVvognnsBIz4";
    b += "34KrL5OhSYw5pAlOpxMdu9Gtmk40WfDMkCOo2hSBvS0NH4gpd75dxp20aE9PXk8RxpmZ+SeT6/z";
    b += "2Bddv9v+Oa+mRX0ZZR7aOnX3dZuzsbMHm8WXYNY7fT7SvQ/mk//3vjpVs2bx5M8YzAhXwf6Qc6m";
    b += "eTPyLCoNka4Z1HoEUc9chmnE6nX3Wbr/7zb8J5bT8YtLcHK6rrq25dN9Hxf2Zug/xkV+20orMZf";
    b += "DdP4d+PvvyO+vKDB//Qn8xDqBbCsQQiSiweX2N5BCkH/27ODB7zHe+eB7nvqEN3vlsPVV/6Zhz6";
    b += "YyMP3RYOVS/7l95VP9TUD338XXqo+t8fDIcG//t7UfCckZfZG87VAeBGHHpmzTN/PQqW1Dzzx9A";
    b += "TP7HAM7/NBu1kP/oqxQazy8oNaweaD1l21q8LKSHInQi7zPCua+IuO7xrw4Cf8XmJq+8hBYYBzo";
    b += "wD6SWVGFQSxaCSKAaVRDGoJIpBJVEMKoliUEkUg0rO6spIq26oVP50wvBrdYkjCZq2VJFiJGh2v";
    b += "22i54IRXlniWg1aaJKNCFKKAAxELVtkR3/m0VpvkxDDKOlyCbNZJYKLlJd4GV4gG4rLZnWed3yO";
    b += "dZL3yMMu4WAStCCpBVbHoMukHJ3CtugUtjUNip30K30Z67ODLSJ9t6Ryezr4puVM2ri/tDzuGje";
    b += "Y6g0ecwIfpxV+zA3yX4AF+XmLufq85BAIHdLyPuKI/VGlXVfeQo+Vn2qNYC2FB21qWHxT8r2QwR";
    b += "lL6E2Yc0RuKQaZB5FmHVCqLSbEkRJwvIoaGOEDQPX7nnidDQTmUxKQnZxwUPLFNzJNUhVB3Pkxk";
    b += "OmtcBgUikzqyFiY+pFPx0LacMqxMtlv+eG4aDXH6M2+oD48t5rDc6s2PLdqw3MrDs8tHZ4JnGL4";
    b += "dCG1CxE4YArqyevwSryur8S0OQ07Z3rmXb4xD7+pM9Getl0lwSvam7vHjaIP63zIad+lFRlyqhp";
    b += "ceEn/wkiwfkiFa3yBCFdxAg2uTkMUKx8I8QyDwZOV1gcjya4eRjYNHSy6m6aNL+DgOELQqqEA6I";
    b += "8N4n7ig/pXYzowirzZnGBNjUvgl5X4XUJtKPgKEkTXuapLkH+LqvBLXj/8ahcQbO8nQYivU/r5b";
    b += "Q00awqzq9z7V/MkK7C7yj360+0qd+vPdFc5pz+zXeVO/dnaVe7Qn+1d5e36M9lVzsrPa2qUBk/3";
    b += "7/a13ffH2YFUaHHhasmmFXJ2T3N+yACj+T6/wDirPOr/5B8FBy3WVjyeSwgCdtb2/afWhjeTvVK";
    b += "pegcEdLoq/07GEYoZshcRoGCuUnHtWMh0GZi4EjAuD+7ZJ3xkoOnH7+P79gWaZIRiFwCsURXalQ";
    b += "Ta+jr1u3/WNS73vXeKUWWAhoDN/sT9+ziLmLIt4Iv8tSl9lY2Iidr+tEw0moxl2Mx3qDXfoO7Hm";
    b += "jUKf/qtJXG6GjYatj5C1fszoXnpV/99ZpCmOlNohjHWiX6TcRbx+JyXLKFHKzYoXQsVeUbkyxtk";
    b += "XZsMrQu7ejgOef2IQ7pMpk4u0QXaeLl5xI3FcMnbFbA3p+BlDh5toMAnUuSpWs1PtZqf2grqC9v";
    b += "8jTORgWIZjrNADyslVyhCzfl5iv4vyQXwa4uiPShvO2PADAHBPnMVKClkVhZZmjugSDfmwtLJeQ";
    b += "R8/+ALI8ltthpDWCYZ3onCiq0wCuy26tCmf3EOj2qnL2rHoh3AJc9ZxdWWvfJmAI7BJlY+eC1TB";
    b += "R6/Vn2UoXtmTbN7Hun57rlRu+cRNVjmelX3vIXd80jvZLqH+SXaPY/1nrp7jvaq7jnSk+6Z6z1V";
    b += "92xTtenbTb17ZvH23Gbq3bONrJnmZLrHTz60SY4EUmbRczlohrBRB8wQOEoCZgvQUXsUwun/he7";
    b += "2h1L5IYX5V9L6XkoYnlk/oF6Sb0/xHfR9j12SCg0Dv8HCAVmX90qD9JHkki4WaxwEkhyriOFzhT";
    b += "28Si0C4wm+m+uqEViQ6SQI/KiRkOF5Sc7kjvOS0/En/5KN2EqhcgD4mG4uLDjvtxgkgKGi4q5fr";
    b += "t6Rkhu7TJTULfi88/fTJ2byefDyVVeNQcEgi1vR3bMtkTuc9kCvK6GDdEHaCCyGHtJG6oHGBXV2";
    b += "FX3pH3+TZ8MJzQWCWUI0k06b6zfT0Jz+5S0TIonou5WCcYsRZKR1goysRpARgXAnYt1ZhCMjrTg";
    b += "yskDskW7op9eIFQxGD2/iBo6M9Ck5Ml6rOghzNtLyJ/zK+WmnMk4YjI+XC1s9e9A/q88Lqz490k";
    b += "pOw7WikL5bYb6UE3m9VIU4CSN42QDOhCohTD3qKrpYjZwTRrPY5c2ftNvOiEXkJoE7TyhXWzH9C";
    b += "zAnkr4EQgMujiJhWydSEZSBVlAyiUNXzJoTd8UjvaGu+JuT7Ap/4nBXIHRe64rdvRFdIaPkgq44";
    b += "2lu8K0L6YOyKwKHxlF3B4bL7niqojsy/NiwQ/+m3J6l1lIq8cIrtHp32kqyTlkTYtYulyKxoFx0";
    b += "hPuwI4Wob6SAfQBAsG5GOlmo6WioA61axhHHF96fYaou46KMOVxwXRHcbv88Cpi/Hb/8dg8fJW2";
    b += "zLIcFEJsA2cOHvchwALkwinWObS45lMZ3uiQdDHE/qBE9SrPHC5Nzy659kJkob66+bP+V/3/BJT";
    b += "US5QS2ymHpebnVo6fecyH9KQX6XE/jFgZjH01GZzz74ykP82gwIyddNv3qVwvy7VW1Y0n7YhbpI";
    b += "piSXrOHyJbNHCS2VdYfNuN2FXBxmeV8UknEeBLCkyrfpaCrObW+NOiDhqK2uOszXKMftDMf9RaT";
    b += "WqH1C+AQSVeHA87g/I3WyE9YdKfta2ojsO76z6vQQrQ4wATLqjA9G7FZZquWyCsxwl/6fhPqsE+";
    b += "Q5QgCJ1CIMeZCDN7t0BfD85wgtKCIf7BvWuVxyaHK8oBKdNeDPEhEPYB7y7a2cuuiFKHKcczmVe";
    b += "oJ+R8EvXaujB3f4+KDg8U0MGl9N49f2RiuUxchOToWz2N+OGF1y15uu8l+50NjQbmOKckcGJsiF";
    b += "coBYgi+SH38QeJN0JkyFzHlVzu81pAICgY4fKzoFz6fZppkcgsIaINHAMTwsKsBZwPkgX1mNOrE";
    b += "AJYlYXE4xT32JOG62RvOrW25e1PxaUBC6ZNY2uwRmeqNLwDgjXfLo+OJdghlHs4tP3CVITn46Xc";
    b += "LMY8ds5KEuQYqwdEmkSNAumbXPqEve3MgsViiAfy/d6or01Aivd0IhyfTiFYJCrtNfneaMo+EjM";
    b += "DJVLxtCWajtRJ8FFFLSbnnw02zNgwfDWCmcwohBWBziRJGFqI5MAWoS4zWKGlIF0430x2v0Ty2y";
    b += "Ko3fBgprrdbEnzCDFBDh8n+20YB53YI0I/ZAzVpl4ELdZpJt7J/cCmlcC+arRLLVbkVCIxMh72D";
    b += "kignRebAxaypvAREnqclCir5QCa5hh9K4W2AFB+P3rQzU5iHpeVwnfY7gy4epvo3i44AOeZeNdu";
    b += "wtw8b8+CDwmCvGgSHfnB413/b9qdKYa9sFMNOIgMAIGZxmnSGuPZKlZ2Xyq2O2vA283+Pl7nvia";
    b += "wGfVl/l1lWvDmlPpQ1J6YHdnKbTHhtuf48VKIXF98XELXvxhOZ2PYHR9IlUY6GBmqwizX38bgJy";
    b += "Ht0bvp39aFa/PBqa9S1jjcxMxVOCKf1A/+p0AZxSRw3hhkm3i0Q4QEVCD2MFLGkULLmJ7ZYop6P";
    b += "Ylzx+WF/KICNktxElqRVPm+uukFkiuA/BGfpLVjviutbJACfj6/DWpnfNKBqJZlkIgoubDLaVqb";
    b += "LlRI1wwqlGYT9REgOBdnGVaYfWXMR1EZ11ECbSz5ebPx3hUZP23DGmMo8w/BI1/FTCqeYiq/xjO";
    b += "z9FrcO5T6nW4WLSiWqo8RwaavOfCtnEN2P8+plyPjTqw42uUQ/hNs37hUusBAtXeZuWaKqHOuXA";
    b += "X2AmbDh+TH6Vm/jpxHMW5zTgIfmNvq/wg4Oe1KAVYqrRzN963VWvB8lUCAMMnym9hl4srP82Hrz";
    b += "TLy/HpU/m4bfcvVf9lnQ7lrnsmsWu/YvvejjsSrpfN3U3ZNB11XBXRGAHHEIDgCAI7GcAQKghsE";
    b += "+ABwihyGeBVujmu0xwKT4RnEJJ/H5kJNgI4jZw9F6JGXD7hJ0WMIzgUf2H/zMU1vAjPUTNy823+";
    b += "3evzSIyris2kprIZtqttC/wOx579zxZWI16kK7kq30wIbO6YdgDififQek5g4DkPT9RHcDJlf79";
    b += "z4XlnoBKP+zje4JDKjljZWJCIl+hhNzTpjuRBOWNwu6aLq4vks1UspdE1jdpmG5KXfN40Mt1dlt";
    b += "eMyhUNEIguTWdVRsmC7odREHdzxmmfPijnDPmHqiNDznPDXBQG/KY0JlAhJrI8LeAHsSEOdjosk";
    b += "4+0x67SQZRutWh7bjtgXkVdmyDBdewX2G5GyoJYKXAxzeLpv1JNgLq+ToMGwvAAQLKNBZfjhpK2";
    b += "x6qCcWpnMYQpCLYagAxmovFIOG9axqzibjSOOOnw5W4MTtkd4mFdYlmpoV6bLOeqPLRLSWHOTR7";
    b += "x0PVRL5YKwIkqftocyDQMSD5/9kocFzvciYNt9khoZyg5vL3tyqlSFmGP5KJS0n2fxpSKxsRTQG";
    b += "xi6z/A6cwyNh0+Y+hPflXB20FVPyEQzzv/AQ6k8dJJS3AW19tma7Lv+uNsm5f2Gat1CgXBAd+qL";
    b += "F8HHHYyWTN+TIOXJgcczKF/M75yT85TXjFifnNjiOYHxPEqz3D8PS39M632tqd3xXvfGfzzqfkx";
    b += "oVLuUNiwXjjsybcOJUzd1TEAbzv15LZH9XeYOW+nw/+U1vdN3iWR9+3XG/Vmop+YLPlbT8/3vaM";
    b += "ldu+4PzkWhtu25+Xf3botrfSD3hYA9FHkgbnsqV/VvC7TK9RYZT8biNq51ZyECIOYpIq9hjCY9E";
    b += "UQV+QxIi4CRdi1eOKQfBm4QUhIt1h3Hk8BqGzehA6bSQyh8TlADjw1byAnH7q9XIy0ne/qqiThk";
    b += "YMRxXloxqlCvMD1YTJhjRhshNpwtTFWtKaWMuXTMX41jonCoabAWPkgcaonwnHnrhThAysw4U/M";
    b += "ZoVGVgqhUOMby6Ql7WGGd/8CvMyiZGp1yRQu2UNxjc3ivFNyKbFqVLBugMtm54Rb3DWLn6D8JbI";
    b += "DYpz5CRusMnO1rjBBjtb7QbFBxJo2LIGO5sbxc4WbhAuksYN0jOiZ3T/sYJHZSi9CABdxnPbSuI";
    b += "ArwVFH90aUne2xuDPazcir3JC0cHZlvEDS6qKiU7Nd15Qhoh8Qp1qjamr7eUhpBh951mwNAC5KY";
    b += "+/2c+cpwnfRrA4MrE4svLgm8XiyPDpdvBJZFC1ptEBOFV55BY/4UIcZ5HbfaR3UrcbIqlyQrzdo";
    b += "70f1dt9/VBqkXz8vTLV/KCUxkIWM/ZT1Wg632pgBlFPwxSIAPEostNcZg0Z2nliCteL5BP1Fssn";
    b += "Uk8XLauSTEoCFPdGo12pi13xYsMLdughkkkf/UxwNKjZdCgWHD7oC84tt3xGZZLLbf5X+bPlgc+";
    b += "cMFlon7GdTXaj6HtM0EqSfAv9BoUmyZRnr8eUsQuKJMmuItt1TX9JANT0l27v26uKpQDW9NO1hb";
    b += "2KwutLWCrbCKCb9YhqlmbtOoBesCQxV4O03/9Z18dF6ejslAWBzvFS6a5rhsRLWBcqAb3V76/rP";
    b += "qKrpWIEcn+RPDrCe6Ey2EDk50JVGjh/UuH8SSPnjyDv4XVn7+XftUESTHD4qeDwk4DDd4qP05el";
    b += "V6PgCa+UTpmhjK6HIfQ9HSrhHnXyVJCe5Ywo7CX0ZVF3idEAAEdl7pvJ+u6iwDwDhN52cTRZkek";
    b += "I8Yxqnp2kduFb6kYWK7o2C4FGgZ1j8qzIX41YN2F2FV9qDYnGyoMfKexwNBR05jwCX1laj+LY/G";
    b += "+daFtsvW2eoWcXpv1yi5akQZy9nNGSTEqOv002mbcDji3f47oH7FXyE+awHI8Uld8JduLRZJA/k";
    b += "soPMfICMOJmMwhoptsCDMSW24zce4TjbhXeKtTzjybGWx5p3KG6A/OHWrTp4j2mwWSL95gFuy7e";
    b += "Y0tKwj22mZvEe9Szj4cbExZoOR6xp98JVNt6j/zBMr1Hx3vURDDco5Of2xgHlHt08R5duEen9/g";
    b += "5E/1bxNgqL5x/P0NWq1Nzz78J+dZW3ykAyCkAKHw38i0kkq3mB8tDyHzJWJO3yP2nu0mTXi4WbH";
    b += "X1XcEGDBOJi05oKlVgmgmeTByVBhdmdFXjLP1OdWrST/Dp3dgb9ca8qeEU+LXYjX3+h39jXG3N9";
    b += "+rLjioePLNUE+kpebYNzPwoyz8cGB0r/sXj4dBP49Cj3PJl+TsZBUXB+fbmJfzt6/Gv0BKsU0g0";
    b += "vpX1+tL8mhimTgf5S7nuIaqnPLyDk+CR99ZmNHTafKqX9/Xnd+DK870T3FiUaos3xjv5D3RjXzY";
    b += "CGDkWsDOkgDe5mWiJOTNvwd2lAhr9VKcjJZWbZ7xHdDw2qZqo8B5D23sFBPGsMCRbDV0VLWqayh";
    b += "JK+bMC+2MmLjdyeR1q6IH44f41uth3dbYsLKb4qk7re3rM33cltSnE2V/FswspMCH1mFNHJ6Yui";
    b += "/kuZHcMFNTSlbEnpCtTQzlZPF05yb9nlj3VYYC3HU2f8jDfpvxu95SHIQP5o7aL22yNiK0yqidz";
    b += "rRUrIcoIi/tB388FATY8JPXyWrVYO5CQNMhCyCcyUVFuFy0GoenvbMswZi5Mckza2ZjEOHR4y+9";
    b += "E8tdqeOp23uXf0ueWO++Onjq8A2k3ZhFHmFunFg+ilflX+iV68yVVdIaE03sKLfRmIGYWQHkuaO";
    b += "R/MCOilv+B5Ix6/keqrgngJZggWVEKjg8lqeRDSSqdRpJKPYek3j6FLzZNZ9orfy2vKEOhd8vKJ";
    b += "oiGxe3A0lmVbFWik6pEkJzztZJjLDlWK5lVvZ2qRBR4DtZKZgjH8f/GkjmWzNVKjghkp1YCmQeD";
    b += "f30JecS6Rxv2tFC66kIpxXghZJDoj4wgSHKA6bb/SqY3rQz4LgK0EsQgJ5JFonBWo3A2sIH7D+i";
    b += "idYtycpOGQScuEpQl8tKkg/KG++eVhXLLfv+GviZNFtu/bb+G8/4aS9+gDn1RUx46EXnopoxzGs";
    b += "aWB/2Nr+l7E/lSWNYibGyRJEyqXXuZoDGZj+JXzcBH5h9xrM0PpgMikpHg3wJ/iQg5ty4fg4eZA";
    b += "Ilyd1Re9luXjkm8vVZbxtooqIWmLZOz9oez/skMr3Grde4GP9CXoK+wq1ecJtkNx7FSXFZueUiX";
    b += "jugvXZukWAmLYrGENvL6UtgJf3xtKYynfJqTyIwRZsvAuaHJxb2KKtgJb3tLwwZ4NgBYhMiAxeu";
    b += "Y1gkpUuIvRq5jH1Evxly3chk3Fary22CI7wgfUj+tdvrCuDc/EPX8sHUvU3hSdS3/kcxgB9Jp82";
    b += "vpRnjGlmCPn8/7mbqp8CCOtQZFVlWPTZNfReVs/2++w4hTVH5QZ8IE77A/Vqf9aZNNJ+ofnuviH";
    b += "v/e1FOwsUrbxSSqfFrYqsrXI09hSTNPYcVmWd5omPQWHCJwzfLYt/37ci/S7KskzPJPpA7JDv2O";
    b += "HCApGSkWfeclWS0hg6kThF7LtxquK541sHwmkXDAlf/6ZeZaGE3hd+VrhLvB1NIpNPUCM0YqVNF";
    b += "BSFxHZL+ah2uNGeVMnRGx5iPjXOVCIF2S3UUn8+fM1jOAGZ8gEK8CBYMhJSX/tV0P3ubbzlAiIJ";
    b += "EfFJiteu1qioTSbrK/GOYWVj4itW+cYrPkDXWKpH0U6+rkKW7qkd7wTc31FrmpI736TQV47/BNP";
    b += "dYbeVP0zT3tmwr4x+qmdvd4U1/RuV3T5yTbZ7m8cXnl0N9x03zdoZ+rQ58v/TmDsgvHXvBFTEZf";
    b += "BBhaH2xwtr4AQaqtErK2XPgLR+vzBuXts/MJ3QX5Rt9pm9/oR7WV4j7Y5i9ebrkpwEoZor5A6GB";
    b += "HRAR4DV/Ld9OYKfe1avGnpNyY9BylNQqnyqFURMXbn0aZ1EBAkAI2SCoionkYoBY7LnnRGEGpa0";
    b += "rzqyTCCjA0DWd3Q3hazUgXUF4EEvmxElaL5EKpvAXvCI75Zd0qKThMgARl7/+oToAhJP7YR9Wm+";
    b += "yI8FEwMPVI9TtJ+T1ikG0TuXU05CCK/mAn2vENTDtJayoG/s8C9+3DjOb7QlxxmTj9cU1+Gkiuf";
    b += "5yEAD64Q7t0rJcIDB0yNe/eCBvfuVMW9W27xLciXhqGUZOWRUFeCUPfjOYplQTTN223kBieI6TQ";
    b += "/c1lJk1Oq1dHYOgXWnfi4hMdJ9l3f5e9OCQ0QNh0I9a6/iFIsOF8omEbwFhnNPzU13qKP4SZ+QH";
    b += "QTU3D1geUe93bsr+eBscs3FHL2zLfnqYW+TOzavqNvlPuFs55myZEnqqOOAWBUCCn+hu4ndELbm";
    b += "kUBtfxIzMZ2FKKsJ+KIxGTdkD+ugr5VVJO/jmERcIB35qA6kj8PS96PIxvb/z1gie/rD+QgJGO/";
    b += "x9aSsdN6FBReN5nJF8mpdiqp9QkdB6eCs6GQdFvewXRciOgv/OmoMGwRxGn8nb9a2OXy/2UFxMW";
    b += "ob2ICSi0pzxAvHG6T26dLF8XtJVUPJYq3ULxrGrnsHUfNcyOH0SRL8tdk3cD9dE+1BtB1aSG8I6";
    b += "vHpCr5gsx6pDgLux7IxvCagWcPJyxOpW+ESj+pqPTtAip9I+leNlDpY6whuqgQnvpg/hG8axbw2";
    b += "V9r62sY+Ne48gjLjwptWh49rCX+kXNj+lqYVMipNt3yMTBePXY4guMyiUu5y8eEOAf5JrRnx8vN";
    b += "AbEHcFzCTaETo4WMzfIGPcSlm8ot8luiysI7enqifAKM8wvvD4y4JAmVZ355piOMn4P9rN+wBsU";
    b += "hgwEfaLl7qrieDRx6nTFNwFSFnQyPs/IA+cH68tEkiC7/l2xBqsT4IEB9ZMjLNSPRxoxEK6nuFI";
    b += "tRKVm+cOc0EiCKYAf45fvfW83M737k1Lb/8e9H+0nwWG/+39Wb70KY3OmCRJVvJyXsSRgJDTRy2";
    b += "W/z64BvZ6JRSZxFHOS2sqA26m1hQW3US/hrxgYHo/jqZ/z65T0umo2SYUO3LkZrrskA7ugn4uRQ";
    b += "aLPIiT2ovQ8SWEIQKSO5Z3Zfohelz7GcqxcAI7SjXjAbNnbAHpixVJIy+sJzefVGGA4HfGMSVWq";
    b += "3otQOOiAVBleldlpGnHKPG1lAWz28n3BccEMndMU9Qn60+3VsPhahVLNMl/pvxAg5yGmWD4sSiY";
    b += "MTvnyQzm/aBYof4hM+ZCopTSv6Evmn1FGHIFepzgN1zumxYoPo1PFc+7BZWQfVM1PuUdEuDZBqb";
    b += "xqFArpEiYq6z1S8vHITR+Anyv8Prn8Mb+JxGrRHCFoqH0tG3sTxpNJYDTfxbrf4TcixQzexfuE9";
    b += "bB6+hyeS2j0Iae5dJrKsEcIbXMAH/jS4gINgxTQ/JOINrGY8yvs+WSTKxpF/IeU77e0VCRrDRyt";
    b += "xSyDHzdV9E2l3+v65QsnHrRLnN2zuhOhtYt1lIjeBQIYAVb9AMnyPbHNO1LYzBjse1yCFTJLwet";
    b += "8YIq5cTtTDrbmUJYE2rzMQKDlP27ogvtpZGF/NTxBf7SwaX3167f+Ge0bt/4T7EWn/R59Z++d+V";
    b += "Nr/1mfW/rvS72/7/2JoDSyRzyTaZ/xIGYeRb7AnOcidXhW2EUxJ2u2zck7/+RdThZ5PdzZw3oUn";
    b += "y66fEBos0ENR6ZFuEOWz2TAQvUlZrsDHiGeeXqQLTagtZ2EVnGImrvOZw+TO/9XGlGn1RYn0FEO";
    b += "ce5rkC1SlrpMviIi1qU/AAp2fNUFWT6T8APV8j4ubeUVTrghY5XAKR0QtvC2m4hm/c0Tc+Szxyo";
    b += "+LkZhSSC9/eyCDFJ5h8Cc4scO9/dvi6sUSz9hI7+6H6jjeSZ2doTp7AmzpaCxEMreLVswAymJ6W";
    b += "B2zctINf8fTbLhC7E7Y8Hc8i4Y/UEWraPpMJ0KOE11Y8JCRV82UzDg3lDipsoJgIJryBfUsgHNB";
    b += "rkO31SQPgnPrAkkVoNvKEKZaua2wPey2MnBbIVPgeQ3DlV9PRy4xSa+VkQDVJyt/sakz66ZKoXN";
    b += "ekqkeXt+Km/Yigt8MoOsYQCwBwChaNqCzyf/6Npy4Lt9lAkGs8Oiob7fBo6MEnHrEDJy97aEjTF";
    b += "e+9+/idGA96ww7/YTkSsKWmHT3qkkajLjEbpRwpsKb5u0goHfVQUb7fY8VwHv+D6lmyyipV0+yv";
    b += "ZVTIxs6LZGz/JhwE1HcNHf3qItfcF5Ks9qMfeZKo3NmBHeL9ba3ZlCPav2cGdn6HUZg6/ljT7v1";
    b += "OziivUlaT017czKtJ8tN1XoZhB5oxKkFqtjSNdhE0NPT4DJMzYx8IYIdzo86rjdS1af2K+JL1D7";
    b += "XfJRjt8yHBEHFFmkar8r6vjeLASgplUWfr+t3ZaslH3a2+PkaiL7fBO2YEHEvbw4ugYv90hEbz8";
    b += "Uqjb/w4Ypnpm9Cdh0W8/hZBiZpRqG3XzQWEqCZwj/SG8jMu/wddsKGhCnYp2b6VXQ4SNB+18oaO";
    b += "UZwbOSSbRoSpD5mmsm2iAYnYUiMMoY8+wrJcUqDEzmpJ93a4JZO1BEV3dJW3NK25pY2Dbf0i9Ut";
    b += "fUVI+SwYhCxVijkdlI/vnZeuKx+8N3ibNWn38L26ML+jWg2o+w+jqeTl+t76jkMoMEiICB8QUsE";
    b += "UrZL6xT+p+IUTEuJ0kvsQHo1kTBRBCuQsHHS9rbmMQp5DEVFVaaUAkpTBzWdldUAjaK76ENLAZq";
    b += "WiDQgEjCXK/KxYYe1Yu77fuog80m2StiG1ANfAe4nY8C2tfltltdqK3lA2aeXwS0X6N22QN/veQ";
    b += "Xig6FRxUP+WPIykv3PK47drJ78/oKBMjOf7YeHPmCRTg6sSWJGKbFeYC4lP0/EEjimbwmJNJesi";
    b += "0lGOCz9l/jdmOokrRwXGsgZcA6Ze31SKzeF8HWdSGEDnVI09aOuN/fNn3ViNxVaN/cKJGosAXt9";
    b += "Uwt3h/NhYGRQ/MBz5QsX7wWlrVrqpsNz2Zd8gl10nmMkXDCi2UAs6gbJyqtw2559cIfDWozv97y";
    b += "NzYepXDcHJIQ3BoqkhWNMcrAsOhiDWDhOJHGQG2jSK6dKI+5XLk44eUHYuVwM/8ICmgQfURR7QV";
    b += "HlAh/gslaGyFHNg+tp+/pGs4WWYbggfcpi+vbJcqAmAHvH/5HdmoBI6+Cf7EkZ3fCugDAtYC3d5";
    b += "M3rB2P8ZYSIT3JR6jRIJXpO1EZCW/FUObGYJ2cz8u5aKZsebXXdBHXUKq23oT/8RYpgiP7wfNTV";
    b += "aa7rMQ9wUYVt9yXIaM6RAZsQXttZFY+CvKI2fDISK3TI0cksL7TDUC6CcS21IV2YxK9Tu2YSLoM";
    b += "6IKu9uN0HZQhdr0FMIuH7lvIHX0BvILYH1JU3jo7WSIVz1gFrm21xaZOsoKuh/r64RUeXvNIKKH";
    b += "/Sd7x//mAXbeslYkB9N/SG8615ReXloav9gG3rPUzf0nkUa+q6hhj4Df3RUWCXB1J0qpdqqpFRb";
    b += "IqV6sm5pjfh+wn7f2vixU9XGB2Mb36Nf9sH0hGS7hOkgLrqN/vKddoJD6A4bRtW5KPteJ9HFABX";
    b += "Z2BYy5J4cNW5ab6fS0y3WTjja2c63sJ23GWnntoghmo1UzsPtjFRpz7Cdwh33dNv5sPvhtHOrCR";
    b += "RdYQlR5v2UbHQkyxVoSgJwXEv9+KSYJkZFLLwWkMmw6Sba1fvYFrs5ExxpjYRIZbUHcBILaaI/q";
    b += "D56/5kuyMLqGMves4KFG+RbVcDVXdxPV4iSVBr5BdaJm6JI8sdFguqiwJAH7SbNPUIKaVDBqR2p";
    b += "VCtD1wqXKVLyKIg5rkul0GazyVdTAZ3r8GgRtEgXQznDMydA58UOEttYYc6LHaS8LQJyXuwgCcw";
    b += "S4rynsjqkn7ECcSq7FtYTjRXIQuYGXTg8dm/FbQC2H1vTYfQ103tRKAdDL/A39Bblb+gF/oZ8NJ";
    b += "vP3aZJfFXBKNO+sDIF4VuyNPGhsUNAphBZ+TtBYk4Q86Rl+mZa8zo1qBBhHshAffFY4KPuuW45O";
    b += "0/w9ey+kO83t48Fh/dVXWLqkOu3VRljJzKhJtLgjJwKWREOninaPTtOxnb6mVGm0892F9Sg3x49";
    b += "U3do42azYOYnMm6raMmbhK1zoHonWWW/o9Dlf4/980Rlava9bLr8EPn3iQrxhvchKHUk+T3A2uo";
    b += "pqBuaWPdSlJGQ6nuZw42f2ogEIFDATe8BqHyW8I6368sQMvCw4pBgfj5d0mDGYFnUnPXjNa7ARL";
    b += "LdA/KtoHHCiPGfp+IBYp55HvPMbUONMtXws1AxAaYS0+s1ee5WSS2zG+1G/Sp9pdOBqkvmAdmV5";
    b += "Htd3yqRlDfzwa9PPxyxpK+4btps7tb3d7ZMuGn/7KdnmMFokY2ZX+/LDG5IT+qCiqYLUKLfJ/T9";
    b += "cNdu3lykm7vvDeuk00Is+UirxjhpYgH84Q9hc67HWHh1YJzWjULh53oD2Z1/CGP9bLdeoe6Np6A";
    b += "WOUaq3m1jPajhLmwePA1PeSdezMAwQ/8zYZC/Oibuj0Lio4xD1EZgIsBI5QaMCjhDyPbmMB6B0B";
    b += "2YTsfVPvErfrUPJwCZWfzL/u4Wjoz+aauuFgZfNOaBF6wbiAYqPpR3G2ujjIOAjiaDS1BNMaemW";
    b += "BEiE/6Ve0crQIYo1uUg1iUjVTzJhpNqZ/gXvkV/4auLLICuXp3f0dI1dHAkRoeKekw+pGkSAvjx";
    b += "b+LF4nRO+xmZEFzZvRweEc1PCvQDI4kPAsllZC1AQKAveUAMaGgPMQBcmBjj8NWT6Juzw1zPj/U";
    b += "zM374nCpviKyHt4H1sCj3hoITNvumMxY2W0gFRtIZCFFjLaGs0Wxwuw81WyMcbPbWM6TZR8ZPpt";
    b += "k3V7GLiApKNaaOb3/OxgW++CHSQeTmn5LDz5XhazJGGJ8nBj+TgB+zAZO5gEcjBObzGbHg8vdlY";
    b += "XS6pWpVJMELE4+0647YLuU3SUOiKdrlpF1O2hVga8+TTB+n7XLi6imqnCgX2+W0XU7bpfPQPdqu";
    b += "IkpBNzSXJI/BRs0EWx5737yM7CKYYMujLCBkmvFT1bM8wRnz7x8+46mucdvwGQHi291VZcn9RzA";
    b += "F5wKvWSvymumMa4KyWX6VDs1Jc8S3mIuNzvlxD+bzA0bLk+oQSZW6KmwxiyNMCH4Tx1XnGTEAuN";
    b += "GYM8TFE9y9GbnITADCBRgZuSngswFJj9BqkxC402/hT6/fBqq/XbTWTHSqkIhCsFJyZPQ7XOMU7";
    b += "QGOoj9HMq1sFS82AwjW4S3IxL6bqxCakWKxowGAmiktRIsAq9NMtWIiw4su3DVEateZDztcOZVP";
    b += "PDAvnpZy5mMhm6q+n2By7t/6sUiOOHL/bNj/garFYkEtj6+8iLvl8srjvh8WtTcl+Lf+nR9LzoR";
    b += "KEZ05kmAgpN+2fPTt+xTkrmPdYZWKg3GIgIKlMlCdSiivqoVYZ00qiL42+bhO0N6H3znU3gffOa";
    b += "q94yPbe/idQ+2V2p51e9+BrGDB5fl3D9nATnOBbTMX2AnSJGYDW2qhXaWkO32rcomw9UflB38r6";
    b += "yr34gD05uJspm5iseCyk3a/hUiHt/0BKTSb6pkF0+/5lyf/eceNb5xvgXXQTn/orz9x/ec/ctdX";
    b += "btoEgkI7/cHXvvrrbzr8+Bv+95XuRX7ztd+b+8fr3vz6r/lN2KVPPvlXj3z3yXs/217pLvCb7/s";
    b += "sAibfvPfldL3zBv0C4CYXpqspTcbyhadLmUGqgN04rYQSR9/BJdFDKfObrOyuLY1iRFQyCW4N7G";
    b += "ymypOAch3YRg4lDWd8oJGYrAqOJ4OmfNSBZMiDxtWAu0J+FSvdS+XX1Er3iuhfI7gNzA3zgYJsh";
    b += "lGU1w9B0SV2Sn+/6GBLbEtc8E54lYzEzyCwXIufJcI4RssRhhjiZ5hLRcouHJXDVGRYjdbiTKuE";
    b += "WG20AD9Or4UpD+2WMG92ejuZftff3vmdz/3dIzd+N/k1BSEIMWExvBdU7exDORt7X/PQPZ/71Mz";
    b += "2HS/zO5FUdyYGLzmx2jWi1vp5CyptXBK1/ldvb33wTjBolo/eqamRb4XFTTdWeO4AuE6kfhMQVh";
    b += "eRSuIf85+IH9+LdHu5bK3/YqfW+S75HOk2lq5eIah8gg3T6XRLP51Ofl2SLq5VmP2MKfc+EjJBk";
    b += "YTxoCTMsd4ZP46vyX83PvT3KSlAHhnwmcIf84YKfpa9/MNW0vuzhfH31vk1RlUE1TvRkEuEtSv7";
    b += "fQ2/aypYFFtP+uJ3KWRoC3+ELbdXsweDcyLbNDp46mLwNExkbj3XViWUCRk81ZR/GpBFhuVUS4O";
    b += "nrXrw1KyNwZJIukPde7+Aa6MUoVb/jL/1YQZMb7tLTeh3VY5B8ZwwcUmeFqPn6rYLQuQ6vYrvLq";
    b += "GL0DRchEj8FZbphHTSIktR8/69mNVoDS9unG8zDq4TtksJ+ODduTW40ZPQSKyRK/8ORln/UwNk0";
    b += "dtzpgRaw+4IRDuQRFha/t660wcWS/56I14f9e38dnfBgerbkTDjWyqc4ylo2mTVsu0n27LtC1rG";
    b += "cegNwy6xbe98Gl4wG7xg1F6gF4waZuIFOx1eMEsvmHB3oT1LuwtqqHvBbq1WH0JcZfCq+cmYsiT";
    b += "jmnMgNFSl5HHS6kiFF5IcVG+zBLiVVqI6aRBGUf5awOkWscrTwF87nE9daAQ2ogbi9CZEgxJWmi";
    b += "e2epFnmww/26TxbINXir47OVjm1eDNY6JYrV6cXNXWFfkrRryUMbMV8zJ1QWGZcW1rTkRXJWTPV";
    b += "kngPCgsGXQ3Nun7c7KmcFLGDG6LxYKTOmTdYBc6DrlYsbqEeIO2cUYpn7C4pB64iD25Qfkkb9/P";
    b += "EClmiJQzRDo0Q/iF+tUUUOK0gEHoWlXbXnyScJgkfDfKPOEq4+Bptmfl97M5G8hrXKEQ+ZqWbbz";
    b += "ORpBxKT6JUnUyOuIYmRQKAnjhT3cBhuO/gzOjF0FUIgziL8BeyJSByvLrWmK/+l1bhyHNQDATvs";
    b += "zwF6xhVevtnRRYOa2DlV0NrJwKvEQoTwWgPgqs7NAijlHz9sQcsDsUUYzAo7/XnUZS5XaYiTR4R";
    b += "eZqIb0ReY3jcW+V19jkbZ23I99fhjN+hN7fp2zP9/X93VRZMnRnQk+LXqzdvYEA4AUGhoTdFkAd";
    b += "AmuGl7ik+xDvs3/dQcOAiR7EiBuYOS3Q9qxo6zoPPruJtFtZX/QBN65/0xnV9R8d/4FcP7yws+0";
    b += "Tv7CHnL6wH+THedjJC3vIVS/sEd/D8+5EL6zuXeyFnW3jidw0vG5XakTNJ9CvnAyJfsDeLRpqEg";
    b += "/vSNqF49MmIwEtWwnrObE6rOYNnc2hBhyU0NvY0SIO04RsOvHY62dtupujDsjW8NoyCyHdqIaHZ";
    b += "B5sGc48mBnOPDiejMw8eEVFvSSMf/l73LS3SNKuphCK3lNl2QYBhT7CoBKOpetaDATlb1evYkpf";
    b += "aGKF3lzMfDNChcMGTlMTcN+sO/9AKnACE+G5lXrqbfo1w86Q2BCGrUaeIaDLjTxDYBVG5xluM5p";
    b += "nuMdUeYZIrPyAI/GbqI1b37Cp8GJNyKfNpEHDSDtNCwRML+7+UVxHi174OSFRoBCJLuqp+z9ff6";
    b += "u4bGMGQn7MijWWS5JCSmVFHgJr69wiCVjEcwf5/0OzLcxWKlZ+fUhZjGTgR5peBaduhtrLcTARz";
    b += "EZ8OSRX6EWyZCdJOBRBBScLMVAWYUuFoowe9EYnb9H3sR2PtE6iHR+o2nELvmqBh0ngRKLvqkmq";
    b += "njdJbFC4daLawPUEB2oD25o2sF2gDZyogRG1gZuyv32/Eux05cIw929qhBCil09kfmxA0eT7HD8";
    b += "mktIrtSMGIE2AWN43AFmXR9/pl6JH3+EXop903dFa3jWc5zB2IHoCbxxCudfpBpQQt31ZukqwmC";
    b += "Lg5UZhO+0CbCfG83zW9jNw8YIyZjtZCjDe32YbqWMyNOty9YfSoG+bH7EGfeQEDTrJ12j+pF6j+";
    b += "VPzGp1km/7spNp026lp06ubrs1EF4m64qxWjFN+SXZrXH4u6kuwwZeQ5D1Z1AvMNm91FxxXdyXc";
    b += "PgRqkmyP5QNVbq2AvykYZQAIGIOJaqlvxLdJwEJJv0ZzQSVlpV5S11q5+yP7JDCM3EC45/O/tEm";
    b += "VOqMsj+XsyMNeE8CBYREP5t8EpoY+vVVr8luzAAHMRVmDdhBtovytJzSAPmiCBfRBM8oEkqSmcw";
    b += "Dtfm1tVSMNASlxAjZVbQlMlrfVm/L+p9OUe21oyr12kaZwMcOmBA9uvjhiEqDuEJne4cRfKs+ry";
    b += "qSn37d6SzHxryQVnqugIgLdcKrN2w0eU7V91pv2phC27RAFFC2nTMglsKAsX0rPz0sHIHd1q1QF";
    b += "LW2wHQhzIPz4kEyARsIlovMMwhZhBS7MGrBJIW5Y085ZoCgk6bxrTmtZl2atRBVtbt/jP94fy7d";
    b += "lvZYUvB0+0x4KMim4AQWnoyCVgm/hlJ9EgUjolF+MBaqj87FYoFe5EwW5L/Cb+XYXuon+RDE5cz";
    b += "6ePAzTHUXgSR5diXy3V8gQ5S4b07cTHuVRuoCCFU0rz9eybjn/l74B/728/S8Dpg5teAJb/05tM";
    b += "qq8lTd8Qnf/Bm16NGXX9OTGvsOIDx/2dvgwXkwEOhO8/GQBcSzRt2MGV9mpUbwz+fPlviHKXXNl";
    b += "rdqt5tnVu9XUKr4mDufQ7UAV0KeEIG7Gj+z0Dnj6xwdUu1flTCgitzQO1AKnvAHjZUvWVA+nKBv";
    b += "HSqelUlohc40taAVKnk/7q7+s0jTTz+7cBEJygvJUxyFSuf/aCG9DY4Kw3bDCiS7CmKgVGXu6MT";
    b += "qnF1Pv5YKLzZtwsbec+GLz5oQXEy/kumZaTSQX2+wIMuV2gAZXRD2CAxWKiZPm/grfxCtrsvGyb";
    b += "PKj4LKA/UOyCOB5Yr5AYU2YU5YBqZAIi5yBASPC7BrLCRJ+P58sm+5cPwH2SXoDmH6bFS1i+V4b";
    b += "ECf++I+b1emq8gB0QSQdDzQs/o8lCyFWVVxuOTJuwGecXFXj2dDRqiIiZALhAVMefkNwv0CvhVs";
    b += "Uqn3C/yony9vBcorP74+aYRr/MHeqG58uPJFGBQtIKot6evPIAkIcK9ye7AFlAfGmmjiITBCsb9";
    b += "Ak+uqpYJ2LFdKcRBgufp+TaYOTRWBrHpougvFUBBLtX7ISo0spbiF8SD2VpM2/aKMbkS/m8ARyX";
    b += "YMQdBHsv8xi96Fxgk9Wr1DNtxLWapHzIeZ7cksBiLVZzDyzRtz7fWvE5lEP5P3P/oGQ4Ck+j9e7";
    b += "Ez+PbdIKu6qc/979GnP50oWXcawWwiW/ebE3h/f73fwncpHxDNDpDkqkfZZHLnxF4Oiz68v5rfe";
    b += "ZwS/Q0qtt+e96syhiOKJ3jlxY7t6skxVGwgvL/WHzD4ftr+OV/TWupEBif+VK3f7+lhpjQU1ETb";
    b += "COmGA9mmDqDKextemqwa4N02ZDGBrV3vrDYRP0AK98MF4Z6/xb61fe+SyvHIzO3xAAJ3pVcmkF9";
    b += "Q/kZXMaTatpVBKsy3RoGrVXV7Po/2hU+8taa7b+6U/OWa3WjQt1gms+VKxN+em4IP2Q76KO73KG";
    b += "46hfbIRPdDwapnbYMB3tNOWy6mlffucP9/I7Tunlr24Q82jSYZPOBsCYJGa1EiOBvEMnnDxuF2C";
    b += "mugSZHPgHvkNiSGW6DgovHISWY6TLv1oR6ly3II+f6e9CkOJEfci3kHe6Bhfyw49kwMPxyhd/bX";
    b += "n21aW5ag0zSyZxNmw0CDzLmhJctOgfAL15r+XZa9djmFvrp9az1169rjszDM2VywqbrSs0nxboH";
    b += "1GSdeA16UjnnauSsg6SVUjcf+ym+YZ69RRPzcl14rh2FrJJ/5X/jQ1h8D+KOupiyXQG5Rtc3+WH";
    b += "hIh/QoVGYQe9wQnJSkryFZFqTX3ppao66n/mn2X6zHhkHsdi4o3ZUJRbMI9wbg6BKIHwqDMpNGC";
    b += "UgWZBoZNmEejkvRE6OT8KOklmBIFOzis08pU6PKfxDUxhMgYocrGWFkxCJnH/73NgfJ9Hp7ogR/";
    b += "J14kHJBwsPkiVdsU5VCxOldJpnmuP/a9KN6BNRFb4OJnH4mW6EUcd8j77dCEVJv8//bm3c0Pc/r";
    b += "t8gUw/5oF+yC3ihjdPJBjycl1DTFwdv3uAH5U537YKAzCkjjqKv4K/cUCC1+3sNk9zUv2hZOJp8";
    b += "dyouq55MKx1hNUfwzK+5E2ZynBljYTWuqQREYQAJevs02uN/KNebi/MrEy7LqfyLRvMtneRbTqS";
    b += "jMi4XRLtqmZc1Zc2m4SOJlb8/BKoMsAo/NG6Czf1S4blazEsWoBhTgsQQqOQgojb84d26Iy2sr1";
    b += "5+ivvX9+ouQeGwj4e7d209EU9SKugzSdfghtf4mbSfreaaA9oIDyrHZyrOlIlMFT8ErygMninV4";
    b += "FK1uOmfLVz+SRss/P+rBqxXA8KsLTRx0IXJntHUHlP4O/ntIoDtNzmjLz7vO8z79YE34wKLy8JM";
    b += "kHMZHvZyrMupahhH2gyj742qfchBNytnvryPg25Wvs4gKSKjcCIG2oxgcQy+GXHqUIrLGHaiFOL";
    b += "vGfkMtTNd1ZmpdCZQkB8LhKlMVrokoCqZ5aIkPzqVclWXhkQ3kl6bmnyKDAMjrrfVvPzUXBDUQs";
    b += "0r/m50Fj9lMszkUDJMIYefVcvlU2YvyX/P/8HWUI2cz1dE/4oRbsv8qwFd3/1j3juqOkdehbPwK";
    b += "kS+zELBXiLkgOvx1/I+ZzqhBwZaO9fsL0UK8wwitI0EFf1HuAbQBqIyi+TSFf416F5VB7moYM3f";
    b += "Gb7JZ+ngiqs2klAefWDfUNrKFwW1Lp95vnEscC/7qnTUXRa89KXp/oFG6+A3VaIxEzBzjNVZjAf";
    b += "qK4myEVambnEWiGxEEqjFrPKFJUE2woZwXFoLx72iKZEhXKLNaYXK4kkNw8O+qsX7TeVj1iMJkh";
    b += "5aZuSyylijUtWmJlX9bbwSQ7F8OxzLt8OxfFvF8sMcIYH8oMDrH2STlFvGwAJuGMFQ2CHRIzske";
    b += "jQiKCvBKT+QuvwxE5e2ncDrFDpU524jwmFG8LAYLc3avrswaVMotv4CjQ/KzX8xn0S+f7xDT3xo";
    b += "XjMf2ho72iL0zCb/Xhqm7g+LBAEC+R9SWrDT27Dp8Qq0JbxCVMIQhNzVtn+dqUkHH6ah5a0guJY";
    b += "q9PevU/fKNhDhPOP/Y+49AJrInsfx3RQIhBIUpaoRUUHpXaxBUbGAClhRCCRgFBJIAsrZUMHeK3";
    b += "bsir17VrDr2c5yZz0b3tl7V+D/2obNiqfc5+77/3mn2dl9/c2bNzNvZh48/L9YROEcstxdSN37Z";
    b += "hfja0de5O5mXhDr8Fm7iXX4T2CsZLy6AjZPz8NO3zAgDbK/xxae5AovySseY4SPLGUQw084byzu";
    b += "QANPPjblxkdEtLH9DTNNfZDfKrOgJAMqQpHhwPE0PpwiYcokVbpvIM1wzxWg2BHMhcA0tqVCBhU";
    b += "w+DKMEM+o0qDWDFpXIc0+OoMnmkCapCDKP0LDDekBLgCEY6v1jMyJEGOBFXsC3A6eHvpKYoUe8s";
    b += "3ENxlA/xfkOWkCTb9v2yPSji5vxb4ORoEgqlrhA4tvVXjbAle42eJvK1RXKKeJsEssYfkV94Uxa";
    b += "m7sv+IikJhh/0b8gEww0NM0Gj9R2HCFfONL3vFwUFGoK+ac4qL9o9YASQmfHZUKUciK21nQPDnL";
    b += "io5BlMfL+Ql8fnLIcIkKueenIrmggjdFOPmTsWQJy8jJL6JYBEr2YS4LBizvCzb8gA1IYT8vmDA";
    b += "eyVn4FbyKYwq+hxS8XCJgZEqVEdViJHqWOC8h4jxFIlyytgPG/4HP+D9gIf43PEQsIR51MhnZrz";
    b += "LEmLlFTER4dijjvBiO1d2A1UThrNFe8wEppRmtIEgCj8nFYlIKWGbMpV88fGwXh+4tgTMKdR7oA";
    b += "hYUKB2uOrSJ1KUNgdLR7YMvoBobyg4krQsTQcooObJBRQcYkCx44JiObjiioytSj9MyVyQaGNgM";
    b += "EjY3BPwEGLgWHmQtURxGD0yf3LDXhWvlPEkzxJPASlrhKpvhKkNIlSHGVcbgKjvBQOEUu842uM5";
    b += "WuM5muM6QyuvsItYbuEGsaDiRX0QcYIryi0iQZOcBjA2cB1FzoPu4YUSR0zOIG67MDAV4laL7k7";
    b += "ESgMR+RdFdIV2/hq7NgfjRyshQAKQFu0uewHDZN5FtZVLsV1PRNSbwqbgvJk+3WUHmUKU+MC4Gv";
    b += "JHFhS/pg5gYIDRIsvGdLQICNoe2Z9DmDCQheXnoNSPIZXDdxUMpO0YgR/oeHpQ4bPGqZqQQHhY9";
    b += "eLIVi4qMAl34IOphN4C5nAmLIYh6bAdJJUvBJhmHLG94WIeKIvVEuAicXLAbvZQPDb/58Ibx4S4";
    b += "m5OATqeOdwKowWS2js9A1JFHoOADvhqxr5MG655hlCJCTBg7FwgS75RvdhMW6np7R0hhdf4U9a5";
    b += "HVo+StIVxMFWtCF4lVpaY3FTUpCYfJBI4l8ju25qCxJh3FeoWegA8YT0DE/cHAsdNoIwMPmQ/Lq";
    b += "uIuzDuNh/uD3RkFFbWgI1liq0HjswIUERe+YK5BIBXB+LrLaCPzDZCdW1OOAFNMY22Q/QB0fdRX";
    b += "0cMkZCuC0ScM1kaQGYdk2xB3whDA1hA/hRDmeCNJgIlDLDJca4+OiC7iO7IZYxJM+NHRbDnNHAW";
    b += "ypo0n2WnwYUvj+FjikAZSclMRQ0eQktTUoCSFrOCVW0SSgu9dyYZGtKZMeAMBuleEmAZDWf0f13";
    b += "bjz2/Xhqpxw/X+O7VN++v/srZ9/6Rv3Y0FGq4IbE/uWmGiKEvIVSsMblIksh0jBzPoZlwsZSiWM";
    b += "hRLc4qtNGAet9j0SjUYUiJkMWPDM4wNL4yPZa1JDxgvc1N8Xw2PjA26WQ0H9xAYbq+RlewoptDw";
    b += "xFMGpdeIDgISB4cJXAnjVZJwlYBfR4YSEPpa84UvaYLBK8XGNiFIsca5XBZuUCSMqz2RWUkYV8O";
    b += "qZ8K68sgwCWT5O4qwRw3zhCI8nqf/vRrWGGpYw6khhcNRX9+BGQnDvPzobAPCuQNdygcqIU9wLo";
    b += "DcXGk9D/YU/9N6Fv5cTOohT6Ce7UeKK6/ny95/XM8kQz2TDPXsKyb1KAz1VLbQjWeGz5kZvmFmg";
    b += "GAAKCiOMk2eYGeOk0oSjBciW9ODQvPx9Ng4ASn+ENlHusAwJqkUJ4XyGxRQhxpoP1ZtUeJexqNF";
    b += "IoUKqjRMAsNtlezF/i+VPGtXMbfkHmz1AHJXxpZQLNUAHhOoGcAbJLIYQqoBfCE48fYQGOLnQdX";
    b += "Av9TiI0eK/6OxyC/5qmTGIoHPCPwUvO4JeSSbNKXPQ5OkcQAzT9PkGHofD4VfDiMX7EkMTyLmCf";
    b += "/w4fVQ6F9iZgxBSjIHHj9s5sOawyvutMfUVYpCBRoIKjQt+T4F7c4dmX9nWOQc6eg2ceinDUe/6";
    b += "LaKiist4PUXb9CVFhIiQaNDcHQLBdxXsCORZLSAEYUSODX4/NsVxOEKCmgjVQc8hCNHbBX6Doro";
    b += "O9im5xL2kRvroK2AxnIYbXzEJ8KqGsmtHy694h7Jr47x0v5TXQnyqJHsphn1SD/ji0GwcSwONol";
    b += "DLiD3W+bO76qG0hSnoiil+GSFKZXBeys+vnT8/LkiaM23+4IhfiU2siYiFLrskRz+wptSCcGxFs";
    b += "uuXEBa2BNMxjgj87MRMnyEAh1sKUeDCZo9M1/Y6tdJUsxjHwlgQZLPUqsSJv+fFV70Y4X3rnQ7Z";
    b += "PSPd9BdpQSh+Ci4iidlJnnHxxcawpjxFfd22DLHQUQd3Aup9Q3B4e2NjiKwM17F0UDFkRIfh2In";
    b += "rrQ0uawUfgdTju5YQ4pmGYkCIEOxpJk7GmjZkAFWPB6NyFc22D1RaHQT5D0DcR6Bwrpf3eBeEc8";
    b += "wGiu5DCazxJoVmVchTTOjz5LySNNwZF/m+jd45AhGjRwBYseRGHI+zmd8+FCEAETtod8+sQV2RN";
    b += "cL8SV5JCYoCt8wkjbEBS1iLju4jQh5JDnJFDGtpOric2HYPIM3e3jFXakEhXlod4XqNwpdkIytf";
    b += "5HsYNibRZXcJdwWW5QNkPzFr4LevhM5gwO1tyX3gn3TeZ7Hdp7nsZznKRzE2BAQouKygxwBunk7";
    b += "7OW5iwWz355/JMRxmUYduXZ4xtRLU8xwXKY9O5buvnTi/YnOSDsUduvzw1dbJ447umoEuuY77Hn";
    b += "epyfbf943C8JAFAnbuHz+xZlHb62ti+5GC3uRv+/wX5P3TqyJ1AFh91+euLdl4ZQpUTi2OAmIN4";
    b += "1vuOKgGxlJKdLEynjWTPhTF+SwSctMspDCtZzujMk09A5wR4jUMmPDOBj1FJ1iCmS5UCCCppNMk";
    b += "T6VFenDKpL390WafF1kq8qKbMUqkv/3RYoqivxxFJoqqAIK9aQ4nIYzRCgL7OLlXMl20JYcA0oK";
    b += "BRWnwYBqLzxUTMnqy16AH8lRqAU0MiAxOqcV4UC5cLuhSThdIkojxGRFHuKjZUpcRhmnNFfDmvd";
    b += "hR3VAPD4TvYW8Yy6U5BjusekdOduXwT3TwLxRFTeFfy824grBD8RGBFsnYi++a1ePNhJ4CAT6/B";
    b += "1zeRQ+8AkD9UQ7MlIdA+SR+aTKigqKYSwjiRgHcZHipxeGJ3wSZZIOHlJBozcvA8klXvgIAp5Yr";
    b += "EIww6ZLDAZ0yFwaoAgKhi6ZjZ1zIIz1npUzERg5LTDWECaCyy06YmbkxUxGC/8VrzjpFo7KRyND";
    b += "GA8Wp8hcy+aGCpdiTUfXSrDkf0ORUMNgkLPfDUTqRBwbyIei+Bj7yJAzwViOCG7PMR6QcGwHRJW";
    b += "aDuCwAndNGJ4edlHmzLprSoYtJ+GNdiL2zVOGePosn0t8RR6NXaOciWl0T7b3GLK6GXsArGyRJF";
    b += "9orEBF8r+kDIaVQEjO+jLtAPOF5eWFCJiRmxajekLeAoDW4V7gIO98lvcjJXuzE+tfKNJaaHNF2";
    b += "tvNQBfJ9oenDkW9EKDj7BHIhIYnOYmdMGHMBJQBc2H4DJaPwx1CO31K3PHr89Tvx4z5hp1iT2Mk";
    b += "l1Lo6r2vUXv3QiIGwaMYLmZbGzBbVrKQnLJEUoYrv/BBptE5CZ5aATlsIkZfNDY7EqA4b0ZHZ7Z";
    b += "VLo5vXByfU1w37K9zhWZoEo7VTlWcf2NwGqI14F8MYtJTxIAvMCVCIFPkZXaRl42LvGxc5GXjIi";
    b += "8bF3mZrnKnBcadFnA6/b9g+JX9xd/C8IiveFEDx4wsLQkzz6uEmWc4ZmyewFBcY89QbjBkeAH3W";
    b += "iCBWbI8OWcWghfWLE/OPPjC6itPzj749oqjiN0ktwrsg5cuNJCV7DVcPCPZxTMcwjN0zvh6Qxx9";
    b += "txUJawl/WgFmFxupyI5QJHY2OiwGj+2IXy3ZhiHTik7a2rjQ+JNkgxBzYEhmbyOlkdhnUJcxAR1";
    b += "pkkaA7ymsuEFWUOGPzUgCmH5aAtK0qxhKq0/2FjNirrgDZ5fAwQFyiCsDxQh82AUTXWrBRzaTaL";
    b += "YNtwEiPVHlRb2k/0FR7TmEHS6m9xVeU4ydtqEgHqsg3vcKevVPCqq8cx/pf22cXv97RW38J7PXF";
    b += "nm9wIBSko1CrPpAV9CgOxWkwZDu4I2awiaooKoNLjxoW8/LJZt2U6pWpQP+5d+auTf/bOaIoW9l";
    b += "8o0AyTfEHAWUVYlcQ1fINa1xeDgevhMY0iJo2wB/hFimpbEsjczJiB0Z9oaHxiPQiJjPbNgStm/";
    b += "RBOyVSqbLk6IlewWMYkXAUqxYGKLJYxJW2Rjd5f1Lgz2F/w8KaldB/78ebBF7sP9+pKVG1suIU4";
    b += "SW2JTBWaYDDiCck3MEklTsSWwvZd35K7GhcQgdHiKZWPCxx/G0jGLooM7jrt62x9efYEJa4ecAy";
    b += "bo3Pc2BcKXYSVIsO+Egy3eQ0k5wdKB8WlHQZou/K+i2BaegfEvZAwtOQV/bprsQ/hDGfTyDP8Ew";
    b += "7Bz+EMeCR/yhCEwHzQ3LzjgMoQ3PyBUo9yLjCjTuYkUUdTTabRiXOLZdImHVJMewvShzryuKyEt";
    b += "ipoA2XeMz2Br+zUKm0ervlHLdUMrfNmXX3xbyu6GQ1miAmSsnWZsnUkeiDVNWsceiQB9ImClE53";
    b += "MiMSCA/7iMdewy4HkNTeyesW8htr83UpDacxSkEra4JW6DgjPzyBnEP9OyMgSA0f4aosvzie29R";
    b += "MrH0eX52A8BnZNi0wZ7HGmIGDQ054rgkvcC7IaNSAfmWdAvpieOOJIAEbMjsYabhKXjGJUzpuHM";
    b += "TQSS0Xxi1ggQOIq5kVKETFuxiXpH6qtQInwen8KZ4BG6ZCxz7wQEFjDqERiKZiqf9eUlT9ySOUY";
    b += "AH11oyTkYr2GW8MeVV1Hfaots83F0+FB0kn34AGudz27Pax6rPUt5YhlqD2jEZgFzXQUGIMtrgT";
    b += "Qlss3roFqFRpqSHGgVjZ5u4ydxC+5UkYskACcv4BPPeYoJaQJ7cRVSMsNcfTv7tcqzXzPK3owy8";
    b += "jkh6Er2twp05VVcCF7hZ8Jk/me47m98/CzAunHa6HgHkOGKg2cwfWGMFI348gGE1UeYB/4ZQOQx";
    b += "N8x1C0gQCx7RbVOIyrf4SlnxYSdgx82/Vlbk7qpEJdGWCGwVhpoVMhqMR04EME7MJq6wJm4Kyed";
    b += "QKfb1Rw4wjfnE4Ij4LdNoLXdDUexR3CF8Ii8JFzerOHRkFvcNrOwJo7uSmxzYr4hxIT5TbFZxHM";
    b += "pkvvl15pvczPi4swmO2S/JakUxho2IEUUcwNAMyGu1daGdiLoIDpleCkGsBeNSaOQjyxwIkjDsS";
    b += "LE9jU5lDZUP9pICwjqysKeNAjUiW8+KQI0oQGM/rhWmBaqUEbty9hdXLHAcYon5NM3widwpT0sp";
    b += "duQtyXYhxFujBYfNYg1n6jQxBoOpRwuZVRYIdW7T8GXxglaS90IZrWMf4qPNE1+bAfhYwA20gz0";
    b += "PoIyv8OHRPDHn/JOcxCDrbgF0HRGHUv80AjfqGbZT/XHPjGD41TwVXj7wgJcqpaAeoWAeD+0D8E";
    b += "F2ZCwTfYKSPRh9hMb3g4i9vxKZcMSEAZKb+NRtEjRQXidkWIXvpv+Nb5TehzIcwUl2mpAAbgtQT";
    b += "AzJLgZeyMeMseSYCZ4iCWspSyqWMkXon9FkQ7iK1ZwQikMqQqjjLR4HCkXawH3z4Cm2pDZiLpHT";
    b += "hiTY4LERWFlNczg1zUU1+VIoRKXkBi0OZrZLcrOY4UpUJrAPNvdhp0BqnyDidmghEw3CVBbZSUF";
    b += "ARDQeCBAQtgoBFCubKTubKTubKTubKSebBTubBTubBTubBSebhJ1Nws4mYWeTDGJ2AMl0E3inCb";
    b += "qhDemVbtsT7jQfErbtPOYeTvhtM4/ZI/lreDj7NJL9rgXOvtmCZJ8Ls6+g2dkLaEP2fBrO498vm";
    b += "EvcBQMWoTjI4G4FA4XzLHFcAng34h0MEiWm5AgC4ZkCdOJgZdtsnK3AONsWo2ye8ENjHOSGsNJF";
    b += "hCFohLAUxkTIKaLawotpxV4sHAMUA57QgQenUMpCyri+QEoL/WMnAiHcz3gDNpzy4Y2c7AHYUob";
    b += "ZdBvikyqixaMwDqMLuaFeEPB1LhTCWk/S3R9jBb2IFQDbMohiLLVIu87CdXkbLcCGjJvsHhrqY+";
    b += "HTXyaSIhNLfJ0MJqGAJAQwHrtIyDUKFBtKiQyKYik/PJQyY5SF3iw9MHahxfegGKKFIVJ3y2Dv5";
    b += "VURgJdleEQM/YkVFzLyx4FySfLzxkZQJ2h2cmSqfx511fPrAzy0FyJrYQt8ZDzWsLk1pnBaCkfc";
    b += "kp3fAciYWHJBiMUokPY6D3GDlaTdDrhtmVnlaX+k0TMqGu3+wzQ4kMsCYqaPmEaX7CKGriguJ9L";
    b += "qSj4Kvm56zr7ib3bTG8WYFpDl/cIdr+4X7rIS1uIet+gYjbd9sRfezHDyIkIMiniy3HEVyT8cM0";
    b += "7uQ0q/zcfJb/NlK1jJd580JPfGpnskfZEpKd5UdoSVPv/Md4vPHV+RPOeyIbnUsOoEeGGQK5bcU";
    b += "gEAF1rdbyQAfB5J8a0ihPrvJOAxCTwr58qIIMPmyoqFkKcEm70t3uzRzQy2zGaP9K0SYqGGVycg";
    b += "MziDBYkKBTNYMBkMwcII0mCMQVQOH5QIAF0lrB/TcMAAWqK7xRl3QIpME6PUhSre750wfXNYC3j";
    b += "fG1aL1CqP2jEhVYXUm/jUd1bZrFvMKsOaDWaVwXFDcZ3gyAkATRQa3HTsZQU4+DZHcej+FdvKii";
    b += "hoxKx6fmtZvuEuS7jnenxjUc7iLkpD4krWzHbukoSJPb+1IC9xF+TfFT2Luxxh4oZGVpxgrIKxL";
    b += "xli41kSST3maIzYf2G7NJHBHxxiR0Nm+5TBMCdaGU9L8HCAC/MevhHX51DGE+ugCzwUqCkoOROa";
    b += "6MHdVIjtMVJ15sI9g6qIUuzGtZrAYSaMnAMk64WI6v9YvGfUmzCDpiLMoKOoOAJFTz9W9Tbhdzr";
    b += "0AIiS7A5xx6igqBhufJwxMpjBbECRvNaH0UPhQwcXygltXoCjRx2+HUqwIFR2KbcCC5g4gFhwhh";
    b += "2WmeOE5rKScUbprlw6xqSTsrgmmmWfaMCDr8kIB1HqG9X0ppKaYJiChsZRMSgSnwXfkfSJj3lRV";
    b += "0O6Ah47HXOX0jpyK6zrd8r7nTaUV4/CpmMC2fAMgsAYcYnnMxyDBiD/BnTGJgmjmEMMnjGlccpF";
    b += "g2+cTDa1EpoEUiJ/LykeEqmshDVJH0qL4TkBpPj4SgmcyEeWm8da/GWGRA3QhFNkwoFwwUp2oiJ";
    b += "ZI6R/BkOPE8In2RFW0jXlxknzxzNJ4ZOshJ107CiaXfkDQvseAIZkDKvyz4dpdkcMvV3BSrS5zD";
    b += "iRobdHWInOVyRCFeYLSMsEshJWspzyb1SYyyLf+UjHUEmFK1iJdlckqk2hu5lQOGKEQzj2MRQrb";
    b += "cwpcS2AZEaGz2zrYthaGt8QI4NU6MtKQxVY4MSuA2JnZGtPtHqSXAGpCX+U0jBErzsfmmjwwlqO";
    b += "deEPlfLzwOOIWLziXYz6+oaLSpDquxj1dBYXkTyZwWCh0XYuGsFEbpUg0SUuEhkSclDoDReFDNW";
    b += "yEGgWF4EMzTf0cDsXfb7u4SUu8hiqYqHOGy7qfF3VLC7ifF3Vdi7awCTOlSENQhmTv/so/ruP9n";
    b += "/30Q6TadZpJG8gcxwDEem0QPz3CX75XoIzAkLHc+aRLROFfpNtnsdSFwI2IgEgvezBjWM0cyQte";
    b += "4KBcGsxeo8O0mQ0WljQ/v0bTENdfMscOvxcfx/UIZB0RkETN0NAKOksrkHCFJKbMS3QLW1ix6/H";
    b += "CI0QIOJ1KByzmyhUaUO4cqJJtiUN4OuJVgLuXdVwLcQWHlVhz60CVUDj+WEdlhjZIYlr4TUPMiJ";
    b += "cMbY//EZWco5igxvGapUDVXFeSdRaWAHArYZzruBApljiQhPmGR8biMU1qQrVA40iCEOFCOg+oF";
    b += "sOcNyyBoJ/67R1Iim/2iKdsVZDduIPKPdybsBhPl6EH604Hx2+taMaso17D+eckw3u7/BwX2SQ0";
    b += "qi6sM/wCb3GAhtOl29ZaTr0mp3ugUWl6dBro/IqrzefVa8dQTeOhIbfU1+/d6iIOEAO6gRuPFeI";
    b += "VxI04jAMOTxLGZghtiCzBHYLOZkPpBtjNJmwuOrklgB8Nz3mXauTfANY1dZgV4tPaSXRqFD2W2g";
    b += "0f82E1OXOEwVjFSpBUFJXq4GscklSGOJDVHEMKLZGo6J3QdzvQC1KFoakECDhrCyiSOttGWGUjI";
    b += "MFMw74JQ8ZRovNKKJxY57mCvFgsceVrS4YILZiqxcwKMUhcSTXBXClsY9IJ5kY6iRjEI0WI3J0N";
    b += "FQgQRtCpTXyQY02xiWAUaz4LiDfZUXcAqU8Mm5w0FiNwNNTvZIzQ3x9lUDGywCLFWZh96Qz+QwE";
    b += "iQyZIMsASTNkQgxVnPPgy4eIthDhGiM0EcTDV54zgBQBJNMVnIkUmMNDuczxZEupDLGYNJKfYci";
    b += "PdgDDmMDWsmZJ8gsQTiEVKjoGSICN7NIxcgRHUjjyW6FLjiEYyDOca1ixMGUDBt35hq/mjKlJKG";
    b += "oDriiXB5MBtJgNeBVbOPUV30YJWMA99peD8JJl2TiAuGBQwM5vjicJLFWxKVT6gv0C17ZBcp/Hy";
    b += "vdRyAKe0ySfQDY4w/BIM48WRo9ZaIuDCkasNAIr6S/wwsmGwtVjs7DOrOIf0mIRXh4xzENN5qE9";
    b += "89ABtpeWzBHg39kC5kMYs7bW06hLgBCR34HoF2xT+HfwADjRJEK92AT2XokHYRSNwXT80x2/PY3";
    b += "Lk+wjv4dJqpYY3CQUC6EEC/6V5NCgO2HrPpcfOL3xwTwPgCxhbz4u/vPZ8sKPZRT8ZIjJBz9VxP";
    b += "SD0Nl3z0YX3j00f/cICN2ZXfbwysbzx9aMEEOrDvhX/Ncz2gferF1EiUv5cp1OqdWrNGppslyVq";
    b += "lSESpWKFKVXf6Uqpb9e2ry5VKdMTWZAT6mvtzZTp0/yDvRPSgxO9GmS6OOTlKiUhwQHBiQnJwaH";
    b += "KIOV4Eugn29SYog8OSDRO1WVqJVrs73lqamaJG+dNsk7SZOaqkyCVeq8E/VapdJbrVEovbQ6yoe";
    b += "SUH3AtGbxKMoM/H7dNpVisLSZtLWsi6x1REwvJv1P30wP6vNKVard3GFPFDo9Bph8K00oSgh+Gd";
    b += "hNQFE1WbCSwD82RqgXFQPFKmcOH7cvCQyCUiFNiEqHhYWGZqoHaeXpbu4JUlC0XJoQqVErE6RZ8";
    b += "tRMJZO0m1KXmarnJlVLE8K1WpKUomhQtoD8BUNBgerQH+a9kDzDvybkF/4RgZUMxCdxcV34Bsbv";
    b += "LetTVs5bsT9aeGWpmehKE//2wxa5R69+qoPzBmYSThLkpihzkP49qMqbqoA/cuAOFO41A3fhwLH";
    b += "grxUL7s35Hs/5ruB8V3G+qznfdZzvgznfh3G+j+F8n8j5Po3zfTbn+3zO9yWc7ys439dyvm/kfN";
    b += "/G+b6b830/5/sRzvfTHPgiB77Gge9w4Acc+DkHfseBSzmwgDaGzTmwNW3c/hqc784cuAEHdgewj";
    b += "AV7ANieBbfnpO/ISR8LYAcWnABgLxacTMMVXAGP5XyfCmA/FjyDU/9CTv1LOPWvAnArFlwI4Dos";
    b += "eD2nfTsAHMTGBwA7suDDnPLOAjiMBV/lfP+D8/0Op75HHPgpJ/0LTn8/c8ovpzENYGAeoA+1WLA";
    b += "ZB/YGcFsW7Mcz7m9TAFuy4OYAbsaCWwG4KQsO5xnX355n3N4onnH/ugE4gI0fPOPx7cWB+wC4DQ";
    b += "vux6F/SRxYx2l/JoCbsOARnPaO5bRnIqe9c3jG+DWPM34FPOP5WMYzxtcVnPRrOPUdBXA0Cz7Ha";
    b += "d91Tvl3AOzBgu+T9sql+sz0VKVUkyzVqX5SShUiCdgXKWqoSIJ2Ibm0jUqXnirPlqrSQLo0pVov";
    b += "R5utVqnP1KrBLgj2O6VWq9FKM9XKwemAd1AqUrP/d0ZEp9eq1CloT9sL2tIRtOVPEaZJFqwd1JK";
    b += "1Y6rUYMtVKfDGGyr1kDLtkQJaYSahrEGaluBXzEoLWI4UfX8pFcf57t1fk6b0lv+UqVVmAv7C2y";
    b += "tJrk3ReGuVKSrQsmzUxBSVvn9moleSJs3TV5mUFOTXpIkisYkyKcTP3ztdroLt9/Tx8g3y8kHJE";
    b += "1N1vn7x/iG+3sla1K+hoK5EwhHAOUnXpGarNWkqeapUoUwBvJdUr9FI+wOehdsaUJRej8cJZgKl";
    b += "mZtLAPNNUWfAvELuhoHPArghC07mfE8h35nx/Ds+A8y0XKsFqACQhYxbgEqtV2rVoMUIBwDvBWE";
    b += "w4plqrVKe1F+eCHArCfBeoWAOVoA6G4E6wmJA3zrL06X95TqpQpWcDHKo9aDP6fr+kC+4AtJB2v";
    b += "OfcLPyLFWKXI84WijKQj4mCfythjgu/Kcq7J01i7uDK8aGw939yLiWwbsZIA1uz6c+7crt+TZq3";
    b += "5PnUZPmaYRH1/fa4mofmZmWqNRKNZl6nUqBlmq6VpWmlCarlKkKr+4Ij1lvpEq8Tr0aWEgQTWT6";
    b += "BttTvRLcZmETw0ZSPUHeuuC3EeGO2yiTtNmIM47uL9cqDd9HgL+tWelzCBzWKTo+OqJdPPj19QM";
    b += "4384vvmfnNqHR7WWefoFB8dHRPWLju0XFR8Z2ijfknU0blzWXxjQvSZ4uT1LpAd5lKbXJqZpB/z";
    b += "tiZCnBLyAO8claTVq8CuBsvFqpA6QC9t7BUkL1A/UGcvDiX6xWOVivVMPKpoG6YkhdlqSe7+FDW";
    b += "yTnAOIgTQKLTK+UauVqhSZNmtAF0IKEUKm9FVTR/O08E6oB9ggrTAdqgwrhmH+z7DBVllyLKoAI";
    b += "SOhTqFQP8kO+axn4hdINU14Ar6I/38P/Gqx0UKJTKEFrARUE+5FCmpitVwIqoVE31APiAkkJEMZ";
    b += "StJrMdAbPKTtWfshD4B0NkOnMJL20tSq9P5APwYBLBwF6LfVnsumoEGsJon0OnPVBcnbJTExVJX";
    b += "VUZkcrSV5fQ5XUYGvcTyYtGJiv0qywxuuPaYkmLU2lh584KU9Y4/lyZPXDibVHGa1qsPGma8EAk";
    b += "X3YmUV/IM2sTWE+tQrS7H9BZtPk6d6giVqEZCkSCZUAeT7Co7cG9WnSKNRnpu0Q96KVGZlgipWd";
    b += "wff28ixlJ7THRAM06KQCI9emAi1k6uxIjT46Mz1dA6ZWEYEHKkaeEg4xBOy7aG6YsuuBvyRJa0C";
    b += "8mDTkVZhGk2rIRrmy8tWvyBerTw4xJGrASgPxJ0JDQTdDwzv3inyYqQpFPzppGugYmE29VAXnIB";
    b += "N9c/OBi819n40ErZeTNhivHoNfZt387xOklQ+KB7QHTEaMVoWXt64/4E8Gwie5NBXwNmCDYeisq";
    b += "JqE6gTqPkFkpKRUjQ7QENDqLM1AkFurTMrU6lRZSoDzgO8Dy1Wv1WRDVjAV0AxFtsCgwWDwWXZl";
    b += "ZRElvur6IzvPlWqY+mt5le9WVeXEIAGLB5wI+B9wY35efjgH2ExxfRbVJVRf8DudzGZVVs6/0jS";
    b += "NVgkaFujlS7hETdJA2LLVoF1xULKE0nfl+ja1Qgk1bkjBpUXMis5LrovXKpPd3LEyDeRjyllFVV";
    b += "nP9R8wwXiax9pKqF6wT4TzZTj4NmhbidFo2gOmtw0g46oksAeFQ0IC1nu4WpOZ0h/xH7qY/kpmE";
    b += "1LpDHyyNBngo74/ZDmVycmqJBWk8xDHE5V4tNCGglcepEQuNSSI44hWpajleojjOlQ6yA/oK1ql";
    b += "CqYVClwClQ7yNAZ5QIPAhgRbBFa3cXZqBUjjVEEF/lMUPlfjH+Mv1ZxIU3DFtvjPpZ4MtOAG18R";
    b += "SzwEaz/2PcAj/5UKT2OH1cYnsnAz8GwcuoiokpXWFqLU/l5dHbykrX1fb9d3mdwUXfFIOVst7nd";
    b += "txkOL39R1b71zt1HH+nyOaPLKhHf/p2mXqZtZumkaRmZqpgyifgtgziO1AIskMCggN7Szr+Tf0F";
    b += "QhqmngieFIh9hK0u0Hu1vX/gMam2/+/SWPFDv8OjWXKYeapJYujbFVFiVLGWhNh3+DivRNBu8BC";
    b += "0yHWwHj/tHCUwMNUqkiIzxYgfUsg7YEasXAWpwI1TAqVTg4kH207guMwXXtIu1h9gJolqIHpxMr";
    b += "bGdJAFhxFThEYuCtLAu6iUek06nCoIgBjoVZr9EZMhDwpI1MFqGdaJuDTbzgS6eUfcj06vQIrkL";
    b += "J13oPkujRvLy/vTLWO4RW9USVgqAROmCu1I3PWjdXf6Krh6KD+cvCnZdVmaqcTnqeZRPJj4CsU8";
    b += "mM0wLc48D2SHkjWMfFdOsZHRMdHRLaNiIyI6YVedQ/vFtG2V3xbWUQnBMvatesWH9OrS3h854jo";
    b += "zrKY1u1xzqiIyJj4yKgYkDu+Xbeo2C6c11GR8a1ju3UPR6/DZG3iwyNbR7WJiGyHXkTHtm4dHh3";
    b += "9f82awpMZZ2Pu9Os169ZIDcQ9dy80N14qXbwOzIub+/+OUOok77R0HRThdUnxQFbJhGqk2FoSqg";
    b += "fcE8i8VNoeVmPUAG8g0WDyjfpmvnS9Vlq3udTnX2w4EM7kaZhOWNWWIDyfS/CfYr37icZtYuAhH";
    b += "Hgc/a02g0UtbQHaXJF2EifvChpryX5Uc8jk20FOVL6uU41qZNJNJlq4Ss6blYCtU7DngMkz6pt5";
    b += "GiHCj+ca5NZlpim18XKFQgVTgR0AUE55qs4rRal3c8cdZ8p8S/YUBl5CxpmB15M6GVhKG7SHOcy";
    b += "7o7RxnmN/g/OAX039Cs3+PdRJY+N8hBTjbr9vjts31iDcV0je+G/m/Q/wHrLlCoz3JnXJfJCxZO";
    b += "BYooVg4APkBJFivTvzA3jPpP31m2kbaVIV0DDBRzp0qAHw9GXV8wfBBQaOJzSCgRMIrFJDnASME";
    b += "FQMNW8hVaalIxrJpPOhsWbiW3j9NfZW5G1LY/z90XXK5OsO8vmzyvn8TfqG1y2TTkTqS5QrpGqi";
    b += "8U6WggrUamWqTpqqTNZLv7hIKGdW2ek05mEZOJuMW1X4rRjWvh9L1h9T3hMOjjzlwM8I/KNj9C8";
    b += "uRw1E5yv1JIjncuZj3GXg6nx82sfAGtC5xix4AAdWCHD6qsiOTN4IPqO9Uyswh1dRbh/y7V9cye";
    b += "AJr+PzrhLEY+6nodZYVnSqiBLf58v1ergIkAJbnpqUmQp12FAjoFWmySEzr8XKVyDYq7IAU4qQ7";
    b += "CelVsMqEa58JxZ8kMZc4o/OMpMvkqw+BrYCcKNKV0JKplyr8ErMBCtS9ZMSrkVMHNwUSrkiVaVm";
    b += "UVBpgwbSuoM0A5Xxmenx8mR4cjFIDnYjdYo7U48rwUoGHkXqZeB8Gkt9DDyb085RxHaFgccQXSg";
    b += "DZ3C+Z1LGq+7ftqDqzlqhPdCvbPNZONsCpgWrOT1e852RxvuYQol+wS7OYgkMZaz95l6LywByTJ";
    b += "ISwOzMTN7C/9/oAmiIrr9GD5bIh4b4ZMmBxqcqOiUSRPBckGRQe6BvqGMUt1J4rAATMHl7UN+ys";
    b += "XPDG4hCrpfj7cNoEJn8vQjtZ+AB5LSFgZOhLgJiUHqKVo5aJ08Bq9Tw/RdSPwMf4MDryZ7NwF+I";
    b += "ToOBP1DYSqgqdI3Hyt8EzaOs4CLAtgL+97RUNS2iS6eN3Rb3tjxrXsoXu8HFS5vaHp8dVaPdX+d";
    b += "fnxmw8UWrN9frnlaffZr5WbxYNoiuluHyl8Xlmev3TCm1z3ZMcpl0tr5pj+rxvW7O6tqqi3vP9V";
    b += "2LelEbWk5ythqwTNTlS4t94tJy2DazLB5lcURMvXm8p+fx6B757ePDe3RLj+55dlDak+7L5jqax";
    b += "s0syfl0uN+7GhLzWbxlU1+9dZyzfWyDz2+35dxv1GLHzDVLH25s5rho3qz8gUFJ9km7UjS/7+vS";
    b += "esb0kUKTd/UWZxatXXk44cy+RUcLCk0Gj7lrP3xL05RtsrzTOx2d2uXVeGX1dOeh108TdGaNZth";
    b += "06BSR8MFc16n3wqB+dT4N7dU7ybwwNe/Pv+IjLNUPdzzfu6z+8xeZay+a3r+WM3xK6Wiq72bFrR";
    b += "lfijbckNs2Nm9YaF/wuKTpgPUbxoQub34yMi4i++mpZiu69LT765XTH0lLDzWucn8pdJuoOKGq2";
    b += "rmq13P7Oqhni0NbuwDngDq33rwU/Gq26s8s88s7Z3dKbXd/ctHoRTPXjnuc4jnbYUdei+z5hfdO";
    b += "zbg/Nd8m33tC2PQ2wRnnPhftWHl9x8M+h7o3eWnzsteKUS1nXO7nvC6/0PQK3Wd0tQN5vq6Hh1n";
    b += "E6vse0JZt+SNntcmNBfqXC4qLVQtKxrQ78PzYomLr00stXDUeDz0Lc/UdbqzdHHdt3Mesbl1b5K";
    b += "cd811zoiF/8/ERvQ6+Ft8+1m766stdk06ZpLi72+aZ72oYUtfJ60uaR+fqliHRMTpz5V7zAVleJ";
    b += "w+NzPPQzlj64OCyjsmOa9Indjy0vGvqcYcHM351NZn3W16g1Zv0ggGSmsUrHESpwbU7DWrfcMe+";
    b += "zQHbLJybdCi8Ehl1amGf1xqv/s9GTdVrklYOth18IlfEOz7pU/mBaY9Tu6x4v/zjgVeDM469Lof";
    b += "K5oaF5lTAFz/qdPSIHPOBPz2c2u531z1/Hhh+cYv3usEHm+pOThn+x+jmXcN/M8t4kTGm5CT/zI";
    b += "WVZ+q0dVnXd7ZT3sVNYek9F/+yhz5gtXPKhS7nR6uHfeTLxibFKKUv7LsWvp1vVaj0Plwzt7Znp";
    b += "7Zj7vru3zX9ftzuoZGvdkx3vtMw0P7LwGvqYLe8Wqb3D8fG1OhNmStfxs6b0OzhuRm/blPmy468";
    b += "bmH99OLGsCMzmr/2mtNs2ayo36+HlLjUODk4psG+9YIb5fAoMXVcLWqaz2Qq3fqwW8+ndq4pg1r";
    b += "Z3Wj9sN76RXVrVF/o1DK2y4Od5ge8MyaZ1omve/FUxo7WhzzTnZ8nbD8tlsyNihrnqW8csjzEr4";
    b += "XH9XFTz7Zc2tK6pHzZjPxNy3TU7aUuZRmqeZ81nvo+21qsnX/k6Lw/qie0m5Rxv+6yww1bjB13p";
    b += "Vvvkh3aUwNDJsjkrUaZOFenNr3ead950t2ymXPrfnLY6DCi7cs8t5aCbeWvAh7dqBdDFZVf6Nnn";
    b += "1zcHpObSA9XNJu6/HheSN358YfLV481KspuF1jvzZuaduTU21EvuXPt58JghoywvPPPcarMhd+y";
    b += "8o0PMTDsmi9uH9gxbeaz//QZFqowvq3ZcifR9vqzPXy94XYumx/TJphoNS5+nvuUam/B77Rq5pr";
    b += "KG79Pd6kZG1PVZsd/7/oJ1zTvdm5Xd422DhP3PGz0oWyQY362L2+Cb15SPHelHvpdmWoV3Xv1bx";
    b += "0HPpuVtOSib4HztJ8Wb+tuixztax+WUONV17SSZ+tMjh4tNptd81zh6ygarV2a7GgS9uTvzZtr+";
    b += "308vne/RfuX+N6Ptk8L9bK8XDX9/epa515L23a3ae7ptdh8ftP2Xg2/sSz1bRZ98cbTew6izPVX";
    b += "lrX9KurXSs7llEw/r3z/eyY+7dX7uVu1KVf6V8rIH9b2Plw+qtmqNiXXEizfZI0t9ctbM+pAnUU";
    b += "zcEuNzrZrScpxQOWLl3ZdUScIrfcFet/N132Un7hKJN18evCdc+2emwr7O/D3dc7c33fbnu4PjB";
    b += "v8yxnr5z3k17j4ri31+Y+Eq4fqVt+bfnPenmWnG24M9Dt+33CpxHLhxu6X55DPbtqXs7X43auui";
    b += "yB7dL03IlpV2iZ/eWpCZNPGP9x0nmR13vzpsuHzzn5m66LBLweqyxe1/qn7tj021Hg/Narnh1+c";
    b += "l5+5Yj0i+0rWD86haBzveihIOyZqs7NLouvbyth7LPk0/OKHdOkXw6N9UDx+bSRrZpsvaeh/wuV";
    b += "5IR23pm9FKkzdgo334x82lgwoSfy6ofu25tX7tqjZHf2sxqXvn4hbVJ04bcrjl9prTermfDBUvj";
    b += "LfZMDO1UElfLTZZ2XR+w3oD7JSzzE+dm1H+IjZ4Swf3pjM3pndxvpZmEy590mmGT/jTsy9HPv1t";
    b += "tL/oy5MlbVYdyst/4T/o4umYxh3CikPGli65Zlf6aZtfw9WfC6r173g/KCqo/G49YXKzYndr2Yv";
    b += "Bo2xOR9z7LPDznuoy9lKXrn/Mz61/8eStQzUW/tZ4beuSIbJ9bQZ7OFu0MX2T25VXbYjwlwEblS";
    b += "N61pG26ur3vI1txLX0an/N/vg5bEBrbYLJtdNbB9pbR00T6WsUvXua1Ozn6lIH2zMuY6Z/3n7zV";
    b += "IswRacODT6/b+he77H4UPPQD+86f/QZ9zrnd9dLTzc+3jvrsmer0yZTW27tapNV59I2hx6tla5r";
    b += "/X72ODbuQdAbRcmxHu+Xrk2/NbJTrz6Tl/urTJK3B2tHaCzen8garBc1U73IOfdRnHfSxbW4y8/";
    b += "XMqZNqbdpiPNvifvG1xt6+dqVuwP3uSy1LRyrmm5XWrP6wtbl95xW38rIDHVVzht55m2i+7v3x5";
    b += "2DZr2eX3jM703DQ3fsnx3aG7DX9+geD4mF6cH1Q07aZs0rmjH9Z23SB/nhloG2X2ZP6uMdMbZRq";
    b += "knjUzZjVQf7TLWr+eD2mxe/31hVLUU7+u7rEd0bp6zu+XOPxZ1r6XT7BY+m8s7eupgqNl/ue3pm";
    b += "A9WoVfZDhkn4jS61MfWxbBkRtjI+9tC8wR/07QF1LpuQMHfqxIQXfU9ENBb6hdy2XXF52OxVDZL";
    b += "SY8Nlh65umGwe+i6u0Yywq9WH1W6gvuc/PHCyqHvu0GXCcy+67Pmr1n6K+qPOJO/o4+dHC90PTn";
    b += "wtfl997/5NB2eX9ogztYvpt6rXcrc0cdC77WdHN4lOG/7x3ZI7m943dugSPrUtwN6Ji0rO7BS37";
    b += "Dqh/HiiuFfp2VPae506+lJrds866/d8YHzzjNkFubfSptfN39zp7CPF5HFOymZ1x/Bv7nOy8TX3";
    b += "XTlqvO21t0Udlj68UC/m5MINH1eXtHCbXaQuNJ3u7MWr0+fcTLtxT3vfKqW7XF39+2btSqVDaLv";
    b += "RIz3j7u4fNvaXvx5/ObR5/Pys1ItbhZ8Xqx84zam2p84ft4rdnR6bup458l47+/bM6V2ys6bNiA";
    b += "za0XVT/+FtVXnWAW+bzFozbIWic8monOmf3mT3Vv25vPFl85h4y8hcd9vp/lsHdl3eteX5ZHV0q";
    b += "+7DezYfFbB67fILYz4Fxz59ueGy1dqZun4D/BYutHWcUa3Z5gON29p1aGj+6e38G08fBz3YPyV2";
    b += "ftuNUY4vPyxWJN5o1lh5hxr5y7XphxL3J9o38Hg5/tTuk8Ko9T+vta45i/b4lN2/d3PFgEV32o6";
    b += "72SfZ9uC7lpuiLWvtvZ84fuvhO8er2bWYIJ52sN+OI/QMxyeDbpS96ez4SHLdtE7nXo5H+v762X";
    b += "J6dAf/V+1mh6zI6Fkzf4mMJ/0Sbkptqrn97flVtRe16D6lm0loll2LrKHP9y6u8WJKOF1975w6Y";
    b += "WVtR19wvbdw1BBPyxptfwvZMdBsZuioWrMdGjTSrIjq2uvRtuSp3mbvBcF/Jr39dPVVp9TqHbUR";
    b += "B8+fO9dLJWgb3UrdcbL+0dTLPI+Fpg+n91qQNksZYSJ7dmfvhZe+KQVOLZen3J37wTTeqq6Dmbu";
    b += "dZG6X/GHFqxqNbdRdUa1m9OlnvC5vy3+6t8k0pP+B+4OnZcasOT3heg3Pn4/8XL3Wjl/HpkmcG9";
    b += "9vtygw9XFC5yTJhPjn9sP7LBpXkPHpZr3qX47eyGihVcVZ7qJ6vOn2cnpWSe38ieaffw6MjWo2Q";
    b += "G5z9fpsHT9ec00Zd+9op/hXPRscW152q0uLLNPu9Vbe8B/QomzgkPfPN1gvFKa/Sdv5sHFYysXl";
    b += "vYqXuQY3svj1pwN9bTqPu++l7JC0843jld1bJ5YJZAvLui9bfYgeszyz6fMPQ161ND2ZpQ+aOD4";
    b += "+0nvSQK/2riYim7Lf9t4+MaGNb9aI4s299h9sPvHyUL7NsWcpy7ymH/eldp2Jd9YcrLWldMyee1";
    b += "GWF1cse3hgareNzeZvWDtgwZ+nt3ye5Zm0d2ZrwYPjO549f6c+FrtXe3P8Idf8WvkOLy+s2JJx2";
    b += "sHsc2FxlMRtVdhV+laE1SWt3yCz0FSzN883xD+22Tf/hVuPceYrb/h10qlqaJfX+bzNRPkoI3HX";
    b += "kSnas/NiVydferqzU7zi0kiLPiUT+1i9nCfzyX6wZXaJ4lp5if+CshaBvxxzVRS6fl68WKmvZ97";
    b += "ff/ILE32nFrzB/pYrL+qfzNi4ffjcgPVLCrfLDo/NmrZ4PP/PPo/3x60+ffUgf+angWsD3Tt131";
    b += "F6N8P/8Gsrr/XvIi7VeTjc56fAn+P2X76fU32gw8pJoYPqnY+00y4tPb9hY9Zq634/p5YPfWKx4";
    b += "rKLpUNead6M2w3fDxlv57MmdtGNjbMGC/dficj8cGVac7lDrp15BKiq38Mvi4+0fLWxPEXgFB8y";
    b += "dMDirGK+c9Ejy5n7snfce1qv93F5TLhFvbjFo6TqM9GNBtW2njKqfEi1iNXPB9iYF7dpeFDiLIn";
    b += "xHRAqnPxyL+9dgxeLXz8piO56Y07EIurLRdH+y2Y86udmv1u0K4lfbH+hX4+lqTH7h8c6iWrl9x";
    b += "5WUvfUpZ31d27tcVqa5yLYs3Tz6xGSQ6PH6/J/G7ko+8j1m9UDI0Y38Vria1Y3bvN+j9mL+TMV7";
    b += "5etHbQnNkUhOnbrnqDUSz94mNfo2Z+t+m06HXnoo9XtpZ2uDlzf/umHDav5tUfH+9507ydvFBg9";
    b += "X25Xe0a/yKIAt3ZaZeClavU7982cnhCwyry9X2vPqO7h3aIjeod7tomO8QSi7FsoIVWVEa9qekq";
    b += "2+R2ox+dweCZg4C3HX16Z5xft8rqRx/AFPsmicV1cJeOGT3KyXNZ/2vW7US9KbEPzFDVapt23pW";
    b += "TT3sN8Yd2gBjP0fh7vwx/WFiJ6/7tW964vHvcXbeLboGtwV/G6NsfteuT/xkuJeZT9cLu0GpD8Y";
    b += "L5pAlXPJ1/Ky49cyi7tc+HZ6+W1Uso11Y/6rxmx3yLmjL9tg14e/XMbx1uHt/efMfsg1fe2aVzs";
    b += "RyAqPh77qXzqtfvlGuWF0IvhM/Xnrd9kKU2S/ux69WLOQ1lzR/c/LAVlwzol1xBtLATFl79tXVr";
    b += "e7umr8l1+qkUPl0WEPjD9aa/faN/Xa56oit4U1J5s+9yEV96iwTZzweP8t25xU2llzasuL+wEvD";
    b += "+Pq0a7Vdf5/aap0W77lKeeiXUKDmmfNWp0v6R8ZO7navmiJfLdtfMe6+sLus+olv1w2fUpS/8yW";
    b += "zu7JOX97vCRTZd53ko7aOXrFtz3XM3iN0GJbQ7Y3BblPe66e3ihfmZ+wuvSGGevYzX/OuY94sTq";
    b += "ssV1Pm90pePGtHmQdODD1t6vh/ceNGK7yPz9pNH7G1cvcfAYNHq96nc63OuQ/uFvzdeUT9486K/";
    b += "DU/Yt73vOS3AosOhgF9GIh+5NTKs6ERc2XwEDOn7t60+7Vtz8q13Ts2W3GkxI6VL+k8Oa+Slunb";
    b += "b2PC/qcaD2hGnJro1H0HuKrLcu+gAw65HLCvOQjFt+J9TqVTuat5rlpN6jm7U6utnBzABzD5lq5";
    b += "cXmv0bd0Pe7HletqukBIn4BiHGeV1UZ/9f5cSv79vRuMXpk8ZjmdWeF+QUnTjzRxi3EvoXEobTR";
    b += "hhk/vxi6Pioyu9aJfqOGfZlxWXzNennvZavPDRk6fEaj4j/sbrw8EDnwymSR9+pL+mtjpad+rbX";
    b += "v7JzkXss8L4wt3ft0eGOr/zp9Yr/bzscz3rVr0cSkmmmPmybLMkpfNzqTMzTxfOriR/yRgnfB50";
    b += "+srxl+VPZIahY7Nad6VdODgS0HA1tEn8/oFBsbez9+eeGAejfLW461/6je6tB24IDwiLGi3HGH6";
    b += "h5dN4m3+kyQ2/7epasl/sfND2f0AuktzDcWLq4joSyuz83OrjXL+/MWZ7XseZjpnItvugsP3W1F";
    b += "7WraZOR9+eBFtg9CVhUWFr7a1DV2x/Rn5UtaTxoafNVieeCOZStaC8La3Jl2N7btyIvJTrP6bSi";
    b += "LHjcvSfi0/vEM5+OFrabcy/0pNtbM4fA62VRzod2VLZoRJy7lKa70Op/3IXu7WnWBl+Ond5ziQM";
    b += "nOjyymxC/oueuqg6UdWqdF+fJa8i99Xom2OoT80iP4lP2TSZqghooW4zfPTjgxZC6/29omLbcse";
    b += "ifwioWWTFltpFT71vOp3Td6TVR3OPtwuOZYn7VFu3z4W3bF1P78ZUsr+Z3t4hFmB0byh8VeAeWP";
    b += "y7xVLlYryl/LTg0IW3/hwZb3H3Ze9zvjqN9Wp6dn+5/fXnu421e/53b0iJoHBn3Zn/vuypy755O";
    b += "bvinx2VHabU5w+bgO9ncEDz49qfdLj7WPl29YfO+C9eHLR337CU+Iqpoe0MzRxXAGTbZPB1Nvfr";
    b += "A0JGvihdi0zs96S+OnfBy16LK9Y60hy35aNmbKzAtbtx7mjcgxE4dVH2ahd44GM/jx9zWF19q/L";
    b += "z9Xt+2BBaljfp3fu+uFury6y9Lbv2y0vEi1zbLDpu7l7kdOb+EFT1kPZlB4t3tsdn9T6saXm8E1";
    b += "JjjScyzUrZJeJq01cf5z5JpRnd5Y0o+n5lg3CI+yi3ud4r10f/qK+tsb+t8NKSuanPLi2KvzF09";
    b += "65ffuM/NkrLMiRf/ibtG7hjHTCt3U/YbaULLbeaAjCbd6Z30qL0+kMz+Ppto/GjLVJuhhL5dmTt";
    b += "0vZ55YW7zkjk1CVhD1pUXGqa4212TNC47xq5oeDNgYUE8B7yivaWl5+ea+e0of96z3tvrvjjU7r";
    b += "5GbrurX4ciqyOWZHnsX2BTX7aU7Zv7u8/r91a/eszpaDu13tiT7UE8Uf1G2v5j8ulKzo1+L1WvN";
    b += "ygqqn8wdX33EhsGfze/YdJs6vYXVojDhn4VHAKZ0jj5XntLJrnxudK364rGPda8O1jAb2y1j1Kt";
    b += "rhz0Xn9qzMLRJ+x7PPl3XH7BVXnLY1m22yLT6aPMdM+JVx6a62P16utmDuc/cb2w9tbHP8s5nC/";
    b += "s+mnnP+XHy583WLq9EbX+732nDgHdbnwyN+DKwIKznrIvz6l+a3f7c+QdrWu1Z6FQ8/o+C+79UD";
    b += "/HaNCJ33LXnVjaheyZnOwV9fuLRe8z03Tep4inXGtd7ObXIqm67Uy+PNSu+LIgbcrBdI5d2veKd";
    b += "7+e+lNCUrGg8nJD/moaCpTsB1lNVNeEDxQTQn5c+jXqfHb7u5u7X7wfVOBZ6ak3NBbxS/QfvAYf";
    b += "UzukJybuCghLkTq7rVjgJAVcyCdSzyLqqm0hV2Z+qdqSq3EjPWIC35e/PlZYvmfC2PP6tdMvYHa";
    b += "azxzT5PNttYcO4PfX2Jvd13Nr8Zs8LAeW/dJ0qOv+/2l7qVepsz4HgrXygp5+XDzELJfZv7bDJZ";
    b += "AiNHecYuDONj6K/PnIyRIiQNmteETuCydeNmFsw8HIaO5gw8DoAO7PgIhofajLwCeIARbHM0Ufl";
    b += "4N8J+DcH/Qd+J+YY0qGnkeS9GUk3geQfR37N8Hdo7ox+JxJ4IjE3GE/y8ckvj/ySanLMyQPJn8P";
    b += "URxLkMO0QkffE4ShLrlXJoSPS7vYSdGCLHaMMr6nz7bHTiVo5SJ+dXvHlQXvsDJupVlWUEiFBpu";
    b += "JKdWaaLXiGh7Fp8nRKCp756HgRO+94AFjEKhO3haKaReA24CM4fNYWQ8ok9aDD3v4R2EEZ+n1hd";
    b += "1OKGkreYZ9gKTUNwKbwWK+/XCtPglbQCQkFEdhxd10EdpxJTtXI4am4NF2jUuulCfsisGMz8x0e";
    b += "zULLQmhKcwO8M2N9S9RoUpXwFBoeBXK+/VeH3H1Zh9z92E6H/6VJPrK7HCxN0mi0CpUamkq4Jfm";
    b += "4c174uud2wCb7D4XYaZ6BH3FgoQk2N2ZgEwJXVXxk8tsSE+b/aszjOWP+fzvWFPWiI+5nU2Kuw8";
    b += "Bd+Nhs/L8+UK7qvDDtG8TD81LV/bCqB7NVObYXULKfF4BdehUinjmU6j+dTGx+RRV1liDvcRgdB";
    b += "9pTMTBELG8WnPI/+I4kGzxyk1WpqdJB/QFtkiZmQq95alwk9jOqSDNIqwKLlp1ofSS2mfMZDAh+";
    b += "JPbShe9kDxaB4TKTkjXAo2Rf4IvrtIQVpKiqJ9xV7VxVOZiqYhzs9Iko3OlL4Fd2ewmn02/giyc";
    b += "8dqfTFr56Pe3hvJP14maM/eVpauOpTWK0c2wvCm3Key25erW96ffsQKrayKoOwn89aP+9/UTR8v";
    b += "8bvj1nJaynqu2rartAf1bBeqravqqP2/nVxf9Iq7p5DcxX9X5NWwvzVRXfgKCM8lV9vs4XwnxVl";
    b += "zfhpYVin6qP57T1IN80+v89Afr8BtSw/1qC/geS8CbUsNRjYa/MDzcITi/b+WthcaOhy2w77vls";
    b += "2qrA3TYg2W9o1+cDXS5EKvfMpm6+H3P6Sfo9XsuSfZZvm10ZNZVedCu6xchlI+8om6089eLY7LI";
    b += "uk7udq585cEL2my5P8zrsf/YhtbSgll3VUe78ZtSwqk5NVaf+H6yhrahhVZ2aqk591YnC+W2gYd";
    b += "dsqzo1VZ36/5UPS04GLJix+zjl07vCR6Ha/2BfDv1CsQFtqipJyXB1FDULlA/9Gx+LsVIhieXXq";
    b += "CC//7XPrKgP9pk9QWJERmr0Eeq2MBQIEMJZ7YE2tP1ZsIrY2Q7kvE+FShVi55uo0Wo1g5QKBk7L";
    b += "1MsTUyve92cpQtKqaD/LzgujPmpIZCTYhnTSJuZ7RhV9NbQsgU3H6Z+eA2eyFDlce2l9f9hvMt8";
    b += "VzHOKUq3UQqE3U63KyIR+AzCZNKJNqDRRpdely5OUUuXg/vJMGCloexyOUvWaj63fGfgjH9uek8";
    b += "xqeZpSmibPlkKnVyasALILV2m0UnUmYOlRiBtDfn8Bzk8hZ4qBKrUC94uJEZoF50Sp08lT8Fgz4";
    b += "zEI+uiC1FE6aFFuPBYwumY2y9f/p0rGpDIfixN9cSwO6AfTkMQvZfnyVuJyGw9wPU2jJiMcr1In";
    b += "a0BR4n4SFBWlBrHfZuCaJGIPAzuQNNyC0+VqVdJAHA9O0Q/LM49JREYGhm2E0W+GsPBtKIkkyh6";
    b += "n4SRqFXs8cjhpRnJg6BExGvoHVfgRR2amYm8X9jjnQgUZfEtC3LC/5XHwcwwqjwlRF65JjtL3V2";
    b += "ojIGZoM9PBqx5QlOut1GpiVGlKRVSmnkSTaCPXy8ljhDo9U99Dk5mqCIMu7TK8nMMHAwqkC9NqB";
    b += "irVXVTpSplCoQXUQ5YFEB26HEA4Qh2rU4KXrTVqNWoAeQDLW5aIOljxAqxMpZ4NJgOCp+ii1Kap";
    b += "dDrwoo1SrQIDotG31WSqFd2USVk/iB3pcu1AQDnRslNBlHNPkCDfMYhzDbj+bTC1VKeHmhMmnTf";
    b += "x3674hBzGUpCLRUU0QmoWSA9xhcnnQTE+qKzycX6wOjPVsDwmbTLxKWBgPYkLoUmHtALqMnWZSU";
    b += "lgQSYD8gWDsMGFbgiWCFoCUuj7q3TS9FS5PlmjTftRR3VYGBgTmVyC+mnJxG/RqBVZcq0Uev2gu";
    b += "gw5frRgUgIoez4o24/lA/9d33w59s2vsq99ogT5YTD1jGWtA6gkHw+V7P/GPp6cpmd28bhEHDUy";
    b += "jsZxhMZyokbKYbCYNLkeKYn1Wjia3wtx+bX3OqgP1vUZ1GVPopo6s8anMjf3r6LZQY+tJEzDXIh";
    b += "izaeyoNbKVL0ceUx+1Wt1Zpq3QpUdj3TesD2jkjDd7kTGm4EjCUyTuDuQl3kA9isJIO4FY2iqVZ";
    b += "g1lTMnn6LuvBVSp+bDoK6ULeFBzptSlBQU0MqST+XkAkrr6UtThwCHNCsQdKFY82pMPTS+I5+vz";
    b += "+sjS/N8Bpjy7ScAi1mdrjPgoOJpiPrp3NXX3nxs+ZAfBdjiK/BTA7rFbC+zebf4pSE1rL1L9PWe";
    b += "vD13UXRDcOTa5jP7HEb4r+I3qPMwkkfJCk6C1CvM6aFe+X3GXjygXXL1yljvGtWOdfljYLq6wzn";
    b += "rK7MvqzO2NticfGyDa1CNWr0vhjWziilPKtLFnrZ7/lH5ym1f7PvjN3JuPFW/Ofv8Rvz7aCFV6S";
    b += "gmp+r9FErkKA+IQUq2t0IrT9GowZhWch7llSYHZKOFFJ7r4jWaSXi1ShOr1Jk6lJoypM/6m/Tpq";
    b += "Tg5k3bQ35UNGuKV1F+ZNFCpgN7pbji7O9vxmiln8I+Wo8tMdCPNZhfElJP9zXKgHyM+qAPY2lnW";
    b += "EwWCbBPRLiImmtX3n0h+Bi4muMnAH8HfGBb8iaxbBqaJnzEDwwjW7PLEHNiCA1tyYCsO3JHwFwy";
    b += "spI3rz6DxHmWYS9q4vaNJ++CfW+GOzfnnHP8s/ny6DMKnjs0/bleWvu7G50sIjrqx78CXLYPK33";
    b += "2+gWCL3wbKnk/vfsDmSwmCm30ZMW1DnfOTPb48QfDo+bG+bnFdL7b98gbBO06u2jB1fcYi+ZcvC";
    b += "P5l4rN6g1wWPhryRVCONJrRg1tNjzi9cc4XCwT3OLuzb3a1ZqO2fLFFcHD3z52DZkkO/fLFGcFR";
    b += "+e1DNI/mTPvziyuCj4eOqv9Lnv53qtQDwW/mHpx75tyYAqfSAATfX9/ILt884HlgaTMET9ka2Oh";
    b += "zSsjWLqVtENy05bELty6dyB1Y2gnBe85cdGzY5ubRvNIYBM85WX/v2SUDZxaUxiE4d2XiMNfU9d";
    b += "f3lCoQ/O5avGXP5HXLL5emIrjBy8N/zPxw9/XzUj2Cd+eUF67ZsGOHedlQBE/sMDRVGJ84tn5ZL";
    b += "oKjfYoDEsr3nWxZNgnBsQ32TJ+UFzmnd9ksBO8f7p7uOujjLX3ZQgRP3X1/95L9t1ZNLVuB4FnD";
    b += "9OPOxa/9sLZsPYLPLVgzdWZ6m5+PlG1H8MAa1gc/vBBNuFW2D8E7fX2VsfU3n/lYdgTB60cMOX/";
    b += "sbst5tuWnEWzStHGjI5K4Eq/ySwi+OEOnmufqWhhRfgPBVqeo0a92jC1NKi9B8GNHmxkK0f19w8";
    b += "ufIPj0uC4as9P7Js0rf4NgD6XD3Z52u37dVv6lnJKdvQiIpbDVwrPlgATfgMBHE8nKSw8elDORk";
    b += "xPXH308eAMf0XYw2mazPgxu0nJkbXxATm2rYXpyyNm5RSHISxhwV3GPhpz1Gz41GvFNgIvNebhu";
    b += "RciFy2koOivY9Vzm2zVoGLVkHIr4DSSFz0cu+S5LeroMxRuiqDUbTkwKUf6xeT/ajyjqunKd4xT";
    b += "R8dFX0HqhqPm1MsI+1up75BU6iKeonn85rfJQdZ5hSSsQ/GhyuqPiGX2tIZ2K4A6Dns+ftzxtWR";
    b += "itR3DewGHbhww2exVHD0XwIPub2UtLYrYPonMRfOjogj4zxvQZM4OehODmfeecOBodeGI9PQv3t";
    b += "2Dup7jtjWYfpxci+F58wbz9S9r+cYdegeD6k5pcDzi0YOUXej2C45bkL9fOP/auJm87gs8eeBgT";
    b += "ffDGLl/ePgTflbm8snv9ZVwn3hEErxwcd3HBWenpZN5pTA2i6w553btm/kjeJQSH+tSZe2NHwd0";
    b += "FvBsInrPtXlz0r1fX7OSVILhZm9Urrg5d8Pk87wmCJW1WrO7UKWvvY94bBDsubLXz+ZR1E034Xx";
    b += "DskdtjleR5nfNSvgAJwO6+0x/eXyFZ0JRvgeBFFguXfl4g+SuWb4u/v2maeFXqtj6d74zgvHOrf";
    b += "+rXsU3ORL4rgj1vrue3Kql7cCXfA8FTy9v0816YMqWIH4Bg2e5JCxfZ+V+6xm+G4LVO97bPuO6w";
    b += "+C2/DYKvDrq1R31wzmNrQSeaLY3//c6bolXpMpEY2j8Vx5gdRqRDBl5LdhAGLuTA6zjweg68gQN";
    b += "v/M7OKG3MbMvNpG6+0mbNpEG+7qz8mzjliVE0Ctnta2AFjqvHikwAQw8olDASIYk8wOSwIn7jDG";
    b += "xHovozcGvO9w7k+9ctrgs3YbBpo4ggbuxW3qa/00tW55g8d2jjnt3lwA15WJ5i4EY843YmcOAiA";
    b += "Ldjwb/zcHwxBr5Hvv8tphA+f5ZagiK8Sum/4Uf6+PQFvFRiXEOfOKjHYPLUJXl8vLw8G6vUyZHy";
    b += "yO+wM2nyweCZyX+PRDn2Ao1upsHHjGFIh4YkYPzYOVOPoCoo0RRJOPr+dJbMMgPJqzAanSZTD6N";
    b += "WJEJpWxeKoluANsGggKCtegTjhOANRa3QYJntCPitRspkZC8Ye6xu8+bNv+50ghsKuCLVwhtz3B";
    b += "PMpSgAC3if4GGOX8JnGNX9CygX6W3ScfkN07FRj386NgyCRjTfStMzHRvVwHKYPg9Nx+NYqWyXm";
    b += "KlKVSi1UEU6naW/mUVufJkD8QD8mZaO++xHdAkM7E9keekQcw9zD6l0iNTLy3yYB/hXOgwB4GeY";
    b += "m7mbh7t5H/Y4wRhZfSttEEBI0Ja6GfgcXknkJZ/BPj4+vj5+Pv4+AT6BPkE+wT4hPk18fXx9ff1";
    b += "8/X0DfAN9g3yDfUN8m/j5+Pn6+fn5+wX4BfoF+QX7hfg18ffx9/X38/f3D/AP9A/yD/YP8W8S4B";
    b += "PgG+AX4B8QEBAYEBQQHBAS0CTQJ9A30C/QPzAgMDAwKDA4MCSwSZBPkG+QX5B/UEBQYFBQUHBQS";
    b += "FCTYJ9g32C/YP/ggODA4KDg4OCQ4CYhPiG+IX4h/iEBIYEhQSHBISEhTZqAJjYB1TcBRTcB2ZqA";
    b += "V8b4kg9vsiC36fyd7O2jxeNxVIh1cj7/6x9S3kFQHoyBp9dmKpPlqTo43sy3aiJSF4EdRFi/+C1";
    b += "dvzItqT/UgVzRYtzoTai3FuqPoDJIqyfLiFlw+AsMMYuKYF2DINJhvHbU4ejNOKVSTWLGSjvpsP";
    b += "EZ8x3nx99QTTqpXI9XL8iEACoVpIXtH6XDRnpk/8CaapIVFZOZDt8AwqRKy0zDsW11mkwt+IK/k";
    b += "zYC+qXQKHVIZZQm1yf1R4GboSUS0mEZJT0N6oQ77R0djnVrmYHXaR8vL6++yDKPjAygMEbUCD6B";
    b += "Be+ux8Z4AXrcB2adJypTVGpovgmHxg0+uEsH9Vfi6qEeBuRV6LGhoFaPjQyz9HjsmDJgnbAPcqj";
    b += "q0+J6wfw2lUIFjg40DF2SIHXDgePdUYuY9qwBv1BmO6vHRoq/gV8TVtlf4UqmWoXis6RrVWp4RI";
    b += "LvjaAEmTh+KroJiQXD+HRBiGDzhUITE76piUhkZmPuLHawsLWUWFlaCyT8atWqm9Wk7YT2PAe+o";
    b += "6kzrxZdp6aU35jvwfMUe9E+fF+eH72at5ZXKFgn+sT7LCwVlPHLzTYMzp44eZlPj54TJ01zrnXT";
    b += "yrpjp89fvLxbxvWN33E3d/KU6TPWbtmz9+ixk6f+KLlfTglsqrn7BgSHNm0e0aFv7hTwcfuevcd";
    b += "OnT1Xcp8SWFqhr6FNw9tGdOinUOZOX7Do5Nlzljbu4RE9FMrJ09eCxEdP3iq5/8LSJjxCoczJ3b";
    b += "rvwMHLv794OTpv4opVBw4ePX723LXr7fP3nzl29lxEZFSPXv3ix0+ZumXnroPFx47/blPTrk/cu";
    b += "/dl5TmWaRl/3LKyrqPWONeKHzZ846a9+z7VtKtdp227yKieveP6DR+x4+ilyzdevHyr1U3VZ87x";
    b += "jm/g5b16066Dx8/9fmt+q7n5PlPrFBWfLY+M6t3HVGQtaej97LlaE9y8ZVj4tOll5dEpmSdOnv/";
    b += "1ytW/ysopabzLqFuCUW1ETgITm5HrrXLWBbqJc27zHUS0wFsQIDDl06YmpjbmXayrmcaa8gXO5m";
    b += "Z8Ed+Uz+Pz+RYCIV9sQlvVEIbybUxNhBLTHqY80xqWXQSt+Z58WmBjYm0RKqhVP16aJhhQP+eEc";
    b += "NRmvqPJqFJ+L9MaYjszWwtbiwEm5iaOJr1MGwvbmnsILAQ031fsIXA0EfNz1oNPdVt2Enjy9aJm";
    b += "fGt+M9MQUWPhqHIbe5G3jSdfKqlrnTNJMGqug7jGuFlCb2FTU56VvVnONk+9Rc5vjhbCnHJhzi2";
    b += "LZ5b83Mn8YLORcbY5u0U5vzQK4ZubhIjaiixM9OLa/N6CXmY5o+2dzWuadRLkTDBZt8LCTuC7VD";
    b += "DyWgNTC6EwZ6XNyDTJYLdGJuDrZEHOAb4T39qSMqFp0D0eQFOeuVDMsxJIaBteNWF1G1u6Bs+O5";
    b += "2DpLKwlcqUH8Afy9vF+5V2yuGz2G+933jX6tvAO7wHvmfSF4APvIw8gKm3RsGmLyKipixcvMTE1";
    b += "C2reovvr878KbO2Dgrv3GFG4cdP+wNvVxo6fstiAfhD7IqMUyridu5ycTUXmYlu7oCaha9ZeuWo";
    b += "WPG36GlPzpi2SVVNnaOKfPe+dOH9BQ7fYRQVLl69YvWbDnn1HTMQWNWqFtgzvumr16TMFpg6OLv";
    b += "VbtDx6TCCtV7+Bm39IaPsOnbpEx3aHOJaQpEweqBs8bMSEFYWbNhed37gp+7RaM7OfyxAhH0xJM";
    b += "p/29soZVYvva+0scDWrLWwsbCOwapRTaOIqcBW4iQLEdM60kcFmNc1FOflN+EkiM5+awrp8JyHd";
    b += "KkTQUegtMDc1M20lbSiwMAvihwodTQUWpl0igv0t/U29ROYjG3SLdBM16u5sa2cWKaht3drKwdT";
    b += "cpL2ooVmmuKWskUlToblJVxNaKOELcyYm1m4vMs9Z1c8lXGxuYlm9ial5kIdAklPUTBFt0d7MvG";
    b += "24U3tRdK0mI03bmtfit4sI5luJzE1AqpFBDjm7aGs/y9ELkjPFOUcm7Mv1nvrrqHZLfx7VxLSRg";
    b += "JfQwLytuZuw+qjNfZQdBU1MbVrBqZ77QZT7WyOzZe9H1vHl2whEIyeNFwwUWvLNTCUzE3LemetE";
    b += "aru2OfNtLXqYOeSMHdmOnxdmXSOvS+Ocy558RwFvZHqokM6jcn537yQwF/BG27Tp1DznUDMTWhA";
    b += "rdArgjbTyECgsupvnbAypZekhMAMobZIzf/QVkSXfkq+36GUKlowgBLTfTeQSOTLGogafLzQ1cz";
    b += "A1NeNbmrrn/FLfPNfkm+SY/Maj8FOAIs/8SYIimEEZAv4yMBO/ioG7kTjnlcoViaoUzM1R1BOQH";
    b += "vISl2nMe1cSu1CDz8orkaJUKSo9FBEDKtHia+AZH1YCs/mqBVBHpUlTQhEAyQrovgn4gI75YKg3";
    b += "vQYdQcSDLdo4L9JZAEZ7tEBKTRcmUH2rF1DV7ApqW0hv137uIW3cyKegsWZVggdvzW2P2p9ve1J";
    b += "lBYGLy28HltLyINp8aZCrpTx4ndWdEG/7uk18nOVtX9de2uHFAHlklGZp5KJ9daOUv96Joq7V7U";
    b += "LdvtPV5448+sndpTHnH9yJkVJesS/og7FUOmVKedI0zQP/0e3FPjUktNKUZ8Lj0YJ6dG2n/6+pq";
    b += "+ltGgii+2Z37XWcNmkFgbYkMlUFKVVSO0njJEgUVCFVnGgluHBo8+EUqkArmraCE38AiQMIuHHh";
    b += "zl9AlfgTiAtXJNQLRyRmXQnwwd61Z9/MvF2PPdqV/cDveB4uKngcafSSPM4hiFlcGQ6Rboaffx3";
    b += "bWBkWyNAsiNockBRxWEaJJHxb1yyAc1TgcNWxmljalRkq4Tq3zXLLMoO3peZY5pKfYlpzWCHZ+i";
    b += "Vq0z8dRaxDgaFhsAFys6YH8nznDs3BbvEkWJ/2seBhqOCwSTRDSubVBBcd5MB8y6IsUoluElwD8";
    b += "j1U5DHN40gq8uDIr+w+W+paPDJOhhBOraqQ6xplL0sBOwjZQmqG7BiidxITcK06SV860AInl4V8";
    b += "ie1AOI9IKGQCukvChmvMkMZbmp2ewBUz41dlCEvYVawx60RZ9msZdcYl0uz3NTL4aUkDD+Z83qZ";
    b += "X+I43Wkj2UpWlwkfGF/Te/4RmriUjxrotFzTMDWSp4fHdjS1pCXTwAdKcT9kECph0pT4x1oULlk";
    b += "nHdo0l/gfb4/Bxju4Ze2YXaWMkkrtRCw/0i/uBxwBesS6FIFN20t5xSFaZZOEyDdgskGvRnjvSo";
    b += "jJ361YV2H5+RAqsqg1bZj+VNobcknotRaxqBpMoaOQYZSpF0DxClXAfu2L7xam4dfr7s/AZ5hu8";
    b += "/ad7g8M+J5RkRvzOftjdSUhtHh6MhVzj5CfL1+3UbjKo9J4pnc5OFqPqSr0aBuW/s5SBTeIqYbM";
    b += "SxYu6b3HuRyxhZR6Ox/sHneX/FgItj0ZHZ7sKg+8m/XHAyVojrjW7cSupx61avRdxQtaNu93WIG";
    b += "o1k3a0EofDYVJbdI67I7bBCatRuxpm7YxrxX5ffCd5Mm2XEMWNoFyL+3G3MQibi2I+N7Zfzx5vD";
    b += "ZP07xQHWMqdrfRJKjujvR4nUH8AZIqY7w==";
    var input = pako__default['default'].inflate(base64ToUint8Array(b));
    return init(input);
  } catch (e) {
    return Promise.reject(e);
  }
};

var init = function init(input) {
  try {
    var imports = {};
    imports.wbg = {};

    imports.wbg.__wbindgen_throw = function (arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return Promise.resolve(input).then(function (_input) {
      return Promise.resolve(load(_input, imports)).then(function (_ref) {
        var instance = _ref.instance,
            module = _ref.module;
        wasm = instance.exports;
        init.__wbindgen_wasm_module = module;
        return wasm;
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var load = function load(module, imports) {
  try {
    var _exit2;

    if (typeof Response === 'function' && module instanceof Response) {
      var _temp3 = function _temp3(_result2) {
        return _exit2 ? _result2 : Promise.resolve(module.arrayBuffer()).then(function (bytes) {
          return Promise.resolve(WebAssembly.instantiate(bytes, imports));
        });
      };

      var _temp4 = function () {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
          return _catch(function () {
            _exit2 = 1;
            return Promise.resolve(WebAssembly.instantiateStreaming(module, imports));
          }, function (e) {
            if (module.headers.get('Content-Type') != 'application/wasm') {
              console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
            } else {
              throw e;
            }
          });
        }
      }();

      return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
    } else {
      return Promise.resolve(WebAssembly.instantiate(module, imports)).then(function (instance) {
        if (instance instanceof WebAssembly.Instance) {
          return {
            instance: instance,
            module: module
          };
        } else {
          return instance;
        }
      });
    }
  } catch (e) {
    return Promise.reject(e);
  }
};

var skLen = 32; // bytes

var pkLen = 48; // bytes

var sigLen = 96; // bytes

var decryptionShareLen = 48; // bytes
// which varies depending on the threshold.

var commitment_sizes_by_threshold = [56, // threshold 0
104, // threshold 1
152, // threshold 2
200, // threshold 3
248, // threshold 4
296, // threshold 5
344, // threshold 6
392, // threshold 7
440, // threshold 8
488, // threshold 9
536 // threshold 10
]; // the number of bytes in the master secret key (Poly)
// which varies depending on the threshold.

var poly_sizes_by_threshold = [40, // threshold 0
72, // threshold 1
104, // threshold 2
136, // threshold 3
168, // threshold 4
200, // threshold 5
232, // threshold 6
264, // threshold 7
296, // threshold 8
328, // threshold 9
360 // threshold 10
]; // Encoding conversions


function hexToUint8Array(h) {
  if (h.length == 0) {
    return new Uint8Array();
  }

  return new Uint8Array(h.match(/.{1,2}/g).map(function (_byte) {
    return parseInt(_byte, 16);
  }));
}

function base64ToUint8Array(b) {
  return new Uint8Array(atob(b).split("").map(function (c) {
    return c.charCodeAt(0);
  }));
} // threshold_crypto wasm calls. Since they operate on single bytes at a time
var wasmBlsSdkHelpers = new function () {
  // s is secret key unit8array
  this.sk_bytes_to_pk_bytes = function (s) {
    var pkBytes = [];

    try {
      // set sk bytes
      for (var i = 0; i < s.length; i++) {
        wasmExports.set_sk_byte(i, s[i]);
      } // convert into pk bytes


      wasmExports.derive_pk_from_sk(); // read pk bytes

      for (var _i = 0; _i < pkLen; _i++) {
        var pkByte = wasmExports.get_pk_byte(_i);
        pkBytes.push(pkByte);
      }
    } catch (e) {
      throw 'Failed to generate';
    }
    return pkBytes;
  }; // s is secret key uint8array
  // m is message uint8array


  this.sign_msg = function (s, m) {
    var sigBytes = [];

    try {
      // set secret key bytes
      for (var i = 0; i < s.length; i++) {
        wasmExports.set_sk_byte(i, s[i]);
      } // set message bytes


      for (var _i2 = 0; _i2 < m.length; _i2++) {
        wasmExports.set_msg_byte(_i2, m[_i2]);
      } // sign message


      wasmExports.sign_msg(m.length); // get signature bytes

      for (var _i3 = 0; _i3 < sigLen; _i3++) {
        var sigByte = wasmExports.get_sig_byte(_i3);
        sigBytes.push(sigByte);
      }
    } catch (e) {
    }
    return sigBytes;
  }; // p is public key uint8array
  // s is signature uint8array
  // m is message uint8array


  this.verify = function (p, s, m) {
    var verified = false;

    try {
      // set public key bytes
      for (var i = 0; i < p.length; i++) {
        wasmExports.set_pk_byte(i, p[i]);
      } // set signature bytes


      for (var _i4 = 0; _i4 < s.length; _i4++) {
        wasmExports.set_sig_byte(_i4, s[_i4]);
      } // set message bytes


      for (var _i5 = 0; _i5 < m.length; _i5++) {
        wasmExports.set_msg_byte(_i5, m[_i5]);
      }

      verified = wasmExports.verify(m.length);
    } catch (e) {
      console.log('error verifying sig:');
      console.log(e);
    }
    return verified;
  };

  this.set_rng_values = function () {
    // Warning if no window.crypto available
    if (!window.crypto) {
      alert('Secure randomness not available in this browser, output is insecure.');
      return;
    }

    var RNG_VALUES_SIZE = wasmExports.get_rng_values_size();
    var rngValues = new Uint32Array(RNG_VALUES_SIZE);
    window.crypto.getRandomValues(rngValues);

    for (var i = 0; i < rngValues.length; i++) {
      wasmExports.set_rng_value(i, rngValues[i]);
    }
  }; // p is public key uint8array
  // m is message uint8array


  this.encrypt = function (p, m) {
    var ctBytes = [];

    try {
      wasmBlsSdkHelpers.set_rng_values(); // set public key bytes

      for (var i = 0; i < p.length; i++) {
        wasmExports.set_pk_byte(i, p[i]);
      } // set message bytes


      for (var _i6 = 0; _i6 < m.length; _i6++) {
        wasmExports.set_msg_byte(_i6, m[_i6]);
      } // generate strong random u64 used by encrypt
      // encrypt the message


      var ctSize = wasmExports.encrypt(m.length); // get ciphertext bytes

      for (var _i7 = 0; _i7 < ctSize; _i7++) {
        var ctByte = wasmExports.get_ct_byte(_i7);
        ctBytes.push(ctByte);
      }
    } catch (e) {
    }
    return Uint8Array.from(ctBytes);
  }; // s is secret key uint8array
  // c is message uint8array


  this.decrypt = function (s, c) {
    var msgBytes = [];

    try {
      // set secret key bytes
      for (var i = 0; i < s.length; i++) {
        wasmExports.set_sk_byte(i, s[i]);
      } // set ciphertext bytes


      for (var _i8 = 0; _i8 < c.length; _i8++) {
        wasmExports.set_ct_byte(_i8, c[_i8]);
      }

      var msgSize = wasmExports.decrypt(c.length); // get message bytes

      for (var _i9 = 0; _i9 < msgSize; _i9++) {
        var msgByte = wasmExports.get_msg_byte(_i9);
        msgBytes.push(msgByte);
      }
    } catch (e) {
    }
    return msgBytes;
  };

  this.generate_poly = function (threshold) {
    wasmBlsSdkHelpers.set_rng_values();
    var polySize = poly_sizes_by_threshold[threshold];
    wasmExports.generate_poly(threshold);
    var polyBytes = [];

    for (var i = 0; i < polySize; i++) {
      var polyByte = wasmExports.get_poly_byte(i);
      polyBytes.push(polyByte);
    }

    return polyBytes;
  };

  this.get_msk_bytes = function () {
    var mskBytes = [];

    for (var i = 0; i < skLen; i++) {
      var mskByte = wasmExports.get_msk_byte(i);
      mskBytes.push(mskByte);
    }

    return mskBytes;
  };

  this.get_mpk_bytes = function () {
    var mpkBytes = [];

    for (var i = 0; i < pkLen; i++) {
      var mpkByte = wasmExports.get_mpk_byte(i);
      mpkBytes.push(mpkByte);
    }

    return mpkBytes;
  };

  this.get_mc_bytes = function (threshold) {
    var mcBytes = [];
    var mcSize = commitment_sizes_by_threshold[threshold];

    for (var i = 0; i < mcSize; i++) {
      var mcByte = wasmExports.get_mc_byte(i);
      mcBytes.push(mcByte);
    }

    return mcBytes;
  };

  this.set_mc_bytes = function (mcBytes) {
    // set master commitment in wasm
    for (var i = 0; i < mcBytes.length; i++) {
      var v = mcBytes[i];
      wasmExports.set_mc_byte(i, v);
    }
  };

  this.get_skshare = function () {
    var skshareBytes = [];

    for (var i = 0; i < skLen; i++) {
      var skshareByte = wasmExports.get_skshare_byte(i);
      skshareBytes.push(skshareByte);
    }

    return skshareBytes;
  };

  this.get_pkshare = function () {
    var pkshareBytes = [];

    for (var i = 0; i < pkLen; i++) {
      var pkshareByte = wasmExports.get_pkshare_byte(i);
      pkshareBytes.push(pkshareByte);
    }

    return pkshareBytes;
  };

  this.combine_signatures = function (mcBytes, sigshares) {
    // set master commitment in wasm
    wasmBlsSdkHelpers.set_mc_bytes(mcBytes); // set the signature shares

    for (var shareIndex = 0; shareIndex < sigshares.length; shareIndex++) {
      var share = sigshares[shareIndex];
      var sigHex = share.shareHex;

      var _sigBytes = hexToUint8Array(sigHex);

      var sigIndex = share.shareIndex;

      for (var byteIndex = 0; byteIndex < _sigBytes.length; byteIndex++) {
        var sigByte = _sigBytes[byteIndex]; // NB shareIndex is used instead of sigIndex so we can interate
        // over both
        // SHARE_INDEXES[i]
        // and
        // SIGNATURE_SHARE_BYTES[i*96:(i+1)*96]

        wasmExports.set_signature_share_byte(byteIndex, shareIndex, sigByte);
        wasmExports.set_share_indexes(shareIndex, sigIndex);
      }
    } // combine the signatures


    wasmExports.combine_signature_shares(sigshares.length, mcBytes.length); // read the combined signature

    var sigBytes = [];

    for (var i = 0; i < sigLen; i++) {
      var _sigByte = wasmExports.get_sig_byte(i);

      sigBytes.push(_sigByte);
    }

    return sigBytes;
  }; // s is secret key share bytes
  // ct is ciphertext bytes
  // uiShareIndex is the index of the share as it appears in the UI
  // derivedShareIndex is the index of the share when derived from the poly


  this.create_decryption_share = function (s, uiShareIndex, derivedShareIndex, ct) {
    // set ct bytes
    for (var i = 0; i < ct.length; i++) {
      wasmExports.set_ct_byte(i, ct[i]);
    } // set secret key share


    for (var _i10 = 0; _i10 < s.length; _i10++) {
      wasmExports.set_sk_byte(_i10, s[_i10]);
    } // create decryption share


    wasmExports.create_decryption_share(uiShareIndex, ct.length); // set derivedShareIndex

    wasmExports.set_share_indexes(uiShareIndex, derivedShareIndex); // read decryption share

    var dshareBytes = [];

    for (var _i11 = 0; _i11 < decryptionShareLen; _i11++) {
      var dshareByte = wasmExports.get_decryption_shares_byte(_i11, uiShareIndex);
      dshareBytes.push(dshareByte);
    }

    return dshareBytes;
  }; // Assumes master commitment is already set.
  // Assumes create_decryption_share is already called for all shares,
  // Which means ciphertext is already set
  // and decryption shares are already set
  // and share_indexes is already set


  this.combine_decryption_shares = function (totalShares, mcSize, ctSize) {
    // combine decryption shares
    var msgSize = wasmExports.combine_decryption_shares(totalShares, mcSize, ctSize); // read msg

    var msgBytes = [];

    for (var i = 0; i < msgSize; i++) {
      var msgByte = wasmExports.get_msg_byte(i);
      msgBytes.push(msgByte);
    }

    return Uint8Array.from(msgBytes);
  };
}();
var wasm;
var cachedTextDecoder = new TextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true
});
cachedTextDecoder.decode();
var cachegetUint8Memory0 = null;

function getUint8Memory0() {
  if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
    cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }

  return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

/**
 * A LIT node client.  Connects directly to the LIT nodes to store and retrieve encryption keys.  Only holders of an NFT that corresponds with a LIT may store and retrieve the keys.
 * @param {Object} config
 * @param {boolean} [config.alertWhenUnauthorized=true] Whether or not to show a JS alert() when a user tries to unlock a LIT but is unauthorized.  If you turn this off, you should create an event listener for the "lit-authFailure" event on the document, and show your own error to the user.
 * @param {number} [config.minNodeCount=8] The minimum number of nodes that must be connected for the LitNodeClient to be ready to use.
 */

var LitNodeClient = /*#__PURE__*/function () {
  function LitNodeClient(config) {
    if (config === void 0) {
      config = {
        alertWhenUnauthorized: true,
        minNodeCount: 2,
        bootstrapUrls: ['http://127.0.0.1:7470', 'http://127.0.0.1:7471', 'http://127.0.0.1:7472']
      };
    }

    this.config = config;
    this.connectedNodes = new Set();
    this.serverKeys = {};
    this.ready = false;
    this.subnetPubKey = null;
    this.networkPubKey = null;
    this.networkPubKeySet = null;

    if (typeof window !== 'undefined' && window && window.localStorage) {
      var configOverride = window.localStorage.getItem('LitNodeClientConfig');

      if (configOverride) {
        configOverride = JSON.parse(configOverride);
      }

      this.config = _extends({}, config, configOverride);
    }
  }
  /**
  * Retrieve the symmetric encryption key from the LIT nodes.  Note that this will only work if the current user meets the access control conditions specified when the data was encrypted.  That access control condition is typically that the user is a holder of the NFT that corresponds to this encrypted data.  This NFT token address and ID was specified when this LIT was created.
  * @param {Object} params
  * @param {string} params.tokenAddress The token address of the NFT that corresponds to this LIT.  This should be an ERC721 or ERC1155 token.
  * @param {string} params.tokenId The token ID of the NFT that corresponds to this LIT
  * @param {string} params.chain The chain that the corresponding NFT lives on.  Currently "polygon" and "ethereum" are supported.
  * @param {AuthSig} params.authSig The authentication signature that proves that the user owns the crypto wallet address that should be an owner of the NFT that corresponds to this LIT.
  * @returns {Object} The symmetric encryption key that can be used to decrypt the locked content inside the LIT.  You should pass this key to the decryptZip function.
  */


  var _proto = LitNodeClient.prototype;

  _proto.verifyJwt = function verifyJwt(_ref) {
    var jwt = _ref.jwt;
    var pubKey = uint8arrayFromString__default['default'](this.networkPubKey, 'base16');
    console.log('pubkey is ', pubKey);
    var jwtParts = jwt.split('.');
    var sig = uint8arrayFromString__default['default'](jwtParts[2], 'base64url');
    console.log('sig is ', uint8arrayToString__default['default'](sig, 'base16'));
    var unsignedJwt = jwtParts[0] + "." + jwtParts[1];
    console.log('unsignedJwt is ', unsignedJwt);
    var message = uint8arrayFromString__default['default'](unsignedJwt);
    console.log('message is ', message); // p is public key uint8array
    // s is signature uint8array
    // m is message uint8array
    // function is: function (p, s, m)

    return wasmBlsSdkHelpers.verify(pubKey, sig, message);
  }
  /**
  * Retrieve the symmetric encryption key from the LIT nodes.  Note that this will only work if the current user meets the access control conditions specified when the data was encrypted.  That access control condition is typically that the user is a holder of the NFT that corresponds to this encrypted data.  This NFT token address and ID was specified when this LIT was created.
  * @param {Object} params
  * @param {string} params.tokenAddress The token address of the NFT that corresponds to this LIT.  This should be an ERC721 or ERC1155 token.
  * @param {string} params.tokenId The token ID of the NFT that corresponds to this LIT
  * @param {string} params.chain The chain that the corresponding NFT lives on.  Currently "polygon" and "ethereum" are supported.
  * @param {AuthSig} params.authSig The authentication signature that proves that the user owns the crypto wallet address that should be an owner of the NFT that corresponds to this LIT.
  * @returns {Object} The symmetric encryption key that can be used to decrypt the locked content inside the LIT.  You should pass this key to the decryptZip function.
  */
  ;

  _proto.getSignedToken = function getSignedToken(_ref2) {
    var accessControlConditions = _ref2.accessControlConditions,
        chain = _ref2.chain,
        authSig = _ref2.authSig,
        resourceId = _ref2.resourceId;

    try {
      var _this2 = this;

      // we need to send jwt params iat (issued at) and exp (expiration)
      // because the nodes may have different wall clock times
      // the nodes will verify that these params are withing a grace period
      var now = Date.now();
      var iat = Math.floor(now / 1000);
      var exp = iat + 12 * 60 * 60; // 12 hours in seconds
      // ask each node to sign the content

      var nodePromises = [];

      for (var _iterator = _createForOfIteratorHelperLoose(_this2.connectedNodes), _step; !(_step = _iterator()).done;) {
        var url = _step.value;
        nodePromises.push(_this2.getSigningShare({
          url: url,
          accessControlConditions: accessControlConditions,
          resourceId: resourceId,
          authSig: authSig,
          chain: chain,
          iat: iat,
          exp: exp
        }));
      }

      return Promise.resolve(Promise.all(nodePromises)).then(function (signatureShares) {
        console.log('signatureShares', signatureShares); // sanity check

        if (!signatureShares.every(function (val, i, arr) {
          return val.unsignedJwt === arr[0].unsignedJwt;
        })) {
          var msg = 'Unsigned JWT is not the same from all the nodes.  This means the combined signature will be bad because the nodes signed the wrong things';
          console.log(msg);
          alert(msg);
        } // sort the decryption shares by share index.  this is important when combining the shares.


        signatureShares.sort(function (a, b) {
          return a.shareIndex - b.shareIndex;
        }); // combine the signature shares

        var pkSetAsBytes = uint8arrayFromString__default['default'](_this2.networkPubKeySet, 'base16');
        var sigShares = signatureShares.map(function (s) {
          return {
            shareHex: s.signatureShare,
            shareIndex: s.shareIndex
          };
        });
        var signature = wasmBlsSdkHelpers.combine_signatures(pkSetAsBytes, sigShares);
        console.log('signature is ', uint8arrayToString__default['default'](signature, 'base16'));
        var unsignedJwt = mostCommonString(signatureShares.map(function (s) {
          return s.unsignedJwt;
        })); // convert the sig to base64 and append to the jwt

        var finalJwt = unsignedJwt + "." + uint8arrayToString__default['default'](signature, 'base64url');
        return finalJwt;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   *
   *
  * Securely save the symmetric encryption key to the LIT nodes.
  * @param {Object} params
  * @param {Array} params.accessControlConditions The access control conditions under which this key will be able to be decrypted
  * @param {string} params.chain The chain that the corresponding NFT lives on.  Currently "polygon" and "ethereum" are supported.
  * @param {AuthSig} params.authSig The authentication signature that proves that the user owns the crypto wallet address that should be an owner of the NFT that corresponds to this LIT.
  * @param {string} params.symmetricKey The symmetric encryption key that was used to encrypt the locked content inside the LIT.  You should use zipAndEncryptString or zipAndEncryptFiles to get this encryption key.  This key will be split up using threshold encryption so that the LIT nodes cannot decrypt a given LIT.
  * @returns {Object} An object that gives the status of the operation, denoted via a boolean with the key "success"
  */
  ;

  _proto.saveSigningCondition = function saveSigningCondition(_ref3) {
    var accessControlConditions = _ref3.accessControlConditions,
        chain = _ref3.chain,
        authSig = _ref3.authSig,
        resourceId = _ref3.resourceId;

    try {
      var _this4 = this;

      console.log('saveSigningCondition'); // hash the resource id

      return Promise.resolve(hashResourceId(resourceId)).then(function (hashOfResourceId) {
        var hashOfResourceIdStr = uint8arrayToString__default['default'](new Uint8Array(hashOfResourceId), 'base16'); // hash the access control conditions

        return Promise.resolve(hashAccessControlConditions(accessControlConditions)).then(function (hashOfConditions) {
          var hashOfConditionsStr = uint8arrayToString__default['default'](new Uint8Array(hashOfConditions), 'base16'); // create access control conditions on lit nodes

          var nodePromises = [];

          for (var _iterator2 = _createForOfIteratorHelperLoose(_this4.connectedNodes), _step2; !(_step2 = _iterator2()).done;) {
            var url = _step2.value;
            nodePromises.push(_this4.storeSigningConditionWithNode({
              url: url,
              key: hashOfResourceIdStr,
              val: hashOfConditionsStr,
              authSig: authSig,
              chain: chain
            }));
          }

          return Promise.resolve(Promise.all(nodePromises)).then(function () {});
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Retrieve the symmetric encryption key from the LIT nodes.  Note that this will only work if the current user meets the access control conditions specified when the data was encrypted.  That access control condition is typically that the user is a holder of the NFT that corresponds to this encrypted data.  This NFT token address and ID was specified when this LIT was created.
   * @param {Object} params
   * @param {string} params.tokenAddress The token address of the NFT that corresponds to this LIT.  This should be an ERC721 or ERC1155 token.
   * @param {string} params.tokenId The token ID of the NFT that corresponds to this LIT
  * @param {string} params.chain The chain that the corresponding NFT lives on.  Currently "polygon" and "ethereum" are supported.
   * @param {AuthSig} params.authSig The authentication signature that proves that the user owns the crypto wallet address that should be an owner of the NFT that corresponds to this LIT.
   * @returns {Object} The symmetric encryption key that can be used to decrypt the locked content inside the LIT.  You should pass this key to the decryptZip function.
  */
  ;

  _proto.getEncryptionKey = function getEncryptionKey(_ref4) {
    var accessControlConditions = _ref4.accessControlConditions,
        toDecrypt = _ref4.toDecrypt,
        chain = _ref4.chain,
        authSig = _ref4.authSig;

    try {
      var _this6 = this;

      // ask each node to decrypt the content
      var nodePromises = [];

      for (var _iterator3 = _createForOfIteratorHelperLoose(_this6.connectedNodes), _step3; !(_step3 = _iterator3()).done;) {
        var url = _step3.value;
        nodePromises.push(_this6.getDecryptionShare({
          url: url,
          accessControlConditions: accessControlConditions,
          toDecrypt: toDecrypt,
          authSig: authSig,
          chain: chain
        }));
      }

      return Promise.resolve(Promise.all(nodePromises)).then(function (decryptionShares) {
        console.log('decryptionShares', decryptionShares); // sort the decryption shares by share index.  this is important when combining the shares.

        decryptionShares.sort(function (a, b) {
          return a.shareIndex - b.shareIndex;
        }); // combine the decryption shares
        // set decryption shares bytes in wasm

        decryptionShares.forEach(function (s, idx) {
          wasmExports.set_share_indexes(idx, s.shareIndex);
          var shareAsBytes = uint8arrayFromString__default['default'](s.decryptionShare, 'base16');

          for (var i = 0; i < shareAsBytes.length; i++) {
            wasmExports.set_decryption_shares_byte(i, idx, shareAsBytes[i]);
          }
        }); // set the public key set bytes in wasm

        var pkSetAsBytes = uint8arrayFromString__default['default'](_this6.networkPubKeySet, 'base16');
        wasmBlsSdkHelpers.set_mc_bytes(pkSetAsBytes); // set the ciphertext bytes

        var ciphertextAsBytes = uint8arrayFromString__default['default'](toDecrypt, 'base16');

        for (var i = 0; i < ciphertextAsBytes.length; i++) {
          wasmExports.set_ct_byte(i, ciphertextAsBytes[i]);
        }

        var decrypted = wasmBlsSdkHelpers.combine_decryption_shares(decryptionShares.length, pkSetAsBytes.length, ciphertextAsBytes.length); // console.log('decrypted is ', uint8arrayToString(decrypted, 'base16'))

        return decrypted;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
  * Securely save the symmetric encryption key to the LIT nodes.
  * @param {Object} params
  * @param {Array} params.accessControlConditions The access control conditions under which this key will be able to be decrypted
  * @param {string} params.chain The chain that the corresponding NFT lives on.  Currently "polygon" and "ethereum" are supported.
  * @param {AuthSig} params.authSig The authentication signature that proves that the user owns the crypto wallet address that should be an owner of the NFT that corresponds to this LIT.
  * @param {string} params.symmetricKey The symmetric encryption key that was used to encrypt the locked content inside the LIT.  You should use zipAndEncryptString or zipAndEncryptFiles to get this encryption key.  This key will be split up using threshold encryption so that the LIT nodes cannot decrypt a given LIT.
  * @returns {Object} An object that gives the status of the operation, denoted via a boolean with the key "success"
  */
  ;

  _proto.saveEncryptionKey = function saveEncryptionKey(_ref5) {
    var accessControlConditions = _ref5.accessControlConditions,
        chain = _ref5.chain,
        authSig = _ref5.authSig,
        symmetricKey = _ref5.symmetricKey;

    try {
      var _this8 = this;

      console.log('saveEncryptionKey'); // encrypt with network pubkey

      var encryptedKey = wasmBlsSdkHelpers.encrypt(uint8arrayFromString__default['default'](_this8.subnetPubKey, 'base16'), symmetricKey);
      console.log('symmetric key encrypted with LIT network key: ', uint8arrayToString__default['default'](encryptedKey, 'base16')); // hash the encrypted pubkey

      return Promise.resolve(crypto.subtle.digest('SHA-256', encryptedKey)).then(function (hashOfKey) {
        var hashOfKeyStr = uint8arrayToString__default['default'](new Uint8Array(hashOfKey), 'base16'); // hash the access control conditions

        return Promise.resolve(hashAccessControlConditions(accessControlConditions)).then(function (hashOfConditions) {
          var hashOfConditionsStr = uint8arrayToString__default['default'](new Uint8Array(hashOfConditions), 'base16'); // create access control conditions on lit nodes

          var nodePromises = [];

          for (var _iterator4 = _createForOfIteratorHelperLoose(_this8.connectedNodes), _step4; !(_step4 = _iterator4()).done;) {
            var url = _step4.value;
            nodePromises.push(_this8.storeEncryptionConditionWithNode({
              url: url,
              key: hashOfKeyStr,
              val: hashOfConditionsStr,
              authSig: authSig,
              chain: chain
            }));
          }

          return Promise.resolve(Promise.all(nodePromises)).then(function () {
            return encryptedKey;
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.storeSigningConditionWithNode = function storeSigningConditionWithNode(_ref6) {
    var url = _ref6.url,
        key = _ref6.key,
        val = _ref6.val,
        authSig = _ref6.authSig,
        chain = _ref6.chain;

    try {
      var _this10 = this;

      console.log('storeSigningConditionWithNode');
      var urlWithPath = url + "/web/signing/store";
      var data = {
        key: key,
        val: val,
        authSig: authSig,
        chain: chain
      };
      return Promise.resolve(_this10.sendCommandToNode({
        url: urlWithPath,
        data: data
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.storeEncryptionConditionWithNode = function storeEncryptionConditionWithNode(_ref7) {
    var url = _ref7.url,
        key = _ref7.key,
        val = _ref7.val,
        authSig = _ref7.authSig,
        chain = _ref7.chain;

    try {
      var _this12 = this;

      console.log('storeEncryptionConditionWithNode');
      var urlWithPath = url + "/web/encryption/store";
      var data = {
        key: key,
        val: val,
        authSig: authSig,
        chain: chain
      };
      return Promise.resolve(_this12.sendCommandToNode({
        url: urlWithPath,
        data: data
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getSigningShare = function getSigningShare(_ref8) {
    var url = _ref8.url,
        accessControlConditions = _ref8.accessControlConditions,
        resourceId = _ref8.resourceId,
        authSig = _ref8.authSig,
        chain = _ref8.chain,
        iat = _ref8.iat,
        exp = _ref8.exp;

    try {
      var _this14 = this;

      console.log('getSigningShare');
      var urlWithPath = url + "/web/signing/retrieve";
      var data = {
        accessControlConditions: accessControlConditions,
        resourceId: resourceId,
        authSig: authSig,
        chain: chain,
        iat: iat,
        exp: exp
      };
      return Promise.resolve(_this14.sendCommandToNode({
        url: urlWithPath,
        data: data
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getDecryptionShare = function getDecryptionShare(_ref9) {
    var url = _ref9.url,
        accessControlConditions = _ref9.accessControlConditions,
        toDecrypt = _ref9.toDecrypt,
        authSig = _ref9.authSig,
        chain = _ref9.chain;

    try {
      var _this16 = this;

      console.log('getDecryptionShare');
      var urlWithPath = url + "/web/encryption/retrieve";
      var data = {
        accessControlConditions: accessControlConditions,
        toDecrypt: toDecrypt,
        authSig: authSig,
        chain: chain
      };
      return Promise.resolve(_this16.sendCommandToNode({
        url: urlWithPath,
        data: data
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.handshakeWithSgx = function handshakeWithSgx(_ref10) {
    var url = _ref10.url;

    try {
      var _this18 = this;

      var urlWithPath = url + "/web/handshake";
      console.debug("handshakeWithSgx " + urlWithPath);
      var data = {
        clientPublicKey: 'test'
      };
      return Promise.resolve(_this18.sendCommandToNode({
        url: urlWithPath,
        data: data
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.sendCommandToNode = function sendCommandToNode(_ref11) {
    var url = _ref11.url,
        data = _ref11.data;

    try {
      console.log("sendCommandToNode with url " + url + " and data", data);
      return Promise.resolve(fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        console.log('Success:', data);
        return data;
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.connect = function connect() {
    var _this20 = this;

    try {
      var _ret = function () {
        var _this19 = _this20;

        var _loop = function _loop() {
          var url = _step5.value;

          _this19.handshakeWithSgx({
            url: url
          }).then(function (resp) {
            _this19.connectedNodes.add(url);

            _this19.serverKeys[url] = {
              serverPubKey: resp.serverPublicKey,
              subnetPubKey: resp.subnetPublicKey,
              networkPubKey: resp.networkPublicKey,
              networkPubKeySet: resp.networkPublicKeySet
            };
          });
        };

        // handshake with each node
        for (var _iterator5 = _createForOfIteratorHelperLoose(_this19.config.bootstrapUrls), _step5; !(_step5 = _iterator5()).done;) {
          _loop();
        }

        var interval = window.setInterval(function () {
          if (Object.keys(_this19.serverKeys).length >= _this19.config.minNodeCount) {
            clearInterval(interval); // pick the most common public keys for the subnet and network from the bunch, in case some evil node returned a bad key

            _this19.subnetPubKey = mostCommonString(Object.values(_this19.serverKeys).map(function (keysFromSingleNode) {
              return keysFromSingleNode.subnetPubKey;
            }));
            _this19.networkPubKey = mostCommonString(Object.values(_this19.serverKeys).map(function (keysFromSingleNode) {
              return keysFromSingleNode.networkPubKey;
            }));
            _this19.networkPubKeySet = mostCommonString(Object.values(_this19.serverKeys).map(function (keysFromSingleNode) {
              return keysFromSingleNode.networkPubKeySet;
            }));
            _this19.ready = true;
            console.debug('lit is ready');
            document.dispatchEvent(new Event('lit-ready'));
          }
        }, 500);
        window.wasmBlsSdkHelpers = wasmBlsSdkHelpers; // for debug

        return {
          v: Promise.resolve()
        };
      }();

      if (typeof _ret === "object") return _ret.v;
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return LitNodeClient;
}();

var litJsSdkLoadedInALIT = function litJsSdkLoadedInALIT() {
  sendMessageToFrameParent({
    command: 'LIT_SYN'
  });
  setTimeout(function () {
    if (!window.useLitPostMessageProxy) {
      console.log('inside lit - no parent frame lit node connection.  connecting ourselves.'); // we're on our own with no parent frame.  initiate our own connection to lit nodes

      var litNodeClient = new LitNodeClient();
      litNodeClient.connect();
      window.litNodeClient = litNodeClient;
    } else {
      console.log('inside lit - parent frame is connected to lit nodes.  using that.');
    }
  }, 1000);
};

if (typeof window !== 'undefined') {
  // only run this in browser
  if (inIframe()) {
    listenForFrameParentMessages();
  } else {
    listenForChildFrameMessages();
  }
}

initWasmBlsSdk().then(function (exports) {
  window.wasmExports = exports;
});
var functions = {
  zipAndEncryptString: zipAndEncryptString,
  zipAndEncryptFiles: zipAndEncryptFiles,
  encryptZip: encryptZip,
  decryptZip: decryptZip,
  connectWeb3: connectWeb3,
  checkAndSignAuthMessage: checkAndSignAuthMessage,
  createHtmlLIT: createHtmlLIT,
  mintLIT: mintLIT,
  toggleLock: toggleLock,
  LIT_CHAINS: LIT_CHAINS,
  LitNodeClient: LitNodeClient,
  encryptWithPubKey: encryptWithPubKey,
  decryptWithPrivKey: decryptWithPrivKey,
  fileToDataUrl: fileToDataUrl,
  findLITs: findLITs,
  sendLIT: sendLIT,
  litJsSdkLoadedInALIT: litJsSdkLoadedInALIT,
  unlockLitWithKey: unlockLitWithKey,
  injectViewerIFrame: injectViewerIFrame,
  printError: printError,
  canonicalAccessControlConditionFormatter: canonicalAccessControlConditionFormatter
};

module.exports = functions;
//# sourceMappingURL=index.js.map

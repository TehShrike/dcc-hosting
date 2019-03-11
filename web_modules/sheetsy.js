var basicXhr = function makeXhrFunction(inputOptions) {
	var options = Object.assign({
		method: 'GET',
		success: defaultSuccess,
		parse: defaultParse,
		serialize: defaultSerialize,
		headers: {},
	}, inputOptions);

	return function xhr(url, body) {
		return new Promise(function promise(resolve, reject) {
			var request = new XMLHttpRequest();
			request.addEventListener('load', handleResult);
			request.addEventListener('error', reject);
			request.addEventListener('abort', reject);
			request.open(options.method, url);

			Object.keys(options.headers).forEach(function(key) {
				request.setRequestHeader(key, options.headers[key]);
			});

			if (typeof body === 'undefined') {
				request.send();
			} else {
				request.send(options.serialize(body));
			}

			function handleResult() {
				try {
					var response = options.parse(request);

					options.success(request) ? resolve(response) : reject(response);
				} catch (e) {
					reject(e);
				}
			}
		})
	}
};

function defaultSuccess(request) {
	return request.status >= 200 && request.status < 400
}

function defaultSerialize(body) {
	return JSON.stringify(body)
}

function defaultParse(request) {
	return JSON.parse(request.responseText)
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var urlBuilder = {
	buildIndexUrl: function buildIndexUrl(key) {
		return "https://spreadsheets.google.com/feeds/worksheets/" + key + "/public/basic?alt=json";
	},
	buildSheetUrl: function buildSheetUrl(key, sheetId) {
		return "https://spreadsheets.google.com/feeds/list/" + key + "/" + sheetId + "/public/values?alt=json";
	}
};

var orderedEntries = function orderedEntries(o) {
	return Object.getOwnPropertyNames(o).map(function(key) {
		return [ key, o[key] ]
	})
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var sheetsy = createCommonjsModule(function (module) {
	var buildIndexUrl = urlBuilder.buildIndexUrl,
	    buildSheetUrl = urlBuilder.buildSheetUrl;


	module.exports = function (defaultGet) {
		return {
			getWorkbook: function getWorkbook(key) {
				var get$$1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultGet;

				return get$$1(buildIndexUrl(key)).then(function (workbookData) {
					var feed = workbookData.feed;
					var sheets = feed.entry.map(function (sheetData) {
						var selfSheetUrl = sheetData.link.find(function (link) {
							return link.rel === 'self';
						}).href;
						return {
							name: textOf(sheetData.title),
							id: afterLastSlash(selfSheetUrl),
							updated: textOf(sheetData.updated)
						};
					});

					return {
						name: textOf(feed.title),
						updated: textOf(feed.updated),
						authors: getAuthors(feed),
						sheets: sheets
					};
				});
			},
			getSheet: function getSheet(key, id) {
				var get$$1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultGet;

				return get$$1(buildSheetUrl(key, id)).then(function (sheetData) {
					var feed = sheetData.feed;
					var rows = (feed.entry || []).map(function (entry) {
						var originalCellKeysAndValues = orderedEntries(entry).filter(function (_ref) {
							var _ref2 = slicedToArray(_ref, 1),
							    key = _ref2[0];

							return (/^gsx\$/.test(key)
							);
						}).map(function (_ref3) {
							var _ref4 = slicedToArray(_ref3, 2),
							    key = _ref4[0],
							    value = _ref4[1];

							return {
								key: key.replace('gsx$', ''),
								value: textOf(value)
							};
						});

						var array = originalCellKeysAndValues.map(function (_ref5) {
							var value = _ref5.value;
							return value;
						});

						originalCellKeysAndValues.filter(function (_ref6) {
							var key = _ref6.key;
							return (/^[^_]/.test(key)
							);
						}).forEach(function (_ref7) {
							var key = _ref7.key,
							    value = _ref7.value;

							array[key] = value;
						});

						return array;
					});

					return {
						name: textOf(feed.title),
						updated: textOf(feed.updated),
						authors: getAuthors(feed),
						rows: rows
					};
				});
			},
			urlToKey: function urlToKey(url) {
				return firstCapture(/key=(.*?)(&|#|$)/, url) || firstCapture(/d\/(.*?)\/pubhtml/, url) || firstCapture(/spreadsheets\/d\/(.*?)\//, url) || toss('No key found in ' + url);
			}
		};
	};

	var textOf = function textOf(field) {
		return field.$t;
	};

	var getAuthors = function getAuthors(data) {
		return data.author.map(function (_ref8) {
			var name = _ref8.name,
			    email = _ref8.email;
			return {
				name: textOf(name),
				email: textOf(email)
			};
		});
	};

	var afterLastSlash = function afterLastSlash(str) {
		return str.split('/').pop();
	};

	var firstCapture = function firstCapture(regex, str) {
		var match = regex.exec(str);
		return match && match[1];
	};

	var toss = function toss(message) {
		throw new Error(message);
	};
});

var _createApi = sheetsy(basicXhr());
var urlToKey = _createApi.urlToKey;
var getWorkbook = _createApi.getWorkbook;
var getSheet = _createApi.getSheet;

var urlToKey_1 = urlToKey;
var getWorkbook_1 = getWorkbook;
var getSheet_1 = getSheet;

var indexBrowser = {
	urlToKey: urlToKey_1,
	getWorkbook: getWorkbook_1,
	getSheet: getSheet_1
};

export default indexBrowser;
export { urlToKey_1 as urlToKey, getWorkbook_1 as getWorkbook, getSheet_1 as getSheet };
//# sourceMappingURL=sheetsy.js.map

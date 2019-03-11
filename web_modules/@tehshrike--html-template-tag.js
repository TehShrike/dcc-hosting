function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var dist = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports,"__esModule",{value:true});var chars={"&":"&amp;",">":"&gt;","<":"&lt;",'"':"&quot;","'":"&#39;","`":"&#96;"};var re=new RegExp(Object.keys(chars).join("|"),"g");exports["default"]=function(){var str=arguments.length<=0||arguments[0]===undefined?"":arguments[0];return String(str).replace(re,function(match){return chars[match]})};module.exports=exports["default"];
});

var htmlEscape = unwrapExports(dist);

// Inspired on http://www.2ality.com/2015/01/template-strings-html.html#comment-2078932192

var index = (literals, ...substs) => {
	return literals.raw.reduce((acc, lit, i) => {
		let subst = substs[i - 1];
		if (Array.isArray(subst)) {
			subst = subst.join("");
		} else if (literals.raw[i - 1] && literals.raw[i - 1].endsWith("$")) {
			// If the interpolation is preceded by a dollar sign,
			// substitution is considered safe and will not be escaped
			acc = acc.slice(0, -1);
		} else {
			subst = htmlEscape(subst);
		}

		return acc + subst + lit;
	});
};

export default index;
//# sourceMappingURL=@tehshrike--html-template-tag.js.map

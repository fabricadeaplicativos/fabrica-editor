define("main",["require","exports","module"],function(){function n(n,t,e,i,a){this.fullPath=n,this.line=t,this.chFrom=e,this.chTo=i,this.functionName=a}function t(){var t=l.getCurrentDocument();if(t){var e=[],i=t.getText(),a=i.split("\n"),c=u.findAllMatchingFunctionsInText(i,"*");return c.forEach(function(t){var i=a[t.lineStart].indexOf(t.name),c=i+t.name.length;e.push(new n(null,t.lineStart,i,c,t.name))}),e}}function e(n,e){var i=e.functionList;i||(i=t(),e.functionList=i),n=n.slice(n.indexOf("@")+1,n.length);var a=$.map(i,function(t){var i=e.match(t.functionName,n);return i&&(i.fileLocation=t),i});return o.basicMatchSort(a),a}function i(n){return 0===n.indexOf("@")?!0:void 0}function a(n){if(n){var t=n.fileLocation,e={line:t.line,ch:t.chFrom},i={line:t.line,ch:t.chTo};r.getCurrentFullEditor().setSelection(e,i,!0)}}function c(n){a(n)}var r=brackets.getModule("editor/EditorManager"),o=brackets.getModule("search/QuickOpen"),u=brackets.getModule("language/JSUtils"),l=brackets.getModule("document/DocumentManager");o.addQuickOpenPlugin({name:"JavaScript functions",languageIds:["javascript"],search:e,match:i,itemFocus:a,itemSelect:c})});
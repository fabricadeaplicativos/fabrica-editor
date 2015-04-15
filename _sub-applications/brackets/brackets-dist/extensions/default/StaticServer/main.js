define("StaticServer",["require","exports","module"],function(e,t,o){function r(e){this._nodeDomain=e.nodeDomain,this._onRequestFilter=this._onRequestFilter.bind(this),n.call(this,e)}var n=brackets.getModule("LiveDevelopment/Servers/BaseServer").BaseServer,i=brackets.getModule("file/FileUtils"),s=brackets.getModule("preferences/PreferencesManager"),a=s.getExtensionPrefs("staticserver");r.prototype=Object.create(n.prototype),r.prototype.constructor=r,r.prototype.canServe=function(e){return this._nodeDomain.ready()?e===this._pathResolver(e)?!1:e.match(/\/$/)?!0:i.isStaticHtmlFileExt(e):!1},r.prototype._updateRequestFilterPaths=function(){var e=Object.keys(this._liveDocuments);return this._nodeDomain.exec("setRequestFilterPaths",this._root,e)},r.prototype.readyToServe=function(){function e(e){return e=parseInt(e,10),e=e&&!isNaN(e)&&e>0&&65536>e?e:0}function t(e){r._baseUrl="http://"+e.address+":"+e.port+"/",n.resolve()}function o(){r._baseUrl="",n.resolve()}var r=this,n=new $.Deferred,i=e(a.get("port"));return this._nodeDomain.exec("getServer",r._root,i).done(function(e){return e.port!==i&&i>0?r._nodeDomain.exec("closeServer",r._root).done(function(){return r._nodeDomain.exec("getServer",r._root,i).done(t).fail(o)}).fail(o):void t(e)}).fail(o),n.promise()},r.prototype.add=function(e){e.setInstrumentationEnabled&&e.setInstrumentationEnabled(!0),n.prototype.add.call(this,e),this._updateRequestFilterPaths()},r.prototype.remove=function(e){n.prototype.remove.call(this,e),this._updateRequestFilterPaths()},r.prototype.clear=function(){n.prototype.clear.call(this),this._updateRequestFilterPaths()},r.prototype._send=function(e,t){this._nodeDomain.exec("writeFilteredResponse",e.root,e.pathname,t)},r.prototype._onRequestFilter=function(e,t){var o,r=t.location.pathname,n=this._liveDocuments[r];o=n&&n.getResponseData?n.getResponseData():{},o.id=t.id,this._send(t.location,o)},r.prototype.start=function(){$(this._nodeDomain).on("requestFilter",this._onRequestFilter)},r.prototype.stop=function(){$(this._nodeDomain).off("requestFilter",this._onRequestFilter)},o.exports=r}),define("main",["require","exports","module","StaticServer"],function(e,t,o){function r(){var e={nodeDomain:p,pathResolver:c.makeProjectRelativeIfPossible,root:c.getProjectRoot().fullPath};return new l(e)}var n=brackets.getModule("utils/AppInit"),i=brackets.getModule("utils/ExtensionUtils"),s=brackets.getModule("LiveDevelopment/LiveDevServerManager"),a=brackets.getModule("utils/NodeDomain"),c=brackets.getModule("project/ProjectManager"),l=e("StaticServer"),u=i.getModulePath(o,"node/StaticServerDomain"),p=new a("staticServer",u);n.appReady(function(){s.registerServer({create:r},5)}),t._getStaticServerProvider=r,t._nodeDomain=p});
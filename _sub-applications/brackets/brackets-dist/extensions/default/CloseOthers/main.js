define("main",["require","exports","module"],function(){function e(e){var o,n=c.findInWorkingSet(c.ACTIVE_PANE,c.getCurrentlyViewedPath(c.ACTIVE_PANE)),t=c.getWorkingSet(c.ACTIVE_PANE),r=e===_?n+1:0,E=e===C?n:t.length,a=[];for(o=r;E>o;o++)(e===u&&o!==n||e!==u)&&a.push(t[o]);s.execute(l.FILE_CLOSE_LIST,{fileList:a})}function o(){var e=c.getCurrentlyViewedFile(c.ACTIVE_PANE);if(e){var o=c.findInWorkingSet(c.ACTIVE_PANE,e.fullPath),n=c.getWorkingSetSize(c.ACTIVE_PANE);s.get(_).setEnabled(o===n-1?!1:!0),s.get(u).setEnabled(1===n?!1:!0),s.get(C).setEnabled(0===o?!1:!0)}}function n(){return{closeBelow:g.get("below",i.CURRENT_PROJECT),closeOthers:g.get("others",i.CURRENT_PROJECT),closeAbove:g.get("above",i.CURRENT_PROJECT)}}function t(){var e=n();e.closeBelow!==I.closeBelow&&(e.closeBelow?d.addMenuItem(_,"",E.AFTER,l.FILE_CLOSE):d.removeMenuItem(_)),e.closeOthers!==I.closeOthers&&(e.closeOthers?d.addMenuItem(u,"",E.AFTER,l.FILE_CLOSE):d.removeMenuItem(u)),e.closeAbove!==I.closeAbove&&(e.closeAbove?d.addMenuItem(C,"",E.AFTER,l.FILE_CLOSE):d.removeMenuItem(C)),I=e}function r(){var o=n();s.register(a.CMD_FILE_CLOSE_BELOW,_,function(){e(_)}),s.register(a.CMD_FILE_CLOSE_OTHERS,u,function(){e(u)}),s.register(a.CMD_FILE_CLOSE_ABOVE,C,function(){e(C)}),o.closeBelow&&d.addMenuItem(_,"",E.AFTER,l.FILE_CLOSE),o.closeOthers&&d.addMenuItem(u,"",E.AFTER,l.FILE_CLOSE),o.closeAbove&&d.addMenuItem(C,"",E.AFTER,l.FILE_CLOSE),I=o}var E=brackets.getModule("command/Menus"),s=brackets.getModule("command/CommandManager"),l=brackets.getModule("command/Commands"),c=brackets.getModule("view/MainViewManager"),a=brackets.getModule("strings"),i=brackets.getModule("preferences/PreferencesManager"),d=E.getContextMenu(E.ContextMenuIds.WORKING_SET_CONTEXT_MENU),u="file.close_others",C="file.close_above",_="file.close_below",g=i.getExtensionPrefs("closeOthers"),I={};g.definePreference("below","boolean",!0),g.definePreference("others","boolean",!0),g.definePreference("above","boolean",!0),r(),$(d).on("beforeContextMenuOpen",o),g.on("change",t)});
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
_export_star(require("./edict"), exports);
_export_star(require("./etching"), exports);
_export_star(require("./pile"), exports);
_export_star(require("./rune"), exports);
_export_star(require("./rune_stone/rune_stone"), exports);
_export_star(require("./rune_id"), exports);
_export_star(require("./varint"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}

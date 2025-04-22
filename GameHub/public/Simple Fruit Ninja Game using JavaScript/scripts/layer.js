/**
 * layer manager
 */

var Raphael = require( "lib/raphael" );
var Ucren = require( "lib/ucren" );

var layers = {};
var zindexs = {
	"default": zi(),
	"light": zi(),
	"knife": zi(),
	"fruit": zi(),
	"juice": zi(),
	"flash": zi(),
	"mask": zi()
};

exports.getLayer = function(name) {
    var p, layer;
    name = name || "default";
    
    if (p = layers[name]) {
        return p;
    } else {
        var canvas = document.getElementById("game-canvas");
        var width = canvas.offsetWidth;
        var height = canvas.offsetHeight;
        
        layer = Ucren.makeElement("div", { "class": "layer", "style": "z-index: " + (zindexs[name] || 0) + ";" });
        Ucren.Element("extra").add(layer);
        p = layers[name] = Raphael(layer, width, height);
        return p;
    }
};

exports.createImage = function(layer, src, x, y, w, h) {
    layer = this.getLayer(layer);
    // Scale coordinates and dimensions
    var scale = window.gameScale || { width: 1, height: 1 };
    return layer.image(src, x * scale.width, y * scale.height, w * scale.width, h * scale.height);
};

exports.createText = function(layer, text, x, y, fill, size) {
    layer = this.getLayer(layer);
    var scale = window.gameScale || { width: 1, height: 1 };
    if (Ucren.isIe) y += 2 / scale.height; // Adjust for IE quirk
    return layer.text(x * scale.width, y * scale.height, text).attr({
        fill: fill || "#fff",
        "font-size": (parseFloat(size) * scale.height) + "px",
        "font-family": "黑体",
        "text-anchor": "start"
    });
};


function zi(){
    return zi.num = ++ zi.num || 2;
}
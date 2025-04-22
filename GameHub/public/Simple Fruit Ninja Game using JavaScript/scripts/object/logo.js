var displacement = require("scripts/factory/displacement");
var tween = require("scripts/lib/tween");

exports = displacement.create("images/logo.png", 
    288, 135, 
    17, -182, 
    17, 1, 
    tween.exponential.co, 1e3);

// Update displacement.js to scale coordinates
define("scripts/factory/displacement.js", function(exports) {
    exports.create = function(imageSrc, width, height, origX, origY, targetX, targetY, animMap, animDur) {
        var module = {};
        var image;
        var anim = typeof animMap === "function" ? { show: animMap, hide: animMap } : animMap;
        var scale = window.gameScale || { width: 1, height: 1 };
        
        module.set = function() {
            image = layer.createImage("default", imageSrc, 
                origX * scale.width, origY * scale.height, 
                width * scale.width, height * scale.height);
        };
        
        module.show = function(start) {
            createTask(start, animDur, 
                origX * scale.width, origY * scale.height, 
                targetX * scale.width, targetY * scale.height, 
                anim.show, "show");
        };
        
        module.hide = function() {
            this.anims.clear();
            createTask(0, animDur, 
                targetX * scale.width, targetY * scale.height, 
                origX * scale.width, origY * scale.height, 
                anim.hide, "hide");
        };
        
        // ... rest of the module
        return module;
    };
});
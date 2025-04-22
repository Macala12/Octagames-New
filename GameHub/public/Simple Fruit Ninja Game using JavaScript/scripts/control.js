var Ucren = require( "lib/ucren" );
var knife = require( "object/knife" );
var message = require( "message" );
var state = require( "state" );

var canvasLeft, canvasTop;

canvasLeft = canvasTop = 0;

exports.fixCanvasPos = function() {
    var de = document.documentElement;
    var container = document.getElementById("game-container");
    var canvas = document.getElementById("game-canvas");

    if (!canvas) {
        console.error("game-canvas not found, creating new one");
        canvas = document.createElement("div");
        canvas.id = "game-canvas";
        container.appendChild(canvas);
    }

    var fix = function() {
        console.log("Resizing canvas: container size =", container.clientWidth, container.clientHeight);
        var containerWidth = container.clientWidth;
        var containerHeight = container.clientHeight;
        var width = containerWidth;
        var height = width * (3 / 4); // 4:3 aspect ratio

        if (height > containerHeight) {
            height = containerHeight;
            width = height * (4 / 3);
        }

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.margin = "auto";

        // Store scaling factors
        window.gameScale = {
            width: width / 640,
            height: height / 480
        };
        console.log("gameScale:", window.gameScale);

        // Center the canvas
        canvasLeft = (de.clientWidth - width) / 2;
        canvasTop = (de.clientHeight - height) / 2;
        console.log("canvasLeft:", canvasLeft, "canvasTop:", canvasTop);
    };

    fix();
    Ucren.addEvent(window, "resize", fix.bind(this));
};

exports.init = function(){
	this.fixCanvasPos();
	this.installDragger();
	this.installClicker();
};

exports.installDragger = function() {
    var dragger = new Ucren.BasicDrag({ type: "calc" });
    
    dragger.on("returnValue", function(dx, dy, x, y, kf) {
        var scale = window.gameScale || { width: 1, height: 1 };
        if (kf = knife.through((x - canvasLeft) / scale.width, (y - canvasTop) / scale.height)) {
            message.postMessage(kf, "slice");
        }
    });
    
    dragger.on("startDrag", function() {
        knife.newKnife();
    });
    
    dragger.bind(document.documentElement);
};

exports.installClicker = function(){
    Ucren.addEvent( document, "click", function(){
        if( state( "click-enable" ).ison() )
        	message.postMessage( "click" );
    });
};

exports.fixCanvasPos = function(){
	var de = document.documentElement;

	var fix = function( e ){
	    canvasLeft = ( de.clientWidth - 640 ) / 2;
	    canvasTop = ( de.clientHeight - 480 ) / 2 - 40;
	};

	fix();

	Ucren.addEvent( window, "resize", fix );
};
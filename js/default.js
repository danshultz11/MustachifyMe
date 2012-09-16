
var cordovaReady = false;
var message;

//Wire up phonegap
function init() {
    document.body.addEventListener('touchmove', function(event) {
      event.preventDefault();
    }, false); 
    document.addEventListener("deviceready", onDeviceReady, false);
    message = document.getElementById("statusMessage");
    message.innerHTML = "Listening for deviceready";
}


    // Cordova is ready to be used!
    //
    function onDeviceReady() {
        cordovaReady = true;
        message = document.getElementById("statusMessage");
        message.innerHTML = "Phonegap ready=" + cordovaReady;
        //pictureSource = navigator.camera.PictureSourceType;
        //destinationType = navigator.camera.DestinationType;

    }

(function () {
    "use strict";
    var photo = new Image();
    var border = new Image();
    var mustacheImage = new Image();
    var sombreroImage = new Image();
    var drawInterval = "";
    var saveStream;
    var savedFile;
    var writeStreamURL;
    var filePath;

    //////////////////////////////////
    //Begin Mustache and Sombrero init
    var canvas;
    var context;
    var isDragging = false;
    var radius = 5;
    var startX, startY;
    var mustache;
    var sombrero;
    photo.src = "images/DanPic.png";

    function Mustache(x, y, value, display) {
        this.X = x;
        this.Y = y;
        this.Height = 72;
        this.Width = 270;
        this.Value = value;
        this.Display = display;
        this.Draw = function (context) {
            context.beginPath();
            context.drawImage(photo, 0, 0);
            context.globalAlpha = 0.95;
            context.drawImage(mustacheImage, this.X, this.Y);
            context.globalAlpha = 0.9;
            //if (!!sombrero)
            //    context.drawImage(sombreroImage, sombrero.X, sombrero.Y);
            //context.globalAlpha = 1.0;
            //context.drawImage(border, 0, 0);
        };
        this.IsInbounds = function (clickX, clickY) {
            clickX -= 270;
            clickY -= 72;
            if ((clickX >= this.X && clickX <= (this.X + this.Width)) && clickY >= this.Y && clickY <= (this.Y + this.Height))
                return true;
            else
                return false;
        };
    }

    function Sombrero(x, y, value, display) {
        this.X = x;
        this.Y = y;
        this.Height = 211;
        this.Width = 200;
        this.Value = value;
        this.Display = display;
        this.Draw = function (context) {
            context.beginPath();
            context.drawImage(photo, 0, 0);
            context.globalAlpha = 0.9;
            context.drawImage(sombreroImage, this.X, this.Y);
            context.globalAlpha = 0.95;
            if (!!mustache)
                context.drawImage(mustacheImage, mustache.X, mustache.Y);
            context.globalAlpha = 1.0;
            context.drawImage(border, 0, 0);
        };
        this.IsInbounds = function (clickX, clickY) {
            clickX -= 220;
            clickY -= 111;
            if ((clickX >= this.X && clickX <= (this.X + this.Width)) && clickY >= this.Y && clickY <= (this.Y + this.Height))
                return true;
            else
                return false;
        };
    }

    function drawBackgroundWithPhoto(x, y, w, h) {
        context.beginPath();
        context.fillStyle = "#ffffff";
        context.rect(x, y, w, h);
        context.closePath();
        context.fill();
        context.beginPath();
        context.drawImage(photo, 0, 0);
        context.globalAlpha = 0.9;
    }

    function draw() {
        if (!!mustache)
            mustache.Draw(context);

        if (!!sombrero)
            sombrero.Draw(context);

        killIntervalIfSombreroAndMustacheOff();
    }
    //End Mustache and Sombrero init
    ////////////////////////////////


    //Canvas stuff
    window.addEventListener('load', function () {
        // Get the canvas element.
        canvas = document.getElementById('postcardCanvas');
        if (!canvas || !canvas.getContext) {
            return;
        }

        // Get the canvas 2d context.
        context = canvas.getContext('2d');
        if (!context || !context.drawImage) {
            return;
        }


        drawBackgroundWithPhoto(0, 0, 480, 320);

        //
        //canvas.onmousedown = mouseDown;
        //canvas.onmouseup = mouseUp;
        canvas.touchstart = touchStart;
        canvas.touchend = touchEnd;


        // Once it's loaded draw the image on the canvas.
        photo.addEventListener('load', function () {
            // Original resolution: x, y.
            context.drawImage(this, 0, 0); 
            context.drawImage(photo, 0, 0);

        }, false);

        // Once it's loaded draw the image on the canvas.
        border.addEventListener('load', function () {
            context.drawImage(this, 0, 0);
            //savePhoto();
        }, false);

        mustacheImage.addEventListener('load', function () {
            mustache = new Mustache(0, 0, 1, "");
            if (!drawInterval || drawInterval == "")
                drawInterval = setInterval(draw, 10);
        }, false);


        /*********** Mustache Touchevent ********************/
          
        document.getElementById("postcardCanvas").addEventListener('touchmove', function(event) {
          // If there's exactly one finger inside this element
          if (event.targetTouches.length == 1) {
            var touch = event.targetTouches[0];
            // Place element where the finger is
            mustache.X = touch.pageX;
            mustache.Y = touch.pageY;
            mustache.Draw();
          }
        }, false);

        /***********************************************/

        sombreroImage.addEventListener('load', function () {
            sombrero = new Sombrero(200, 40, 2, "");
            if (!drawInterval || drawInterval == "")
                drawInterval = setInterval(draw, 10);
        }, false);
        var mustacheLink = document.getElementById("addMustache");
        mustacheLink.onclick =
        function (eventArgs) {
            mustacheImage.src = (mustacheOn()) ? "" : "images/Mustache270.png";
            draw();
        }

        var sombreroLink = document.getElementById("addSombrero");
        sombreroLink.onclick =
        function (eventArgs) {
            sombreroImage.src = (sombreroOn()) ? "" : "images/Sombrero.png";
            draw();
            //savePhoto();
        }

        var newPicLink = document.getElementById("newPic");
        newPicLink.onclick =
        function (eventArgs) {
            StartCameraCaptureUI();
        }

    });

    function sombreroAndMustacheOff() {
        return !sombreroOn() && !mustacheOn();
    }

    function sombreroOn() {
        return !!sombreroImage.src && sombreroImage.src.indexOf("Sombrero") > -1
    }

    function mustacheOn() {
        return !!mustacheImage.src && mustacheImage.src.indexOf("Mustache") > -1
    }


    var dragObject;
    function touchStart(){
        mouseDown(getEvent(e));
    }

    function touchMove(){
        //mouseMove(getEvent(e));
    }

    function touchEnd(){
        mouseUp(getEvent(e));
    }

    function mouseDown(e) {
    }

//    function mouseUp(e) {
//        isDragging = false;
//        canvas.onmousemove = null;
//        dragObject = null;
//        //savePhoto();
//    }

//    function mouseMove(e) {
//        if (!isDragging) {
//            return;
//        }
//        //The extra pixel width is so you're not grabbing it right in the center
//        //and obscuring where you place it with your finger.
//        dragObject.X = e.pageX - (dragObject.Width + 60);
//        dragObject.Y = e.pageY - (dragObject.Height + 120);
//    }

    function killIntervalIfSombreroAndMustacheOff() {
        if (sombreroAndMustacheOff()) {
            clearInterval(drawInterval);
            drawInterval = "";
        }
    }

    function StartCameraCaptureUI() {

        if (!cordovaReady) {
            alert('not running natively, so cannot access the camera');
            return false;
        }
         try {
            navigator.camera.getPicture(onSuccess, onFail, { 
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 480,
            targetHeight: 360
            }
            );    
        } catch (e) {
            alert(e.Message);
        }

      
        function onSuccess(imageURI) {
            photo.src = imageURI;
            photo.Height=360;
            photo.Width = 480;
            drawBackgroundWithPhoto(0, 0, 480, 360);
        }

        function onFail(message) {
            alert('Failed because: ' + message);
        }


    }

    function savePhoto() {

        var pictures = null //Windows.Storage.KnownFolders.picturesLibrary;
        var Imaging = null //Windows.Graphics.Imaging;
        var imageName = "CincoDeMayoPic" + Date.now().toString().replace(/:/g, "") + ".png";
        var _killStream;
        var canvasImage;

        var fileStreamByteArray;
        if (postcardCanvas.getContext) {
            var postcardCanvasContext = postcardCanvas.getContext("2d");
            canvasImage = postcardCanvasContext.getImageData(0, 0, postcardCanvas.width, postcardCanvas.height);
        }

        return null;
    }

})();

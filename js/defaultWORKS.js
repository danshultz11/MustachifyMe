// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";
    var photo = new Image();
    var border = new Image();
    var mustacheImage = new Image();
	//mustacheImage.crossOrigin = 'anonymous';
    var sombreroImage = new Image();
	//sombreroImage.crossOrigin = "";
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
            if (!!sombrero)
                context.drawImage(sombreroImage, sombrero.X, sombrero.Y);
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

    function drawBackground(x, y, w, h) {
        context.beginPath();
        context.fillStyle = "#ffffff";
        context.rect(x, y, w, h);
        context.closePath();
        context.fill();
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


    function imageDataRequestedHandler(request) {
        request.data.properties.title = "Cinco de Mayo pic"
        request.data.properties.description = "Picture from the Cinco de Mayo party, 2012";

        // When sharing an image, don't forget to set the thumbnail for the DataPackage
        var streamReference = null //fix this - Windows.Storage.Streams.RandomAccessStreamReference.createFromFile(savedFile);
        request.data.properties.thumbnail = streamReference;

        // It's recommended to always use both setBitmap and setStorageItems for sharing a single image
        // since the Target app may only support one or the other

        // Put the image file in an array and pass it to setStorageItems
        request.data.setStorageItems([savedFile]);

        // The setBitmap method requires a RandomAccessStreamReference
        request.data.setBitmap(streamReference);
        streamReference = null;
        //savedFile = null;
    }

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

        //
        canvas.onmousedown = mouseDown;
        canvas.onmouseup = mouseUp;

        // Once it's loaded draw the image on the canvas.
        photo.addEventListener('load', function () {
            // Original resolution: x, y.
            context.drawImage(this, 0, 0);
            context.drawImage(border, 0, 0);

            border.src = 'images/SophicDeMayoFrame640x480.png';
        }, false);

        // Once it's loaded draw the image on the canvas.
        border.addEventListener('load', function () {
            context.drawImage(this, 0, 0);
            //savePhoto();
        }, false);

        mustacheImage.addEventListener('load', function () {
            mustache = new Mustache(200, 250, 1, "");
            if (!drawInterval || drawInterval == "")
                drawInterval = setInterval(draw, 10);
        }, false);

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
            //savePhoto();
        }

        var sombreroLink = document.getElementById("addSombrero");
        sombreroLink.onclick =
        function (eventArgs) {
            sombreroImage.src = (sombreroOn()) ? "" : "images/Teeth200x211.png";
            draw();
            //savePhoto();
        }
    });
    StartCameraCaptureUI();
    setupShare();



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
    function mouseDown(e) {
        if (!!mustache && mustache.IsInbounds(e.pageX, e.pageY-60)) {
            dragObject = mustache;
            isDragging = true;
            canvas.onmousemove = mouseMove;
        }
        else if (!!sombrero && sombrero.IsInbounds(e.pageX, e.pageY-30)) {
            dragObject = sombrero;
            isDragging = true;
            canvas.onmousemove = mouseMove;
        }
    }

    function mouseUp(e) {
        isDragging = false;
        canvas.onmousemove = null;
        dragObject = null;
        //savePhoto();
    }

    function mouseMove(e) {
        if (!isDragging) {
            return;
        }
        //The -60 is so you're not grabbing it right in the center
        //and obscuring where you place it with your finger.
        dragObject.X = e.pageX - (dragObject.Width + 60);
        dragObject.Y = e.pageY - (dragObject.Height +40);
    }
    function killIntervalIfSombreroAndMustacheOff() {
        if (sombreroAndMustacheOff()) {
            clearInterval(drawInterval);
            drawInterval = "";
        }
    }

    //End Canvas Stuff

    function StartCameraCaptureUI() {
        var captureUI = null //new Windows.Media.Capture.CameraCaptureUI();
        //captureUI.photoSettings.format = null //Windows.Media.Capture.CameraCaptureUIPhotoFormat.png;

        //captureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photoOrVideo)
        //.then(
          //  function (file) {
            //    if (file != null) {
              //      writeStreamURL = URL.createObjectURL(file);
                //    filePath = file.path;
                  //  photo.src = writeStreamURL;
//                }
  //          }
    //    )
      //  .done(function () {
        //    statusMessage.innerText = "";
        //},
        //function (error) { statusMessage.innerText = "failed capturing from camera"; });

    }

    function showShareUI() {
        //Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
    }

    function setupShare() {
        var dataTransferManager = null //Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
       // dataTransferManager.addEventListener("datarequested", function (e) {
       //     var request = e.request;
       //     imageDataRequestedHandler(request);
       // });
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


(function () {
    "use strict";
    //var folder = Windows.Storage.ApplicationData.current.localFolder;
    var imageName = "CincoDeMayoPic" + Date.now().toString().replace(/:/g, "") + ".png";


    function savePhoto() {

        var pictures = Windows.Storage.KnownFolders.picturesLibrary;
        var Imaging = Windows.Graphics.Imaging;
        var imageName = "CincoDeMayoPic" + Date.now().toString().replace(/:/g, "") + ".png";
        var _killStream;
        var canvasImage;

        var fileStreamByteArray;
        if (postcardCanvas.getContext) {
            var postcardCanvasContext = postcardCanvas.getContext("2d");
            canvasImage = postcardCanvasContext.getImageData(0, 0, postcardCanvas.width, postcardCanvas.height);
        }

        return pictures.createFileAsync(imageName, Windows.Storage.CreationCollisionOption.replaceExisting)
            .then(function (file) {
                if (file) {
                    savedFile = file;
                    return file.openAsync(Windows.Storage.FileAccessMode.readWrite);
                }
            }, function (error) { statusMessage.innerText = "failed saving png: " + error.message })
            .then(function (stream) {
                //Create imageencoder object
                _killStream = stream;
                return Imaging.BitmapEncoder.createAsync(Imaging.BitmapEncoder.pngEncoderId, _killStream);
            }, function (error) { statusMessage.innerText = "failed creating encoder: " + error.message })
            .then(function (encoder) {
                //Set the pixel data in the encoder
                encoder.setPixelData(Imaging.BitmapPixelFormat.rgba8, Imaging.BitmapAlphaMode.straight, canvasImage.width, canvasImage.height, 96, 96, canvasImage.data);
                //Go do the encoding
                encoder.flushAsync().done(function () { _killStream.close() });
                return savedFile;
            }, function (error) { statusMessage.innerText = "failed encoding png: " + error.message }
            );

    }

    function setNewPhotoDataOnAccess() {

        var pictures = Windows.Storage.KnownFolders.picturesLibrary; var imageName = "CincoDeMayoPic" + Date.now().toString().replace(/:/g, "") + ".png";
        var fileStreamByteArray;
        var canvasImage;

        if (postcardCanvas.getContext) {
            var postcardCanvasContext = postcardCanvas.getContext("2d");
            canvasImage = postcardCanvasContext.getImageData(0, 0, postcardCanvas.width, postcardCanvas.height);
        }

        //Create a new file in the PictureLibrary
        return pictures.createFileAsync(imageName, Windows.Storage.CreationCollisionOption.replaceExisting)
        .then(function (file) {
            //Create a function that returns the data from our HTML5 canvas
            var newData = function (stream) {
                stream = canvasImage.data;
            };
            //Get a stream reference to the newly created file
            //var streamReference = Windows.Storage.Streams.RandomAccessStreamReference.createFromFile(file);
            //set the newData function to execute (and populate the bitmap data) when our file is accessed.
            //Windows.Storage.StorageFile.replaceWithStreamedFileAsync(file, newData, streamReference)
                    //.done(function (replacedFile) {
           //              statusMessage.innerText = "successfully replaced image";
              //          return replacedFile;
               //    }, function (error) { statusMessage.innerText = "failed to replace image" });
 //           return file;
        });

    }

    //var savedFile;
    //Make the savePhoto function async.
   // WinJS.Namespace.define('photoSaver', { savePhoto: savePhoto, setNewPhotoDataOnAccess: setNewPhotoDataOnAccess, savedFile: savedFile });
    //WinJS.Namespace.define('photoSaver', { savePhoto: savePhoto, setNewPhotoDataOnAccess: setNewPhotoDataOnAccess});

})();
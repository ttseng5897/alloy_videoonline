
//$.winIndex.add(viewOverlay);		

/**
 * Lets add a loading animation - Just for Fun!
 */
var loadingView = Alloy.createController("loader");
loadingView.getView().open();
loadingView.start(); 

setTimeout(function(){
	loadingView.getView().close();
	loadingView = null;
	$.winIndex.open();
	$.winIndex.add(viewOverlay);
	//openCamera();
}, 5000);


var args = arguments[0] || {};

/**
 * function to start the loading animation
 */
$.start = function() {
	
	  var matrix = Ti.UI.create2DMatrix();
	  
	  matrix = matrix.rotate(180);
	  matrix = matrix.scale(2, 2);
	  var a = Ti.UI.createAnimation({
	    transform : matrix,
	    duration : 2000,
	    autoreverse : true,
	    repeat : 1
	  });
	  $.imgVideoRecorder.animate(a);

};


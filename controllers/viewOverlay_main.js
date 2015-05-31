function displayMSG(txtMsg, numSeconds) {
	
	setTimeout(function(){
		$.lblMessageText.text = txtMsg;
		$.lblMessageText.text.opacity = 0;
		for(var i=1;i<11;i++) {
			setTimeout(function(){
		        $.lblMessageText.opacity = i/10;
		    }, 200);
		}
		setTimeout(function(){
				clearAfterDisplayMSG();
		}, numSeconds * 1000);
	}, 300);
}

function clearAfterDisplayMSG() {
		
	$.lblMessageText.text.opacity = 1;
	for(var i=10;i>0;i--) {
		setTimeout(function(){
		   $.lblMessageText.opacity = i/10;
		}, 200);
	}
	$.lblMessageText.text.opacity = 0;
	$.lblMessageText.text = "";
}

// Adjust layout
$.btnScreen.left = 20;
$.btnCamera.left = $.btnScreen.left + (DEVICE_WIDTH - 20) / 4;
$.btnFlash.left = $.btnScreen.left + ((DEVICE_WIDTH - 20) / 4) * 2;
$.btnQuality.left = $.btnScreen.left + ((DEVICE_WIDTH - 20) / 4) * 3;

var fgVideoTimer = new countDown(Titanium.App.Properties.getInt('recordVideoLength'),0, 
		function() {	
			numVideoTimer++;
			$.lblRecordTimer.text = numVideoTimer;
			
			if(numVideoTimer % 2 == 0) {
				$.btnRecord.image = "/images/record2.png";
			}else{
				$.btnRecord.image = "/images/record1.png";
			}
		},
		function() {
			Ti.API.log('Video Timer finished!');
			Ti.App.fireEvent('stopVideoRecord');
			
			numVideoTimer = 0;
		}
	);	


var cameras = Ti.Media.availableCameras;
	for (var c=0;c<cameras.length;c++)
	{
		// if we have a rear camera ... we add switch button
		if (cameras[c]==Ti.Media.CAMERA_REAR)
		{
			//container.overlay.add(container.cameraType);
	
			$.btnCamera.addEventListener('click',function()
			{
				if (Ti.Media.camera == Ti.Media.CAMERA_FRONT)
				{
					displayMSG(L("BackLens"), 1);
					
					Ti.Media.switchCamera(Ti.Media.CAMERA_REAR);
				}
				else
				{
					displayMSG(L("RearLens"), 1);
	
					Ti.Media.switchCamera(Ti.Media.CAMERA_FRONT);
				}
			});
			break;
		}
	}

$.btnFlash.backgroundImage = "/images/flash" + Titanium.App.Properties.getInt('recordFlashAction') + ".png";
$.btnFlash.addEventListener('click',function()
	{

			if (Titanium.App.Properties.getInt('recordFlashAction') == 0)
			{
				displayMSG(L("FlashOn"), 1);
				Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_ON;
				Titanium.App.Properties.setInt('recordFlashAction', 1);
				$.btnFlash.backgroundImage = "/images/flash1.png";
			}
			else if (Titanium.App.Properties.getInt('recordFlashAction') == 1)
			{
				displayMSG(L("FlashOff"), 1);
				Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_OFF;
				Titanium.App.Properties.setInt('recordFlashAction', 2);
				$.btnFlash.backgroundImage = "/images/flash2.png";
			}
			else
			{
				displayMSG(L("FlashAuto"), 1);
				Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_AUTO;
				Titanium.App.Properties.setInt('recordFlashAction', 0);
				$.btnFlash.backgroundImage = "/images/flash0.png";
			}
	});
	
$.btnQuality.backgroundImage = 	"/images/video" + Titanium.App.Properties.getInt('recordVideoQuality') + ".png";
$.btnQuality.addEventListener('click',function() {
	if(Titanium.App.Properties.getInt('recordVideoQuality') == 1) {
		$.btnQuality.backgroundImage = "/images/video2.png";
		Titanium.App.Properties.setInt('recordVideoQuality',2);
		displayMSG(L("NormalQuality"), 1);
	}
	else if(Titanium.App.Properties.getInt('recordVideoQuality') == 2) {
		$.btnQuality.backgroundImage = "/images/video3.png";
		Titanium.App.Properties.setInt('recordVideoQuality',3);
		displayMSG(L("NotfineQuality"), 1);
	}
	else{
		$.btnQuality.backgroundImage = "/images/video1.png";
		Titanium.App.Properties.setInt('recordVideoQuality',1);
		displayMSG(L("GoodQuality"), 1);
	}
});


$.btnLength.image = "/images/cut" + Titanium.App.Properties.getInt('recordVideoLength') + ".png";
$.btnLength.addEventListener('click',function() {
	Ti.API.log('recordVideoLength = '+Titanium.App.Properties.getInt('recordVideoLength'));
	if(Titanium.App.Properties.getInt('recordVideoLength') == 1) {
		displayMSG(L("minite2"), 1);
		$.btnLength.image = "/images/cut2.png";
		Titanium.App.Properties.setInt('recordVideoLength',2);
	}
	else if(Titanium.App.Properties.getInt('recordVideoLength') == 2) {
		displayMSG(L("minite3"), 1);
		$.btnLength.image = "/images/cut3.png";
		Titanium.App.Properties.setInt('recordVideoLength',3);
	}
	else if(Titanium.App.Properties.getInt('recordVideoLength') == 3) {
		displayMSG(L("minite4"), 1);
		$.btnLength.image = "/images/cut4.png";
		Titanium.App.Properties.setInt('recordVideoLength',4);	
	}
	else if(Titanium.App.Properties.getInt('recordVideoLength') == 4) {
		displayMSG(L("minite5"), 1);
		$.btnLength.image = "/images/cut5.png";
		Titanium.App.Properties.setInt('recordVideoLength',5);
	}else{
		displayMSG(L("minite1"), 1);
		$.btnLength.image = "/images/cut1.png";
		Titanium.App.Properties.setInt('recordVideoLength',1);
	}
});

$.btnDropbox.image = "/images/saveto" + Titanium.App.Properties.getInt('recordSaveTo') + ".png";
$.btnDropbox.addEventListener('click',function() {
	//Ti.API.log('recordSaveTo = '+Titanium.App.Properties.getInt('recordVideoLength'));
	if(Titanium.App.Properties.getInt('recordSaveTo') == 1) {  // recordSaveTo: 0 is save to local gallery , 1 is upload to Dropbox
	
		var optionsDialogOpts = {
			options:[L('optionLogout'), L('optionSaveAlbum'), L('cancel')],
			destructive:0,
			cancel:2,
			title: L('DropboxAccount')
		};
		
		var dialog = Titanium.UI.createOptionDialog(optionsDialogOpts);
		
		// add event listener
		dialog.addEventListener('click',function(e)
		{
			
			if(e.index == 0 || e.index == 1) {
				
				$.btnDropbox.image = "/images/saveto0.png";
				Titanium.App.Properties.setInt('recordSaveTo',0);
				
				if(e.index == 0) {
					displayMSG(L("DropboxLogout"), 2);
					DBClient.unlink();
				}else{
					displayMSG(L("DropboxOff"), 2);
				}
			}
		});
		
		dialog.show();
		
	}else{
		
		if(Titanium.Network.online == true) {
	
			$.btnDropbox.image = "/images/saveto1.png";
			Titanium.App.Properties.setInt('recordSaveTo',1);
			displayMSG(L("DropboxOn"), 2);
			if(DBClient.isLinked) {
				
			}else{
				
				var optionsDialogOpts = {
					options:[L('LoginDropboxAccount'), L('cancel')],
					destructive:0,
					cancel:1,
					title: L('askLoginDropbox')
				};
				
				var dialog = Titanium.UI.createOptionDialog(optionsDialogOpts);
				
				// add event listener
				dialog.addEventListener('click',function(e)
				{
					
					if(e.index == 0)  DBClient.link();

				});
				
				dialog.show();
			}
			
		}else{
			alert(L('NoNetwork'));
		}
		
	}

});

var viewVideos = Alloy.createController('viewVideoList').getView();
$.btnList.addEventListener('click',function() {
	$.viewOverlayMain.add(viewVideos);
});

//$.btnRecord.image = "/images/saveto" + Titanium.App.Properties.getInt('recordSaveTo') + ".png";
$.btnRecord.addEventListener('click',function() {
	Ti.API.log('isRecordingNow/deviceIsRecordingNow = '+Titanium.App.Properties.getBool('isRecordingNow')+'/'+Titanium.App.Properties.getBool('deviceIsRecordingNow'));
	if(Titanium.App.Properties.getBool('isRecordingNow')==false) {
		Titanium.App.Properties.setBool('isRecordingNow', true);
		
		Ti.Media.hideCamera();
		wait(1500);
		openCamera();
		wait(800);
		displayMSG(L("StartRecord"), 2);
		Ti.App.fireEvent('startVideoRecord');
		
	}else{
		Titanium.App.Properties.setBool('isRecordingNow', false);
		displayMSG(L("StopRecord"), 2);
		Ti.App.fireEvent('stopVideoRecord');
	}
		
});

$.btnScreen.addEventListener('click',function() {
	$.viewMask.visible = true;
	
	$.lblMaskText.opacity = 1;
	var animation = Titanium.UI.createAnimation();
		animation.backgroundColor = 'black';
		animation.duration = 3000;
		var animationHandler = function() {
		  animation.removeEventListener('complete',animationHandler);
		  $.lblMaskText.visible = true;
		  
		  setTimeout(function(){
		  	  for(var i=0;i<1000;i++) {
				  $.lblMaskText.opacity = 1 - ((i+1)/1000);
			  }
		  }, 5000);
			
		  
	};
	animation.addEventListener('complete',animationHandler);
	$.viewMask.animate(animation);
});

function hideMask() {
	$.viewMask.visible = false;
	$.lblMaskText.visible = false;
	$.viewMask.backgroundColor = null;
}


//---------------------------------------------------------------------------//

$.viewMask.visible = false;
$.lblMaskText.visible = false;
$.lblMaskText.text = L("MaskText");

Ti.App.addEventListener('updateLableMessage', function(e) {
	
	$.lblRecordTimer.text = e.msg;
});

Ti.App.addEventListener('startVideoRecord', function(e) {
	Ti.API.log('startVideoRecord Event: isRecordingNow/deviceIsRecordingNow = '+Titanium.App.Properties.getBool('isRecordingNow')+'/'+Titanium.App.Properties.getBool('deviceIsRecordingNow'));
	if(Titanium.App.Properties.getBool('deviceIsRecordingNow')==false) {
		//Ti.API.log('Start Record, save to Gallery: '+Titanium.App.Properties.getBool('recordSaveGallery'));
		Titanium.App.Properties.setBool('deviceIsRecordingNow', true);
		
		$.btnCamera.enabled = false;
		$.btnFlash.enabled = false;
		$.btnQuality.enabled = false;
		$.btnLength.enabled = false;
		$.btnDropbox.enabled = false;
		
		if (Titanium.App.Properties.getInt('recordFlashAction') == 1)
		{
			Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_ON;
		}
		else if (Titanium.App.Properties.getInt('recordFlashAction') == 2)
		{
			Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_OFF;
		}
		else
		{
			Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_AUTO;
		}

		Titanium.Media.startVideoCapture();	
		fgVideoTimer.set(Titanium.App.Properties.getInt('recordVideoLength'),0);
		numVideoTimer = 0;
		fgVideoTimer.start();
	}
		
});

Ti.App.addEventListener('stopVideoRecord', function(e) {
	Ti.API.log('stopVideoRecord Event: isRecordingNow/deviceIsRecordingNow = '+Titanium.App.Properties.getBool('isRecordingNow')+'/'+Titanium.App.Properties.getBool('deviceIsRecordingNow'));

	if(Titanium.App.Properties.getBool('deviceIsRecordingNow')==true) {
		Ti.API.log('Stop Video Record');
		Titanium.App.Properties.setBool('deviceIsRecordingNow', false);
		
		$.btnRecord.image = '/images/record1.png';
		
		fgVideoTimer.stop();
		Titanium.Media.stopVideoCapture();
		
		$.btnCamera.enabled = true;
		$.btnFlash.enabled = true;
		$.btnQuality.enabled = true;
		$.btnLength.enabled = true;
		$.btnDropbox.enabled = true;
	}
});

Ti.App.addEventListener('removeVideoListView', function(e) {
	$.viewOverlayMain.remove(viewVideos);
});
//---------------------------------------------------------------------------//

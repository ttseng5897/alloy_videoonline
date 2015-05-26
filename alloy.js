// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};
//if(Titanium.App.Properties.hasProperty('deviceIsRecordingNow') == false) { Titanium.App.Properties.setBool('deviceIsRecordingNow',false); }

if(Titanium.App.Properties.hasProperty('recordVideoQuality') == false) { Titanium.App.Properties.setInt('recordVideoQuality',3); }
if(Titanium.App.Properties.hasProperty('recordFlashAction') == false) { Titanium.App.Properties.setInt('recordFlashAction',2); }
if(Titanium.App.Properties.hasProperty('recordVideoLength') == false) { Titanium.App.Properties.setInt('recordVideoLength',2); }
if(Titanium.App.Properties.hasProperty('recordSaveTo') == false) { Titanium.App.Properties.setInt('recordSaveTo',0); }
if(Titanium.App.Properties.hasProperty('recordFileList') == false) { Titanium.App.Properties.setList('recordFileList',[]); }
//Titanium.App.Properties.setList('recordFileList',[]);

Titanium.App.Properties.setBool('isRecordingNow',false);
Titanium.App.Properties.setBool('deviceIsRecordingNow',false);

var DEVICE_WIDTH = Titanium.Platform.displayCaps.platformWidth;
var DEVICE_HEIGHT = Titanium.Platform.displayCaps.platformHeight;
if(DEVICE_WIDTH>DEVICE_HEIGHT) {  //長邊視為高，無論橫向或直向
	DEVICE_WIDTH = Titanium.Platform.displayCaps.platformHeight;
	DEVICE_HEIGHT = Titanium.Platform.displayCaps.platformWidth;
}


var CAMERA_SCREEN_RATIO = (DEVICE_HEIGHT - (80*2)) / DEVICE_HEIGHT;

var VIDEO_MAX_DURATION = 480*1000; //480秒

var uploadingDropboxNow = false;

Ti.API.info('Ti.Platform.displayCaps.density: ' + Ti.Platform.displayCaps.density);
Ti.API.info('Ti.Platform.displayCaps.dpi: ' + Ti.Platform.displayCaps.dpi);
Ti.API.info('Ti.Platform.displayCaps.platformHeight: ' + Ti.Platform.displayCaps.platformHeight);
Ti.API.info('Ti.Platform.displayCaps.platformWidth: ' + Ti.Platform.displayCaps.platformWidth);
if((Ti.Platform.osname === 'iphone')||(Ti.Platform.osname === 'ipad')||(Ti.Platform.osname === 'android')){
  Ti.API.info('Ti.Platform.displayCaps.logicalDensityFactor: ' + Ti.Platform.displayCaps.logicalDensityFactor);
}
if(Ti.Platform.osname === 'android'){
  Ti.API.info('Ti.Platform.displayCaps.xdpi: ' + Ti.Platform.displayCaps.xdpi);
  Ti.API.info('Ti.Platform.displayCaps.ydpi: ' + Ti.Platform.displayCaps.ydpi);
}

var recordVideoList = Titanium.App.Properties.getList('recordFileList');

var dropbox = require("com.clinsoftsol.dropboxti");

var DBClient = dropbox.createClient({
	appKey: 'mxp13dhy62rj3wk',
	appSecret: 'addmjkslazn6dqj',
	appRoot: dropbox.DB_ROOT_APP,
	onerror: function(e) {
		Ti.API.error("DB Client error: "+error);
		Ti.API.error("Error subtype = "+subtype);
		Ti.API.error("Error code = "+code);
	},
});

DBClient.addEventListener('loadedAccountInfo', function(e) {
    Ti.API.info("*** ACCOUNT INFO ***");
    Ti.API.info('country = '+e.country);
    Ti.API.info('displayName = '+e.displayName);
    Ti.API.info('userId = '+e.userId);
    Ti.API.info('referralLink = '+e.referralLink);
    Ti.API.info('Quota.normalBytes = '+e.quota.normalBytes);
    Ti.API.info('Quota.sharedBytes = '+e.quota.sharedBytes);
    Ti.API.info('Quota.totalConsumedBytes = '+e.quota.totalConsumedBytes);
    Ti.API.info('Quota.totalBytes = '+e.quota.totalBytes);
});

DBClient.addEventListener('uploadProgress', function(e) {
	Ti.API.log('Source: ' + e.srcPath + ' / Dest:' + e.destPath + '/ DropboxProgress = '+e.progress);
});

DBClient.addEventListener('uploadedFile', function(e) {
	Ti.API.log('Source: ' + e.srcPath + ' uploaded!!');
});

DBClient.unlink();

function wait (millis) {
    var date = new Date();
    var curDate = null;
 
    do { 
        curDate = new Date(); 
    } while(curDate-date < millis);
}

var countDown =  function( m , s, fn_tick, fn_end  ) {
	return {
		total_sec:m*60+s,
		timer:this.timer,
		set: function(m,s) {
			this.total_sec = parseInt(m)*60+parseInt(s);
			this.time = {m:m,s:s};
			return this;
		},
		start: function() {
			var self = this;
			this.timer = setInterval( function() {
				if (self.total_sec) {
					self.total_sec--;
					self.time = { m : parseInt(self.total_sec/60), s: (self.total_sec%60) };
					fn_tick();
				}
				else {
					self.stop();
					fn_end();
				}
				}, 1000 );
			return this;
		},
		stop: function() {
			clearInterval(this.timer)
			this.time = {m:0,s:0};
			this.total_sec = 0;
			return this;
		}
	}
}

var viewOverlay = Alloy.createController('viewOverlay_main').getView();

var numGlobalTimer = 0;
var fgGlobalTimer = new countDown(365*24*60,0, 
		function() {	
			//Ti.API.log('uploadingDropboxNow: '+uploadingDropboxNow);
			numGlobalTimer++;
			
			if(uploadingDropboxNow==false) {
				Ti.API.log('Fire Dropbox upload event.');
				Ti.App.fireEvent('uploadToDropbox');
			}
		},
		function() {
			Ti.API.log('Global timer stopped!');
		}
	);	
fgGlobalTimer.start();

var fgVideoTimer;
var numVideoTimer = 0;


var openCamera = function() {
	//Open Camera
	var tr = Ti.UI.create2DMatrix({scale : CAMERA_SCREEN_RATIO });
	//Ti.Media.setCameraFlashMode(Titanium.Media.CAMERA_FLASH_OFF);	
	Ti.Media.cameraFlashMode = Ti.Media.CAMERA_FLASH_OFF;

	function saveGallery(videoFile) {
		Titanium.Media.saveToPhotoGallery( videoFile, {
			success: function(e) {
				Ti.App.fireEvent('updateLableMessage', {"msg": "OK" });
				Ti.API.log('Save to Gallery OK!! Fire record event.' + Titanium.App.Properties.getBool('isRecordingNow'));
				if(Titanium.App.Properties.getBool('isRecordingNow')==true) {
					Ti.App.fireEvent('startVideoRecord');
				}
			},
			error: function(e) {
				Ti.App.fireEvent('updateLableMessage', {"msg": "faled" });
				Titanium.UI.createAlertDialog({
					title:'Error saving',
					message:e.error
				}).show();
				Ti.API.log('Save to Gallery Failed!! Fire record event.');        
				if(Titanium.App.Properties.getBool('isRecordingNow')==true) {
					Ti.App.fireEvent('startVideoRecord');
				}
			}
		});
	}
	
	function saveDropbox(videoFile) {

		var filename = Titanium.Filesystem.applicationDataDirectory + "/"+ 'record_' + new Date().getTime() + ".mov";
		var f = Titanium.Filesystem.getFile(filename);
		if (f.exists()) {
			Ti.API.info('The file exist , trying to delete it before using it :' + f.deleteFile());
			f = Titanium.Filesystem.getFile(filename);
		}
		f.write(videoFile);
		Ti.App.fireEvent('updateLableMessage', {"msg": "ok" });
		//win.backgroundImage = f.nativePath;
		//var datetimeVideo = new Date().getFullYear() + "/" + new Date().getMonth() + "/" + new Date().getDate() + " " + new Date().getHours() + ":" + new Date().getMinutes();
		var numYear = new Date().getFullYear();
		var numMonth = new Date().getMonth();
		var numDay = new Date().getDate();
		var numHour = new Date().getHours();
		var numMinute = new Date().getMinutes();
		
		recordVideoList.push({"title": numYear + '/' + numMonth + '/' + numDay, "displayname": numHour + ':' + numMinute,"videopath": filename, "datetime": numYear + '/' + numMonth + '/' + numDay + ' ' + numHour + ':' + numMinute});
		Titanium.App.Properties.setList('recordFileList', recordVideoList);
		
		if(Titanium.App.Properties.getBool('isRecordingNow')==true) {
			Ti.App.fireEvent('startVideoRecord');
		}
	}

	Titanium.Media.showCamera({
			
			success:function(event)
			{
				Titanium.App.Properties.setBool('deviceIsRecordingNow', false);
				Ti.API.debug("Video was taken");
				//Titanium.App.Properties.setBool('isRecordingNow', false);
				//Ti.App.fireEvent('stopVideoRecord');
				Ti.App.fireEvent('updateLableMessage', {"msg": "saving" });
				
				Titanium.App.Properties.getBool('recordSaveTo')==0 && saveGallery(event.media);
				
				Titanium.App.Properties.getBool('recordSaveTo')==1 && saveDropbox(event.media);
			},
			cancel:function()
			{
				Titanium.App.Properties.setBool('deviceIsRecordingNow', false);
				//Ti.App.fireEvent('stopVideoRecord');
			},
			error:function(error)
			{
				Titanium.App.Properties.setBool('deviceIsRecordingNow', false);
				var a = Titanium.UI.createAlertDialog({title:'Camera'});
				if (error.code == Titanium.Media.NO_CAMERA)
				{
					a.setMessage('Please run this test on device');
				}
				else
				{
					a.setMessage('Unexpected error: ' + error.code);
				}
				a.show();
			},
			transform : tr,
			overlay: viewOverlay,
			showControls:false,	// don't show system controls
			mediaTypes: Titanium.Media.MEDIA_TYPE_VIDEO,
			autohide:false, // tell the system not to auto-hide and we'll do it ourself
			saveToPhotoGallery: Titanium.App.Properties.getBool('recordSaveTo')==0 ? true:false,
			videoMaximumDuration: 10*60*1000,	
			videoQuality: Titanium.App.Properties.getInt('recordVideoQuality')-1  // QUALITY_LOW, QUALITY_MEDIUM, QUALITY_HIGH
		});
};


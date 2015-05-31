function closeView() {
	Ti.App.fireEvent('removeVideoListView');
}

Ti.App.addEventListener('updateUploadProgress', function(e) {
	var numProgress = e.progress * 100;
	$.progressbarUpload.value = numProgress;
	$.progressbarUpload.message = '[' + Titanium.App.Properties.getString('uploadingFilename') + '] ' + numProgress.toFixed(1) + '% uploading...';
});

Ti.App.addEventListener('updateVideoFile', function(e) {
	
	var listviewVideofiles = Ti.UI.createListView({
		top: 0,
		left: 0,
		right: 0,
		bottom: 0
	});
	$.viewVideoList.remove($.viewVideoList.children[0]);
	$.viewVideoList.add(listviewVideofiles);
	
	var sections = [];
	var listDataSet = [];
	recordVideoList = Titanium.App.Properties.getList('recordFileList');
	
	var titleSection = Ti.UI.createListSection({ headerTitle: '錄影檔案列表', footerTitle: ' ' });
	

		for (var key in recordVideoList) {
			if (recordVideoList.hasOwnProperty(key))  listDataSet.push( {properties: { image: '/images/videofile.png', title: recordVideoList[key].datetime, path: recordVideoList[key].videopath, 
					datetime: recordVideoList[key].datetime, height: "auto", color: "gray", font: { fontSize: 13 } } } );
			Ti.API.log(recordVideoList[key].title + '/' + recordVideoList[key].videopath + '/' + recordVideoList[key].datetime);
		}

	
		
	
	titleSection.setItems(listDataSet);
	sections.push(titleSection);
	listviewVideofiles.sections = sections;
	
	listviewVideofiles.addEventListener('itemclick', function(e){
		
		var item = titleSection.getItemAt(e.itemIndex);
		var numItemSelected = e.itemIndex;
		
			//Ti.API.log(item.properties.title + '/' + item.properties.path + '/' + item.properties.datetime);
			var passData = [ { "title": item.properties.title, path: item.properties.path, datetime: item.properties.datetime
				 } ];
			Titanium.App.Properties.setList('videoSelectedPlay',passData);
			
			Ti.API.log('Play:' + passData[0].path);
			var mediafile = Titanium.Filesystem.getFile( passData[0].path );
		
		var optionsDialogOpts = {
			options:[ L('VideoPlay'), L('VideoDelete'), L('cancel')],
			destructive:1,
			cancel:2,
			title: L('SelectedVideo')
		};
		
		var dialog = Titanium.UI.createOptionDialog(optionsDialogOpts);
		
		// add event listener
		dialog.addEventListener('click',function(e)
		{
			if(e.index == 0) {
				playVideo();
				
			}else if(e.index == 1) {
				mediafile.deleteFile();
				recordVideoList = Titanium.App.Properties.getList('recordFileList');
				recordVideoList.splice(numItemSelected, 1);
			    Titanium.App.Properties.setList('recordFileList', recordVideoList);
			    Ti.App.fireEvent('updateVideoFile');
			}
		});
		
		dialog.show();
		
		
		
		function playVideo() {
			
			if(mediafile.exists) {
				var activeMovie = Titanium.Media.createVideoPlayer({
					media:mediafile,
					backgroundColor:'#111',
					mediaControlStyle:Titanium.Media.VIDEO_CONTROL_FULLSCREEN,
					scalingMode:Titanium.Media.VIDEO_SCALING_MODE_FILL
				});
				
				activeMovie.addEventListener('complete', function()
				{
					$.viewPopup.remove(activeMovie); 
				});
				activeMovie.addEventListener('stop', function()
				{
					$.viewPopup.remove(activeMovie); 
				});
				
				$.viewPopup.add(activeMovie); 
			}else{
				alert('No such file');
			}
		}
		
			
		
			
	});
	
	/*
	widthVideoIcon = 25;
	heightVideIcon = 25;
	
	numWidthVideos = Math.floor(widthContent/widthVideoIcon);
	numHeightVideos = Math.floor(heightContent/heightVideIcon);
	*/
});

Ti.App.addEventListener('uploadToDropbox', function(e) {
	
	recordVideoList = Titanium.App.Properties.getList('recordFileList');
	var latestVideoNum = recordVideoList.length - 1;
	var i = 0 ;
	
	if(recordVideoList.length>0) {
		$.progressbarUpload.value = 0;
			
			var mediafile = Titanium.Filesystem.getFile( recordVideoList[latestVideoNum].videopath );
			var numIndex = i;	
			
			i++;
			
			
			if(mediafile.exists) {
		      	Ti.API.log('Prepare to upload to Dropbox: ' + recordVideoList[latestVideoNum].videopath );
		      	Titanium.App.Properties.setString('uploadingFilename',recordVideoList[latestVideoNum].datetime);
		      	uploadingDropboxNow = true;
		      	$.progressbarUpload.show();
		      	
				DBClient.uploadFile({
					path: "/record_" + new Date().getTime() + ".mov",
					file: mediafile,
					//parentRev: ''
				});
			
			 }else{
			 	Ti.API.log('No such video file is: ' + recordVideoList[latestVideoNum].videopath );
			    uploadingDropboxNow = false;
			    $.progressbarUpload.hide();
			    recordVideoList.splice(-1, 1);
			    Titanium.App.Properties.setList('recordFileList', recordVideoList);
			 }		
		//}
	}
				
});	        	

if(simulationDevice==true) {
	var numProgress = 15.3;
	Titanium.App.Properties.setString('uploadingFilename', '2015/05/30 15:26');
	$.progressbarUpload.value = numProgress;
	$.progressbarUpload.message = '[' + Titanium.App.Properties.getString('uploadingFilename') + '] ' + numProgress.toFixed(1) + '% uploading...';
	$.progressbarUpload.show();
}

Ti.App.fireEvent('updateVideoFile');
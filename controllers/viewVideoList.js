function closeView() {
	Ti.App.fireEvent('removeVideoListView');
}

Ti.App.addEventListener('updateVideoFile', function(e) {
	
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
	$.listviewVideofiles.sections = sections;
	
	$.listviewVideofiles.addEventListener('itemclick', function(e){
		var item = titleSection.getItemAt(e.itemIndex);
		//Ti.API.log(item.properties.title + '/' + item.properties.path + '/' + item.properties.datetime);
		var passData = [ { "title": item.properties.title, path: item.properties.path, datetime: item.properties.datetime
			 } ];
		Titanium.App.Properties.setList('videoSelectedPlay',passData);
		
		Ti.API.log('Play:' + passData[0].path);
		var mediafile = Titanium.Filesystem.getFile( passData[0].path );
		
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
	var i = 0 ;
	
	if(recordVideoList.length>0) {
		//if (recordVideoList.hasOwnProperty(key)) {
			
			var mediafile = Titanium.Filesystem.getFile( recordVideoList[0].videopath );
			var numIndex = i;	
			
			i++;
			uploadingDropboxNow = true;
			
			if(mediafile.exists) {
		      	Ti.API.log('Prepare to upload to Dropbox, video file is: ' + recordVideoList[0].videopath );
				DBClient.uploadFile({
					file: mediafile,
					path: '/',
					overwrite: true,
					success: function(event) {
						uploadingDropboxNow = false;
						Ti.API.log('Successful upload to Dropbox');
			        },
			        error: function(event) {
			        	uploadingDropboxNow = false;
			            Ti.API.log('Upload dropbox Error:'+event);
			        }
			      });      
			      
			      	
			 }else{
			 	Ti.API.log('No such video file is: ' + recordVideoList[0].videopath );
			    uploadingDropboxNow = false;
			    recordVideoList.splice(0, 0);
			    Titanium.App.Properties.setList('recordFileList', recordVideoList);
			 }		
		//}
	}
				
	
      
	    
     

});	        	

Ti.App.fireEvent('updateVideoFile');
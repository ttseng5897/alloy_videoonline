function closeView() {
	Ti.App.fireEvent('removeVideoListView');
}

Ti.App.addEventListener('updateVideoFile', function(e) {
	Ti.API.log('Add video file, propertity ='+Titanium.App.Properties.getList('recordFileList'));
	
	var sections = [];
	var listDataSet = [];
	var titleSection = "";
	var i = 0;
	
	recordVideoList = Titanium.App.Properties.getList('recordFileList');
	
	var lastTitle;
	for (var key in recordVideoList) {
		i++;
		if (recordVideoList.hasOwnProperty(key)) {
			
			if(lastTitle == recordVideoList[key].title) {
				listDataSet.push( {properties: { title: recordVideoList[key].displayname, height: "auto", color: "#fff", font: { fontSize: 13 } } } );
			}else{
				
				if(i>1) {
					titleSection.setItems(listDataSet);
					sections.push(titleSection);
				}
				
				titleSection = Ti.UI.createListSection({ headerTitle: recordVideoList[key].title });
				listDataSet = [];
				listDataSet.push( {properties: { title: recordVideoList[key].displayname, height: "auto", color: "#fff", font: { fontSize: 13 } } } );
			}
		  	lastTitle = recordVideoList[key].title;
		}
	}

	//
	$.listviewVideofiles.sections = sections;

	/*
	widthVideoIcon = 25;
	heightVideIcon = 25;
	
	numWidthVideos = Math.floor(widthContent/widthVideoIcon);
	numHeightVideos = Math.floor(heightContent/heightVideIcon);
	*/
});

Ti.App.fireEvent('updateVideoFile');
// ------------------------ BACKGROUND LOADER ---------------------------------
  // defining variables
var savedUser;


  // listen for changes in chrome.storage
chrome.storage.onChanged.addListener(function(changes, namespace) {
  // define the changeFrequency of the background image
  var changeFrequency = changes.background.newValue.backgroundChangeFrequency;

  // if changeFrequency was not changed by the user then return
  if (changeFrequency === undefined) {
    console.log('changeFrequency is undefined');
    return;
  }

  // clear any other changeFrequency alarms
  chrome.alarms.clear('changeFrequency', function() {

    // depending on the new changeFrequency set up a new alarm
    if (changeFrequency === 1) {
      console.log('changeFrequency', changeFrequency);
      chrome.alarms.create('backgroundCheck', { delayInMinutes: 1440, periodInMinutes: 1440 });
    } else if (changeFrequency === 3) {
      console.log('changeFrequency', changeFrequency);
      chrome.alarms.create('downloadNewBackground', { delayInMinutes: 480, periodInMinutes: 480 });
    } else if (changeFrequency === 5) {
      console.log('changeFrequency', changeFrequency);
      chrome.alarms.create('backgroundCheck', { delayInMinutes: 288, periodInMinutes: 288 });
    } else if (changeFrequency === 8) {
      console.log('changeFrequency', changeFrequency);
      chrome.alarms.create('backgroundCheck', { delayInMinutes: 180, periodInMinutes: 180 });
    } else if (changeFrequency === 10) {
      console.log('changeFrequency', changeFrequency);
      chrome.alarms.create('backgroundCheck', { delayInMinutes: 144, periodInMinutes: 144	});
    } else if (changeFrequency === 12) {
      console.log('changeFrequency', changeFrequency);
      chrome.alarms.create('backgroundCheck', { delayInMinutes: 120, periodInMinutes: 120 });
    } else if (changeFrequency === 24) {
      console.log('changeFrequency', changeFrequency);
      chrome.alarms.create('backgroundCheck', { delayInMinutes: 60, periodInMinutes: 60 });
    } else if (changeFrequency === 48) {
      console.log('changeFrequency', changeFrequency);
      chrome.alarms.create('backgroundCheck', { delayInMinutes: 30, periodInMinutes: 30 });
  } else if (changeFrequency === 100) {
      console.log('changeFrequency', changeFrequency);
      chrome.alarms.create('backgroundCheck', { delayInMinutes: 0.5, periodInMinutes: 1 });
    }
  });

});

chrome.alarms.onAlarm.addListener(function() {
    getBackgroundAPI();
});

function getBackgroundAPI() { // AJAX Unsplash API --> compressImageAndSave()
	// background image AJAX
	$.ajax({
		url: "https://api.unsplash.com/photos/random",
		type: 'get',
		async: true,
		dataType: "json",
		data: "client_id=29b43b6caaf7bde2a85ef2cfddfeaf1c1e920133c058394a7f8dad675b99921b&collections=281002",
		success: (response) => {
            console.log('Successful AJAX Request');

            $('#source_img').css('display', 'none');

            // insert src into img
			$('#source_img').on('load', function() {
				compressImageAndSave();
			}).attr('src', response.urls.raw);

			let backgroundInfo = response;
            // save picture information
			chrome.storage.local.set(backgroundInfo, () => {

				return;
			});
		},
		    error: () => {
                console.log('Failed AJAX request');
		}
	});
}
function compressImageAndSave() {
	let source_img = document.getElementById("source_img");
	let compressedSRC;

	//An Integer from 0 to 100
	let quality = 60;
	// output file format (jpg || png)
	let output_format = 'jpg';
	//This function returns an Image Object

	compressedSRC = jic(source_img, quality, output_format).src;

    var savedBackground = {};
    savedBackground.dataURL = compressedSRC;

	// save to chrome.storage
	chrome.storage.local.set(savedBackground, function() {
		// Notify that we saved.
	});
} // works in tandem with getBackgroundAPI()

function jic(source_img_obj, quality, output_format) {

    var mime_type = "image/jpeg";
    if(typeof output_format !== "undefined" && output_format=="png"){
        mime_type = "image/png";
    }

    var cvs = $('#myCanvas')[0];
    cvs.width = source_img_obj.naturalWidth;
    cvs.height = source_img_obj.naturalHeight;

    var ctx = cvs.getContext("2d").drawImage(source_img_obj, 0, 0);

    var newImageData = cvs.toDataURL(mime_type, quality/100);
    var result_image_obj = new Image();
    result_image_obj.src = newImageData;

    return result_image_obj;
}

// ------------------------ BACKGROUND LOADER ---------------------------------
// defining variables
var savedUser;
var backgroundInfo;
var savedBackground = {};

// listen for changes in chrome.storage
chrome.storage.onChanged.addListener(function(changes, namespace) {
	// if changeFrequency was not changed by the user then return
	if (changes.background.newValue.backgroundChangeFrequency === undefined) {
		console.log('changeFrequency is undefined');
		return;
	}

	// define the changeFrequency of the background image
	var changeFrequency = changes.background.newValue.backgroundChangeFrequency;

	// clear any other changeFrequency alarms
	chrome.alarms.clear('changeFrequency', function() {

		// depending on the new changeFrequency set up a new alarm
		if (changeFrequency === 1) {
			console.log('changeFrequency', changeFrequency);
			chrome.alarms.create('backgroundCheck', {
				delayInMinutes: 1440,
				periodInMinutes: 1440
			});
		} else if (changeFrequency === 3) {
			console.log('changeFrequency', changeFrequency);
			chrome.alarms.create('downloadNewBackground', {
				delayInMinutes: 480,
				periodInMinutes: 480
			});
		} else if (changeFrequency === 5) {
			console.log('changeFrequency', changeFrequency);
			chrome.alarms.create('backgroundCheck', {
				delayInMinutes: 288,
				periodInMinutes: 288
			});
		} else if (changeFrequency === 8) {
			console.log('changeFrequency', changeFrequency);
			chrome.alarms.create('backgroundCheck', {
				delayInMinutes: 180,
				periodInMinutes: 180
			});
		} else if (changeFrequency === 12) {
			console.log('changeFrequency', changeFrequency);
			chrome.alarms.create('backgroundCheck', {
				delayInMinutes: 120,
				periodInMinutes: 120
			});
		} else if (changeFrequency === 24) {
			console.log('changeFrequency', changeFrequency);
			chrome.alarms.create('backgroundCheck', {
				delayInMinutes: 60,
				periodInMinutes: 60
			});
		} else if (changeFrequency === 48) {
			console.log('changeFrequency', changeFrequency);
			chrome.alarms.create('backgroundCheck', {
				delayInMinutes: 30,
				periodInMinutes: 30
			});
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
		dataType: "json",
		data: "client_id=29b43b6caaf7bde2a85ef2cfddfeaf1c1e920133c058394a7f8dad675b99921b&collections=281002",
		success: (response) => {
			console.log('Successful AJAX Request');

			$('#source_img').css('display', 'none');

            savedBackground = response;
			// insert src into img
			$('#source_img').on('load', function() {
				compressImageAndSave();
			}).attr('src', response.urls.raw);

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
	let quality = 55;
	// output file format (jpg || png)
	let output_format = 'jpg';
	//This function returns an Image Object

	compressedSRC = jic(source_img, quality, output_format).src;

	savedBackground.dataURL = compressedSRC;

    // check that values of object are present
    if (savedBackground.dataURL !== undefined || '') {

        if (savedBackground.id !== '' || undefined) {
            // clear chrome.storage so there is no conflicts
            chrome.storage.local.clear(() => {

                // save the new object to chrome.storage
                chrome.storage.local.set(savedBackground, function() {
                    // Notify that we saved.
                    return;
                });
            });
        }
    }
}
function jic(source_img_obj, quality, output_format) {

	var mime_type = "image/jpeg";
	if (typeof output_format !== "undefined" && output_format == "png") {
		mime_type = "image/png";
	}

	var cvs = $('#myCanvas')[0];
	cvs.width = source_img_obj.naturalWidth;
	cvs.height = source_img_obj.naturalHeight;

	var ctx = cvs.getContext("2d").drawImage(source_img_obj, 0, 0);

	var newImageData = cvs.toDataURL(mime_type, quality / 100);
	var result_image_obj = new Image();
	result_image_obj.src = newImageData;

	return result_image_obj;
}

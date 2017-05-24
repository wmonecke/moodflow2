// ------------------------ BOOTRSTRAP APP ---------------------------------
var user = {};
var savedBackground = {};
// start app handler
bootstrapApp();
function bootstrapApp() {
	// check if user exists, if not show login form.
	var savedUser;
	chrome.storage.sync.get(savedUser, function(foundUser) {
		if (foundUser.name === undefined || '') {
			$('.logo, .date, footer, section.dashboard').css('display', 'none');
			$('section.welcomeMessage, .darkenBackground').css('display', 'flex');
			typedjs();
			return;
		}

		user = foundUser;
		fillInformation();

		// start background image handler
		backgroundFrequency();
		return;
	});

	var savedBackground;
	chrome.storage.local.get(savedBackground, function(foundBackground) {
		savedBackground = foundBackground;

		if (foundBackground.dataURL === undefined || '') {

			$('.spinnerContainer').css('display', 'flex');
			getBackgroundAPI();
			return;
		}

		console.log('getting locally saved Picture');
		// get locally saved user and display
		base64ToImgAndDisplay();
		return;
	});



	// check if background is available
}
// ---------------------- DEFINING USER CONSTRUCTOR----------------------------
function User(
	name,
	email,
	gender
	//timezone, // once the user is saved send user to signup if there is non existent
	// and get location;
	//myLocation
    ) {
	this.name = name;
	this.email = email;
	this.gender = gender;
	this.timezone = null;
	this.location = null;
	this.favoriteVideos = [];
	this.id = null; // null until user goes premium
	this.searchbar = true;
	this.todolist = true;
	this.firstTimeMeditating = true;
	this.background = {
		// times that a background should change in a day.
		// 3 is default. User can choose between 1,3,5,8,10,12,14.
		backgroundChangeFrequency: 100,

		// object that holds how many times the background has been changed today
		hasChangedToday: {
			background1: false,
			background2: false,
			background3: false,
			background4: false,
			background5: false,
			background6: false,
			background7: false,
			background8: false,
			background9: false,
			background10: false,
			background11: false,
			background12: false,
			background13: false,
			background14: false
		},

		// array that holds the users favorite bakcgrounds
		favoriteBackgrounds: []
	};
}
User.prototype.searchbarON  = function() {
	this.searchbar = true;
};
User.prototype.searchbarOFF = function() {
	this.searchbar = false;
};
User.prototype.hasMeditated = function() {
	this.firstTimeMeditating = false;
};
// var defined by user during form input
let _name, _email, _gender, _timezone, _myLocation;
// --------------------------- DEFINING CHART ---------------------------------
var ctx = document.getElementById("myChart");
let _now = new Date();
var daysInCurrentMonth = new Date(_now.getFullYear(), _now.getMonth() + 1, 0).getDate();
var myChart = new Chart(ctx, {
	type: 'line',
	data: {
		labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
		datasets: [{
			label: '# of Votes',
			data: [12, 19, 3, 5, 2, 3],
			backgroundColor: [
				'rgba(255, 99, 132, 0.2)',
				'rgba(54, 162, 235, 0.2)',
				'rgba(255, 206, 86, 0.2)',
				'rgba(75, 192, 192, 0.2)',
				'rgba(153, 102, 255, 0.2)',
				'rgba(255, 159, 64, 0.2)'
			],
			borderColor: [
				'rgba(255,99,132,1)',
				'rgba(54, 162, 235, 1)',
				'rgba(255, 206, 86, 1)',
				'rgba(75, 192, 192, 1)',
				'rgba(153, 102, 255, 1)',
				'rgba(255, 159, 64, 1)'
			],
			borderWidth: 1
		}]
	},
	options: {
		maintainAspectRatio: false,
		responsive: true,
		animation: {
			duration: 400,
			easing: 'easeInOutQuart'
		},
		tooltips: {
			bodyFontSize: 10,
			titleFontSize: 10,
			footerFontSize: 10,
			callbacks: {
				title: (tooltipItem, data) => {

					console.log(tooltipItem[0].xLabel);
					let now = new Date();
					let myArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
					let currentMonth = now.getMonth();

					return myArray[currentMonth] + ', ' + tooltipItem[0].xLabel;

				},
				beforeLabel: (tooltipItems, data) => {
					let comment;

					if (this.moodInfoHolder[tooltipItems.index]) {
						comment = this.moodInfoHolder[tooltipItems.index].moodComment;
					} else {
						comment = '';
					}

					return ['', comment, ''];
				},
				label: (tooltipItems, data) => {
					return data.datasets[tooltipItems.datasetIndex].label + ': ' + tooltipItems.yLabel + ' / 10';
				}
			}
		},
		legend: {
			display: false,
			labels: {
				fontColor: 'white'
			}
		},
		scales: {
			xAxes: [{
				gridLines: {
					color: "rgba(255,255,255,0.0)",
					zeroLineColor: "rgba(255,255,255,0.05)"
				},
				ticks: {
					fontColor: "white",
					beginAtZero: false,
					min: 1,
					max: daysInCurrentMonth,
					fixedStepSize: 1
				},
				type: 'linear',
				position: 'bottom'
			}],
			yAxes: [{
				gridLines: {
					color: "rgba(255,255,255,0.0)",
					zeroLineColor: "rgba(255,255,255,0.5)"
				},
				ticks: {
					fontColor: "rgba(200, 200, 200, 0.25)",
					beginAtZero: true,
					max: 10,
					fixedStepSize: 1
				},
				type: 'linear',
			}],
		}

	}
});
// ------------------------------ FUNCTIONS -----------------------------------
// handle backgroundImage
function base64ToImgAndDisplay() { // gets compressed base64 and backgroundImageInfo
	var savedBackground;
	chrome.storage.local.get(savedBackground, function(foundBackground) {
		console.log('Found img');
		console.log(foundBackground);

		$('#background').attr('src', foundBackground.dataURL);
	});

	let backgroundInfo;
	chrome.storage.local.get(backgroundInfo, function(foundBackgroundInfo) {
		console.log('foundBackgroundInfo');
		console.log(foundBackgroundInfo);

		if (foundBackgroundInfo.location === undefined) {
			$('#picLocation').html('Planet Earth');
			$('#picAuthor').html(`Photo: <a style="color: rgba(255, 255, 255, 0.8);" class="myAnchor" href="${foundBackgroundInfo.user.links.html}?utm_source=moodflow&utm_medium=referral&utm_campaign=api-credit">${foundBackgroundInfo.user.name}</a> / <a class="myAnchor" style="color: rgba(255, 255, 255, 0.8);" href="https://unsplash.com/">Unsplash</a>`);
		} else {
			$('#picLocation').html(foundBackgroundInfo.location.title);
			$('#picAuthor').html(`Photo: <a class="myAnchor" style="color: rgba(255, 255, 255, 0.8);" href="${foundBackgroundInfo.user.links.html}?utm_source=moodflow&utm_medium=referral&utm_campaign=api-credit">${foundBackgroundInfo.user.name}</a> / <a style="color: rgba(255, 255, 255, 0.8);" class="myAnchor" href="https://unsplash.com/">Unsplash</a>`);
		}
	});

}
function getBackgroundAPI(frequencyEmitter) { // AJAX Unsplash API --> compressImageAndSave()
	// background image AJAX
	console.log('getBackgroundAPI + frequencyEmitter', frequencyEmitter);
	$.ajax({
		url: "https://api.unsplash.com/photos/random",
		type: 'get',
		async: true,
		dataType: "json",
		data: "client_id=29b43b6caaf7bde2a85ef2cfddfeaf1c1e920133c058394a7f8dad675b99921b&collections=281002",
		success: (response) => {
			console.log('AJAX Response: ', response);

            if (frequencyEmitter === 1) {
                $('#source_img').on('load', function() {
    				console.log('Image has loaded!');
    				compressImageAndSave(1);
    			}).attr('src', response.urls.raw);

                let backgroundInfo = response;
    			chrome.storage.local.set(backgroundInfo, () => {
    				// Notify that we saved.
    				console.log('backgroundInfo saved');
    				return;
    			});
                return;
            }

			// insert src into img compress it and saved compressed data
			$('#source_img').on('load', function() {
				console.log('Image has loaded!');
				compressImageAndSave();
			}).attr('src', response.urls.raw);


			let backgroundInfo = response;
			chrome.storage.local.set(backgroundInfo, () => {
				// Notify that we saved.
				console.log('backgroundInfo saved');
				return;
			});


			if (response.location === undefined) {
				$('#picLocation').html('Planet Earth');
				$('#picAuthor').html(`Photo: <a style="color: rgba(255, 255, 255, 0.8);" class="myAnchor" href="${response.user.links.html}?utm_source=moodflow&utm_medium=referral&utm_campaign=api-credit">${response.user.name}</a> / <a class="myAnchor" style="color: rgba(255, 255, 255, 0.8);" href="https://unsplash.com/">Unsplash</a>`);
			} else {
				$('#picLocation').html(response.location.title);
				$('#picAuthor').html(`Photo: <a class="myAnchor" style="color: rgba(255, 255, 255, 0.8);" href="${response.user.links.html}?utm_source=moodflow&utm_medium=referral&utm_campaign=api-credit">${response.user.name}</a> / <a style="color: rgba(255, 255, 255, 0.8);" class="myAnchor" href="https://unsplash.com/">Unsplash</a>`);
			}
		},
		error: () => {
			console.log('getPictureApi AJAX failed');
		}
	});
}
function compressImageAndSave(frequencyEmitter) {
	let source_img = document.getElementById("source_img");
	let compressedSRC;

	//An Integer from 0 to 100
	let quality = 60;
	// output file format (jpg || png)
	let output_format = 'jpg';
	//This function returns an Image Object
	compressedSRC = jic.compress(source_img, quality, output_format).src;

    // frequencyEmitter is 1 if this function is triggered by a chrome.alarm
    if (frequencyEmitter === 1) {

        savedBackground.dataURL = compressedSRC;

    	// save to chrome.storage
    	chrome.storage.local.set(savedBackground, function() {
    		// Notify that we saved.
    		console.log('dataURL was saved');
    	});

        return;
    }

	if (savedBackground.dataURL === undefined) {
		$('#background').on('load', function() {
			$('.spinnerContainer').fadeOut(2000);
		}).attr('src', compressedSRC);
	}

	savedBackground.dataURL = compressedSRC;

	// save to chrome.storage
	chrome.storage.local.set(savedBackground, () => {
		// Notify that we saved.
		console.log('dataURL was saved');
		return;
	});

} // works in tandem with getBackgroundAPI()
function changeBackgroundHandler() {
	// this function changes the background image 3 times per day depending on the current times
	let now = new Date();


}
function backgroundFrequency() {
	let changeFrequency = user.background.backgroundChangeFrequency;

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
	} else if (changeFrequency === 99) {
        console.log('changeFrequency', changeFrequency);
        chrome.alarms.create('backgroundCheck', { delayInMinutes: 0.5, periodInMinutes: 1 });
	}


	chrome.alarms.onAlarm.addListener(function() {
        //console.log('Alarm triggered');
        //getBackgroundAPI(1);
	});
}
// utilities
function typedjs() {
	$(".typed").typed({
		strings: [
			'this will take less than a minute...',
			'i promise!',
			'you know we are...^1000 arranging stuff',
			'very very complex stuff^1000',
			'you see how the color of the letters is changing?',
			'cool stuff... ^1000 right? :)',
			'i am so excited that i will get to know you in a few...',
			'for real i dont tell this to everybody',
			'just to you...^1000 i am such a romantic ',
			'almost finished loading!^1000 count to 10 and we will be done',
			'anytime now',
			'so close!^1000 ...for real now',
			'internet these days...',
			'and we are readyyy!'
		],
		typeSpeed: 20,
		startDelay: 3000,
		backDelay: 2000,
		fadeOut: true,
		fadeOutClass: 'typed-fade-out',
		fadeOutSpeed: 2000,
		showCursor: true,
		cursorChar: "|",
		callback: () => {

		}
	});
}
function validateEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}
function whichTransitionEvent() {
	var t,
		el = document.createElement("fakeelement");

	var transitions = {
		"transition": "transitionend",
		"OTransition": "oTransitionEnd",
		"MozTransition": "transitionend",
		"WebkitTransition": "webkitTransitionEnd"
	};

	for (t in transitions) {
		if (el.style[t] !== undefined) {
			return transitions[t];
		}
	}
}
function whichAnimationEvent() {
	var t,
		el = document.createElement("fakeelement");

	var animations = {
		"animation": "animationend",
		"OAnimation": "oAnimationEnd",
		"MozAnimation": "animationend",
		"WebkitAnimation": "webkitAnimationEnd"
	};

	for (t in animations) {
		if (el.style[t] !== undefined) {
			return animations[t];
		}
	}
}
function checkEmailLength() {
	var input = $('.emailInput').val();

	if (input.length >= 16) {
		$('.emailInput').css('font-size', '32px');
	}

	if (input.length >= 20) {
		console.log('longer then 20');
		$('.emailInput').css('font-size', '27px');
		return;
	}
}
function fillInformation() { // called after getting user
	$('.greeting').html(`Good day, ${user.name}.`);
}
function injectYTVideo() {
	var videos = ['https://www.youtube.com/embed/SuPLxQD4akQ?autoplay=1', 'https://www.youtube.com/embed/26U_seo0a1g?autoplay=1', 'https://www.youtube.com/embed/Yb-OYmHVchQ?autoplay=1', 'https://www.youtube.com/embed/K2bw52VjJLM?autoplay=1', 'https://www.youtube.com/embed/eRaTpTVTENU?autoplay=1', 'https://www.youtube.com/embed/2_fDhqRk_Ro?autoplay=1', 'https://www.youtube.com/embed/DvtxOzO6OAE?autoplay=1', 'https://www.youtube.com/embed/D_Vg4uyYwEk?autoplay=1',
		'https://www.youtube.com/embed/KHaooRlwtzI?autoplay=1', 'https://www.youtube.com/embed/lY7Mf6PzZyA?autoplay=1', 'https://www.youtube.com/embed/zCyB2DQFdA0?autoplay=1', 'https://www.youtube.com/embed/z1PSbDmV8Gw?autoplay=1', 'https://www.youtube.com/embed/H1sXTmaqRHU?autoplay=1'
	];


	let oneVid = videos[Math.floor(Math.random() * videos.length)];
	$('.myiframe').attr("src", oneVid);
}
// ------------------------- JQUERY DOM EVENTS LOGIC --------------------------
$(document).ready(() => {

	// on init: body and background fade in
	$('body, .background').fadeIn(800);

	// ------------------------ DASHBOARD LOGIC -----------------------------------
	// ***HEADER*** google searchbar animation and palceholder logic
	$('#placeholder').on('click', () => {
		$('.ion-ios-search-strong').css('transform', 'translateX(300px)');

		setTimeout(() => {
			if ($("#placeholder").is(":focus")) {
				$('#placeholder').attr("placeholder", "Google search");
			}
		}, 850);
	});
	$('#placeholder').focusout(() => {
		$('.ion-ios-search-strong').css('transform', 'translateX(0)');
		$('#placeholder').attr("placeholder", "");
		setTimeout(() => {
			$('#placeholder').attr("placeholder", "");
		}, 100);
		setTimeout(() => {
			$('#placeholder').attr("placeholder", "");
			$('#placeholder').val('');
			$('.ion-ios-search-strong').fadeIn(300);
		}, 310);
	});

	// ***HEADER*** date logic and format
	let day = moment().format('dddd'); // monday
	let monthDaynum = moment().format('MMMM Do'); // May 15th
	$('.date').html(`${day}, ${monthDaynum}`);

	// ***MAIN***

	// ***MOTIVATE LOGIC***
	$('#motivateButton').on('click', () => {
		injectYTVideo();
		$('.myiframe, .closeiframe').fadeIn(400);
	});
	$('.closeiframe').on('click', () => {
		$('.closeiframe, .myiframe').fadeOut(800, () => {
			$('.myiframe').attr('src', '');
		});
	});

	// ***REFLECT LOGIC***
	$('#reflectButton').on('click', () => {
		$('.dashboard').fadeOut(500, () => {
			$('.chart').fadeIn(500);
		});
	});





	// ***FOOTER*** logout popup fadeIn and fadeOut
	$('#logoutFadeIn').on('click', () => {
		$('.logoutpopup').fadeIn(300);

		$('.logoutpopup').mouseleave(() => {
			$('.logoutpopup').fadeOut(300);
		});
	});

	// ---------------------------- LOGIN LOGIC -----------------------------------
	// first time login message fade out and calling
	$('.darkenBackground, #firstTimeClose').on('click', () => {
		$('.darkenBackground, .welcomeMessage').fadeOut(500, () => {
			$('section.loginForm').fadeIn(500);
		});

	});

	// set background-color of checkboxes
	$('.control_indicator').on('click', function() {
		$(this).css('background-color', '#ffd700');
		$('.control-checkbox .control_indicator:after').css('display', 'block');
	});

	// preventDefault of form submition
	$('.welcomeForm').submit((e) => {
		e.preventDefault();
	});

	// ***defines var name*** handle login submit events
	$('.usernameInput').keypress((e) => {
		let input = $('.usernameInput').val();

		// if user presses 'Enter' and the input is not empty
		if (e.which == 13 && input !== '') {
			_name = $('.usernameInput').val();
			//used only to greet the user when asking for the email
			nameGreeting = _name.toLowerCase();
			$('.askEmail').html(`oh hey, ${nameGreeting}. <br> what is your <span class="highlight">email</span>?`);
			console.log(nameGreeting);
			// making sure the first letter is uppercase
			_name = _name.charAt(0).toUpperCase() + _name.slice(1);
			console.log(name);
			$('.usernameInput').css({
				'color': 'transparent',
				'border-bottom-color': 'white'
			});
			$('.askName, .usernameInput').fadeOut(500, () => {

				$('.askEmail, .emailInput').fadeIn(500);
				setTimeout(() => {
					$('.noEmail').fadeIn(500);
				}, 1000);
			});
		}
	});

	// resizes font size depending on email length
	$('.emailInput').on('keyup', () => {
		checkEmailLength();
	});
	$('.emailInput').focus(function() {
		let input = $(this).val();
		setInterval(() => {
			checkEmailLength();
		}, 500);
	});

	// check if email is valid using a regex and fade in askGender.
	$('.emailInput').keypress((e) => {
		let input = $('.emailInput').val();

		if (e.which == 13 && input !== '') {

			let validatedEmail = validateEmail(input);

			// if email is not valid give feedback to user
			if (validatedEmail === false) {
				// do animation and trigger shake feedback
				let animationEvent = whichAnimationEvent();
				$("input.emailInput").addClass("animated shake");
				$("input.emailInput").one(animationEvent,
					function(event) {
						// when animation finishes do
						$("input.emailInput").removeClass("animated shake");
						return;
					});
				// if email is valid save it into var and fade out
			} else if (validatedEmail === true) {

				_email = $('.emailInput').val();
				$('.askGender').html(`last question, ${nameGreeting}. <br> are you a <span class="highlight">guy</span> or a <span class="highlight">girl</span>?`);

				$('.emailInput').css({
					'color': 'transparent',
					'border-bottom-color': 'transparent'
				}).val('');
				$('.askEmail, .emailInput, .noEmail').fadeOut(500, () => {
					$('.askGender, .control_indicator').fadeIn(500, () => {
						$('.control_indicator').css('animation-play-state', 'running');
						setTimeout(() => {
							$('.noGender').fadeIn(500);
						}, 1500);
					});
				});
				return;
			}


		} else if (e.which == 13 && input === '') { // if empty shake

			let animationEvent = whichAnimationEvent();
			$("input.emailInput").addClass("animated shake");
			$("input.emailInput").one(animationEvent,
				function(event) {
					// when animation finishes do
					$("input.emailInput").removeClass("animated shake");
					return;
				});
		}
	});
	$('.noEmail').on('click', () => {
		_email = null;
		$('.askGender').html(`last question, ${nameGreeting}. <br> are you a <span class="highlight">guy</span> or a <span class="highlight">girl</span>?`);

		$('.askEmail, .emailInput, .noEmail').fadeOut(500, () => {
			$('.askGender, .control_indicator').fadeIn(500, () => {
				$('.control_indicator').css('animation-play-state', 'running');
			});
			setTimeout(() => {
				$('.noGender').fadeIn(500);
			}, 1500);
		});
	});

	// defining user gender depending on click
	$('.noGender').on('click', () => {
		_gender = null;
	});
	$('.guycheckbox').on('click', () => {
		_gender = 'male';
	});
	$('.girlcheckbox').on('click', () => {
		_gender = 'female';
	});

	// event after user choses gender or does not provide information
	$('.afterGender').on('click', () => {

		var savedUser = new User(_name, _email, _gender);

		chrome.storage.sync.set(savedUser, function() {
			console.log('user was saved');

			chrome.storage.sync.get(savedUser, function(foundUser) {
				user = foundUser;
				fillInformation();
				$('section.loginForm').fadeOut(500, () => {
					$('footer, .date, .logo, section.dashboard').fadeIn(2000);
				});
				return;
			});
		});
	});
});

// ------------------------------ BOOTSTRAP -----------------------------------
function bootstrapApp() {}
// --------------------------- DEFINING USER -----------------------------------
function User(name,
	email,
	gender,
	timezone,
	myLocation
    ) {
	this.name = name;
	this.email = email;
	this.gender = gender;
	this.timezone = timezone;
	this.location = myLocation;
	this.favoriteVideos = [];
	this.favoriteBackgrounds = [];
	this.id = null; // null until user goes premium
	this.searchbar = true;
	this.todolist = true;
	this.firstTimeLogin = true;
	this.firstTimeMeditating = true;
}
User.prototype.searchbarON = () => {
	this.searchbar = true;
};
User.prototype.searchbarOFF = () => {
	this.searchbar = false;
};
User.prototype.hasLoggedIn = () => {
	this.firstTimeLogin = false;
};
User.prototype.hasMeditated = () => {
	this.firstTimeMeditating = false;
};
let name, email, gender, timezone, myLocation;
// ------------------------------ FUNCTIONS -----------------------------------
function getBase64FromImageUrlAndSave(url) {
	var img = new Image();

	img.setAttribute('crossOrigin', 'anonymous');

	img.onload = function() {
		var canvas = document.createElement("canvas");
		canvas.width = this.width;
		canvas.height = this.height;

		var ctx = canvas.getContext("2d");
		ctx.drawImage(this, 0, 0);

		var dataURL = canvas.toDataURL("image/png");
		// save to chrome.storage
		chrome.storage.local.set({
			'imgDataUrl': dataURL
		}, () => {
			// Notify that we saved.
			console.log('dataURL was saved');
			base64ToImgAndDisplay();
		});
	};
	img.src = url;
}
function base64ToImgAndDisplay() {
	chrome.storage.local.get('imgDataUrl', function(imgInBase64) {
		console.log('Found img');
		console.log(imgInBase64);

		$('#background').attr('src', imgInBase64.imgDataUrl);

		//   var canvas = document.getElementById("c");
		//   var ctx = canvas.getContext("2d");
		//
		//   var image = new Image();
		//   image.onload = function() {
		//       ctx.drawImage(imgInBase64, 0, 0);
		//   };
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
// ----------------------------- ASYNC AJAX -----------------------------------
// background image AJAX
$.ajax({
	url: "https://api.unsplash.com/photos/random",
	type: 'get',
	dataType: "json",
	data: "client_id=29b43b6caaf7bde2a85ef2cfddfeaf1c1e920133c058394a7f8dad675b99921b&collections=281002",
	success: (response) => {
		console.log(response);
		//save to local storage
		$('#background').attr('src', response.urls.regular);

		//var url = response.urls.raw;
		//getBase64FromImageUrlAndSave(url);
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
// ------------------------- JQUERY DOM EVENTS LOGIC --------------------------
$(document).ready(() => {
	// on init: body and background fade in
	$('body, .background').fadeIn(1000);

	// google searchbar animation and palceholder logic
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

	// date logic and format
	let day = moment().format('dddd'); // monday
	let monthDaynum = moment().format('MMMM Do'); // May 15th
	$('.date').html(`${day}, ${monthDaynum}`);

	// first time login message fade out and calling
	$('.darkenBackground, #firstTimeClose').on('click', () => {
		$('.darkenBackground, .welcomeMessage').fadeOut(300);
		// call function that updates user heres
	});

	// logout popup fadeIn and fadeOut
	$('#logoutFadeIn').on('click', () => {
		$('.logoutpopup').fadeIn(300);

		$('.logoutpopup').mouseleave(() => {
			$('.logoutpopup').fadeOut(300);
		});
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
			name = $('.usernameInput').val();
			//used only to greet the user when asking for the email
			nameGreeting = name.toLowerCase();
			$('.askEmail').html(`oh hey, ${nameGreeting}. <br> what is your <span class="highlight">email</span>?`);
			console.log(nameGreeting);
			// making sure the first letter is uppercase
			name = name.charAt(0).toUpperCase() + name.slice(1);
			console.log(name);
			$('.usernameInput').css({'color': 'transparent', 'border-bottom-color': 'white'});
			$('.askName, .usernameInput').fadeOut(500, () => {

				$('.askEmail, .emailInput').fadeIn(600);
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

	// check if email is valid using a regex and fade in dashboard.
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

				email = $('.emailInput').val();
                $('.askGender').html(`last question, ${nameGreeting}. <br> are you a <span class="highlight">guy</span> or a <span class="highlight">girl</span>?`);

				$('.askEmail, .emailInput, .noEmail').fadeOut(500, () => {
                    $('.askGender, .guy, .girl').fadeIn(500);
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
		email = null;
		$('.askGender').html(`last question, ${nameGreeting}. <br> are you a <span class="highlight">guy</span> or a <span class="highlight">girl</span>?`);

    $('.askEmail, .emailInput, .noEmail').fadeOut(500, () => {
        $('.askGender, .guy, .girl').fadeIn(500);
    });
	});

});

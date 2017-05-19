// ------------------------------ BOOTSTRAP -----------------------------------
var user;
// start app handler
bootstrapApp();
function bootstrapApp() {
    var savedUser;
    chrome.storage.sync.get(savedUser, function(foundUser) {
        if (foundUser.name === undefined || '') {
            $('.logo, .date, footer, section.dashboard').css('display', 'none');
            $('section.welcomeMessage, .darkenBackground').css('display', 'flex');
            return;
        }

        user = foundUser;
        fillInformation();
        return;
    });
}
// --------------------------- DEFINING USER -----------------------------------
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
	this.favoriteBackgrounds = [];
	this.id = null; // null until user goes premium
	this.searchbar = true;
	this.todolist = true;
	this.firstTimeMeditating = true;
}
User.prototype.searchbarON  = () => {
	this.searchbar = true;
};
User.prototype.searchbarOFF = () => {
	this.searchbar = false;
};
User.prototype.hasMeditated = () => {
	this.firstTimeMeditating = false;
};
let _name, _email, _gender, _timezone, _myLocation; // var defined by user during form input
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
function fillInformation() { // called after getting user
    $('.greeting').html(`Good day, ${user.name}.`);
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

    // *** MOTIVATE LOGIC***
    $('#motivateButton').on('click', () => {
        $('.myiframe, .closeiframe').fadeIn(400);
    });
    $('.closeiframe').on('click', () => {
        $('.closeiframe, .myiframe').fadeOut(500);
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
			$('.usernameInput').css({'color': 'transparent', 'border-bottom-color': 'white'});
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

				$('.emailInput').css({'color': 'transparent', 'border-bottom-color': 'transparent'}).val('');
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

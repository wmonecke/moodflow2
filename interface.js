// ------------------------ BOOTRSTRAP APP ---------------------------------
// magic so that textarea focus works
if(location.search !== "?foo") {
    location.search = "?foo";
    throw new Error();  // load everything on the next page;                // stop execution on this page
}

var isOpen = false;
var user = {};
var savedBackground;
var _now = new Date();
var today = _now.getDate();
var myDataContainer = [];
var savedUser;


// start app handler
bootstrapApp();
function bootstrapApp() {

    chrome.storage.local.get(savedBackground, function(foundBackground) {
        savedBackground = foundBackground;

        if (savedBackground.dataURL === undefined || '') {
            console.log('NO BACKGROUND');
            $('body').css('display', 'block');
            $('.spinnerContainer').css('display', 'flex');
            getBackgroundAPI();
        } else {
            base64ToImgAndDisplay();
        }



        // get locally saved user and display
    	chrome.storage.sync.get(savedUser, function(foundUser) {

            // check if user exists, if not show login form.
    		if (foundUser.name === undefined || '') {
    			$('body, .background').fadeIn(800);
    			$('.logo, .date, footer, section.dashboard, section.googleSearch').css('display', 'none');
    			$('section.welcomeMessage, .darkenBackground').css('display', 'flex');
    			typedjs();
    			return;
    		}

    		user = foundUser;

    		// this function is in charge of displaying stuff in the dashboard
    		// for example it is in charge of displaying the users name, searchbar or quotes
            checkIfMoodsShouldReset();
            renderDashboard();
            renderNormalTodo();
    		//formatDataForChart();
    		return;
    	});


        return;
    });






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
	this.name              = name;
	this.email             = email;
	this.gender            = gender;
	this.timezone          = null;
	this.location          = null;
	this.favoriteVideos    = [];
	this.id                = null; // null until user goes premium
    this.hideButton        = false;
	this.searchbar         = true;
	this.todolist          = true;
    this.todolistStyle     = 'normal'; // 'normal' by default, user can change to kanban style
    this.currentMonth      = new Date().getMonth();
	this.firstMeditation   = true;
    this.leaveTodolistOpen = false;
    this.cleanMode         = false;
    this.leaveBackground   = false;
    this.todo              = {};
	this.background = {
		// times that a background should change in a day.
		// 3 is default. User can choose between 1,3,5,8,10,12,14.
		backgroundChangeFrequency: 3,

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
// ------------------------------ FUNCTIONS -----------------------------------
// handle backgroundImage
function base64ToImgAndDisplay() { // gets compressed base64 and backgroundImageInfo
	$('#background').on('load', function() {
		$('body, .background').fadeIn(400);
	}).attr('src', savedBackground.dataURL);

    if (savedBackground.location === undefined) {
        $('#picLocation').html('Planet Earth');
        $('#picAuthor').html(`Photo: <a style="color: rgba(255, 255, 255, 0.8);" class="myAnchor" href="${savedBackground.user.links.html}?utm_source=moodflow&utm_medium=referral&utm_campaign=api-credit">${savedBackground.user.name}</a> / <a class="myAnchor" style="color: rgba(255, 255, 255, 0.8);" href="https://unsplash.com/">Unsplash</a>`);
    } else {
        $('#picLocation').html(savedBackground.location.title);
        $('#picAuthor').html(`Photo: <a class="myAnchor" style="color: rgba(255, 255, 255, 0.8);" href="${savedBackground.user.links.html}?utm_source=moodflow&utm_medium=referral&utm_campaign=api-credit">${savedBackground.user.name}</a> / <a style="color: rgba(255, 255, 255, 0.8);" class="myAnchor" href="https://unsplash.com/">Unsplash</a>`);
    }
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
	let quality = 35;
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

} // works in tandem with getBackgroundAPI()	// this function changes the background image 3 times per day depending on the current times
// utilities
function startMeditation() { //fadesIn the meditation section

    function welcomeMessage() {

        ion.sound.play("relaxing");

        $("#welcomeMessage").typed({
            strings: [`Welcome, ${user.name}.`, "Since this is your first time here...^1000<br> I hereby welcome you warmly^1000 to the meditation center.", `Now, ${user.name}...^1000 Meditation can be a very powerful tool^1000 if used right.<br>^1000 It has been proven to be as effective as medication in the treatment of depression and bipolarity.`, `And if you thankfully do not suffer from those diseases,^1000<br> it channels your thoughts towards the potential that lies^500 within you.`,     `Meditation helps you reflect on the problems that you are currently facing in your life^1000<br>and makes it easier for you to find the solutions.`, "Together we can realize your full potential^1000<br>and gain control of your inner emotional well-being.", "Moreover, if you find inner peace^1000<br>it will positively reflect onto other aspects of your life.", "Relax^1000, focus on your breathing^1000<br>and firstly try to think about the things you are grateful in this life.<br>^1000", `Now... ^2000 Try syncing your breathing with the glow of the circle.<br>^1000 Let us start.^1000`],
            typeSpeed: 10,
            startDelay: 2000,
            backDelay: 2000,
            fadeOut: true,
            fadeOutClass: 'typed-fade-out',
            fadeOutSpeed: 1000,
            showCursor: true,
            cursorChar: "",
            callback: () => {
                let update = { firstMeditation: false };
                chrome.storage.sync.set(update, function() {
                    console.log('user was updated');
                });

                $('#welcomeMessage').fadeOut(500);
                $('.center').css('animation-play-state', 'paused');
                $('.center').css('animation-name', 'breathIn');
                $('.center').css('animation-play-state', 'running');

                let animationEvent = whichAnimationEvent();

				$('.center').one(animationEvent, function(event) {
                    $('.wellDone, .meditateIconContainer').fadeIn(2000);
				});
            }
        });
    }
    function alreadyMeditated() {

        ion.sound.play("relaxing");

        $("#hasMeditated").typed({
            strings: [`Welcome back, ${user.name}.`, `When meditating, try syncing your breathing with the glow of the circle.^1000`, `Also, try and make and effort to focus^1000<br> on the things that you are grateful for.^1000`, `Let us start.^2000`],
            typeSpeed: 10,
            startDelay: 2000,
            backDelay: 2000,
            fadeOut: true,
            fadeOutClass: 'typed-fade-out',
            fadeOutSpeed: 1000,
            showCursor: true,
            cursorChar: "",
            callback: () => {

                $('#hasMeditated').fadeOut(500);
                $('.center').css('animation-play-state', 'paused');
                $('.center').css('animation-name', 'breathIn');
                $('.center').css('animation-play-state', 'running');

                let animationEvent = whichAnimationEvent();

				$('.center').one(animationEvent, function(event) {
                    $('.wellDone, .meditateIconContainer').fadeIn(2000);
				});
            }
        });
    }

    $('section.meditate').css('display', 'flex');

    // handle warning and sponsor messages
    $('.warning').fadeIn(500);
    setTimeout(() => {
        $('.warning').fadeOut(500, () => {
            setTimeout(() => {
                $('.sponsor').fadeIn(500, () => {
                    setTimeout(() => {
                        $('.sponsor').fadeOut(500);
                    }, 4000);
                });
            }, 1000);
        });
    }, 4000);

    setTimeout(() => {
        $('.meditateContainer, .iconContainer, .iconContainerLeft').fadeIn(500, () => {
            $('.center').css({'animation-name': 'smallBreathIn', 'animation-play-state': 'running'});
        });

        $('.meditateContainer').css('display', 'flex');

        // depending on if the user has visited the meditation section before or not show welcomeMessage or alreadyMeditated()
        if (user.firstMeditation) {
            welcomeMessage();
        } else if (!user.firstMeditation) {
            alreadyMeditated();
        }
    }, 100);


}
function typedjs() {
	$(".typed").typed({
		strings: [
			'this will take less than a minute...',
			'we promise!',
            'you have to be connected to the internet for this to work',
			'we are cleaning up so it looks pixel-perfect',
			'...^1000 somebody really left a mess in there',
			'ok guys!^1000 hurry up, we have a customer waiting',
			'do not worry, the dashboard is almost ready',
			'in the meanwhile...^1500 do you see how the colors change?',
			'reaaally cool^3000',
			'ok guys we really gotta hurry up^1500',
			'you know I am not good at small talk',
			'anytime now...',
			'the final touches an^400n^400n^400d...',
			'the internet these days...^1500 damn it',
			'and we are readyyy!^5000',
            'if it has not loaded check your internet connection and re open a new tab'
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

    var _docHeight = (document.height !== undefined) ? document.height : document.body.offsetHeight;

    console.log('_docHeight', _docHeight);

    if (_docHeight >= 800) {

        if (input.length >= 16) {
            $('.emailInput').css('font-size', '4vh');
        }

        if (input.length >= 20) {
            console.log('longer then 20');
            $('.emailInput').css('font-size', '3vh');
            return;
        }
    } else {

        if (input.length >= 16) {
            $('.emailInput').css('font-size', '32px');
        }

        if (input.length >= 20) {
            console.log('longer then 20');
            $('.emailInput').css('font-size', '27px');
            return;
        }
    }

}
function formatDataForChart() {

	// this for loop figures out how many moods have been submitted for the current month
	for (var key in user) {

	 	if (user.hasOwnProperty(key)) {
			// convert string to number (fastest way for chrome)
			key = key*1;
			// filter out keys that are NOT numbers
			if (isNaN(key) === false) {
				// filter out keys that do not have a moodValue: not much sense displaying something that as no value to the user
				if (user[key].moodValue !== '') {
					//myArrayForCounting.push(user[key].moodValue);
					moodValue = user[key].moodValue*1;

                    let newObj  = { x: key, y: moodValue };

					myDataContainer.push(newObj);
				}
			}
		}
	}

    console.log('myDataContainer', myDataContainer);
	updateChart(myDataContainer);
}
function updateChart(array) {
    var currentIndex;
	// --------------------------- DEFINING CHART ---------------------------------
	let ctx = document.getElementById("myChart");
	let daysInCurrentMonth = new Date(_now.getFullYear(), _now.getMonth() + 1, 0).getDate();
    var _docHeight = (document.height !== undefined) ? document.height : document.body.offsetHeight;

    if (_docHeight >= 800) {
        console.log('creating chart for 800px and more');

        let myChart = new Chart(ctx, {
    		type: 'line',
    		data: {
    			datasets: [{
    				data: array,
    				backgroundColor: 'rgba(247,218,13, 0.5)',
    				borderColor: 'gold',
            pointRadius: 8,
            pointHoverRadius: 10,
    				pointBackgroundColor: 'rgba(255,255,255,1)',
    				pointBorderColor: '#fff',
    				pointHoverBackgroundColor: 'rgba(0,0,0,1)',
    				pointHoverBorderColor: 'black'
    			}]
    		},
    		options: {
    			maintainAspectRatio: false,
    			responsive: true,
    			animation: {
    				duration: 400,
    				easing: 'easeOutQuart'
    			},
    			tooltips: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0)',
    		bodyFontSize: 20,
    		titleFontSize: 14,
    		footerFontSize: 20,
    	    callbacks: {
    			title: (tooltipItem, data) => {

    				let now = new Date();
    				let myArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    				let currentMonth = now.getMonth();
                    setTimeout(() => {
                        $('#displayTooltipTitle').html(myArray[currentMonth] + ', ' + tooltipItem[0].xLabel);
                    }, 250);
    				//return myArray[currentMonth] + ', ' + tooltipItem[0].xLabel;

    			},
    			beforeLabel: (tooltipItems, data) => {
                    // make title and header invisble
                    $('.yourMoodflow').addClass('makeSpanTransparent');
                    $('div.headerContainer, footer').fadeOut(500);
                    // fadeIn Container
                    $('div.tooltipContainer').fadeIn(1000);

                    let displayComment = $('#displayTooltipComment');
                    let newIndex = tooltipItems.xLabel;

                    // check if the current point that is hovered on is the same one or a different one
                    if (newIndex !== currentIndex) {
                        console.log('changed node');

                        $('#displayTooltipTitle, #displayTooltipComment, .moodHighlight, #displayTooltipMoodvalue').css({'color': 'transparent', 'text-shadow': '0 0 5px rgba(255,255,255,0.1)'});

                        let comment = user[tooltipItems.xLabel.toString()].moodComment;

                        comment = comment.substr(0, 1).toUpperCase() + comment.substr(1);

                        setTimeout(() => {
                            displayComment.html(comment);
                        }, 250);
                        setTimeout(() => {
                            $('#displayTooltipTitle, #displayTooltipComment, #displayTooltipMoodvalue').css({'color': 'white', 'text-shadow': 'none'});
                            $('.moodHighlight').css({'color': 'gold', 'text-shadow': 'none'});
                        }, 500);

                        currentIndex = tooltipItems.xLabel;
                    }
                    //return ['', comment, ''];
    			    },
    			    label: (tooltipItems, data) => {
                        setTimeout(() => {

                            $('.moodHighlight').html(tooltipItems.yLabel);
                        }, 250);


                    //return 'my mood: ' + tooltipItems.yLabel + ' / 10';
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
                            fontSize: 25,
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

    } else {
    	let myChart = new Chart(ctx, {
    		type: 'line',
    		data: {
    			datasets: [{
    				data: array,
    				backgroundColor: 'rgba(247,218,13, 0.5)',
    				borderColor: 'gold',
            pointRadius: 6,
            pointHoverRadius: 10,
    				pointBackgroundColor: 'rgba(255,255,255,1)',
    				pointBorderColor: '#fff',
    				pointHoverBackgroundColor: 'rgba(0,0,0,1)',
    				pointHoverBorderColor: 'black'
    			}]
    		},
    		options: {
    			maintainAspectRatio: false,
    			responsive: true,
    			animation: {
    				duration: 400,
    				easing: 'easeOutQuart'
    			},
    			tooltips: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0)',
    		bodyFontSize: 14,
    		titleFontSize: 14,
    		footerFontSize: 12,
    	    callbacks: {
    			title: (tooltipItem, data) => {

    				let now = new Date();
    				let myArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    				let currentMonth = now.getMonth();
                    setTimeout(() => {
                        $('#displayTooltipTitle').html(myArray[currentMonth] + ', ' + tooltipItem[0].xLabel);
                    }, 250);
    				//return myArray[currentMonth] + ', ' + tooltipItem[0].xLabel;

    			},
    			beforeLabel: (tooltipItems, data) => {
                    // make title and header invisble
                    $('.yourMoodflow').addClass('makeSpanTransparent');
                    $('div.headerContainer, footer').fadeOut(500);
                    // fadeIn Container
                    $('div.tooltipContainer').fadeIn(1000);

                    let displayComment = $('#displayTooltipComment');
                    let newIndex = tooltipItems.xLabel;

                    // check if the current point that is hovered on is the same one or a different one
                    if (newIndex !== currentIndex) {
                        console.log('changed node');

                        $('#displayTooltipTitle, #displayTooltipComment, .moodHighlight, #displayTooltipMoodvalue').css({'color': 'transparent', 'text-shadow': '0 0 5px rgba(255,255,255,0.1)'});

                        let comment = user[tooltipItems.xLabel.toString()].moodComment;

                        comment = comment.substr(0, 1).toUpperCase() + comment.substr(1);

                        setTimeout(() => {
                            displayComment.html(comment);
                        }, 250);
                        setTimeout(() => {
                            $('#displayTooltipTitle, #displayTooltipComment, #displayTooltipMoodvalue').css({'color': 'white', 'text-shadow': 'none'});
                            $('.moodHighlight').css({'color': 'gold', 'text-shadow': 'none'});
                        }, 500);

                        currentIndex = tooltipItems.xLabel;
                    }
                    //return ['', comment, ''];
    			    },
    			    label: (tooltipItems, data) => {
                        setTimeout(() => {

                            $('.moodHighlight').html(tooltipItems.yLabel);
                        }, 250);


                    //return 'my mood: ' + tooltipItems.yLabel + ' / 10';
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
    }
}
function saveTodo(input) {
    if (user.todo[1] === undefined) {
        console.log('this is the first todo eva');

        user.todo[1] = input;

        chrome.storage.sync.set(user, function() {
            console.log('saved a new todo');
            console.log('user withing saveTodo()', user);
        });

        return 1;
    }

    // loop once through whole object to save the last key in the var todoKey
    for (var todoKey in user.todo) { }

    // last key is saved in todoKey and we convert it into a number
    todoKey = todoKey*1;

    let keyToBeSaved = todoKey + 1;

    user.todo[keyToBeSaved] = input;

    chrome.storage.sync.set(user, function() {
        console.log('saved a new todo');
    });

    return keyToBeSaved;
}
function renderNormalTodo() { // being called within render dashboard

    if (user.leaveTodolistOpen) {
        $('section.todoList').css('display', 'block');
        isOpen = true;
    }

    if ($.isEmptyObject(user.todo)) {
        console.log('obejct is empty');

        if ($('#todoInput').length ) {
            console.log('bruh there is one there already');
            return;
        }

        let myTodoTemplate = `
            <div class="oneTodoTemplate attached">
                <textarea id="todoInput" name="name" placeholder="what shall be done?" rows="1" cols="80"></textarea>
            </div> `;

        $('.todosContainer').append(myTodoTemplate);
        $('.attached').css('display', 'block');
        return;
    }

    for (let key in user.todo) {
        // transform objects JSON key into a number, so it can be inserted into the id
        let keyAsANumber = key*1;

        let myTodo = `
            <div class="oneTodo" id="${keyAsANumber}">
                <div class="todoText">${user.todo[key]}</div>
                <span class="eraseTodo">
                    <i class="icon ion-ios-close-outline"></i>
                </span>
            </div>`;

        $('.todosContainer').append(myTodo);
    }
}
function checkIfMoodsShouldReset() { // this function checks if is the end of the month. if it is it resets the moods
    let currentMonth = new Date();
    currentMonth = currentMonth.getMonth();

    let usersMonth = user.currentMonth;

    if (currentMonth === usersMonth) {
        console.log('no changes to be done');
        return;
    }

    console.log('time to reset');

    for (var key in user) {

	 	if (user.hasOwnProperty(key)) {

			// convert string to number (fastest way for chrome)
			key = key*1;

			// filter out keys that are NOT numbers
			if (isNaN(key) === false) {

                // convert back to string so key can be removed
                let stringKey = key.toString();

                delete user[stringKey];
			}
		}
	}

    let moodContainer = {
        1: {
            moodComment: "",
            moodValue: ""
        },
        2: {
            moodComment: "",
            moodValue: ""
        },
        3: {
            moodComment: "",
            moodValue: ""
        },
        4: {
            moodComment: "",
            moodValue: ""
        },
        5: {
            moodComment: "",
            moodValue: ""
        },
        6: {
            moodComment: "",
            moodValue: ""
        },
        7: {
            moodComment: "",
            moodValue: ""
        },
        8: {
            moodComment: "",
            moodValue: ""
        },
        9: {
            moodComment: "",
            moodValue: ""
        },
        10: {
            moodComment: "",
            moodValue: ""
        },
        11: {
            moodComment: "",
            moodValue: ""
        },
        12: {
            moodComment: "",
            moodValue: ""
        },
        13: {
            moodComment: "",
            moodValue: ""
        },
        14: {
            moodComment: "",
            moodValue: ""
        },
        15: {
            moodComment: "",
            moodValue: ""
        },
        16: {
            moodComment: "",
            moodValue: ""
        },
        17: {
            moodComment: "",
            moodValue: ""
        },
        18: {
            moodComment: "",
            moodValue: ""
        },
        19: {
            moodComment: "",
            moodValue: ""
        },
        20: {
            moodComment: "",
            moodValue: ""
        },
        21: {
            moodComment: "",
            moodValue: ""
        },
        22: {
            moodComment: "",
            moodValue: ""
        },
        23: {
            moodComment: "",
            moodValue: ""
        },
        24: {
            moodComment: "",
            moodValue: ""
        },
        25: {
            moodComment: "",
            moodValue: ""
        },
        26: {
            moodComment: "",
            moodValue: ""
        },
        27: {
            moodComment: "",
            moodValue: ""
        },
        28: {
            moodComment: "",
            moodValue: ""
        },
        29: {
            moodComment: "",
            moodValue: ""
        },
        30: {
            moodComment: "",
            moodValue: ""
        },
        31: {
            moodComment: "",
            moodValue: ""
        },
    };

    chrome.storage.sync.set(moodContainer, function() {

        chrome.storage.sync.get(savedUser, function(foundUser) {
            console.log(foundUser);

            user = foundUser;
            formatDataForChart();
        });
    });


}
// called after getting user
function renderDashboard(emitter) {

    chrome.storage.sync.get(user, function(foundUser){
        var skip;

        user = foundUser;

        $('.greeting').html(`Good day, ${user.name}.`);

        let todayAsAString = today.toString();

        if (user[todayAsAString] === undefined) {
            console.log('undefined');
        } else if (user[todayAsAString].moodValue === '' || undefined) {
            console.log('user[todayAsAString] in hereeee!!!');
            $('section.moodInput').css('display', 'block');
            $('section.dashboard').css('display', 'none');

            skip = true;
        }

        // background frequency
        let frequencyNumber = user.background.backgroundChangeFrequency;

        // if emitter === 1 then function jis being called after user has signed up
        if (emitter === 1) {
            $('.googleSearch').fadeIn(2000);
            $('#frequencyNumber').html('every 8 hours');
            $('#reflectButton').css('display', 'none');
            isOpen = false;
            return;
        }

        // searchbar option
        if (user.searchbar === true) {
            $('.googleSearch').css('display', 'block');
            $('input.searchbar').attr('checked', true);
        } else if (user.searchbar === false) {
            $('.googleSearch').css('display', 'none');
            $('input.searchbar').attr('checked', false);
        }

        // todolist option
        if (user.todolist === true) {
            $('section.todoListButton').css('display', 'block');
            $('input.todolist').attr('checked', true);
        } else if (user.todolist === false) {
            $('section.todoListButton').css('display', 'none');
            $('input.todolist').attr('checked', false);
        }

        // clean mode
        if (user.cleanMode === true) {
            $('section.dashboard').css('display', 'none');
            $('section.landscapeButtons').css('display', 'flex');
            $('input.cleanMode').attr('checked', true);
        } else if (user.cleanMode === false) {
            $('input.cleanMode').attr('checked', false);
            $('section.dashboard').css('display', 'block');

            if (skip === true) {
                $('section.dashboard').css('display', 'none');
            }
        }

        // leave Background option
        if (user.leaveBackground === true) {
            $('#leaveBackgroundOn').attr('checked', true);

            $('.backgroundFrequencyContainer').css({
                'text-decoration': 'line-through',
                'color': 'rgba(197,197,197,0.5)',
                'pointer-events': 'none'
            });
        } else if (user.searchbar === false) {
            $('#leaveBackgroundOn').attr('checked', false);
        }

        // frequency in options menu
        switch(frequencyNumber) {
            case 1:
            $('#frequencyNumber').html('once a day');
            break;
            case 3:
            $('#frequencyNumber').html('every 8 hours');
            break;
            case 5:
            $('#frequencyNumber').html('every 5 hours');
            break;
            case 8:
            $('#frequencyNumber').html('every 3 hours');
            break;
            case 12:
            $('#frequencyNumber').html('every 2 hours');
            break;
            case 24:
            $('#frequencyNumber').html('every hour');
            break;
            case 48:
            $('#frequencyNumber').html('every 30 minutes');
            break;
            case 96:
            $('#frequencyNumber').html('every 15 minutes');
            break;
            default:

        }


        // users name in moodflow input
        $('.moodInputGreeting').html(`Good day, ${user.name}.`);
        formatDataForChart();
    });
}
function injectYTVideo() {
	let online = window.navigator.onLine;

	var videos = ['https://www.youtube.com/embed/SuPLxQD4akQ?autoplay=1', 'https://www.youtube.com/embed/26U_seo0a1g?autoplay=1', 'https://www.youtube.com/embed/Yb-OYmHVchQ?autoplay=1', 'https://www.youtube.com/embed/K2bw52VjJLM?autoplay=1', 'https://www.youtube.com/embed/eRaTpTVTENU?autoplay=1', 'https://www.youtube.com/embed/2_fDhqRk_Ro?autoplay=1', 'https://www.youtube.com/embed/DvtxOzO6OAE?autoplay=1', 'https://www.youtube.com/embed/D_Vg4uyYwEk?autoplay=1',
		'https://www.youtube.com/embed/KHaooRlwtzI?autoplay=1', 'https://www.youtube.com/embed/lY7Mf6PzZyA?autoplay=1', 'https://www.youtube.com/embed/zCyB2DQFdA0?autoplay=1', 'https://www.youtube.com/embed/z1PSbDmV8Gw?autoplay=1', 'https://www.youtube.com/embed/H1sXTmaqRHU?autoplay=1'
	];

	if (online) {
		$('.myQuote').fadeIn(2000);
		setTimeout(() => {
				$('.myQuote').fadeOut(500);
		}, 7000);


		let oneVid = videos[Math.floor(Math.random() * videos.length)];
		$('.myiframe').attr("src", oneVid);
	} else {
		$('.notOnline').html(`${user.name}, it appears that you are currently not online.<br>Check your internet connection and try again.`).fadeIn(500).css('display', 'flex');

		setTimeout(() => {
			$('.notOnline, .closeiframe, .myiframe').fadeOut(500);

			$('.headerContainer, footer').fadeIn(500);
		}, 4000);
	}
}
// ------------------------- JQUERY DOM EVENTS LOGIC --------------------------
$(document).ready(() => {
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
    let now = new Date();
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    var day = days[ now.getDay() ];
    var dayNum = now.getDay();
    var monthDaynum = months[ now.getMonth() ];
	$('.date').html(`${day}, ${monthDaynum} ${dayNum}`);

    // ---------------------- 3 MAIN BUTTONS LOGIC ----------------------------

	// ***MOTIVATE LOGIC***
	$('#motivateButton, #motivateButton2').on('click', () => {

        $('.headerContainer, footer').fadeOut(500);
        $('section.todoList').fadeOut(500);
		injectYTVideo();
		$('.myiframe, .closeiframe').fadeIn(400);
	});
	$('.closeiframe').on('click', () => {
		$('.closeiframe, .myiframe').fadeOut(800, () => {
			$('.myiframe').attr('src', '');
            $('.headerContainer, footer').fadeIn(500);

            // check if todo list was open or closed
            if (isOpen) {
                $('section.todoList').fadeIn(600);
            }
		});
	});

	// ***REFLECT LOGIC***
	$('#reflectButton, #reflectButton2').on('click', () => {
        $('section.todoList').fadeOut(500);
        $('.tooltipContainer').css('display', 'none');
		$('.dashboard').fadeOut(500, () => {
			$('.chart').fadeIn(500);
		});
	});

	// ***MEDITATE LOGIC***
    $('#meditateButton, #meditateButton2').on('click', () => {
        $('.transitionContainer').css('display', 'block');
        $('.eyeClosing').css('box-shadow', 'inset 0vw 0vw 0vw 0vw transparent');

        ion.sound({
            sounds: [
                {
                    name: "relaxing",
                    volume: 1,
                    preload: true
                }
            ],
            volume: 0.7,
            path: "./sounds/",
            preload: true
        });

        setTimeout(() => {
            let myTransitionEvent = whichTransitionEvent();
            $('.eyeClosing').css('box-shadow', 'inset 0vw 0vw 4vw 100vw black'); //.css('transform', 'scale(1.2,1.2) translate(-25%, -27%)').

            $('.eyeClosing').one(myTransitionEvent, function(event) {
                // when transition finishes do
                startMeditation();
                $('.transitionContainer').css('display', 'none');
                $('.eyeClosing').css('box-shadow', 'inset 0vw 0vw 0vw 0vw transparent');
                return;
            });
        }, 50);
    });

	// ***FOOTER*** logout popup fadeIn and fadeOut
	$('#logoutFadeIn').on('click', () => {
        $('section.todoList').fadeOut(100);

		$('.logoutpopup').fadeIn(300);

		$('.logoutpopup').mouseleave(() => {
			$('.logoutpopup').fadeOut(300);

            if (isOpen) {
                $('section.todoList').fadeIn(300);
            }
		});
	});

    // ------------------------- DOM LOGIN LOGIC ------------------------------
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

			// making sure the first letter is uppercase
			_name = _name.charAt(0).toUpperCase() + _name.slice(1);

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
        var moodContainer = {
            1: {
                moodComment: "",
                moodValue: ""
            },
            2: {
                moodComment: "",
                moodValue: ""
            },
            3: {
                moodComment: "",
                moodValue: ""
            },
            4: {
                moodComment: "",
                moodValue: ""
            },
            5: {
                moodComment: "",
                moodValue: ""
            },
            6: {
                moodComment: "",
                moodValue: ""
            },
            7: {
                moodComment: "",
                moodValue: ""
            },
            8: {
                moodComment: "",
                moodValue: ""
            },
            9: {
                moodComment: "",
                moodValue: ""
            },
            10: {
                moodComment: "",
                moodValue: ""
            },
            11: {
                moodComment: "",
                moodValue: ""
            },
            12: {
                moodComment: "",
                moodValue: ""
            },
            13: {
                moodComment: "",
                moodValue: ""
            },
            14: {
                moodComment: "",
                moodValue: ""
            },
            15: {
                moodComment: "",
                moodValue: ""
            },
            16: {
                moodComment: "",
                moodValue: ""
            },
            17: {
                moodComment: "",
                moodValue: ""
            },
            18: {
                moodComment: "",
                moodValue: ""
            },
            19: {
                moodComment: "",
                moodValue: ""
            },
            20: {
                moodComment: "",
                moodValue: ""
            },
            21: {
                moodComment: "",
                moodValue: ""
            },
            22: {
                moodComment: "",
                moodValue: ""
            },
            23: {
                moodComment: "",
                moodValue: ""
            },
            24: {
                moodComment: "",
                moodValue: ""
            },
            25: {
                moodComment: "",
                moodValue: ""
            },
            26: {
                moodComment: "",
                moodValue: ""
            },
            27: {
                moodComment: "",
                moodValue: ""
            },
            28: {
                moodComment: "",
                moodValue: ""
            },
            29: {
                moodComment: "",
                moodValue: ""
            },
            30: {
                moodComment: "",
                moodValue: ""
            },
            31: {
                moodComment: "",
                moodValue: ""
            },
        };


		chrome.storage.sync.set(savedUser, function() {
			console.log('user was saved');

            chrome.storage.sync.set(moodContainer, function() {
                console.log('moodContainer was saved');

                chrome.alarms.create('backgroundCheck', {
    				delayInMinutes: 480,
    				periodInMinutes: 480
    			});

                chrome.storage.sync.get(savedUser, function(foundUser) {
                    console.log(foundUser);
                    user = foundUser;

                    console.log(user);

                    renderDashboard(1);

                    // fadeOut login section and fadeIn dashboard
                    $('section.loginForm').fadeOut(500, () => {
                        $('footer, .googleSearch, .date, .logo, section.dashboard').fadeIn(2000);
                    });
                    return;
                });
            });
		});
	});

    // ------------------------ DOM MOODINPUT LOGIC -------------------------------
    // realtime moodValue updating and continueButton fadein
    let currentDay;
    let mood;
    let comment;

    $('#moodValue').mousemove(function() {
        $('.showInputValue').text($('#moodValue').val());
        setTimeout(() => {
            $('.continueButton').fadeIn(400);
        }, 200);
    });

    $('.continueButton').on('click', function() {
        currentDay = _now.getDate();
        mood = $('#moodValue').val();

        // here we use bracket notation so that we access the key dynamically
        user[currentDay].moodValue = mood;

        $('div.moodValueContainer').fadeOut(500, () => {
            $('div.commentValueContainer').fadeIn(500);
        });
    });

    $('.commentInput').focus(function() {

        var _docHeight = (document.height !== undefined) ? document.height : document.body.offsetHeight;

        if (_docHeight >= 800) {
            $('.commentInput').css('width', '34vh');
            $('.skipButton').css('left', '14vh');
            console.log('bigger than 800');
        } else {
            console.log('smaller than 800');
            $('.commentInput').css('width', '350px');
            $('.skipButton').css('left', '140px');
        }



        setTimeout(() => {
            $('.submitButton').fadeIn(500);
        }, 300);
    });
    $('.commentInput').on('keyup', () => {
        let text = $('.commentInput').val();

        if (text.length >= 28) {
            $('.commentInput').css('height', '68px');
        }

        if (text.length >= 70) {
            $('.commentInput').css('height', '102px');
        }

        if (text.length >= 100) {
            $('.commentInput').css('height', '140px');
            return;
        }
    });

    $('.submitButton').on('click', function() {
        comment = $('.commentInput').val();

        user[currentDay].moodComment = comment;
    });
    $('.skipButton').on('click', function() {
        user[currentDay].moodComment = '';
    });

    $('.statsFadeIn').on('click', function() {
        chrome.storage.sync.set(user, function() {
            chrome.storage.sync.get(user, function(foundUser) {
                user = foundUser;
                console.log('new user', user);
                formatDataForChart();
                $('section.moodInput').fadeOut(500, () => {
                    $('section.chart').fadeIn(500);
                });
            });
        });
    });

    // ------------------------- DOM CHARTJS SECTION ------------------------------

    $('.iconContainer').on('click', function() {
        $('section.chart').fadeOut(500, () => {

            $('.yourMoodflow').removeClass('makeSpanTransparent');

            console.log('user.cleanMode', user.cleanMode);

            if (user.cleanMode === false) {
                $('section.dashboard').fadeIn(500);
            }

            $('div.headerContainer, footer').fadeIn(500);


            if (isOpen) {
                $('section.todoList').fadeIn(300);
            }

            renderDashboard();
        });
    });

    // ------------------------- DOM OPTIONS LOGIC --------------------------------
	// searchbar
	$('input.searchbar').on('click', function() {
		let checked = $(this).prop('checked');

		if (checked === true) {
			$('section.googleSearch').fadeIn(500);

			chrome.storage.sync.set({ "searchbar": true }, function() {
				console.log('searchbar to true');
			});
		} else if (checked === false) {
			$('section.googleSearch').fadeOut(500);

			chrome.storage.sync.set({ "searchbar": false }, function() {
				console.log('searchbar to false');
			});
		}
	});

    // todolist
    $('input.todolist').on('click', function() {
		let checked = $(this).prop('checked');

        console.log('checked', checked);

		if (checked === true) {
			$('section.todoListButton').fadeIn(500);
            isOpen = false;

			chrome.storage.sync.set({ "todolist": true }, function() {
				console.log('todolist to true');
			});
		} else if (checked === false) {
			$('section.todoListButton, section.todoList').fadeOut(500);
            isOpen = false;

			chrome.storage.sync.set({ "todolist": false, "leaveTodolistOpen": false }, function() {
				console.log('searchbar to false');
			});
		}
	});

    // clean mode
    $('input#superCleanMode').on('click', function() {
        let checked = $(this).prop('checked');

        if (checked === true) {

            $('section.dashboard').fadeOut(500);
            $('section.landscapeButtons').fadeIn(500).css('display', 'flex');

			chrome.storage.sync.set({ "cleanMode": true }, function() {
				console.log('cleanMode to true');
			});
		} else if (checked === false) {

            $('section.dashboard').fadeIn(500);
            $('section.landscapeButtons').fadeOut(500);


			chrome.storage.sync.set({ "cleanMode": false }, function() {
				console.log('cleanMode to false');
			});
		}
    });

	// background change frequency
	$('#moreBackground').on('click', function() {
		// 3 is default when user log ins for the first time
		let frequency = $('#frequencyNumber').html();

		switch(frequency) {
            case 'once a day':

                user.background.backgroundChangeFrequency = 3;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('every 8 hours');
                });
                break;

            case 'every 8 hours':

                user.background.backgroundChangeFrequency = 5;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('every 5 hours');
                });
                break;

            case 'every 5 hours':

                user.background.backgroundChangeFrequency = 8;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('every 3 hours');
                });
                break;

            case 'every 3 hours':

                user.background.backgroundChangeFrequency = 12;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('every 2 hours');
                });
                break;

            case 'every 2 hours':

                user.background.backgroundChangeFrequency = 24;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('every hour');
                });
                break;

            case 'every hour':

                user.background.backgroundChangeFrequency = 48;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('every 30 minutes');
                });
                break;

            case 'every 30 minutes':

                user.background.backgroundChangeFrequency = 96;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('every 15 minutes');
                });
                break;

            case 'every 15 minutes':

                user.background.backgroundChangeFrequency = 96;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('every 15 minutes');
                });
                break;

            default:

        }
	});
    $('#lessBackground').on('click', function() {
        // 3 is default when user log ins for the first time
        let frequency = $('#frequencyNumber').html();

        switch(frequency) {
            case 'once a day':

                user.background.backgroundChangeFrequency = 1;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('once a day');
                });
                break;

            case 'every 8 hours':

                user.background.backgroundChangeFrequency = 1;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('once a day');
                });
                break;

            case 'every 5 hours':

                user.background.backgroundChangeFrequency = 3;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('every 8 hours');
                });
                break;

            case 'every 3 hours':

                user.background.backgroundChangeFrequency = 5;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('every 5 hours');
                });
                break;

            case 'every 2 hours':

                user.background.backgroundChangeFrequency = 8;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('every 3 hours');
                });
                break;

            case 'every hour':

                user.background.backgroundChangeFrequency = 12;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('every 2 hours');
                });
                break;

            case 'every 30 minutes':

                user.background.backgroundChangeFrequency = 24;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('every hour');
                });
                break;

            case 'every 15 minutes':

                user.background.backgroundChangeFrequency = 48;
                chrome.storage.sync.set(user, function() {
                    $('#frequencyNumber').html('every 30 minutes');
                });
                break;

            default:

        }
    });

    // log out button
    $('.logoutContainer').on('click', function() {
        if(confirm('All your data will be lost. Are you sure?')) {
            chrome.storage.local.clear(function () {
                chrome.storage.sync.clear(function() {
                    $('section.dashboard').fadeOut(500, () => {
                        chrome.runtime.reload();
                    });
                });
            });
        }
    });

    // leave current Background on
    $('#leaveBackgroundOn').on('click', function() {
        if (user.leaveBackground) {
            let update = { leaveBackground: false};
            chrome.storage.sync.set(update, function() {
                console.log('now false');

                $('.backgroundFrequencyContainer').css({
                    'text-decoration': 'none',
                    'color': 'white',
                    'pointer-events': 'auto'
                });
                chrome.storage.sync.get(user, function(foundUser) {
                    user = foundUser;
                });
            });

        } else if (!user.leaveBackground) {

            let update2 = { leaveBackground: true};
            chrome.storage.sync.set(update2, function() {
                console.log('now true');

                $('.backgroundFrequencyContainer').css({
                    'text-decoration': 'line-through',
                    'color': 'rgba(197,197,197,0.5)',
                    'pointer-events': 'none'
                });

                chrome.storage.sync.get(user, function(foundUser) {
                    user = foundUser;
                });
            });
        }
    });

    // ----------------------- DOM TO-DO LIST LOGIC -------------------------------

    $('#openTodolist').on('click', () => {
        $('.logoutpopup').fadeOut(300);
        console.log('isOpen on click:', isOpen);

        if (isOpen === undefined) {
            console.log('isOpen was undeinfed, now in that if statement');
            isOpen = false;

            $('section.todoList').fadeIn(100);

            if ($('#todoInput').length ) {
                console.log('bruh there is one there already');
                return;
            }

            let myTodoTemplate = `
                <div class="oneTodoTemplate attached">
                    <textarea id="todoInput" name="name" placeholder="what shall be done?" rows="1" cols="80"></textarea>
                </div> `;

            $('.todosContainer').append(myTodoTemplate);

            $('.attached').fadeIn(400, () => {
                $('#todoInput').focus();
            });

            return;
        }

        if (isOpen === false) {
            console.log('now openinig');
            $('section.todoList').fadeIn(100);
            $('#todoInput').focus();

            update = { leaveTodolistOpen: true };

            chrome.storage.sync.set(update, function() {
                console.log('successful update');
                isOpen = true;
            });

        } else if (isOpen === true) {
            console.log('now closing');
            $('section.todoList').fadeOut(100);

            update = { leaveTodolistOpen: false };

            chrome.storage.sync.set(update, function() {
                console.log('successful update');
                isOpen = false;
            });
        }
    });
    // on keypress save and append child
    // how to attach events to dynamically added html?
    // attach an 'on-event' to the PARENT of the child that is going to trigger it.
    // the second param after the event name, in this case keydown will be the one that will be referenced
    // in other words if we use the 'this' keyword within the function it will refer to
    // that second parameter.
    $('.todosContainer').on('keydown', '#todoInput', function(e) {
        let unformattedInput = $(this).val();

        // makin the first letter uppercase
        let input = unformattedInput.charAt(0).toUpperCase() + unformattedInput.slice(1);

        // if user presses enter: stop line break and save to chrome.storage
        if (e.which === 13 && input !== '') {
            event.preventDefault();

            let todoID = saveTodo(input);

            console.log('todoID', todoID);

            let myTodo = `
                <div class="oneTodo" id="${todoID}">
                    <div class="todoText"></div>
                    <span class="eraseTodo">
                        <i class="icon ion-ios-close-outline"></i>
                    </span>
                </div>`;

            $('.todosContainer').append(myTodo);
            $(`#${todoID} > .todoText`).html(input);

            $('#todoInput').val('');
            $('.oneTodoTemplate').remove();
        }
    });

    // fade in  and fade out erase button
    $('.todosContainer').on('mouseenter', '.oneTodo', function () {
        $(this).find('.eraseTodo').fadeIn(200);
    });
    $('.todosContainer').on('mouseleave', '.oneTodo', function () {
        $(this).find('.eraseTodo').fadeOut(200);
    });

    // removing an item from the todo list
    $('.todosContainer').on('click', '.ion-ios-close-outline', function () {
        let idToRemove = $(this).closest('.oneTodo').attr('id');

        console.log('user before getting into chrome.storage', user);

        chrome.storage.sync.get(user, (foundUser) => {
            // get the current state of the user object so it can be modified in the front-end
            user = foundUser;

            delete user.todo[idToRemove];

            if ($.isEmptyObject(user.todo) && !$('#todoInput').length) {
                console.log('obejct is empty');

                let myTodoTemplate = `
                    <div class="oneTodoTemplate attached">
                        <textarea id="todoInput" name="name" placeholder="what shall be done?" rows="1" cols="80"></textarea>
                    </div> `;

                $('.todosContainer').append(myTodoTemplate);

                $('.attached').fadeIn(400, function() {
                    $(this).find(">:first-child").focus();
                });
            }

            chrome.storage.sync.set(user, () => {
                $(this).closest('.oneTodo').fadeOut(400).remove();
            });
        });
    });

    // add another todo list, click on 'add another todo' - icon
    $('.anothaOne').on('click', function() {
        if ($('#todoInput').length) {
            console.log('bruh there is one there already');
            return;
        }

        let myTodoTemplate = `
            <div class="oneTodoTemplate attached">
                <textarea id="todoInput" name="name" placeholder="what shall be done?" rows="1" cols="80"></textarea>
            </div> `;

        $('.todosContainer').append(myTodoTemplate);

        $('.attached').fadeIn(200, () => {
            $('#todoInput').focus();
        });
    });

    // ----------------------- DOM MEDITATION LOGIC ---------------------------

    // close meditation section
    $('#closeMeditation, .meditateIconContainer').on('click', function() {
        ion.sound.stop("relaxing");
        $('section.meditate').fadeOut(500, () => {
            $('section.meditate, .meditateContainer, .info').css('display', 'none');
        });
        renderDashboard();
    });

    // mute volume
    $('#volumeOff').on('click', function() {
        ion.sound.stop("relaxing");
        $(this).fadeOut(500);
    });
});

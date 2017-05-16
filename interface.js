// ------------------------------ FUNCTIONS -----------------------------------
function toDataURL(url, callback){
  var xhr = new XMLHttpRequest();
  xhr.open('get', url);
  xhr.responseType = 'blob';
  xhr.onload = function(){
    var fr = new FileReader();

    fr.onload = function(){
      // this is the base64 encoded string that I have to save
      console.log(this.result);
      callback(this.result);
    };
    fr.readAsDataURL(xhr.response); // async call
  };
  xhr.send();
}

function getBase64FromImageUrlAndSave(url) {
    var img = new Image();

    img.setAttribute('crossOrigin', 'anonymous');

    img.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width  = this.width;
      canvas.height = this.height;

      var ctx = canvas.getContext("2d");
      ctx.drawImage(this, 0, 0);

      var dataURL = canvas.toDataURL("image/png");
      // save to chrome.storage
      chrome.storage.local.set({'imgDataUrl': dataURL}, () => {
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
// -------------------------------- ASYNC AJAX --------------------------------------

// background image AJAX
$.ajax({
  url: "https://api.unsplash.com/photos/random",
  type: 'get',
  dataType: "json",
  data: "client_id=29b43b6caaf7bde2a85ef2cfddfeaf1c1e920133c058394a7f8dad675b99921b&collections=281002",
  success: ( response ) => {
    console.log(response);
    //save to local storage
    //$('#background').attr('src', response.urls.regular);

    var url = response.urls.raw;


    getBase64FromImageUrlAndSave(url);


    // toDataURL(myImage.src, function(dataURL){
    //   result.src = dataURL;
    //
    //
    //   // now just to show that passing to a canvas doesn't hold the same results
    //   var canvas = document.createElement('canvas');
    //   canvas.width = myImage.naturalWidth;
    //   canvas.height = myImage.naturalHeight;
    //   canvas.getContext('2d').drawImage(myImage, 0,0);
    //
    //   console.log(canvas.toDataURL() === dataURL); // false - not same data
    // });


    if(response.location === undefined) {
      $('#picLocation').html('Planet Earth');
      $('#picAuthor').html(`Photo: <a style="color: rgba(255, 255, 255, 0.8);" class="myAnchor" href="${response.user.links.html}?utm_source=moodflow&utm_medium=referral&utm_campaign=api-credit">${response.user.name}</a> / <a class="myAnchor" style="color: rgba(255, 255, 255, 0.8);" href="https://unsplash.com/">Unsplash</a>`);
    } else {
      $('#picLocation').html(response.location.title);
      $('#picAuthor').html(`Photo: <a class="myAnchor" style="color: rgba(255, 255, 255, 0.8);" href="${response.user.links.html}?utm_source=moodflow&utm_medium=referral&utm_campaign=api-credit">${response.user.name}</a> / <a style="color: rgba(255, 255, 255, 0.8);" class="myAnchor" href="https://unsplash.com/">Unsplash</a>`);
    }
  },
  error: () => {
    console.log('getPictureAPI() error. Calling getPicture()');
    //this.getPicture();
  }
});


// ------------------------- JQUERY DOM EVENTS LOGIC --------------------------
$(document).ready(() => {
  // on init fade body and background in
  $('body, .background').fadeIn(1000);

  // google searchbar animation and palceholder logic
  $('#placeholder').on('click', () => {
    $('.ion-ios-search-strong').css('transform', 'translateX(300px)');

    setTimeout(() => {
      if($("#placeholder").is(":focus")) {
        $('#placeholder').attr("placeholder", "Google search");
      }
    }, 850);
  });
  $('#placeholder').focusout(()    => {
    $('.ion-ios-search-strong').css('transform', 'translateX(0)');
    $('#placeholder').attr("placeholder", "");
    setTimeout(() => {
      $('#placeholder').attr("placeholder", "");
    }, 100);
    setTimeout(()=> {
      $('#placeholder').attr("placeholder", "");
      $('#placeholder').val('');
      $('.ion-ios-search-strong').fadeIn(300);
    }, 310);
  });

  // date logic and format
  let day = moment().format('dddd'); // monday
  let monthDaynum = moment().format('MMMM Do');  // May 15th
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



});

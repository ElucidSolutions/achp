// Behavior for news page slideshow

(function ($) {

  $(document).ready (function () {

    setCarouselDisplay ();

  })

  /*
    Accepts no arguments, sets the display for the two Flickity
    carousels, attaches a news-num-images attribute to each
    gallery item, and returns undefined.
  */
  function setCarouselDisplay () {
    // TODO: move this to a user-set variable in Drupal
    var maxImagesToDisplay = 4;

    // var numImages = getImageElements ().length;
    var numImages = getNumImages ();
    getNavGalleryItems ().forEach (function (galleryItem) {
      $(galleryItem).attr ('data-news-num-images-to-display', Math.min(maxImagesToDisplay, numImages));
    })

    if (numImages === 0) {
      hideImageCarousel ();
      hideNavCarousel ();
    } else if (numImages === 1) {
      hideNavCarousel (); 
    } 
    else { addSliderNavButtons ();}
  }

  /*

  */
  function addSliderNavButtons () {
    getNavSlider ()
      .prepend ($('<div></div')
        .addClass('slider-nav-button')
        .addClass('prev')
        .click (function () {
          slideBackThroughNav ()
        }))
      .append ($('<div></div')
        .addClass('slider-nav-button')
        .addClass('next')
        .click (function () {
          slideForwardThroughNav ()
        }))
  }


  /*
    Accepts no arguments and returns a number representing
    the percentage points of theslider's transform: translateX 
    value.
  */
  function getSliderPosition () {
    var navSlider = getNavSlider ();
    var transformMatrix = 
      navSlider.css("-webkit-transform") ||
      navSlider.css("-moz-transform")    ||
      navSlider.css("-ms-transform")     ||
      navSlider.css("-o-transform")      ||
      navSlider.css("transform");
    transformMatrix.split(/[()]/)[1];
    return transformMatrix.split(',')[4] / navSlider.width () * 100;
  }

  /*
  */
  function setSliderPosition (percentage) {
    getNavSlider ().css('-webkit-transform', 'translateX:(' + percentage + '%)')
      .css('-moz-transform', 'translateX: (' + percentage + '%)')
      .css('-ms-transform', 'translateX:(' + percentage + '%)')
      .css('-o-transform', 'translateX:(' + percentage + '%)')
      .css('transform', 'translateX:(' + percentage + '%)');
  }

  /*
  */
  function slideBackThroughNav () {
    var hiddenImages = getNumImages () - $(getNavGalleryItems ()[0]).attr('data-news-num-images-to-display');
    var sliderPosition = getSliderPosition ();
    console.log('At the start of slideBack, your position is: ' + getSliderPosition ());
    
    // If the current position, plus 1 image, is less than the width of the
    // remaining images, move forward 1 image
    if (Math.abs(sliderPosition + 25) < hiddenImages * 25) {
      console.log('More than 1 image behind you. Should move to: ' + (sliderPosition - 25));
      setSliderPosition (sliderPosition + 25);
    // If the current position plus 1 image is greater to or equal than the
    // remaining images, move to display the last image
    } else if (Math.abs(sliderPosition + 25) >= hiddenImages * 25) {     
      console.log('Less than 1 image behind you. Should move to: ' + -(hiddenImages * 25))
      setSliderPosition (0);
    } else if (sliderPosition === 0) {
      console.log('Already at zero; this should be disabled')
    }

    console.log('At the end of slideBack, your position is: ' + getSliderPosition ());
  }

  /*
  */
  function slideForwardThroughNav () {
    var hiddenImages = getNumImages () - $(getNavGalleryItems ()[0]).attr('data-news-num-images-to-display');
    var sliderPosition = getSliderPosition ();
    console.log('At the start of slideForward, your position is: ' + getSliderPosition ());
    
    // If the current position, plus 1 image, is less than the width of the
    // remaining images, move forward 1 image
    if (Math.abs(sliderPosition - 25) < hiddenImages * 25) {
      console.log('More than 1 image to go. Should move to: ' + (sliderPosition - 25));
      setSliderPosition (sliderPosition - 25);
    // If the current position plus 1 image is greater to or equal than the
    // remaining images, move to display the last image
    } else if (Math.abs(sliderPosition - 25) > hiddenImages * 25) {     
      console.log('Less than 1 image to go. Should move to: ' + -(hiddenImages * 25))
      setSliderPosition (-(hiddenImages * 25));
    } else if (Math.abs(sliderPosition) === hiddenImages * 25) {
      console.log('You are already at the end ... I think');
    }
    console.log('At the end of slideForward, your position is: ' + getSliderPosition ());
  }

  /*
  */
  function getNumImages () {
    return getImageElements ().length;
  }

  /*
    Accepts no arguments and returns a jQuery HTML Element
    that represents the navigator carousel's slider element.
  */
  function getNavSlider () {
    return $('.' + getNavSliderClassName (), getNavCarousel ());
  }  

  /*
    Accepts no arguments and returns an Array representing
    the gallery items in the navigator carousel.
  */
  function getNavGalleryItems () {
    return $('.' + getGalleryItemClassName (), getNavCarousel ()).toArray ();
  }  

  /*
    Accepts no arguments, hides the main image carousel,
    and returns undefined.
  */
  function hideImageCarousel () {
    getImageCarousel ().hide ();
  }

  /*
    Accepts no arguments, hides the navigator carousel,
    and returns undefined.
  */
  function hideNavCarousel () {
    getNavCarousel ().hide ();
  }

  /*
    Accepts no arguments and returns a jQuery HTML Element
    that represents the main image carousel.
  */
  function getImageCarousel () {
    return $('#block-news-image-carousel');
  }

  /*
    Accepts no arguments and returns a jQuery HTML Element
    that represents the navigator carousel.
  */
  function getNavCarousel () {
    return $('#block-carousel-navigator');
  }

  /*
    Accepts no arguments and returns an HTML Collection of
    the images associated with the story.
  */
  function getImageElements () {
    return $('.field_news_photo');
  }

  /*
    Accepts no arguments and returns a string representing
    Flickity's slider element.
  */
  function getNavSliderClassName () {
    return 'flickity-slider';
  }

  /*
    Accepts no arguments and returns a string representing
    the gallery items.
  */
  function getGalleryItemClassName () {
    return 'gallery-cell';
  }  

})(jQuery);
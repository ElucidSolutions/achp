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
    var maxImagesToDisplay = 4; // TODO: move this to a user-set variable in Drupal
    var numImages = getNumImages ();

    getNavGalleryItems ().forEach (function (galleryItem) {
      $(galleryItem).attr ('data-news-num-images-to-display', Math.min(maxImagesToDisplay, numImages));
    })

    if (numImages === 0) {
      hideImageCarousel ();
      hideNavCarousel ();
    } else if (numImages === 1) {
      hideNavCarousel (); 
    } else if (numImages > maxImagesToDisplay) {
      addSliderNavButtons ();
    }
  }

  /*
  */
  function disableNavPrevButton () {
    getNavPrevButton ().addClass('disabled');
  }

  /*
  */
  function disableNavNextButton () {
    getNavNextButton ().addClass('disabled');
  }

  /*

  */
  function addSliderNavButtons () {
    getNavCarousel ()
      .prepend ($('<div></div')
        .addClass('carousel-nav-button')
        .addClass('prev')
        .click (function () {
          slideBackThroughNav ()
        }))
      .append ($('<div></div')
        .addClass('carousel-nav-button')
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
    var leftPosition = parseInt(navSlider.css('left'));
    // console.log(leftPosition)

    var transformMatrix = 
      navSlider.css("-webkit-transform") ||
      navSlider.css("-moz-transform")    ||
      navSlider.css("-ms-transform")     ||
      navSlider.css("-o-transform")      ||
      navSlider.css("transform");

    // console.log(transformMatrix.split(',')[4] / navSlider.width () * 100 + leftPosition);
    return transformMatrix.split(',')[4] / navSlider.width () * 100 + leftPosition;
  }

  /*
  */
  function setSliderPosition (leftPosition) {
    // var leftPosition = leftOffset;
    // console.log(leftPosition)
    getNavSlider ().animate({
      left: leftPosition
    }, 1000)
    // getNavSlider ().addClass ('animated');
    // getNavSlider ().css('-webkit-transform', 'translateX(' + percentage + '%)')
    //   .css('-moz-transform', 'translateX (' + percentage + '%)')
    //   .css('-ms-transform', 'translateX(' + percentage + '%)')
    //   .css('-o-transform', 'translateX(' + percentage + '%)')
    //   .css('transform', 'translateX(' + percentage + '%)');
    // console.log('transform: translateX(' + percentage + '%)')
  }

  /*
  */
  function slideBackThroughNav () {
    var galleryItemWidth = getNavGalleryItemsNotArray ().width ();
    var sliderPosition = getSliderPosition ();
      // console.log(sliderPosition)
    if (sliderPosition === 0) {
      disableNavPrevButton ();
    } else if (sliderPosition < 0) {
      setSliderPosition (sliderPosition + galleryItemWidth);
    }
  }

  /*
  */
  function slideForwardThroughNav () {
    var galleryItemWidth = getNavGalleryItemsNotArray ().width ();
    var hiddenImagesWidth = galleryItemWidth * (getNumImages () - $(getNavGalleryItems ()[0]).attr('data-news-num-images-to-display'));
    var sliderPosition = getSliderPosition ();
    // console.log(sliderPosition);

    if (Math.abs(sliderPosition) < hiddenImagesWidth) {
      // console.log(galleryItemWidth);
      setSliderPosition (sliderPosition - galleryItemWidth);
    } else if (Math.abs(sliderPosition) >= hiddenImagesWidth) {
      console.log('there')
      disableNavNextButton ();
    }
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
  function getNavViewport () {
    return $('.' + getNavViewportClassName (), getNavCarousel ());
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
    // return getNavGalleryItemsNotArray().toArray ();
    return $('.' + getGalleryItemClassName (), getNavCarousel ()).toArray ();
  }  

  /*
    Accepts no arguments and returns the gallery items in 
    the navigator carousel.
  */
  function getNavGalleryItemsNotArray () {
    return $('.' + getGalleryItemClassName (), getNavCarousel ());
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
    return $('#block-carousel-navigator .navigator');
  }

  /*
    Accepts no arguments and returns an HTML Collection of
    the images associated with the story.
  */
  function getImageElements () {
    return $('.field_news_photo');
  }

  /*
  */
  function getNavNextButton () {
    return $('.' + getNavCarouselClassName () + '.next');
  }

    /*
  */
  function getNavPrevButton () {
    return $('.' + getNavCarouselClassName () + '.prev');
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
    Flickity.
  */
  function getNavCarouselClassName () {
    return 'carousel-nav-button';
  }

  /*
    Accepts no arguments and returns a string representing
    the gallery items.
  */
  function getGalleryItemClassName () {
    return 'gallery-cell';
  }  

})(jQuery);
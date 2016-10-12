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
    var numImages = getImageElements ().length;
    var maxImagesToDisplay = 4;
    getNavGalleryItems ().forEach (function (galleryItem) {
      $(galleryItem).attr ('data-news-num-images', Math.min(maxImagesToDisplay, numImages));
    })

    if (numImages === 0) {
      hideImageCarousel ();
      hideNavCarousel ();
    } else if (numImages === 1) {
      hideNavCarousel (); 
    }
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
    the gallery items.
  */
  function getGalleryItemClassName () {
    return 'gallery-cell';
  }  

})(jQuery);
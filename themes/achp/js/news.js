// Behavior for news page

(function ($) {

  $(document).ready (function () {

    // Displays filter options at widescreen; sets click listener at mobile

    $.breakpoint ((function () {
      return {
        condition: function () {
          return window.matchMedia ('only screen and (min-width: 850px)').matches;
        },
        enter: function () {
          $('.views-exposed-form').show ();
        },
        exit: function () {
        }
      };
    })());    

    $.breakpoint ((function () {
      return {
        condition: function () {
          return window.matchMedia ('only screen and (max-width: 850px)').matches;
        },
        enter: function () {
          $('.views-exposed-form').hide ();
          $('.news_filter').addClass(news_filter_closed);
        },
        exit: function () {
        }
      };
    })());

    // Attach datepicker to input areas
    $("#edit-date-min").datepicker ();
    $("#edit-date-max").datepicker ();

    // Click listener for news filter button
    $('.news_filter').click ( function (e) {
      if ($('.views-exposed-form').css('display') === 'none') {
        $('.views-exposed-form').slideDown();
        $(e.target).addClass('news_filter_open');
      } else {
        $('.views-exposed-form').slideUp( function () {
            $(e.target).removeClass('news_filter_open');
        });
      };
    });

    // TEMPORARY: overwrites default values
    $("#edit-date-min").attr('value', 'Start date');
    $("#edit-date-max").attr('value', 'End date');
    $('#edit-submit-latest-news').attr('value', 'Submit');

  })

  /* 
  Accepts no arguments, attaches a click listener to the news 
  listener button, and returns undefined.
  */
  function newsFilterClickListener () {
    $('.news_filter_closed').click (function (e) {
      $('.views-exposed-form').slideDown ();
      $(e.target).addClass ('news_filter_open').removeClass ('news_filter_closed');
    });

    $('.news_filter_open').click (function (e) {
      $('.views-exposed-form').slideUp ();
      $(e.target).addClass('news_filter_closed').removeClass('news_filter_open');
    });      
  }

})(jQuery);
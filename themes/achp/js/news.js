// Behavior for news page

(function ($) {

  $("#edit-date-min").datepicker ();
  $("#edit-date-max").datepicker ();

  $("#edit-date-min").attr('value', 'Start date');
  $("#edit-date-max").attr('value', 'End date');

  $('#edit-submit-latest-news').attr('value', 'Submit');

  $('.news_filter').click ( function (e) {
    if ($('.views-exposed-form').css('display') === 'none') {
      $('.views-exposed-form').slideDown();
      $(e.target).addClass('news_filter_open')
    } else {
      $('.views-exposed-form').slideUp();
      $(e.target).delay(5000).removeClass('news_filter_open');
      console.log('2');
    };
  });

})(jQuery);
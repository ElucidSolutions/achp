// Behavior for news page

(function ($) {

  $("#edit-created-min").datepicker ();
  $("#edit-created-max").datepicker ();

  $("#edit-created-min").attr('value', 'Start date');
  $("#edit-created-max").attr('value', 'End date');

})(jQuery);
// 

(function ($) { 

  $(document).ready (function () {

    var applicationItems = $('.contact-message-form .js-form-item');
    var textFields = $('.js-form-item textarea');
    var optionFields = $('.js-form-item select')
    $.merge(textFields, optionFields)
    console.log(textFields.length);
    // console.log(textareas);
    // fields.push($('select'));
    // console.log(questions);

    // questions = Array.from(fields);

    Array.from(applicationItems).forEach (function (item) {
      // console.log(field);
      item = $(item);
      var itemHeight = item.css('height');
      item.css('height', itemHeight)
      // item.height(itemHeight)
      // console.log(field.css('height'))
    })

    Array.from(textFields).forEach (function (field) {
      field = $(field);
      field.css('position', 'absolute').css('bottom', 0);
    })

  })

})(jQuery);
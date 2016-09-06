/*
  This module initializes and implements the
  Share This Page block elements.
*/
(function ($) {
  $(document).ready (function () {
    // enable the Add To Any share elements.
    a2a.init_all ('page');

    // enable the link button.
    var clipboard = new Clipboard ('.share_this_page_button_direct_link');
    clipboard.on ('success', function () {
      toastr.options = {
        positionClass: 'toast-bottom-center',
        preventDuplicates: true
      };
      toastr.info ('Link Copied to Clipboard.');
    });
    clipboard.on ('error', function () {
      console.error ('error');
    });

    // handle click events for the print button.
    $('.share_this_page_button_print').click (function () {
      window.print ();
    });

    // load share button icons
    loadSVGIcons ();
  });

  /*
    Accepts no arguments; loads the SVG icons;
    and returns undefined.
  */
  function loadSVGIcons () {
    [
      {
        'selector': '.share_this_page_button_icon_facebook',
        'url': '/images/facebook-icon.svg'
      },
      {
        'selector': '.share_this_page_button_icon_twitter',
        'url': '/images/twitter-icon.svg'
      },
      {
        'selector': '.share_this_page_button_icon_email',
        'url': '/images/email-icon.svg'
      },
      {
        'selector': '.share_this_page_button_icon_link',
        'url': '/images/link-icon.svg'
      },
      {
        'selector': '.share_this_page_button_icon_print',
        'url': '/images/print-icon.svg'
      }
    ].forEach (function (icon) {
      $(icon.selector).html (loadSVG (drupalSettings.share_this_page.module_path + icon.url));
    });
  }


  /*
    Accepts one argument: url, a URL string;
    loads the SVG file referenced by url; and
    returns an SVG string that represents the
    loaded file.
  */
  function loadSVG (url) {
    var svgElementString = '<div></div>';
    $.ajax (url, {
      async: false,
      success: function (svgDocument) {
        // Get the SVG element.
        var svgElement = svgDocument.documentElement;

        // Serialize icon element as a string.
        svgElementString = new XMLSerializer ().serializeToString (svgElement);

        // Returns the document string.
        return svgElementString;
      },
      error: function () {
        console.log ('[share_this_page] Error: an error occured while trying to load an SVG document from "' + url + '".');
      }
    });
    return svgElementString;
  }
}) (jQuery);

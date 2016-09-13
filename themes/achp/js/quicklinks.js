// Quicklinks behavior

(function ($) { 

  $(document).ready (function () {

    // Binds click listeners onto Quicklinks when in mobile view; unbinds on larger screen.
    $.breakpoint ((function () {
      return {
        condition: function () {
          return window.matchMedia ('only screen and (max-width: 700px)').matches;
        },
        enter: function () {
          mobileQuicklinkClickListener ();
        },
        exit: function () {
          unbindQuicklinkClickListener ();
        }
      };
    })());

  })

  /*
    Accepts no arguments; hides individual links in Quicklinks section
    and sets a click listener that:

    * toggles display of a Quicklink topic's links, and 
    * toggles the 'open' class on a clicked Quicklink topic's header.

    Returns undefined.
  */

  function mobileQuicklinkClickListener () {
    $('.quicklinks-column').children ('.views-row').hide ();
    $('.quicklinks-column > header').click (function (e) {
      var quicklinkHeader = $(e.target).parents ('.quicklinks-column').find ('h3');
      var quicklinkItems = $(e.target).parents ('.quicklinks-column').children ('.views-row');
      if (quicklinkItems.css ('display') == 'none') {
        quicklinkHeader.addClass ('open');
        quicklinkItems.slideDown ();
      } else {
        quicklinkHeader.removeClass ('open');        
        quicklinkItems.slideUp ();
      }
    })
  }

  /*
    Accepts no arguments; displays all individual links in Quicklinks 
    section, removes the 'open' class on any Quicklink topic header,
    and unbinds the click listener on the header; returns undefined.
  */  

  function unbindQuicklinkClickListener () {
    $('.quicklinks-column').children ('.views-row').show ();
    $('.quicklinks-column').find ('h3').removeClass ('open');
    $('.quicklinks-column > header').unbind ('click');   
  }

})(jQuery);
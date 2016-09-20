SECURE LOGIN MODULE
-------------------

For sites that are available via both HTTP and HTTPS, Secure Login
module ensures that the user login and other forms are submitted
securely via HTTPS, thus preventing passwords and other private user
data from being transmitted in the clear. Secure Login module locks down
not just the user/login page but also any page containing the user login
block, and any other forms that you configure to be secured.

In both Drupal 7 and Drupal 8, logging in via HTTPS automatically
generates an HTTPS-only secure session[1], which prevents session
cookies from being sent in cleartext.

INSTALLATION
------------

See INSTALL.txt for instructions on how to install and uninstall the
module.

Before enabling the module, you need to set up your server to support
HTTPS and ensure that it works correctly.  The result should be that if
you Drupal site lives at http://www.example.org/dir, it should also be
accessible at https://www.example.org/dir (the secure base URL).  If you
use a different URL for the secure site, you must make sure that cookies
coming from host.example.org can be sent to securehost.example.org.  You
can change the cookie domain in services.yml.

CONFIGURATION
-------------

At admin/config/people/securelogin you can set which forms (login,
registration, node, comment, contact, webform, etc.) are secured by this
module.  By securing all forms that indicate they "must be checked to
enforce secure authenticated sessions," you can ensure that logins are
in fact "secure": all authenticated sessions will use HTTPS-only secure
session cookies which are immune to session hijacking by eavesdroppers.

UPGRADING FROM DRUPAL 7
-----------------------

Your Secure Login settings should be correctly migrated from Drupal 7 to
Drupal 8... but this is not yet working.

DEVELOPER API
-------------

As with the Drupal 7 version of Secure Login module, developers may use
$form['#https'] = TRUE to indicate that a form should be secured by
Secure Login module, and $options['https'] = TRUE to indicate that an
HTTPS URL should be generated.

Additionally, this module provides two API functions for developers:

\Drupal::service('securelogin.manager')->secureForm($form) may be called
on a form to either redirect the current request to the secure base URL
or to submit the form to the secure base URL, depending on Secure Login
configuration.

\Drupal::service('securelogin.manager')->secureRedirect() may be called
to redirect the current request to the equivalent path on the secure
base URL.

[1] https://php.net/manual/en/session.configuration.php#ini.session.cookie-secure
[2] https://en.wikipedia.org/wiki/Session_hijacking

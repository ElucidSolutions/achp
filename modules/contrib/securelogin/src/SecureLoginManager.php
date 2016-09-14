<?php

namespace Drupal\securelogin;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Defines the secure login service.
 */
class SecureLoginManager {

  /**
   * Configured secure login settings.
   */
  protected $config;

  /**
   * The event dispatcher service.
   */
  protected $eventDispatcher;

  /**
   * The current request.
   */
  protected $request;

  /**
   * The request stack.
   */
  protected $requestStack;

  /**
   * Constructs the secure login service.
   */
  public function __construct(ConfigFactoryInterface $config_factory, EventDispatcherInterface $event_dispatcher, RequestStack $request_stack) {
    $this->config = $config_factory->get('securelogin.settings');
    $this->eventDispatcher = $event_dispatcher;
    $this->requestStack = $request_stack;
    $this->request = $this->requestStack->getCurrentRequest();
  }

  /**
   * Rewrites the form action to use the secure base URL.
   */
  public function secureForm(&$form) {
    global $base_path, $base_secure_url;
    // Rebuild this form on based on the actual URL.
    $form['#cache']['contexts'][] = 'securelogin';
    // Flag form as secure for theming purposes.
    $form['#https'] = TRUE;
    if ($this->request->isSecure()) {
      return;
    }
    // Redirect to secure page, if enabled.
    if ($this->config->get('secure_forms')) {
      // Disable caching, as this form must be rebuilt to set the redirect.
      $form['#cache']['max-age'] = 0;
      $this->secureRedirect();
    }
    // Set the form action to use secure base URL in place of base path.
    if (strpos($form['#action'], $base_path) === 0) {
      $base_url = $this->config->get('base_url') ?: $base_secure_url;
      $form['#action'] = substr_replace($form['#action'], $base_url, 0, strlen($base_path) - 1);
    }
    // Or if a different domain is being used, forcibly rewrite to HTTPS.
    else {
      $form['#action'] = str_replace('http://', 'https://', $form['#action']);
    }
  }

  /**
   * Redirects a request to the same path on the secure base URL.
   */
  public function secureRedirect() {
    // Do not redirect from HTTPS requests.
    if ($this->request->isSecure()) {
      return;
    }
    // If necessary, use a 308 redirect to avoid losing POST data.
    $status = $this->request->isMethodSafe() ? RedirectResponse::HTTP_MOVED_PERMANENTLY : RedirectResponse::HTTP_PERMANENTLY_REDIRECT;
    // Build the redirect URL from the master request.
    $request = $this->requestStack->getMasterRequest();
    // Request may be a 404 so handle as unrouted URI.
    $url = Url::fromUri("internal:{$request->getPathInfo()}");
    $url->setOption('absolute', TRUE)
      ->setOption('external', FALSE)
      ->setOption('https', TRUE)
      ->setOption('query', $request->query->all());
    // Create listener to set the redirect response.
    $listener = function($event) use ($url, $status) {
      $response = new TrustedRedirectResponse($url->toString(), $status);
      // Add cache context for this redirect.
      $response->addCacheableDependency(new SecureLoginCacheableDependency());
      $event->setResponse($response);
      // Redirect URL has destination so consider this the final destination.
      $event->getRequest()->query->set('destination', '');
    };
    // Add listener to response event at high priority.
    $this->eventDispatcher->addListener(KernelEvents::RESPONSE, $listener, 222);
  }

}

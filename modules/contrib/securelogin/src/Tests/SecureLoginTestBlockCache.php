<?php

namespace Drupal\securelogin\Tests;

/**
 * Tests Secure login with user login block enabled.
 *
 * @group Secure login
 */
class SecureLoginTestBlockCache extends SecureLoginTestBlock {

  /**
   * Use a profile that enables the cache modules.
   */
  protected $profile = 'testing';

}

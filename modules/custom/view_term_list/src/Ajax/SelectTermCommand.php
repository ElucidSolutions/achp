<?php
namespace Drupal\view_term_list\Ajax;
use Drupal\Core\Ajax\CommandInterface;

class SelectTermCommand implements CommandInterface {
  protected $message; // an array holding the form and term IDs from the JS click handler.

  public function __construct ($message) {
    $this->message = $message;
  }

  // Implements Drupal\Core\Ajax\CommandInterface::render ().
  public function render () {
    return array (
      'command' => 'selectTerm',
      'mid' => $this->message->mid,
      'subject' => $this->message->subject,
      'content' => $this->message->content
    );
  }
}

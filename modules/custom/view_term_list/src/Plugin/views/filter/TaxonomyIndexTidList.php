<?php

namespace Drupal\view_term_list\Plugin\views\filter;

use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Entity\Element\EntityAutocomplete;
use Drupal\Core\Form\FormStateInterface;
use Drupal\taxonomy\Entity\Term;
use Drupal\taxonomy\TermStorageInterface;
use Drupal\taxonomy\VocabularyStorageInterface;
use Drupal\views\ViewExecutable;
use Drupal\views\Plugin\views\display\DisplayPluginBase;
use Drupal\views\Plugin\views\filter\ManyToOne;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\taxonomy\Plugin\views\filter\TaxonomyIndexTid;

/**
 * @ingroup views_filter_handlers
 * 
 * Overrides the valueForm function provided
 * by TaxonomyIndexTid to handle the case where
 * users select the "List" type option provided by
 * view_term_list_form_views_ui_config_item_extra_form_alter.
 *
 * Note: the following annotation allows
 * us to override TaxonomyIndexTid for the
 * taxonomy_index_tid view filter.
 *
 * @ViewsFilter("taxonomy_index_tid")
 */
class TaxonomyIndexTidList extends TaxonomyIndexTid {

  /**
   * 
   */
  protected function valueForm(&$form, FormStateInterface $form_state) {
    \Drupal::logger ('view_term_list')->notice ('[TaxonomyIndexTidList::valueForm]');

    // I. perform the same initial vocabulary check as performed in the parent function.
    // Note: the following is lifted verbatim from the beginning of TaxonomyIndexTid::valueForm ().
    $vocabulary = $this->vocabularyStorage->load($this->options['vid']);
    if (empty($vocabulary) && $this->options['limit']) {
      $form['markup'] = array(
        '#markup' => '<div class="js-form-item form-item">' . $this->t('An invalid vocabulary is selected. Please change it in the options.') . '</div>',
      );
      return;
    }

    // II. Intercept the case where the user selected the list type.
    if ($this->options ['type'] == 'list') {
      \Drupal::logger ('view_term_list')->notice ('[TaxonomyIndexTidList::valueForm.] List type selected.');

      $items = array ();
      $tree = $this->termStorage->loadTree ($vocabulary->id (), 0, null, true);

      $callback = ['\Drupal\view_term_list\Plugin\views\filter\TaxonomyIndexTidList', 'selectTerm'];
      $form_state->setUserInput (['form_id' => '']); // work-around

      if ($tree) {
        foreach ($tree as $term) {
          $items [] = array (
            '#markup' => '<div class="view_term_list_item" data-term-id="' . $term->id . '" data-term-depth="' . $term->depth . '">' . \Drupal::entityManager ()->getTranslationFromContext ($term)->label () . '</div>',
          );
        }
      }

      $form ['value'] = array (
        '#type' => 'container',
        '#attributes' => array (
          'class' => array ('view_term_list_container')
        ),
        'list' => array (
          '#markup' => '<ul class="view_term_list_list"></ul>',
          'items' => $items 
        )
      );
    } else {
      // let the parent version handle all remaining cases.
      return parent::valueForm ($form, $form_state);
    }

    // III. perform the same concluding operation as performed by the parent function after it handled each type case.
    // Note: the following is lifted verbatim from the bottom of TaxonomyIndexTid::valueForm ().
    if (!$form_state->get('exposed')) {
      // Retain the helper option
      $this->helper->buildOptionsForm($form, $form_state);

      // Show help text if not exposed to end users.
      $form['value']['#description'] = t('Leave blank for all. Otherwise, the first selected term will be the default instead of "Any".');
    }
  }

  /**
   *
   */
  public function selectTerm (&$form, $form_state) {
    \Drupal::logger ('view_term_list')->notice ('[TaxonomyIndexTidList::selectTerm]');
    // views_ui_ajax_update_form
    $response = new AjaxResponse ();
    return $response;
  }
}

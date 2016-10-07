<?php
/**
 * @file
 * This module defines the TaxonomyIndexTidList
 * class which represents a Views filter
 * (taxonomy_index_tid_list) and extends the
 * "Has taxonomy term" View filter provided
 * by the Taxonomy module (taxonomy_index_tid)
 * by adding an additional format (list). This
 * format presents users with an unordered list
 * of taxonomy terms that they can click on to
 * filter views.
 */

namespace Drupal\view_term_list\Plugin\views\filter;

use Drupal\Component\Utility\Html;
use Drupal\Core\Form\FormStateInterface;
use Drupal\taxonomy\Entity\Term;
use Drupal\taxonomy\Plugin\views\filter\TaxonomyIndexTid;

/**
 * Defines a view filter that extends the
 * TaxonomyIndexTid view filter provided by the
 * taxonomy module.
 * 
 * This filter provides a format option
 * labeled "list" that displays terms in a formatted
 * list. Users can select terms from this list by
 * clicking on them. This is similar to the "select"
 * format provided by the TaxonomyIndexTid filter
 * this class extends.
 * 
 * This module's hook_views_data_alter () function
 * sets this filter as the default filter for the
 * taxonomy_term_field_data table's tid column. This
 * filter will be listed under the Views UI as the
 * "Has taxonomy term" filter.
 *
 * Note: the following annotations register this
 * class as a view filter and declares the ID of
 * the filter represented by this class.
 *
 * @ingroup views_filter_handlers
 *
 * @ViewsFilter("taxonomy_index_tid_list")
 */
class TaxonomyIndexTidList extends TaxonomyIndexTid {
  /**
   *
   */
  public function buildExtraOptionsForm (&$form, FormStateInterface $form_state) {
    \Drupal::logger ('view_term_list')->notice ('[TaxonomyIndexTidList::buildExtraOptionsForm]');
    parent::buildExtraOptionsForm ($form, $form_state);

    $form ['type']['#options']['list'] = $this->t ('List');
  }

  /**
   * Creates the form element that allows users
   * to select values for this filter.
   *
   * Note: This function extends
   * TaxonomyIndexTid::valueForm. When this
   * filter's format equals "list", this function
   * creates an unordered list of taxonomy
   * terms. Otherwise, this function calls
   * TaxonomyIndexTid::valueForm to create the
   * form element.
   */
  protected function valueForm(&$form, FormStateInterface $form_state) {
    \Drupal::logger ('view_term_list')->notice ('[TaxonomyIndexTidList::valueForm] form: <pre>' . print_r (array_keys ($form), true) . '</pre>');

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
      $options = array ();
      $tree = $this->termStorage->loadTree ($vocabulary->id (), 0, null, true);
      if ($tree) {
        foreach ($tree as $term) {
          $label = \Drupal::entityManager ()->getTranslationFromContext ($term)->label ();
          $items [] = array (
            '#markup' => '<div class="view_term_list_item" data-term-id="' . $term->id () . '" data-term-depth="' . $term->depth . '">' .
              '<div class="view_term_list_item_label">' . $label . '</div>' .
            '</div>'
          );
          $options [$term->id ()] = $label;
        }
      }
      // Create the option list that users will use to select values.
      $filter_id = Html::getUniqueId ('view-term-list');
      $form ['view_term_list_item'] = array (
        '#type' => 'item',
        'view_term_list_list' => array (
          '#prefix' => '<ul class="view_term_list_list"' .
            ' data-view-term-list-view="' . $this->view->dom_id . '"' .
            ' data-view-term-list-filter="' . $filter_id .
            '">',
          '#suffix' => '</ul>',
          'items' => $items 
        )
      );
      // Create the hidden select form element that will be used to store selected term values.
      // Note: this form element is hidden using CSS.
      \Drupal::logger ('view_term_list')->notice ('[TaxonomyIndexTidList::valueForm.] options: <pre>' . print_r ($options, true) . '</pre>.');
      \Drupal::logger ('view_term_list')->notice ('[TaxonomyIndexTidList::valueForm.] default value: <pre>' . print_r ((array) $this->value, true) . '</pre>.');
      $form ['value'] = array (
        '#attributes' => array (
          'data-view-term-list-filter' => $filter_id
        ),
        '#type' => 'select',
        '#multiple' => true,
        '#options' => $options,
        '#default_value' => (array) $this->value
      );
    } else {
      // let the parent version handle all remaining cases.
      // return parent::valueForm ($form, $form_state);
      parent::valueForm ($form, $form_state);
      \Drupal::logger ('view_term_list')->notice ('[TaxonomyIndexTidList::valueForm.] non-list type selected. form keys: <pre>' . print_r (array_keys ($form), true) . '</pre>');
      return;
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
}

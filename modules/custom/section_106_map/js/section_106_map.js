/**
  @file
  Generates the Mapbox-based Section 106 Case map. 
*/
(function ($) {

  // I. Global variables

  // The Lunr Search Index.
  var lunrIndex = null;

  // The Section 106 consultation cases.
  var cases = [];

  // II. The Initialization function

  $(document).ready (function () {
    // Retrieve the section 106 consultation cases.
    cases = drupalSettings.section_106_map.cases;

    // Initialize the Lunr search index.
    lunrIndex = lunr (function () {
      this.field ('id');
      this.field ('title', 100);
      this.field ('body');
      this.field ('agency', 100);
      this.field ('state', 100);
      this.field ('status');
    });

    // Remove the stemmer pipeline function due to problems handling incomplete words.
    // See: https://github.com/olivernn/lunr.js/issues/38
    lunrIndex.pipeline.reset ();

    // Index the case records.
    indexCases (cases);

    $('.section_106_map').each (function (i, containerElement) {
      // Create and attach the feature instance.
      var instance = new FeatureInstance ($(containerElement));
    });
  });

  // III. The Feature Instance Class

  /*
    Accepts one argument: containerElement,
    a jQuery HTML Element; and creates and
    attaches a Section 106 Map Feature Instance
    to containerElement and returns the instance
    as a FeatureInstance object.
  */
  function FeatureInstance (containerElement) {
    // I. Create and attach the instance element.
    this._instanceElement = this.createInstanceElement ();
    containerElement.append (this._instanceElement);

    // II. Load the map.
    this._map          = this.loadMap ();

    // III. Create the marker cluster group.
    this._clusterGroup = this.createStateMarkerClusterGroup ();

    // IV. Add the marker cluster group to the map. 
    this._map.addLayer (this._clusterGroup);

    // V. Set the state markers.
    this.setMarkers (); 
  }

  /*
    Accepts no arguments and returns the HTML
    element that represents this instance as a
    jQuery HTML Element.
  */
  FeatureInstance.prototype.getInstanceElement = function () {
    return this._instanceElement;
  }

  /*
    Accepts no arguments and returns the Mapbox
    map object displayed in this instance's
    HTML element.
  */
  FeatureInstance.prototype.getMap = function () {
    return this._map;
  }

  /*
    Accepts no arguments and returns the Leafet
    Marker Cluster Group displayed in this
    instance's map.
  */
  FeatureInstance.prototype.getClusterGroup = function () {
    return this._clusterGroup;
  }

  /*
    Accepts no arguments and returns an HTML
    element that represents this instance as a
    JQuery HTML Element.
  */
  FeatureInstance.prototype.createInstanceElement = function () {
    return $('<div></div>')
      .addClass ('section_106_map_feature')
      .append (this.createHeaderElement ())
      .append (this.createBodyElement ());
  }

  /*
    Accepts no arguments and returns an HTML
    element that represents the map feature
    header as a jQuery HTML Element.
  */
  FeatureInstance.prototype.createHeaderElement = function () {
    return $('<div></div>')
      .addClass ('section_106_map_header')
      .append ($('<div></div>')
        .addClass ('section_106_map_header_header'))
      .append ($('<div></div>')
        .addClass ('section_106_map_header_body')
        .append ($('<div></div>')
          .addClass ('section_106_map_header_body_tabs')
          .append ($('<div></div>')
            .addClass ('section_106_map_header_body_tab')
            .addClass ('section_106_map_map_tab')
            .text ('Map'))
          .append ($('<div></div>')
            .addClass ('section_106_map_header_body_tab')
            .addClass ('section_106_map_grid_tab')
            .text ('Grid'))));
  }

  /*
    Accepts no arguments and returns an HTML
    Element that represents the map feature body
    as a jQuery HTML Element.
  */
  FeatureInstance.prototype.createBodyElement = function () {
    return $('<div></div>')
      .addClass ('section_106_map_body')
      .append (this.createSearchElement ())
      .append (this.createPanelElement ())
      .append (this.createMapContainerElement ())
      .append (this.createGridElement ());
  }

  /*
    Accepts no arguments and returns a map
    container element as a jQuery HTML Element.

    Note: this function adds a unique HTML
    element ID to the container element.

    Note: Mapbox maps can not be loaded into a
    map container elements until the container
    element has been attached to the document
    DOM.
  */
  FeatureInstance.prototype.createMapContainerElement = function () {
    return $('<div></div>')
      .attr ('id', _.uniqueId ('section_106_map'))
      .addClass ('section_106_map_map_container');
  }

  /*
    Accepts no arguments and returns a grid
    element listing the Section 106 cases
    associated with each state.
  */
  FeatureInstance.prototype.createGridElement = function () {
    return $('<div></div>').addClass ('section_106_map_grid').hide ();
  }

  /*
    Accepts no arguments and returns a search
    element that when clicked filters the state
    markers displayed on this instance's map and
    zooms/centers the map on the remaining items.
  */
  FeatureInstance.prototype.createSearchElement = function () {
    var self = this;

    var inputElement = $('<input></input>')
      .attr ('type', 'text')
      .addClass ('section_106_map_search_input')
      .on ('input', function () {
          inputElement.val () === '' ? clearElement.hide () : clearElement.show ();
          self.setMarkers (inputElement.val ());
        });

    var clearElement = $('<div></div>')
      .addClass ('section_106_map_search_clear')
      .click (function () {
          inputElement.val ('');
          self.setMarkers ();
          clearElement.hide ();
        })
      .hide ();

    return $('<div></div>')
      .addClass ('section_106_map_search')
      .append ($('<div></div>')
        .addClass ('section_106_map_search_form')
        .append (inputElement)
        .append (clearElement)
        .append ($('<div></div>')
          .addClass ('section_106_map_search_button')
          .click (function () {
              self.setMarkers (inputElement.val ());
            })));
  }

  /*
    Accepts no arguments and returns an
    information panel as a jQuery HTML Element
    that lists information about the section
    106 cases in each state.
  */
  FeatureInstance.prototype.createPanelElement = function () {
    return $('<div></div>').addClass ('section_106_map_panel').hide ();
  }

  /*
    Accepts argument: states, a State object
    array; and returns an information panel for
    the state as a jQuery HTML Element.
  */
  FeatureInstance.prototype.createStatePanelElement = function (state) {
    var self = this;
    return $('<div></div>')
      .addClass ('section_106_map_state_panel')
      .attr ('data-section-106-map-state-name', state.name)
      .attr ('data-section-106-map-state-abbreviation', state.abbreviation)
      .append ($('<div></div>')
        .addClass ('section_106_map_state_panel_header')
        .append ($('<div></div>')
          .addClass ('section_106_map_state_panel_header_title')
          .text ('Active Section 106 Cases'))
        .append ($('<div></div>')
          .addClass ('section_106_map_state_panel_header_close_button'))
          .click (function () {
              self.hidePanelElement ();
            }))
      .append ($('<div></div>')
        .addClass ('section_106_map_state_panel_body')
        .append ($('<ol></ol>')
          .addClass ('section_106_map_state_panel_state_cases_list')
          .append (this.createStatePanelStateCaseElements (state))))
      .append ($('<div></div>')
        .addClass ('section_106_map_state_panel_footer'));
  }

  /*
    Accepts one argument: state, a State object;
    and returns an array of state case panel
    elements that represent state's cases as an
    array of jQuery HTML Elements.
  */
  FeatureInstance.prototype.createStatePanelStateCaseElements = function (state) {
    return state.cases.map (this.createStatePanelStateCaseElement, this);
  }

  /*
    Accepts one argument: _case, a Case object;
    and returns a state case panel element that
    represents _case as a jQuery HTML Element.
  */
  FeatureInstance.prototype.createStatePanelStateCaseElement = function (_case) {
    return $('<div></div>')
      .addClass ('section_106_map_case')
      .attr ('data-section-106-map-case-id', _case.id)
      .append ($('<li></li>')
        .addClass ('section_106_map_case_item')
        .append ($('<div></div>')
          .addClass ('section_106_map_case_header')
          .append ($('<div></div>')
            .addClass ('section_106_map_case_title')
            .append ($('<a></a>')
              .attr ('href', _case.url)
              .text (_case.title))))
        .append ($('<div></div>')
          .addClass ('section_106_map_case_body')
          .append ($('<div></div>')
            .addClass ('section_106_map_case_description')
            .html (_case.body))
          .append ($('<div></div>')
            .addClass ('section_106_map_case_body_agency')
            .append ($('<div></div>')
              .addClass ('section_106_map_case_body_agency_header')
              .append ($('<div></div>')
                .addClass ('section_106_map_case_body_agency_header_title')
                .text ('Agency Involved:'))
              .append ($('<div></div>')
                .addClass ('section_106_map_case_agency')
                .text (_case.agency.title))))
          .append ($('<div></div>')
            .addClass ('section_106_map_case_body_contact')
            .append ($('<div></div>')
              .addClass ('section_106_map_case_body_contact_header')
              .append ($('<div></div>')
                .addClass ('section_106_map_case_body_contact_header_title')
                .text ('Federal Point of Contact:')))
            .append ($('<div></div>')
              .addClass ('section_106_map_case_contact_name_title')
              .append ($('<span></span>')
                .addClass ('section_106_map_case_contact_name')
                .text (_case.poc.name))
              .append ($('<span></span>')
                .addClass ('section_106_map_case_contact_title')
                .text (_case.poc.title)))
            .append ($('<div></div>')
              .addClass ('section_106_map_case_contact_email')
              .text (_case.poc.email))
            .append ($('<div></div>')
              .addClass ('section_106_map_case_contact_phone')
              .text (_case.poc.phone)))
          ));
  }

  /*
    Accepts no arguments; loads a Mapbox map
    that plots the Section 106 cases given in
    states into this instance's map container
    element; and returns the loaded map as a
    Mapbox Map object.
  */
  FeatureInstance.prototype.loadMap = function () {
    var instanceElement = this.getInstanceElement ();

    // Get the map container element ID.
    var mapContainerElementID = $('.section_106_map_map_container', instanceElement).attr ('id');

    // Get the Mapbox access token.
    var accessToken = drupalSettings.section_106_map.mapbox_access_token;

    // Set the Mapbox access token.
    L.mapbox.accessToken = accessToken;

    // Embed the Mapbox map object.
    var map = L.mapbox.map (mapContainerElementID, 'mapbox.streets', {
      minZoom:   2,
      maxZoom:   7
    });

    // Return the map.
    return map;
  }


  /*
    Accepts no arguments and returns a Leaflet
    Marker Cluster object that represents a
    marker cluster group containing markers for
    the states in states.
  */
  FeatureInstance.prototype.createStateMarkerClusterGroup = function () {
    var self = this;
    return new L.MarkerClusterGroup ({
      showCoverageOnHover: false,
      iconCreateFunction: function (cluster) {
        return self.createClusterIcon (cluster);
      }
    });
  }

  /*
    Accepts one argument: cluster, a Leaflet
    Cluster object; and returns a Leaflet Icon
    object that represents the cluster.
  */
  FeatureInstance.prototype.createClusterIcon = function (cluster) {
    return new L.DivIcon ({
      'html': getClusterIconSVG (this.getClusterNumCases (cluster).toString ())
    });
  }

  /*
    Accepts one argument: cluster, a Leaflet
    Cluster object; and returns the number of
    cases represented by the markers nested
    within cluster as an integer.
  */
  FeatureInstance.prototype.getClusterNumCases = function (cluster) {
    var self = this;
    return getClusterMarkers (cluster).reduce (
      function (numCases, marker) {
        return numCases + marker.options.state.cases.length;
    }, 0);
  }

  /*
    Accepts one argument: cluster, a Leaflet
    Cluster object; and returns the markers
    nested within cluster as an array of Leaflet
    Marker objects.
  */
  function getClusterMarkers (cluster) {
    return cluster._childClusters.reduce (
      function (markers, childCluster) {
        Array.prototype.push.apply (markers, getClusterMarkers (childCluster));
        return markers;
    }, cluster._markers.slice ());
  }

  /*
    Accepts one argument: query, a string that
    represents a search/filter query; and returns
    markers for those states and territories
    that have cases that match query as a State
    object array.
  */
  FeatureInstance.prototype.createStateMarkers = function (query) {
    return createStates (filterCases (query)).map (this.createStateMarker, this);
  }

  /*
    Accepts one argument: state, a State object;
    and returns a Leaflet Marker object that
    represents state.

    See: https://www.mapbox.com/mapbox.js/api/v2.2.4/l-marker/
  */
  FeatureInstance.prototype.createStateMarker = function (state) {
    var self = this;
    var marker = new L.marker (
      [state.coordinates.latitude, state.coordinates.longitude],
      {
        icon:     createStateIcon (state),
        title:    state.name,
        state:    state
      }
    ).on ('click', function () {
      // select the state marker.
      self.deselectStateMarkerElements ();
      self.selectStateMarkerElement (state.abbreviation);

      // show state panel.
      self.showStatePanelElement (state);
    });
    return marker;
  }

  /*
    Accepts one argument: query, a search/filter
    query string; removes the markers in this
    instance's marker cluster group; creates new
    markers for those states and territories
    that have cases that match query; and add
    those markers to this instance's marker
    cluster group.

    If query is null or undefined, this function
    adds markers for all of this instance's
    cases.
  */
  FeatureInstance.prototype.setMarkers = function (query) {
    var clusterGroup = this.getClusterGroup ();

    // Remove markers.
    clusterGroup.clearLayers ();

    // Add the newly filtered markers back in.
    this.createStateMarkers (query).forEach (clusterGroup.addLayer, clusterGroup);

    // Zoom and center on the filtered markers.
    this.getMap ().fitBounds (clusterGroup.getBounds ());
  }

  /*
    Accepts one argument: stateAbbreviation,
    a string that represents a state
    abbreviation; and selects the state marker
    in featureElement associated with the state
    referenced by stateAbbreviation.
  */
  FeatureInstance.prototype.selectStateMarkerElement = function (stateAbbreviation) {
    this.getStateMarkerElement (stateAbbreviation).get (0).classList.add ('section_106_map_selected');
  }

  /*
    Accepts no arguments and deselects all of
    the state markers in the this instance's map.
  */
  FeatureInstance.prototype.deselectStateMarkerElements = function () {
    this.getStateMarkerElements ().each (
      function (i, markerElement) {
        markerElement.classList.remove ('section_106_map_selected');
    });
  }

  /*
    Accepts argument: stateAbbreviation, a
    string that represents a state abbreviation;
    and shows the state panel element in this
    instance's element that is associated with
    the state referenced by stateAbbreviation
    as a jQuery HTML Element.
  */
  FeatureInstance.prototype.showStatePanelElement = function (state) {
    this.getPanelElement ().empty ().append (this.createStatePanelElement (state)).show ();
  }

  /*
    Accepts no arguments and hides this instance
    element's state panel elements.
  */
  FeatureInstance.prototype.hidePanelElement = function () {
    this.getPanelElement ().hide ();
  }

  /*
    Accepts argument: stateAbbreviation, a string
    that represents a state abbreviation; and
    returns a jQuery HTML Element that represents
    the state marker in this instance for the
    state referenced by stateAbbreviation.
  */
  FeatureInstance.prototype.getStateMarkerElement = function (stateAbbreviation) {
    return $('.section_106_map_state_marker[data-section-106-map-state-marker-state="' + stateAbbreviation + '"]', this.getInstanceElement ());
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element Set containing all of the state
    marker elements in this instance.
  */
  FeatureInstance.prototype.getStateMarkerElements = function () {
    return $('.section_106_map_state_marker', this.getInstanceElement ());
  }

  /*
    Accepts no arguments and and returns this
    instance's panel element.
  */
  FeatureInstance.prototype.getPanelElement = function () {
    return $('.section_106_map_panel', this.getInstanceElement ());
  }

  // IV. SVG Icon Functions

  /*
    Accepts one argument: label, a string; and
    returns an SVG element string that represents
    a Cluster Icon labeled label.
  */
  function getClusterIconSVG (label) {
    var svgElementString = '<div></div>';
    $.ajax (
      'modules/custom/section_106_map/images/marker-group-icon.svg',
      {
        async: false, 
        success: function (svgDocument) {
          // Get the SVG element.
          var svgElement = svgDocument.documentElement;

          // Add a class attribute to the icon element.
          svgElement.classList.add ('section_106_map_cluster_marker');

          // Add cluster child count to the icon element.
          labelElement = svgDocument.createElementNS ('http://www.w3.org/2000/svg', 'text');
          labelElement.classList.add ('section_106_map_cluster_marker_label');
          labelElement.textContent = label;
          svgElement.appendChild (labelElement);

          // Serialize icon element as a string.
          svgElementString = new XMLSerializer ().serializeToString (svgElement);
        },
        error: function () {
          console.log ('[section_106_map] Error: an error occured while trying to load a cluster icon.'); 
        }
    });
    return svgElementString;
  }

  /*
    Accepts no arguments and returns a Leaflet
    Icon object that represents the State
    marker icon.

    See: https://www.mapbox.com/mapbox.js/api/v2.4.0/l-icon/
  */
  function createStateIcon (state) {
    return new L.DivIcon ({
      'html': createStateIconSVG (state)
    });
  }

  /*
    Accepts one argument: state, a State object;
    and returns an SVG Element string that
    represents a marker element for state.
  */
  function createStateIconSVG (state) {
    var svgElementString = '<div></div>';
    if (state.cases.length > 0) {
      $.ajax (
        state.cases.length > 1 ?
          'modules/custom/section_106_map/images/multiple-cases-state-marker-icon.svg':
          'modules/custom/section_106_map/images/single-case-state-marker-icon.svg',
        {
          async: false,
          success: function (svgDocument) {
            // Get the SVG element.
            var svgElement = svgDocument.documentElement;

            // Add a class attribute to the icon element.
            svgElement.setAttribute ('data-section-106-map-state-marker-state', state.abbreviation);
            svgElement.classList.add ('section_106_map_state_marker');
            svgElement.classList.add (state.cases.length > 1 ?
              'section_106_map_multiple_cases_state_marker':
              'section_106_map_single_case_state_marker'
            );

            if (state.cases.length > 1) {
              // Add cluster child count to the icon element.
              labelElement = svgDocument.createElementNS ('http://www.w3.org/2000/svg', 'text');
              labelElement.classList.add ('section_106_map_state_marker_label');
              labelElement.textContent = state.cases.length.toString ();
              svgElement.appendChild (labelElement);
            }

            // Serialize icon element as a string.
            svgElementString = new XMLSerializer ().serializeToString (svgElement);
          },
          error: function () {
            console.log ('[section_106_map] Error: an error occured while trying to load a state icon.');
          }
      });
    }
    return svgElementString;
  }

  // V. State Functions

  /*
    Accepts one argument: cases, an array of
    Case objects; and returns an array of State
    objects representing all of the states
    referenced by the cases in cases with the
    cases partitioned between them.
  */
  function createStates (cases) {
    return cases.reduce (
      function (states, _case) {
        var state = findStateByName (states, _case.state);
        if (!state) {
          state = createState (_case.state);
          if (!state) {
            return states;
          }
          states.push (state);
        }
        state.cases.push (_case);
        return states;
    }, []);
  }

  /*
    Accepts two arguments:

    * states, an array of State objects
    * and name, a string denoting the name of
      a state or territory

    and returns the state in states that has
    the given name.

    If none of the states in states has the given
    name, this function returns null.
  */
  function findStateByName (states, name) {
    return _.find (states, function (state) {
      return state.name === name;
    });
  }

  /*
    Accepts one argument: stateName, a string
    that represents a state or territory name;
    and returns a State object that represents
    the given state.

    Note: This function returns State objects
    without any cases. You may need to add cases
    to the objects returned by this function.
  */
  function createState (stateName) {
    var abbreviation = getStateAbbreviation (stateName);
    var coordinates  = abbreviation ? getStateCoordinates (abbreviation) : null;

    return abbreviation && coordinates ? {
      name:         stateName,
      abbreviation: abbreviation,
      coordinates:  coordinates,
      cases:        []
    } : null;
  }

  /*
    Accepts one argument: query, a string that
    represents a search/filter query; and returns
    those cases that match the query as an array
    of Case objects.

    Note: this function uses the "Filter Score
    Threshold" module setting to determine the
    threshold for Lunr's similarity score.
  */
  function filterCases (query) {
    if (!query) { return cases; }

    // Retrieve the filter score threshold.
    var threshold = drupalSettings.section_106_map.filter_score_threshold;

    // Filter the case records.
    return _.compact (lunrIndex.search (query).map (
      function (result) {
        return result.score < threshold ? null :
          _.find (cases,
            function (_case) {
              return _case.id === result.ref;
          });
    }));
  }

  /*
    Accepts one argument: cases, an array of
    Case objects that represent a set of section
    106 consultations; and adds cases to the
    Lunr index.
  */
  function indexCases (cases) {
    cases.forEach (indexCase);
  }

  /*
    Accepts one argument: case, a Case object
    that represents a section 106 consultation;
    and adds case to the Lunr index.
  */ 
  function indexCase (_case) {
    lunrIndex.add ({
      id:     _case.id,
      title:  _case.title,
      body:   _case.body,
      agency: _case.agency.title,
      state:  _case.state,
      status: _case.status
    });
  }

  /*
    Accepts one argument: stateName, a string that
    represents the name of a U.S. state or
    territory; and returns the state/territory's
    abbreviation as a string.
  */
  function getStateAbbreviation (stateName) {
    return STATE_ABBREVIATIONS [stateName.toLowerCase ()];
  }

  /*
    Accepts one argument: stateAbbreviation,
    a string that represents a valid U.S. state
    or territory abbreviation; and returns a GPS
    Coordinate object representing the center
    of the referenced state or territory.
  */
  function getStateCoordinates (stateAbbreviation) {
    return STATE_COORDINATES [stateAbbreviation];
  }

  /*
    An associative array of U.S. state and
    territory abbreviations keyed by state name.

    See: http://www.stateabbreviations.us/
  */
  var STATE_ABBREVIATIONS = {
    'alabama':                        'al',
    'alaska':                         'ak',
    'american samoa':                 'as',
    'arizona':                        'az',
    'arkansas':                       'ar',
    'california':                     'ca',
    'colorado':                       'co',
    'connecticut':                    'ct',
    'delaware':                       'de',
    'district of columbia':           'dc',
    'federated states of micronesia': 'fm',
    'florida':                        'fl',
    'georgia':                        'ga',
    'guam':                           'gu',
    'hawaii':                         'hi',
    'idaho':                          'id',
    'illinois':                       'il',
    'indiana':                        'in',
    'iowa':                           'ia',
    'kansas':                         'ks',
    'kentucky':                       'ky',
    'louisiana':                      'la',
    'maine':                          'me',
    'marshall islands':               'mh',
    'maryland':                       'md',
    'massachusetts':                  'ma',
    'michigan':                       'mi',
    'minnesota':                      'mn',
    'mississippi':                    'ms',
    'missouri':                       'mo',
    'montana':                        'mt',
    'nebraska':                       'ne',
    'nevada':                         'nv',
    'new hampshire':                  'nh',
    'new jersey':                     'nj',
    'new mexico':                     'nm',
    'new york':                       'ny',
    'north carolina':                 'nc',
    'north dakota':                   'nd',
    'northern mariana islands':       'mp',
    'ohio':                           'oh',
    'oklahoma':                       'ok',
    'oregon':                         'or',
    'palau':                          'pw',
    'pennsylvania':                   'pa',
    'puerto rico':                    'pr',
    'rhode island':                   'ri',
    'south carolina':                 'sc',
    'south dakota':                   'sd',
    'tennessee':                      'tn',
    'texas':                          'tx',
    'utah':                           'ut',
    'vermont':                        'vt',
    'virgin islands':                 'vi',
    'virginia':                       'va',
    'washington':                     'wa',
    'west virginia':                  'wv',
    'wisconsin':                      'wi',
    'wyoming':                        'wy',
  };

  /*
    An associative array of GPS coordinates
    recording the center of each U.S. state
    and territory keyed by abbreviation.

    See: http://dev.maxmind.com/geoip/legacy/codes/state_latlon/
  */
  var STATE_COORDINATES = {
    'ak': {'latitude': 61.3850, 'longitude':-152.2683},
    'al': {'latitude': 32.7990, 'longitude':-86.8073},
    'ar': {'latitude': 34.9513, 'longitude':-92.3809},
    'as': {'latitude': 14.2417, 'longitude':-170.7197},
    'az': {'latitude': 33.7712, 'longitude':-111.3877},
    'ca': {'latitude': 36.1700, 'longitude':-119.7462},
    'co': {'latitude': 39.0646, 'longitude':-105.3272},
    'ct': {'latitude': 41.5834, 'longitude':-72.7622},
    'dc': {'latitude': 38.8964, 'longitude':-77.0262},
    'de': {'latitude': 39.3498, 'longitude':-75.5148},
    'fl': {'latitude': 27.8333, 'longitude':-81.7170},
    'ga': {'latitude': 32.9866, 'longitude':-83.6487},
    'hi': {'latitude': 21.1098, 'longitude':-157.5311},
    'ia': {'latitude': 42.0046, 'longitude':-93.2140},
    'id': {'latitude': 44.2394, 'longitude':-114.5103},
    'il': {'latitude': 40.3363, 'longitude':-89.0022},
    'in': {'latitude': 39.8647, 'longitude':-86.2604},
    'ks': {'latitude': 38.5111, 'longitude':-96.8005},
    'ky': {'latitude': 37.6690, 'longitude':-84.6514},
    'la': {'latitude': 31.1801, 'longitude':-91.8749},
    'ma': {'latitude': 42.2373, 'longitude':-71.5314},
    'md': {'latitude': 39.0724, 'longitude':-76.7902},
    'me': {'latitude': 44.6074, 'longitude':-69.3977},
    'mi': {'latitude': 43.3504, 'longitude':-84.5603},
    'mn': {'latitude': 45.7326, 'longitude':-93.9196},
    'mo': {'latitude': 38.4623, 'longitude':-92.3020},
    'mp': {'latitude': 14.8058, 'longitude':145.5505},
    'ms': {'latitude': 32.7673, 'longitude':-89.6812},
    'mt': {'latitude': 46.9048, 'longitude':-110.3261},
    'nc': {'latitude': 35.6411, 'longitude':-79.8431},
    'nd': {'latitude': 47.5362, 'longitude':-99.7930},
    'ne': {'latitude': 41.1289, 'longitude':-98.2883},
    'nh': {'latitude': 43.4108, 'longitude':-71.5653},
    'nj': {'latitude': 40.3140, 'longitude':-74.5089},
    'nm': {'latitude': 34.8375, 'longitude':-106.2371},
    'nv': {'latitude': 38.4199, 'longitude':-117.1219},
    'ny': {'latitude': 42.1497, 'longitude':-74.9384},
    'oh': {'latitude': 40.3736, 'longitude':-82.7755},
    'ok': {'latitude': 35.5376, 'longitude':-96.9247},
    'or': {'latitude': 44.5672, 'longitude':-122.1269},
    'pa': {'latitude': 40.5773, 'longitude':-77.2640},
    'pr': {'latitude': 18.2766, 'longitude':-66.3350},
    'ri': {'latitude': 41.6772, 'longitude':-71.5101},
    'sc': {'latitude': 33.8191, 'longitude':-80.9066},
    'sd': {'latitude': 44.2853, 'longitude':-99.4632},
    'tn': {'latitude': 35.7449, 'longitude':-86.7489},
    'tx': {'latitude': 31.1060, 'longitude':-97.6475},
    'ut': {'latitude': 40.1135, 'longitude':-111.8535},
    'va': {'latitude': 37.7680, 'longitude':-78.2057},
    'vi': {'latitude': 18.0001, 'longitude':-64.8199},
    'vt': {'latitude': 44.0407, 'longitude':-72.7093},
    'wa': {'latitude': 47.3917, 'longitude':-121.5708},
    'wi': {'latitude': 44.2563, 'longitude':-89.6385},
    'wv': {'latitude': 38.4680, 'longitude':-80.9696},
    'wy': {'latitude': 42.7475, 'longitude':-107.2085}
  };
}) (jQuery);

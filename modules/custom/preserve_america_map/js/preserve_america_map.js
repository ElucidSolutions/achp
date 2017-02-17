/**
  @file
  Defines the Preserve America Map Feature
  behavior. Preserve America Maps are Drupal
  blocks that maps Preserve America Communities.
*/
(function ($) {
  // The Lunr Search Index.
  var lunrIndex = null;

  // The Preserve America Community profiles.
  var profiles = [];

  // The set of feature instances
  var instances = [];

  $(document).ready (function () {
    // Initialize the Lunr search index.
    lunrIndex = lunr (function () {
      this.field ('id');
      this.field ('title', 100);
      this.field ('body');
      this.field ('website', 100);
      this.field ('location', 100);
      this.field ('states', 100);
    });

    // Remove the stemmer pipeline function due to problems handling incomplete words.
    // See: https://github.com/olivernn/lunr.js/issues/38
    lunrIndex.pipeline.reset ();

    // Retrieve the community profiles.
    profiles = _.chain (drupalSettings.preserve_america_map.profiles)
      .sortBy (function (profile) { return profile.title; })
      .value ();

    // Index the profile records.
    profiles.forEach (function (profile) {
      lunrIndex.add ({
        id:       profile.id,
        title:    profile.title,
        body:     profile.body,
        website:  profile.website,
        location: profile.location,
        states:   profile.states.join ()
      });
    });

    // Create and attach the feature instances.
    $('.preserve_america_map').each (function (i, containerElement) {
      // create and attach a new map instance.
      var instance = new FeatureInstance ($(containerElement));

      // scale the map instance.
      instance.scale ();

      // add the instance to the instances array.
      instances.push (instance);
    });
  });

  /*
    Resize the instance elements when the screen
    size changes.
  */
  $(window).resize (function () {
    // resize each instance's map element.
    instances.forEach (function (instance) {
      instance.scale ();
    });
  })

  /*
    Accepts one argument: query, a string that
    represents a search/filter query; and returns
    those profiles that match the query as an array
    of Profile objects.

    Note: this function uses the "Filter Score
    Threshold" module setting to determine the
    threshold for Lunr's similarity score.
  */
  function filterProfiles (query) {
    if (!query) { return profiles; }

    // Retrieve the filter score threshold.
    var threshold = drupalSettings.preserve_america_map.filter_score_threshold;

    // Filter the profile records.
    return _.compact (lunrIndex.search (query).map (
      function (result) {
        return result.score < threshold ? null :
          _.find (profiles,
            function (profile) {
              return profile.id === result.ref;
          });
    }));
  }

  // II. Feature Instance.

  /*
    The Map feature adapts to large and small
    display sceens. When viewed on a small
    device, this feature adds a CSS class
    indicating that it should use a small
    height. This integer specifies the maximum
    size that the display screen must be for
    this feature to add the small class.

    Note: This value should be large enough to
    ensure that the users screen is neer fully
    covered by the map.
  */
  HEIGHT_THRESHOLD = 750;

  // Feature Instance modes
  MAP_MODE  = 0;
  GRID_MODE = 1;

  /*
    Accepts one argument: containerElement,
    a JQuery HTML Element; creates a Preserve
    America Map Feature Instance; creates an HTML
    element that represents the instance;
    attaches the element to containerElement;
    and returns the instance as a FeatureInstance
    object.
  */
  function FeatureInstance (containerElement) {
    // Create the feature instance element.
    var bodyElement = this.createBodyElement ();
    this._instanceElement = this.createInstanceElement (bodyElement);
    containerElement.append (this._instanceElement);

    // Set mode and profiles.
    this._mode  = MAP_MODE;
    this._profiles = profiles;

    // Create and attach the map and grid components.
    this._map = new Map (bodyElement);
    this._grid = new Grid (bodyElement);

    // Initialize the components.
    this.toMapMode ();
  }

  /*
    Accepts one argument: bodyElement, a JQuery
    HTML Element that represents a feature
    instance body element; and returns an
    instance element as a JQuery HTML Element.
  */
  FeatureInstance.prototype.createInstanceElement = function (bodyElement) {
    var self = this;
    var classPrefix = getFeatureClassName ();
    return $('<div></div>')
      .addClass (classPrefix)
      .append ($('<div></div>')
        .addClass (classPrefix + '_header')
        .append ($('<div></div>')
          .addClass (classPrefix + '_header_header'))
        .append ($('<div></div>')
          .addClass (classPrefix + '_header_body')
          .append ($('<div></div>')
            .addClass (classPrefix + '_header_body_tabs')
            .append ($('<div></div>')
              .addClass (getTabClassName ())
              .addClass (getMapTabClassName ())
              .text ('Map')
              .click (function () {
                  self.toMapMode ();
                  self.getMap ().focusMap ();
                }))
            .append ($('<div></div>')
              .addClass (getTabClassName ())
              .addClass (getGridTabClassName ())
              .text ('Grid')
              .click (_.bind (this.toGridMode, this))))))
      .append (bodyElement);
  }

  /*
    Accepts no arguments and returns a JQuery
    HTML Element that represents a feature
    instance body element.
  */
  FeatureInstance.prototype.createBodyElement = function () {
    return $('<div></div>')
      .addClass (getFeatureClassName () + '_body')
      .append (this.createFilterElement ());
  }

  /*
    Accepts no arguments and returns a JQuery
    HTML Element that represents a feature
    instance filter element.
  */
  FeatureInstance.prototype.createFilterElement = function () {
    var self = this;
    var classPrefix = getModuleClassPrefix () + '_filter';

    var inputElement = $('<input></input>')
      .attr ('type', 'text')
      .attr ('placeholder', 'Filter Community Profiles')
      .addClass (classPrefix + '_input')
      .on ('input', function () {
          var query = inputElement.val ();

          // toggle the clear element.
          query === '' ? clearElement.hide () : clearElement.show ();

          // filter profiles.
          self._profiles = filterProfiles (query.trim ());

          // update the active component
          switch (self.getMode ()) {
            case MAP_MODE:
              var map = self.getMap ();
              map.setMarkers (self.getProfiles ());
              map.focusMap ();
              break;
            case GRID_MODE:
              self.getGrid ().displayProfiles (self.getProfiles ());
              break;
          }
        });

    var clearElement = $('<div></div>')
      .addClass (classPrefix + '_clear')
      .click (function () {
          // clear the current input.
          inputElement.val ('');

          // reset the profiles.
          self._profiles = profiles;

          // update the active component.
          switch (self.getMode ()) {
            case MAP_MODE:
              var map = self.getMap ();
              map.centerMap ();
              map.setMarkers (self.getProfiles ());
              break;
            case GRID_MODE:
              self.getGrid ().displayProfiles (self.getProfiles ());
              break;
          }

          // hide the clear element.
          $(this).hide ();
        })
      .hide ();

    return $('<div></div>')
      .addClass (classPrefix)
      .append ($('<div></div>')
        .addClass (classPrefix + '_form')
        .append ($('<div></div>')
          .addClass (classPrefix + '_icon'))
        .append (inputElement)
        .append (clearElement));
  }

  /*
    Accepts no arguments and returns this
    instance's instance element.
  */
  FeatureInstance.prototype.getInstanceElement = function () {
    return this._instanceElement;
  }

  /*
    Accepts no arguments and returns this
    instance's current mode.
  */
  FeatureInstance.prototype.getMode = function () {
    return this._mode;
  }

  /*
    Accepts no arguments and returns the profiles
    that should be displayed in this instance.
  */
  FeatureInstance.prototype.getProfiles = function () {
    return this._profiles.slice ();
  }

  /*
    Accepts no arguments and returns this
    instance's map component as a Map object.
  */
  FeatureInstance.prototype.getMap = function () {
    return this._map;
  }

  /*
    Accepts no arguments and returns this
    instance's grid component as a Grid object.
  */
  FeatureInstance.prototype.getGrid = function () {
    return this._grid;
  }

  /*
    Accepts no arguments; hides the grid
    component element; displays the map component
    element; and returns undefined.
  */
  FeatureInstance.prototype.toMapMode = function () {
    // get the map component.
    var map = this.getMap ();

    // set the markers on the map.
    map.setMarkers (this.getProfiles ());

    // diplay the map component.
    this.selectMapTabElement ();
    this.getGrid ().hideComponentElement ();
    map.showComponentElement ();

    // resize the map to fill its container.
    map.getMap ().invalidateSize ();

    /*
      refresh the map.

      note: the invalidateSize command will
      refresh the map iff the container size
      changed. This command handles the case where
      the container size did not change.
    */
    map.refreshMap ();

    // update the mode.
    this._mode = MAP_MODE;
  }

  /*
    Accepts no arguments; hides the map component
    element; displays the grid component element;
    and returns undefined.
  */
  FeatureInstance.prototype.toGridMode = function () {
    // get the grid component.
    var grid = this.getGrid ();

    // load the profiles into the grid.
    grid.displayProfiles (this.getProfiles ());

    // display the grid component.
    this.selectGridTabElement ();
    this.getMap  ().hideComponentElement ();
    grid.showComponentElement ();

    // update the mode.
    this._mode = GRID_MODE;
  }

  /*
    Accepts no arguments and selects the grid
    tab element.
  */
  FeatureInstance.prototype.selectGridTabElement = function () {
    this.deselectTabElements ();
    this.getGridTabElement ().addClass (getSelectedClassName ());
  }

  /*
    Accepts no arguments and selects the map
    tab element.
  */
  FeatureInstance.prototype.selectMapTabElement = function () {
    this.deselectTabElements ();
    this.getMapTabElement ().addClass (getSelectedClassName ());
  }

  /*
    Accepts no arguments and deselects the
    tab elements.
  */
  FeatureInstance.prototype.deselectTabElements = function () {
    this.getTabElements ().removeClass (getSelectedClassName ());
  }

  /*
    Accepts no arguments and returns this
    instance's map tab element as a JQuery
    HTML Element.
  */
  FeatureInstance.prototype.getMapTabElement = function () {
    return $('.' + getMapTabClassName (), this.getInstanceElement ());
  }

  /*
    Accepts no arguments and returns this
    instance's grid tab element as a JQuery
    HTML Element.
  */
  FeatureInstance.prototype.getGridTabElement = function () {
    return $('.' + getGridTabClassName (), this.getInstanceElement ());
  }

  /*
    Accepts no arguments and returns this
    instance's tab element as a JQuery HTML
    Element.
  */
  FeatureInstance.prototype.getTabElements = function () {
    return $('.' + getTabClassName (), this.getInstanceElement ());    
  }

  /*
    Accepts no arguments, measures the size
    of the current display window, adds or
    removes a CSS class to indicate whether
    or not this feature should be displayed in
    small mode, and returns undefined.
  */
  FeatureInstance.prototype.scale = function () {
    // I. Add/remove the Small CSS class.
    $(window).height () >= HEIGHT_THRESHOLD ? this.removeSmallClass () : this.addSmallClass ();

    // II. Update the map element.
    this.getMap ().getMap ().invalidateSize ();
  }

  /*
    Accepts no arguments, adds the Small class
    to this instance's element, and returns
    undefined.
  */
  FeatureInstance.prototype.addSmallClass = function () {
    this.getInstanceElement ().addClass (getSmallClassName ());
  }

  /*
    Accepts no arguments, removes the Small
    class from this instance's element, and
    returns undefined.
  */
  FeatureInstance.prototype.removeSmallClass = function () {
    this.getInstanceElement ().removeClass (getSmallClassName ());
  }

  /*
    Accepts no arguments and returns a string
    representing the name of the class used to
    label the map tab.
  */
  function getMapTabClassName () {
    return getFeatureClassName () + '_map_tab';
  }

  /*
    Accepts no arguments and returns a string
    representing the name of the class used to
    label the grid tab.
  */
  function getGridTabClassName () {
    return getFeatureClassName () + '_grid_tab';
  }

  /*
    Accepts no arguments and returns a string
    representing the name of the class used to
    label the tab elements.
  */
  function getTabClassName () {
    return getFeatureClassName () + '_tab';
  }

  /*
    Accepts no arguments and returns the name
    of the class used to label instance elements
    in Small mode.
  */
  function getSmallClassName () {
    return getFeatureClassName () + '_small';
  }

  /*
    Accepts no arguments and returns a string
    representing the name of the class used to
    label feature instance elements.
  */
  function getFeatureClassName () {
    return getModuleClassPrefix () + '_feature';
  }

  // II. Map Component.
  
  // An associative array of SVGDocuments representing map icons.
  SVG_ICONS = {};

  /*
    Accepts one argument: containerElement,
    a JQuery HTML element that has already been
    attached to the DOM; creates a Map Component
    object; appends the component's elements to
    containerElement; and returns the component.
  */
  function Map (containerElement) {
    // Create the map container element.
    var mapContainerElement = createMapContainerElement ();

    // Create the component element.
    this._componentElement = createMapComponentElement (mapContainerElement);

    /*
      Append the component element.

      Note: Mapbox maps can not be loaded into a
      map container elements until the container
      element has been attached to the document
      DOM.
    */
    containerElement.append (this._componentElement);

    // Create and Embed the Mapbox Map object.
    this._map = createMap (mapContainerElement.attr ('id'));

    // Create the Mapbox Cluster Group object.
    this._clusterGroup = createClusterGroup ();

    // Add the marker cluster group to the map. 
    this._map.addLayer (this._clusterGroup);

    // center the map.
    this.centerMap ();
  }

  /*
    Accepts one argument: mapContainerElement,
    a JQuery HTML Element; and returns a JQuery
    HTML Element that represents a map component
    element.
  */
  function createMapComponentElement (mapContainerElement) {
    return $('<div></div>')
      .addClass (getModuleClassPrefix () + '_map')
      .append (createPanelElement ())
      .append (mapContainerElement);
  }

  /*
    Accepts no arguments and returns a map panel
    element as a JQuery HTML Element.
  */
  function createPanelElement () {
    return $('<div></div>').addClass (getPanelElementClassName ()).hide ();
  }

  /*
    Accepts no arguments and returns a map
    container element as a jQuery HTML Element.

    Note: this function adds a unique HTML
    element ID to the container element.
  */
  function createMapContainerElement () {
    return $('<div></div>')
      .attr ('id', _.uniqueId (getModuleClassPrefix ()))
      .addClass (getModuleClassPrefix () + '_map_container');
  }

  /*
    Accepts no arguments and returns this
    component's component element.
  */
  Map.prototype.getComponentElement = function () {
    return this._componentElement;
  }

  /*
    Accepts no arguments and returns this
    component's Leaflet Map.
  */
  Map.prototype.getMap = function () {
    return this._map;
  }

  /*
    Accepts no arguments and returns this
    component's Leaflet Cluster Group.
  */
  Map.prototype.getClusterGroup = function () {
    return this._clusterGroup;
  }

  /*
    Accepts one argument: id, an HTML ID string;
    loads a Mapbox Map into the HTML element
    referenced by id; and returns the map object.
  */
  function createMap (id) {
    // Set the Mapbox access token.
    L.mapbox.accessToken = drupalSettings.preserve_america_map.mapbox_access_token;

    // Create and Embed the Mapbox Map object.
    var map = L.mapbox.map (id, 'mapbox.streets', {
      minZoom: 2,
      maxZoom: 7
    });
    map.scrollWheelZoom.disable ();

    return map;
  }

  /*
    Accepts no arguments and returns a Mapbox
    Marker Cluster Group.
  */
  function createClusterGroup () {
    return new L.MarkerClusterGroup ({
      showCoverageOnHover: false,
      iconCreateFunction: createClusterIcon
    });
  }

  /*
    Accepts no arguments, centers and scales
    the map on the markers currently displayed
    on it, and returns undefined.
  */
  Map.prototype.focusMap = function () {
    // Zoom and center on the filtered markers.
    var bounds = this.getClusterGroup ().getBounds ();
    if (bounds && bounds._northEast && bounds._southWest) {
      var margin = .2;
      bounds._northEast.lat += margin;
      bounds._northEast.lng += margin;
      bounds._southWest.lat -= margin;
      bounds._southWest.lng -= margin;
      this.getMap ().fitBounds (bounds);
      this.refreshMap ();
    }
  }

  /*
    Accepts no arguments, centers and scales the
    map so that the U.S. (including Alaska) are
    prominently featured, and returns undefined.
  */
  Map.prototype.centerMap = function () {
    var map = this.getMap ().fitBounds (getDefaultBounds ());
    this.refreshMap ();
  }

  /*
    Accepts one argument: profiles, a Profile object
    array; removes the markers in this
    component's cluster group; creates new
    markers for those states and territories that
    contain profiles that match this component's
    current feature instance's filter query;
    adds those markers to this component's
    cluster group; and returns undefined.
  */
  Map.prototype.setMarkers = function (profiles) {
    var clusterGroup = this.getClusterGroup ();

    // Remove markers.
    clusterGroup.clearLayers ();

    // Add the newly filtered markers back in.
    this.createMarkers (profiles).forEach (clusterGroup.addLayer, clusterGroup);

    // refresh the map.
    this.refreshMap ();
  }

  /*
    Accepts no arguments, refreshes the Mapbox
    map, and returns undefined.
  */
  Map.prototype.refreshMap = function () {
    // See: http://stackoverflow.com/questions/18515230/javascript-map-in-leaflet-how-to-refresh
    // this.getMap ()._onResize (); 
    // this.getMap ().invalidateSize ();
  }

  /*
    Accepts one argument: profiles, a Profile object
    array; creates State objects that represent
    those states and territories that contain
    the profiles in profiles; creates Leaflet Marker
    objects that represent these states; and
    returns these markers in a Leaflet Marker
    object array.
  */
  Map.prototype.createMarkers = function (profiles) {
    return profiles.map (this.createMarker, this);
    // return createStates (profiles).map (this.createMarker, this);
  }

  /*
    Accepts one argument: profiles, an array of
    Profile objects; and returns an array of State
    objects representing those states and
    territories referenced by the profiles in
    profiles and partitions the profiles between them.

    Note: this function will only create State
    objects for those states and territories
    listed in STATE_ABBREVIATIONS.
  */
/*
  function createStates (profiles) {
    return _.chain (profiles)
      .pluck   ('states')
      .flatten ()
      .sort    ()
      .uniq    (true)
      .map     (function (stateName) {
        return createState (stateName, profiles.filter (
          function (profile) {
            return _.contains (profile.states, stateName);
          }));
       })
      .compact ()
      .value   ();
  }
*/
  /*
    Accepts one argument: profile, a Profile object;
    and returns a State Leaflet Marker object
    that represents profile.

    See: https://www.mapbox.com/mapbox.js/api/v2.2.4/l-marker/
  */
  Map.prototype.createMarker = function (profile) {
    var self = this;
    var marker = new L.marker (
      [profile.latitude, profile.longitude],
      {
        icon:     createMarkerIcon (profile),
        title:    profile.title
      }
    ).on ('click', function () {
      // select the profile marker.
      self.deselectMarkerElements ();
      self.selectMarkerElement (profile.id);

      // show state panel.
      self.showProfilePanelElement (profile);
    });
    return marker;
  }

  /*
    Accepts two arguments:

    * stateName, a string that represents a
      state or territory name
    * and profiles, a Profile object array 

    and returns a State object that represents
    the given state.

    Note: This function will only create State
    objects for those states and territories
    listed in STATE_ABBREVIATIONS. If stateName
    is not listed in this array, this function
    will return null.
  */
/*
  function createState (stateName, profiles) {
    var abbreviation = getStateAbbreviation (stateName);
    var coordinates  = abbreviation ? getStateCoordinates (abbreviation) : null;

    return abbreviation && coordinates ? {
      name:         stateName,
      abbreviation: abbreviation,
      coordinates:  coordinates,
      profiles:     profiles
    } : null;
  }
*/
  /*
    Accepts one argument: profile, a Profile object;
    and returns a Mapbox Icon object that represents
    the Profile marker icon.

    See: https://www.mapbox.com/mapbox.js/api/v2.4.0/l-icon/
  */
  function createMarkerIcon (profile) {
    return new L.DivIcon ({
      'html': createMarkerIconSVG (profile)
    });
  }

  /*
    Accepts one argument: cluster, a State
    Marker Cluster object; and returns a Leaflet
    Icon object that represents the cluster.
  */
  function createClusterIcon (cluster) {
    return new L.DivIcon ({
      'html': createClusterIconSVG (getClusterNumProfiles (cluster).toString ())
    });
  }

  /*
    Accepts one argument: cluster, a State
    Marker Cluster object; and returns the
    number of profiles represented by the markers
    nested within cluster as an integer.
  */
  function getClusterNumProfiles (cluster) {
    return getClusterMarkers (cluster).length;
/*
    return getClusterMarkers (cluster).reduce (
      function (numProfiles, marker) {
        return numProfiles + marker.options.state.profiles.length;
    }, 0);
*/
  }

  /*
    Accepts one argument: cluster, a Mapbox
    Marker Cluster object; and returns the markers
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
    Accepts one argument: profile, a Profile
    object; and returns an SVG Element string
    that represents a marker element for profile.
  */
  function createMarkerIconSVG (profile) {
    var svgElementString = '<div></div>';
    var svgDocument = getRawIcon ('single-profile-marker-icon', drupalSettings.module_path + '/images/single-profile-marker-icon.svg');

    if (!svgDocument) { return null; }

    var prefix = getModuleClassPrefix ();

    // Get the SVG element.
    var svgElement = document.importNode (svgDocument.documentElement, true);

    // Add a class attribute to the icon element.
    svgElement.setAttribute (getMarkerProfileIdAttribName (), profile.id);
    svgElement.className.baseVal = svgElement.className.baseVal + ' ' + getMarkerClassName () + ' ' + prefix + '_single_profile_marker';

    // Set/Create the marker's title (hover text).
    titleElements = svgElement.getElementsByTagName ('title');
    if (titleElements.length > 0) {
      titleElements.item (0).textContent = profile.title;
    } else {
      var titleElement = svgDocument.createElementNS ('http://www.w3.org/2000/svg', 'title');
      titleElement.textContent = profile.title;
      svgElement.appendChild (titleElement);
    }

    // Serialize icon element as a string.
    return new XMLSerializer ().serializeToString (svgElement);
  }

  /*
    Accepts one argument: label, a string; and
    returns an SVG element string that represents
    a Cluster Icon labeled label.
  */
  function createClusterIconSVG (label) {
    var svgElementString = '<div></div>';
    var svgDocument= getRawIcon ('marker-group-icon', drupalSettings.module_path + '/images/marker-group-icon.svg');
    if (!svgDocument) { return null; }

    var prefix = getModuleClassPrefix ();

    // Get the SVG element.
    var svgElement = document.importNode (svgDocument.documentElement, true);

    // Add a class attribute to the icon element.
    svgElement.className.baseVal = svgElement.className.baseVal + ' ' + prefix + '_cluster_marker';

    // Remove the title element (hover text).
    var titleElements = svgElement.getElementsByTagName ('title');
    if (titleElements.length > 0) {
      titleElements.item (0).textContent = '';
    }

    // Add cluster child count to the icon element.
    labelElement = document.importNode (svgDocument.createElementNS ('http://www.w3.org/2000/svg', 'text'), true);
    labelElement.setAttribute ('transform', 'translate(30, 25)');
    labelElement.className.baseVal = labelElement.className.baseVal + ' ' + prefix + '_cluster_marker_label';
    labelElement.textContent = label;
    svgElement.appendChild (labelElement);

    // Serialize icon element as a string.
    return new XMLSerializer ().serializeToString (svgElement);
  }

  /*
    Accepts two arguments:

    * name, a string
    * and url, a URL string

    gets the SVG file referenced by URL, caches
    the icon, and returns the file as an
    SVGDocument.
  */
  function getRawIcon (name, url) {
    if (!SVG_ICONS [name]) {
      $.ajax (url,
        {
          async: false,
          success: function (svgDocument) {
            SVG_ICONS [name] = svgDocument;
          },
          error: function () {
            console.log ('[preserve_america_map] Error: an error occured while trying to load a map icon.');
          }
      });
    }
    return SVG_ICONS [name] ? (SVG_ICONS [name]).cloneNode (true) : null;
  }

  /*
    Accepts one argument: profile, a Profile
    object; and returns a JQuery HTML Element
    that represents a profile panel element
    representing profile.
  */
  Map.prototype.createProfilePanelElement = function (profile) {
    var self = this;
    var classPrefix = getModuleClassPrefix () + '_profile_panel';
    var dataPrefix  = getModuleDataPrefix () + '-profile-panel';
    return $('<div></div>')
      .addClass (classPrefix)
      .attr (dataPrefix + '-profile-name', profile.title)
      .attr (dataPrefix + '-profile-id', profile.id)
      .append ($('<div></div>')
        .addClass (classPrefix + '_header')
        .append ($('<div></div>')
          .addClass (classPrefix + '_header_title')
          .text ('Preserve America Community'))
        .append ($('<div></div>')
          .addClass (classPrefix + '_header_close_button'))
          .click (_.bind (this.hidePanelElement, this)))
      .append ($('<div></div>')
        .addClass (classPrefix + '_body')
        .append ($('<div></div>')
          .addClass (classPrefix + '_profile_profiles_list')
          .append (createProfileElement (profile, 0))))
      .append ($('<div></div>')
        .addClass (classPrefix + '_footer'));
  }

  /*
    Accepts no arguments; displays this
    component's element; and returns undefined.
  */
  Map.prototype.showComponentElement = function () {
    this.getComponentElement ().show ();
  }

  /*
    Accepts no arguments; hides this component's
    element; and returns undefined.
  */
  Map.prototype.hideComponentElement = function () {
    this.getComponentElement ().hide ();
  }

  /*
    Accepts one argument: profile, a Profile object;
    creates a profile panel element that represents
    profile; adds that element to this component's
    panel element; displays the panel element;
    and returns undefined.
  */
  Map.prototype.showProfilePanelElement = function (profile) {
    this.hideLogoElement ();
    this.getPanelElement ()
      .empty ()
      .append (this.createProfilePanelElement (profile))
      .show ('slide', {direction: 'right'}, 500,
        function () {
          // create profile share elements.
          a2a.init_all ('page');

          // enable the link button.
          var clipboard = new Clipboard ('.' + getShareLinkClassName ());
          clipboard.on ('success', function (event) {
            toastr.options = {
              positionClass: 'toast-bottom-center',
              preventDuplicates: true
            };
            toastr.info ('Link Copied to Clipboard.');
          });
        });
  }

  /*
    Accepts no arguments and hides this
    component's panel element.
  */
  Map.prototype.hidePanelElement = function () {
    this.showLogoElement ();
    this.getPanelElement ().hide ('slide', {direction: 'right'}, 500);
  }

  /*
    Accepts one argument: profileId,
    an integer that represents a profile
    node ID; and selects the marker
    associated with the profile referenced by
    profileId.
  */
  Map.prototype.selectMarkerElement = function (profileId) {
    var markerElement= this.getMarkerElement (profileId).get (0);
    markerElement.className.baseVal = markerElement.className.baseVal + ' ' + getSelectedClassName ();
  }

  /*
    Accepts no arguments and deselects all of
    the markers.
  */
  Map.prototype.deselectMarkerElements = function () {
    var className = getSelectedClassName ();
    this.getMarkerElements ().each (
      function (i, markerElement) {
        markerElement.className.baseVal = markerElement.className.baseVal.replace (className, '').trim ();
    });
  }

  /*
    Accepts no arguments and shows the Mapbox
    Logo element (which is legally required
    under Mapbox's terms and conditions).
  */
  Map.prototype.showLogoElement = function () {
    this.getLogoElement ().show ();
  }

  /*
    Accepts no arguments and hides the Mapbox
    Logo element. Call this function when
    displaying profile detail panes which should
    cover the logo element.
  */
  Map.prototype.hideLogoElement = function () {
    this.getLogoElement ().hide ();
  }

  /*
    Accepts no arguments and returns this
    component's panel element as a JQuery HTML
    Element.
  */
  Map.prototype.getPanelElement = function () {
    return $('.' + getPanelElementClassName (), this.getComponentElement ());
  }

  /*
    Accepts argument: profileId, an integer
    that represents a profile node ID; and
    returns a jQuery HTML Element that represents
    the marker for the profile referenced by
    profileId.
  */
  Map.prototype.getMarkerElement = function (profileId) {
    return $('.' + getMarkerClassName () + '[' + getMarkerProfileIdAttribName () + '="' + profileId + '"]', this.getComponentElement ());
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element Set containing all of this
    component's marker elements.
  */
  Map.prototype.getMarkerElements = function () {
    return $('.' + getMarkerClassName (), this.getComponentElement ());
  }

  /*
    Accepts no arguments and returns the Mapbox
    Logo element as a jQuery HTML Element.
  */
  Map.prototype.getLogoElement = function () {
    return $('.' + getLogoClassName (), this.getComponentElement ());
  }

  /*
    Accepts no arguments and returns a string
    representing the class name used to label
    panel elements.
  */
  function getPanelElementClassName () {
    return getModuleClassPrefix () + '_map_panel';
  }

  /*
    Accepts no arguments and returns a string
    representing the class name used to label
    markers.
  */
  function getMarkerClassName () {
    return getModuleClassPrefix () + '_marker';
  }

  /*
    Accepts no arguments and returns a string
    representing the name of the marker profile
    ID data attribute.
  */
  function getMarkerProfileIdAttribName () {
    return getModuleDataPrefix () + '-marker-profile';
  }

  /*
    Accepts no arguments and returns the Mapbox
    logo class name as a string.
  */
  function getLogoClassName () {
    return 'mapbox-logo';
  }

  // III. Grid Component.

  /*
    Accepts one argument: containerElement, a
    JQuery HTML Element; creates a Grid object;
    creates an HTML element that represents
    the grid object; appends the element to
    containerElement; and returns the grid
    object.
  */
  function Grid (containerElement) {
    this._profiles = [];
    this._currentPage = 0;
    this._componentElement = this.createComponentElement ();
    containerElement.append (this._componentElement);
  }

  /*
    Accepts no arguments and returns an array of
    the Profile objects displayed in this component.
  */
  Grid.prototype.getProfiles = function () {
    return this._profiles;
  }

  /*
    Accepts no arguments and returns this
    component's current page as an integer.
  */
  Grid.prototype.getCurrentPage = function () {
    return this._currentPage;
  }

  /*
    Accepts no arguments and returns this
    component's component element as a JQuery
    HTML Element.
  */
  Grid.prototype.getComponentElement = function () {
    return this._componentElement;
  }

  /*
    Accepts no arguments and returns a grid
    element listing the Preserve America
    Communities associated with each state.
  */
  Grid.prototype.createComponentElement = function () {
    var classPrefix = getComponentClassName ();
    return $('<div></div>')
      .addClass (classPrefix)
      .append (this.createOverlayElement ())
      .append ($('<div></div>')
        .addClass (classPrefix + '_header'))
      .append ($('<div></div>')
        .addClass (classPrefix + '_body'))
      .append ($('<div></div>')
        .addClass (classPrefix + '_footer'))
      .hide ();
  }

  /*
    Accepts no arguments and returns an overlay
    element that is used to present detailed
    information about profiles as a JQuery HTML
    Element.
  */
  Grid.prototype.createOverlayElement = function () {
    var self = this;
    var classPrefix = getOverlayClassName ();
    return $('<div></div>')
      .addClass (classPrefix)
      .append ($('<div></div>')
        .addClass (classPrefix + '_header')
        .append ($('<div></div>')
          .addClass (classPrefix + '_close_button')
          .click (function () {
              self.hideOverlayElement ();
            })))
      .append ($('<div></div>')
        .addClass (getOverlayBodyClassName ()))
      .append ($('<div></div>')
        .addClass (getOverlayFooterClassName ()))
      .hide ();
  }

  /*
    Accepts one argument: profiles, a Profile array;
    and displays the given profiles in this
    component.
  */
  Grid.prototype.displayProfiles = function (profiles) {
    this._profiles = profiles;
    this.setPage (0);
  }

  /*
    Accepts one argument: page, an integer that
    represents a page index; and displays the
    given page.
  */
  Grid.prototype.setPage = function (page) {
    // Update the current page index.
    this._currentPage = page;

    // Update the body element.
    this.getBodyElement ().empty ().append (this.getCurrentPageCards ());

    // Update the nav element.
    this.getFooterElement ().empty ().append (this.createNavElement ());
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents this component's
    nav element.
  */
  Grid.prototype.createNavElement = function () {
    return $('<div></div>')
      .addClass (getNavClassName ())
      .append (this.createNavLinksElement ());
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents this component's
    nav links element.
  */
  Grid.prototype.createNavLinksElement = function () {
    return $('<div></div>')
      .addClass (getNavClassName () + '_links')
      .append (this.createPrevLinkElement ())
      .append (this.createNavLinkElements ())
      .append (this.createNextLinkElement ())
      .append (this.createNavStatsElement ());
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents this component's
    nav stats element.
  */
  Grid.prototype.createNavStatsElement = function () {
    return $('<div></div>')
      .addClass (getNavClassName () + '_stats')
      .text ((this.getProfiles ().length > 0 ? this.getCurrentPageStart () + 1 : '0') + '-' + this.getCurrentPageEnd () + ' of ' + this.getProfiles ().length + ' Preserve Americas');
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents a link to this
    component's next page.
  */
  Grid.prototype.createNextLinkElement = function () {
     return (this.currentPageIsLast () ?
        this.createNavLinkElement (this.getCurrentPage (), '', false) :
        this.createNavLinkElement (this.getCurrentPage () + 1, '', true))
      .addClass (getNavClassName () + '_next');
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents a link to this
    component's previous page.
  */
  Grid.prototype.createPrevLinkElement = function () {
     return (this.currentPageIsFirst () ?
        this.createNavLinkElement (this.getCurrentPage (), '', false) :
        this.createNavLinkElement (this.getCurrentPage () - 1, '', true))
      .addClass (getNavClassName () + '_prev');
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element array that represents the direct
    page links that should be displayed in this
    component's nav element centered on the
    current page.
  */
  Grid.prototype.createNavLinkElements = function () {
    var self = this;
    var classPrefix = getNavClassName ();

    // get the page indicies range.
    var range = this.getNavLinkRange ();

    // create main links.
    var linkElements = _.range (range.start, range.end)
      .map (function (page) {
        return self.createNavLinkElement (page, page + 1, true)
          .addClass (self.getCurrentPage () === page && getSelectedClassName ());
      });

    // create quick links.
    if (range.start > 0) {
      linkElements.unshift (this.createNavLinkElement (0, '1', true)
        .addClass (classPrefix + '_quick_link')
        .addClass (classPrefix + '_quick_link_start'));
      
    }
    var numPages = this.getNumPages ();
    if (range.end < numPages) {
      linkElements.push (this.createNavLinkElement (numPages - 1, numPages, true)
        .addClass (classPrefix + '_quick_link')
        .addClass (classPrefix + '_quick_link_end'));
    }
    return linkElements;
  }

  /*
    Accepts two arguments:

    * page, an integer that represents a page index
    * label, a string
    * and enabled, a boolean value

    and returns a jQuery HTML Element that
    represents a nav link element that when
    clicked while enabled sets this component's
    current page to page.
  */
  Grid.prototype.createNavLinkElement = function (page, label, enabled) {
    var self = this;
    var classPrefix = getNavClassName ();
    return $('<div></div>')
      .addClass (classPrefix + '_link')
      .addClass (enabled ? '' : getDisabledClassName ())
      .text (label)
      .click (function () {
        enabled && self.setPage (page);
      });
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element array that represents the
    profile cards that should be displayed on this
    component's current page.
  */
  Grid.prototype.getCurrentPageCards = function () {
    return _.range (this.getCurrentPageStart (), this.getCurrentPageEnd ())
            .map (this.createProfileCard, this);
  }

  /*
    Accepts one argument: profileIndex, an integer
    referencing a profile in this component's profiles
    array; and returns a JQuery HTML Element
    that represents the referenced profile.
  */
  Grid.prototype.createProfileCard = function (profileIndex) {

    var self = this;
    var profile = this.getProfiles () [profileIndex];
    var classPrefix = getModuleClassPrefix () + '_profile_card';

    var TITLE_MAX_NUM_LINES = 2;
    var TITLE_MAX_LINE_LENGTH = 28;
    return profile ?
      $('<div></div>')
        .addClass (classPrefix)
        .attr (getModuleDataPrefix () + '-map-profile', profile.id)
        .append ($('<div></div>')
          .addClass (classPrefix + '_expand_button')
          .append ($(document.importNode (getRawIcon ('expand-icon', drupalSettings.module_path + '/images/expand-icon.svg').documentElement, true)) 
            .addClass (classPrefix + '_expand_button_icon')))
        .append ($('<div></div>')
          .addClass (classPrefix + '_title')
          .text (ellipse (TITLE_MAX_LINE_LENGTH, TITLE_MAX_NUM_LINES, profile.title)))
        .append ($('<div></div>')
          .addClass (classPrefix + '_state')
          .text (profile.state))
        .click (function () {
            $(window).width () < 650 ?
              window.location.href = profile.url :
              self.showProfileOverlayElement (profileIndex);
          })
      : null;
  }

  /*
    Accepts one argument: profileIndex, an integer
    referencing a profile in this component's profiles
    array; and displays the profile details element
    in this instance's overlay element.
  */
  Grid.prototype.showProfileOverlayElement = function (profileIndex) {
    this.getOverlayBodyElement ()
      .empty ()
      .append (createProfileElement (this.getProfiles () [profileIndex], profileIndex));

    this.getOverlayFooterElement ()
      .empty ()
      .append (this.createProfileNavElement (profileIndex));

    this.getOverlayElement ().show (
      function () {
        // create profile share elements.
        a2a.init_all ('page');

        // enable the link button.
        var clipboard = new Clipboard ('.' + getShareLinkClassName ());
        clipboard.on ('success', function (event) {
          toastr.options = {
            positionClass: 'toast-bottom-center',
            preventDuplicates: true
          };
          toastr.info ('Link Copied to Clipboard.');
        });
      })
      .animate ({
        top: 0,
        width: "96%",
        height: "94%",
        left: 0,
        margin: "1% 2%",
      });
  }

  /*
    Accepts one argument: profileIndex, an integer
    referencing a profile in this component's profiles
    array; and returns a jQuery HTML Element
    that represents a nav element displayed on
  */
  Grid.prototype.createProfileNavElement = function (profileIndex) {
    var self = this;
    var classPrefix = getOverlayClassName () + '_nav';
    return $('<div></div>')
      .addClass (classPrefix)
      .append ($('<span></span>')
        .addClass (classPrefix + '_prev')
        .addClass (0 >= profileIndex && classPrefix + '_disabled')
        .text ('PREVIOUS')
        .click (function (e) {
          0 < profileIndex ?
            self.showProfileOverlayElement (profileIndex - 1) :
            e.preventDefault ();
          }))
      .append ($('<span></span>')
        .addClass (classPrefix + '_next')
        .addClass (profileIndex >= self.getCurrentPageEnd () - 1 && classPrefix + '_disabled')
        .text ('NEXT')
        .click (function (e) {
          self._profiles.length > profileIndex + 1 ?
            self.showProfileOverlayElement (profileIndex + 1) :
            e.preventDefault ();
          }));      
  }

  /*
    Accepts no arguments and displays this
    instance's grid element.
  */
  Grid.prototype.showComponentElement = function () {
    this.getComponentElement ().show ();
  }

  /*
    Accepts no arguments and animates the
    instance's overlay element out of view.
  */
  Grid.prototype.hideOverlayElement = function () {
   overlayElement = this.getOverlayElement ();

   // Make overlay element appear empty before closing it
   overlayElement.find($('.preserve_america_map_grid_overlay_body')).hide ();
   overlayElement.find($('.preserve_america_map_grid_overlay_footer')).hide ();
   overlayElement.animate ({
      width: 0,
      height: 0,
      top: '50%',
      left: '50%'  
    }, 'slow', function () {
      
      // Hides overlay container element, but re-shows its contents so that
      // they continue to display when the overlay is reopened
      overlayElement.hide ();
      overlayElement.find($('.preserve_america_map_grid_overlay_body')).show ();
      overlayElement.find($('.preserve_america_map_grid_overlay_footer')).show ();
    });  
  }

  /*
    Accepts no arguments and hides this instance
    element's grid element.
  */
  Grid.prototype.hideComponentElement = function () {
    this.getComponentElement ().hide ();
  }

  /*
    Accepts no arguments and returns this
    component's overlay body element.
  */
  Grid.prototype.getOverlayBodyElement = function () {
    return $('.' + getOverlayBodyClassName (), this.getOverlayElement ());
  }

  /*
    Accepts no arguments and returns this
    component's overlay footer element.
  */
  Grid.prototype.getOverlayFooterElement = function () {
    return $('.' + getOverlayFooterClassName (), this.getOverlayElement ());
  }

  /*
    Accepts no arguments and returns this
    component's overlay element.
  */
  Grid.prototype.getOverlayElement = function () {
    return $('.' + getOverlayClassName (), this.getComponentElement ());
  }

  /*
    Accepts no arguments and returns this
    component's body element as a jQuery HTML
    Element.
  */
  Grid.prototype.getBodyElement = function () {
    return $('.' + getGridBodyClassName (), this.getComponentElement ());
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents this component's
    footer element.
  */
  Grid.prototype.getFooterElement = function () {
    return $('.' + getGridFooterClassName (), this.getComponentElement ());
  }

  /*
    Accepts no arguments and returns a string
    representing the class name used to label
    overlay body elements.
  */
  function getOverlayBodyClassName () {
    return getOverlayClassName () + '_body';
  }

  /*
    Accepts no arguments and returns a string
    representing the class name used to label
    overlay footer elements.
  */
  function getOverlayFooterClassName () {
    return getOverlayClassName () + '_footer';
  }

  /*
    Accepts no arguments and returns a string
    representing the class name used to label
    overlay elements.
  */
  function getOverlayClassName () {
    return getComponentClassName () + '_overlay';
  }

  /*
    Accepts no arguments and returns a string
    that represents the class name used to label
    grid nav elements.
  */
  function getNavClassName () {
    return getComponentClassName () + '_nav';
  }

  /*
    Accepts no arguments and returns the class
    name used to label grid body elements as
    a string.
  */
  function getGridBodyClassName () {
    return getComponentClassName () + '_body';
  }

  /*
    Accepts no arguments and returns a string
    representing the class named used to label
    grid footer elements.
  */
  function getGridFooterClassName () {
    return getComponentClassName () + '_footer';
  }

  /*
    Accepts no arguments and returns a string
    representing the class name used to label
    grid elements.
  */
  function getComponentClassName () {
    return getModuleClassPrefix () + '_grid';
  }

  /*
    Accepts no arguments and returns an integer
    that representing the index of the last
    profile in this component's profile array that
    should be displayed on the current page.
  */
  Grid.prototype.getCurrentPageEnd = function () {
    return this.getPageEnd (this.getCurrentPage ());
  }

  /*
    Accepts one argument: page, an integer that
    represents a page index; and returns the
    index of the last profile in this component's
    profiles array that should be displayed on the
    referenced page.
  */
  Grid.prototype.getPageEnd = function (page) {
    return Math.min (this.getPageStart (page) + getNumProfilesPerPage (), this.getProfiles ().length);
  }

  /*
    Accepts no arguments and returns an integer
    that representing the index of the first
    profile in this component's profile array that
    should be displayed on the current page.
  */
  Grid.prototype.getCurrentPageStart = function () {
    return this.getPageStart (this.getCurrentPage ());
  }

  /*
    Accepts one argument: page, an integer that
    represents a page index; and returns the
    index of the first profile in this component's
    profiles array that should be displayed on the
    referenced page.
  */
  Grid.prototype.getPageStart = function (page) {
    return getNumProfilesPerPage () * page;
  }

  /*
    Accepts no arguments and returns true
    iff this component's current page is the
    last page.
  */
  Grid.prototype.currentPageIsLast = function () {
    return this.isLastPage (this.getCurrentPage ());
  }

  /*
    Accepts no arguments and returns true
    iff this component's current page is the
    first page.
  */
  Grid.prototype.currentPageIsFirst = function () {
    return this.isFirstPage (this.getCurrentPage ());
  }

  /*
    Accepts one argument: page, an integer that
    represents a page index; and returns true iff
    page references this component's last page.
  */
  Grid.prototype.isLastPage = function (page) {
    return page >= this.getNumPages () - 1;
  }

  /*
    Accepts one argument: page, an integer that
    represents a page index; and returns true iff
    page references this component's first page.
  */
  Grid.prototype.isFirstPage = function (page) {
    return page <= 0;
  }

  /*
    Accepts no arguments and returns an integer
    range that specifies the indicies of the
    first and last pages that should be linked
    to in the nav element.

    Note: the returned range, r, is half
    closed. Specifically, [r.start, r.end).
  */
  Grid.prototype.getNavLinkRange = function () {
    var numLinks = this.getNumLinks ();
    var currentPage = this.getCurrentPage ();

    var minFirstPage = 0;
    var maxLastPage = this.getNumPages ();

    var nominalFirstPage = currentPage - Math.floor ((numLinks - 1) / 2);
    var nominalLastPage = currentPage + Math.ceil ((numLinks + 1) / 2);

    var leftOverflow = Math.max (minFirstPage - nominalFirstPage, 0);
    var rightOverflow = Math.max (nominalLastPage - maxLastPage, 0);

    return {
      start: Math.max (nominalFirstPage - rightOverflow, minFirstPage),
      end:   Math.min (nominalLastPage + leftOverflow, maxLastPage)
    };
  }

  /*
    Accepts no arguments and returns an integer
    that represents the number of direct page
    links that should be displayed in this
    component's nav element.
  */
  Grid.prototype.getNumLinks = function () {
    return Math.min (this.getNumPages (), getMaxNumLinks ());
  }

  /*
    Accepts no arguments and returns an integer
    that represents the number of pages that
    this component has.
  */
  Grid.prototype.getNumPages = function () {
    return Math.ceil (this.getProfiles ().length / getNumProfilesPerPage ());
  }

  /*
    Accepts no arguments and returns an integer
    that represents the maximum number of links
    that should be displayed in nav elements.
  */
  function getMaxNumLinks () {
    return 5;
  }

  /*
    Accepts no arguments and returns the maximum
    number of profiles that should be displayed on
    each page as an integer.
  */
  function getNumProfilesPerPage () {
    return 6;
  }

  // IV. Auxiliary functions.

  /*
    Accepts two arguments:

    * profile, a Profile object
    * and profileIndex, an integer representing
      profile's index in the returned result set

    and returns a profile details element that
    represents profile as a jQuery HTML Element.
  */
  function createProfileElement (profile, profileIndex) {
    var classPrefix = getModuleClassPrefix () + '_profile';
    var dataPrefix  = getModuleDataPrefix () + '-profile';
    return $('<div></div>')
      .addClass (classPrefix)
      .attr (dataPrefix + '-id', profile.id)
      .attr (dataPrefix + '-index', profileIndex)
      .append ($('<div></div>')
        .addClass (classPrefix + '_item')
        .append ($('<div></div>')
          .addClass (classPrefix + '_header')
          .append ($('<div></div>')
            .addClass (classPrefix + '_title')
            .addClass ('preserve_america_profile_field')
            .append ($('<a></a>')
              .attr ('href', profile.url)
              .text (profile.title))))
        .append (profile.location && $('<div></div>')
          .addClass (classPrefix + '_location')
          .addClass ('preserve_america_profile_field')
          .text(profile.location))
        .append ($('<div></div>')
          .addClass (classPrefix + '_body')
          .append ($('<div></div>')
            .addClass (classPrefix + '_description')
            .addClass ('preserve_america_profile_field')            
            .html (profile.body)))
        .append ($('<div></div>')
          .addClass (classPrefix + '_read_more')
          .text ('Read More'))
        .append ($('<div></div>')
          .addClass (classPrefix + '_footer')
          .append (createShareElement (profile))));
  }


  /*
    Accepts one argument: profile, a Profile object;
    and returns an HTML element that contains
    multiple sharing options for profile as a
    JQuery HTML Element.

    Note: This function displays
    elements created by the AddToAny
    (https://www.drupal.org/project/addtoany)
    module.
  */
  function createShareElement (profile) {
    var classPrefix = getShareClassName ();
    var dataPrefix = getModuleDataPrefix () + '-share';

    return $('<div></div>')
      .addClass (classPrefix)
      .attr (dataPrefix + '-profile-id', profile.id)
      .addClass ('a2a_kit a2a_kit_size_32 a2a_default_style')
      .attr ('data-a2a-url', profile.url)
      .attr ('data-a2a-title', profile.title)
      .append ($('<div></div>')
        .addClass (classPrefix + '_label')
        .text ('SHARE'))
      .append ($('<div></div>')
        .addClass (classPrefix + '_button')
        .addClass (classPrefix + '_facebook')
        .append ($('<a></a>')
          .addClass ('a2a_button_facebook')
          .addClass (classPrefix + '_link')
          .append ($(document.importNode (getRawIcon ('facebook-icon', drupalSettings.module_path + '/images/facebook-icon.svg').documentElement, true))
            .addClass (classPrefix + '_icon')
            .addClass (classPrefix + '_facebook_icon'))))
      .append ($('<div></div>')
        .addClass (classPrefix + '_button')
        .addClass (classPrefix + '_twitter')
        .append ($('<a></a>')
          .addClass ('a2a_button_twitter')
          .addClass (classPrefix + '_link')
          .append ($(document.importNode (getRawIcon ('twitter-icon', drupalSettings.module_path + '/images/twitter-icon.svg').documentElement, true))
            .addClass (classPrefix + '_icon')
            .addClass (classPrefix + '_twitter_icon'))))
      .append ($('<div></div>')
        .addClass (classPrefix + '_button')
        .addClass (classPrefix + '_mail')
        .append ($('<a></a>')
          .addClass (classPrefix + '_mail_link')
          .addClass (classPrefix + '_link')
          .attr ('href', 'mailto:?subject=Take%20a%20look%20at%20this%20&body=Take%20a%20look%20at%20this%20%3A%0A%0A' + profile.url)
          .append ($(document.importNode (getRawIcon ('email-icon', drupalSettings.module_path + '/images/email-icon.svg').documentElement, true))
            .addClass (classPrefix + '_icon')
            .addClass (classPrefix + '_mail_icon'))))
      .append ($('<div></div>')
        .addClass (classPrefix + '_button')
        .addClass (getShareLinkClassName ())
        .attr ('data-clipboard-text', profile.url) // Uses clipboard.js to copy URLS to clipboards.
        .append ($(document.importNode (getRawIcon ('link-icon', drupalSettings.module_path + '/images/link-icon.svg').documentElement, true))
          .addClass (classPrefix + '_icon')
          .addClass (classPrefix + '_link_icon')));
  }

  /*
    Accepts no arguments and returns a string
    representing the name of the class used to
    label disabled elements.
  */
  function getDisabledClassName () {
    return getModuleClassPrefix () + '_disabled';
  }

  /*
    Accepts no arguments and returns a string
    representing the name of the class used to
    label "selected" elements.
  */
  function getSelectedClassName () {
    return getModuleClassPrefix () + '_selected';
  }

  /*
    Accepts no arguments and returns the string
    used to label share link elements.
  */
  function getShareLinkClassName () {
    return getShareClassName () + '_link';
  }

  /*
    Accepts no arguments and returns the string
    used to label share elements.
  */
  function getShareClassName () {
    return getModuleClassPrefix () + '_share';
  }

  /*
    Accepts no arguments and returns the standard
    class prefix that should be used by all HTML
    classes created by this module as a string.
  */
  function getModuleClassPrefix () {
    return 'preserve_america_map';
  }

  /*
    Accepts no arguments and returns a string
    representing the standard data attribute
    prefix that should be used by all HTML data
    attributes created by this module.
  */
  function getModuleDataPrefix () {
    return 'data-preserve-america-map';
  }

  /*
    Returns an array that represents the
    coordinates for the default bounding box
    for the map.

    note: the setView and panTo Leaflet functions
    break the cluster group feature. To work
    around this limitation, we use the fitBounds
    function for both centering and focusing.
  */
  function getDefaultBounds () {
    return [[50.00, -126.00], [17.00, -64.00]];
  }

  /*
    Returns an integer that represents the
    default zoom level.
  */
  function getDefaultZoom () {
    return 3;
  }

  /*
    Accepts one argument: stateName, a string that
    represents the name of a U.S. state or
    territory; and returns the state/territory's
    abbreviation as a string.
  */
/*
  function getStateAbbreviation (stateName) {
    return STATE_ABBREVIATIONS [stateName.toLowerCase ()];
  }
*/
  /*
    Accepts one argument: stateAbbreviation,
    a string that represents a valid U.S. state
    or territory abbreviation; and returns a GPS
    Coordinate object representing the center
    of the referenced state or territory.
  */
/*
  function getStateCoordinates (stateAbbreviation) {
    return STATE_COORDINATES [stateAbbreviation];
  }
*/
  /*
    An associative array of U.S. state and
    territory abbreviations keyed by state name.

    See: http://www.stateabbreviations.us/
  */
/*
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
*/
  /*
    An associative array of GPS coordinates
    recording the center of each U.S. state
    and territory keyed by abbreviation.

    See: http://dev.maxmind.com/geoip/legacy/codes/state_latlon/
  */
/*
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
*/
  /*
    Accepts three arguments:

    * maxLineLength, an integer
    * maxNumLines, an integer
    * and text, a string

    and returns a cropped version of text
    designed to fit within maxNumLines lines
    where each line has, at most, maxLineLength
    characters, and appends an ellipse onto the
    result if some characters were cropped.
  */
  function ellipse (maxLineLength, maxNumLines, text) {
    if (text === null) { return ''; }

    var index = 0;
    var numLines = 1;
    var currentLineLength = 0;
    while (index < text.length) {
      var word = text.slice (index).match (/\s*\S*/)[0];

      var newLineLength = currentLineLength + word.length;
      if (newLineLength <= maxLineLength) {
        // append the current word onto the end of the current line.
        currentLineLength = newLineLength;
        index += word.length;
      } else { // the current word will not fit onto the end of the current line.
        var remainingLineLength = maxLineLength - currentLineLength;
        if (word.length <= maxLineLength) {
          // wrap the current word onto the next line.
          if (numLines === maxNumLines) {
            return appendEllipsis (index + remainingLineLength, text.slice (0, index));
          }
        } else { // the current word will not fit on a single line.
          // break the current word across the line boundary.
          index += remainingLineLength;
          if (numLines === maxNumLines) {
            return appendEllipsis (index, text.slice (0, index));
          }
        }
        numLines ++;
        currentLineLength = 0;
      }
    }
    // if we reach here, the entire text fit within the given number of lines.
    return text;
  }

  /*
    Accepts two arguments:

    * maxLength, an integer
    * and text, a string

    trims text so that we can append an ellipsis
    to it while remaining within maxLength
    characters.
  */
  function appendEllipsis (maxLength, text) {
    if (maxLength - text.length >= 3) {
      // we can append an ellipsis and remain within the character limit.
      return text + '...';
    } else {
      // we can not fit the text and the ellipsis within the character limit.
      switch (text.length) {
        case 0:
          return '';
        case 1:
          return '.';
        case 2:
          return '..';
        default:
          return text.slice (0, ((maxLength - text.length) - 3)) + '...';
      }
    }
  }
}) (jQuery);

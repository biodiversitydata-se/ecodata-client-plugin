/*
import ko from 'knockout';
import geojson2svg from 'geojson2svg';
import area from '@turf/area';
import length from '@turf/length';
import bbox from '@turf/bbox';
*/

/**
 * This extender is designed to be rendered by the ModelJSTagLib and relies on the ko.extenders.metadata extender
 * existing in the chain before this one.
 *
 * @param target
 * @param options
 * @returns {*}
 */
ko.extenders.feature = function (target, options) {

    if (!options.featureCollection) {
        throw "This extender requires a callback that will be used as a mechanism to store features collected by this extender"
    }

    target([]);
    options.featureCollection.registerFeature(target);

    var featureIds = [];
    var hasLength = true;
    var hasArea = true;

    var SQUARE_METERS_IN_HECTARE = 10000;

    function m2ToHa(areaM2) {
        return areaM2 / SQUARE_METERS_IN_HECTARE;
    }

    target.areaHa = function () {
        var areaInM2 = turf.area(ko.utils.unwrapObservable(target.toGeoJson()));
        return m2ToHa(areaInM2);
    };
    target.lengthKm = function () {
        return turf.length(ko.utils.unwrapObservable(target.toGeoJson()), {units: 'kilometers'});
    };

    /**
     * Don't save the actual features, they are managed by the context (as they are stored in a site).
     * Instead return an array of the ids of the features referenced by this field.
     * Also relevant is whether the user has elected that length and/or area are relevant metrics for the feature data.
     * @returns {{featureIds: (Array|*), useArea: *, useLength: *}}
     */
    target.toJSON = function() {
        return {
            featureIds:featureIds,
            hasArea:hasArea,
            hasLength:hasLength
        };
    };

    /**
     *
     * @param data
     */
    target.loadData = function(data) {
        data = data || {};

        featureIds = data.featureIds || [];
        var featureCollection = options.featureCollection.allFeatures();
        target(_.filter(featureCollection, function(feature) {
            if (feature.properties && feature.properties.id) {
                return _.indexOf(data.featureIds, feature.properties.id) >= 0;
            }
            return false;
        }));
        hasLength = data.hasLength;
        hasArea = data.hasArea;
    };

    target.toGeoJson = function() {
        return {
            type:"FeatureCollection",
            features:target()
        };
    };

    var result = ko.computed({
        read: function() {
            if (target().length == 0) {
                return null;
            }
            var geojson = target.toGeoJson();
            geojson.toJSON = function() {
                return target.toJSON();
            };
            geojson.areaHa = target.areaHa;
            geojson.lengthKm = target.lengthKm;

            return geojson;
        },
        write: function(geoJson) {
            var features = geoJson && geoJson.features || [];
            var featureId = options.featureId;

            // Because the metadata extender is applied last, the behaviours will be applied
            // to the value returned by this extender function, which in this case is this computed observable
            // (result)
            if (_.isFunction(result.getId)) {
                featureId = result.getId();
            }
            _.each(features || [], function(feature) {
                if (!feature.properties) {
                    feature.properties = {};
                }
                feature.properties.id = featureId;
                featureIds.push(featureId);
            });
            target(features);
        }

    });


    result.loadData = target.loadData;
    result.areaHa = target.areaHa;
    result.lengthKm = target.lengthKm;

    return result;
};


/**
 * Produces an svg drawing of the supplied geojson and adds it as a child element to the bound container.
 * The svg will take the size of the container.
 */
ko.bindingHandlers.geojson2svg = {
    update: function (element, valueAccessor) {
        var geojson = ko.utils.unwrapObservable(valueAccessor());

        if (geojson) {

            var $element = $(element);
            var width = $element.width() || 100;
            var height = $element.height() || 100;

            var bounds = turf.bbox(geojson);

            var s = geojson2svg({
                viewportSize: {width: width, height: height},
                mapExtent: {left: bounds[0], right: bounds[2], bottom: bounds[1], top: bounds[3]}
            }).convert(geojson);

            $element.html('<svg xmlns="http://www.w3.org/2000/svg"  width="' + width + '" height="' + height + '" x="0" y="0">' + s + '</svg>');
        }

    }
};

ecodata.forms.featureMap = function (options) {

    var self = this;
    var _selectedFeatures = [];

    var SELECTED_LAYER_STYLE = {
        weight: 4,
        fillOpacity: 0.5,
        color: "#f00"
    };
    var UNSELECTED_LAYER_STYLE = {
        weight: 4,
        fillOpacity: 0.3,
        color: "#33f"
    };

    function initialise(options) {
        var defaults = {
            mapElementId: 'map-popup',
            selectFromSitesOnly: false,
            allowPolygons: true,
            allowPoints: false,
            markerOrShapeNotBoth: true,
            hideMyLocation: false,
            baseLayersName: 'Open Layers',
            showReset: false,
            singleMarker: false,
            zoomToObject: true,
            markerZoomToMax: true,
            singleDraw: false,
            selectedStyle:{},
            displayScale:true
        };
        var config = _.defaults(options, defaults);
        var mapOptions = _.extend(config, {
            wmsFeatureUrl: config.proxyFeatureUrl + "?featureId=",
            wmsLayerUrl: config.spatialGeoserverUrl + "/wms/reflect?",
            drawControl: !config.readonly,
            useMyLocation: config.userMyLocation,
            allowSearchLocationByAddress: !config.readonly,
            allowSearchRegionByAddress: false,
            drawOptions: config.readonly ?
                {
                    polyline: false,
                    polygon: false,
                    rectangle: false,
                    circle: false,
                    edit: false
                }
                :
                {
                    polyline: !config.selectFromSitesOnly && config.allowPolygons,
                    polygon: !config.selectFromSitesOnly && config.allowPolygons ? {allowIntersection: false} : false,
                    circle: false,
                    rectangle: !config.selectFromSitesOnly && config.allowPolygons,
                    marker: !config.selectFromSitesOnly && config.allowPoints,
                    edit: !config.selectFromSitesOnly
                }
        });


        // undefined/null, Google Maps or Default should enable Google Maps view
        if (config.baseLayersName !== 'Open Layers') {
            var googleLayer = new L.Google('ROADMAP', {maxZoom: 21, nativeMaxZoom: 21});
            var otherLayers = {
                Roadmap: googleLayer,
                Hybrid: new L.Google('HYBRID', {maxZoom: 21, nativeMaxZoom: 21}),
                Terrain: new L.Google('TERRAIN', {maxZoom: 21, nativeMaxZoom: 21})
            };

            mapOptions.baseLayer = googleLayer;
            mapOptions.otherLayers = otherLayers;
        }


        ALA.Map.call(self, mapOptions.mapElementId, mapOptions);

        if (config.displayScale) {
            L.control.scale({metric:true, imperial:false}).addTo(self.getMapImpl());
        }

        self.setSelectableFeatures = function(selectableFeatures) {
            // We don't want this added to the "drawnItems" layer in the ALA.map as that layer is managed
            // for individual form sections.
            if (self.selectionLayer) {
                self.selectionLayer.clearLayers();
            }
            self.selectionLayer = L.geoJson(selectableFeatures,
                {
                    style: function () {
                        return UNSELECTED_LAYER_STYLE;
                    },
                    onEachFeature: function (f, layer) {
                        layer.on('click', function (e) {
                            var index = _selectedFeatures.indexOf(f);
                            if (index >= 0) {
                                _selectedFeatures.splice(index, 1);
                                layer.setStyle(UNSELECTED_LAYER_STYLE);
                            }
                            else {
                                _selectedFeatures.push(f);
                                layer.setStyle(SELECTED_LAYER_STYLE);
                            }

                        })
                    }
                }).addTo(self.getMapImpl());
            self.selectionLayer.bringToFront();
        };
        if (options.selectableFeatures) {
            self.setSelectableFeatures(options.selectableFeatures);
        }
        var getDrawnItems = self.getGeoJSON;
        self.getGeoJSON = function () {
            var drawnAndSelected = getDrawnItems();

            drawnAndSelected.features = _selectedFeatures.concat(drawnAndSelected.features || []);
            return drawnAndSelected;
        };

        return self;
    }

    var mapKey = 'featureMap'
    var $mapStorage = $('body');
    var map = $mapStorage.data(mapKey);

    if (!map) {
        map = initialise(options);
        $mapStorage.data(mapKey, map);
    }

    return map;

};

ko.components.register('feature', {

    viewModel: function (params) {
        var self = this;

        var model = params.feature;

        if (!model) {
            throw "The model attribute is required for this component";
        }
        self.model = model;

        self.enabled = true;
        if (_.isFunction(model.enableConstraint)) {
            self.enabled = model.enableConstraint;
        }

        var defaults = {
            mapPopupSelector: '#map-modal',
            mapElementId: 'map-popup' // Needed to size the map....
        };

        var config = _.defaults(defaults, params.config);

        self.readonly = config.readonly;

        var $modal = $(config.mapPopupSelector);
        var $mapElement = $('#' + config.mapElementId);

        var map = ecodata.forms.featureMap(config);

        self.ok = function () {
            model(map.getGeoJSON());
        };

        function sizeMap() {
            // Set the map to fit the screen.  The full screen modal plugin will have set the max-height
            // on the modal-body, use that to set the map height.
            var $body = $modal.find('.modal-body');
            var maxHeight = $body.css('max-height');
            var height = Number(maxHeight.substring(0, maxHeight.length - 2));
            if (!height) {
                height = 500;
            }
            $mapElement.height(height - 5);
        }

        self.showMap = function () {

            if (model()) {
                map.setGeoJSON(model());
            }

            $modal.on('shown', function () {
                sizeMap();
                map.redraw();
                ko.applyBindings(self, $modal[0]);

            }).on('hide', function () {
                map.resetMap();
                ko.cleanNode($modal[0]);
            }).modal();
        };

    },
    template: '<button class="btn" data-bind="visible:!model() && !readonly, click:showMap, enable:enabled"><i class="fa fa-edit"></i></button>' +
        '<button class="btn edit-feature" data-bind="visible:model(), click:showMap, enable:enabled"><div class="mini-feature" data-bind="if:model(),geojson2svg:model"></div></button>'


});

ecodata.forms.FeatureCollection = function (features) {
    var self = this;

    var featureModels = [];

    /**
     * Returns the set of unique features as managed by all of the feature models registered with this collection
     * (via the registerFeature function).
     * @returns {*}
     */
    var uniqueFeatures = function() {

        var unwrappedFeatures = _.filter(
            _.map(featureModels, function(feature) {
                return ko.utils.unwrapObservable(feature)
            }), function(feature) {
                return feature;
        });
        // We are using indexBy to remove duplicate features.
        return _.values(_.indexBy(_.flatten(unwrappedFeatures), function(feature) {
            return feature.properties && feature.properties.id;
        }));
    };

    self.registerFeature = function (feature) {
        featureModels.push(feature);
    };

    /**
     * Returns the superset of the originally supplied features, and any features that have been added or
     * modified by the supplied feature models.
     * @returns {*}
     */
    self.allFeatures = function() {
        return _.union(uniqueFeatures(), features);
    };


    self.isDirty = function () {
        return _.difference(uniqueFeatures(), features).length > 0;
    };

    /**
     * Creates an object in the format of an ecodata site based on the supplied data and the features.
     *
     * @returns {{siteId: *, name: *, type: string, extent: {geometry: *, type: string}, features: *}}
     */
    self.toSite = function (site) {

        var featureGeoJson = {type: 'FeatureCollection', features: uniqueFeatures()};

        var extent = turf.convex(featureGeoJson);

        return _.extend(site, {
            type:'compound',
            extent:{ geometry: extent.geometry, type:'drawn' },
            features:featureGeoJson.features
        });
    };

};
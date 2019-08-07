/*
import ko from 'knockout';
import geojson2svg from 'geojson2svg';
import area from '@turf/area';
import length from '@turf/length';
import bbox from '@turf/bbox';
*/

if (!window.ecodata) {
    ecodata = {};
}
if (!ecodata.forms) {
    ecodata.forms = {};
}
if (!ecodata.forms.maps) {
    ecodata.forms.maps = {};
}

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
    var featureCollectionId = options.featureCollection.registerFeature(target);

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
    target.toJSON = function () {

        // We are generating ids at serialization time because it removes issues with rows being added and
        // deleted while the form is being edited.

        var featureIdPrefix = options.featureId;
        // Because the metadata extender is applied last, the behaviours will be applied
        // to the value returned by this extender function, which in this case is this computed observable
        // (result)
        if (_.isFunction(result.getId)) {
            featureIdPrefix = featureCollectionId + "-" +result.getId()+'-';
        }

        var features = target();
        var featureIds = [];
        _.each(features, function(feature, i) {
            var featureId = featureIdPrefix + i;
            feature.properties.id = featureId;
            featureIds.push(featureId);
        });

        return {
            featureIds: featureIds,
            hasArea: hasArea,
            hasLength: hasLength
        };
    };

    /**
     *
     * @param data
     */
    target.loadData = function (data) {
        data = data || {};

        var featureIds = data.featureIds || [];
        var featureCollection = options.featureCollection.savedFeatures();
        target(_.filter(featureCollection, function (feature) {
            if (feature.properties && feature.properties.id) {
                return _.indexOf(featureIds, feature.properties.id) >= 0;
            }
            return false;
        }));
        hasLength = data.hasLength;
        hasArea = data.hasArea;
    };

    target.toGeoJson = function () {
        return {
            type: "FeatureCollection",
            features: target()
        };
    };

    var result = ko.computed({
        read: function () {
            if (target().length == 0) {
                return null;
            }
            var geojson = target.toGeoJson();
            geojson.toJSON = function () {
                return target.toJSON();
            };
            geojson.areaHa = target.areaHa;
            geojson.lengthKm = target.lengthKm;

            return geojson;
        },
        write: function (geoJson) {
            var features = geoJson && geoJson.features || [];

            _.each(features || [], function (feature) {

                // Assign properties to each feature
                if (!feature.properties) {
                    feature.properties = {};
                }
                // Track if this was a copy of a planning site.
                if (feature.properties.id) {
                    if (!feature.properties.originalId) {
                        feature.properties.originalId = feature.properties.id;
                    }
                    feature.properties.id = null;
                }

            });
            target(features);
        }

    });


    result.loadData = target.loadData;
    result.areaHa = target.areaHa;
    result.lengthKm = target.lengthKm;

    /**
     * This callback is invoked when the component this model is bound to is desposed, which happens when
     * a section or table row is deleted.  It is used to remove this model from the activity featureCollection.
     */
    result.dispose = function() {
        options.featureCollection.deregisterFeature(target);
    };

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

/**
 * Extends the ALA.Map to provide feature selection functionality.
 * TODO needs to be fixed to no longer be a half singleton / half constructor...
 *
 * @returns {ecodata.forms.maps}
 */
ecodata.forms.maps.featureMap = function (options) {

    var self = this;
    var DRAWN_LAYER_STYLE = {
        weight: 4,
        fillOpacity: 0.2,
        color: "#f00"
    };
    var PLANNING_LAYER_STYLE = {
        weight: 4,
        fillOpacity: 0.2,
        color: "#0f0"
    };



    function initialise(options) {
        self.editableSites = ko.observableArray();
        var defaults = {
            mapElementId: 'map-holder',
            selectFromSitesOnly: false,
            allowPolygons: true,
            allowPoints: false,
            markerOrShapeNotBoth: true,
            hideMyLocation: false,
            baseLayersName: 'Open Layers',
            showReset: true,
            singleMarker: false,
            zoomToObject: true,
            markerZoomToMax: true,
            singleDraw: false,
            selectedStyle: {},
            displayScale: true,
            shapeOptions: {
                color: '#f00',
                fillOpacity: 0.2,
                weight: 4
            }
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
                    polygon: !config.selectFromSitesOnly && config.allowPolygons ? {
                        allowIntersection: false,
                        shapeOptions: config.shapeOptions
                    } : false,
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

        self.getMapImpl().eachLayer(function (layer) {
            if (layer instanceof L.FeatureGroup) {
                self.drawnItems = layer;
            }
        });

        if (config.displayScale) {
            L.control.scale({metric: true, imperial: false}).addTo(self.getMapImpl());
        }

        self.editableSitesHeading = options.editableSitesHeading || 'Site/s for this service';
        self.categories = ko.observableArray();
        if (options.selectableFeatures) {
            self.selectableFeatures = options.selectableFeatures;
            self.configureSelectionLayer(self.selectableFeatures);
        }

        self.drawnItems.on({
            'layeradd': function (e) {

                var layer = e.layer;
                if (layer.setStyle) {
                    layer.setStyle(DRAWN_LAYER_STYLE);
                }

                var name = 'New works area';
                if (layer.feature && layer.feature.properties && layer.feature.properties.name) {
                    name = layer.feature.properties.name;
                }
                var feature = {properties: {name: name}, layer: layer};
                self.editableSites.push(feature);

            }
        });

        self.areaHa = ko.observable(0).extend({numericString:2});
        self.lengthKm = ko.observable(0).extend({numericString:2});

        function updateStatistics() {
            var geoJson = self.drawnItems.toGeoJSON();
            self.areaHa(ecodata.forms.utils.areaHa(geoJson));
            self.lengthKm(ecodata.forms.utils.lengthKm(geoJson, true));
        }

        self.editableSites.subscribe(function() {
            updateStatistics();
        });

        var editStartEvents = ["draw:editstart", "draw:drawstart", "draw:deletestart"];
        var editStopEvents = ["draw:editstop", "draw:deletestop", "draw:drawstop"];

        self.editing = ko.observable(false);
        _.each(editStartEvents, function (e) {
            self.getMapImpl().on(e, function() {
                self.editing(true);
            });
        });
        _.each(editStopEvents, function (e) {
            self.getMapImpl().on(e, function() {
                self.editing(false);
                updateStatistics();
            });
        });

        self.getMapImpl().on("draw:deleted", function(e) {
            var layer = e.layers;
            var toDelete = [];
            _.each(self.editableSites(), function(site) {
                if (layer._layers[site.layer._leaflet_id]) {
                    toDelete.push(site);
                }
            });
            if (toDelete.length > 0) {
                self.editableSites.removeAll(toDelete);
            }
        });

        return self;
    }

    self.copyFeature = function (feature) {
        feature = turf.clone(feature);
        if (feature.geometry && feature.geometry.coordinates && feature.geometry.type == 'MultiPolygon') {
            // Split to polygons as the leaflet draw plugin doesn't support MultiPolygons.
            // This also allows the user to delete each part separately if desired.
            for (var i=0; i<feature.geometry.coordinates.length; i++) {
                var polygon = {
                    type:'Feature',
                    properties:_.clone(feature.properties),
                    geometry: {
                        type:'Polygon',
                        coordinates:feature.geometry.coordinates[i]
                    }
                };
                self.setGeoJSON(polygon);
            }
        }
        else {
            self.setGeoJSON(feature);
        }

    };

    self.copyEnabled = function(feature) {
        var type = feature.type;
        return type != 'Point' && type != 'MultiPoint';
    };

    self.unhighlightFeature = function (feature) {
        var layer = feature.layer;

        if (layer.setStyle) {


            if (self.selectableSitesLayer && self.selectableSitesLayer.hasLayer(layer)) {
                self.selectableSitesLayer.resetStyle(layer);
            }
            else {
                var options = layer.options;
                if (options && layer.setStyle) {
                    var style = {
                        weight: options.weight / 3,
                        fillOpacity: 0.2,
                        color: options.color
                    };
                    layer.setStyle(style);
                }

            }
        }
        else if (layer.options && layer.options.icon) {
            var icon = layer.options.icon;
            icon.options.iconSize = [icon.options.iconSize[0]/1.5, icon.options.iconSize[1]/1.5];
            icon.options.iconAnchor = [icon.options.iconAnchor[0]/1.5, icon.options.iconAnchor[1]/1.5];
            feature.layer.setIcon(icon);
        }

    };

    self.highlightFeature = function (feature) {
        var options = feature.layer.options;
        if (!options) {
            return;  // TODO Known shapes don't have options
        }
        if (feature.layer.setStyle) {

            var style = {
                weight: options.weight * 3,
                fillOpacity: 1,
                color: options.color
            };
            feature.layer.setStyle(style);
            if (feature.layer.bringToFront()) {
                feature.layer.bringToFront();
            }
        }
        else if (options.icon) {
            var icon = options.icon;
            icon.options.iconSize = [icon.options.iconSize[0]*1.5, icon.options.iconSize[1]*1.5];
            icon.options.iconAnchor = [icon.options.iconAnchor[0]*1.5, icon.options.iconAnchor[1]*1.5];
            feature.layer.setIcon(icon);
        }
    };

    self.zoomToFeature = function (feature) {
        var layer = feature.layer;
        var boundsContainer = layer;
        if (!layer.getBounds) {
            boundsContainer = new L.FeatureGroup();
            boundsContainer.addLayer(layer);
        }
        map.getMapImpl().fitBounds(boundsContainer.getBounds());
    };
    self.deleteFeature = function (feature) {
        map.drawnItems.removeLayer(feature.layer);
        self.editableSites.remove(feature);

    };

    self.editSites = function () {

        map.drawnItems.bringToFront();
        map.drawnItems.eachLayer(function (layer) {
            if (layer.bringToFront) {
                layer.bringToFront();
            };
        });
        self.selectableSitesLayer.bringToBack();

        // this is gross hack around the map plugin not giving access to the Draw Control
        var event = document.createEvent('Event');
        event.initEvent('click', true, true);
        var cb = document.getElementsByClassName('leaflet-draw-edit-edit');
        !cb[0].dispatchEvent(event);
    };

    self.zoomToDrawnSites = function () {
        map.fitBounds();
    };

    self.zoomToCategorySites = function(category) {

        var group = new L.featureGroup();
        _.each(category.features || [], function(feature) {
            if (feature.layer) {
                group.addLayer(feature.layer);
            }
        });
        self.getMapImpl().fitBounds(group.getBounds());
    };

    self.defaultZoom = function() {
        if (self.drawnItems.getLayers().length > 0) {
            self.fitBounds();
        }
        else if (self.selectableSitesLayer) {
            var bounds = self.selectableSitesLayer.getBounds();
            if (bounds && bounds.isValid()) {
                self.getMapImpl().fitBounds(bounds);
            }

        }
    };

    self.clearDrawnItems = function() {
        self.resetMap();
        self.editableSites([]);
    };

    self.configureSelectionLayer = function (selectableFeatures) {

        if (selectableFeatures) {

            _.each(selectableFeatures, function (feature) {
                if (feature.properties && feature.properties.name) {
                    self.categories.push({category: feature.properties.name, features: feature.features});
                }
            });
            self.selectableSitesLayer = L.geoJson(selectableFeatures,
                {
                    style: PLANNING_LAYER_STYLE,
                    onEachFeature: function (f, layer) {
                        f.layer = layer;
                    }
                }
            );
            self.selectableSitesLayer.addTo(self.getMapImpl());
        }
    };

    var mapKey = 'featureMap';
    var $mapStorage = $('body');
    var map = $mapStorage.data(mapKey);

    if (!map) {
        map = initialise(options);
        $mapStorage.data(mapKey, map);
    }

    return self;

};

/**
 * Displays the modal identified by mapPopupSelector which is expected to be the _mapInDialogEditTemplate or
 * _mapInDialogViewTemplate and attaches a callback to the OK button.
 * This function maintains a single instance of the featureMap.
 *
 * @param options {mapPopupSelector:, mapElementId, okCallback}
 * @returns {ecodata.forms|*}
 */
ecodata.forms.maps.showMapInModal = function(options) {
    var self = this;

    var defaults = {
        mapPopupSelector: '#map-modal',
        editingMessageSelector: '#editing-in-progress-reminder', // shown when the user tries to press OK in the middle of an edit/delete operation
        mapElementId: 'map-holder' // Needed to size the map....
    };

    var config = _.defaults(defaults, options);

    var $modal = $(config.mapPopupSelector);
    var $mapElement = $('#' + config.mapElementId);


    if (!self.featureMapInstance) {
        self.featureMapInstance = ecodata.forms.maps.featureMap(config);
        $(window).on('hashchange', function () {
            // This is to have the back button close the modal.
            if(window.location.hash != mapHash) {
                $modal.modal('hide');
            }
        });
    }

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
    var mapHash = '#map';
    var $ok = $modal.find('.btn-primary');

    function okPressed() {
        if (self.featureMapInstance.editing()) {
            var message = $(config.editingMessageSelector).html();

            var $leafletDrawActions = $('.leaflet-draw-actions');

            var oldborder = $leafletDrawActions.css('border');
            $leafletDrawActions.css('border', '4px red solid');

            bootbox.alert(message, function() {
                $leafletDrawActions.css('border', oldborder);
            });
            // re-add the event listener as we didn't close the dialog.
            $ok.one('click', okPressed);
        }
        else {
            if (options.okCallback) {
                options.okCallback(self.featureMapInstance);
            }
            $modal.modal('hide');
        }
    }
    $ok.one('click', okPressed);

    $modal.one('shown', function (e) {

        // This check is necessary because the accordion also fires these events which bubble to the modal.
        if (e.target == this) {
            sizeMap();

            // This is setting up a history entry so the back button can close the modal.
            window.location.hash = mapHash;
            self.featureMapInstance.redraw();

            if (_.isFunction(options.shownCallback)) {
                options.shownCallback(self.featureMapInstance);
            }
            self.featureMapInstance.defaultZoom();
        }

    })
    .one('hide', function (e) {
        // This check is necessary because the accordion also fires these events which bubble to the modal.
        if (e.target == this) {
            self.featureMapInstance.clearDrawnItems();
        }
        if (window.location.hash == mapHash) {
            // If the map was closed with a button (rather than back), clear the map history entry.
            window.history.back();
        }

    }).modal();

    return self.featureMapInstance;
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


        self.readonly = params.config.readonly;

        self.ok = function (map) {

            var geoJson = map.getGeoJSON();

            _.each(geoJson.features || [], function (feature) {
                delete feature.layer;
            });

            model(geoJson);
        };

        self.showMap = function() {

            var options = {
                okCallback:self.ok
            };

            var map = ecodata.forms.maps.showMapInModal(options);
            if (self.model()) {
                map.setGeoJSON(self.model(), {zoomToObject:false});
            }
        };

        /** Let the model know it's been deleted so it can deregister from the managed site */
        self.dispose = function() {
            if (_.isFunction(model.dispose)) {
                model.dispose();
            }
        };


    },
    template: '<button class="btn edit-feature" data-bind="visible:!model() && !readonly, click:showMap, enable:enabled"><i class="fa fa-edit"></i></button>' +
        '<button class="btn edit-feature" data-bind="visible:model(), click:showMap, enable:enabled"><div class="mini-feature" data-bind="if:model(),geojson2svg:model"></div></button>'


});

ecodata.forms.FeatureCollection = function (features) {
    var counter = 0;
    var self = this;

    var featureModels = [];

    self.registerFeature = function (feature) {
        featureModels.push(feature);
        return counter++;
    };

    self.deregisterFeature = function(feature) {
        featureModels = _.without(featureModels, feature);
    }

    self.savedFeatures = function() {
        return features;
    };

    /**
     * Returns the superset of the originally supplied features, and any features that have been added or
     * modified by the supplied feature models.
     * @returns {*}
     */
    self.allFeatures = function () {
        return _.flatten(
            _.map(featureModels, function (feature) {
                return ko.utils.unwrapObservable(feature)
            }));
    };


    self.isDirty = function () {
        return _.difference(self.allFeatures(), features).length > 0;
    };

    /**
     * Creates an object in the format of an ecodata site based on the supplied data and the features.
     *
     * @returns {{siteId: *, name: *, type: string, extent: {geometry: *, type: string}, features: *}}
     */
    self.toSite = function (site) {

        var featureGeoJson = {type: 'FeatureCollection', features: self.allFeatures()};

        var extent = turf.convex(featureGeoJson);

        if (!extent) {
            extent = turf.bbox(featureGeoJson);
        }

        return _.extend(site || {}, {
            type: 'compound',
            extent: {geometry: extent.geometry, source: 'drawn'},
            features: featureGeoJson.features
        });
    };

};
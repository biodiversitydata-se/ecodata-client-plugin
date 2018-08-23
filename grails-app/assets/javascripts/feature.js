/*
import ko from 'knockout';
import geojson2svg from 'geojson2svg';
import area from '@turf/area';
import length from '@turf/length';
import bbox from '@turf/bbox';
*/

ko.extenders.feature = function (target, options) {

    self.config = options.config && options.config.mapConfig || {};

    var SQUARE_METERS_IN_HECTARE = 10000;

    function m2ToHa(areaM2) {
        return areaM2 / SQUARE_METERS_IN_HECTARE;
    }

    target.areaHa = function () {
        var areaInM2 = turf.area(ko.utils.unwrapObservable(target));
        return m2ToHa(areaInM2);
    };
    target.lengthKm = function () {
        return turf.length(ko.utils.unwrapObservable(target), {units: 'kilometers'});
    };

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

            var bounds = turf.extent(geojson);

            var s = geojson2svg({
                viewportSize: {width: width, height: height},
                mapExtent: {left: bounds[0], right: bounds[2], bottom: bounds[1], top: bounds[3]}
            }).convert(geojson);

            $element.html('<svg xmlns="http://www.w3.org/2000/svg"  width="' + width + '" height="' + height + '" x="0" y="0">' + s + '</svg>');
        }

    }
};

ecodata.forms.featureMap = function(options) {

    var self = this;
    var _selectedFeatures = [];


    function initialise(options) {
        var defaults = {
            mapElementId: 'map-popup',
            selectFromSitesOnly: false,
            allowPolygons: true,
            allowPoints: false,
            markerOrShapeNotBoth: true,
            hideMyLocation: false,
            baseLayersName: 'Open Layers',
            showReset:false,
            singleMarker: false,
            zoomToObject: true,
            markerZoomToMax: true,
            singleDraw: false
        };
        var config = _.defaults(defaults, options);
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
                    circle: !config.selectFromSitesOnly && config.allowPolygons,
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

        if (options.selectableFeatures) {
            // We don't want this added to the "drawnItems" layer in the ALA.map as that layer is managed
            // for individual form sections.
            var geoLayer = L.geoJson(options.selectableFeatures).addTo(self.getMapImpl());

            var geoList = new L.Control.GeoJSONSelector(geoLayer, {
                collapsed:true,
                zoomToLayer: true,
                activeListFromLayer: true,
                activeLayerFromList: true,
                listOnlyVisibleLayers: false,
                position:'topleft',
                multiple:true,
                style: {
                    color:'#00f',
                    fill:false,
                    fillColor:'#08f',
                    fillOpacity: 0.4,
                    opacity: 1,
                    weight: 1
                },
                activeStyle: {fill:true},
                selectStyle: {fill:true}
            });

            geoList.on('selector:change', function(e) {
                if (e.selected) {
                    _selectedFeatures = _.union(_selectedFeatures, e.layers);
                }
                else {
                    _selectedFeatures = _.without(_selectedFeatures, e.layers);
                }
            });

            self.addControl(geoList);

            var getDrawnItems = self.getGeoJSON;
            self.getGeoJSON = function() {
                var drawnAndSelected = getDrawnItems();

                if (_selectedFeatures) {
                    _.each(_selectedFeatures, function(layer) {
                        drawnAndSelected.features.push(layer.toGeoJSON());
                    });
                }
                console.log(drawnAndSelected);
                return drawnAndSelected;
            };


        }

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

        var defaults = {
            mapPopupSelector: '#map-modal',
            mapElementId: 'map-popup' // Needed to size the map....
        };

        var config = _.defaults(defaults, params.options);

        var $modal = $(config.mapPopupSelector);
        var $mapElement = $('#'+config.mapElementId);

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
            $mapElement.height(height-5);
        }

        self.showMap = function () {

            //map.clearLayers();

            $modal.on('shown', function () {
                sizeMap();

                if (model()) {
                    map.setGeoJSON(model());
                    //map.redraw();
                }
                else {
                    map.redraw();
                    map.resetMap();
                }

                ko.applyBindings(self, $modal[0]);

            }).on('hide', function () {
                ko.cleanNode($modal[0]);
            }).modal();
        };

    },
    template: '<button class="btn" data-bind="visible:!model(), click:showMap"><i class="fa fa-edit"></i></button><button class="btn edit-feature" data-bind="visible:model(), click:showMap"><div class="mini-feature" data-bind="if:model(),geojson2svg:model"></div></button>'


});
/*
import ko from 'knockout';
import geojson2svg from 'geojson2svg';
import area from '@turf/area';
import length from '@turf/length';
import bbox from '@turf/bbox';
*/

ko.extenders.feature = function (target, options) {
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

ko.components.register('feature', {

    viewModel: function (params) {
        var self = this;

        var model = params.model;

        if (!model) {
            throw "The model attribute is required for this component";
        }
        self.model = model;

        var defaults = {
            mapElementId: 'map-popup',
            selectFromSitesOnly: false,
            allowPolygons: true,
            allowPoints: false,
            markerOrShapeNotBoth: true,
            hideMyLocation: true,
            baseLayersName: 'Open Layers',
            mapPopupSelector: '#map-modal'
        };

        var config = _.defaults(defaults, params);

        var $modal = $(config.mapPopupSelector);
        var $mapStorage = $('body');
        var mapContainerKey = 'map';

        var mapOptions = {
            wmsFeatureUrl: config.proxyFeatureUrl + "?featureId=",
            wmsLayerUrl: config.spatialGeoserverUrl + "/wms/reflect?",
            //set false to keep consistance with edit mode.  We need to enter edit mode to move marker.
            //If we set it true, we can move point, but cannot update site. And if we enter edit mode and exit, marker is no longer draggable.  Could be a bug in leaflet
            draggableMarkers: false,
            drawControl: !config.readonly,
            showReset: false,
            singleDraw: true,
            singleMarker: true,
            markerOrShapeNotBoth: config.markerOrShapeNotBoth,
            useMyLocation: !config.readonly && !config.hideMyLocation,
            allowSearchLocationByAddress: !config.readonly,
            allowSearchRegionByAddress: false,
            zoomToObject: true,
            markerZoomToMax: true,
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
        };


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

        self.ok = function () {
            var map = $mapStorage.data(mapContainerKey);
            model(map.getGeoJSON());
        };


        self.showMap = function () {
            var map = $mapStorage.data(mapContainerKey);

            if (!map) {
                map = new ALA.Map(config.mapElementId, mapOptions);
                $mapStorage.data(mapContainerKey, map);
            }
            else {
                map.clearLayers();
            }
            $modal.modal('show').on('shown', function () {
                // Set the map to fit the screen.  The full screen modal plugin will have set the max-height
                // on the modal-body, use that to set the map height.
                var $body = $modal.find('.modal-body');
                var maxHeight = $body.css('max-height');
                var height = Number(maxHeight.substring(0, maxHeight.length - 2));
                if (!height) {
                    height = 500;
                }
                $('#' + config.mapElementId).height(height);
                var map = $mapStorage.data(mapContainerKey);

                if (model()) {
                    map.setGeoJSON(model());
                }
                map.redraw();

                ko.applyBindings(self, $modal[0]);

            }).on('hide', function () {
                ko.cleanNode($modal[0]);
            });
        };

    },
    template: '<button class="btn" data-bind="visible:!model(), click:showMap"><i class="fa fa-edit"></i></button><button class="btn edit-feature" data-bind="visible:model(), click:showMap"><div class="mini-feature" data-bind="if:model(),geojson2svg:model"></div></button>'


});
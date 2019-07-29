describe("Specification for the featureCollection", function () {

    var turfBackup;

    var feature = function() {
        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[[1, 0], [1, 1], [0, 1], [0, 0], [1, 0]]]
            },
            properties: {
                id:'1'
            }
        };
    };
    beforeEach(function () {
        turfBackup = window.turf;
        window.turf = {
            area: function (geoJSON) {
                return 1000;
            },
            length: function (geoJSON, units) {
                return 1;
            },
            convex: function (geoJSON) {
                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[1, 0], [1, 1], [0, 1], [0, 0], [1, 0]]]
                    }
                };
            },
            bbox: function (geoJSON) {
                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[1, 0], [1, 1], [0, 1], [0, 0], [1, 0]]]
                    }
                };
            }

        };
    });

    afterEach(function () {
        window.turf = turfBackup;
    });


    it("can be convered to an ecodata 'compound' site", function () {

        var featureCollection = new ecodata.forms.FeatureCollection();

        expect(featureCollection.allFeatures()).toEqual([]);
        var expectedSite = {
            type: 'compound',
            extent: {
                source: 'drawn', geometry: {
                    type: 'Polygon',
                    coordinates: [[[1, 0], [1, 1], [0, 1], [0, 0], [1, 0]]]
                }
            },
            features: []
        };
        expect(featureCollection.toSite()).toEqual(expectedSite);
    });



    it("will not return multiple features with the same id", function () {
        var featureCollection = new ecodata.forms.FeatureCollection();

        var featureModel = ko.observable(feature());
        featureCollection.registerFeature(featureModel);
        featureCollection.registerFeature(new ko.observable(feature()));

        expect(featureCollection.allFeatures().length).toEqual(2);

        var feature2 = feature();
        feature2.properties.id = 2;
        featureCollection.registerFeature(new ko.observable(feature2));
        expect(featureCollection.allFeatures().length).toEqual(3);

    });

});
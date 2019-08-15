describe("Specification for the featureCollection", function () {

    var turf;
    var multiFeatureModel;
    var context;
    beforeEach(function () {
        turf = window.turf;
        window.turf = {
            area:function() { return 1000; },
            length: function() { return 1; },
            convex: function() { return {}; }
        };
        context = {
            featureCollection: new ecodata.forms.FeatureCollection([])
        };
        multiFeatureModel = new ecodata.forms.MultiFeatureViewModel({}, ecodata.forms.multiFeatureViewModelMetadata, context, {outputName:"MultiFeatureModel"});
    });
    afterEach(function() {
        window.turf = turf;
    });

    var geojson = function() {
        return {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[
                            [100.0, 100.0],
                            [100.1, 100.0],
                            [100.1, 100.1],
                            [100.0, 100.1],
                            [100.0, 100.0]
                        ]]
                    }
                }
            ]
        };
    };

    it("can collect data from individual feature data types into a site for further processing", function() {
        multiFeatureModel.loadData({});
        context.featureCollection.loadComplete();

        multiFeatureModel.features.addRow({});

        multiFeatureModel.features()[0].feature(geojson());

        var dataStringified = multiFeatureModel.modelAsJSON();
        var data = JSON.parse(dataStringified);

        expect(data.features[0].feature).toEqual({modelId:1, featureIds:['1-MultiFeatureModel-feature-0-0']});

        var site = context.featureCollection.toSite();
        expect(site.features.length).toBe(1);
        var expected = geojson().features[0];
        expect(site.features[0].type).toEqual(expected.type);
        expect(site.features[0].geometry).toEqual(expected.geometry);
    });

});
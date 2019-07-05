describe("Feature Data Type Spec", function () {
    var turf ;

    beforeEach(function() {
        turf = window.turf;
        window.turf = {
            area:function(geoJSON) {
                return 1000;
            },
            length: function(geoJSON, units) {
                return 1;
            }

        };
    });

    afterEach(function() {
        window.turf = turf;
    });


    var polygon = function() {
        return {
            "type": "Polygon",
                "coordinates":
            [[
                [100.0, 100.0],
                [100.1, 100.0],
                [100.1, 100.1],
                [100.0, 100.1],
                [100.0, 100.0]
            ]]
        };
    };

    var polygonFeature = function(id, name) {
        return {
            "type":"Feature",
            "geometry": polygon(),
            "properties":{
                id:id,
                name:name
            }

        };
    };

    var featureArray = [
        polygonFeature('Feature-1', 'polygon 1'),
        polygonFeature('Feature-2', 'polygon 2'),
        polygonFeature('Feature-3', 'polygon 3'),
        polygonFeature('Feature-4', 'polygon 4')
    ];


    var simpleFeatureViewModelMetadata = [
        {
            name:'feature',
            dataType:'feature'
        }
    ];

    it("Should be able to access nested objects like the species and feature data types", function () {
        var model = new ecodata.forms.SimpleFeatureViewModel({}, ecodata.forms.simpleFeatureViewModelMetadata, context, {});

        var data = {
            feature: polygon()

        };
        model.loadData(data);

        expect(Number(model.data.feature.areaHa())).toBeCloseTo(0.1);
        expect(Number(model.data.feature.lengthKm())).toBeCloseTo(1);
    });

    it("Something about the dlshith", function() {

        var callback;
        var config = {
            featureCollection:{
                registerFeature:function(feature) {

                }
            }
        };

        // The feature data type relies on having the metadata available.
        var feature = ko.observable().extend({metadata:{metadata:{name:'feature'}}, config:{}, context:{}}).extend({feature:config});

        var geoJson = {type:'Polygon', coordinates:[[[1,0], [1,1], [0, 1], [0, 0], [1, 0]]]};
        feature(geoJson);

        //expect(feature()).toBe(geoJson);

    });


        var metadata = {
            name:'feature',
            dataType:'feature'
        };
        var context = {
            featureCollection: {
                allFeatures:function() {
                    return [
                        {
                            type: "Feature",
                            geometry: {
                                type: "Polygon",
                                coordinates: [[[]]]
                            },
                            properties: {
                                id: 'Feature-0'
                            }


                        },
                        {
                            type: "Feature",
                            geometry: {
                                type: "Polygon",
                                coordinates: [[[]]]
                            },
                            properties: {
                                id: 'Feature-1'
                            }
                        },
                        {
                            type: "Feature",
                            geometry: {
                                type: "Polygon",
                                coordinates: [[[]]]
                            },
                            properties: {
                                id: 'Feature-2'
                            }
                        }]
                },
                registerFeature:function(feature) {
                }
            }
        };
    function makeAFeature(featureCollection) {
        featureCollection = featureCollection || context.featureCollection;

        var config = {featureCollection:featureCollection, outputName:'Test', featureId:'Feature'};

        // The feature data type relies on having the metadata available.
        return ko.observable().extend({metadata:{metadata:metadata, config:config, context:context}}).extend({feature:config});

    }

    it("Should return geojson for use by other components (e.g. geojson2svg)", function() {

        var feature = makeAFeature();
        feature.loadData({featureIds:['Feature-2']});

        expect(feature().type).toEqual("FeatureCollection");
        expect(feature().features).toBeDefined();

    });

    it("Should find it's data from the supplied context based on ids", function(){

        // Testing
        var feature = makeAFeature();

        feature.loadData({featureIds:['Feature-1', 'Feature-2']});

        var data = feature();


        expect(data.type).toEqual("FeatureCollection");
        expect(data.features.length).toBe(2);

    });

    it("Should be able to handle no data being passed to the loadData method", function(){

        // Testing
        var feature = makeAFeature();

        feature.loadData(undefined);

        var data = feature();

        expect(data).toBeNull();

    });

    it("Shouldn't return details of the shapes, just references to the ids", function() {
        var featureIds = ['Feature-0', 'Feature-1'];
        var feature = makeAFeature();
        feature.loadData({featureIds:featureIds});

        var data = feature().toJSON();

        expect(data.featureIds).toEqual(featureIds);
        expect(data.type).toBeUndefined();

        var model = new ecodata.forms.SimpleFeatureViewModel({}, ecodata.forms.simpleFeatureViewModelMetadata, context, {outputName:"simpleFeatureViewModel"});
        model.loadData({feature:{featureIds:featureIds}});
        var json = model.modelAsJSON();

        var data = JSON.parse(json);
        // The feature ids are regenerated every time the form is saved.  When attached to a model, the
        // model information is included in the id (rather than using the options.featureId as the prefix as per the previous test)
        expect(data.data.feature.featureIds).toEqual(['simpleFeatureViewModel-feature-0', 'simpleFeatureViewModel-feature-1']);


    });


    it("The feature extender should return the value written to it", function() {
        var feature = makeAFeature();

        feature({type:"FeatureCollection", features:[{"type":"Feature", geometry:{}}]});

        expect(feature().type).toBe("FeatureCollection");
    });

    //============ ecodata.forms.FeatureCollection ===========

    it("A feature collection with no attached feature models should return the original data only", function() {

        var featureCollection = new ecodata.forms.FeatureCollection(featureArray);

        expect(featureCollection.allFeatures()).toEqual(featureArray);

    });

    it("A feature collection should not duplicate features after they are applied to feature models", function() {

        var featureCollection = new ecodata.forms.FeatureCollection(featureArray);

        var featureModel = makeAFeature(featureCollection);
        featureModel.loadData({featureIds:['Feature-1', 'Feature-2']});

        var allFeatures = _.sortBy(featureCollection.allFeatures(), function(feature) {
            return feature.properties.id;
        });

        expect(allFeatures).toEqual(featureArray);

    });

    it("A feature collection should not duplicate features after they are applied to feature models", function() {

        var featureCollection = new ecodata.forms.FeatureCollection(featureArray);

        var featureModel = makeAFeature(featureCollection);
        featureModel.loadData({featureIds:['Feature-1', 'Feature-2']});

        featureModel({
           type:"FeatureCollection",
            features:[]
        });

        expect(featureCollection.allFeatures()).toEqual(featureArray);

    });

});
describe("Feature Data Type Spec", function () {

    turf = {
       area:function(geoJSON) {
           return 1000;
       },
       length: function(geoJSON, units) {
           return 1;
       }

    };

    it("Should be able to access nested objects like the species and feature data types", function () {
        var model = new ecodata.forms.SimpleFeatureViewModel({}, {}, {}, {});

        var data = {
            feature: {
                "type": "Polygon",
                "coordinates":
                    [[
                        [100.0, 100.0],
                        [100.1, 100.0],
                        [100.1, 100.1],
                        [100.0, 100.1],
                        [100.0, 100.0]
                    ]]
            }
        };
        model.loadData(data);

        expect(Number(model.data.feature.areaHa())).toBeCloseTo(0.1);
        expect(Number(model.data.feature.lengthKm())).toBeCloseTo(1);
    });

    it("The features length and area should be accessible via the expression evaluator", function () {
        var model = new ecodata.forms.SimpleFeatureViewModel({}, {}, {}, {});

        var data = {
            feature: {
                "type": "Polygon",
                "coordinates":
                    [[
                        [100.0, 100.0],
                        [100.1, 100.0],
                        [100.1, 100.1],
                        [100.0, 100.1],
                        [100.0, 100.0]
                    ]]
            }
        };
        model.loadData(data);

        expect(Number(model.data.areaHa())).toBeCloseTo(0.1, 1);
        expect(Number(model.data.lengthKm())).toBeCloseTo(1, 1);
    });
});
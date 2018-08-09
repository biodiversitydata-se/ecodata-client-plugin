describe("DataLoader Spec", function () {

    it ("should be able to merge prepop data", function() {
        var context = {
            some: {
                notes:'test',
                soilSampleCollected:true
            }
        };

        var data = {
            some: {
                notes:'test 2'
            }
        };

        var dataLoader = ecodata.forms.dataLoader({}, {});
        var result = dataLoader.merge(data, context);

        expect(result.some.notes).toEqual('test 2');
        expect(result.some.soilSampleCollected).toEqual(true);
    });

    it ("should be able to merge arrays", function() {
        var context = {
            notes:'test',
            surveyResultsFlora:[{
                health:'good',
                plotId:'1'
            },
                {
                    health:"fair",
                    plotId:'2'
                }]
        };

        var data = {
            some: {
                notes:'test 2'
            }
        };

        var dataLoader = ecodata.forms.dataLoader({}, {});

        var result = dataLoader.merge(data, context);

        expect(result.some.notes).toEqual('test 2');
        expect(result.surveyResultsFlora).toEqual(context.surveyResultsFlora);
    });

    it ("this is a kind of weird behaviour required for a specific form.", function() {
        var context = {
            notes:'test',
            surveyResultsFlora:[{
                health:'good',
                plotId:'1'
            }, {
                health:"fair",
                plotId:'2'
            }]
        };

        var data = {
            notes:'test 2',
            surveyResultsFlora:[{
                health:'fair'
            }]
        };

        var dataLoader = ecodata.forms.dataLoader({}, {});

        var result = dataLoader.merge(data, context);

        expect(result.notes).toEqual('test 2');
        expect(result.surveyResultsFlora).toEqual([{health:'fair', plotId:'1'}]);
    });

});
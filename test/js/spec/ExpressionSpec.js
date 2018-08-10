describe("Expression Spec", function () {

    it ("should be able to evaluate expressions in the context of a top level output model", function() {

        var data = {
            totalArea:100,
            percentApplied:40
        };

        var model = new ecodata.forms.SimpleExpressionViewModel({}, {}, {}, {});
        model.loadData(data);

        expect(Number(model.data.affectedArea())).toEqual(40);
    });


    it ("should be able to evaluate expressions in the context of a nested model (e.g table)", function() {

        var data = {
            nested:[
                {
                    totalArea:100,
                    percentApplied:40
                }
            ]
        };

        var model = new ecodata.forms.NestedExpressionViewModel({}, nestedExpressionDataModel, {}, {});
        model.loadData(data);

        expect(Number(model.data.nested()[0].affectedArea())).toEqual(40);
    });

});
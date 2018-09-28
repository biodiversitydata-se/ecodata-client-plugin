describe("DataModelItem Spec", function () {


    var context = {};

    var config = {
        outputName:'Feature_Test'
    };

    it("can produce an identifier for this item if required", function() {

        var metadata = {
            name:'item',
            dataType:'text'
        };
        context.parent = {};



        var dataItem = ko.observable().extend({metadata:{metadata:metadata, context:context, config:config}});
        expect(dataItem.getName()).toBe(metadata.name);

        expect(dataItem.getId()).toBe("Feature_Test-"+metadata.name);


    });

});
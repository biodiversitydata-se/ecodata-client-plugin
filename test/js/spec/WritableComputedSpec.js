describe("Writable computed Spec", function () {


    var context = {};

    var config = {
        outputName:'Feature_Test'
    };

    it("will return the evaluated expression until the value is manually specified", function() {

        var metadata = {
            name:'item',
            dataType:'text'
        };
        context = {
            anotherItem:ko.observable("3")
        };

        var dataItem = ko.observable().extend({metadata:{metadata:metadata, context:context, config:config}}).extend({writableComputed:{expression:'anotherItem*4', context:context}});


        expect(dataItem()).toBe("12.00");

        dataItem("100");

        expect(dataItem()).toBe("100");


    });

});
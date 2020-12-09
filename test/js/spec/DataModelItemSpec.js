describe("DataModelItem Spec", function () {


    var context = {
        parent: {}
    };

    var config = {
        outputName:'Feature_Test'
    };

    it("can produce an identifier for this item if required", function() {

        var metadata = {
            name:'item',
            dataType:'text'
        };

        var dataItem = ko.observable().extend({metadata:{metadata:metadata, context:context, config:config}});
        expect(dataItem.getName()).toBe(metadata.name);

        expect(dataItem.getId()).toBe("Feature_Test-"+metadata.name);
    });

    it("Will defer loading if the constraints are pre-populated to avoid a race condition", function() {
        var constraints = ['1', '2', '3'];
        var metadata = {
            name:'item',
            dataType:'text',
            constraints: {
                type:'pre-populated',
                source: {
                    "literal": constraints
                }
            }
        };
        var dataItem = ko.observable().extend({metadata:{metadata:metadata, context:context, config:config}});
        dataItem.load("3");

        expect(dataItem.constraints()).toEqual(constraints);
        expect(dataItem()).toEqual("3");

        metadata.constraints.source = {
            url:'/test'
        };

        var url = null;
        var deferred = null;
        spyOn($, 'ajax').and.callFake(function(p1,p2) {
            url = p1;
            deferred = $.Deferred();
            return deferred;
        });

        dataItem.load("2");
        expect(url).toEqual(metadata.constraints.source.url);
        // The load should be deferred until the constraints are populated.
        expect(dataItem()).toBeUndefined();

        // Now we fake the return of the ajax call with the constraints.
        deferred.resolve(constraints);

        // The constraints should be populated
        expect(dataItem.constraints).toEqual(constraints);

        // And the load should proceed.
        expect(dataItem()).toEqual("2");

    });

});
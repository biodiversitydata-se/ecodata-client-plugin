describe("Validate on change binding handler Spec", function () {

    it("Should replace the text of the element with the result of evaluating the expression against the binding context", function() {
        var mockElement = document.createElement('input');
        $(mockElement).attr('readonly', 'readonly');

        var observable = ko.observable();
        ko.bindingHandlers.validateOnChange.init(mockElement, function() { return observable });

        spyOn($.fn, 'validationEngine');
        observable("new value");

        setTimeout(function() {
            expect($.fn.validationEngine).toHaveBeenCalledWith('validate');
            done();
        })
    });

});
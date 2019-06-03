describe("Expression data binding Spec", function () {

    it("Should replace the text of the element with the result of evaluating the expression against the binding context", function() {
        var mockElement = document.createElement('span');
        var expression = "x + y";
        ko.bindingHandlers.expression.update(mockElement, function() { return expression }, null, {}, {x:10, y:20});

        expect($(mockElement).text()).toBe("30.00");
    });
});

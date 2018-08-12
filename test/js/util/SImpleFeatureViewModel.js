ecodata.forms.SimpleFeatureViewModel = function (output, dataModel, context, config) {

    var self = this;
    ecodata.forms.OutputModel.apply(self, [output, dataModel, context, config]);

    self.data.feature = ko.observable().extend({feature:true});
    self.data.areaHa = ko.computed(function () {
        return ecodata.forms.expressionEvaluator.evaluate('feature.areaHa()', self.data, 2);
    });

    self.data.lengthKm = ko.computed(function () {
        return ecodata.forms.expressionEvaluator.evaluate('feature.lengthKm()', self.data, 2);
    });

    self.loadData = function(data) {
        self.data['feature'](ecodata.forms.orDefault(data['feature'], undefined));
    };
};
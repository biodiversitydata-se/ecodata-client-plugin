ecodata.forms.SimpleFeatureViewModel = function (output, dataModel, context, config) {

    var self = this;
    ecodata.forms.OutputModel.apply(self, [output, dataModel, context, config]);

    self.data.feature = ko.observable().extend({feature:true});
    self.data.areaHa = ko.computed(function () {
        return ecodata.forms.expressionEvaluator.evaluate('$geom.areaHa(feature)', self.data, 2);
    });

    self.data.lengthKm = ko.computed(function () {
        return ecodata.forms.expressionEvaluator.evaluate('$geom.lengthKm(feature)', self.data, 2);
    });

    self.loadData = function(data) {
        self.data['feature'](ecodata.forms.orDefault(data['feature'], undefined));
    };
};
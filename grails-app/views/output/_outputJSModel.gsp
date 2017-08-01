<asset:script>
    <g:set var="outputNameAsIdentifer" value="${fc.toSingleWord([name: outputName])}"/>

    ecodata.forms["${outputNameAsIdentifer + 'ViewModel'}"] = function (output, dataModel, context, config) {

        var self = this;

        // load dynamic models - usually objects in a list
        <md:jsModelObjects model="${model}" site="${site}" speciesLists="${speciesLists}" edit="${edit}" printable="${printable?:''}"/>
        ecodata.forms.OutputModel.apply(self, [output, dataModel, context, config]);

        // add declarations for dynamic data
        <md:jsViewModel model="${model}"  output="${outputName}"  edit="${edit}" printable="${printable?:''}"/>

        // this will be called when generating a savable model to remove transient properties
        self.removeBeforeSave = function (jsData) {

            <md:jsRemoveBeforeSave model="${model}"/>
            return self.removeTransients(jsData);
        };


        self.loadData = function (data, documents) {

            data = self.loadOrPrepop(data);
            <md:jsLoadModel model="${model}"/>

            self.transients.dummy.notifySubscribers();
        };
    };
</asset:script>

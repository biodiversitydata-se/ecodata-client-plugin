<r:script>
    <g:set var="outputNameAsIdentifer" value="${fc.toSingleWord([name: outputName])}"/>
    // load dynamic models - usually objects in a list
    <md:jsModelObjects model="${model}" site="${site}" speciesLists="${speciesLists}" edit="${edit}" printable="${printable?:''}"/>

    ecodata.forms["${outputNameAsIdentifer + 'ViewModel'}"] = function (output, context, config) {
        var self = this;
        ecodata.forms.OutputModel.apply(self, [output, context, config]);

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
</r:script>

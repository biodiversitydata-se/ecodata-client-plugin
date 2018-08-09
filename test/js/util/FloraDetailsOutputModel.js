/** Test input for OutputModel tests.  Taken from the autogenerated Flora Details output model */
// returns blank string if the property is undefined, else the value
function orBlank(v) {
    return v === undefined ? '' : v;
}
function orFalse(v) {
    return v === undefined ? false : v;
}
function orZero(v) {
    return v === undefined ? 0 : v;
}
function orEmptyArray(v) {
    return v === undefined ? [] : v;
}

Flora_Survey_Details_ViewModel = function (output, dataModel, context, config) {
    var self = this;

    var Output_BiologicalSurveyFlora_surveyResultsFloraRow = function (data, parent, index, config) {
        var self = this;
        self.$parent = parent;
        self.$index = index;
        if (!data) data = {};
        self.transients = {};
        this.plotId = ko.observable(orBlank(data['plotId']));
        this.sampleSiteId = ko.observable(orBlank(data['sampleSiteId']));
        var speciesConfig = _.extend(config, {printable:'', dataFieldName:'species', output: 'Flora Survey Details', surveyName: '' });
        this.species =  new SpeciesViewModel(data['species'] || {}, speciesConfig);
        this.numberOfOrganisms = ko.observable(orZero(data['numberOfOrganisms'])).extend({numericString:2});
        this.stratum = ko.observable(orBlank(data['stratum']));
        self.transients.stratumConstraints = ["Canopy","Sub-canopy","Mid-stratum","Shrub layer","Ground stratum"];
        this.aveHeight = ko.observable(orZero(data['aveHeight'])).extend({numericString:2});
        this.dbh = ko.observable(orZero(data['dbh'])).extend({numericString:2});
        this.health = ko.observable(orBlank(data['health']));
        this.biologicalMaterialTaken = ko.observable(orBlank(data['biologicalMaterialTaken']));
        self.transients.biologicalMaterialTakenConstraints = ["Yes","No"];
        this.speciesNotes = ko.observable(orBlank(data['speciesNotes']));
    };

    ecodata.forms.OutputModel.apply(self, [output, dataModel, context, config]);

    // add declarations for dynamic data

    self.data.surveyResultsFlora = ko.observableArray([]);
    self.selectedsurveyResultsFloraRow = ko.observable();


    self.loadsurveyResultsFlora = function (data, append) {
        if (!append) {
            self.data.surveyResultsFlora([]);
        }
        if (data === undefined) {
            self.addsurveyResultsFloraRow(self, 0);
        } else {
            $.each(data, function (i, obj) {
                self.data.surveyResultsFlora.push(new Output_BiologicalSurveyFlora_surveyResultsFloraRow(obj, self, i, config));
            });
        }
    };
    self.downloadsurveyResultsFloraTemplateWithData = function() {
        self.downloadDataTemplate('surveyResultsFlora');
    };

    self.addsurveyResultsFloraRow = function () {
        var newRow = new Output_BiologicalSurveyFlora_surveyResultsFloraRow(undefined, self, self.surveyResultsFlorarowCount(), config);
        self.data.surveyResultsFlora.push(newRow);

    };
    self.removesurveyResultsFloraRow = function (row) {
        self.data.surveyResultsFlora.remove(row);

    };
    self.surveyResultsFlorarowCount = function () {
        return self.data.surveyResultsFlora().length;
    };

    self.surveyResultsFloraTableDataUploadVisible = ko.observable(false);
    self.showsurveyResultsFloraTableDataUpload = function() {
        self.surveyResultsFloraTableDataUploadVisible(!self.surveyResultsFloraTableDataUploadVisible());
    };

    self.templateDownloadUrl = function(type) {
        return '/fieldcapture/proxy/excelOutputTemplate?listName=surveyResultsFlora&type=Flora+Survey+Details';
    };

    self.surveyResultsFloraTableDataUploadOptions = {
        url:'/fieldcapture/activity/ajaxUpload',
        done:function(e, data) {
            if (data.result.error) {
                self.uploadFailed(data.result.error);
            }
            else {
                self.loadsurveyResultsFlora(data.result.data, self.appendTableRows());
            }
        },
        fail:function(e, data) {
            var message = 'Please contact MERIT support and attach your spreadsheet to help us resolve the problem';
            self.uploadFailed(data);

        },
        uploadTemplateId: "surveyResultsFloratemplate-upload",
        downloadTemplateId: "surveyResultsFloratemplate-download",
        formData:{type:'Flora Survey Details', listName:'surveyResultsFlora'}
    };
    self.appendTableRows = ko.observable(true);
    self.uploadFailed = function(message) {
        var text = "<span class='label label-important'>Important</span><h4>There was an error uploading your data.</h4>";
        text += "<p>"+message+"</p>";
        bootbox.alert(text)
    };

    self.data.totalNumberOfOrganisms = ko.computed(function () {
        var total = 0;
        for(var i = 0; i < self.data.surveyResultsFlora().length; i++) {
            var value = self.data.surveyResultsFlora()[i].numberOfOrganisms();
            total = total + Number(value);
        }
        return total;
    });

    self.data.soilSampleCollected = ko.observable();

    self.data.notes = ko.observable();


    // this will be called when generating a savable model to remove transient properties
    self.removeBeforeSave = function (jsData) {

        delete jsData.selectedsurveyResultsFloraRow;
        delete jsData.surveyResultsFloraTableDataUploadOptions;
        delete jsData.surveyResultsFloraTableDataUploadVisible;

        return parent.removeBeforeSave(jsData);
    };


    self.loadData = function (outputData, documents) {

        self.loadOrPrepop(outputData).done(function(data){

            self.loadsurveyResultsFlora(data.surveyResultsFlora);
            self.data['soilSampleCollected'](data['soilSampleCollected']);
            self.data['notes'](data['notes']);

            self.transients.dummy.notifySubscribers();
        });
    };
};
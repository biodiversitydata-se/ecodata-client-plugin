//= require validatejs/0.11.1/validate.js
//= require forms-knockout-bindings.js
//= require speciesModel.js
//= require images.js
//= require image-gallery.js

/**
 * Support functions for the ecodata forms rendering feature.
 */
(function() {

    // base namespace for the forms library
    if (!window.ecodata) {
        ecodata = {forms:{}};
    }

    /**
     * Helper function for evaluating expressions defined in the metadata.  These may be used to compute values
     * or make decisions on which constraints to apply to individual data model items.
     * The expressions are parsed and evaluated using: https://github.com/silentmatt/expr-eval
     *
     * @type {{evaluate, evaluateBoolean, evaluateString}}
     */
    ecodata.forms.expressionEvaluator = function () {
        function bindVariable(variable, context) {
            if (!context) {
                return;
            }
            var result;
            var contextVariable = variable;
            var specialVariables = ['index', 'parent'];
            if (specialVariables.indexOf(variable) >= 0) {
                contextVariable = '$' + variable;
            }
            if (!_.isUndefined(context[contextVariable])) {
                result = ko.utils.unwrapObservable(context[contextVariable]);
            }
            else {
                if (context['$parent']) {
                    result = bindVariable(variable, context['$parent']);
                }
            }
            return result;

        }

        function bindVariables(variables, context) {

            // TODO - use metadata to cast numerical model values to numbers to support mathematical operations.
            // Currently any expression literals have to be strings which means numerics aren't well supported.
            var boundVariables = {};
            for (var i = 0; i < variables.length; i++) {
                boundVariables[variables[i]] = bindVariable(variables[i], context);
            }
            return boundVariables;
        }

        var expressionCache = {};

        function evaluateInternal(expression, context) {
            var parsedExpression = expressionCache[expression];
            if (!parsedExpression) {
                parsedExpression = Parser.parse(expression);
                expressionCache[expression] = parsedExpression;
            }

            var variables = parsedExpression.variables();
            var boundVariables = bindVariables(variables, context);

            var result;
            try {
                result = parsedExpression.evaluate(boundVariables);
            }
            catch (e) { // undefined dependencies cause an exception to be thrown.
                result = ''; // Ignore as this is will happen when the computed is first evaluated against the model before load has been called.
            }

            return result;
        }

        function evaluateNumber(expression, context, numberOfDecimalPlaces) {

            var result = evaluateInternal(expression, context);
            if (!isNaN(result)) {
                if (numberOfDecimalPlaces == undefined) {
                    numberOfDecimalPlaces = 2;
                }

                result = neat_number(result, numberOfDecimalPlaces);
            }

            return result;
        }

        function evaluateBoolean(expression, context) {
            var result = evaluateInternal(expression, context);
            return result ? true : false;
        }

        function evaluateString(expression, context) {
            var result = evaluateInternal(expression, context);
            return ''.concat(result);
        }

        return {
            evaluate: evaluateNumber,
            evaluateBoolean: evaluateBoolean,
            evaluateString: evaluateString
        }

    }();

    ecodata.forms.orDefault = function(value, defaultValue) {
        return value === undefined ? defaultValue : value;
    };

    ecodata.forms.dataLoader = function(context, config) {
        var self = this;
        self.getNestedValue = function(data, path) {

            var paths = path.split('.')
                , current = data
                , i;

            for (i = 0; i < paths.length; ++i) {

                if (current[paths[i]] == undefined) {
                    return undefined;
                } else {
                    current = current[paths[i]];
                }
            }
            return current;
        };

        /** Merge properties from obj2 into obj1 recursively, favouring obj1 unless undefined / missing. */
        self.merge = function (obj1, obj2, result) {

            var keys = _.union(_.keys(obj1), _.keys(obj2));
            result = result || {};

            for (var i = 0; i < keys.length; i++) {

                var key = keys[i];
                if (obj2[key] === undefined) {
                    result[key] = obj1[key];
                }
                else if (obj1[key] === undefined && config.replaceUndefined) {
                    result[key] = obj2[key];
                }
                else if (!obj1.hasOwnProperty(key)) {
                    result[key] = obj2[key];
                }
                else if (_.isArray(obj1[key]) && _.isArray(obj2[key])) {
                    if (obj2[key].length > obj1[key].length) {
                        obj2[key].splice(obj1[key].length, obj2[key].length - obj1[key].length); // Delete extra array elements from obj2.
                    }
                    result[key] = self.merge(obj1[key], obj2[key], []);
                }
                else if (_.isObject(obj1[key]) && _.isObject(obj2[key])) {
                    result[key] = self.merge(obj1[key], obj2[key]);
                }
                else {
                    result[key] = obj1[key];
                }
            }
            return result;
        };

        self.prepop = function (conf) {
            return self.getPrepopData(conf).pipe(function(prepopData) {
                if (prepopData) {
                    var result = prepopData;
                    var mapping = conf.mapping;
                    if (mapping) {
                        result = self.map(mapping, prepopData);
                    }
                    return result;
                }
            });
        };

        self.map = function (mappingList, data) {
            var result;
            if (_.isArray(data)) {
                result = [];
                _.each(data, function(d) {
                    result.push(self.mapObject(mappingList, d));
                });
            }
            else {
                result = self.mapObject(mappingList, data);
            }

            return result;
        };

        self.mapObject = function(mappingList, data) {
            var result = {};

            _.each(mappingList, function (mapping) {

                // Presence of a nested mapping element indicates a list.
                if (_.has(mapping, 'mapping')) {
                    result[mapping.target] = [];
                    var selectedData = self.getNestedValue(data, mapping['source-path']);
                    _.each(selectedData, function (d) {
                        var nestedResult = self.map(mapping.mapping, d);
                        if (nestedResult) {
                            result[mapping.target].push(nestedResult);
                        }

                    });
                }
                else {
                    result[mapping.target] = self.getNestedValue(data, mapping['source-path']);
                }
            });
            return result;
        };

        self.getPrepopData = function (conf) {
            var source = conf.source;
            if (source.url) {
                var url = config[source.url];
                return $.post(url, source.params);
            }
            var deferred = $.Deferred();
            var data = null;
            if (source && source.hasOwnProperty('context-path')) {
                data = context;
                if (source['context-path']) {
                    data = self.getNestedValue(context, source['context-path']);
                }
            }
            deferred.resolve(data);
            return deferred;
        };

        return {
            getPrepopData:self.getPrepopData,
            prepop:self.prepop,
            merge:self.merge
        };

    };


    /**
     * Implements the constraints specified on a single data model item using the "constraints" attribute in the metadata.
     * @param metadata the metadata definition for the data model item.
     * @constructor
     */
    ecodata.forms.DataModelItem = function(metadata, parent, context, config) {
        var self = this;
        var dataLoader = ecodata.forms.dataLoader(context, config);

        self.get = function(name) {
            return metadata[name];
        };

        self.checkWarnings = function() {
            //var rules = str.split(/\[|,|\]/);
            var warningRule = metadata.warning;

            var constraints = {
                val: warningRule
            };
            return validate({val:self()}, constraints, {fullMessages:false});
        };

        self.evaluateBehaviour = function(type, defaultValue) {
            var rule = _.find(metadata.behaviour, function(rule) {
                return rule.type === type && ecodata.forms.expressionEvaluator.evaluateBoolean(rule.condition, parent);
            });

            return rule && rule.value || defaultValue;
        };

        if (metadata.constraints) {
            var valueProperty = 'id'; // For compatibility with select2 defaults
            var textProperty = 'text'; // For compatibility with select2 defaults
            if (_.isObject(metadata.constraints)) {
                valueProperty = metadata.constraints.valueProperty || valueProperty;
                textProperty = metadata.constraints.textProperty || textProperty;
            }

            self.constraints = [];
            // Support existing configuration style.
            if (_.isArray(metadata.constraints)) {
                self.constraints = metadata.constraints;
            }
            else if (_.isObject(metadata.constraints)) {
                if (metadata.constraints.type == 'computed') {
                    self.constraints = ko.computed(function() {
                        var rule = _.find(metadata.constraints.options, function(option) {
                            return ecodata.forms.expressionEvaluator.evaluateBoolean(option.condition, parent);
                        });
                        return rule ? rule.value : metadata.constraints.default;
                    });
                }
                else if (metadata.constraints.type == 'pre-populated') {
                    self.constraints = ko.observableArray();
                    dataLoader.prepop(metadata.constraints.config).done(function(data) {
                        self.constraints(data);
                    });
                }
            }

            self.constraints.value = function(constraint) {
                if (_.isObject(constraint)) {
                    return constraint[valueProperty];
                }
                return constraint;
            };
            self.constraints.text = function(constraint) {
                if (_.isObject(constraint)) {
                    return constraint[textProperty];
                }
                return constraint;
            };
        }

        if (metadata.displayOptions) {
            self.displayOptions = metadata.displayOptions;
        }

    };

    /**
     * Provides helper functionality for "list" data types.
     * @param dataModel the dataModel definition for the list from the form metadata (dataModel.json)  This is the
     * nested dataModel items found in the columns attribute of data model items with dataType = "list"
     * @param ListItemType the constructor function to call when creating data to store in the list.
     * @param context the context in which the view model is being rendered.
     * @param userAddedRows flag indicating if new values can be added to the list by the user at runtime.
     * @param config configuration for the view model, mostly URLs.
     * @constructor
     */
    ecodata.forms.OutputListSupport = function (dataModel, ListItemType, context, userAddedRows, config) {
        var self = this;

        var parent = context.parent;
        var listName = context.listName;

        var list = parent.data[listName];

        self.listName = listName;
        self.addRow = function (data) {
            var newItem = self.newItem(data, self.rowCount());
            list.push(newItem);
        };
        self.newItem = function(data, index) {
            var itemDataModel = _.indexBy(dataModel[listName].columns, 'name');
            var itemContext = _.extend({}, context, {index:index});
            return new ListItemType(data, itemDataModel, itemContext, config);
        };
        self.removeRow = function (item) {
            list.remove(item);
        };
        self.rowCount = function () {
            return list().length;
        };
        self.appendTableRows = ko.observable(userAddedRows);
        self.tableDataUploadVisible = ko.observable(false);
        self.showTableDataUpload = function () {
            self.tableDataUploadVisible(!self.tableDataUploadVisible());
        };

        self.downloadTemplate = function () {
            // Download a blank template if we are appending, otherwise download a template containing the existing data.
            if (self.appendTableRows()) {
                parent.downloadTemplate(listName);
            }
            else {
                parent.downloadDataTemplate(listName, true, userAddedRows);
            }
        };
        self.downloadTemplateWithData = function () {
            parent.downloadDataTemplate(listName, false, true);
        };
        self.tableDataUploadOptions = parent.buildTableOptions(self);
        self.allowUserAddedRows = userAddedRows;
        self.findDocumentInContext = function(documentId) {
            return parent.findDocumentInContext(documentId);
        };

        parent['load'+listName] = function(data, append) {
            if (!append) {
                list([]);
            }
            if (data === undefined) {
                list.loadDefaults();
            }
            else {
                _.each(data, function(row, i) {
                    list.push(self.newItem(row, i));
                });
            }
        };
    };

    /**
     * All view models rendered by the forms rendering subsystem will extend an instance of OutputModel.
     *
     * @param output the Output instance to be rendered as a form.
     * @param dataModel the dataModel definition from the form metadata (dataModel.json)
     * @param context any context in which this output is being rendered (project / activity / site etc).  Used for pre-population.
     * @param config configuration for the view model, mostly URLs.
     * @constructor
     */
    ecodata.forms.OutputModel = function (output, dataModel, context, config) {

        var self = this;
        var dataLoader = ecodata.forms.dataLoader(context, config);
        if (!output) {
            output = {};
        }
        self.dataModel = _.indexBy(dataModel, 'name');
        self.$context = context;
        var activityId = output.activityId || config.activityId;
        self.name = output.name;
        self.outputId = output.outputId || '';

        self.data = {};
        self.transients = {};
        var notCompleted = output.outputNotCompleted;

        if (notCompleted === undefined) {
            notCompleted = config.collapsedByDefault;
        }

        var toIgnore = {ignore: ['transients', '$parent', '$index', '$context', 'dataModel']};
        self.outputNotCompleted = ko.observable(notCompleted);
        self.transients.optional = config.optional || false;
        self.transients.questionText = config.optionalQuestionText || 'Not applicable';
        self.transients.dummy = ko.observable();

        self.downloadTemplate = function (listName) {
            var url = config.excelOutputTemplateUrl + '?listName=' + listName + '&type=' + output.name;
            $.fileDownload(url);
        };

        self.downloadDataTemplate = function (listName, editMode, userAddedRows) {
            var data = ko.mapping.toJS(self.data[listName](), toIgnore);
            var params = {
                listName: listName,
                type: self.name,
                editMode: editMode,
                allowExtraRows: userAddedRows,
                data: JSON.stringify(data)
            };
            var url = config.excelOutputTemplateUrl;
            $.fileDownload(url, {
                httpMethod: 'POST',
                data: params
            });

        };
        // this will be called when generating a savable model to remove transient properties
        self.removeTransients = function (jsData) {
            delete jsData.activityType;
            delete jsData.transients;
            return jsData;
        };

        // this returns a JS object ready for saving
        self.modelForSaving = function () {
            // get model as a plain javascript object
            var jsData = ko.mapping.toJS(self, toIgnore);
            if (self.outputNotCompleted()) {
                jsData.data = {};
            }

            // get rid of any transient observables
            return self.removeBeforeSave(jsData);
        };

        // this is a version of toJSON that just returns the model as it will be saved
        // it is used for detecting when the model is modified (in a way that should invoke a save)
        // the ko.toJSON conversion is preserved so we can use it to view the active model for debugging
        self.modelAsJSON = function () {
            return JSON.stringify(self.modelForSaving());
        };

        self.loadOrPrepop = function (data) {

            var result = data || {};

            var deferred = $.Deferred();
            var waitingOn = [];

            if (config && !config.disablePrepop && config.model) {
                var conf = config.model['pre-populate'];

                if (conf) {
                    _.each(conf, function (item) {
                        if (item.merge || !data) {
                            waitingOn.push(dataLoader.prepop(item).done(function (prepopData) {
                                if (prepopData) {
                                    _.extend(result, dataLoader.merge(prepopData, result));
                                }
                            }));
                        }
                    });
                }
            }
            // Wait for all configured pre-pop to complete, then resolve our deferred.
            $.when.apply($, waitingOn).then(function() {
                deferred.resolve(result);
            });

            return deferred;
        };




        self.attachDocument = function (target) {
            var url = config.documentUpdateUrl || fcConfig.documentUpdateUrl;
            showDocumentAttachInModal(url, new DocumentViewModel({
                role: 'information',
                stage: config.stage
            }, {activityId: activityId, projectId: config.projectId}), '#attachDocument')
                .done(function (result) {
                    target(new DocumentViewModel(result))
                });
        };
        self.editDocumentMetadata = function (document) {
            var url = (config.documentUpdateUrl || fcConfig.documentUpdateUrl) + "/" + document.documentId;
            showDocumentAttachInModal(url, document, '#attachDocument');
        };
        self.deleteDocument = function (document) {
            document.status('deleted');
            var url = (config.documentDeleteUrl || fcConfig.documentDeleteUrl) + '/' + document.documentId;
            $.post(url, {}, function () {
            });

        };

        self.uploadFailed = function (message) {
            var text = "<span class='label label-important'>Important</span><h4>There was an error uploading your data.</h4>";
            text += "<p>" + message + "</p>";
            bootbox.alert(text)
        };

        self.buildTableOptions = function (list) {

            var listName = list.listName;
            return {
                url: config.excelDataUploadUrl,
                done: function (e, data) {
                    if (data.result.error) {
                        self.uploadFailed(data.result.error);
                    }
                    else {
                        self['load' + listName](data.result.data, list.appendTableRows());
                    }
                },
                fail: function (e, data) {
                    self.uploadFailed(data);
                },
                dataType: 'json',
                uploadTemplateId: listName + "template-upload",
                downloadTemplateId: listName + "template-download",
                formData: {type: output.name, listName: listName}
            };
        };
        self.findDocumentInContext = function(documentId) {
            return _.find(context.documents || [], function(document) {
                return document.documentId === documentId;
            })
        };

        function checkWarningsInObject(items, obj) {
            var warnings = []
            _.each(items, function(item) {
                var dataModelItem = obj[item.name];
                if (item.dataType == 'list') {
                    _.each(obj[item.name](), function(listItem) {
                        warnings = warnings.concat(checkWarningsInObject(item.columns, listItem));
                    });
                }
                else if (dataModelItem && typeof dataModelItem.checkWarnings == 'function') {
                    var warning = dataModelItem.checkWarnings();
                    if (warning) {
                        warnings.push(warning);
                    }
                }
            });

            return warnings;
        }

        self.checkWarnings = function() {
            return checkWarningsInObject(dataModel, self.data);
        }


    };
}());
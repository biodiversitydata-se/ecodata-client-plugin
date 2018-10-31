//= require emitter/emitter
//= require validatejs/0.11.1/validate.js
//= require expr-eval/1.2.1/bundle
//= require forms-knockout-bindings.js
//= require speciesModel.js
//= require images.js
//= require image-gallery.js
//= require viewModels.js

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
/**
 * Support functions for the ecodata forms rendering feature.
 */
(function () {

    $.fn.select2.defaults.set( "width", "100%" );

    // base namespace for the forms library
    if (!window.ecodata) {
        ecodata = {forms: {}};
    }

    ecodata.forms.utils = {

        /**
         * fired when logo image is loaded. fn used to stretch small image to height or width of parent container.
         * @param imageElement the img element
         * givenWidth - (optional) width of the bounding box containing the image. If nothing is passed parent width is used.
         * givenHeight - (optional) height of the bounding box containing the image. If nothing is passed parent height is used.
         */
        findLogoScalingClass: function (imageElement, givenWidth, givenHeight) {
            var $elem = $(imageElement);
            var parentHeight = givenHeight || $elem.parent().height();
            var parentWidth = givenWidth || $elem.parent().width();
            var height = imageElement.height;
            var width = imageElement.width;

            var ratio = parentWidth/parentHeight;
            if( ratio * height > width){
                $elem.addClass('tall')
            } else {
                $elem.addClass('wide')
            }
        },
        neat_number: function (number, decimals) {
            var str = ecodata.forms.utils.number_format(number, decimals);
            if (str.indexOf('.') === -1) {
                return str;
            }
            // trim trailing zeros beyond the decimal point
            while (str[str.length - 1] === '0') {
                str = str.substr(0, str.length - 1);
            }
            if (str[str.length - 1] === '.') {
                str = str.substr(0, str.length - 1);
            }
            return str;
        },

        number_format: function (number, decimals, dec_point, thousands_sep) {
            // http://kevin.vanzonneveld.net
            // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +     bugfix by: Michael White (http://getsprink.com)
            // +     bugfix by: Benjamin Lupton
            // +     bugfix by: Allan Jensen (http://www.winternet.no)
            // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
            // +     bugfix by: Howard Yeend
            // +    revised by: Luke Smith (http://lucassmith.name)
            // +     bugfix by: Diogo Resende
            // +     bugfix by: Rival
            // +      input by: Kheang Hok Chin (http://www.distantia.ca/)
            // +   improved by: davook
            // +   improved by: Brett Zamir (http://brett-zamir.me)
            // +      input by: Jay Klehr
            // +   improved by: Brett Zamir (http://brett-zamir.me)
            // +      input by: Amir Habibi (http://www.residence-mixte.com/)
            // +     bugfix by: Brett Zamir (http://brett-zamir.me)
            // +   improved by: Theriault
            // +      input by: Amirouche
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // *     example 1: number_format(1234.56);
            // *     returns 1: '1,235'
            // *     example 2: number_format(1234.56, 2, ',', ' ');
            // *     returns 2: '1 234,56'
            // *     example 3: number_format(1234.5678, 2, '.', '');
            // *     returns 3: '1234.57'
            // *     example 4: number_format(67, 2, ',', '.');
            // *     returns 4: '67,00'
            // *     example 5: number_format(1000);
            // *     returns 5: '1,000'
            // *     example 6: number_format(67.311, 2);
            // *     returns 6: '67.31'
            // *     example 7: number_format(1000.55, 1);
            // *     returns 7: '1,000.6'
            // *     example 8: number_format(67000, 5, ',', '.');
            // *     returns 8: '67.000,00000'
            // *     example 9: number_format(0.9, 0);
            // *     returns 9: '1'
            // *    example 10: number_format('1.20', 2);
            // *    returns 10: '1.20'
            // *    example 11: number_format('1.20', 4);
            // *    returns 11: '1.2000'
            // *    example 12: number_format('1.2000', 3);
            // *    returns 12: '1.200'
            // *    example 13: number_format('1 000,50', 2, '.', ' ');
            // *    returns 13: '100 050.00'
            // Strip all characters but numerical ones.
            number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
            var n = !isFinite(+number) ? 0 : +number,
                prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
                sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
                dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
                s = '',
                toFixedFix = function (n, prec) {
                    var k = Math.pow(10, prec);
                    return '' + Math.round(n * k) / k;
                };
            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
            s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
            if (s[0].length > 3) {
                s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
            }
            if ((s[1] || '').length < prec) {
                s[1] = s[1] || '';
                s[1] += new Array(prec - s[1].length + 1).join('0');
            }
            return s.join(dec);
        }
    };

    /**
     * Helper function for evaluating expressions defined in the metadata.  These may be used to compute values
     * or make decisions on which constraints to apply to individual data model items.
     * The expressions are parsed and evaluated using: https://github.com/silentmatt/expr-eval
     *
     * @type {{evaluate, evaluateBoolean, evaluateString}}
     */
    ecodata.forms.expressionEvaluator = function () {
        var specialBindings = function() {
            var SQUARE_METERS_IN_HECTARE = 10000;
            function m2ToHa(areaM2) {
                return areaM2 / SQUARE_METERS_IN_HECTARE;
            }

            return {
                $geom: {
                    lengthKm: function (geoJSON, linesOnly) {
                        if (_.isUndefined(linesOnly)) {
                            linesOnly = true;
                        }
                        if (linesOnly) {
                            var linesOnly = _.filter(geoJSON.features, function(feature) {
                                return feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString';
                            });
                            geoJSON = {
                                type:'FeatureCollection',
                                features:linesOnly
                            };
                        }

                        return turf.length(geoJSON, {units: 'kilometers'});
                    },
                    areaHa: function (geoJSON) {
                        return m2ToHa(turf.area(geoJSON))
                    }
                }

            };
        }();

        var preprocessBindings = function(variable) {
            var specialVariables = {
                'index':'$index',
                'parent':'$parent'
            }
            return specialVariables[variable] ? specialVariables[variable] : variable;
        };

        function bindVariable(variable, context) {
            if (!context) {
                return;
            }
            var result;

            var contextVariable = preprocessBindings(variable);
            if (specialBindings[contextVariable]) {
                result = specialBindings[contextVariable];
            }
            else {
                if (!_.isUndefined(context[contextVariable])) {
                    result = ko.utils.unwrapObservable(context[contextVariable]);
                }
                else {
                    // Try to evaluate against the parent
                    if (context['$parent']) {
                        // If the parent is the output model, we want to evaluate against the "data" property
                        var parentContext = _.isObject(context['$parent'].data) ? context['$parent'].data : context['$parent'];
                        result = bindVariable(variable, parentContext);
                    }
                }

            }
            return result;
        }

        function bindVariables(variables, context) {

            // Currently any expression literals have to be strings which means numeric values aren't well supported.
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
                parsedExpression = exprEval.Parser.parse(expression);
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
                if (_.isFunction(result.toFixed)) {
                    result = result.toFixed(numberOfDecimalPlaces);
                }
                else {
                    result = ecodata.forms.utils.neat_number(result, numberOfDecimalPlaces);
                }

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


    /**
     * Creates an instance of the view model identified by the supplied name.
     */
    ecodata.forms.initialiseOutputViewModel = function(outputViewModelName, dataModel, output, config, context) {

        var defaults = {
            constructorFunction : ecodata.forms[outputViewModelName + 'ViewModel'],
            dirtyFlag: ko.simpleDirtyFlag,
            viewRootElementId: 'ko'+outputViewModelName,
            recoveryDataStorageKey: output && output.outputId ? 'output-'+output.outputId : 'output-'+outputViewModelName
        };

        config = _.defaults(config, defaults);
        var viewModel = new config.constructorFunction(output, dataModel, context, config);
        viewModel.initialise(output.data);

        // dirtyFlag must be defined after data is initialised
        viewModel.dirtyFlag = config.dirtyFlag(viewModel, false);

        ko.applyBindings(viewModel, document.getElementById(config.viewRootElementId));

        // this resets the baseline for detecting changes to the model
        // - shouldn't be required if everything behaves itself but acts as a backup for
        //   any binding side-effects
        // - note that it is not foolproof as applying the bindings happens asynchronously and there
        //   is no easy way to detect its completion
        viewModel.dirtyFlag.reset();

        // Check for locally saved data for this output - this will happen in the event of a session timeout
        // for example.
        var savedData = amplify.store(config.recoveryDataStorageKey);
        var savedOutput = null;
        if (savedData) {
            savedData = $.parseJSON(savedData);

            var savedOutput;
            if (savedData.name && savedData.name == output.name) {
                savedOutput = savedData.data;
            }
            else if (savedData.outputs) {
                $.each(savedData.outputs, function (i, tmpOutput) {
                    if (tmpOutput.name === output.name) {
                        if (tmpOutput.data) {
                            savedOutput = tmpOutput.data;
                        }
                    }
                });
            }
        }
        if (savedOutput) {
            viewModel.loadData(savedOutput);
        }

        return viewModel;
    };


    ecodata.forms.orDefault = function (value, defaultValue) {
        return value === undefined ? defaultValue : value;
    };

    ecodata.forms.dataLoader = function (context, config) {
        var self = this;
        self.getNestedValue = function (data, path) {

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
            return self.getPrepopData(conf).then(function (prepopData) {
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
                _.each(data, function (d) {
                    result.push(self.mapObject(mappingList, d));
                });
            }
            else {
                result = self.mapObject(mappingList, data);
            }

            return result;
        };

        self.mapObject = function (mappingList, data) {
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
            getPrepopData: self.getPrepopData,
            prepop: self.prepop,
            merge: self.merge
        };

    };

    /**
     * Implements the constraints specified on a single data model item using the "constraints" attribute in the metadata.
     * Also provides access to global configuration and context for components that need it.
     *
     * @param metadata the metadata definition for the data model item.
     * @param parent the container (e.g. OutputModel or NestedModel) in which this data model item is defined.  Used to make
     * the parent data available for expression evaluation or constraint evaluation.  Also used for id building.
     * @param context global context in which the form is being rendered.  For MERIT/BioCollect this will include
     * project/site/activity/survey type information.  Also contains the parent object and index for nested data items.
     * @param config other configuration items, such as URLs for species searching etc.
     */
    ecodata.forms.DataModelItem = function (metadata, context, config) {
        var self = this;

        self.context = context;
        self.config = config;

        /**
         * Returns the value of the specified metadata property (e.g. validate, constraints etc)
         * @param property the name of the proprety to get.
         * @returns {*}
         */
        self.get = function (property) {
            return metadata[property];
        };

        self.getName = function() {
            return metadata.name;
        };

        var cachedId;
        /**
         * Produces a unique id for this item based on the parent, item name and index (for nested items).
         * @returns {*}
         */
        self.getId = function() {
            // Lazily calculate the id.
            if (cachedId) {
                return cachedId;
            }
            cachedId = config.outputName +'-'+self.getName();
            if (!_.isUndefined(context.index)) {
                cachedId += "-"+context.index;
            }
            return cachedId;

        };

        self.checkWarnings = function () {
            //var rules = str.split(/\[|,|\]/);
            var warningRule = metadata.warning;

            var constraints = {
                val: warningRule
            };
            return validate({val: self()}, constraints, {fullMessages: false});
        };

        self.evaluateBehaviour = function (type, defaultValue) {
            var rule = _.find(metadata.behaviour, function (rule) {
                return rule.type === type && ecodata.forms.expressionEvaluator.evaluateBoolean(rule.condition, context.parent);
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
                    self.constraints = ko.computed(function () {
                        var rule = _.find(metadata.constraints.options, function (option) {
                            return ecodata.forms.expressionEvaluator.evaluateBoolean(option.condition, context.parent);
                        });
                        return rule ? rule.value : metadata.constraints.default;
                    });
                }
                else if (metadata.constraints.type == 'pre-populated') {
                    self.constraints = ko.observableArray();
                    var dataLoader = ecodata.forms.dataLoader(context, config);
                    dataLoader.prepop(metadata.constraints.config).done(function (data) {
                        self.constraints(data);
                    });
                }
            }

            self.constraints.value = function (constraint) {
                if (_.isObject(constraint)) {
                    return constraint[valueProperty];
                }
                return constraint;
            };
            self.constraints.text = function (constraint) {
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

    ecodata.forms.configManager = function(config, context) {
        if (!config) {
            config = {}
        }

        function getConfig(key, dataModelItem) {
            var clientConfig = config[key] || config;
            return _.defaults(clientConfig, dataModelItem.config);
        };

        return {
            getConfig: getConfig
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

        var toIgnore = {ignore: ['transients', '$parent', '$index', '$context', 'dataModel']};
        var parent = context.parent;
        var listName = context.listName;
        var modelName = context.outputModel.name;

        self.listName = listName;
        self.addRow = function (data) {
            var newItem = self.newItem(data, self.rowCount());
            self.push(newItem);
        };
        self.newItem = function (data, index) {
            var itemDataModel = _.indexBy(dataModel[listName].columns, 'name');
            var itemContext = _.extend({}, context, {index: index, parent: context.parent});
            return new ListItemType(data, itemDataModel, itemContext, config);
        };
        self.removeRow = function (item) {
            self.remove(item);
        };
        self.rowCount = function () {
            return self().length;
        };
        self.appendTableRows = ko.observable(userAddedRows);
        self.tableDataUploadVisible = ko.observable(false);
        self.showTableDataUpload = function () {
            self.tableDataUploadVisible(!self.tableDataUploadVisible());
        };

        self.downloadTemplate = function () {
            // Download a blank template if we are appending, otherwise download a template containing the existing data.
            if (self.appendTableRows()) {
                var url = config.excelOutputTemplateUrl + '?listName=' + listName + '&type=' + modelName;
                $.fileDownload(url);
            }
            else {
                self.downloadTemplateWithData(true, userAddedRows);
            }
        };

        self.downloadTableData = function() {
            self.downloadTemplateWithData(false, false);
        };
        self.downloadTemplateWithData = function (editMode, userAddedRows) {
            var data = ko.mapping.toJS(self(), toIgnore);
            var params = {
                listName: listName,
                type: modelName,
                editMode: editMode || false,
                allowExtraRows: userAddedRows || false,
                data: JSON.stringify(data)
            };
            var url = config.excelOutputTemplateUrl;
            $.fileDownload(url, {
                httpMethod: 'POST',
                data: params
            });
        };
        self.tableDataUploadOptions = {
            url: config.excelDataUploadUrl,
            done: function (e, data) {
                if (data.result.error) {
                    self.uploadFailed(data.result.error);
                }
                else {
                    parent['load' + listName](data.result.data, self.appendTableRows());
                }
            },
            fail: function (e, data) {
                self.uploadFailed(data);
            },
            dataType: 'json',
            uploadTemplateId: listName + "template-upload",
            downloadTemplateId: listName + "template-download",
            formData: {type: context.outputModel.name, listName: listName}

        };
        self.uploadFailed = function (message) {
            var text = "<span class='label label-important'>Important</span><h4>There was an error uploading your data.</h4>";
            text += "<p>" + message + "</p>";
            bootbox.alert(text)
        };
        self.allowUserAddedRows = userAddedRows;
        self.findDocumentInContext = function (documentId) {
            return context.outputModel.findDocumentInContext(documentId);
        };

        parent['load' + listName] = function (data, append) {
            if (!append) {
                self([]);
            }
            if (data === undefined) {
                self.loadDefaults();
            }
            else {
                _.each(data, function (row, i) {
                    self.push(self.newItem(row, i));
                });
            }
        };
    };

    ecodata.forms.NestedModel = function (data, dataModel, context, config) {
        var self = this;

        // Expose the context as properties to make it available to formula bindings
        self.$parent = context.parent;
        self.$index = context.index;
        self.$context = _.extend({}, context, {parent:self});
        self.dataModel = dataModel;
        if (!data) {
            data = {};
        }
        self.transients = {};

        if (config.edit && config.editableRows) {
            self.isSelected = ko.obserable(false);
            this.commit = function () {
                self.doAction('commit');
            };
            this.reset = function () {
                self.doAction('reset');
            };
            this.doAction = function (action) {
                var prop, item;
                for (prop in self) {
                    if (self.hasOwnProperty(prop)) {
                        item = self[prop];
                        if (ko.isObservable(item) && item[action]) {
                            item[action]();
                        }
                    }
                }
            };
            this.isNew = false;
            this.toJSON = function () {
                return ko.mapping.toJS(this, {'ignore': ['transients', 'isNew', 'isSelected']});
            };

        }

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
        context.outputModel = self;

        var dataLoader = ecodata.forms.dataLoader(context, config);
        if (!output) {
            output = {};
        }
        self.dataModel = _.indexBy(dataModel, 'name');

        // Make this properties available to the binding context for use by components.
        self.$context = _.extend({output:output, root:self, parent:self}, context);

        self.$config = ecodata.forms.configManager(config, context);

        var activityId = output.activityId || config.activityId;
        self.name = output.name;
        self.outputId = output.outputId || '';

        self.data = {};
        self.transients = {};
        var notCompleted = output.outputNotCompleted;

        if (notCompleted === undefined) {
            notCompleted = config.collapsedByDefault;
        }

        var toIgnore = {ignore: ['transients', '$parent', '$index', '$context', '$config', 'dataModel']};
        self.outputNotCompleted = ko.observable(notCompleted);

        self.outputNotCompleted.subscribe(function (newValue) {

            if (newValue && self.dirtyFlag && self.dirtyFlag.isDirty()) {
                bootbox.confirm("Any data you have entered into this section will be deleted when you save the form.  Continue?", function (result) {
                    if (!result) {
                        self.outputNotCompleted(false);
                    }
                });
            }
        });
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
            delete jsData.data.locationSitesArray;
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
            $.when.apply($, waitingOn).then(function () {
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
        self.findDocumentInContext = function (documentId) {
            return _.find(context.documents || [], function (document) {
                return document.documentId === documentId;
            })
        };

        function checkWarningsInObject(items, obj) {
            var warnings = []
            _.each(items, function (item) {
                var dataModelItem = obj[item.name];
                if (item.dataType == 'list') {
                    _.each(obj[item.name](), function (listItem) {
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

        self.checkWarnings = function () {
            return checkWarningsInObject(dataModel, self.data);
        };

        self.isMapPresent = function () {
            return !!self.mapElementId
        };

        self.initialise = function (outputData) {

            return self.loadOrPrepop(outputData).done(function (data) {
                self.loadData(data);
                self.transients.dummy.notifySubscribers();
            });

        };


    };
}());
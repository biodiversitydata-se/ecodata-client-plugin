/**
 * Custom knockout bindings used by the forms library
 */
(function() {

    var image = function(props) {

        var imageObj = {
            id:props.id,
            name:props.name,
            size:props.size,
            url: props.url,
            thumbnail_url: props.thumbnail_url,
            viewImage : function() {
                window['showImageInViewer'](this.id, this.url, this.name);
            }
        };
        return imageObj;
    };

    ko.bindingHandlers.photoPointUpload = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

            var defaultConfig = {
                maxWidth: 300,
                minWidth:150,
                minHeight:150,
                maxHeight: 300,
                previewSelector: '.preview'
            };
            var size = ko.observable();
            var progress = ko.observable();
            var error = ko.observable();
            var complete = ko.observable(true);

            var uploadProperties = {

                size: size,
                progress: progress,
                error:error,
                complete:complete

            };
            var innerContext = bindingContext.createChildContext(bindingContext);
            ko.utils.extend(innerContext, uploadProperties);

            var config = valueAccessor();
            config = $.extend({}, config, defaultConfig);

            var target = config.target; // Expected to be a ko.observableArray
            $(element).fileupload({
                url:config.url,
                autoUpload:true,
                forceIframeTransport: true
            }).on('fileuploadadd', function(e, data) {
                complete(false);
                progress(1);
            }).on('fileuploadprocessalways', function(e, data) {
                if (data.files[0].preview) {
                    if (config.previewSelector !== undefined) {
                        var previewElem = $(element).parent().find(config.previewSelector);
                        previewElem.append(data.files[0].preview);
                    }
                }
            }).on('fileuploadprogressall', function(e, data) {
                progress(Math.floor(data.loaded / data.total * 100));
                size(data.total);
            }).on('fileuploaddone', function(e, data) {

//            var resultText = $('pre', data.result).text();
//            var result = $.parseJSON(resultText);


                var result = data.result;
                if (!result) {
                    result = {};
                    error('No response from server');
                }

                if (result.files[0]) {
                    target.push(result.files[0]);
                    complete(true);
                }
                else {
                    error(result.error);
                }

            }).on('fileuploadfail', function(e, data) {
                error(data.errorThrown);
            });

            ko.applyBindingsToDescendants(innerContext, element);

            return { controlsDescendantBindings: true };
        }
    };

    ko.bindingHandlers.imageUpload = {
        init: function(element, valueAccessor) {

            var config = {autoUpload:true};
            var observable;
            var params = valueAccessor();
            if (ko.isObservable(params)) {
                observable = params;
            }
            else {
                observable = params.target;
                $.extend(config, params.config);
            }

            var addCallbacks = function() {
                // The upload URL is specified using the data-url attribute to allow it to be easily pulled from the
                // application configuration.
                $(element).fileupload('option', 'completed', function(e, data) {
                    if (data.result && data.result.files) {
                        $.each(data.result.files, function(index, obj) {
                            if (observable.hasOwnProperty('push')) {
                                observable.push(image(obj));
                            }
                            else {
                                observable(image(obj))
                            }
                        });
                    }
                });
                $(element).fileupload('option', 'destroyed', function(e, data) {
                    var filename = $(e.currentTarget).attr('data-filename');

                    if (observable.hasOwnProperty('remove')) {
                        var images = observable();

                        // We rely on the template rendering the filename into the delete button so we can identify which
                        // object has been deleted.
                        $.each(images, function(index, obj) {
                            if (obj.name === filename) {
                                observable.remove(obj);
                                return false;
                            }
                        });
                    }
                    else {
                        observable({})
                    }
                });

            };

            $(element).fileupload(config);

            var value = ko.utils.unwrapObservable(observable);
            var isArray = value.hasOwnProperty('length');

            if ((isArray && value.length > 0) || (!isArray && value['name'] !== undefined)) {
                // Render the existing model items - we are currently storing all of the metadata needed by the
                // jquery-file-upload plugin in the model but we should probably only store the core data and decorate
                // it in the templating code (e.g. the delete URL and HTTP method).
                $(element).fileupload('option', 'completed', function(e, data) {
                    addCallbacks();
                });
                var data = {result:{}};
                if (isArray)  {
                    data.result.files = value
                }
                else {
                    data.result.files = [value];
                }
                var doneFunction = $(element).fileupload('option', 'done');
                var e = {isDefaultPrevented:function(){return false;}};

                doneFunction.call(element, e, data);
            }
            else {
                addCallbacks();
            }

            // Enable iframe cross-domain access via redirect option:
            $(element).fileupload(
                'option',
                'redirect',
                window.location.href.replace(
                    /\/[^\/]*$/,
                    '/cors/result.html?%s'
                )
            );

        }

    };

    ko.bindingHandlers.editDocument = {
        init:function(element, valueAccessor) {
            if (ko.isObservable(valueAccessor())) {
                var document = ko.utils.unwrapObservable(valueAccessor());
                if (typeof document.status == 'function') {
                    document.status.subscribe(function(status) {
                        if (status == 'deleted') {
                            valueAccessor()(null);
                        }
                    });
                }
            }
            var options = {
                name:'documentEditTemplate',
                data:valueAccessor()
            };
            return ko.bindingHandlers['template'].init(element, function() {return options;});
        },
        update:function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var options = {
                name:'documentEditTemplate',
                data:valueAccessor()
            };
            ko.bindingHandlers['template'].update(element, function() {return options;}, allBindings, viewModel, bindingContext);
        }
    };

    ko.bindingHandlers.expression = {

        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

            var expressionString = ko.utils.unwrapObservable(valueAccessor());
            var result = ecodata.forms.expressionEvaluator.evaluate(expressionString, bindingContext);

            $(element).text(result);
        }

    };


    /*
     * Fused Autocomplete supports two versions of autocomplete (original autocomplete implementation by Jorn Zaefferer and jquery_ui)
     * Expects three parameters source, name and guid.
     * Ajax response lists needs name attribute.
     * Doco url: http://bassistance.de/jquery-plugins/jquery-plugin-autocomplete/
     * Note: Autocomplete implementation by Jorn Zaefferer is now been deprecated and its been migrated to jquery_ui.
     *
     */

    ko.bindingHandlers.fusedAutocomplete = {

        init: function (element, params) {
            var params = params();
            var options = {};
            var url = ko.utils.unwrapObservable(params.source);
            options.source = function(request, response) {
                $(element).addClass("ac_loading");
                $.ajax({
                    url: url,
                    dataType:'json',
                    data: {q:request.term},
                    success: function(data) {
                        var items = $.map(data.autoCompleteList, function(item) {
                            return {
                                label:item.name,
                                value: item.name,
                                source: item
                            }
                        });
                        response(items);

                    },
                    error: function() {
                        items = [{label:"Error during species lookup", value:request.term, source: {listId:'error-unmatched', name: request.term}}];
                        response(items);
                    },
                    complete: function() {
                        $(element).removeClass("ac_loading");
                    }
                });
            };
            options.select = function(event, ui) {
                var selectedItem = ui.item;
                params.name(selectedItem.source.name);
                params.guid(selectedItem.source.guid);
            };

            if(!$(element).autocomplete(options).data("ui-autocomplete")){
                // Fall back mechanism to handle deprecated version of autocomplete.
                var options = {};
                options.source = url;
                options.matchSubset = false;
                options.formatItem = function(row, i, n) {
                    return row.name;
                };
                options.highlight = false;
                options.parse = function(data) {
                    var rows = new Array();
                    data = data.autoCompleteList;
                    for(var i=0; i < data.length; i++) {
                        rows[i] = {
                            data: data[i],
                            value: data[i],
                            result: data[i].name
                        };
                    }
                    return rows;
                };

                $(element).autocomplete(options.source, options).result(function(event, data, formatted) {
                    if (data) {
                        params.name(data.name);
                        params.guid(data.guid);
                    }
                });
            }
        }
    };

    ko.bindingHandlers.speciesAutocomplete = {
        init: function (element, params, allBindings, viewModel, bindingContext) {
            var param = params();
            var url = ko.utils.unwrapObservable(param.url);
            var list = ko.utils.unwrapObservable(param.listId);
            var valueCallback = ko.utils.unwrapObservable(param.valueChangeCallback)
            var options = {};

            var lastHeader;

            function rowTitle(listId) {
                if (listId == 'unmatched' || listId == 'error-unmatched') {
                    return '';
                }
                if (!listId) {
                    return 'Atlas of Living Australia';
                }
                return 'Species List';
            }
            var renderItem = function(row) {

                var result = '';
                var title = rowTitle(row.listId);
                if (title && lastHeader !== title) {
                    result+='<div style="background:grey;color:white; padding-left:5px;"> '+title+'</div>';
                }
                // We are keeping track of list headers so we only render each one once.
                lastHeader = title;
                result+='<a class="speciesAutocompleteRow">';
                if (row.listId && row.listId === 'unmatched') {
                    result += '<i>Unlisted or unknown species</i>';
                }
                else if (row.listId && row.listId === 'error-unmatched') {
                    result += '<i>Offline</i><div>Species:<b>'+row.name+'</b></div>';
                }
                else {

                    var commonNameMatches = row.commonNameMatches !== undefined ? row.commonNameMatches : "";

                    result += (row.scientificNameMatches && row.scientificNameMatches.length>0) ? row.scientificNameMatches[0] : commonNameMatches ;
                    if (row.name != result && row.rankString) {
                        result = result + "<div class='autoLine2'>" + row.rankString + ": " + row.name + "</div>";
                    } else if (row.rankString) {
                        result = result + "<div class='autoLine2'>" + row.rankString + "</div>";
                    }
                }
                result += '</a>';
                return result;
            };

            options.source = function(request, response) {
                $(element).addClass("ac_loading");

                if (valueCallback !== undefined) {
                    valueCallback(request.term);
                }
                var data = {q:request.term};
                if (list) {
                    $.extend(data, {listId: list});
                }
                $.ajax({
                    url: url,
                    dataType:'json',
                    data: data,
                    success: function(data) {
                        var items = $.map(data.autoCompleteList, function(item) {
                            return {
                                label:item.name,
                                value: item.name,
                                source: item
                            }
                        });
                        items = [{label:"Missing or unidentified species", value:request.term, source: {listId:'unmatched', name: request.term}}].concat(items);
                        response(items);

                    },
                    error: function() {
                        items = [{label:"Error during species lookup", value:request.term, source: {listId:'error-unmatched', name: request.term}}];
                        response(items);
                    },
                    complete: function() {
                        $(element).removeClass("ac_loading");
                    }
                });
            };
            options.select = function(event, ui) {
                ko.utils.unwrapObservable(param.result)(event, ui.item.source);
            };

            if ($(element).autocomplete(options).data("ui-autocomplete")) {

                $(element).autocomplete(options).data("ui-autocomplete")._renderItem = function(ul, item) {
                    var result = $('<li></li>').html(renderItem(item.source));
                    return result.appendTo(ul);

                };
            }
            else {
                $(element).autocomplete(options);
            }
        }
    };


// Dummy binding as a placeholder for the preprocessor which does all the work.
    ko.bindingHandlers.constraint = {
        init:function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        },
        update:function() {
        }
    };

    ko.bindingHandlers.constraint.preprocess = function(value, name, addBindingCallback) {

        var params = value.substring(1, value.length-1).split(':');

        if (!params.length == 2) {
            throw "The constraint binding requires a binding:expression value"
        }

        addBindingCallback(params[0], "ecodata.forms.expressionEvaluator.evaluateBoolean('"+params[1]+"', $data)");

        return undefined;
    };


    function applySelect2ValidationCompatibility(element) {
        var $element = $(element);
        var select2 = $element.next('.select2-container');
        $element.on('select2:close', function(e) {
            $element.validationEngine('validate');
        }).attr("data-prompt-position", "topRight:"+select2.width());
    }

    ko.bindingHandlers.speciesSelect2 = {
        select2AwareFormatter: function(data, container, delegate) {
            if (data.text) {
                return data.text;
            }
            return delegate(data);
        },
        init: function (element, valueAccessor) {

            var self = ko.bindingHandlers.speciesSelect2;
            var model = valueAccessor();

            $.fn.select2.amd.require(['select2/species'], function(SpeciesAdapter) {
                $(element).select2({
                    dataAdapter: SpeciesAdapter,
                    placeholder:{id:-1, text:'Please select...'},
                    templateResult: function(data, container) { return self.select2AwareFormatter(data, container, model.formatSearchResult); },
                    templateSelection: function(data, container) { return self.select2AwareFormatter(data, container, model.formatSelectedSpecies); },
                    dropdownAutoWidth: true,
                    model:model,
                    escapeMarkup: function(markup) {
                        return markup; // We want to apply our own formatting so manually escape the user input.
                    },
                    ajax:{} // We want infinite scroll and this is how to get it.
                });
                applySelect2ValidationCompatibility(element);
            })
        },
        update: function (element, valueAccessor) {}
    };

    ko.bindingHandlers.select2 = {
        init: function(element, valueAccessor) {
            var defaults = {
                placeholder:'Please select...',
                dropdownAutoWidth:true,
                allowClear:true
            };
            var options = _.defaults(valueAccessor() || {}, defaults);
            $(element).select2(options);
            applySelect2ValidationCompatibility(element);
        }
    };

    ko.bindingHandlers.multiSelect2 = {
        init: function(element, valueAccessor) {
            var defaults = {
                placeholder:'Select all that apply...',
                dropdownAutoWidth:true,
                allowClear:false,
                tags:true
            };
            var options = valueAccessor();
            var model = options.value;
            if (!ko.isObservable(model, ko.observableArray)) {
                throw "The options require a key of model with a value of type ko.observableArray";
            }
            delete options.value;
            var options = _.defaults(valueAccessor() || {}, defaults);

            $(element).select2(options).change(function() {
                model($(element).val());
            });

            applySelect2ValidationCompatibility(element);
        },
        update: function(element, valueAccessor) {
            var $element = $(element);
            var data = valueAccessor().value();
            var currentOptions = $element.find("option").map(function() {return $(this).val();}).get();
            var extraOptions = _.difference(data, currentOptions);
            for (var i=0; i<extraOptions.length; i++) {
                $element.append($("<option>").val(data[i]).text(data[i]));
            }
            $(element).val(valueAccessor().value()).trigger('change');
        }
    };


    ko.components.register('multi-input', {
        viewModel: function(params) {
            var self = this;

            self.observableValues = ko.observableArray();

            // This method updates the values parameter with the contents of the managed array.
            function syncValues() {
                var rawValues = [];
                for (var i=0; i<self.observableValues().length; i++) {
                    rawValues.push(self.observableValues()[i].val());
                }
                params.values(rawValues);
            }

            function newValue(value) {
                var observable = ko.observable(value || '');
                observable.subscribe(syncValues);
                self.observableValues.push({val:observable});
            }

            self.addValue = function() {
                newValue();
            };

            self.removeValue = function(value) {
                self.observableValues.remove(value);
            };

            for (var i=0; i<params.values().length; i++) {
                newValue(params.values()[i]);
            }

            self.observableValues.subscribe(syncValues);
        },
        template:
            '<div data-bind="foreach: observableValues">\
                <div class="input-append">\
                  <span data-bind="template:{nodes:$componentTemplateNodes}"></span><span class="add-on" data-bind="click:$parent.removeValue"><i class="fa fa-remove"></i></span>\
                </div>\
            </div>\
            <i class="fa fa-plus" data-bind="click:addValue"></i>\
            '
    });

})();
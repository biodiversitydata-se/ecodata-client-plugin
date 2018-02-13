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
                dataType:'json',
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
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var defaultConfig = {
                maxWidth: 300,
                minWidth:150,
                minHeight:150,
                maxHeight: 300,
                previewSelector: '.preview',
                viewModel: viewModel
            };
            var size = ko.observable();
            var progress = ko.observable();
            var error = ko.observable();
            var complete = ko.observable(true);

            var config = valueAccessor();
            config = $.extend({}, config, defaultConfig);

            var target = config.target,
                dropZone = $(element).find('.dropzone');

            var context = config.context;
            var uploadProperties = {
                size: size,
                progress: progress,
                error:error,
                complete:complete
            };

            var innerContext = bindingContext.createChildContext(bindingContext);
            ko.utils.extend(innerContext, uploadProperties);
            var previewElem = $(element).parent().find(config.previewSelector);

            // For a reason I can't determine, when forms are loaded via ajax the
            // fileupload widget gets a blank widgetEventPrefix. (normally it would be 'fileupload').
            // This checks for this condition and registers the correct event listeners.
            var eventPrefix = 'fileupload';
            if ($.blueimp && $.blueimp.fileupload) {
                eventPrefix =  $.blueimp.fileupload.prototype.widgetEventPrefix;
            }

            $(element).fileupload({
                url:config.url,
                autoUpload:true,
                forceIframeTransport: false,
                dropZone: dropZone,
                dataType:'json'
            }).on(eventPrefix+'add', function(e, data) {
                previewElem.html('');
                complete(false);
                progress(1);
            }).on(eventPrefix+'processalways', function(e, data) {
                if (data.files[0].preview) {
                    if (config.previewSelector !== undefined) {
                        previewElem.append(data.files[0].preview);
                    }
                }
            }).on(eventPrefix+'progressall', function(e, data) {
                progress(Math.floor(data.loaded / data.total * 100));
                size(data.total);
            }).on(eventPrefix+'done', function(e, data) {
                var result = data.result;
                var $doc = $(document);
                if (!result) {
                    result = {};
                    error('No response from server');
                }

                if (result.files[0]) {
                    result.files.forEach(function( f ){
                        // flag to indicate the image is in biocollect and needs to be save to ecodata as a document
                        var data = {
                            thumbnailUrl: f.thumbnail_url,
                            url: f.url,
                            contentType: f.contentType,
                            filename: f.name,
                            name: f.name,
                            filesize: f.size,
                            dateTaken: f.isoDate,
                            staged: true,
                            attribution: f.attribution,
                            licence: f.licence
                        };

                        target.push(new ImageViewModel(data, true, context));

                        if(f.decimalLongitude && f.decimalLatitude){
                            $doc.trigger('imagelocation', {
                                decimalLongitude: f.decimalLongitude,
                                decimalLatitude: f.decimalLatitude
                            });
                        }

                        if(f.isoDate){
                            $doc.trigger('imagedatetime', {
                                date: f.isoDate
                            });
                        }

                    });

                    complete(true);
                }
                else {
                    error(result.error);
                }

            }).on(eventPrefix+'fail', function(e, data) {
                error(data.errorThrown);
            });

            ko.applyBindingsToDescendants(innerContext, element);

            return { controlsDescendantBindings: true };
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

    /**
     * Supports custom rendering of results in a Select2 dropdown.
     */
    function constraintIconRenderer(config) {
        return function(item) {

            var constraint = item.id;
            if (config[constraint]) {
                var icon = config[constraint];

                var iconElement;
                if (icon.url) {
                    iconElement = $("<img/>").addClass('constraint-image').css("src", icon.url);
                }
                else {
                    iconElement = $("<span/>").addClass('constraint-icon');
                    if (icon.class) {
                        if (_.isArray(icon.class)) {
                            _.each(icon.class, function(val) {
                                iconElement.addClass(val);
                            });
                        }
                        else {
                            _.each(icon.class.split(" "), function (val) {
                                iconElement.addClass(icon.class);
                            });
                        }
                    }
                    if (icon.style) {
                        _.each(icon.style, function(value, key) {
                           iconElement.css(key, value);
                        });
                    }
                }
                return $("<span/>").append(iconElement).append($("<span/>").addClass('constraint-text').text(constraint));
            }

            return item.text;
        };
    };

    ko.bindingHandlers.select2 = {
        init: function(element, valueAccessor) {
            var defaults = {
                placeholder:'Please select...',
                dropdownAutoWidth:true,
                allowClear:true
            };
            var options = _.defaults(valueAccessor() || {}, defaults);
            if (options.constraintIcons) {
                var renderer = constraintIconRenderer(options.constraintIcons);
                options.templateResult = renderer;
                options.templateSelection = renderer;

            }
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
                $element.append($("<option>").val(extraOptions[i]).text(extraOptions[i]));
            }
            $(element).val(valueAccessor().value()).trigger('change');
        }
    };

    var popoverWarningOptions = {
        placement:'top',
        trigger:'manual',
        template: '<div class="popover warning"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    };


    /**
     * This binding requires that the observable has used the metadata extender.  It is meant to work with the
     * form rendering code so isn't very useful as a stand alone binding.
     *
     * @type {{init: ko.bindingHandlers.warning.init, update: ko.bindingHandlers.warning.update}}
     */
    ko.bindingHandlers.warning = {
        init: function(element, valueAccessor) {
            var target = valueAccessor();
            if (typeof target.checkWarnings !== 'function') {
                throw "This binding requires the target observable to have used the \"metadata\" extender"
            }

            var $element = $(element);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                if (target.popoverInitialised) {
                    $element.popover("destroy");
                }
            });

            // We are implementing the validation routine by adding a subscriber to avoid triggering the validation
            // on initialisation.
            target.subscribe(function() {
                var invalid = $element.validationEngine('validate');

                // Only check warnings if the validation passes to avoid showing two sets of popups.
                if (!invalid) {
                    var result = target.checkWarnings();

                    if (result) {
                        if (!target.popoverInitialised) {
                            $element.popover(_.extend({content:result.val[0]}, popoverWarningOptions));
                            $element.data('popover').tip().click(function() {
                                $element.popover('hide');
                            });
                            target.popoverInitialised = true;
                        }
                        $element.popover('show');
                    }
                    else {
                        if (target.popoverInitialised) {
                            $element.popover('hide');
                        }
                    }
                }
                else {
                    if (target.popoverInitialised) {
                        $element.popover('hide');
                    }
                }
            });

        },
        update: function() {}
    };

    ko.bindingHandlers.conditionalValidation = {
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var target = valueAccessor();
            if (typeof target.evaluateBehaviour !== 'function') {
                throw "This binding requires the target observable to have used the \"metadata\" extender"
            }

            ko.computed(function() {
                var result = target.evaluateBehaviour("conditional_validation", target.get('validate') || '');

                var $element = $(element);
                if (result.validate) {

                    $element.attr('data-validation-engine', 'validate['+result.validate+']');
                    if (result.message) {
                        $element.attr('data-errormessage', result.message)
                    }
                }
                else {
                    if (result.message) {
                        $element.attr('data-errormessage', result.message)
                    }
                    else {
                        $element.removeAttr('data-errormessage');
                    }
                    $element.attr('data-validation-engine', 'validate['+result+']');
                }

                // Trigger the validation after the knockout processing is complete - this prevents the validation
                // from firing before the page has been initialised on load.
                setTimeout(function() {
                    $(element).validationEngine('validate');
                }, 100);

            });
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

            if (params.values()) {
                for (var i=0; i<params.values().length; i++) {
                    newValue(params.values()[i]);
                }
            }

            self.observableValues.subscribe(syncValues);
        },
        template: {element:'template-multi-input'}

    });

    ko.components.register('condition-trajectory', {
        viewModel: function (params) {
            console.log(params);
            var self = this;
            var offsets = ["Very poor", "Poor", "Good", "Very good"];
            var trajectories = ["Improving", "Deteriorating", "Stable", "Unclear"];

            var width = 75;
            var boxWidth = 30;
            self.boxPosition = ko.computed(function() {
                var condition = ko.utils.unwrapObservable(params.condition);
                var index = offsets.indexOf(condition);
                return index * width + width/2 - boxWidth/2;
            });
            self.title = ko.computed(function() {
                var condition = ko.utils.unwrapObservable(ko.trajectory);
                return "Condition: "+condition+", Trajectory: "+params.trajectory;
            });

            self.trajectoryTemplate = ko.computed(function() {
                var trajectory = ko.utils.unwrapObservable(params.trajectory);
                if (trajectory) {
                    return 'template-trajectory-'+trajectory.toLowerCase();
                }
                return 'template-trajectory-none';
            });

        },
        template:{element:'template-condition-trajectory'}

    });

    /**
     * Extends the target as a ecodata.forms.DataModelItem.  This is required to support many of the
     * dynamic behaviour features, including warnings and condititional validation rules.
     * @param target the observable to extend.
     * @param context the dataModel metadata as defined for the field in dataModel.json
     */
    ko.extenders.metadata = function(target, options) {
        ecodata.forms.DataModelItem.apply(target, [options.metadata, options.parent]);
    };

})();
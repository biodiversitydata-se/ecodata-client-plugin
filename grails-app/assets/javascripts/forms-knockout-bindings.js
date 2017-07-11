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

})();
<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <title>Preview ${model.modelName}</title>
    <asset:stylesheet src="preview.css"/>
    <md:modelStyles model="${model}" edit="true"/>
</head>
<body>
<div class="container-fluid validationEngineContainer">
    <h3>Preview of ${model.modelName}</h3>
    <div class="row-fluid">
        <div class="span12">
            <md:modelView model="${model}" edit="true" printable="${false}"/>

        </div>

    </div>
    <div>
        <div class="row-fluid">
            <div class="span12">
                <h3>Model JSON</h3>
                <pre id="model-display"></pre>
            </div>

        </div>
    </div>

</div>
<g:render template="/output/mapInDialogEditTemplate"/>
</body>
<asset:javascript src="preview.js"/>

<g:render template="/output/outputJSModel"
          model="${[edit: true,
                    model: model,
                    outputName: model.modelName]}">

</g:render>

<asset:deferredScripts/>
<script>
    $(function() {
        var modelName = '${md.toSingleWord(name:model.modelName)}';

        var outputModel = JSON.parse('${model.encodeAsJavaScript()}');

        var dataModel = outputModel.dataModel;
        var config = {
            bieUrl:'',
            searchBieUrl:'',
            model: outputModel,
            prepopUrlPrefix: '${createLink(controller:'preview')}'
        };
        var output = {};
        var context = {
            activityData: {
                value1: 1,
                value2: "2"
            }
        };

        // This is required by any models that use the feature dataType
        context.featureCollection = config.featureCollection = new ecodata.forms.FeatureCollection([]);

        var model = ecodata.forms.initialiseOutputViewModel(modelName, dataModel, output, config, context);

        // Expose our model in the global scope to get at it easily with GEB
        window.model = model;
        window.modelReady = true;

        $('.validationEngineContainer').validationEngine();

        $('#model-display').html(syntaxHighlight(JSON.stringify(outputModel, undefined, 2)));
        // @see https://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
        function syntaxHighlight(json) {
            if (typeof json != 'string') {
                json = JSON.stringify(json, undefined, 2);
            }
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        }
    });

</script>
</html>
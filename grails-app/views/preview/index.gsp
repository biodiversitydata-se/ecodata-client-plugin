<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <title>Preview ${model.modelName}</title>
    <asset:stylesheet src="preview.css"/>
    <md:modelStyles model="${model}" edit="true"/>
</head>
<body>
<div class="container-fluid">
    <h3>Preview of ${model.modelName}</h3>
    <md:modelView model="${model}" edit="true" printable="${false}"/>

</div>

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
        var modelName = '${md.toSingleWord(name:model.modelName)}ViewModel';
        var dataModel = JSON.parse('${raw((model as grails.converters.JSON).toString())}').dataModel;
        var context = {};
        var config = {
            bieUrl:'',
            searchBieUrl:''
        };
        var output = {};

        // This is required by any models that use the feature dataType
        config.featureCollection = new ecodata.forms.FeatureCollection([]);;

        var model = new ecodata.forms[modelName](output, dataModel, context, config);

        ko.applyBindings(model);

        // Expose our model in the global scope to get at it easily with GEB
        window.model = model;
        window.modelReady = true
    });

</script>
</html>
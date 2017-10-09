package au.org.ala.ecodata.forms

import grails.converters.JSON

public class EditModelWidgetRenderer implements ModelWidgetRenderer {

    @Override
    void renderLiteral(WidgetRenderContext context) {
        context.writer << "<span ${context.attributes.toString()}>${context.model.source}</span>"
    }

    @Override
    void renderText(WidgetRenderContext context) {
        context.attributes.addClass context.getInputWidth()
        context.databindAttrs.add 'value', context.source
        context.writer << "<input ${context.attributes.toString()} data-bind='${context.databindAttrs.toString()}' ${context.validationAttr} type='text' class='input-small'/>"
    }

    @Override
    void renderNumber(WidgetRenderContext context) {
        context.attributes.addClass context.getInputWidth()
        context.attributes.add 'style','text-align:center'
        context.databindAttrs.add 'value', context.source
        context.writer << "<input${context.attributes.toString()} data-bind='${context.databindAttrs.toString()}'${context.validationAttr} type='number' class='input-mini'/>"
    }

    @Override
    void renderBoolean(WidgetRenderContext context) {
        context.databindAttrs.add 'checked', context.source
        context.writer << "<input${context.attributes.toString()} name='${context.source}' data-bind='${context.databindAttrs.toString()}'${context.validationAttr} type='checkbox' class='checkbox'/>"
    }

    @Override
    void renderTextArea(WidgetRenderContext context) {
        context.databindAttrs.add 'value', context.source
        if (context.model.rows) {
            context.attributes.add("rows", context.model.rows)
        }
        if (context.model.cols) {
            context.attributes.add("cols", context.model.cols)
        }
        context.writer << "<textarea ${context.attributes.toString()} data-bind='${context.databindAttrs.toString()}'${context.validationAttr}></textarea>"
    }

    @Override
    void renderSimpleDate(WidgetRenderContext context) {
        context.databindAttrs.add 'datepicker', context.source + '.date'
        context.writer << "<input${context.attributes.toString()} data-bind='${context.databindAttrs.toString()}'${context.validationAttr} type='text' class='input-small'/>"
    }

    @Override
    void renderSelectOne(WidgetRenderContext context) {
        context.databindAttrs.add 'value', context.source
        // Select one or many view types require that the data model has defined a set of valid options
        // to select from.
        context.databindAttrs.add 'options', context.source + '.constraints'
        context.databindAttrs.add 'optionsCaption', '"Please select"'
        context.writer <<  "<select${context.attributes.toString()} class=\"select\" data-bind='${context.databindAttrs.toString()}'${context.validationAttr}></select>"
    }

    @Override
    void renderSelect2(WidgetRenderContext context) {
        context.databindAttrs.add 'value', context.source
        // Select one or many view types require that the data model has defined a set of valid options
        // to select from.
        context.databindAttrs.add 'options', context.source + '.constraints'
        context.databindAttrs.add 'optionsCaption', '""'
        context.databindAttrs.add 'select2', '{allowClear:true}'
        context.writer <<  "<select${context.attributes.toString()} class=\"select\" data-bind='${context.databindAttrs.toString()}'${context.validationAttr}></select>"
    }

    @Override
    void renderSelectMany(WidgetRenderContext context) {

        if (context.model.readonly) {
            renderSelectManyAsString(context)
        }
        else {
            renderSelectManyAsCheckboxes(context)
        }
    }

    @Override
    void renderSelect2Many(WidgetRenderContext context) {
        context.databindAttrs.add 'options', context.source + '.constraints'
        context.databindAttrs.add 'optionsCaption', '"Please select"'
        context.databindAttrs.add 'multiSelect2', "{value: ${context.source}, tags:true, allowClear:false}"
        context.writer <<  "<select${context.attributes.toString()} multiple=\"multiple\" class=\"select\" data-bind='${context.databindAttrs.toString()}'${context.validationAttr}></select>"
    }

    @Override
    void renderMultiInput(WidgetRenderContext context) {

        context.writer << """<multi-input params="values: ${context.model.source}, template:'${context.model.source}InputTemplate'">
                              <input type="text" ${context.attributes.toString()} ${context.validationAttr} data-bind="value:val" class="input-small">
                           </multi-input>"""
    }

    private void renderSelectManyAsCheckboxes(WidgetRenderContext context) {
        context.labelAttributes.addClass 'checkbox-list-label '
        def constraints = context.source + '.constraints'

        def nameBinding = "'${context.model.source}'+'-'+(\$parentContext.\$index?\$parentContext.\$index():'')"

        context.databindAttrs.add 'value', '\$data'
        context.databindAttrs.add 'checked', "${context.source}"
        context.databindAttrs.add 'attr', "{'name': ${nameBinding}}"

        context.writer << """
                <ul class="checkbox-list" data-bind="foreach: ${constraints}">
                    <li>
                        <label>
                            <!-- ko with:_.extend({}, \$parent, {\$data:\$data, \$parentContext:\$parentContext}) -->
                            <input type="checkbox" name="${context.source}" data-bind="${context.databindAttrs.toString()}" ${context.validationAttr}/><span data-bind="text:\$data"/></span>
                            <!-- /ko -->
                        </label>
                    </li>
                </ul>
            """
    }

    private void renderSelectManyAsString(WidgetRenderContext context) {
        context.attributes.addClass context.getInputWidth()
        context.databindAttrs.add 'value', '('+context.source+'() || []).join(", ")'
        context.writer << "<input ${context.attributes.toString()} data-bind='${context.databindAttrs.toString()}' ${context.validationAttr} type='text' class='input-small'/>"
    }

    @Override
    void renderImage(WidgetRenderContext context) {
        context.databindAttrs.add 'imageUpload', "{target:${context.source}, context:\$context}"
        context.writer << context.g.render(template: '/output/imageDataTypeEditModelTemplate', model: [databindAttrs:context.databindAttrs.toString(), name: context.source, validationAttrs:context.validationAttr ], plugin:'ecodata-client-plugin')
    }

    @Override
    void renderImageDialog(WidgetRenderContext context) {
        context.databindAttrs.add 'imageUpload', "{target:${context.source}, config:{}}"
        context.writer << context.g.render(template: '/output/imageDialogDataTypeEditModelTemplate', model: [databindAttrs:context.databindAttrs.toString(), name: context.source])
    }

    @Override
    void renderEmbeddedImage(WidgetRenderContext context) {
        context.addDeferredTemplate('/output/fileUploadTemplate')
        context.databindAttrs.add 'imageUpload', "{target:${context.source}, config:{}}"
        context.writer << context.g.render(template: '/output/imageDataTypeTemplate', plugin:'ecodata-client-plugin', model: [databindAttrs: context.databindAttrs.toString(), source: context.source])
    }

    @Override
    void renderEmbeddedImages(WidgetRenderContext context) {
        // The file upload template has support for muliple images.
        renderEmbeddedImage(context)
    }

    @Override
    void renderAutocomplete(WidgetRenderContext context) {
        def newAttrs = new Databindings()

        newAttrs.add "value", "transients.textFieldValue"
        newAttrs.add "event", "{focusout:focusLost}"
        newAttrs.add "speciesAutocomplete", "{url:transients.speciesSearchUrl, result:speciesSelected, valueChangeCallback:textFieldChanged}"

        context.writer << context.g.render(template: '/output/speciesTemplate', plugin:'ecodata-client-plugin', model:[source: context.source, databindAttrs: newAttrs.toString(), validationAttrs:context.validationAttr])
    }

    @Override
    void renderPhotoPoint(WidgetRenderContext context) {
        context.writer << """
        <div><b><span data-bind="text:name"/></b></div>
        <div>Lat:<span data-bind="text:lat"/></div>
        <div>Lon:<span data-bind="text:lon"/></div>
        <div>Bearing:<span data-bind="text:bearing"/></div>
        """
    }

    @Override
    void renderLink(WidgetRenderContext context) {
        context.writer << "<a href=\"" + context.g.createLink(context.specialProperties(context.model.properties)) + "\">${context.model.source}</a>"
    }

    @Override
    void renderDate(WidgetRenderContext context) {
        context.databindAttrs.add 'datepicker', context.source + '.date'
        if (context.model.displayOptions) {
            context.databindAttrs.add "datepickerOptions", (context.model.displayOptions as JSON).toString().replaceAll("\"", "'")
        }
        context.writer << "<div class=\"input-append\"><input ${context.attributes.toString()} class=\"input-small\" data-bind=\"${context.databindAttrs}\" type=\"text\" size=\"12\"${context.validationAttr}/>"
        context.writer << "<span class=\"add-on open-datepicker\"><i class=\"icon-th\"></i></span></div>"
    }


    @Override
    void renderDocument(WidgetRenderContext context) {
        context.writer << """<div data-bind="if:(${context.source}())">"""
        context.writer << """    <div data-bind="editDocument:${context.source}"></div>"""
        context.writer << """</div>"""
        context.writer << """<div data-bind="ifnot:${context.source}()">"""
        context.writer << """    <button class="btn" id="doAttach" data-bind="click:function(target) {\$root.attachDocument(${context.source})}">Attach Document</button>"""
        context.writer << """</div>"""


    }

    @Override
    void renderSpeciesSelect(WidgetRenderContext context) {
        context.writer << """<span data-bind="with:${context.source}" class="input-append species-select2" style="width:100%; min-width: 200px;">
                                <select data-bind="speciesSelect2:\$data" ${context.validationAttr} style="width:90%"></select>
                                <span class="add-on">
                                    <a data-bind="visible:name(), popover: {title: transients.speciesTitle, content: transients.speciesInformation}"><i class="icon-info-sign"></i></a>
                                </span>
                             </span>"""
    }

    @Override
    void renderCurrency(WidgetRenderContext context) {
        context.databindAttrs.add('value', context.source)
        context.writer << """<span class="input-prepend input-append currency-input">
            <span class="add-on">\$</span>
            <input type="number" data-bind='${context.databindAttrs.toString()}'${context.validationAttr}'>
            <span class="add-on">.00</span>
           </span>"""
    }
}

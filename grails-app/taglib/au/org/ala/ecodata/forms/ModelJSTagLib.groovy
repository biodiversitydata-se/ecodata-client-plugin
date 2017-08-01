package au.org.ala.ecodata.forms


class ModelJSTagLib {

    class JSModelRenderContext {

        /** Used to render the results */
        def out
        /**
         * The path to the field that will hold the value for the data model item
         * relative to the current view model code being rendered.  E.g top level properties are
         * held in a data object, so the path is "self.data".  Properties
         * in an object being rendered in a list are at the top level
         * so the path is "self"
         */
        String propertyPath
        /** The current data model item being rendered */
        Map dataModel

        /**
         * How the level view model object can be referenced.
         * For top level fields, the path is "self", for nested
         * fields, the path is "parent"
         */
        String viewModelPath

        String fieldName() {
            return dataModel.name
        }

        /** The view model definition that relates to the current data model item */
        Map viewModel() {
            findViewByName(attrs.viewModel, dataModel.name)
        }
        /** The attributes passed to the tag library */
        Map attrs
    }

    static namespace = "md"

    private final static INDENT = "    "

    private final static String QUOTE = "\"";
    private final static String SPACE = " ";
    private final static String EQUALS = "=";

    private ComputedValueRenderer computedValueRenderer = new ComputedValueRenderer()

    /*------------ JAVASCRIPT for dynamic content -------------*/

    def jsModelObjects = { attrs ->

        JSModelRenderContext ctx = new JSModelRenderContext(
                out:out, attrs:attrs, propertyPath:'self.data', viewModelPath:'self'
        )
        attrs.model?.dataModel?.each { model ->
            ctx.dataModel = model
            if (model.dataType in ['list', 'photoPoints']) {
                repeatingModel(ctx)
                totalsModel attrs, model, out
            }
            else if (model.dataType == 'matrix') {
                matrixModel attrs, model, out
            }
        }
    }

    def jsViewModel = { attrs ->
        JSModelRenderContext ctx = new JSModelRenderContext(out:out, attrs:attrs, propertyPath:'self.data', viewModelPath: 'self')
        attrs.model?.dataModel?.each { modelItem ->

            // Lists and matrix data types are only supported at the top level as
            // rendering nested tables / matricies is not supported by the html rendering code.
            if (modelItem.dataType  == 'list') {
                listViewModel(attrs, modelItem, out)
                columnTotalsModel out, attrs, modelItem
            }
            else if (modelItem.dataType == 'matrix') {
                matrixViewModel(attrs, modelItem, out)
            }
            else {
                ctx.dataModel = modelItem
                renderDataModelItem(ctx)
            }
        }
    }

    /**
     * Renders JavaScript code to define the data model item in a form.
     */
    void renderDataModelItem(JSModelRenderContext ctx) {
        Map mod = ctx.dataModel
        if (mod.computed) {
            computedValueRenderer.computedViewModel(ctx.out, ctx.attrs, mod, ctx.propertyPath, ctx.propertyPath)
        }
        else if (mod.dataType == 'text') {
            textViewModel(ctx)
        }
        else if (mod.dataType == 'number') {
            numberViewModel(ctx)
        }
        else if (mod.dataType == 'stringList') {
            stringListViewModel(ctx)
        }
        else if (mod.dataType == 'image') {
            imageModel(ctx)
        }
        else if (mod.dataType == 'audio') {
            audioModel(ctx)
        }
        else if (mod.dataType == 'species') {
            speciesModel(ctx)
        }
        else if (mod.dataType == 'date') {
            dateViewModel(ctx)
        }
        else if (mod.dataType == 'time') {
            timeViewModel(ctx)
        }
        else if (mod.dataType == 'document') {
            documentViewModel(ctx)
        }
        else if (mod.dataType == 'boolean') {
            booleanViewModel(ctx)
        }
        else if (mod.dataType == 'set') {
            setViewModel(ctx)
        }
    }

    /**
     * This js is inserted into the 'loadData()' function of the view model.
     *
     * It loads the existing values (or default values) into the model.
     */
    def jsLoadModel = { attrs ->
        JSModelRenderContext ctx = new JSModelRenderContext(out:out, attrs:attrs, propertyPath:'self.data', viewModelPath:'self')

        attrs.model?.dataModel?.each { mod ->
            if (mod.dataType == 'list') {
                out << INDENT*1 << "self.load${mod.name}(data.${mod.name});\n"
                loadColumnTotals out, attrs, mod
            }
            else if (mod.dataType == 'matrix') {
                out << INDENT*1 << "self.load${mod.name.capitalize()}(data.${mod.name});\n"
            }
            else {
                ctx.dataModel = mod
                renderInitialiser(ctx)
            }
        }
    }

    String getDefaultValueAsString(JSModelRenderContext ctx) {
        Map model = ctx.dataModel
        if (model.defaultValue != null) {
            return model.defaultValue;
        }

        switch (model.dataType) {
            case 'number':
                return '0'
            case 'stringList':
            case 'image':
                return '[]'
            case 'species':
                return '{}'
            case 'stringList':
                return '[]'

            default:
                return 'undefined'
        }
    }

    void renderInitialiser(JSModelRenderContext ctx) {
        Map mod = ctx.dataModel

        if (mod.computed) {
            return
        }
        String value = "ecodata.forms.orDefault(data['${mod.name}'], ${getDefaultValueAsString(ctx)})"
        if (mod.dataType in ['text', 'stringList']) {
            out << INDENT*4 << "${ctx.propertyPath}['${mod.name}'](${value});\n"
        }
        else if (mod.dataType == 'number') {
            out << INDENT*4 << "${ctx.propertyPath}['${mod.name}'](${value});\n"
        }
        else if (mod.dataType in ['image', 'photoPoints']) {
            out << INDENT*4 << "self.load${mod.name}(${value});\n"
        }
        else if (mod.dataType == 'species') {
            out << INDENT*4 << "${ctx.propertyPath}['${mod.name}'].loadData(${value});\n"
        }
        else if (mod.dataType == 'document') {
            out << INDENT*4 << "var doc = ${ctx.viewModelPath}.findDocumentInContext(data['${mod.name}']);\n"
            out << INDENT*5 << "if (doc) {\n"
            out << INDENT*6 << "${ctx.propertyPath}['${mod.name}'](new DocumentViewModel(doc));\n"
            out << INDENT*4 << "}\n"

        }
        // The date is currently resetting to 1 Jan 1970 if any value is set after initialisation
        // (including undefined/null/'') so this block avoids updating the model if there is no date supplied.
        else if (mod.dataType == 'date') {
            out << INDENT*4 << "if (data['${mod.name}']) {\n"
            out << INDENT*5 << "${ctx.propertyPath}['${mod.name}'](${value});\n"
            out << INDENT*4 << "}\n"
        }
    }

    def columnTotalsModel(out, attrs, model) {
        if (!model.columnTotals) { return }
        out << INDENT*3 << "self.data.${model.columnTotals.name} = ko.observable({});\n"
    }

    def loadColumnTotals(out, attrs, model) {
        if (!model.columnTotals) { return }
        def name = model.columnTotals.name
        def objectName = name.capitalize() + "Row"
        model.columns.each { col ->
            if (!col.noTotal) {
                out << INDENT*4 << "self.data.${name}().${col.name} = new ${objectName}('${col.name}', self);\n"
            }
        }
    }

    def jsRemoveBeforeSave = { attrs ->
        attrs.model?.viewModel?.each({
            if (it.dataType == 'tableWithEditableRows' || it.type == 'photoPoints' || it.type == 'table') {
                out << INDENT*4 << "delete jsData.selected${it.source}Row;\n"
                out << INDENT*4 << "delete jsData.${it.source}TableDataUploadOptions;\n"
                out << INDENT*4 << "delete jsData.${it.source}TableDataUploadVisible;\n"

            }


        })
        attrs.model?.dataModel?.each({
            if (it.dataType == 'document') {
                // Convert an embedded document into a document id.
                out << INDENT*4 << "if (jsData.data && jsData.data.${it.name}) { jsData.data.${it.name} = jsData.data.${it.name}.documentId; }"
            }
        })
    }



    def makeRowModelName(String output, String name) {
        String outputName = output.replaceAll(/\W/, '')
        def rowModelName = "Output_${outputName}_${name}Row"
        return rowModelName
    }

    /**
     * Creates a js array that holds the row keys in the correct order, eg,
     * var <modelName>Rows = ['row1key','row2key']
     */
    def matrixModel(attrs, model, out) {
        out << INDENT*2 << "var ${model.name}Rows = [";
        def rows = []
        model.rows.each {
            rows << "'${it.name}'"
        }
        out << rows.join(',')
        out << "];\n"
        out << INDENT*2 << "var ${model.name}Columns = [";
        def cols = []
        model.columns.each {
            cols << "'${it.name}'"
        }
        out << cols.join(',')
        out << "];\n"
    }

    def matrixViewModel(attrs, model, out) {
        out << """
            self.data.${model.name} = [];//ko.observable([]);
            self.data.${model.name}.init = function (data, columns, rows) {
                var that = this, column;
                if (!data) data = [];
                \$.each(columns, function (i, col) {
                    column = {};
                    column.name = col;
"""
        model.rows.eachWithIndex { row, rowIdx ->
            if (!row.computed) {
                def value = "data[i] ? data[i].${row.name} : 0"
                switch (row.dataType) {
                    case 'number': value = "data[i] ? orZero(${value}) : '0'"; break
                    case 'text': value = "data[i] ? orBlank(${value}) : ''"; break
                    case 'boolean': value = "data[i] ? orFalse(${value}) : 'false'"; break
                }
                out << INDENT*5 << "column.${row.name} = ko.observable(${value});\n"
            }
        }
        // add observables to array before declaring the computed observables
        out << INDENT*5 << "that.push(column);\n"
        model.rows.eachWithIndex { row, rowIdx ->
            if (row.computed) {
                computedValueRenderer.computedObservable(row, 'column', 'that[i]', out)
            }
        }

        out << """
                });
            };
            self.data.${model.name}.get = function (row,col) {
                var value = this[col][${model.name}Rows[row]];
"""
        if (attrs.edit) {
            out << INDENT*4 << "return value;\n"
        } else {
            out << INDENT*4 << "return (value() == 0) ? '' : value;\n"
        }
        out << """
            };
            self.load${model.name.capitalize()} = function (data) {
                self.data.${model.name}.init(data, ${model.name}Columns, ${model.name}Rows);
            };
"""
    }

    def repeatingModel(JSModelRenderContext ctx) {
        def out = ctx.out
        Map attrs = ctx.attrs
        Map model = ctx.dataModel
        ctx.propertyPath = 'self'
        ctx.viewModelPath = 'parent'

        def edit = attrs.edit as boolean
        def editableRows = viewModelFor(attrs, model.name)?.editableRows
        out << INDENT*2 << "var ${makeRowModelName(attrs.model.modelName, model.name)} = function (data, dataModel, context, config) {\n"
        out << INDENT*3 << "var self = this;\n"
        out << INDENT*3 << "self.\$parent = context.parent.data ? context.parent.data : context.parent;\n"
        out << INDENT*3 << "self.\$index = context.index;\n"
        out << INDENT*3 << "self.dataModel = dataModel;\n"
        out << INDENT*3 << "if (!data) data = {};\n"
        out << INDENT*3 << "self.transients = {};\n"

        if (edit && editableRows) {
            // This observable is subscribed to by the SpeciesViewModel (so as to
            // allow editing to be controlled at the table row level) so needs to
            // be declared before any model data fields / observables.
            out << INDENT*3 << "this.isSelected = ko.observable(false);\n"
            out << """
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
                return ko.mapping.toJS(this, {'ignore':['transients', 'isNew', 'isSelected']});
            };
"""
        }
        model.columns.each { col ->
            ctx.dataModel = col
            if (col.computed) {
                switch (col.dataType) {
                    case 'number':
                        computedValueRenderer.computedObservable(col, 'this', 'this', out)
                        break;
                }
            }
            else {
                renderDataModelItem(ctx)
                renderInitialiser(ctx)
            }
        }

        out << INDENT*2 << "};\n"
    }

    def totalsModel(attrs, model, out) {
        if (!model.columnTotals) { return }
        out << """
        var ${model.columnTotals.name.capitalize()}Row = function (name, context) {
            var self = this;
"""
        model.columnTotals.rows.each { row ->
            computedValueRenderer.computedViewModel(out, attrs, row, 'this', "context.data", model.columnTotals)
        }
        out << """
        };
"""
    }

    void observable(JSModelRenderContext ctx, List extenders = []) {

        extenders = extenders ?: []
        if (ctx.dataModel.constraints || ctx.dataModel.warning) {
            extenders.push("{metadata:self.dataModel['${ctx.fieldName()}']}")
        }
        String extenderJS = ''
        extenders.each {
            extenderJS += ".extend(${it})"
        }
        ctx.out << "\n" << INDENT*3 << "${ctx.propertyPath}.${ctx.fieldName()} = ko.observable()${extenderJS};\n"
        modelConstraints(ctx)
    }

    void observableArray(JSModelRenderContext ctx, String extender = '') {
        if (extender) {
            extender = ".extend(${extender})"
        }
        ctx.out << "\n" << INDENT*3 << "${ctx.propertyPath}.${ctx.fieldName()} = ko.observableArray()${extender};\n"
        modelConstraints(ctx)
        populateList(ctx)
    }


    def textViewModel(JSModelRenderContext ctx) {
        observable(ctx)
    }

    def timeViewModel(JSModelRenderContext ctx) {
        // see http://keith-wood.name/timeEntry.html for details

        String spinnerLocation = "${assetPath(src: '/jquery.timeentry.package-2.0.1/spinnerOrange.png')}"
        String spinnerBigLocation = "${assetPath(src: '/jquery.timeentry.package-2.0.1/spinnerOrangeBig.png')}"

        observable(ctx, [])
        out << "\n" << INDENT*3 << "\$('#${model.name}TimeField').timeEntry({ampmPrefix: ' ', spinnerImage: '${spinnerLocation}', spinnerBigImage: '${spinnerBigLocation}', spinnerSize: [20, 20, 8], spinnerBigSize: [40, 40, 16]});"
    }

    def numberViewModel(JSModelRenderContext ctx) {
        observable(ctx, ["{numericString:2}"])
    }

    def dateViewModel(JSModelRenderContext ctx) {
        observable(ctx, ["{simpleDate: false}"])
    }

    def booleanViewModel(JSModelRenderContext ctx) {
        observable(ctx)
    }

    def documentViewModel(JSModelRenderContext ctx) {
        observable(ctx)
    }

    def audioModel(JSModelRenderContext ctx) {

        out << INDENT*4 << "${ctx.propertyPath}.${ctx.dataModel.name} = new AudioViewModel({downloadUrl: '${grailsApplication.config.grails.serverURL}/download/file?filename='});\n"
        populateAudioList(ctx)
    }

    def speciesModel(JSModelRenderContext ctx) {
        String configVarName = ctx.dataModel.name+"Config"
        ctx.out << INDENT*3 << "var ${configVarName} = _.extend(config, {printable:'${ctx.attrs.printable?:''}', dataFieldName:'${ctx.dataModel.name}' });\n"
        ctx.out << INDENT*3 << "${ctx.propertyPath}.${ctx.dataModel.name} = new SpeciesViewModel({}, ${configVarName});\n"
    }

    def imageModel(JSModelRenderContext ctx) {
        out << INDENT*4 << "${ctx.propertyPath}.${ctx.dataModel.name} = ko.observableArray([]);\n"
        populateImageList(ctx)
    }

    def stringListViewModel(JSModelRenderContext ctx) {
        observableArray(ctx)
    }

    def setViewModel(JSModelRenderContext ctx) {
        observableArray(ctx, ["{set: null}"])
    }

    def listViewModel(attrs, model, out) {
        def rowModelName = makeRowModelName(attrs.model.modelName, model.name)
        Map viewModel = viewModelFor(attrs, model.name)
        def editableRows = viewModel?.editableRows
        boolean userAddedRows = Boolean.valueOf(viewModel?.userAddedRows)
        def defaultRows = []
        model.defaultRows?.eachWithIndex { row, i ->
            defaultRows << INDENT*5 + "self.data.${model.name}.addRow(${row.toString()});"
        }
        def insertDefaultModel = defaultRows.join('\n')

        // If there are no default rows, insert a single blank row and make it available for editing.
        if (attrs.edit && insertDefaultModel.isEmpty()) {
            insertDefaultModel = "self.data.${model.name}.addRow();"
        }

        out << """
            self.data.${model.name} = ko.observableArray([]);
            var context = _.extend({}, context, {parent:self, listName:'${model.name}'});
            _.extend(self.data.${model.name}, new ecodata.forms.OutputListSupport(self.dataModel, ${rowModelName}, context, ${userAddedRows}, config));
            self.data.${model.name}.loadDefaults = function() {
                ${insertDefaultModel}
            }
        """

        if (attrs.edit && editableRows) {

                out << """
            self.selected${model.name}Row = ko.observable();

            self.${model.name}templateToUse = function (row) {
                return self.selected${model.name}Row() === row ? '${model.name}editTmpl' : '${model.name}viewTmpl';
            };
            self.edit${model.name}Row = function (row) {
                self.selected${model.name}Row(row);
                row.isSelected(true);
            };
            self.accept${model.name} = function (row, event) {
            if(\$(event.currentTarget).closest('.validationEngineContainer').validationEngine('validate')) {
                // todo: validation
                row.commit();
                self.selected${model.name}Row(null);
                row.isSelected(false);
                row.isNew = false;
                };
            };
            self.cancel${model.name} = function (row) {
                if (row.isNew) {
                    self.remove${model.name}Row(row);
                } else {
                    row.reset();
                    self.selected${model.name}Row(null);
                    row.isSelected(false);
                }
            };
            self.${model.name}Editing = function() {
                return self.selected${model.name}Row() != null;
            };
"""

        }
    }

    def populateList(JSModelRenderContext ctx) {
        ctx.out << INDENT*4 << """
        self.load${ctx.dataModel.name} = function (data) {
            if (data !== undefined) {
                ${ctx.propertyPath}.${ctx.dataModel.name}(data);
        }};
        """
    }

    def populateImageList(JSModelRenderContext ctx) {
        ctx.out << INDENT*4 << """
        self.load${ctx.dataModel.name} = function (data) {
            if (data !== undefined) {
                \$.each(data, function (i, obj) {
                    ${ctx.propertyPath}.${ctx.dataModel.name}.push(image(obj));
                });
        }};
        """
    }

    def populateAudioList(JSModelRenderContext ctx) {
        ctx.out << INDENT*4 << """
        self.load${ctx.dataModel.name} = function (data) {
            if (data !== undefined) {
                \$.each(data, function (i, obj) {
                    if (_.isUndefined(obj.url)) {
                        obj.url = "${grailsApplication.config.grails.serverURL}/download/file?filename=" + obj.filename;
                    }
                    ${ctx.propertyPath}.${ctx.dataModel.name}.files.push(new AudioItem(obj));
                });
            }
        };
        """
    }

    def modelConstraints(JSModelRenderContext ctx) {
        Map model = ctx.dataModel
        if (model.constraints) {
            if (model.constraints instanceof List) {
                def stringifiedOptions = "["+ model.constraints.join(",")+"]"
                out << INDENT*3 << "${ctx.propertyPath}.${model.name}.constraints = ${stringifiedOptions};\n"
            }
            else if (model.constraints.type == 'computed') {
                out << INDENT*3 << "${ctx.propertyPath}.${model.name}.constraints = ko.pureComputed(function() {\n"
                model.constraints.options.each {
                    out << INDENT*4 << "if (ecodata.forms.expressionEvaluator.evaluateBoolean('${it.expression}', self)) {\n"
                    out << INDENT*5 << "return [${it.constraints.join(',')}];\n"
                    out << INDENT*4 << "}\n"
                }
                if (model.constraints.defaults) {
                    out << INDENT*4 << "return [${model.constraints.defaults(',')}];\n"
                }
                out << INDENT*3 << "});\n"

            }

        }
        if (model.behaviour) {
            model.behaviour.each { constraint ->
                out << INDENT*3 << "${ctx.propertyPath}.${model.name}.${constraint.type}Constraint = ko.computed(function() {\n"
                out << INDENT*4 << "var condition = '${constraint.condition}';\n";
                out << INDENT*4 << "return ecodata.forms.expressionEvaluator.evaluateBoolean(condition, ${ctx.propertyPath});\n"
                out << INDENT*3 << "});\n"
            }
        }
    }

    /*------------ methods to look up attributes in the view model -------------*/
    Map viewModelFor(Map attrs, String name) {
        List viewModel = attrs.model.viewModel

        return findViewByName(viewModel, name)
    }
    Map findViewByName(List viewModel, String name) {

        return viewModel.findResult { node ->

            if (node.source == name) {
                return node
            }
            else if (isNestedViewModelType(node)) {
                List nested = getNestedViewNodes(node)
                return findViewByName(nested, name)
            }
            return null
        }
    }

    List getNestedViewNodes(node) {
        return (node.type in ['table', 'photoPoints', 'grid'] ) ? node.columns: node.items
    }

    boolean isNestedViewModelType(node) {
        return (node.items != null || node.columns != null)
    }
}

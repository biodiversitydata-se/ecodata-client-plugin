package au.org.ala.ecodata.forms


class ModelJSTagLib {

    static namespace = "md"

    private final static INDENT = "    "

    private final static String QUOTE = "\"";
    private final static String SPACE = " ";
    private final static String EQUALS = "=";

    private ComputedValueRenderer computedValueRenderer = new ComputedValueRenderer()

    /*------------ JAVASCRIPT for dynamic content -------------*/

    def jsModelObjects = { attrs ->
        attrs.model?.dataModel?.each { model ->
            if (model.dataType in ['list', 'photoPoints']) {
                repeatingModel(attrs, model, out)
                totalsModel attrs, model, out
            }
            else if (model.dataType == 'matrix') {
                matrixModel attrs, model, out
            }
        }
        // TODO only necessary if the model has a field of type species.
        out << INDENT*2 << "var speciesLists = ${attrs.speciesLists.toString()};\n"

        def site = attrs.site ? attrs.site.toString() : "{}"
        out << INDENT*2 << "var site = ${site};\n"
    }

    def jsViewModel = { attrs ->
        attrs.model?.dataModel?.each { mod ->
            if (mod.dataType  == 'list') {
                listViewModel(attrs, mod, out)
                columnTotalsModel out, attrs, mod
            }
            else if (mod.dataType == 'matrix') {
                matrixViewModel(attrs, mod, out)
            }
            else if (mod.computed) {
                computedValueRenderer.computedViewModel(out, attrs, mod, 'self.data', 'self.data')
            }
            else if (mod.dataType == 'text') {
                textViewModel(mod, out)
            }
            else if (mod.dataType == 'number') {
                numberViewModel(mod, out)
            }
            else if (mod.dataType == 'stringList') {
                stringListModel(mod, out)
            }
            else if (mod.dataType == 'image') {
                imageModel(mod, out)
            }
            else if (mod.dataType == 'species') {
                speciesModel('data.', mod.name, '{}', attrs.printable, out)
            }
            else if (mod.dataType == 'date') {
                dateViewModel(mod, out)
            }
            else if (mod.dataType == 'document') {
                documentViewModel(mod, out)
            }
        }
        out << INDENT*3 << "self.transients.site = site;"
    }

    /**
     * This js is inserted into the 'loadData()' function of the view model.
     *
     * It loads the existing values (or default values) into the model.
     */
    def jsLoadModel = { attrs ->
        attrs.model?.dataModel?.each { mod ->
            if (mod.dataType == 'list') {
                out << INDENT*4 << "self.load${mod.name}(data.${mod.name});\n"
                loadColumnTotals out, attrs, mod
            }
            else if (mod.dataType == 'matrix') {
                out << INDENT*4 << "self.load${mod.name.capitalize()}(data.${mod.name});\n"
            }
            else if ((mod.dataType == 'text' || mod.dataType == 'date') && !mod.computed) {
                // MEW: Removed the 'orBlank' wrapper on the initial data which means missing data will be
                // 'undefined'. This works better with dropdowns as the default value is undefined and
                // therefore no data change occurs when the model is bound.
                out << INDENT*4 << "self.data['${mod.name}'](data['${mod.name}']);\n"
                // This seemed to work ok for plain text too but if it causes an issue, just add an
                // 'if (mode.constraints)' condition and return plain text to use orBlank.
            }
            else if (mod.dataType == 'number' && !mod.computed) {
                out << INDENT*4 << "self.data['${mod.name}'](orZero(data['${mod.name}']));\n"
            }
            else if (mod.dataType in ['stringList', 'image', 'photoPoints'] && !mod.computed) {
                out << INDENT*4 << "self.load${mod.name}(data['${mod.name}']);\n"
            }
            else if (mod.dataType == 'species') {
                out << INDENT*4 << "self.data['${mod.name}'].loadData(data['${mod.name}']);\n"
            }
            else if (mod.dataType == 'document') {
                out << INDENT*4 << "var doc = findDocumentById(documents, data['${mod.name}']);\n"
                out << INDENT*4 << "if (doc) {\n"
                out << INDENT*8 << "self.data['${mod.name}'](new DocumentViewModel(doc));\n"
                out << INDENT*4 << "}\n"

            }
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

    def repeatingModel(attrs, model, out) {
        def edit = attrs.edit as boolean
        def editableRows = viewModelFor(attrs, model.name)?.editableRows
        def observable = editableRows ? 'protectedObservable' : 'observable'
        out << INDENT*2 << "var ${makeRowModelName(attrs.model.modelName, model.name)} = function (data, parent, index, config) {\n"
        out << INDENT*3 << "var self = this;\n"
        out << INDENT*3 << "self.\$parent = parent.data ? parent.data : parent;\n"
        out << INDENT*3 << "self.\$index = index;\n"

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
            if (col.computed) {
                switch (col.dataType) {
                    case 'number':
                        computedValueRenderer.computedObservable(col, 'self', 'self', out)
                        break;
                }
            }
            else {
                switch (col.dataType) {
                    case 'simpleDate':
                    case 'date':
                        out << INDENT*3 << "this.${col.name} = ko.${observable}(orBlank(data['${col.name}'])).extend({simpleDate: false});\n"
                        break;
                    case 'text':
                        out << INDENT*3 << "this.${col.name} = ko.${observable}(orBlank(data['${col.name}']));\n"
                        break;
                    case 'number':
                        out << INDENT*3 << "this.${col.name} = ko.${observable}(orZero(data['${col.name}'])).extend({numericString:2});\n"
                        break;
                    case 'boolean':
                        out << INDENT*3 << "this.${col.name} = ko.${observable}(orFalse(data['${col.name}']));\n"
                        break;
                    case 'embeddedImage':
                        out << INDENT*3 << "if (data['${col.name}']) {\n"
                        out << INDENT*4 << "this.${col.name} = data['${col.name}'];\n"
                        out << INDENT*3 << "} else {\n"
                        out << INDENT*4 << "this.${col.name} = {};\n"
                        out << INDENT*3 << "}\n"
                        break;
                    case 'embeddedImages':
                        out << INDENT*3 << "this.${col.name} = ko.observableArray();\n"
                        out << INDENT*3 << "if (data['${col.name}'] instanceof Array) {\n"
                        out << INDENT*4 << "for (var i=0; i< data['${col.name}'].length; i++) {this.${col.name}.push(image(data['${col.name}'][i]))}\n"
                        out << INDENT*3 << "} else if (data['${col.name}']) {\n"
                        out << INDENT*4 << "this.${col.name}.push(image(data['${col.name}']));\n"
                        out << INDENT*3 << "}\n"
                        break;
                    case 'species':
                        def printable = attrs.printable ? attrs.printable : ''
                        speciesModel('', col.name, "data['${col.name}']", printable, out)
                        break
                    case 'stringList':
                        out << INDENT*3 << "this.${col.name}=ko.observableArray(orEmptyArray(data['${col.name}']));\n";
                        break

                }
                modelConstraints(col, out)
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

    def textViewModel(model, out) {
        out << "\n" << INDENT*3 << "self.data.${model.name} = ko.observable();\n"
        modelConstraints(model, out)
    }

    def numberViewModel(model, out) {
        out << "\n" << INDENT*3 << "self.data.${model.name} = ko.observable().extend({numericString:2});\n"
        modelConstraints(model, out)
    }

    def dateViewModel(model, out) {
        out << "\n" << INDENT*3 << "self.data.${model.name} = ko.observable().extend({simpleDate: false});\n"
    }

    def documentViewModel(model, out) {
        out << "\n" << INDENT*3 << "self.data.${model.name} = ko.observable();\n"
    }

    def listViewModel(attrs, model, out) {
        def rowModelName = makeRowModelName(attrs.model.modelName, model.name)
        Map viewModel = viewModelFor(attrs, model.name)
        def editableRows = viewModel?.editableRows
        boolean userAddedRows = Boolean.valueOf(viewModel?.userAddedRows)
        def defaultRows = []
        model.defaultRows?.eachWithIndex { row, i ->
            defaultRows << INDENT*5 + "self.data.${model.name}.push(new ${rowModelName}(${row.toString()}, self, $i, config));"
        }
        def insertDefaultModel = defaultRows.join('\n')

        // If there are no default rows, insert a single blank row and make it available for editing.
        if (attrs.edit && insertDefaultModel.isEmpty()) {
            insertDefaultModel = "self.transients.${model.name}Support.addRow(self, 0);"
        }

        out << """
            self.data.${model.name} = ko.observableArray([]);
            self.transients.${model.name}Support = new ecodata.forms.OutputListSupport(self, '${model.name}', ${rowModelName}, ${userAddedRows}, config);
        """

        out << """
            self.load${model.name} = function (data, append) {
                if (!append) {
                    self.data.${model.name}([]);
                }
                if (data === undefined) {
                    ${insertDefaultModel}
                } else {
                    \$.each(data, function (i, obj) {
                        self.data.${model.name}.push(new ${rowModelName}(obj, self, i, config));
                    });
                }
            };
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

    def stringListModel(model, out) {
        out << INDENT*4 << "self.data.${model.name}=ko.observableArray([]);\n"
        modelConstraints(model, out)
        populateList(model, out)

    }

    def populateList(model, out) {
        out << INDENT*4 << """
        self.load${model.name} = function (data) {
            if (data !== undefined) {
                \$.each(data, function (i, obj) {
                    self.data.${model.name}.push(obj);
                });
        }};
        """
    }

    def populateImageList(model, out) {
        out << INDENT*4 << """
        self.load${model.name} = function (data) {
            if (data !== undefined) {
                \$.each(data, function (i, obj) {
                    self.data.${model.name}.push(image(obj));
                });
        }};
        """
    }

    def imageModel(model, out) {
        out << INDENT*4 << "self.data.${model.name}=ko.observableArray([]);\n"
        populateImageList(model, out)
    }

    def speciesModel(String targetContext, String target, String data, printable, out) {
        out << INDENT*3 << "var ${target}Config = _.extend(config, {printable:'${printable?:''}', dataFieldName:'${target}' });\n"
        out << INDENT*3 << "self.${targetContext}${target} = new SpeciesViewModel(${data}, ${target}Config);\n"
    }

    def modelConstraints(model, out) {
        if (model.constraints) {
            if (model.constraints instanceof List) {
                def stringifiedOptions = "["+ model.constraints.join(",")+"]"
                out << INDENT*3 << "self.transients.${model.name}Constraints = ${stringifiedOptions};\n"
            }
            else if (model.constraints.type == 'computed') {
                out << INDENT*3 << "self.transients.${model.name}Constraints = ko.pureComputed(function() {\n"
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
                out << INDENT*3 << "self.transients.${model.name}${constraint.type}Constraint = ko.computed(function() {\n"
                out << INDENT*4 << "var condition = '${constraint.condition}';\n";
                out << INDENT*4 << "return ecodata.forms.expressionEvaluator.evaluateBoolean(condition, self);\n"
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

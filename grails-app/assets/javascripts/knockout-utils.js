/**
 * Bindings used by the forms library that are also useful in other instances.
 */
(function() {

    // Binding to exclude the contained html from the current binding context.
    // Used when you want to bind a section of html to a different viewModel.
    ko.bindingHandlers.stopBinding = {
        init: function() {
            return { controlsDescendantBindings: true };
        }
    };
    ko.virtualElements.allowedBindings.stopBinding = true;

    /**
     * Creates a flag that indicates whether the model has been modified.
     *
     * Compares the model to its initial state each time an observable changes. Uses the model's
     * modelAsJSON method if it is defined else uses ko.toJSON.
     *
     * @param root the model to watch
     * @param isInitiallyDirty
     * @returns an object (function) with the methods 'isDirty' and 'reset'
     */
    ko.dirtyFlag = function (root, isInitiallyDirty) {
        var result = function () {
        };
        var _isInitiallyDirty = ko.observable(isInitiallyDirty || false);
        // this allows for models that do not have a modelAsJSON method
        var getRepresentation = function () {
            return (typeof root.modelAsJSON === 'function') ? root.modelAsJSON() : ko.toJSON(root);
        };
        var _initialState = ko.observable(getRepresentation());

        result.isDirty = ko.dependentObservable(function () {
            var dirty = _isInitiallyDirty() || _initialState() !== getRepresentation();
            /*if (dirty) {
                console.log('Initial: ' + _initialState());
                console.log('Actual: ' + getRepresentation());
            }*/
            return dirty;
        });

        result.reset = function () {
            _initialState(getRepresentation());
            _isInitiallyDirty(false);
        };

        return result;
    };

    /**
     * A simple dirty flag that will detect the first change to a model, then afterwards always return true (meaning
     * dirty).  This is to prevent the full model being re-serialized to JSON on every change, which can cause
     * performance issues for large models.
     * From: http://www.knockmeout.net/2011/05/creating-smart-dirty-flag-in-knockoutjs.html
     * @param root the model.
     * @returns true if the model has changed since this function was added.
     */
    ko.simpleDirtyFlag = function (root) {
        var _initialized = ko.observable(false);

        // this allows for models that do not have a modelAsJSON method
        var getRepresentation = function () {
            return (typeof root.modelAsJSON === 'function') ? root.modelAsJSON() : ko.toJSON(root);
        };

        var result = function () {
        };

        //one-time dirty flag that gives up its dependencies on first change
        result.isDirty = ko.computed(function () {
            if (!_initialized()) {

                //just for subscriptions
                getRepresentation();

                //next time return true and avoid ko.toJS
                _initialized(true);

                //on initialization this flag is not dirty
                return false;
            }

            //on subsequent changes, flag is now dirty
            return true;
        });
        result.reset = function () {
            _initialized(false);

            return result;
        };

        return result;
    };
})();
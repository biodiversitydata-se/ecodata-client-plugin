// Use npm run-script package-turf
// This will roduce turf-packaged.js in grails-app/assets/vendor/turf/turf-packaged.js
// The functions will be exported to a global "turf" namespace.
module.exports = {
    area: require('@turf/area').default,
    length: require('@turf/length').default,
    bbox: require('@turf/bbox').default,
    convex: require('@turf/convex').default,
    simplify: require('@turf/simplify').default
};

grails.project.class.dir = "target/classes"
grails.project.test.class.dir = "target/test-classes"
grails.project.test.reports.dir = "target/test-reports"

grails.project.fork = [
    // configure settings for compilation JVM, note that if you alter the Groovy version forked compilation is required
    //  compile: [maxMemory: 256, minMemory: 64, debug: false, maxPerm: 256, daemon:true],

    // configure settings for the test-app JVM, uses the daemon by default
    test: false, // Clover was giving errors with forked tests.
    // configure settings for the run-app JVM
    run: [maxMemory: 768, minMemory: 64, debug: false, maxPerm: 256, forkReserve:false],
    // configure settings for the run-war JVM
    war: [maxMemory: 768, minMemory: 64, debug: false, maxPerm: 256, forkReserve:false],
    // configure settings for the Console UI JVM
    console: [maxMemory: 768, minMemory: 64, debug: false, maxPerm: 256]
]

clover {
    on = false // Slows down testing individual classes too much.  Override by passing -clover.on to test-app e.g. grails test-app -clover.on unit:
    reporttask = { ant, binding, self ->
        ant.'clover-check'(target: "3%", haltOnFailure: true) { }
    }
}


grails.project.dependency.resolver = "maven" // or ivy
grails.project.dependency.resolution = {
    // inherit Grails' default dependencies
    inherits("global") {
        // uncomment to disable ehcache
        // excludes 'ehcache'
    }
    log "warn" // log level of Ivy resolver, either 'error', 'warn', 'info', 'debug' or 'verbose'
    repositories {
//        grailsCentral()
        mavenCentral()
        mavenLocal()
        mavenRepo "https://nexus.ala.org.au/content/groups/public/"
        // uncomment the below to enable remote dependency resolution
        // from public Maven repositories
        //mavenRepo "http://repository.codehaus.org"
        //mavenRepo "http://download.java.net/maven/2/"
        //mavenRepo "http://repository.jboss.com/maven2/"
    }
    dependencies {
        // specify dependencies here under either 'build', 'compile', 'runtime', 'test' or 'provided' scopes eg.
        // runtime 'mysql:mysql-connector-java:5.1.27'
        compile "org.apache.httpcomponents:httpcore:4.4.1"
        compile "org.apache.httpcomponents:httpclient:4.4.1"

        test 'org.openclover:clover:4.3.0'
    }

    plugins {
        compile ":asset-pipeline:2.14.1"
        compile":ala-auth:2.2.0"
        compile (":ala-map:2.1.7") {
            excludes "resources"
        }
        build(":release:3.1.2",
              ":rest-client-builder:2.1.1") {
            export = false
        }

        test 'org.grails.plugins:clover:4.3.0'
    }
}

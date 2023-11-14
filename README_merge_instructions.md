git clone the master branch from ALA repo
enter the folder
git checkout master
change .git/config to put our repo git@github.com:biodiversitydata-se/ecodata-client-plugin.git
create a branch dedicated to the merge : 
git branch merge_alamaster_230330
git checkout merge_alamaster_230330
push the branch :
git push -u origin merge_alamaster_230330
(WTF the merge request ?)
get the info from the repo to have all the branches :
git pull
import the current ecodata branch we're working on :
git checkout lusm-main


then decide which branch the erge will take place :
git checkout merge_alamaster_230330

and then merge 
git merge lusm-main



commenter une ligne dans 
src/main/groovy/au/org/ala/ecodata/forms/EditModelWidgetRenderer.groovy


sdk use grails 4.0.10
java 11

grails test-app to pass at leasst the first tests
then fails on integration tests (29 ok 29 fails)
apreil sur la précédente version

grails run-app should work




to use it as a dependency, things should be changed to be used by grails 5
compile => implementation
provided => compileOnly
testRuntime => testRuntimeOnly
testCompile => testImplementation


delete grails-app/conf/logback.groovy
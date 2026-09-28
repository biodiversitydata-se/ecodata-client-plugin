# lusm_upgrade_grails5.md




2123  git checkout -b upgrade-grails-5-java11
 2124  git branch --show-current
 2125  git status
 2126  sdk use java 11.0.30-tem
 2127  java -version
 2128  ./gradlew --version
 2129  ./gradlew tasks --stacktrace
 2130  ./gradlew clean assemble --stacktrace
 2131  ./gradlew dependencyInsight   --dependency asset-pipeline   --configuration compileClasspath
 2132  ./gradlew dependencies   --configuration compileClasspath | grep -i asset
 2133  ./gradlew clean compileGroovy --stacktrace
 2134  ./gradlew dependencyInsight   --dependency asset-pipeline-grails   --configuration compileClasspath
 2135  ./gradlew clean compileGroovy --stacktrace
 2136  ./gradlew dependencyInsight   --dependency asset-pipeline-grails   --configuration compileClasspath
 2137  find ~/.gradle/caches/modules-2/files-2.1/com.bertramlabs.plugins/   -path '*asset-pipeline-grails*'   -name '*.jar'
 2138  find ~/.gradle/caches/modules-2/files-2.1/com.bertramlabs.plugins/   -path '*asset-pipeline*'   -name '*.jar'
 2139  jar tf ~/.gradle/caches/modules-2/files-2.1/com.bertramlabs.plugins/asset-pipeline-core/3.4.7/8f466bb3580074113614bc8cb475d79b7dd479c4/asset-pipeline-core-3.4.7.jar   | grep -E 'AssetPipelineConfigHolder|AssetFile|FileSystemAssetResolver'
 2140  jar tf ~/.gradle/caches/modules-2/files-2.1/com.bertramlabs.plugins/asset-pipeline-core/3.4.7/8f466bb3580074113614bc8cb475d79b7dd479c4/asset-pipeline-core-3.4.7.jar   | grep -E 'AssetPipelineConfigHolder|AssetFile|FileSystemAssetResolver'
 2141  jar tf ~/.gradle/caches/modules-2/files-2.1/com.bertramlabs.plugins/asset-pipeline-core/2.15.1/7a03810517c8d4c241c686373f620e3ee92af1e7/asset-pipeline-core-2.15.1.jar   | grep -E 'AssetPipelineConfigHolder|AssetFile|FileSystemAssetResolver'
 2142  ./gradlew dependencies   --configuration compileClasspath | grep -E 'asset-pipeline-(grails|core)'
 2143  ./gradlew dependencies   --configuration compileClasspath | grep -E 'asset-pipeline-(grails|core)'
 2144  grep -n -C 3 "asset-pipeline" build.gradle
 2145  ./gradlew dependencyInsight   --dependency asset-pipeline-core   --configuration compileClasspath
 2146  ./gradlew dependencyInsight   --dependency asset-pipeline-core   --configuration runtimeClasspath
 2147  ./gradlew dependencyInsight   --dependency asset-pipeline-core   --configuration compileClasspath
 2148  ./gradlew clean compileGroovy --stacktrace
 2149  git status --short
 2150  git diff --stat
 2151  git diff
 2152  ./gradlew clean assemble --stacktrace
 2153  ./gradlew clean test --stacktrace
 2154  mathieu@mathieu-Latitude-5540:~/Documents/repos/ecodata-client-plugin$ ./gradlew clean test --stacktrace
 2155  > Task :_Events
 2156  Running _Events.groovy script
 2157  /home/mathieu/Documents/repos/ecodata-client-plugin/_Events.groovy
 2158  > Task :compileTestGroovy FAILED
 2159  FAILURE: Build failed with an exception.
 2160  * What went wrong:
 2161  Execution failed for task ':compileTestGroovy'.
 2162  > Could not resolve all files for configuration ':testCompileClasspath'.
 2163  * Try:
 2164  Run with --info or --debug option to get more log output. Run with --scan to get full insights.
 2165  * Exception is:
 2166  org.gradle.api.tasks.TaskExecutionException: Execution failed for task ':compileTestGroovy'.
 2167  ./gradlew dependencyInsight   --dependency grails-plugin-testing   --configuration testCompileClasspath
 2168  ./gradlew dependencies   --configuration testCompileClasspath | grep -E 'grails-(plugin-testing|gorm-testing|web-testing)'
 2169  ./gradlew clean test --stacktrace
 2170  ./gradlew clean assemble --stacktrace
 2171  ls -lh build/libs/
 2172  unzip -p build/libs/*-plain.jar META-INF/grails-plugin.xml
 2173  grep -R "3\.3\|grailsVersion" -n .   --exclude-dir=.git   --exclude-dir=build   --exclude-dir=.gradle
 2174  ./gradlew clean assemble --stacktrace
 2175  unzip -p build/libs/*-plain.jar META-INF/grails-plugin.xml
 2176  history

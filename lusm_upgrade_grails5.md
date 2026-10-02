# lusm_upgrade_grails5.md

sdk install grails 5.2.5
sdk install java 11.0.30-tem


sudo mkdir -p /opt/java-11.0.30-tem
sudo cp -a /home/ubuntu/.sdkman/candidates/java/11.0.30-tem/. /opt/java-11.0.30-tem/
sudo chown -R root:root /opt/java-11.0.30-tem

sudo -u tomcat /opt/java-11.0.30-tem/bin/java -version

sudo nano /etc/systemd/system/tomcat9.service.d/zzz-java11.conf
and paste in the file :
[Service]
Environment="JAVA_HOME=/opt/java-11.0.30-tem"

sudo systemctl daemon-reload
sudo systemctl restart tomcat9


ON PROD BEFORE git pull:
ubuntu@live-biocollect-1:~/ecodata-client-plugin$ git diff
diff --git a/build.gradle b/build.gradle
index 263e447..80fb66e 100644
--- a/build.gradle
+++ b/build.gradle
@@ -8,7 +8,7 @@ buildscript {
     dependencies {
         classpath "org.grails:grails-gradle-plugin:$grailsVersion"
         classpath "com.bertramlabs.plugins:asset-pipeline-gradle:2.15.1"
-        classpath 'com.bmuschko:gradle-clover-plugin:2.2.4'
+        classpath 'com.bmuschko:gradle-clover-plugin:2.2.0'
     }
 }
 
diff --git a/gradle/clover.gradle b/gradle/clover.gradle
index 058bc67..551415d 100644
--- a/gradle/clover.gradle
+++ b/gradle/clover.gradle
@@ -3,7 +3,7 @@ buildscript {
         jcenter()
     }
     dependencies {
-        classpath 'com.bmuschko:gradle-clover-plugin:2.2.4'
+        classpath 'com.bmuschko:gradle-clover-plugin:2.2.0'
     }
 }
 
@@ -34,4 +34,4 @@ clover {
 
         targetPercentage = 60
     }
-}
\ No newline at end of file
+}



commands to upgrade

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



ON PROD :
./gradlew clean assemble --stacktrace
./gradlew test --stacktrace
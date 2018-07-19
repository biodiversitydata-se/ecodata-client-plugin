/*
 * Copyright (C) 2013 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 */

package au.org.ala.ecodata.forms

import grails.converters.JSON
import org.codehaus.groovy.grails.web.converters.exceptions.ConverterException
import org.springframework.http.MediaType

import static org.apache.http.HttpHeaders.ACCEPT
/**
 * Helper class for invoking ecodata (and other Atlas) web services.
 */
class WebService {
    private static APPLICATION_JSON = 'application/json'

    def grailsApplication

    def getJson(String url, Integer timeout = null, boolean includeApiKey = false) {
        def conn = null
        try {
            conn = configureConnection(url, true, timeout)
            if (includeApiKey) {
                conn.setRequestProperty("Authorization", grailsApplication.config.api_key);
            }
            conn.setRequestProperty(ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            def json = responseText(conn)
            return JSON.parse(json)
        } catch (ConverterException e) {
            def error = ['error': "Failed to parse json. ${e.getClass()} ${e.getMessage()} URL= ${url}."]
            log.error error
            return error
        } catch (SocketTimeoutException e) {
            def error = [error: "Timed out getting json. URL= ${url}."]
            log.error error, e
            return error
        } catch (ConnectException ce) {
            log.info "Exception class = ${ce.getClass().name} - ${ce.getMessage()}"
            def error = [error: "ecodata service not available. URL= ${url}."]
            log.error error, ce
            return error
        } catch (Exception e) {
            log.info "Exception class = ${e.getClass().name} - ${e.getMessage()}"
            def error = [error: "Failed to get json from web service. ${e.getClass()} ${e.getMessage()} URL= ${url}.",
                         statusCode: conn?.responseCode?:"",
                         detail: conn?.errorStream?.text]
            log.error error, e
            return error
        }
    }
}

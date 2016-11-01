package org.transmartproject.rest

import grails.converters.JSON
import groovy.json.JsonSlurper
import groovy.util.logging.Slf4j
import org.springframework.core.io.Resource
import org.springframework.http.ResponseEntity
import org.transmartproject.db.TestData
import org.transmartproject.db.user.AccessLevelTestData
import org.transmartproject.rest.marshallers.MarshallerSpec

@Slf4j
class QueryControllerSpec extends MarshallerSpec {

    void 'test JSON (de)serialisation'() {
        def query = [
                queryType: 'VALUES',
                constraint: [
                        type: 'FieldConstraint',
                        operator: '=',
                        field: [
                                dimension: 'PatientDimension',
                                fieldName: 'id',
                                type: 'ID'
                        ],
                        value: -101
                ]
        ] as JSON
        log.info "Query: ${query.toString()}"

        when:
        def queryJSON = query.toString(false)
        def url = "${baseURL}/query/observations?query=${URLEncoder.encode(queryJSON, 'UTF-8')}"
        log.info "Request URL: ${url}"

        ResponseEntity<Resource> response = getJson(url)
        String content = response.body.inputStream.readLines().join('\n')
        def result = new JsonSlurper().parseText(content)

        then:
        response.statusCode.value() == 200
        result instanceof List
    }

    void 'test invalid constraint'() {
        // invalid constraint with an operator that is not supported for the value type.
        def query = [
                queryType: 'VALUES',
                constraint: [
                        type: 'ValueConstraint',
                        operator: '<',
                        valueType: 'STRING',
                        value: 'invalid dummy value'
                ]
        ] as JSON
        log.info "Query: ${query.toString(false)}"

        when:
        def url = "${baseURL}/query/observations?query=${URLEncoder.encode(query.toString(false), 'UTF-8')}"
        log.info "Request URL: ${url}"

        ResponseEntity<Resource> response = getJson(url)
        String content = response.body.inputStream.readLines().join('\n')
        def result = new JsonSlurper().parseText(content)

        then:
        response.statusCode.value() == 403
        result.errors[0].message == 'Invalid constraint of type ValueConstraint'
        result.errors[0]['rejected-value'].errors.errors[0].message == "Operator [<] not valid for type STRING"
    }

    void 'test invalid JSON'() {
        def query = [
                queryType: 'VALUES',
                constraint: [
                        type: 'TrueConstraint'
                ]
        ] as JSON
        log.info "Query: ${query.toString()}"

        when:
        def queryJSON = query.toString(false)[0..-2] // remove last character of the JSON string
        log.info "Invalid JSON: ${queryJSON}"
        def url = "${baseURL}/query/observations?query=${URLEncoder.encode(queryJSON, 'UTF-8')}"
        log.info "Request URL: ${url}"

        ResponseEntity<Resource> response = getJson(url)
        String content = response.body.inputStream.readLines().join('\n')
        def result = new JsonSlurper().parseText(content)

        then:
        response.statusCode.value() == 400
        result.message == 'Cannot parse query parameter'
    }

    void 'test getSupportedFields'() {
        when:
        def url = "${baseURL}/query/supportedFields"
        ResponseEntity<Resource> response = getJson(url)

        String content = response.body.inputStream.readLines().join('\n')
        def result = new JsonSlurper().parseText(content)
        if (result instanceof List) {
            log.info 'Supported fields:'
            result.each {
                log.info (((Map)it).toMapString())
            }
        }

        then:
        response.statusCode.value() == 200
        result instanceof List
    }

}

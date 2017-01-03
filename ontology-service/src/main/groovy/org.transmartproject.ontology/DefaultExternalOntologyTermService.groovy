package org.transmartproject.ontology

import groovy.util.logging.Slf4j
import groovyx.net.http.ContentType
import groovyx.net.http.HttpResponseDecorator
import groovyx.net.http.Method
import groovyx.net.http.HTTPBuilder

/**
*  Created by ewelina on 7-12-16.
*/
@Slf4j
class DefaultExternalOntologyTermService implements ExternalOntologyTermService {

    private static final ContentType CONTENT_TYPE = ContentType.JSON

    private String ontologyServerUrl
    private String searchTextRequestPath
    private String conceptCodeDetailsRequestPath
    private HTTPBuilder http

    private final Map<String, String> labelCache = [:]

    /**
     * Ontology service for fetching ontology metadata for a concept code.
     * @param ontologyServerUrl
     * @param searchTextRequestPath
     * @param conceptCodeDetailsRequestPath
     */
    DefaultExternalOntologyTermService(
            String ontologyServerUrl = 'http://localhost:8081',
            String searchTextRequestPath = '/search',
            String conceptCodeDetailsRequestPath = '') {
        this.ontologyServerUrl = ontologyServerUrl
        this.searchTextRequestPath = searchTextRequestPath
        this.conceptCodeDetailsRequestPath = conceptCodeDetailsRequestPath
        this.http = new HTTPBuilder(ontologyServerUrl)
    }

    /**
     * Reference terms from external ontology servers
     * @param categoryCode
     * @param dataLabel
     * @return
     */
    public List<OntologyMap> fetchPreferredConcept(String categoryCode, String dataLabel) {

        def response = get("$searchTextRequestPath/$dataLabel")

        if (!response) {
            return []
        }

        if (!response instanceof Collection) {
            throw new OntologyServerConnectionException("Got unexpected result of type ${response?.class?.simpleName}")
        }
        def data = response as Collection

        if (data.empty) {
            return []
        }

        def recommendedValue = getRecommendedValue(data)
        def paths = recommendedValue.classpath as List<List>
        def ancestorsMap = createAncestorsMap(paths)
        def labels = getLabels(ancestorsMap.keySet())

        String originalCode = paths[0][-1]
        log.debug "Found code ${originalCode} for ${categoryCode}, ${dataLabel}."

        ancestorsMap.collect { code, ancestors ->
            def isOriginalCode = (code == originalCode)
            mapResponseToOntologyMap(
                    code,
                    labels[code],
                    isOriginalCode ? categoryCode : null,
                    isOriginalCode ? dataLabel : null,
                    (ancestors as List).sort())
        }
    }

    /**
     * Maps ontology codes to their labels by fetching them from an ontology server.
     * @param values
     * @return
     */
    Map<String, String> getLabels(Collection<String> values) {
        def labelMap = [:]
        values.collect{
            def label = labelCache[it]
            if (!label) {
                def detail = get("$conceptCodeDetailsRequestPath/$it")
                label = detail?.node ?: ''
                log.info "Label for value ${it}: ${label}"
                labelCache[it] = label
            }
            labelMap.put(it, label)
        }
        labelMap
    }

    /**
     * Http request to get preferred concept codes fetched from external ontology server
     * @param path
     * @param acceptHeader
     * @return
     */
    def get(String path) {
        http.request(Method.GET, ContentType.JSON) { req ->
            uri.path = path
            headers['Accept'] = CONTENT_TYPE.acceptHeader

            log.debug "GET ${URLDecoder.decode(uri.toString(), 'UTF-8')}"
            response.success = { HttpResponseDecorator resp, Object data ->
                def contentType = (resp.headers.'Content-Type' as String).split(';')[0]
                if (!(contentType in CONTENT_TYPE.contentTypeStrings)) {
                    throw new OntologyServerConnectionException("" +
                            "Unsupported response type: ${contentType}")
                }
                return data
            }

            response.failure = { HttpResponseDecorator resp, reader ->
                if (resp.status == 404) {
                    return null
                }
                throw new OntologyServerConnectionException(
                        "Code ${resp.statusLine.statusCode}: ${resp.statusLine.reasonPhrase}")
            }
        }
    }

    /**
     * Creates map from ontology code to the codes of its ancestors.
     *
     * @param paths
     * @return
     */
    private static Map<String, Set<String>> createAncestorsMap(List<List<String>> paths) {
        def multimap = [:] as Map<String, Set>
        paths.each { path ->
            for(int i = 0; i < path.size(); i++) {
                if (multimap[path[i]] == null) {
                    multimap[path[i]] = [] as Set<String>
                }
                if (i > 1) {
                    multimap[path[i]] << path[i - 1]
                }
            }
        }
        multimap
    }

    /**
     * Get most preferred codes from list of retrieved values.
     * @param responseData
     * @return
     */
    private Object getRecommendedValue(Collection data) {
        //TODO decide on which value is the most recommended one
        data[0]
    }

    /**
     * Create OntologyMap object from external server response.
     * @param response
     * @param rootValue
     * @param label
     * @return
     */
    private OntologyMap mapResponseToOntologyMap(
            String code,
            String label = "",
            String categoryCode = null,
            String dataLabel = null,
            List<String> ancestors
            ) {
        new OntologyMap(
            categoryCode: categoryCode,
            dataLabel:    dataLabel,
            ontologyCode: code,
            label:        label,
            uri:          "$ontologyServerUrl$conceptCodeDetailsRequestPath/${code}",
            ancestors:    ancestors
        )
    }

}

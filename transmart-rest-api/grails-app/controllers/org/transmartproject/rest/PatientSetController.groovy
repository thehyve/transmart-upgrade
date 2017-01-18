package org.transmartproject.rest

import grails.rest.Link
import grails.rest.render.util.AbstractLinkingRenderer
import grails.web.mime.MimeType
import org.springframework.beans.factory.annotation.Autowired
import org.transmartproject.core.dataquery.Patient
import org.transmartproject.core.exceptions.InvalidRequestException
import org.transmartproject.core.querytool.QueriesResource
import org.transmartproject.core.querytool.QueryDefinition
import org.transmartproject.core.querytool.QueryDefinitionXmlConverter
import org.transmartproject.core.querytool.QueryResult
import org.transmartproject.core.querytool.QueryResultSummary
import org.transmartproject.rest.marshallers.QueryResultWrapper
import org.transmartproject.rest.marshallers.ContainerResponseWrapper
import org.transmartproject.rest.misc.CurrentUser
import static org.transmartproject.core.users.ProtectedOperation.WellKnownOperations.BUILD_COHORT
import static org.transmartproject.core.users.ProtectedOperation.WellKnownOperations.READ

/**
 * Exposes patient set resources.
 */
class PatientSetController {

    static responseFormats = ['json', 'hal']

    private final static String VERSION = 'v1'

    @Autowired
    private QueriesResource queriesResource

    @Autowired
    QueryDefinitionXmlConverter queryDefinitionXmlConverter

    @Autowired
    CurrentUser currentUser

    /**
     * Not yet supported in core-api.
     *
     * GET /v1/patient_sets
     */
    def index() {
        List result = queriesResource.getQueryResultsSummaryByUsername(currentUser.getUsername() )
        respond wrapQueryResultSummary(result)
    }

    /**
     * Show details of a patient set
     *
     * GET /v1/patient_sets/<result_instance_id>
     */
    def show(Long id) {
        QueryResult queryResult = queriesResource.getQueryResultFromId(id)

        currentUser.checkAccess(READ, queryResult)

        respond new QueryResultWrapper(
                apiVersion: '/v1',
                queryResult: queryResult,
                embedPatients: true
        )
    }

    /**
     * Create a new patient set.
     *
     * POST /v1/patient_sets
     */
    def save() {
        if (!request.contentType) {
            throw new InvalidRequestException('No content type provided')
        }
        MimeType mimeType = new MimeType(request.contentType)

        if (!(mimeType.name in [MimeType.XML.name, MimeType.TEXT_XML.name])) {
            throw new InvalidRequestException("Content type should been " +
                    "text/xml or application/xml; got $mimeType")
        }

        QueryDefinition queryDefinition =
                queryDefinitionXmlConverter.fromXml(request.reader)

        currentUser.checkAccess(BUILD_COHORT, queryDefinition)

        respond new QueryResultWrapper(
                apiVersion: 'v1',
                queryResult: queriesResource.runQuery(queryDefinition, currentUser.username),
                embedPatients: true
        ),
        [status: 201]
    }

    /**
     * Disable created patient set.
     *
     * POST /patient_sets/<result_instance_id>
     */
    def disable(Long id) {
        queriesResource.disablingQuery(id, currentUser.username)
        respond status: 204
    }

    private wrapQueryResultSummary(Object source) {
        new ContainerResponseWrapper
                (
                        container: source,
                        componentType: QueryResultSummary,
                        links: [ new Link(AbstractLinkingRenderer.RELATIONSHIP_SELF, "$VERSION/patient_sets") ]
                )
    }
}

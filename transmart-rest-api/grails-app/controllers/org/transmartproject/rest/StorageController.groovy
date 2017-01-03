package org.transmartproject.rest

import grails.rest.RestfulController
import grails.transaction.Transactional
import groovy.util.logging.Slf4j
import org.springframework.beans.factory.annotation.Autowired
import org.transmartproject.core.exceptions.AccessDeniedException
import org.transmartproject.core.ontology.StudiesResource
import org.transmartproject.core.users.UsersResource
import org.transmartproject.db.i2b2data.Study
import org.transmartproject.db.storage.LinkedFileCollection
import org.transmartproject.db.user.User
import org.transmartproject.rest.misc.CurrentUser

import javax.annotation.Resource

import static org.springframework.http.HttpStatus.CREATED
import static org.springframework.http.HttpStatus.OK
import static org.transmartproject.core.users.ProtectedOperation.WellKnownOperations.READ

/**
 * Created by piotrzakrzewski on 02/12/2016.
 */
@Slf4j
class StorageController extends RestfulController<LinkedFileCollection> {

    static responseFormats = ['json']

    @Autowired
    CurrentUser currentUser

    @Resource
    StudiesResource studiesResourceService

    @Autowired
    UsersResource usersResource

    StorageController() {
        super(LinkedFileCollection)
    }

    @Override
    def show() {
        def fileCollection = queryForResource(params.getLong('id'))
        if (fileCollection == null) {
            notFound()
            return
        }
        currentUser.checkAccess(READ, fileCollection.study)
        respond fileCollection
    }

    @Override
    @Transactional
    def save() {
        User user = (User) usersResource.getUserFromUsername(currentUser.username)
        if (!user.admin) {
            throw new AccessDeniedException("Creating new Linked File Collections " +
                    "is an admin action")
        }
        def fields = request.JSON as Map
        def studyId = fields['study'] as String
        def study = Study.findByStudyId(studyId)
        fields['study'] = null
        def instance  = createResource fields
        instance.study = study
        instance.validate()
        if (instance.hasErrors()) {
            transactionStatus.setRollbackOnly()
            respond instance.errors, view:'create' // STATUS CODE 422
            return
        }
        saveResource instance
        log.info "Linked file collection saved with id: ${instance.id}"
        respond instance, [status: CREATED, view:'show']
    }

    @Override
    def index() {
        User user = (User) usersResource.getUserFromUsername(currentUser.username)
        if (!user.admin) {
            throw new AccessDeniedException("Listing all Linked File Collections " +
                    "is an admin action")
        }
        log.info "Fetching linked file collections."
        def response = ['files': listAllResources(params)]
        respond response
    }

    def indexStudy(String studyId) {
        def study = Study.findByStudyId(studyId)
        currentUser.checkAccess(READ, study)
        def filesInStudy = LinkedFileCollection.findAllByStudy(study)
        def response = ['files': filesInStudy  ]
        respond response
    }

    @Override
    def delete() {
        User user = (User) usersResource.getUserFromUsername(currentUser.username)
        if (!user.admin) {
            throw new AccessDeniedException("Removing a linked file entry " +
                    "is an admin action")
        }
        super.delete()
    }

    @Override
    def update() {
        User user = (User) usersResource.getUserFromUsername(currentUser.username)
        if (!user.admin) {
            throw new AccessDeniedException("updating a linked file entry " +
                    "is an admin action")
        }
        def fields = request.JSON
        def studyId = fields['study'] as String
        def study = Study.findByStudyId(studyId)
        fields['study'] = study
        def instance = queryForResource(params.getLong('id'))
        if (instance == null) {
            transactionStatus.setRollbackOnly()
            notFound()
            return
        }
        instance.properties = fields

        if (instance.hasErrors()) {
            transactionStatus.setRollbackOnly()
            respond instance.errors, view:'edit' // STATUS CODE 422
            return
        }
        updateResource instance
        respond instance, [status: OK]
    }

}

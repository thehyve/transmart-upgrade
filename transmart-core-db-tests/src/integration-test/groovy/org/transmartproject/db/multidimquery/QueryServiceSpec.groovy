package org.transmartproject.db.multidimquery

import grails.test.mixin.integration.Integration
import grails.transaction.Rollback
import org.springframework.beans.factory.annotation.Autowired
import org.transmartproject.db.TestData
import org.transmartproject.db.TransmartSpecification
import org.transmartproject.db.i2b2data.Study
import org.transmartproject.db.multidimquery.query.*
import org.transmartproject.db.i2b2data.ConceptDimension
import org.transmartproject.db.i2b2data.ObservationFact
import org.transmartproject.db.user.AccessLevelTestData

import static org.transmartproject.db.dataquery.highdim.HighDimTestData.save

@Rollback
@Integration
class QueryServiceSpec extends TransmartSpecification {

    @Autowired
    QueryService queryService

    TestData testData
    AccessLevelTestData accessLevelTestData
    TestData hypercubeTestData

    void setupData() {
        testData = new TestData().createDefault()
        testData.mrnaData.patients = testData.i2b2Data.patients

        testData.i2b2Data.patients[0].age = 70
        testData.i2b2Data.patients[1].age = 31
        testData.i2b2Data.patients[2].age = 18
        accessLevelTestData = new AccessLevelTestData().createWithAlternativeConceptData(testData.conceptData)
        accessLevelTestData.i2b2Secures.each {
            if (it.secureObjectToken == 'EXP:PUBLIC') {
                it.secureObjectToken = Study.PUBLIC
            }
        }
        testData.saveAll()
        accessLevelTestData.saveAll()
    }

    void setupHypercubeData(){
        hypercubeTestData = TestData.createHypercubeDefault()
        hypercubeTestData.saveAll()

        accessLevelTestData = new AccessLevelTestData()
        save accessLevelTestData.accessLevels
        save accessLevelTestData.roles
        save accessLevelTestData.groups
        save accessLevelTestData.users
        accessLevelTestData.users[0].addToRoles(accessLevelTestData.roles.find { it.authority == 'ROLE_ADMIN' })
        accessLevelTestData.users[1].addToGroups(accessLevelTestData.groups.find { it.category == 'group_-201' })
    }

    Constraint createQueryForConcept(ObservationFact observationFact) {
        def conceptCode = observationFact.conceptCode
        def conceptDimension = ConceptDimension.find {
            conceptCode == conceptCode
        }
        new ConceptConstraint(path: conceptDimension.conceptPath)
    }

    ObservationFact createFactForExistingConcept() {
        def clinicalTestdata = testData.clinicalData
        def fact = clinicalTestdata.facts.find { it.valueType == 'N' }
        def conceptDimension = testData.conceptData.conceptDimensions.find { it.conceptCode == fact.conceptCode }
        def patientsWithConcept = clinicalTestdata.facts.collect {
            if (it.conceptCode == conceptDimension.conceptCode) {
                it.patient
            }
        }
        def patientDimension = clinicalTestdata.patients.find {
            !patientsWithConcept.contains(it)
        }

        ObservationFact observationFact = clinicalTestdata.createObservationFact(
                conceptDimension, patientDimension, clinicalTestdata.DUMMY_ENCOUNTER_ID, -1
        )

        observationFact
    }

    void "test query for all observations"() {
        setupData()

        TrueConstraint constraint = new TrueConstraint()

        when:
        def result = queryService.list(constraint, accessLevelTestData.users[0])

        then:
        result.size() == testData.clinicalData.facts.size()
    }

    void "test query for values > 1 and subject id 2"() {
        setupHypercubeData()

        Constraint constraint = ConstraintFactory.create([
                type    : 'Combination',
                operator: 'and',
                args    : [
                        [
                                type     : 'ValueConstraint',
                                valueType: 'NUMERIC',
                                operator : '>',
                                value    : 1
                        ],
                        [
                                type    : 'FieldConstraint',
                                field   : [dimension: 'PatientDimension', fieldName: 'sourcesystemCd'],
                                operator: 'contains',
                                value   : 'SUBJ_ID_2'
                        ]
                ]
        ])

        when:
        def observations = ObservationFact.findAll {
            modifierCd == '@'
            valueType == ObservationFact.TYPE_NUMBER
            numberValue > 1
            createAlias('patient', 'p')
            like('p.sourcesystemCd', '%SUBJ_ID_2%')
        }
        def result = queryService.list(constraint, accessLevelTestData.users[0])

        then:
        result.size() == observations.size()
        result[0].valueType == ObservationFact.TYPE_NUMBER
        result[0].numberValue > 1
        result[0].patient.sourcesystemCd.contains('SUBJ_ID_2')
    }

    void "test patient query and patient set creation"() {
        setupHypercubeData()

        Constraint constraint = ConstraintFactory.create([
                type    : 'Combination',
                operator: 'or',
                args    : [
                        [ type: 'ConceptConstraint', path: '\\foo\\concept 2\\' ],
                        [ type: 'ConceptConstraint', path: '\\foo\\concept 3\\' ]
                ]
        ])

        when: "I query for all observations and patients for a constraint"
        def observations = queryService.list(constraint, accessLevelTestData.users[0])
        def patients = queryService.listPatients(constraint, accessLevelTestData.users[0])

        then: "I get the expected number of observations and patients"
        observations.size() == 5
        patients.size() == 3

        then: "I set of patients matches the patients associated with the observations"
        observations*.patient.unique().sort() == patients.sort()

        when: "I build a patient set based on the constraint"
        def patientSet = queryService.createPatientSet("Test set", constraint, accessLevelTestData.users[0])

        then: "I get a patient set id"
        patientSet != null
        patientSet.id != null

        when: "I query for patients based on the patient set id"
        Constraint patientSetConstraint = ConstraintFactory.create(
                [ type: 'PatientSetConstraint', patientSetId: patientSet.id ]
        )
        def patients2 = queryService.listPatients(patientSetConstraint, accessLevelTestData.users[0])

        then: "I get the same set of patient as before"
        patients.sort() == patients2.sort()
    }

    void "test for max, min, average aggregate"() {
        setupData()

        ObservationFact observationFact = createFactForExistingConcept()
        observationFact.numberValue = 50
        testData.clinicalData.facts << observationFact

        testData.saveAll()
        def query = createQueryForConcept(observationFact)

        when:
        def result = queryService.aggregate(AggregateType.MAX, query, accessLevelTestData.users[0])

        then:
        result == 50

        when:
        result = queryService.aggregate(AggregateType.MIN, query, accessLevelTestData.users[0])

        then:
        result == 10

        when:
        result = queryService.aggregate(AggregateType.AVERAGE, query, accessLevelTestData.users[0])

        then:
        result == 30 //(10+50) / 2
    }

    void "test observation count and patient count"() {
        setupData()
        ObservationFact of1 = createFactForExistingConcept()
        of1.numberValue = 50
        testData.clinicalData.facts << of1
        testData.saveAll()
        def query = createQueryForConcept(of1)

        when:
        def count1 = queryService.count(query, accessLevelTestData.users[0])
        def patientCount1 = queryService.patientCount(query, accessLevelTestData.users[0])

        then:
        count1 == 2L
        patientCount1 == 2L

        when:
        ObservationFact of2 = createFactForExistingConcept()
        of2.numberValue = 51
        of2.patient = of1.patient
        testData.clinicalData.facts << of2
        testData.saveAll()
        def count2 = queryService.count(query, accessLevelTestData.users[0])
        def patientCount2 = queryService.patientCount(query, accessLevelTestData.users[0])

        then:
        count2 == count1 + 1
        patientCount2 == patientCount1
    }

    void "test for check if aggregate returns error when any numerical value is null"() {
        setupData()

        def observationFact = createFactForExistingConcept()

        observationFact.numberValue = null
        observationFact.textValue = 'E'
        observationFact.valueType = 'N'
        testData.clinicalData.facts << observationFact
        testData.saveAll()

        when:
        Constraint query = createQueryForConcept(observationFact)
        queryService.aggregate(AggregateType.MAX, query, accessLevelTestData.users[0])

        then:
        thrown(InvalidQueryException)

    }

    void "test for check if aggregate returns error when any textValue is other then E"() {
        setupData()

        def observationFact = createFactForExistingConcept()
        observationFact.textValue = 'GT'
        observationFact.numberValue = 60
        testData.clinicalData.facts << observationFact
        testData.saveAll()

        when:
        Constraint query = createQueryForConcept(observationFact)
        queryService.aggregate(AggregateType.MAX, query, accessLevelTestData.users[0])

        then:
        thrown(InvalidQueryException)
    }

    void "test correct conceptConstraint checker in aggregate function"() {
        setup:
        setupData()

        def user = accessLevelTestData.users[0]
        def fact = testData.clinicalData.facts.find { it.valueType == 'N' }
        def conceptDimension = testData.conceptData.conceptDimensions.find { it.conceptCode == fact.conceptCode }

        when:
        def constraint = new TrueConstraint()
        queryService.aggregate(AggregateType.MAX, constraint, user)

        then:
        thrown(InvalidQueryException)

        when:
        constraint = new Combination(
                operator: Operator.AND,
                args: [
                        new TrueConstraint(),
                        new ConceptConstraint(
                                path: conceptDimension.conceptPath
                        ),
                        new Combination(
                                operator: Operator.AND,
                                args: [
                                        new ConceptConstraint(
                                                path: conceptDimension.conceptPath
                                        ),
                                        new TrueConstraint()
                                ]
                        )
                ]
        )

        queryService.aggregate(AggregateType.MAX, constraint, user)

        then:
        thrown(InvalidQueryException)

        when:
        def firstConceptConstraint = constraint.args.find { it.class == ConceptConstraint }
        constraint.args = constraint.args - firstConceptConstraint
        def result = queryService.aggregate(AggregateType.MAX, constraint, user)

        then:
        result == 10

    }

}

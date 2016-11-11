package tests.rest.v2

import base.RESTSpec

import static org.hamcrest.Matchers.everyItem
import static org.hamcrest.Matchers.hasKey
import static spock.util.matcher.HamcrestSupport.that
import static tests.rest.v2.Operator.AFTER
import static tests.rest.v2.Operator.AND
import static tests.rest.v2.Operator.GREATER_THAN
import static tests.rest.v2.Operator.LESS_THAN
import static tests.rest.v2.ValueType.NUMERIC
import static tests.rest.v2.constraints.*

class ConstraintSpec extends RESTSpec{

    /**
     * TrueConstraint.class,
     BiomarkerConstraint.class,
     ModifierConstraint.class,
     FieldConstraint.class,
     ValueConstraint.class,
     TimeConstraint.class,
     PatientSetConstraint.class,
     Negation.class,
     Combination.class,
     TemporalConstraint.class,
     ConceptConstraint.class,
     StudyConstraint.class,
     NullConstraint.class
     */

    def "TrueConstraint.class"(){
        def constraintMap = [type: TrueConstraint]

        when:
        def responseData = get("query/observations", contentTypeForJSON, toQuery(constraintMap))

        then:
        that responseData, everyItem(hasKey('conceptCode'))
    }

    def "BiomarkerConstraint.class"(){

    }

    def "ModifierConstraint.class"(){

    }

    def "FieldConstraint.class"(){
        def constraintMap = [type: FieldConstraint,
                             field: [dimension: 'PatientDimension',
                                     fieldName: 'age',
                                     type: NUMERIC ],
                             operator: LESS_THAN,
                             value:100]
        when:
        def responseData = get("query/observations", contentTypeForJSON, toQuery(constraintMap))

        then:
        that responseData, everyItem(hasKey('conceptCode'))
    }

    def "ValueConstraint.class"(){
        def constraintMap = [type: ValueConstraint, valueType: NUMERIC, operator: GREATER_THAN, value:176]
        when:
        def responseData = get("query/observations", contentTypeForJSON, toQuery(constraintMap))

        then:
        that responseData, everyItem(hasKey('conceptCode'))
    }

    def "TimeConstraint.class"(){
        def date = toDateString("01-01-2016Z")
        def constraintMap = [type: TimeConstraint,
                             field: [dimension: 'StartTimeDimension', fieldName: 'startDate', type: 'DATE' ],
                             operator: AFTER,
                             values: [date]]
        when:
        def responseData = get("query/observations", contentTypeForJSON, toQuery(constraintMap))

        then:
        that responseData, everyItem(hasKey('conceptCode'))
    }

    def "PatientSetConstraint.class"(){
        def constraintMap = [type: PatientSetConstraint, patientSetId: 0, patientIds: -62]
        when:
        def responseData = get("query/observations", contentTypeForJSON, toQuery(constraintMap))

        then:
        that responseData, everyItem(hasKey('conceptCode'))
    }

    def "Negation.class"(){
        def constraintMap = [
                type: Negation,
                arg: [type: PatientSetConstraint, patientSetId: 0, patientIds: -62]
        ]
        when:
        def responseData = get("query/observations", contentTypeForJSON, toQuery(constraintMap))

        then:
        that responseData, everyItem(hasKey('conceptCode'))
    }

    def "Combination.class"(){
        def constraintMap = [
                type: Combination,
                operator: AND,
                args: [
                        [type: PatientSetConstraint, patientSetId: 0, patientIds: -62],
                        [type: ConceptConstraint, path: "\\Public Studies\\EHR\\Vital Signs\\Heart Rate\\"]
                ]
        ]
        when:
        def responseData = get("query/observations", contentTypeForJSON, toQuery(constraintMap))

        then:
        that responseData, everyItem(hasKey('conceptCode'))
    }

    def "TemporalConstraint.class"(){
        def constraintMap = [
                [type: TemporalConstraint,
                 operator: AFTER,
                 eventConstraint: [
                         type: ValueConstraint,
                         valueType: NUMERIC,
                         operator: LESS_THAN,
                         value: 60]
                ]
        ]
        when:
        def responseData = get("query/observations", contentTypeForJSON, toQuery(constraintMap))

        then:
        that responseData, everyItem(hasKey('conceptCode'))
    }

    def "ConceptConstraint.class"(){
        def constraintMap = [type: ConceptConstraint, path: "\\Public Studies\\EHR\\Vital Signs\\Heart Rate\\"]
        when:
        def responseData = get("query/observations", contentTypeForJSON, toQuery(constraintMap))

        then:
        that responseData, everyItem(hasKey('conceptCode'))
    }

    def "StudyConstraint.class"(){
        def constraintMap = [type: StudyConstraint, studyId: "EHR"]
        when:
        def responseData = get("query/observations", contentTypeForJSON, toQuery(constraintMap))

        then:
        that responseData, everyItem(hasKey('conceptCode'))
    }

    def "NullConstraint.class"(){
        def constraintMap = [type: TrueConstraint]

        when:
        def responseData = get("query/observations", contentTypeForJSON, toQuery(constraintMap))

        then:
        that responseData, everyItem(hasKey('conceptCode'))
    }

}
package tests.rest.v2.json

import base.RESTSpec
import groovy.json.JsonBuilder
import selectors.protobuf.ObservationSelectorJson
import spock.lang.IgnoreIf
import spock.lang.Requires

import static config.Config.*
import static org.hamcrest.Matchers.is
import static spock.util.matcher.HamcrestSupport.that
import static tests.rest.v2.Operator.*
import static tests.rest.v2.ValueType.*
import static tests.rest.v2.constraints.*

class HighDimSpec extends RESTSpec {

    //see CLINICAL_TRIAL_HIGHDIM, EHR_HIGHDIM and TUMOR_NORMAL_SAMPLES studies at the transmart-data/test_data/studies folder

    def "example call that shows all supported parameters"() {
        // any of supported constraints (but biomarker constraint) and their combinations.
        def assayConstraint = [
                type: ConceptConstraint,
                path: "\\Public Studies\\CLINICAL_TRIAL_HIGHDIM\\High Dimensional data\\Expression Lung\\"
        ]
        // see transmart-core-api/src/main/groovy/org/transmartproject/core/dataquery/highdim/dataconstraints/DataConstraint.groovy
        def biomarkerConstraint = [
                type: BiomarkerConstraint,
                biomarkerType: 'genes',
                params: [
                        names: ['TP53']
                ]
        ]
        // see transmart-core-api/src/main/groovy/org/transmartproject/core/dataquery/highdim/projections/Projection.groovy
        def projection = 'all_data'

        when:
        def responseData = get(PATH_HIGH_DIM, contentTypeForJSON, [
                assay_constraint: new JsonBuilder(assayConstraint),
                biomarker_constraint: new JsonBuilder(biomarkerConstraint),
                projection: projection
        ])

        then:
        def biomarkers = 2
        def assays = 6
        def projections = 10
        assert responseData.cells.size() == biomarkers * assays * projections
    }

    /**
     *      given: "study CLINICAL_TRIAL_HIGHDIM is loaded"
     *      when: "I get highdim for this study"
     *      then: "BioMarker, Assay and Projection are encluded in the responce"
     */
    def "highdim contains BioMarker, Assay and Projection"(){
        def assayConstraint = [
                type: ConceptConstraint,
                path: "\\Public Studies\\CLINICAL_TRIAL_HIGHDIM\\High Dimensional data\\Expression Lung\\"
        ]
        def biomarkerConstraint = [
                type: BiomarkerConstraint,
                biomarkerType: 'genes',
                params: [
                        names: ['TP53']
                ]
        ]
        def projection = 'all_data'

        when:
        def responseData = get(PATH_HIGH_DIM, contentTypeForJSON, [
                assay_constraint: new JsonBuilder(assayConstraint),
                biomarker_constraint: new JsonBuilder(biomarkerConstraint),
                projection: projection
        ])
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        then:
        selector.cellCount == 120
        (0..<selector.cellCount).each {

            assert ['117_at', '1007_s_at'].contains(selector.select(it, 'BioMarkerDimension', 'label', 'String'))
            assert selector.select(it, 'BioMarkerDimension', 'bioMarker', 'String') == 'null'

            assert [-6001,-6002,-6004,-6006,-6007,-6008].contains(selector.select(it, 'AssayDimension', 'assay', 'Int'))
            assert ['sample1', 'sample2', 'sample4', 'sample6', 'sample7', 'sample8'].contains(selector.select(it, 'AssayDimension', 'label', 'String'))

            assert ['probeName', 'trialName', 'logIntensity', 'organism', 'geneId', 'probeId', 'rawIntensity', 'assayId', 'zscore', 'geneSymbol'].contains(selector.select(it, 'ProjectionDimension'))
        }
    }

    /**
     *  given: "study CLINICAL_TRIAL_HIGHDIM is loaded"
     *  when: "I get highdim for Expression Breast"
     *  then: "only data for Expression Breast is returned"
     */
    def "highdim by ConceptConstraint"(){
        def assayConstraint = [
                type: ConceptConstraint,
                path: "\\Public Studies\\CLINICAL_TRIAL_HIGHDIM\\High Dimensional data\\Expression Breast\\"
        ]

        when:
        def responseData = get(PATH_HIGH_DIM, contentTypeForJSON, [
                assay_constraint: new JsonBuilder(assayConstraint),
        ])
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        then:
        selector.cellCount == 90
        (0..<selector.cellCount).each {

            assert ['117_at', '1007_s_at', '1053_at', '1053_s_at'].contains(selector.select(it, 'BioMarkerDimension', 'label', 'String'))
            assert selector.select(it, 'BioMarkerDimension', 'bioMarker', 'String') == 'null'

            assert [-6003,-6005,-6009].contains(selector.select(it, 'AssayDimension', 'assay', 'Int'))
            assert ['sample3', 'sample5', 'sample9'].contains(selector.select(it, 'AssayDimension', 'label', 'String'))

            assert ['probeName', 'trialName', 'logIntensity', 'organism', 'geneId', 'probeId', 'rawIntensity', 'assayId', 'zscore', 'geneSymbol'].contains(selector.select(it, 'ProjectionDimension'))
        }
    }


    /**
     *  given: "study CLINICAL_TRIAL_HIGHDIM is loaded"
     *  when: "I get highdim for an imposable assayConstraint"
     *  then: "an empty message is returned"
     */
    def "empty highdim"(){
        def assayConstraint = [
                type: Combination,
                operator: AND,
                args: [
                        [type: FieldConstraint,
                         field: [dimension: 'PatientDimension', fieldName: 'age', type: NUMERIC ],
                         operator: EQUALS, value:20],
                        [type: FieldConstraint,
                         field: [dimension: 'PatientDimension', fieldName: 'age', type: NUMERIC ],
                         operator: EQUALS, value:30]
                ]
        ]

        when:
        def responseData = get(PATH_HIGH_DIM, contentTypeForJSON, [
                assay_constraint: new JsonBuilder(assayConstraint),
        ])

        then:
        assert responseData == [:]
    }

    /**
     *  given: "study CLINICAL_TRIAL_HIGHDIM is loaded"
     *  when: "I get highdim for different projections"
     *  then: "different fields are returned"
     */
    def "highdim projections"() {
        def assayConstraint = [
                type: ConceptConstraint,
                path: "\\Public Studies\\CLINICAL_TRIAL_HIGHDIM\\High Dimensional data\\Expression Lung\\"
        ]
        def projection1 = 'zscore'
        def projection2 = 'log_intensity'

        when:
        def responseData1 = get(PATH_HIGH_DIM, contentTypeForJSON, [
                assay_constraint: new JsonBuilder(assayConstraint),
                projection      : projection1
        ])
        def responseData2 = get(PATH_HIGH_DIM, contentTypeForJSON, [
                assay_constraint: new JsonBuilder(assayConstraint),
                projection      : projection2
        ])
        ObservationSelectorJson selector1 = new ObservationSelectorJson(parseHypercube(responseData1))
        ObservationSelectorJson selector2 = new ObservationSelectorJson(parseHypercube(responseData2))

        then:
        selector1.cellCount == 18
        selector2.cellCount == 18

        def values1 = []
        def values2 = []
        (0..<selector1.cellCount).each {

            values1.add(selector1.select(it))
            values2.add(selector2.select(it))
        }
        values1.forEach{
            assert !values2.contains(it)
        }
    }

    /**
     *  given: "study CLINICAL_TRIAL_HIGHDIM is loaded"
     *  when: "I get highdim for logIntensity projections"
     *  then: "logIntensity is returned"
     */
    @IgnoreIf({SUPPRESS_KNOWN_BUGS}) //FIXME: TMPDEV-154 inconsistent use of projections
    def "highdim projection"(){
        def assayConstraint = [
                type: ConceptConstraint,
                path: "\\Public Studies\\CLINICAL_TRIAL_HIGHDIM\\High Dimensional data\\Expression Lung\\"
        ]
        def biomarkerConstraint = [
                type: BiomarkerConstraint,
                biomarkerType: 'genes',
                params: [
                        names: ['TP53']
                ]
        ]
        def projection = 'logIntensity'

        when:
        def responseData = get(PATH_HIGH_DIM, contentTypeForJSON, [
                assay_constraint: new JsonBuilder(assayConstraint),
                biomarker_constraint: new JsonBuilder(biomarkerConstraint),
                projection: projection
        ])
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        then:
        assert selector.cellCount == 18
    }

    /**
     *  given: "study EHR_HIGHDIM is loaded"
     *  when: "I get highdim for EHR_HIGHDIM after 01-04-2016Z"
     *  then: "only data for Expression Breast is returned"
     */
    @Requires({EHR_HIGHDIM_LOADED})
    def "highdim by timeConstraint"(){
        def date = toDateString("01-04-2016Z")
        def assayConstraint = [
                type: Combination,
                operator: AND,
                args: [
                        [type: StudyNameConstraint, studyId: EHR_HIGHDIM_ID],
                        [type: TimeConstraint,
                         field: [dimension: 'StartTimeDimension', fieldName: 'startDate', type: DATE ],
                         operator: AFTER,
                         values: [date]]
                ]
        ]
        when:
        def responseData = get(PATH_HIGH_DIM, contentTypeForJSON, [
                assay_constraint: new JsonBuilder(assayConstraint),
        ])
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        then:
        selector.cellCount == 60
        (0..<selector.cellCount).each {

            assert ['117_at', '1007_s_at', '1053_at', '1053_s_at'].contains(selector.select(it, 'BioMarkerDimension', 'label', 'String'))
            assert selector.select(it, 'BioMarkerDimension', 'bioMarker', 'String') == 'null'

            assert [-6016,-6017,-6018, -6019].contains(selector.select(it, 'AssayDimension', 'assay', 'Int'))
            assert ['sample6', 'sample7', 'sample8', 'sample9'].contains(selector.select(it, 'AssayDimension', 'label', 'String'))

            assert ['probeName', 'trialName', 'logIntensity', 'organism', 'geneId', 'probeId', 'rawIntensity', 'assayId', 'zscore', 'geneSymbol'].contains(selector.select(it, 'ProjectionDimension'))
        }
    }

    /**
     *  given: "study TUMOR_NORMAL_SAMPLES is loaded"
     *  when: "I get highdim for TUMOR_NORMAL_SAMPLES with modifier Normal"
     *  then: "only data for modifier Normal is returned"
     */
    @Requires({TUMOR_NORMAL_SAMPLES_LOADED})
    def "highdim by modifier"(){
        def assayConstraint = [type: ModifierConstraint, path:"\\Public Studies\\TUMOR_NORMAL_SAMPLES\\Sample Type\\",
                               values: [type: ValueConstraint, valueType: STRING, operator: EQUALS, value: "Normal"]]

        when:
        def responseData = get(PATH_HIGH_DIM, contentTypeForJSON, [
                assay_constraint: new JsonBuilder(assayConstraint),
        ])
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        then:
        selector.cellCount == 120
        (0..<selector.cellCount).each {

            assert ['117_at', '1007_s_at', '1053_at', '1053_s_at'].contains(selector.select(it, 'BioMarkerDimension', 'label', 'String'))
            assert selector.select(it, 'BioMarkerDimension', 'bioMarker', 'String') == 'null'

            assert [-631,-637,-638, -639].contains(selector.select(it, 'AssayDimension', 'assay', 'Int'))
            assert ['sample1', 'sample7', 'sample8', 'sample9'].contains(selector.select(it, 'AssayDimension', 'label', 'String'))

            assert ['probeName', 'trialName', 'logIntensity', 'organism', 'geneId', 'probeId', 'rawIntensity', 'assayId', 'zscore', 'geneSymbol'].contains(selector.select(it, 'ProjectionDimension'))
        }
    }

    /**
     *  given: "study TUMOR_NORMAL_SAMPLES is loaded"
     *  when: "I get highdim for an invalid assay_constraint"
     *  then: "an error is returned"
     */
    @Requires({TUMOR_NORMAL_SAMPLES_LOADED})
    def "highdim by invalid assay"(){
        def assayConstraint = [type: 'invalidConstraint']

        when:
        def responseData = get(PATH_HIGH_DIM, contentTypeForJSON, [
                assay_constraint: new JsonBuilder(assayConstraint),
        ])

        then:
        that responseData.httpStatus, is(400)
        that responseData.type, is('InvalidArgumentsException')
        that responseData.message, is('Constraint not supported: invalidConstraint.')
    }

    /**
     *  given: "study TUMOR_NORMAL_SAMPLES is loaded"
     *  when: "I get highdim for TUMOR_NORMAL_SAMPLES with modifier Normal"
     *  then: "only data for modifier Normal is returned"
     */
    @Requires({EHR_HIGHDIM_LOADED})
    @IgnoreIf({SUPPRESS_KNOWN_BUGS}) //FIXME: TMPDEV-166 getting high dim by non highdim conceptConstraint returns 500 error
    def "highdim by non-highdim concept"(){
        def assayConstraint = [type: ConceptConstraint, path: "\\Public Studies\\EHR\\Vital Signs\\Heart Rate\\"]

        when:
        def responseData = get(PATH_HIGH_DIM, contentTypeForJSON, [
                assay_constraint: new JsonBuilder(assayConstraint),
        ])

        then:
        responseData == []
    }
}

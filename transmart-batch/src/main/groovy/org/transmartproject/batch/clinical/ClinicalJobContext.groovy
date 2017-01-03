package org.transmartproject.batch.clinical

import org.transmartproject.batch.clinical.facts.WordMapping
import org.transmartproject.batch.clinical.variable.ClinicalVariable
import org.transmartproject.batch.concept.ConceptTree
import org.transmartproject.batch.clinical.ontology.OntologyMapping
import org.transmartproject.batch.patient.PatientSet

/**
 *
 */
interface ClinicalJobContext {

    List<ClinicalVariable> getVariables()

    OntologyMapping getOntologyMapping()

    List<WordMapping> getWordMappings()

    ConceptTree getConceptTree()

    PatientSet getPatientSet()

}


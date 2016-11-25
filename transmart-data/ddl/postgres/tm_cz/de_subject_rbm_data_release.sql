--
-- Name: de_subject_rbm_data_release; Type: TABLE; Schema: tm_cz; Owner: -
--
CREATE TABLE de_subject_rbm_data_release (
    trial_name character varying(15),
    antigen_name character varying(100),
    n_value bigint,
    patient_id bigint,
    gene_symbol character varying(100),
    gene_id integer,
    assay_id bigint,
    normalized_value double precision,
    concept_cd character varying(100),
    timepoint character varying(100),
    data_uid character varying(100),
    value bigint,
    log_intensity double precision,
    mean_intensity double precision,
    stddev_intensity double precision,
    median_intensity double precision,
    zscore double precision,
    rbm_panel character varying(50),
    release_study character varying(15)
);


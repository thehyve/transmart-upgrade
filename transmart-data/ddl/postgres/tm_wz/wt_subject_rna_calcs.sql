--
-- Name: wt_subject_rna_calcs; Type: TABLE; Schema: tm_wz; Owner: -
--
CREATE TABLE wt_subject_rna_calcs (
    trial_name character varying(50),
    probeset_id character varying(200),
    mean_intensity double precision,
    median_intensity double precision,
    stddev_intensity double precision
);

--
-- Name: wt_subject_rna_calcs_i1; Type: INDEX; Schema: tm_wz; Owner: -
--
CREATE INDEX wt_subject_rna_calcs_i1 ON wt_subject_rna_calcs USING btree (trial_name, probeset_id);


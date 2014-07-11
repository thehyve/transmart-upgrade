--
-- Type: VIEW; Owner: BIOMART; Name: CTD_TD_DESIGN_VIEW
--
  CREATE OR REPLACE FORCE VIEW "BIOMART"."CTD_TD_DESIGN_VIEW" ("ID", "REF_ARTICLE_PROTOCOL_ID", "NATURE_OF_TRIAL", "RANDOMIZATION", "BLINDED_TRIAL", "TRIAL_TYPE", "RUN_IN_PERIOD", "TREATMENT_PERIOD", "WASHOUT_PERIOD", "OPEN_LABEL_EXTENSION") AS 
  select rownum as ID, v."REF_ARTICLE_PROTOCOL_ID",v."NATURE_OF_TRIAL",v."RANDOMIZATION",v."BLINDED_TRIAL",v."TRIAL_TYPE",v."RUN_IN_PERIOD",v."TREATMENT_PERIOD",v."WASHOUT_PERIOD",v."OPEN_LABEL_EXTENSION"
 from (
 select distinct REF_ARTICLE_PROTOCOL_ID,
       NATURE_OF_TRIAL,
       RANDOMIZATION,
       BLINDED_TRIAL,
       TRIAL_TYPE,
       RUN_IN_PERIOD,
       TREATMENT_PERIOD,
       WASHOUT_PERIOD,
       OPEN_LABEL_EXTENSION
 from ctd_full
 where TRIAL_TYPE is not null or NATURE_OF_TRIAL is not null
 order by REF_ARTICLE_PROTOCOL_ID, NATURE_OF_TRIAL, TRIAL_TYPE
 ) v





;
 

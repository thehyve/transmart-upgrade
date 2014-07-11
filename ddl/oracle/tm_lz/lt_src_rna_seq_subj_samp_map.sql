--
-- Type: TABLE; Owner: TM_LZ; Name: LT_SRC_RNA_SEQ_SUBJ_SAMP_MAP
--
 CREATE TABLE "TM_LZ"."LT_SRC_RNA_SEQ_SUBJ_SAMP_MAP" 
  (	"TRIAL_NAME" VARCHAR2(100 BYTE), 
"SITE_ID" VARCHAR2(100 BYTE), 
"SUBJECT_ID" VARCHAR2(100 BYTE), 
"SAMPLE_CD" VARCHAR2(100 BYTE), 
"PLATFORM" VARCHAR2(100 BYTE), 
"TISSUE_TYPE" VARCHAR2(100 BYTE), 
"ATTRIBUTE_1" VARCHAR2(256 BYTE), 
"ATTRIBUTE_2" VARCHAR2(200 BYTE), 
"CATEGORY_CD" VARCHAR2(200 BYTE), 
"SOURCE_CD" VARCHAR2(200 BYTE)
  ) SEGMENT CREATION IMMEDIATE
 TABLESPACE "TRANSMART" ;


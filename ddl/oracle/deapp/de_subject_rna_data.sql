--
-- Type: TABLE; Owner: DEAPP; Name: DE_SUBJECT_RNA_DATA
--
 CREATE TABLE "DEAPP"."DE_SUBJECT_RNA_DATA" 
  (	"TRIAL_SOURCE" VARCHAR2(200 BYTE), 
"TRIAL_NAME" VARCHAR2(50 BYTE), 
"PROBESET_ID" VARCHAR2(200 BYTE), 
"ASSAY_ID" NUMBER(18,0), 
"PATIENT_ID" NUMBER(18,0), 
"RAW_INTENSITY" NUMBER(18,4), 
"LOG_INTENSITY" NUMBER(18,4), 
"ZSCORE" NUMBER(18,4)
  ) SEGMENT CREATION IMMEDIATE
 TABLESPACE "DEAPP" ;

--
-- Type: INDEX; Owner: DEAPP; Name: IDX_DE_RNA_DATA_2
--
CREATE INDEX "DEAPP"."IDX_DE_RNA_DATA_2" ON "DEAPP"."DE_SUBJECT_RNA_DATA" ("ASSAY_ID", "PROBESET_ID")
TABLESPACE "DEAPP" ;

--
-- Type: INDEX; Owner: DEAPP; Name: IDX_DE_RNA_DATA_1
--
CREATE INDEX "DEAPP"."IDX_DE_RNA_DATA_1" ON "DEAPP"."DE_SUBJECT_RNA_DATA" ("TRIAL_NAME", "ASSAY_ID", "PROBESET_ID")
TABLESPACE "DEAPP" ;


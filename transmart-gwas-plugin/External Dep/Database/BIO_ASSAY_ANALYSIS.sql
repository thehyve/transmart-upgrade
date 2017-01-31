--------------------------------------------------------
--  File created - Thursday-October-25-2012   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for Table BIO_ASSAY_ANALYSIS
--------------------------------------------------------

  CREATE TABLE "BIOMART"."BIO_ASSAY_ANALYSIS" 
   (	"ANALYSIS_NAME" NVARCHAR2(500), 
	"SHORT_DESCRIPTION" NVARCHAR2(1000), 
	"ANALYSIS_CREATE_DATE" DATE, 
	"ANALYST_ID" NVARCHAR2(510), 
	"BIO_ASSAY_ANALYSIS_ID" NUMBER(18,0), 
	"ANALYSIS_VERSION" NVARCHAR2(200), 
	"FOLD_CHANGE_CUTOFF" NUMBER(9,2), 
	"PVALUE_CUTOFF" NUMBER(9,2), 
	"RVALUE_CUTOFF" NUMBER(9,2), 
	"BIO_ASY_ANALYSIS_PLTFM_ID" NUMBER(18,0), 
	"BIO_SOURCE_IMPORT_ID" NUMBER(18,0), 
	"ANALYSIS_TYPE" NVARCHAR2(200), 
	"ANALYST_NAME" VARCHAR2(250 BYTE), 
	"ANALYSIS_METHOD_CD" VARCHAR2(50 BYTE), 
	"BIO_ASSAY_DATA_TYPE" VARCHAR2(50 BYTE), 
	"ETL_ID" VARCHAR2(100 BYTE), 
	"LONG_DESCRIPTION" VARCHAR2(4000 BYTE), 
	"QA_CRITERIA" VARCHAR2(4000 BYTE), 
	"DATA_COUNT" NUMBER(18,0), 
	"TEA_DATA_COUNT" NUMBER(18,0), 
	"ETL_ID_SOURCE" NUMBER(18,0)
   ) SEGMENT CREATION IMMEDIATE 
  PCTFREE 0 PCTUSED 40 INITRANS 1 MAXTRANS 255 NOCOMPRESS NOLOGGING
  STORAGE(INITIAL 196608 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1 BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "BIOMART" ;
--------------------------------------------------------
--  DDL for Index BIO_ASSAY_ANALYSIS_PK
--------------------------------------------------------

  CREATE UNIQUE INDEX "BIOMART"."BIO_ASSAY_ANALYSIS_PK" ON "BIOMART"."BIO_ASSAY_ANALYSIS" ("BIO_ASSAY_ANALYSIS_ID") 
  PCTFREE 10 INITRANS 2 MAXTRANS 255 NOLOGGING COMPUTE STATISTICS 
  STORAGE(INITIAL 393216 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1 BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "INDX" 
  PARALLEL 3 ;
--------------------------------------------------------
--  Constraints for Table BIO_ASSAY_ANALYSIS
--------------------------------------------------------

  ALTER TABLE "BIOMART"."BIO_ASSAY_ANALYSIS" ADD CONSTRAINT "BIO_DATA_ANL_PK" PRIMARY KEY ("BIO_ASSAY_ANALYSIS_ID")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 NOLOGGING COMPUTE STATISTICS 
  STORAGE(INITIAL 393216 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1 BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "INDX"  ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table BIO_ASSAY_ANALYSIS
--------------------------------------------------------

  ALTER TABLE "BIOMART"."BIO_ASSAY_ANALYSIS" ADD CONSTRAINT "BIO_ASSAY_ANS_PLTFM_FK" FOREIGN KEY ("BIO_ASY_ANALYSIS_PLTFM_ID")
	  REFERENCES "BIOMART"."BIO_ASY_ANALYSIS_PLTFM" ("BIO_ASY_ANALYSIS_PLTFM_ID") ENABLE;
--------------------------------------------------------
--  DDL for Trigger TRG_BIO_ASSAY_ANALYSIS_ID
--------------------------------------------------------

  CREATE OR REPLACE TRIGGER "BIOMART"."TRG_BIO_ASSAY_ANALYSIS_ID" before insert on "BIO_ASSAY_ANALYSIS"    for each row begin     if inserting then       if :NEW."BIO_ASSAY_ANALYSIS_ID" is null then          select SEQ_BIO_DATA_ID.nextval into :NEW."BIO_ASSAY_ANALYSIS_ID" from dual;       end if;    end if; end;














/
ALTER TRIGGER "BIOMART"."TRG_BIO_ASSAY_ANALYSIS_ID" ENABLE;

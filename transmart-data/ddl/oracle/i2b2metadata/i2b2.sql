--
-- Type: TABLE; Owner: I2B2METADATA; Name: I2B2
--
 CREATE TABLE "I2B2METADATA"."I2B2" 
  (	"C_HLEVEL" NUMBER(22,0) NOT NULL ENABLE, 
"C_FULLNAME" VARCHAR2(700 BYTE) NOT NULL ENABLE, 
"C_NAME" VARCHAR2(2000 BYTE) NOT NULL ENABLE, 
"C_SYNONYM_CD" CHAR(1 BYTE) NOT NULL ENABLE, 
"C_VISUALATTRIBUTES" CHAR(3 BYTE) NOT NULL ENABLE, 
"C_TOTALNUM" NUMBER(22,0), 
"C_BASECODE" VARCHAR2(50 BYTE), 
"C_METADATAXML" CLOB, 
"C_FACTTABLECOLUMN" VARCHAR2(50 BYTE) NOT NULL ENABLE, 
"C_TABLENAME" VARCHAR2(150 BYTE) NOT NULL ENABLE, 
"C_COLUMNNAME" VARCHAR2(50 BYTE) NOT NULL ENABLE, 
"C_COLUMNDATATYPE" VARCHAR2(50 BYTE) NOT NULL ENABLE, 
"C_OPERATOR" VARCHAR2(10 BYTE) NOT NULL ENABLE, 
"C_DIMCODE" VARCHAR2(700 BYTE) NOT NULL ENABLE, 
"C_COMMENT" CLOB, 
"C_TOOLTIP" VARCHAR2(900 BYTE), 
"M_APPLIED_PATH" VARCHAR2(700 BYTE) DEFAULT ('@') NOT NULL ENABLE, 
"UPDATE_DATE" TIMESTAMP (6) NOT NULL ENABLE, 
"DOWNLOAD_DATE" TIMESTAMP (6), 
"IMPORT_DATE" TIMESTAMP (6), 
"SOURCESYSTEM_CD" VARCHAR2(50 BYTE), 
"VALUETYPE_CD" VARCHAR2(50 BYTE), 
"M_EXCLUSION_CD" VARCHAR2(25 BYTE), 
"C_PATH" VARCHAR2(700 BYTE), 
"C_SYMBOL" VARCHAR2(50 BYTE), 
"I2B2_ID" NUMBER(22,0)
  ) SEGMENT CREATION IMMEDIATE
 TABLESPACE "TRANSMART" 
LOB ("C_METADATAXML") STORE AS BASICFILE (
 TABLESPACE "TRANSMART" ENABLE STORAGE IN ROW CHUNK 8192 PCTVERSION 10
 NOCACHE NOLOGGING ) 
LOB ("C_COMMENT") STORE AS BASICFILE (
 TABLESPACE "TRANSMART" ENABLE STORAGE IN ROW CHUNK 8192 PCTVERSION 10
 NOCACHE NOLOGGING ) ;
--
-- Type: INDEX; Owner: I2B2METADATA; Name: I2B2_INDX1
--
CREATE INDEX "I2B2METADATA"."I2B2_INDX1" ON "I2B2METADATA"."I2B2" ("C_FULLNAME")
TABLESPACE "TRANSMART" ;

--
-- Type: INDEX; Owner: I2B2METADATA; Name: I2B2_INDX2
--
CREATE INDEX "I2B2METADATA"."I2B2_INDX2" ON "I2B2METADATA"."I2B2" ("C_BASECODE")
TABLESPACE "TRANSMART" ;

--
-- Type: SEQUENCE; Owner: I2B2METADATA; Name: I2B2_ID_SEQ
--
CREATE SEQUENCE  "I2B2METADATA"."I2B2_ID_SEQ"  MINVALUE 1 MAXVALUE 999999999999999999999999999 INCREMENT BY 1 START WITH 496244 CACHE 20 NOORDER  NOCYCLE ;

--
-- Type: TRIGGER; Owner: I2B2METADATA; Name: TRG_I2B2_ID
--
  CREATE OR REPLACE TRIGGER "I2B2METADATA"."TRG_I2B2_ID" 
before insert on "I2B2"    
for each row begin     
  if inserting then       
    if :NEW."I2B2_ID" is null then          
      select I2B2_ID_SEQ.nextval into :NEW."I2B2_ID" from dual;       
    end if;    
  end if; 
end;

/
ALTER TRIGGER "I2B2METADATA"."TRG_I2B2_ID" ENABLE;
 
--
-- Type: INDEX; Owner: I2B2METADATA; Name: IDX_I2B2_FULLNAME_BASECODE
--
CREATE INDEX "I2B2METADATA"."IDX_I2B2_FULLNAME_BASECODE" ON "I2B2METADATA"."I2B2" ("C_FULLNAME", "C_BASECODE")
TABLESPACE "TRANSMART" ;

--
-- Type: INDEX; Owner: I2B2METADATA; Name: META_APPLIED_PATH_I2B2_IDX
--
CREATE INDEX "I2B2METADATA"."META_APPLIED_PATH_I2B2_IDX" ON "I2B2METADATA"."I2B2" ("M_APPLIED_PATH")
TABLESPACE "TRANSMART" ;

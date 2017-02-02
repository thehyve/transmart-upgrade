--
-- Type: TABLE; Owner: I2B2DEMODATA; Name: QT_QUERY_MASTER
--
 CREATE TABLE "I2B2DEMODATA"."QT_QUERY_MASTER" 
  (	"QUERY_MASTER_ID" NUMBER(5,0) NOT NULL ENABLE, 
"NAME" VARCHAR2(250 BYTE) NOT NULL ENABLE, 
"USER_ID" VARCHAR2(50 BYTE) NOT NULL ENABLE, 
"GROUP_ID" VARCHAR2(50 BYTE) NOT NULL ENABLE, 
"CREATE_DATE" DATE NOT NULL ENABLE, 
"DELETE_DATE" DATE, 
"REQUEST_XML" CLOB, 
"DELETE_FLAG" VARCHAR2(3 BYTE), 
"GENERATED_SQL" CLOB, 
"I2B2_REQUEST_XML" CLOB, 
"MASTER_TYPE_CD" VARCHAR2(2000 BYTE), 
"PLUGIN_ID" NUMBER(10,0), 
 PRIMARY KEY ("QUERY_MASTER_ID")
 USING INDEX
 TABLESPACE "TRANSMART"  ENABLE
  ) SEGMENT CREATION IMMEDIATE
 TABLESPACE "TRANSMART" 
LOB ("REQUEST_XML") STORE AS BASICFILE (
 TABLESPACE "TRANSMART" ENABLE STORAGE IN ROW CHUNK 8192 PCTVERSION 10
 NOCACHE LOGGING ) 
LOB ("GENERATED_SQL") STORE AS BASICFILE (
 TABLESPACE "TRANSMART" ENABLE STORAGE IN ROW CHUNK 8192 PCTVERSION 10
 NOCACHE LOGGING ) 
LOB ("I2B2_REQUEST_XML") STORE AS BASICFILE (
 TABLESPACE "TRANSMART" ENABLE STORAGE IN ROW CHUNK 8192 RETENTION 
 NOCACHE LOGGING ) ;

--
-- Type: INDEX; Owner: I2B2DEMODATA; Name: QT_IDX_QM_UGID
--
CREATE INDEX "I2B2DEMODATA"."QT_IDX_QM_UGID" ON "I2B2DEMODATA"."QT_QUERY_MASTER" ("USER_ID", "GROUP_ID", "MASTER_TYPE_CD")
TABLESPACE "TRANSMART" ;

--
-- Type: SEQUENCE; Owner: I2B2DEMODATA; Name: QT_SQ_QM_QMID
--
CREATE SEQUENCE  "I2B2DEMODATA"."QT_SQ_QM_QMID"  MINVALUE 1 MAXVALUE 999999999999999999999999999 INCREMENT BY 1 START WITH 28756 CACHE 20 NOORDER  NOCYCLE ;

--
-- Type: TRIGGER; Owner: I2B2DEMODATA; Name: TRG_QT_QM_QM_ID
--
  CREATE OR REPLACE TRIGGER "I2B2DEMODATA"."TRG_QT_QM_QM_ID" 
   before insert on "I2B2DEMODATA"."QT_QUERY_MASTER" 
   for each row 
begin  
   if inserting then 
      if :NEW."QUERY_MASTER_ID" is null then 
         select QT_SQ_QM_QMID.nextval into :NEW."QUERY_MASTER_ID" from dual; 
      end if; 
   end if; 
end;
/
ALTER TRIGGER "I2B2DEMODATA"."TRG_QT_QM_QM_ID" ENABLE;
 
--
-- add documentation
--
COMMENT ON TABLE i2b2demodata.qt_query_master IS 'This master table to the holds the client’s anaysis request information. i.e.
the user_id, analysis definition , the i2b2 request_xml, etc.. ';
--
-- Type: TABLE; Owner: BIOMART; Name: CTD_PRIMARY_ENDPTS
--
 CREATE TABLE "BIOMART"."CTD_PRIMARY_ENDPTS" 
  (	"CTD_STUDY_ID" NUMBER, 
"PRIMARY_TYPE" VARCHAR2(4000 BYTE), 
"PRIMARY_TYPE_DEFINITION" VARCHAR2(4000 BYTE), 
"PRIMARY_TYPE_TIME_PERIOD" VARCHAR2(4000 BYTE), 
"PRIMARY_TYPE_CHANGE" VARCHAR2(4000 BYTE), 
"PRIMARY_TYPE_P_VALUE" VARCHAR2(4000 BYTE), 
"ID" NUMBER(18,0)
  ) SEGMENT CREATION IMMEDIATE
 TABLESPACE "BIOMART" ;


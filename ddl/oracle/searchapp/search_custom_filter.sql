--
-- Type: TABLE; Owner: SEARCHAPP; Name: SEARCH_CUSTOM_FILTER
--
 CREATE TABLE "SEARCHAPP"."SEARCH_CUSTOM_FILTER" 
  (	"SEARCH_CUSTOM_FILTER_ID" NUMBER(18,0) NOT NULL ENABLE, 
"SEARCH_USER_ID" NUMBER(18,0) NOT NULL ENABLE, 
"NAME" NVARCHAR2(200) NOT NULL ENABLE, 
"DESCRIPTION" NVARCHAR2(2000), 
"PRIVATE" CHAR(1 BYTE) DEFAULT 'N' NOT NULL ENABLE, 
 CONSTRAINT "SEARCH_CUSTOM_FILTER_PK" PRIMARY KEY ("SEARCH_CUSTOM_FILTER_ID")
 USING INDEX
 TABLESPACE "BIOMART"  ENABLE
  ) SEGMENT CREATION IMMEDIATE
 TABLESPACE "BIOMART" ;

--
-- Type: TRIGGER; Owner: SEARCHAPP; Name: TRG_SEARCH_CUSTOM_FILTER_ID
--
  CREATE OR REPLACE TRIGGER "SEARCHAPP"."TRG_SEARCH_CUSTOM_FILTER_ID" 
  before insert on "SEARCH_CUSTOM_FILTER" for each row
begin 
    if inserting then if :NEW."SEARCH_CUSTOM_FILTER_ID" is null then select SEQ_SEARCH_DATA_ID.nextval into :NEW."SEARCH_CUSTOM_FILTER_ID" from dual; end if; end if;
end;










/
ALTER TRIGGER "SEARCHAPP"."TRG_SEARCH_CUSTOM_FILTER_ID" ENABLE;
 

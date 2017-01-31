  CREATE TABLE "BIOMART"."BIO_RECOMBINATION_RATES" 
   (	"CHROMOSOME" VARCHAR2(20 BYTE), 
	"POSITION" NUMBER(18,0), 
	"RATE" NUMBER(18,6), 
	"MAP" NUMBER(18,6)
   ) SEGMENT CREATION IMMEDIATE 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 NOCOMPRESS NOLOGGING
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1 BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "BIOMART" ;
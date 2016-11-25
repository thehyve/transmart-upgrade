#!/bin/bash

#set -x
set -e

echo "running load_mirnaqpcr_annotation.sh $1"

# locate this shell script, and source a generic shell script to process all params related settings
UPLOAD_SCRIPTS_DIRECTORY=$(dirname "$0")
UPLOAD_DATA_TYPE="annotation"
source "$UPLOAD_SCRIPTS_DIRECTORY/process_params.inc"

# Execute some basic checks
if [ -z "$GPL_ID" ] || [ -z "$ANNOTATION_TITLE" ] ||  [ -z "$MIRNA_TYPE" ]; then
	echo "Following variables need to be set:"
        echo "    GPL_ID=$GPL_ID"
	echo "    ANNOTATION_TITLE=$ANNOTATION_TITLE"
	echo "    MIRNA_TYPE=$MIRNA_TYPE"
    	exit 1
fi

if [ "$MIRNA_TYPE" != "MIRNA_QPCR" ]; then
    echo "mirnaqpcr annotation value of \$MIRNA_TYPE '$MIRNA_TYPE' expected 'MIRNA_QPCR'"
    exit 1
fi

if [ ! -d logs ] ; then mkdir logs; fi

# Start the upload
$KITCHEN -norep=Y						\
-file="$KETTLE_JOBS/load_QPCR_MIRNA_annotation.kjb"		\
-log="logs/load_mirna_annotation_$(date +"%Y%m%d%H%M").log"	\
-param:DATA_LOCATION="$DATA_LOCATION"				\
-param:SORT_DIR=/tmp						\
-param:GPL_ID="$GPL_ID"						\
-param:LOAD_TYPE=I						\
-param:ANNOTATION_TITLE="$ANNOTATION_TITLE"			\
-param:MIRNA_TYPE="$MIRNA_TYPE"

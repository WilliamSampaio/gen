#!/usr/bin/env bash

if [[ -z $1 ]];
then 
    DUMP=$(find dumps -type f -exec ls -t1 {} + | head -1)
else
    DUMP="$1"
fi

echo $DUMP

if [[ $2 == "-d" ]];
then
    DATA_ONLY="--data-only --disable-triggers "
else
    DATA_ONLY=""
fi

docker cp $DUMP gen-database:/last_dump
docker exec gen-database pg_restore \
    -U genuser \
    -d postgres $DATA_ONLY\
    /last_dump
docker exec gen-database rm /last_dump

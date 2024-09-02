#!/usr/bin/env bash

DUMP=$(find dumps -type f -exec ls -t1 {} + | head -1)

echo $DUMP

docker cp $DUMP gen-database:/last_dump
docker exec gen-database pg_restore \
    -U genuser \
    -d postgres \
    --data-only \
    --disable-triggers \
    /last_dump
docker exec gen-database rm /last_dump

FROM postgres:16.4-bullseye

COPY scripts/dump .

RUN chmod +x dump
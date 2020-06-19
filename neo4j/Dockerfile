FROM neo4j:latest

RUN apt update \
  && apt install -y curl nano sudo

EXPOSE 7474 7473 7687

COPY ./docker-entrypoint.sh /

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]


CMD ["neo4j"]
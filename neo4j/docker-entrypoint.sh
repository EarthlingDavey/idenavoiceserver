#!/bin/sh

cd /var/lib/neo4j/certificates
# Move old default stuff into a backup directory.
sudo mkdir bak
# for certsource in bolt cluster https ; do
#    sudo mv $certsource bak/
# done
sudo mkdir bolt
sudo mkdir cluster
sudo mkdir https

for certsource in bolt cluster https ; do
   sudo ln -s /var/lib/neo4j/certbot-live/fullchain.pem $certsource/neo4j.cert
   sudo ln -s /var/lib/neo4j/certbot-live/privkey.pem $certsource/neo4j.key
   sudo mkdir $certsource/trusted
   sudo ln -s /var/lib/neo4j/certbot-live/fullchain.pem $certsource/trusted/neo4j.cert ;
done
# Finally make sure everything is readable to the database
sudo chgrp -R neo4j *
sudo chmod -R g+rx *

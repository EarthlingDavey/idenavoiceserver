async function createUpdateTx(session, tx) {
  // console.log({ tx });
  const dateObj = tx.timestamp ? new Date(tx.timestamp * 1000) : new Date();
  try {
    const result = await session.run(
      `
      MATCH (u:User {address: $address}) 
      MERGE (t:Transaction { hash: $hash })-[:USER_TX]->(u) 
      ON CREATE SET t.timestamp = datetime($timestamp), t.epoch = $epoch
      ON MATCH SET t.timestamp = datetime($timestamp)
      RETURN t { .hash , .timestamp } AS t`,
      {
        hash: tx.hash,
        address: tx.from,
        timestamp: dateObj.toISOString(),
        epoch: tx.timestamp,
      }
    );

    const singleRecord = result.records[0];
    console.log({ singleRecord });
    if (!singleRecord) {
      return false;
    }
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function createTransaction(session, transaction) {
  try {
    const result = await session.run(
      `
      MERGE (t:Transaction { hash: $hash })
      ON CREATE SET  t.question = $question, t.type = $type , t.timestamp = datetime($timestamp), t.epoch = $epoch
      ON MATCH SET  t.question = $question, t.type = $type, t.timestamp = datetime($timestamp)
      RETURN t { .hash , .question, .type, .timestamp } AS t`,
      {
        hash: transaction.hash,
        timestamp: new Date(transaction.timestamp * 1000).toISOString(),
        epoch: transaction.timestamp,
        question: transaction.parsedData.question,
        type: transaction.parsedData.type,
      }
    );

    const singleRecord = result.records[0];
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function createResponseTransaction(session, transaction) {
  try {
    // console.log(transaction);
    const result = await session.run(
      `
      MERGE (t:Transaction { hash: $hash })
      ON CREATE SET t.vote = $vote, t.from = $from,t.timestamp = datetime($timestamp), t.current = true
      ON MATCH SET t.vote = $vote, t.from = $from, t.timestamp = datetime($timestamp), t.current = true
      RETURN t { .hash , .vote, .timestamp} AS t`,
      {
        hash: transaction.hash,
        from: transaction.from,
        timestamp: new Date(transaction.timestamp * 1000).toISOString(),
        vote: transaction.parsedData.vote,
      }
    );

    const singleRecord = result.records[0];
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function disablePreviousResponseTransaction(
  session,
  parentHash,
  transaction
) {
  try {
    // console.log(transaction.hash);
    // console.log(transaction.from);
    // console.log(parentHash);
    // WHERE NOT (child.hash = $hash) AND (child.timestamp > $hash)
    const result = await session.run(
      `
      MATCH (parent:Transaction {hash: $parentHash})-[:RESPONSE_TO]->(child:Transaction {from: $from, current: true}) 
      WHERE (child.timestamp <  datetime($timestamp))
      SET child.current = false
      RETURN child { .hash , .vote, .timestamp, .old} AS child`,
      {
        hash: transaction.hash,
        from: transaction.from,
        timestamp: new Date(transaction.timestamp * 1000).toISOString(),
        parentHash: parentHash,
      }
    );

    // console.log(parentHash);

    const singleRecord = result.records[0];
    if (!singleRecord) {
      return false;
    }
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function createTransactionParentRelationship(
  session,
  parentHash,
  childHash
) {
  try {
    const result = await session.run(
      `
      MATCH (parent:Transaction {hash: $parentHash}), (child:Transaction {hash: $childHash}) 
      MERGE (parent)-[:RESPONSE_TO]->(child)
      RETURN child { .hash} AS child`,
      {
        parentHash: parentHash,
        childHash: childHash,
      }
    );

    const singleRecord = result.records[0];
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function updateSyncedUpTo(session, blockNumber) {
  try {
    const result = await session.run(
      `
      MERGE (m:Meta { key: 'syncedUpTo' })
      ON CREATE SET  m.value = $blockNumber
      ON MATCH SET  m.value = $blockNumber
      RETURN m { .value } AS m`,
      {
        blockNumber: blockNumber,
      }
    );

    const singleRecord = result.records[0];
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function getSyncedUpTo(session) {
  try {
    const result = await session.run(
      `
      MATCH (m:Meta { key: 'syncedUpTo' })
      RETURN m { .value } AS m`,
      {}
    );

    const singleRecord = result.records[0];
    if (!singleRecord) {
      return false;
    }
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function updateSyncStartedTime(session) {
  try {
    const result = await session.run(
      `
      MERGE (m:Meta { key: 'syncStartedTime' })
      ON CREATE SET  m.value = TIMESTAMP()
      ON MATCH SET  m.value = TIMESTAMP()
      RETURN m { .value } AS m`,
      {}
    );

    const singleRecord = result.records[0];
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function removeSyncStartedTime(session) {
  try {
    const result = await session.run(
      `
      MERGE (m:Meta { key: 'syncStartedTime' })
      DETACH DELETE m
      `,
      {}
    );

    return;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function getSyncStartedRecently(session) {
  try {
    const result = await session.run(
      `
      MATCH (m:Meta { key: 'syncStartedTime' })
      WHERE m.value >= ( TIMESTAMP() - 20000 )
      RETURN m { .value } AS m`,
      {}
    );

    const singleRecord = result.records[0];
    if (!singleRecord) {
      return false;
    }
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = {
  createUpdateTx,
  createTransaction,
  createResponseTransaction,
  disablePreviousResponseTransaction,
  createTransactionParentRelationship,
  updateSyncedUpTo,
  getSyncedUpTo,
  updateSyncStartedTime,
  getSyncStartedRecently,
  removeSyncStartedTime,
};

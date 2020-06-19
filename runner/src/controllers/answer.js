async function createUpdateAnswer(session, questionId, answer) {
  try {
    // console.log(tx);
    // console.log(questionId);
    // console.log(answer);
    // return;
    const result = await session.run(
      `
      MATCH (q:Question { id: $questionId })
      MERGE (q)-[r:ANSWER_FOR]->(c:Answer { name: $name })
      ON CREATE SET  c.name = $name
      RETURN c { .name } AS c`,
      {
        questionId: questionId,
        name: answer,
      }
    );

    const singleRecord = result.records[0];
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function createTxChoseAnswerRelationship(
  session,
  tx,
  chooseAction,
  questionId
) {
  try {
    console.log(tx);
    console.log(chooseAction);
    const dateObj = tx.timestamp ? new Date(tx.timestamp * 1000) : new Date();

    const result = await session.run(
      `
      MATCH (q:Question { id: $questionId })-[r2:ANSWER_FOR]->(c:Answer { name: $name })
      MATCH (tx:Transaction { hash: $txHash })
      MERGE (c)<-[r3:TX_CHOSE]-(tx)
      ON CREATE SET r3.timestamp = datetime($relTimestamp), r3.old = false
      ON MATCH SET r3.timestamp = datetime($relTimestamp) , r3.old = false
      RETURN r3 { .timestamp, .old } AS r3`,
      {
        questionId: questionId,
        name: chooseAction.answer,
        txHash: tx.hash,
        relTimestamp: dateObj.toISOString(),
      }
    );

    const singleRecord = result.records[0];
    // console.log(singleRecord);
    // return;
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function detachOldTxChoseAnswerRelationship(
  session,
  tx,
  chooseAction,
  questionId
) {
  console.log({ tx, chooseAction });
  try {
    const result = await session.run(
      `
      MATCH (q:Question { id: $questionId })-[r2:ANSWER_FOR]->(c:Answer)<-[r4:TX_CHOSE]-(tx:Transaction)-[:USER_TX]->(u { address: $address })
      // get the most recent purchase_date
      WITH max(r4.timestamp) AS timestamp

      MATCH (q:Question { id: $questionId })-[r2:ANSWER_FOR]->(c:Answer)<-[r4:TX_CHOSE]-(tx:Transaction)-[:USER_TX]->(u { address: $address })
      SET (
        CASE
        WHEN ( NOT (r4.timestamp = timestamp) ) THEN r4 END 
      ).old = true

      WITH r4.timestamp AS timestamp
      
      MATCH (q:Question { id: $questionId })-[r2:ANSWER_FOR]->(c:Answer)<-[r4:TX_CHOSE]-(tx:Transaction)-[:USER_TX]->(u { address: $address })
      WHERE  r4.old = false
      RETURN r4 { .timestamp, .old } AS r4
      `,
      {
        questionId: questionId,
        name: chooseAction.answer,
        txHash: tx.hash,
        address: tx.from,
      }
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
  createUpdateAnswer,
  createTxChoseAnswerRelationship,
  detachOldTxChoseAnswerRelationship,
};

// async function createQuestion(session, question) {
//   try {
//     const result = await session.run(
//       `
//       MERGE (question:Question { address: $address })
//       ON CREATE SET question.nonce = $nonce, question.token = $token, question.nonceCreated = TIMESTAMP()
//       ON MATCH SET question.nonce = $nonce, question.token = $token, question.nonceCreated = TIMESTAMP()
//       RETURN question { .token , .nonce, .address } AS question`,
//       {
//         token: question.token,
//       }
//     );

//     const singleRecord = result.records[0];
//     return singleRecord.get(0);
//   } catch (error) {
//     console.log(error);
//     return false;
//   }
// }

async function createUpdateQuestion(session, tx, question) {
  if (!question) {
    return false;
  }
  try {
    // 1. Find the transction with hash AND question with name
    // 2. Does the tx have a question relationship?
    // 3. Create/update the question
    // 4. Create relationship between question and transaction
    // console.log(tx);
    // console.log(question);
    // return;
    const dateObj = tx.timestamp ? new Date(tx.timestamp * 1000) : new Date();
    const epoch = tx.timestamp ? tx.timestamp : Date.now();
    const result = await session.run(
      `
      MERGE (t:Transaction { hash: $hash })
      MERGE (t)-[r:QUESTION_IN]->(q:Question { name: $name })
      ON CREATE SET  q.name = $name, q.timestamp = datetime($timestamp), q.epoch = $epoch, q.id = apoc.create.uuid()
      ON MATCH SET  q.name = $name, q.timestamp = datetime($timestamp), q.epoch = $epoch
      RETURN q { .name, .timestamp, .id } AS q`,
      {
        hash: tx.hash,
        timestamp: dateObj.toISOString(),
        epoch,
        name: question.name,
      }
    );

    const singleRecord = result.records[0];
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function getQuestionByTxHash(session, txHash) {
  try {
    const result = await session.run(
      `
      MATCH (t:Transaction { hash: $hash })-[r:QUESTION_IN]->(q:Question)
      RETURN q { .name, .timestamp, .id } AS q`,
      {
        hash: txHash,
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

async function createQuestion(session, tx) {
  try {
    const result = await session.run(
      `
      MERGE (q:Question { hash: $hash })
      ON CREATE SET  q.name = $name, q.timestamp = datetime($timestamp), q.epoch = $epoch
      ON MATCH SET q.name = $name, q.timestamp = datetime($timestamp), q.epoch = $epoch
      RETURN q { .hash , .name, .timestamp. epoch } AS q`,
      {
        hash: tx.hash,
        timestamp: new Date(tx.timestamp * 1000).toISOString(),
        epoch: tx.timestamp,
        name: tx.question.name,
      }
    );

    const singleRecord = result.records[0];
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function createAnswer(session, tx, answerName) {
  try {
    const result = await session.run(
      `
      MATCH (q:Question { hash: $hash } )
      MERGE (q)-[r:CHOICE_FOR]->(a:Answer { name: $answerName })
      RETURN a.name, type(r), q.name`,
      {
        answerName: answerName,
        hash: tx.hash,
      }
    );

    return true;
    // const singleRecord = result.records;

    // return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function createQuestionUserRelationship(session, question, address) {
  console.log(question);
  console.log(address);
  try {
    const result = await session.run(
      `MATCH 
      (question:Question {question: $question}), 
      (user:User {address: $address}) 
      create (question)<-[:USER_QUESTION]-(user)`,
      { question, address }
    );
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = {
  createUpdateQuestion,
  getQuestionByTxHash,
  createQuestion,
  createAnswer,
  createQuestionUserRelationship,
};

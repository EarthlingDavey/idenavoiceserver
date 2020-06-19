async function createUpdateChooseAction(session, tx, chooseAction) {
  try {
    console.log(tx);
    console.log(chooseAction);
    // return;
    const result = await session.run(
      `
      MATCH (t:Transaction { hash: $parentHash })-[r:QUESTION_IN]->(q:Question)-[r2:ANSWER_FOR]->(a:Answer { name: $answerName})
      MATCH (t2:Transaction { hash: $hash })
      MERGE (a)-[r3:CHOICE_FOR]->(c:ChooseAction { name: $name })-[r4:CHOICE_IN]->(t2)
      ON CREATE SET  c.name = $name, c.timestamp = datetime($timestamp)
      RETURN 
      t.hash AS hash ,
      q.name AS name , 
      q.id AS questionId , 
      a.name AS answerName
      `,
      {
        parentHash: chooseAction.parentHash,
        answerName: chooseAction.answer,
        timestamp: new Date(tx.timestamp * 1000).toISOString(),
        hash: tx.hash,
      }
    );

    const singleRecord = result.records[0];

    console.log(singleRecord);

    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = {
  createUpdateChooseAction,
};

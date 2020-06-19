const { toUtf8 } = require('ethereumjs-util');
const fetch = require('node-fetch');
var JSONParse = require('json-parse-safe');
const { isQuestion, parseQuestion } = require('./parseQuestion');
const { isChooseAction, parseChooseAction } = require('./parseChooseAction');
const {
  getSyncedUpTo,
  updateSyncedUpTo,
  createTransaction,
  createResponseTransaction,
  createTransactionParentRelationship,
  disablePreviousResponseTransaction,
  updateSyncStartedTime,
  getSyncStartedRecently,
  removeSyncStartedTime,
  createUpdateTx,
} = require('../controllers/transactions');
const {
  createUpdateUser,
  updateUserStatus,
} = require('../controllers/address');
const {
  createUpdateQuestion,
  getQuestionByTxHash,
} = require('../controllers/question');
const {
  createUpdateAnswer,
  createTxChoseAnswerRelationship,
  detachOldTxChoseAnswerRelationship,
} = require('../controllers/answer');

let id = 1;
const key = process.env.RPC_PASS || 'letmein';
const url = process.env.RPC_URI || 'http://localhost:9009';
// console.log(url);
// const url = 'http://192.168.160.3:9009';

/**
 * Helper function to fetch a  url
 */

const safeFetch = async (url, options) => {
  try {
    return await fetch(url, options);
  } catch (error) {
    console.log(error);
    return false;
  }
};

async function getLastBlock() {
  const body = {
    method: 'bcn_lastBlock',
    params: [],
    id: id++,
    key,
  };
  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  };
  const response = await safeFetch(url, options);
  const json = await response.json();
  return json.result ? json.result : false;
}

async function getLastBlock() {
  const body = {
    method: 'bcn_lastBlock',
    params: [],
    id: id++,
    key,
  };
  console.log(JSON.stringify(body));
  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  };
  const response = await safeFetch(url, options);
  console.log(response);
  const json = await response.json();
  return json.result ? json.result : false;
}

async function blockAt(height) {
  const body = {
    method: 'bcn_blockAt',
    params: [height],
    id: id++,
    key,
  };
  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  };
  const response = await safeFetch(url, options);
  const json = await response.json();
  return json.result ? json.result : false;
}
async function transaction(hash) {
  const body = {
    method: 'bcn_transaction',
    params: [hash],
    id: id++,
    key,
  };
  // console.log(JSON.stringify(body));
  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  };
  const response = await safeFetch(url, options);
  const json = await response.json();
  // console.log(json);
  return json.result ? json.result : false;
}
async function mempool() {
  const body = {
    method: 'bcn_mempool',
    params: [],
    id: id++,
    key,
  };
  // console.log(JSON.stringify(body));
  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  };
  const response = await safeFetch(url, options);
  const json = await response.json();
  // console.log(json);
  return json.result ? json.result : [];
}

async function identity(address) {
  const body = {
    method: 'dna_identity',
    params: [address],
    id: id++,
    key,
  };
  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  };
  const response = await safeFetch(url, options);
  const json = await response.json();
  return json.result ? json.result : false;
}

let mempoolDone = [];

async function syncIdenaMempool(driver) {
  const mempoolTx = await mempool();

  const mempoolTxCount = mempoolTx.length;

  if (!mempoolTxCount) {
    mempoolDone = [];
  } else if (mempoolDone.length > mempoolTxCount) {
    // remove any from mempoolDone that are not in mempool
    // mempoolDone = mempoolDone.slice(0, mempoolTxCount * -1);
    for (var j in mempoolDone) {
      if (!mempoolTx.includes(mempoolDone[j])) {
        // delete mempoolDone[j];
        mempoolDone.splice(j, 1);
      }
    }
  }

  if (mempoolTx && mempoolTxCount > 0) {
    let session = driver.session();
    for (var i in mempoolTx) {
      const hash = mempoolTx[i];
      if (mempoolDone.includes(hash)) {
        continue;
      }
      await syncTransaction(session, hash);
      console.log('mempooltx');
      mempoolDone.push(hash);
    }
    session.close();
  }

  setTimeout(
    function () {
      syncIdenaMempool(driver);
    },
    5 * 1000,
    driver
  );

  return;
}

let busy = false;
// let txWithContent = [];

async function syncIdena(driver) {
  if (busy) {
    return;
  }

  busy = true;
  let session = driver.session();

  // await updateSyncedUpTo(session, 1288218);

  // await syncTransaction(
  //   session,
  //   // '0xdd48cff1ce6787d13fb9581fb7501d0f905a1fbd94d4546312a25c848c622aa1'
  //   '0x9a35d124b3523a5125569d3bd66f126266479f26b8698fa5854d5e149a025dec'
  // );

  // let tx = await transaction(
  //   '0x9a35d124b3523a5125569d3bd66f126266479f26b8698fa5854d5e149a025dec'
  // );
  // console.log(tx);
  // return;

  // var i;
  // let a = [1273792, 1274307, 1275081, 1275084, 1275093, 1278070];
  // let a = [1288219];
  // let a = [
  //   1288219,
  //   1304146,
  //   1304803,
  //   1304958,
  //   1304978,
  //   1304998,
  //   1305000,
  //   1309846,
  // ];
  // for (i = 0; i < a.length; i++) {
  //   // console.log(a[i]);
  //   await syncBlock(session, a[i]);
  // }
  // return;
  // await updateSyncStartedTime(session);

  const lastBlock = await getLastBlock();

  // console.log(lastBlock);
  // return;

  // const syncedUpToBlock = 1273785;
  const syncedUpToBlock = await getSyncedUpTo(session);
  await updateSyncStartedTime(session);

  // console.log(syncedUpToBlock);
  // return;

  let startBlock = syncedUpToBlock ? syncedUpToBlock.value : 1288150;
  // const startBlock = 1304958;

  var i;
  var leaveNow = false;
  for (i = startBlock; i < lastBlock.height; i++) {
    if (i % 50 == 0) {
      const dbSyncedToBlock = await getSyncedUpTo(session);
      console.log({ dbSyncedToBlock });
      console.log({ i });
      if (dbSyncedToBlock > i) {
        leaveNow = true;
        break;
      } else {
        await updateSyncedUpTo(session, i);
      }
    }
    await syncBlock(session, i);
    // console.log(i);
  }

  if (!leaveNow) {
    await updateSyncedUpTo(session, i);
  }

  // console.log(txWithContent);
  console.log('done');

  setTimeout(
    function () {
      syncIdena(driver);
    },
    5 * 60 * 1000,
    driver
  );

  session.close();
  busy = false;
}

async function syncBlock(session, height) {
  // console.log(height);
  // return;

  const block = await blockAt(height);

  // console.log(block);

  // return;

  if (block && block.transactions && block.transactions.length > 0) {
    for (var i in block.transactions) {
      await syncTransaction(session, block.transactions[i]);
    }
  }
}

async function syncTransaction(session, hash) {
  let tx = await transaction(hash);

  // console.log(tx);

  if (tx.type !== 'send') {
    return;
  }

  // console.log(tx.payload);

  if (tx.payload !== '0x') {
    if (isQuestion(tx.payload)) {
      // return;
      console.log('is question');
      // txWithContent.push(tx.hash);
      const dbUser = await createUpdateUser(session, tx);

      const id = await identity(tx.from);
      const dbUserWitStatus = await updateUserStatus(session, id);

      const dbTx = await createUpdateTx(session, tx);
      const questionObj = await parseQuestion(tx.payload);
      if (
        !questionObj ||
        !questionObj.name ||
        !questionObj.suggestedAnswer ||
        !Array.isArray(questionObj.suggestedAnswer)
      ) {
        return;
      }
      // console.log(questionObj);
      const dbQuestion = await createUpdateQuestion(session, tx, questionObj);
      if (!dbQuestion) {
        return;
      }
      console.log(dbQuestion);
      for (var i in questionObj.suggestedAnswer) {
        // console.log(questionObj.suggestedAnswer[i]);
        const dbAnswer = await createUpdateAnswer(
          session,
          dbQuestion.id,
          questionObj.suggestedAnswer[i]
        );
        console.log(dbAnswer);
      }

      return;
    }
    if (isChooseAction(tx.payload)) {
      console.log('is a ChooseAction');
      // txWithContent.push(tx.hash);
      const dbUser = await createUpdateUser(session, tx);
      const id = await identity(tx.from);
      const dbUserWitStatus = await updateUserStatus(session, id);
      // console.log({ dbUser });
      const dbTx = await createUpdateTx(session, tx);
      // console.log({ dbTx });
      // return;
      // parseChooseAction
      const chooseActionObj = await parseChooseAction(tx.payload);
      if (!chooseActionObj) {
        return;
      }
      let dbQuestion = await getQuestionByTxHash(
        session,
        chooseActionObj.parentHash
      );
      if (!dbQuestion) {
        console.log('syncTransaction from answer');
        await syncTransaction(session, chooseActionObj.parentHash);
        dbQuestion = await getQuestionByTxHash(
          session,
          chooseActionObj.parentHash
        );
      }
      console.log({ dbQuestion });
      if (!dbQuestion) {
        console.log('still no dbQuestion');
        return;
      }
      // make sure we have the parent in the db
      // await syncTransaction(session, chooseActionObj.parentHash);
      // Link this tx to an answer
      const dbAnswer = await createTxChoseAnswerRelationship(
        session,
        tx,
        chooseActionObj,
        dbQuestion.id
      );
      // console.log({ dbAnswer });
      // return;
      const dbOldAnswer = await detachOldTxChoseAnswerRelationship(
        session,
        tx,
        chooseActionObj,
        dbQuestion.id
      );
      console.log({ dbOldAnswer });
      // Remove other relationships?
    }
    return;
  } else {
    // console.log('no payload');
  }
}

module.exports = { syncIdena, syncIdenaMempool };

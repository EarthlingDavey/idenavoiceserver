const { toUtf8 } = require('ethereumjs-util');
const fetch = require('node-fetch');
var JSONParse = require('json-parse-safe');

const {
  getUserAddresses,
  createUpdateUser,
  updateUserStatus,
} = require('../controllers/address');

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

let busy = false;
// let txWithContent = [];

async function syncIdenaUsers(driver) {
  if (busy) {
    return;
  }

  console.log('in syncIdenaUsers');

  busy = true;
  let session = driver.session();

  const userAddresses = await getUserAddresses(session);
  // console.log(userAddresses);

  var i;
  var leaveNow = false;
  for (i = 0; i < userAddresses.length; i++) {
    const address = userAddresses[i];

    // const dbUser = await updateUserStatus(session, address);
    // const dbUser = await updateUserStatus(session, address);
    // console.log(address);
    const id = await identity(address);
    // console.log(id);
    const dbUser = await updateUserStatus(session, id);
    // console.log(dbUser);
  }

  if (!leaveNow) {
    // await updateSyncedUpTo(session, i);
  }

  // console.log(txWithContent);
  console.log('done syncIdenaUsers');

  setTimeout(
    function () {
      syncIdenaUsers(driver);
    },
    60 * 60 * 1000, // hourly
    driver
  );

  session.close();
  busy = false;
}

module.exports = { syncIdenaUsers };

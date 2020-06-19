async function getUserAddresses(session) {
  try {
    const result = await session.run(
      `
      MATCH (u:User)
      RETURN u.address AS address`,
      {}
    );
    return result.records.map((record) => record.get('address'));
    const singleRecord = result.records[0];
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function createUpdateUser(session, tx) {
  try {
    const result = await session.run(
      `
      MERGE (u:User { address: $address })
      ON CREATE SET  u.address = $address
      ON MATCH SET  u.address = $address
      RETURN u { .address } AS u`,
      {
        address: tx.from,
      }
    );

    const singleRecord = result.records[0];
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function updateUserStatus(session, id) {
  try {
    const result = await session.run(
      `
      MERGE (u:User { address: $address })
      ON CREATE SET  u.address = $address, u.state = $state, u.age = $age
      ON MATCH SET  u.address = $address, u.state = $state, u.age = $age
      RETURN u { .address, .state, .age } AS u`,
      {
        address: id.address,
        state: id.state,
        age: id.age,
      }
    );

    const singleRecord = result.records[0];
    return singleRecord.get(0);
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = {
  getUserAddresses,
  createUpdateUser,
  updateUserStatus,
};

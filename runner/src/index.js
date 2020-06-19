import express from 'express';
import dotenv from 'dotenv';
import neo4j from 'neo4j-driver';
import getRepoInfo from 'git-repo-info';
import { syncIdena, syncIdenaMempool } from './rpc/syncIdena';
import { syncIdenaUsers } from './rpc/syncIdenaUsers';

// set environment variables from ../.env
dotenv.config();
const app = express();
const port = 4002;

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'neo4j'
  )
);

// app.get('/', (req, res) => res.send('Hello World!'));

// syncIdena(driver);
syncIdenaMempool(driver);

syncIdenaUsers(driver);

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/status', function (req, res) {
  var info = getRepoInfo();

  let deployUrl = false;

  if (process.env.REPO_URL && info.sha) {
    deployUrl = `${process.env.REPO_URL}/tree/${info.sha}`;
  }

  res.json({ code: 'ok', deployUrl });
});

app.get('/sync-trigger', async function (req, res) {
  await syncIdena(driver);
  res.send('Hello World!');
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);

// yarn add json-parse-safe neo4j-driver node-fetch

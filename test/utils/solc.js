'use strict';

const solc = require('solc');
const fs = require('fs');
const util = require('util');

module.exports.compile = async (contractPath, contractName, enableOptimization, compiler) => {
  const input = {
    language: 'Solidity',
    sources: {
      'sample.sol': {
        content : fs.readFileSync(contractPath, 'utf8'),
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': [ '*' ],
        },
      },
    },
  };

  if(enableOptimization)
    input.settings.optimizer = { enabled: true };
  
  let compilationData;
  const solcversion = require('../package.json').dependencies.solc
  let solv = solcversion.slice(1);
  let pragmaVersion = compiler.slice(1,6)
  if(solv == pragmaVersion) {
    compilationData = JSON.parse(solc.compile(JSON.stringify(input))).contracts['sample.sol'][contractName];
  } else {
    const loadRemoteVersion = util.promisify(solc.loadRemoteVersion);
    const remoteSolc = await loadRemoteVersion(compiler);
    compilationData = JSON.parse(remoteSolc.compile(JSON.stringify(input))).contracts['sample.sol'][contractName];
  }
  const result = {};
    result.bytecode = compilationData.evm.bytecode.object;
    result.abi = compilationData.abi;
    return result;
};

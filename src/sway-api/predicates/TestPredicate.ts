/* Autogenerated file. Do not edit manually. */

/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/*
  Fuels version: 0.97.2
  Forc version: 0.66.5
  Fuel-Core version: 0.40.1
*/

import {
  BigNumberish,
  BN,
  decompressBytecode,
  InputValue,
  Predicate,
  PredicateParams,
  Provider,
} from 'fuels';

export type AddressInput = { bits: string };
export type AddressOutput = AddressInput;
export type AssetIdInput = { bits: string };
export type AssetIdOutput = AssetIdInput;

export type TestPredicateConfigurables = Partial<{
    ASK_ASSET: AssetIdInput;
    ASK_AMOUNT: BigNumberish;
    ASSET: AssetIdInput;
    RECEIVER: AddressInput;
}>;

export type TestPredicateInputs = [];

export type TestPredicateParameters = Omit<
  PredicateParams<TestPredicateInputs, TestPredicateConfigurables>,
  'abi' | 'bytecode'
>;

const abi = {
  "programType": "predicate",
  "specVersion": "1",
  "encodingVersion": "1",
  "concreteTypes": [
    {
      "type": "bool",
      "concreteTypeId": "b760f44fa5965c2474a3b471467a22c43185152129295af588b022ae50b50903"
    },
    {
      "type": "struct std::address::Address",
      "concreteTypeId": "f597b637c3b0f588fb8d7086c6f4735caa3122b85f0423b82e489f9bb58e2308",
      "metadataTypeId": 1
    },
    {
      "type": "struct std::asset_id::AssetId",
      "concreteTypeId": "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974",
      "metadataTypeId": 2
    },
    {
      "type": "u64",
      "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
    }
  ],
  "metadataTypes": [
    {
      "type": "b256",
      "metadataTypeId": 0
    },
    {
      "type": "struct std::address::Address",
      "metadataTypeId": 1,
      "components": [
        {
          "name": "bits",
          "typeId": 0
        }
      ]
    },
    {
      "type": "struct std::asset_id::AssetId",
      "metadataTypeId": 2,
      "components": [
        {
          "name": "bits",
          "typeId": 0
        }
      ]
    }
  ],
  "functions": [
    {
      "inputs": [],
      "name": "main",
      "output": "b760f44fa5965c2474a3b471467a22c43185152129295af588b022ae50b50903",
      "attributes": null
    }
  ],
  "loggedTypes": [],
  "messagesTypes": [],
  "configurables": [
    {
      "name": "ASK_ASSET",
      "concreteTypeId": "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974",
      "offset": 9608
    },
    {
      "name": "ASK_AMOUNT",
      "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0",
      "offset": 9600
    },
    {
      "name": "ASSET",
      "concreteTypeId": "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974",
      "offset": 9640
    },
    {
      "name": "RECEIVER",
      "concreteTypeId": "f597b637c3b0f588fb8d7086c6f4735caa3122b85f0423b82e489f9bb58e2308",
      "offset": 9672
    }
  ]
};

const bytecode = decompressBytecode('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');

export class TestPredicate extends Predicate<
  TestPredicateInputs,
  TestPredicateConfigurables
> {
  static readonly abi = abi;
  static readonly bytecode = bytecode;

  constructor(params: TestPredicateParameters) {
    super({ abi, bytecode, ...params });
  }
}

import { useEffect, useState } from "react";
import { useWallet } from "@fuels/react";

import LocalFaucet from "./LocalFaucet";
import { TestContract, TestPredicate } from "../sway-api";
import Button from "./Button";
import { isLocal, contractId } from "../lib.tsx";
import { useNotification } from "../hooks/useNotification.tsx";
import { IdentityInput } from "../sway-api/contracts/TestContract.ts";
import { Address, bn, getTransactionSummary, ScriptTransactionRequest } from "fuels";

export default function Contract() {
  const {
    errorNotification,
    transactionSubmitNotification,
    transactionSuccessNotification,
  } = useNotification();
  const [contract, setContract] = useState<TestContract>();
  const [counter, setCounter] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);

  const { wallet, refetch } = useWallet();

  useEffect(() => {
    if (wallet) {
      const testContract = new TestContract(contractId, wallet);
      setContract(testContract);
    }
  }, [wallet]);

  useEffect(() => {
    if (contract && !counter) {
      const getCount = async () => {
        const { value } = await contract.functions.owner().get();
        // setCounter(value.toNumber());
        console.log(value);
        
      };

      getCount();
    }
  }, [contract, counter]);

  async function mint() {
    if (!wallet || !contract) return;
    setIsLoading(true);

    try {
      const recipient = { Address:  {bits: wallet.address.toB256()}};
      const subId = "0x0000000000000000000000000000000000000000000000000000000000000000"
      const call = await contract.functions.mint(recipient, subId, 1).call();
      transactionSubmitNotification(call.transactionId);
      const result = await call.waitForResult();
      transactionSuccessNotification(result.transactionId);
      // setCounter(result.value.toNumber());
      console.log(result);
      
    } catch (error) {
      console.error(error);
      errorNotification("Error incrementing counter");
    }
    setIsLoading(false);
  }

  const ASSET = "0xfcd015537c5cdd337e53fcb6db92d2b33e65be9ae9ce2fd8d840f1a65d99c4ec";
  const ASK_AMOUNT = 100;
  const FEE = 0.02;
  const FEE_COLLECTOR = new Address("0x776CA7cD27F4B12bd51F97952F31EBAc15E2E65e013FD4b8eFaB81DdeC643558");
  
    const getPredicate = async(ask_asset: string, ASK_AMOUNT: number, asset: string, receiver: string) => {
      if (!wallet) return;
      const ASK_ASSET = { bits: ask_asset };
      const ASSET = {bits: asset};
      const RECEIVER = {bits: receiver};
      const configurable = { ASK_ASSET, ASK_AMOUNT, ASSET, RECEIVER};
  
      return new TestPredicate({
        provider: wallet.provider,
        configurableConstants: configurable,
      });
    }

  const list = async () => {
      if (!wallet) return;
      const baseAssetId = wallet.provider.getBaseAssetId();
      const predicate = await getPredicate(baseAssetId, ASK_AMOUNT, ASSET, wallet.address.toB256());
      console.log(predicate?.address.toB256());
      
      if (!predicate) return;
        const tx = await wallet.transfer(predicate.address, bn(1), ASSET);
        transactionSubmitNotification(tx.id);
        await tx.waitForResult();
        transactionSuccessNotification(tx.id);
        // const res = getTransactionSummary(tx.id)
        const transaction = await wallet.provider.getTransaction(tx.id);

        console.log("transaction", transaction);
        
        console.log(tx);
    }

     const buy = async () => {
        if (!wallet) return;
          const transactionRequest = new ScriptTransactionRequest();
          const baseAssetId = wallet.provider.getBaseAssetId();
      
          const predicate = await getPredicate(baseAssetId, ASK_AMOUNT, ASSET, wallet.address.toB256());
          console.log(predicate?.address.toB256());

          if (!predicate) return;
    
          const UtxoToPayFee = await predicate.getResourcesToSpend([
            [1, ASSET],
          ]);
          
          transactionRequest
            .addResources(UtxoToPayFee)
            .addCoinOutput(FEE_COLLECTOR, ASK_AMOUNT*FEE, baseAssetId)
            .addCoinOutput(wallet.address, ASK_AMOUNT*(1-FEE), baseAssetId)
            .addCoinOutput(wallet.address, 1, ASSET);
          const txCost = await wallet.getTransactionCost(transactionRequest);
          transactionRequest.updatePredicateGasUsed(txCost.estimatedPredicates);
          transactionRequest.gasLimit = txCost.gasUsed;
          transactionRequest.maxFee = txCost.maxFee;
          // Fund the transaction from the wallet
          await wallet.fund(transactionRequest, txCost);
      
          // await transactionRequest.addAccountWitnesses(user);
      
          // Sending the transaction to the chain
          const tx = await wallet.sendTransaction(transactionRequest);
          const res = await tx.waitForResult();
          console.log(res);

          console.log(res.id);
      };

      const cancel = async () => {
        if (!wallet) return;
          const transactionRequest = new ScriptTransactionRequest();
          const baseAssetId = wallet.provider.getBaseAssetId();
      
          const predicate = await getPredicate(baseAssetId, ASK_AMOUNT, ASSET, wallet.address.toB256());
          console.log(predicate?.address.toB256());

          if (!predicate) return;
    
          const UtxoToPayFee = await predicate.getResourcesToSpend([
            [1, ASSET],
          ]);
        
          transactionRequest
            .addResources(UtxoToPayFee)
            .addCoinOutput(wallet.address, 1, ASSET);

          transactionRequest.addWitness('0x');
          const txCost = await predicate.getTransactionCost(transactionRequest, {
            signatureCallback: (tx) => tx.addAccountWitnesses(wallet),
          });
          transactionRequest.updatePredicateGasUsed(txCost.estimatedPredicates);
          transactionRequest.gasLimit = txCost.gasUsed;
          transactionRequest.maxFee = txCost.maxFee;
          // Fund the transaction from the wallet
          await wallet.fund(transactionRequest, txCost);
          await transactionRequest.addAccountWitnesses(wallet);
            
          // Sending the transaction to the chain
          const tx = await wallet.sendTransaction(transactionRequest);
          const res = await tx.waitForResult();
          console.log(res);
      };

  return (
    <>
      <div>
        <h3 className="mb-1 text-sm font-medium dark:text-zinc-300/70">
          Counter
        </h3>
        <div className="flex items-center justify-between text-base dark:text-zinc-50">
          <input
            type="text"
            value={counter}
            className="w-2/3 bg-gray-800 rounded-md px-2 py-1 mr-3 truncate font-mono"
            data-testid="counter"
            disabled
          />
          <Button
            onClick={mint}
            className="w-1/3"
            disabled={isLoading}
          >
            mint
          </Button>
          <Button
            onClick={list}
            className="w-1/3"
            disabled={isLoading}
          >
            list
          </Button>
          <Button
            onClick={buy}
            className="w-1/3"
            disabled={isLoading}
          >
            buy
          </Button>
          <Button
            onClick={
              cancel}
            className="w-1/3"
            disabled={isLoading}
          >
            
      cancel
          </Button>
        </div>
      </div>
      <div>
        <p className="pt-2">
          Contracts are a core program type on the Fuel network. You can read
          more about them{" "}
          <a
            href="https://docs.fuel.network/docs/fuels-ts/contracts/"
            className="text-green-500/80 transition-colors hover:text-green-500"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          .
        </p>
        <p className="pt-2">
          This is a simple counter contract which you can edit at{" "}
          <code>sway-programs/contract/src/main.sw</code>.
        </p>
        <p className="pt-2">
          Extend this example by adding decrement functionality by working
          through{" "}
          <a
            href="https://docs.fuel.network/docs/fuels-ts/creating-a-fuel-dapp/#adding-decrement-functionality"
            className="text-green-500/80 transition-colors hover:text-green-500"
            target="_blank"
            rel="noreferrer"
          >
            this guide
          </a>
          .
        </p>
      </div>
      {isLocal && <LocalFaucet refetch={refetch} />}
    </>
  );
}




// {
//   "type": 0,
//   "scriptGasLimit": "0x3d",
//   "scriptLength": "0x4",
//   "scriptDataLength": "0x0",
//   "policyTypes": 8,
//   "inputsCount": 3,
//   "outputsCount": 3,
//   "witnessesCount": 1,
//   "receiptsRoot": "0xa6ccedbd793b587e1ae9f7dca4cf4537184804e66ce8724e67a8245b0cf16c71",
//   "script": "0x24000000",
//   "scriptData": "0x",
//   "policies": [
//       {
//           "type": 8,
//           "data": "0x743"
//       }
//   ],
//   "inputs": [
//       {
//           "type": 0,
//           "txID": "0x9e5afd11d8aa902ecaecdfcdf4ea71ebac9770b509749418773674eef6928dca",
//           "outputIndex": 3,
//           "owner": "0x92ccd9bb3061056680a63b01a1d2b1afbd192b226515ad7ef1df641d9e28e645",
//           "amount": "0x1",
//           "assetId": "0xfcd015537c5cdd337e53fcb6db92d2b33e65be9ae9ce2fd8d840f1a65d99c4ec",
//           "txPointer": {
//               "blockHeight": 18675510,
//               "txIndex": 0
//           },
//           "witnessIndex": 0,
//           "predicateGasUsed": "0x0",
//           "predicateLength": "0x0",
//           "predicateDataLength": "0x0",
//           "predicate": "0x",
//           "predicateData": "0x"
//       },
//       {
//           "type": 0,
//           "txID": "0x9e5afd11d8aa902ecaecdfcdf4ea71ebac9770b509749418773674eef6928dca",
//           "outputIndex": 2,
//           "owner": "0x92ccd9bb3061056680a63b01a1d2b1afbd192b226515ad7ef1df641d9e28e645",
//           "amount": "0x62",
//           "assetId": "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07",
//           "txPointer": {
//               "blockHeight": 18675510,
//               "txIndex": 0
//           },
//           "witnessIndex": 0,
//           "predicateGasUsed": "0x0",
//           "predicateLength": "0x0",
//           "predicateDataLength": "0x0",
//           "predicate": "0x",
//           "predicateData": "0x"
//       },
//       {
//           "type": 0,
//           "txID": "0x9e5afd11d8aa902ecaecdfcdf4ea71ebac9770b509749418773674eef6928dca",
//           "outputIndex": 4,
//           "owner": "0x92ccd9bb3061056680a63b01a1d2b1afbd192b226515ad7ef1df641d9e28e645",
//           "amount": "0xcb559887f",
//           "assetId": "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07",
//           "txPointer": {
//               "blockHeight": 18675510,
//               "txIndex": 0
//           },
//           "witnessIndex": 0,
//           "predicateGasUsed": "0x0",
//           "predicateLength": "0x0",
//           "predicateDataLength": "0x0",
//           "predicate": "0x",
//           "predicateData": "0x"
//       }
//   ],
//   "outputs": [
//       {
//           "type": 0,
//           "to": "0x427473b7c1584b0740b4445bf841b5dd24ba165a9a25d9df6858dfedf2de0205",
//           "amount": "0x1",
//           "assetId": "0xfcd015537c5cdd337e53fcb6db92d2b33e65be9ae9ce2fd8d840f1a65d99c4ec"
//       },
//       {
//           "type": 2,
//           "to": "0x92ccd9bb3061056680a63b01a1d2b1afbd192b226515ad7ef1df641d9e28e645",
//           "amount": "0x0",
//           "assetId": "0xfcd015537c5cdd337e53fcb6db92d2b33e65be9ae9ce2fd8d840f1a65d99c4ec"
//       },
//       {
//           "type": 2,
//           "to": "0x92ccd9bb3061056680a63b01a1d2b1afbd192b226515ad7ef1df641d9e28e645",
//           "amount": "0xcb55986ba",
//           "assetId": "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07"
//       }
//   ],
//   "witnesses": [
//       {
//           "dataLength": 64,
//           "data": "0xff434ba9c23dbf52171ad931e73630bc82177a069a8a1f099ed898df1a543de54621fa3ab3632560fdf8ce4314c95a02c000d65df775b644dd5068d60019363c"
//       }
//   ]
// }
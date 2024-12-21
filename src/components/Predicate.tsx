import { useBalance, useWallet } from "@fuels/react";
import { useEffect, useState } from "react";
import { AbstractAddress, Address, bn, Predicate as FuelPredicate, InputValue, Resource, ScriptTransactionRequest } from "fuels";

import { TestPredicate } from "../sway-api/predicates";
import Button from "./Button";
import LocalFaucet from "./LocalFaucet";
import { isLocal, renderFormattedBalance } from "../lib.tsx";
import { useNotification } from "../hooks/useNotification.tsx";

export default function Predicate() {
  const {
    errorNotification,
    transactionSubmitNotification,
    transactionSuccessNotification,
    successNotification,
  } = useNotification();
  const [predicate, setPredicate] = useState<FuelPredicate<InputValue[]>>();
  const [predicatePin, setPredicatePin] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const { wallet } = useWallet();
  const address = wallet?.address.toB256() || "";
  const { balance: walletBalance, refetch: refetchWallet } = useBalance({
    address,
  });
  const predicateAddress = predicate?.address?.toB256();
  const { balance: predicateBalance, refetch: refetchPredicate } = useBalance({
    address: predicateAddress,
  });

  useEffect(() => {
    if (wallet) {
      const testPredicate = new TestPredicate(wallet);
      setPredicate(testPredicate);
    }
  }, [wallet]);

  const refetch = () => {
    refetchWallet();
    refetchPredicate();
  };

  const transferToPredicate = async () => {
    if (!wallet || !predicate) return;
    setIsLoading(true);

    try {
      const tx = await wallet.transfer(predicate.address, bn(2_000_000));
      transactionSubmitNotification(tx.id);
      await tx.waitForResult();
      transactionSuccessNotification(tx.id);
    } catch (error) {
      console.error(error);
      errorNotification("Error transferring funds. Check your wallet balance.");
    }
    setIsLoading(false);
    refetch();
  };

  const transferToWallet = async () => {
    if (!wallet || !predicate) return;
    setIsLoading(true);

    try {
      const newPredicate = new TestPredicate({
        provider: wallet.provider,
      });

      const tx = await newPredicate.transfer(wallet.address, bn(1_000_000));
      transactionSubmitNotification(tx.id);
      await tx.waitForResult();
      transactionSuccessNotification(tx.id);
    } catch (error) {
      console.error(error);
      errorNotification(
        "Error transferring funds. Check the predicate balance and that you are using the correct pin.",
      );
    }
    setIsLoading(false);
    refetch();
  };

  const copyAddress = () => {
    if (!predicate) return;
    navigator.clipboard.writeText(predicate?.address.toB256());
    successNotification("Address copied to clipboard");
  };

  const ASSET = "0x20a6451464066d5ab7b37e7161b1a1f5864e720b2f7c6c3acd7619fb4d87be26";

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
    const predicate = await getPredicate(baseAssetId, 1, ASSET, wallet.address.toB256());
    if (!predicate) return;
      const tx = await wallet.transfer(predicate.address, bn(1), ASSET);
      transactionSubmitNotification(tx.id);
      await tx.waitForResult();
      transactionSuccessNotification(tx.id);
      console.log(tx);
  }

  const buy = async () => {
    if (!wallet) return;
      const transactionRequest = new ScriptTransactionRequest();
      const baseAssetId = wallet.provider.getBaseAssetId();
  
      const predicate = await getPredicate(baseAssetId, 1, ASSET, wallet.address.toB256());
      if (!predicate) return;

      const UtxoToPayFee: Resource[] = await predicate.getResourcesToSpend([
        [1, ASSET],
      ]);
  
      transactionRequest
        .addResources(UtxoToPayFee)
        .addCoinOutput(wallet.address, 1, baseAssetId);
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
  };

  return (
    <>
      <div>
        <p>
          Predicates are specific types of programs that return a boolean value,
          meaning they function like rules that a transaction must follow to be
          valid. You can read more about them{" "}
          <a
            href="https://docs.fuel.network/docs/fuels-ts/predicates/"
            className="text-green-500/80 transition-colors hover:text-green-500"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          .
        </p>
        <p className="pt-2">
          In the below example, we transfer{" "}
          <span className="font-mono font-bold">0.002 ETH</span> to the
          predicate but need to pass a pin to unlock the predicate and transfer{" "}
          <span className="font-mono font-bold">0.001 ETH</span> back to us.
        </p>
        <p className="pt-2">
          You can alter the logic in the predicate at{" "}
          <code>sway-programs/predicates/src/main.sw</code>.
        </p>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-medium dark:text-zinc-300/70">
          Predicate Address
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-between text-base dark:text-zinc-50">
          <input
            type="text"
            value={predicate?.address.toB256()}
            className="w-2/3 bg-gray-800 rounded-md mb-2 md:mb-0 px-2 py-1 mr-3 truncate font-mono"
            disabled
          />
          <Button className="w-1/3" onClick={copyAddress}>
            Copy
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-medium dark:text-zinc-300/70">
          Wallet Balance
        </h3>
        <div className="flex items-center justify-between text-base dark:text-zinc-50">
          <input
            type="text"
            value={
              walletBalance
                ? `${renderFormattedBalance(walletBalance)} ETH`
                : ""
            }
            className="w-2/3 bg-gray-800 rounded-md px-2 py-1 mr-3 truncate font-mono"
            disabled
          />
          <Button
            onClick={transferToPredicate}
            className="w-1/3"
            disabled={isLoading}
          >
            Transfer
          </Button>
        </div>
      </div>
      <div>
        <h3 className="mb-1 text-sm font-medium dark:text-zinc-300/70">
          Predicate Balance & Pin
        </h3>
        <div className="flex items-center justify-between text-base dark:text-zinc-50">
          <input
            type="text"
            value={
              predicateBalance
                ? `${renderFormattedBalance(predicateBalance)} ETH`
                : ""
            }
            className="w-1/2 bg-gray-800 rounded-md px-2 py-1 md:mr-3 truncate font-mono"
            disabled
          />
          <input
            type="text"
            value={predicatePin}
            onChange={(e) => setPredicatePin(e.target.value)}
            className="w-1/2 bg-gray-800 rounded-md px-2 py-1 truncate font-mono"
            placeholder="Pin: 1337"
          />
        </div>
      </div>
      <div>
        <Button
          onClick={transferToWallet}
          className="w-full"
          disabled={isLoading}
        >
          Unlock and Transfer
        </Button>
      </div>
      {isLocal && <LocalFaucet refetch={refetch} />}
    </>
  );
}

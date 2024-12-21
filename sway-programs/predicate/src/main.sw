predicate;

use std::{
    b512::B512,
    ecr::ec_recover_address,
    inputs::{
        input_coin_owner,
        input_count,
    },
    outputs::{
        Output,
        output_amount,
        output_asset_id,
        output_asset_to,
        output_type,
    },
    tx::{
        tx_id,
        tx_witness_data,
        tx_witnesses_count,
    },
};

const FEE_COLLECTOR: Address = Address::from(0x776CA7cD27F4B12bd51F97952F31EBAc15E2E65e013FD4b8eFaB81DdeC643558);
const FEE: u64 = 2; // 100 = 1%
// Define configurable constants
configurable {
    ASK_ASSET: AssetId = AssetId::from(0x0101010101010101010101010101010101010101010101010101010101010101),
    ASK_AMOUNT: u64 = 0,
    ASSET: AssetId = AssetId::from(0x0101010101010101010101010101010101010101010101010101010101010101),
    RECEIVER: Address = Address::from(0x0101010101010101010101010101010101010101010101010101010101010101),
}

fn main() -> bool {
    // return true;
    // The spending transaction must have an output that sends `ask_amount` of `ask_asset` to `receiver`

    let witness_index = 1;

    let tx_hash = tx_id(); // Get the transaction hash
    let current_signature = tx_witness_data::<B512>(witness_index); // Retrieve the signature at the given index
    if current_signature.is_some() {
        let current_address = ec_recover_address(current_signature.unwrap(), tx_hash).unwrap(); // Recover the address from the signature and transaction hash
        if current_address == RECEIVER {
            return true;
        }
    }

    // Otherwise, evaluate the terms of the order:
    // The output which pays the receiver must be the first output
    let mut output_index = 1;

    // Revert if output is not an Output::Coin
    match output_type(output_index) {
        Some(Output::Coin) => (),
        _ => return false,
    };

    // Since output is known to be a Coin, the following are always valid
    let fee_collector = match output_asset_to(output_index) {
        Some(address) => address,
        None => return false,
    };

    let fee_asset_id = match output_asset_id(output_index) {
        Some(asset_id) => asset_id,
        None => return false,
    };

    let fee_amount = output_amount(output_index);

    output_index += 1;

    // Revert if output is not an Output::Coin
    match output_type(output_index) {
        Some(Output::Coin) => (),
        _ => return false,
    };

    // Since output is known to be a Coin, the following are always valid
    let to = match output_asset_to(output_index) {
        Some(address) => address,
        None => return false,
    };

    let asset_id = match output_asset_id(output_index) {
        Some(asset_id) => asset_id,
        None => return false,
    };

    let amount = output_amount(output_index);

    // Evaluate the predicate
    // (to == RECEIVER) && (amount.unwrap() == ASK_AMOUNT) && (asset_id == ASK_ASSET)
    // Fee collector and receiver
    (fee_collector == FEE_COLLECTOR) && (fee_asset_id == ASK_ASSET) && (fee_amount.unwrap() == (ASK_AMOUNT * FEE) / 100) && (to == RECEIVER) && (amount.unwrap() == ((ASK_AMOUNT * (100 - FEE)) / 100)) && (asset_id == ASK_ASSET)
}

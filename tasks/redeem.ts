import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import {getBridge} from "./init";

task("redeem", "Receive tokens")
    .addParam("address", "Receiver")
    .addParam("amount", "Amount of tokens")
    .addParam("nonce", "Nonce of transaction")
    .addParam("r", "first 32 bytes of signature")
    .addParam("s", "second 32 bytes of signature")
    .addParam("v", "final 1 byte of signature")
    .setAction(async(taskArgs, hre) => {
        const bridge = await getBridge(hre);
        await bridge.redeem(taskArgs.address, +taskArgs.amount, taskArgs.nonce, taskArgs.r, taskArgs.s, taskArgs.v);
    })
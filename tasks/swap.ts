import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import {getBridge, catchEvent} from "./init";

task("swap", "Send tokens")
    .addParam("address", "Receiver of tokens")
    .addParam("amount", "Amount of tokens")
    .setAction(async function (taskArgs, hre) {
        const bridge = await getBridge(hre);
        const tx = await bridge.swap(taskArgs.address, +taskArgs.amount);
        const txWait = await (tx).wait();

        await catchEvent(txWait, ["Sender", "Receiver", "Amount", "Nonce"]);
    })
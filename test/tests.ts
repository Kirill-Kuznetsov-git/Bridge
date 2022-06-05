import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import {IERC20, Bridge } from "../typechain";
import { connect } from "http2";

describe("Bridge", function () {
    let token: IERC20;
    let signer: Signer;
    let bridge: Bridge;

    this.beforeEach(async function () {
        signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, ethers.provider);
        await ethers.provider.send("hardhat_setBalance", [  
            await signer.getAddress(), 
            "0x100000000000000000000000000000000000000"
        ]);

        token = await ethers.getContractAt("IERC20", process.env.TEST_TOKEN_ADDRESS as string);

        const bridgeFactory = await ethers.getContractFactory("Bridge", signer);
        bridge = await bridgeFactory.deploy(process.env.TEST_TOKEN_ADDRESS as string);
        
        await bridge.deployed();
        await token.connect(signer).giveAdminRole(bridge.address);
    })

    describe("swap function", function() {
        it("no enough funds", async function () {
            const accounts = await ethers.getSigners();
            await expect(bridge.connect(accounts[2]).swap(accounts[2].address, 100)).to.be.revertedWith("not enough funds");
        })
    
        it("success", async function () {
            const accounts = await ethers.getSigners();
            await token.connect(signer).mint(await signer.getAddress(), 100);
            await bridge.connect(signer).swap(await signer.getAddress(), 100);
        })
    });

    describe("redeem function", async function () {
        it("nonce already used", async function () {
            const accounts = await ethers.getSigners();
            let msg = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint256"], 
                [await signer.getAddress(), 200, 1]
            )

            let signature = await signer.signMessage(ethers.utils.arrayify(msg));
            let sig = await ethers.utils.splitSignature(signature);

            await bridge.redeem(await signer.getAddress(), 200, 1, sig.v, sig.r, sig.s);
            await expect(bridge.redeem(await signer.getAddress(), 200, 1, sig.v, sig.r, sig.s)).to.be.revertedWith("nonce already used");
        })

        it("wrong signature", async function () {
            const accounts = await ethers.getSigners();
            let msg = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint256"], 
                [await accounts[0].address, 200, 1]
            )

            let signature = await signer.signMessage(ethers.utils.arrayify(msg));
            let sig = await ethers.utils.splitSignature(signature);

            await expect(bridge.redeem(await signer.getAddress(), 200, 1, sig.v, sig.r, sig.s)).to.be.revertedWith("wrong signature");
        })

        it("success", async function () {
            const accounts = await ethers.getSigners();
            let msg = ethers.utils.solidityKeccak256(
                ["address", "uint256", "uint256"], 
                [await signer.getAddress(), 200, 1]
            )

            let signature = await signer.signMessage(ethers.utils.arrayify(msg));
            let sig = await ethers.utils.splitSignature(signature);

            let res = await bridge.redeem(await signer.getAddress(), 200, 1, sig.v, sig.r, sig.s);
        })
    })
});

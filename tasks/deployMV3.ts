/* eslint-disable no-console */
import "ts-node/register"
import "tsconfig-paths/register"

import { task } from "hardhat/config"
import { MusdV3__factory } from "types/generated"
import { DEAD_ADDRESS } from "@utils/constants"

task("deployMV3", "Deploys the mUSD V3 implementation").setAction(async (_, hre) => {
    const { ethers } = hre
    const [deployer] = await ethers.getSigners()

    const Manager = await ethers.getContractFactory("Manager")
    const managerLib = await Manager.deploy()
    await managerLib.deployTransaction.wait()
    const Migrator = await ethers.getContractFactory("Migrator")
    const migratorLib = await Migrator.deploy()
    await migratorLib.deployTransaction.wait()

    const linkedAddress = {
        __$1a38b0db2bd175b310a9a3f8697d44eb75$__: managerLib.address,
        __$895b94b42027c754d119631b74bdad7527$__: migratorLib.address,
    }
    // Implementation
    const massetFactory = new MusdV3__factory(linkedAddress, deployer)
    const size = massetFactory.bytecode.length / 2 / 1000
    if (size > 24.576) {
        console.error(`Masset size is ${size} kb: ${size - 24.576} kb too big`)
    } else {
        console.log(`Masset = ${size} kb`)
    }
    const impl = await massetFactory.deploy(DEAD_ADDRESS)
    const receiptImpl = await impl.deployTransaction.wait()
    console.log(`Deployed to ${impl.address}. gas used ${receiptImpl.gasUsed}`)
})

module.exports = {}
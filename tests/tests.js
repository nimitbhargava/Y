// NOTE globals are for repl only, so can be changed back to consts if the repl is taken out (TODO make a separate script for playing with the contract interactively).

// TODO show that if money leaves the payer it has to go to the payee and donee. E.g. it cannot get stuck in the contract.
// ensure that payer is always sending to this contract

// some tests can be done against the contract and the interface as one, others must be done against the contract directly.

// When a payer tries to send payment, donee receives payment * donation percent (donation) and payee receives payment minus donation, or both receive nothing and payer loses nothing.

// A payee can set their donation percent to 0 < p < 100%.
// The donation percent is the percent of the payment that will be donated if:
// // payment multiplied by donation percent is an integer and
// // payment * num is not more than Solidity's maximum integer.
// If the payee can change the donation percent through the interface, that means the interface has used the smart contract (as them), and therefore they could change the donation percent by using the contract directly if they wanted to.
// p = 0
// p = random number between 0 and 100 exclusive
// p = 100

// Only the payee can change their donation percent.
// When the contract's on the blockchain, anyone can call it, so the test must call the contract's methods directly as a non-payee. All possible ways to change num or denom: call changeNum, changeDenom or changeNumAndDenom.

// An important principle in this file is not to invoke tests manually (e.g. by typing the test's name, or even trying to use IIFEs), in case a test is defined but not called. In other words, defining the test in the right place should be enough to run it. That's why I've made an array of tests, and the name of their failing contract.

const Web3 = require("web3");
global.web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
const fs = require("fs");
const solc = require("solc");
const BigNumber = require("bignumber.js");
const flatten = require("lodash.flatten");

// const y = require("./Y").Y(web3, process.argv[2]);

// if payAndDonate fails to transfer to either donee or payee, neither should get Ether

// donee.transfer() fails

//   await (async () => {
//     // deploy TransferToThisFails
//     const compiled = solc.compile(
//       fs.readFileSync("./TransferToThisFails.sol", "utf8")
//     );
//     const abi = compiled.contracts[":TransferToThisFails"].interface;
//     const bytecode = compiled.contracts[":TransferToThisFails"].bytecode;
//
//     const failer = await new web3.eth.Contract(JSON.parse(abi))
//       .deploy({
//         data: bytecode
//       })
//       .send({
//         from: donee,
//         gas: 1500000 // copied from https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id11
//       });
//
//     const balancesBefore = await Promise.all([
//       web3.eth.getBalance(payee),
//       web3.eth.getBalance(donee)
//     ]);
//     const payeeBalanceBefore = new BigNumber(balancesBefore[0]);
//     const doneeBalanceBefore = new BigNumber(balancesBefore[1]);
//
//     try {
//       await contract.methods.payAndDonate(failer.options.address).send({
//         from: payer,
//         value: payment
//       });
//       console.error("Should have thrown.");
//     } catch (err) {
//       console.log(true); // if it's the expected error
//     }
//
//     const balancesAfter = await Promise.all([
//       web3.eth.getBalance(payee),
//       web3.eth.getBalance(donee)
//     ]);
//     const payeeBalanceAfter = new BigNumber(balancesAfter[0]);
//     const doneeBalanceAfter = new BigNumber(balancesAfter[1]);
//
//     // expect payee and donee balances haven't changed
//
//     console.log(
//       payeeBalanceAfter.equals(payeeBalanceBefore) &&
//         doneeBalanceAfter.equals(doneeBalanceBefore)
//     );
//   })();
//
//   // TODO payee.transfer() fails. It's not possible for a normal account to fail, assuming sending contract has enough ether (https://gitter.im/ethereum/solidity?at=59dfa10fe44c43700a259964), so payee will have to be a contract to test this.
//
//   await (async () => {
//     // deploy ContractThatDeploysY
//
//     const compiled = solc.compile({
//       sources: {
//         "Y.sol": fs.readFileSync("../Y.sol", "utf8"),
//         "ContractThatDeploysY.sol": fs.readFileSync(
//           "./ContractThatDeploysY.sol",
//           "utf8"
//         )
//       }
//     });
//
//     const deployer_abi =
//       compiled.contracts["ContractThatDeploysY.sol:ContractThatDeploysY"]
//         .interface;
//     const bytecode =
//       compiled.contracts["ContractThatDeploysY.sol:ContractThatDeploysY"]
//         .bytecode;
//
//     const yDeployer = await new web3.eth.Contract(JSON.parse(deployer_abi))
//       .deploy({
//         data: bytecode
//       })
//       .send({
//         from: payee,
//         gas: 1500000 // copied from https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id11
//       });
//
//     // get address of deployed Y from yDeployer
//
//     const deployedYAddress = await yDeployer.methods.y().call();
//
//     const y = await new web3.eth.Contract(JSON.parse(abi), deployedYAddress); // NOTE Y abi, hopefully
//
//     const balancesBefore = await Promise.all([
//       web3.eth.getBalance(payee),
//       web3.eth.getBalance(donee)
//     ]);
//     const payeeBalanceBefore = new BigNumber(balancesBefore[0]);
//     const doneeBalanceBefore = new BigNumber(balancesBefore[1]);
//
//     // TODO write a function that returns a promise of a contract, to avoid naming conflicts (abi and deployed_abi) when two contracts are in the same scope, like here.
//
//     try {
//       await y.methods.payAndDonate(donee).send({
//         from: payer,
//         value: payment
//       });
//       console.error("Should have thrown.");
//     } catch (err) {
//       console.log(true); // if it's the expected error
//     }
//
//     const balancesAfter = await Promise.all([
//       web3.eth.getBalance(payee),
//       web3.eth.getBalance(donee)
//     ]);
//     const payeeBalanceAfter = new BigNumber(balancesAfter[0]);
//     const doneeBalanceAfter = new BigNumber(balancesAfter[1]);
//
//     console.log(
//       payeeBalanceAfter.equals(payeeBalanceBefore) &&
//         doneeBalanceAfter.equals(doneeBalanceBefore)
//     );
//   })();
// };

(async () => {
  const accounts = await web3.eth.getAccounts();
  const payer = accounts[1],
    payee = accounts[0],
    donee = accounts[9];

  const nonPayee = payer;

  const randomNewNum = (oldNum, denom) => {
    const x = Math.floor(Math.random() * denom); // x < denom, x is an integer
    return x > 0 && x != oldNum ? x : randomNewNum(oldNum, denom);
  }; // TODO check that num is valid
  const randomNewDenom = (oldDenom, num) => {
    const x = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER); // x < Number.MAX_SAFE_INTEGER, x is an integer. Number.MAX_SAFE_INTEGER < Solidity max. uint256
    return x > num && x != oldDenom ? x : randomNewDenom(oldDenom, num);
  };

  const mutantsAndTests = [
    // Tests should fail against their mutant.

    // donee receives donation, payee receives payment minus donation
    // donee: x, payee: y -> donee: x + (p * d), payee: y + (p - (p * d)), where p > 0, 0 < d < 100% (p is payment, d is donation percent)

    // (payment, donation) => contract => async () => { payment...; contract...; }
    // tests.map(test => test())

    // p = 100, d = 1%

    {
      mutant: "Y_donee_doesnt_receive_donation.sol",
      tests: [
        { payment: 100 },
        { payment: 1 }
      ].map(({ payment }) => async contract => {
        const numAndDenom = await Promise.all([
          contract.methods.num().call(),
          contract.methods.denom().call()
        ]);
        const donation = new BigNumber(numAndDenom[0]) // contract.methods.num().call() is returning a string, not a BigNumber (web3 v0 returned a BigNumber). Is that right?
          .dividedBy(numAndDenom[1])
          .times(payment);
        const balancesBefore = await Promise.all([
          web3.eth.getBalance(payee),
          web3.eth.getBalance(donee)
        ]);
        const payeeBalanceBefore = new BigNumber(balancesBefore[0]);
        const doneeBalanceBefore = new BigNumber(balancesBefore[1]);

        y.payAndDonate(payment, donee);

        const balancesAfter = await Promise.all([
          web3.eth.getBalance(payee),
          web3.eth.getBalance(donee)
        ]);
        const payeeBalanceAfter = new BigNumber(balancesAfter[0]);
        const doneeBalanceAfter = new BigNumber(balancesAfter[1]);

        return {
          test:
            "Donee receives payment * donation percent (donation), and payee receives payment minus donation, unless payment * donation percent is not an integer or is bigger than Solidity's maximum integer.",
          payment,
          result:
            payeeBalanceAfter.equals(
              payeeBalanceBefore.plus(payment).minus(donation)
            ) && doneeBalanceAfter.equals(doneeBalanceBefore.plus(donation))
        };
      })
    },

    // p = 1, d = 50%: First, check that this fails the test against Y.sol. If it doesn't, there's no need for Y.js to interfere. If it does fail, make the same call (payAndDonate) to Y.js. Y.js should stop you from calling Y.sol with values that would fail the test.

    // p = 100, d = 7.9%
    // p = 2^256 - 1, d = 8% (num: 2, denom: 25)

    // p > 0

    // A non-payee can't change a payee's donation percent.

    {
      mutant: "Y_nonpayee_can_change_percent.sol",
      tests: [
        // "changeNum", "changeDenom", "changeNumAndDenom"].map((item) => {})
        async contract => {
          const numBefore = await contract.methods.num().call();
          const newNum = randomNewNum(
            numBefore,
            await contract.methods.denom().call()
          );

          try {
            await contract.methods.changeNum(newNum).send({ from: nonPayee }); // Non-payee tries to change num...
          } catch (err) {}

          return {
            test: "non-payee can't change num",
            result: new BigNumber(await contract.methods.num().call()).equals(
              numBefore
            )
          }; // ... but num after equals num before.
        },
        async contract => {
          const denomBefore = await contract.methods.denom().call();
          try {
            await contract.methods
              .changeDenom(
                randomNewDenom(denomBefore, await contract.methods.num().call())
              )
              .send({ from: nonPayee }); // Non-payee tries to change denom...
          } catch (err) {}

          return {
            test: "non-payee can't change denom",
            result: new BigNumber(await contract.methods.denom().call()).equals(
              denomBefore
            )
          }; // ... but denom after equals denom before.
        },

        // num and denom:

        async contract => {
          const numAndDenomBefore = await Promise.all([
            contract.methods.num().call(),
            contract.methods.denom().call()
          ]);
          const numBefore = numAndDenomBefore[0],
            denomBefore = numAndDenomBefore[1];

          try {
            await contract.methods
              .changeNumAndDenom(999, 1000)
              .send({ from: nonPayee }); // Non-payee tries to change num and denom...
          } catch (err) {}

          const numAndDenomAfter = await Promise.all([
            contract.methods.num().call(),
            contract.methods.denom().call()
          ]);

          const numAfter = numAndDenomAfter[0],
            denomAfter = numAndDenomAfter[1];

          return {
            test: "non-payee can't change num and denom",
            result:
              new BigNumber(numAfter).equals(numBefore) &&
              new BigNumber(denomAfter).equals(denomBefore)
          }; // ... but num and denom after equal num and denom before.
        }
      ]
    },
    {
      mutant: "Y_cant_change_percent.sol",
      tests: [
        // Payee can change num and denom

        // num
        async contract => {
          const changeNumTo = randomNewNum(
            await contract.methods.num().call(),
            await contract.methods.denom().call()
          ); // FIXME cache this for this set of tests.

          await contract.methods.changeNum(changeNumTo).send({ from: payee });

          const numAfter = await contract.methods.num().call();

          return {
            test: "payee can change num",
            result: new BigNumber(numAfter).equals(changeNumTo)
          };
        },

        // denom
        async contract => {
          const changeDenomTo = randomNewDenom(
            await contract.methods.denom().call(),
            await contract.methods.num().call()
          );

          await contract.methods
            .changeDenom(changeDenomTo)
            .send({ from: payee });

          const denomAfter = await contract.methods.denom().call();

          return {
            test: "payee can change denom",
            result: new BigNumber(denomAfter).equals(changeDenomTo)
          };
        },

        // num and denom
        async contract => {
          const denomNow = await contract.methods.denom().call();

          const changeNumTo = randomNewNum(
            await contract.methods.num().call(),
            denomNow
          );
          const changeDenomTo = randomNewDenom(denomNow, changeNumTo);

          await contract.methods
            .changeNumAndDenom(changeNumTo, changeDenomTo)
            .send({ from: payee });

          const numAndDenomAfter = await Promise.all([
            contract.methods.num().call(),
            contract.methods.denom().call()
          ]);

          const numAfter = numAndDenomAfter[0],
            denomAfter = numAndDenomAfter[1];

          return {
            test: "payee can change num and denom",
            result:
              new BigNumber(numAfter).equals(changeNumTo) &&
              new BigNumber(denomAfter).equals(changeDenomTo)
          };
        }
      ]
    }
  ];

  const compileThenDeploy = (filepath, contractName) => {
    const compiled = solc.compile(fs.readFileSync(filepath, "utf8"));
    const abi = compiled.contracts[":" + contractName].interface;
    const bytecode = compiled.contracts[":" + contractName].bytecode;
    return async (num, denom) =>
      await new web3.eth.Contract(JSON.parse(abi))
        .deploy({
          data: bytecode,
          arguments: [num, denom]
        })
        .send({
          from: payee,
          gas: 1500000 // copied from https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id11
        });
  };

  // compileThenDeploy must give us different contracts, each with different start values. The most flexible way to do this is with closures. But where is this flexibility needed? In getting the new tests, where the num and denom are different, into the existing tests. The runner passes down the compiled contract, just not with the num and denom. The tests are generated with their deployed contracts. The tests: property will be a function that returns an array of tests with the right contract each time.

  // test that every test can fail ("test the tests")
  // Mutation testing shows that each test can fail. Run test against broken code. [{mutant, tests}]

  const results = await Promise.all(
    mutantsAndTests.map(async contract => {
      const contractForTest = await compileThenDeploy(
        "./" + contract.mutant,
        "Y"
      )(
        1,
        100 // 1%
      );
      return await Promise.all(
        contract.tests.map(async test => await test(contractForTest))
      );
    })
  );
  const everyTestCanReturnFalse = flatten(results).every(
    test => test.result === false
  );

  console.log(
    everyTestCanReturnFalse === true
      ? "Every test can fail."
      : "Not every test can fail (return false):",
    everyTestCanReturnFalse === true
      ? ""
      : flatten(results).filter(result => result.result === true)
  );

  // test Y

  const contractForTest = compileThenDeploy("../Y.sol", "Y"); // Y

  const tests = flatten(
    mutantsAndTests // [{mutant, tests},{mutant, tests}]
      .map(contract => contract.tests) // [tests, tests]
  ); // [tests]

  const results2 = await Promise.all(
    tests.map(async test => {
      return await test(await contractForTest(1, 100)); // Not sure if both awaits necessary or not.
    })
  );

  const everyTestResultIsTrue = results2.every(
    result => result.result === true
  );

  console.log(
    everyTestResultIsTrue
      ? "Every test passed."
      : "Not every test passed (returned true): " +
        JSON.stringify(results2.filter(result => result.result === false))
  );
  // global.contract = contractForTest;
  // require("repl").start();
  // console.log(
  //   await Promise.all(
  //     [
  //       { payment: 1, donationPercent: { num: 1, denom: 2 } },
  //       { payment: 100, donationPercent: { num: 79, denom: 1000 } }
  //     ].map(async ({ payment, donationPercent }) =>
  //       (payment => async contract => {
  //         const numAndDenom = await Promise.all([
  //           contract.methods.num().call(),
  //           contract.methods.denom().call()
  //         ]);
  //         const donation = new BigNumber(numAndDenom[0]) // contract.methods.num().call() is returning a string, not a BigNumber (web3 v0 returned a BigNumber). Is that right?
  //           .dividedBy(numAndDenom[1])
  //           .times(payment);
  //         const balancesBefore = await Promise.all([
  //           web3.eth.getBalance(payee),
  //           web3.eth.getBalance(donee)
  //         ]);
  //         const payeeBalanceBefore = new BigNumber(balancesBefore[0]);
  //         const doneeBalanceBefore = new BigNumber(balancesBefore[1]);
  //
  //         await contract.methods
  //           .payAndDonate(donee)
  //           .send({ from: payer, value: payment });
  //
  //         const balancesAfter = await Promise.all([
  //           web3.eth.getBalance(payee),
  //           web3.eth.getBalance(donee)
  //         ]);
  //         const payeeBalanceAfter = new BigNumber(balancesAfter[0]);
  //         const doneeBalanceAfter = new BigNumber(balancesAfter[1]);
  //
  //         return {
  //           test:
  //             "donee receives donation, payee receives payment minus donation",
  //           result:
  //             payeeBalanceAfter.equals(
  //               payeeBalanceBefore.plus(payment).minus(donation)
  //             ) && doneeBalanceAfter.equals(doneeBalanceBefore.plus(donation))
  //         };
  //       })(payment)(
  //         await compileThenDeploy(
  //           "../Y.sol",
  //           "Y",
  //           donationPercent.num,
  //           donationPercent.denom
  //         )()
  //       )
  //     )
  //   )
  // ); // FIXME "Error: Couldn't decode uint256 from ABI: 0x" https://github.com/ethereum/web3.js/issues/1089
})();

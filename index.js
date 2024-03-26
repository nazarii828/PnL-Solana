

//============= get the signature========================

// const { Connection, PublicKey } = require('@solana/web3.js');

// // const connection = new Connection('https://api.mainnet-beta.solana.com');
// const connection = new Connection('https://api.devnet.solana.com');
// const publicKey = new PublicKey('4HuaQ5kCBnuJVqehRUg7AnsyaHBQUVNhkcD8V5SVRy8P');

// (async () => {
//   const transactions = await connection.getConfirmedSignaturesForAddress2(publicKey);
  
//   console.log(transactions);
// })();





const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { exec } = require('child_process');
const workbook = new ExcelJS.Workbook();
const filePath = './whiteList.txt';

// const connection = new Connection('https://api.mainnet-beta.solana.com');
const connection = new Connection('https://api.devnet.solana.com');
const publicKey = new PublicKey('AZtr4hv2vBH1rH3ftFFm2BJ928VDSd9UFZsd1pC68Zuw');
let signatureArray = [];
(async () => {
    const transactions = await connection.getConfirmedSignaturesForAddress2(publicKey);
    transactions.map(tranaction => {
        // signatureArray.push(tranaction.signature)

    // const signature = 'LMTQk3eLYh8UGZQm5si6f6uJuiQmW74cLASk2FxdmbXrRDEL1U95ZX2ECk22UY1UBXBCaJ4CYVcPq7rrD1ASGkq';
        const signature = tranaction.signature;
        console.log("signature", signature);
        (async () => {
            let detailed = await connection.getConfirmedTransaction(signature);  
            const senderAddress = detailed.transaction?._message?.accountKeys[2]?.toBase58();
            const postAmount = detailed.meta?.postTokenBalances[0]?.uiTokenAmount?.uiAmount || 0;
            const preAmount = detailed.meta?.preTokenBalances[0]?.uiTokenAmount?.uiAmount || 0;
            const amount = Math.abs(preAmount-postAmount);
            console.log('Sender Address:', senderAddress,'amount', amount);

            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading the file:', err);
                    return;
                }
                if (!data.includes(senderAddress)) {
                    
                    // Powershell running
                    // const command = 'powershell.exe Get-Process';
                    // const command = 'powershell.exe spl-token freeze 5Y4vktMujPgdtCNrHXPjNgmRS7PRZBq4thMRATq2fdiv';

                    // exec(command, (error, stdout, stderr) => {
                    //     if (error) {
                    //     console.error(`Error executing command: ${error}`);
                    //     return;
                    //     }
                        
                    //     console.log('PowerShell command output:');
                    //     console.log(stdout);
                    // });

                    // excel export wirte
                    workbook.xlsx.readFile('output.xlsx')
                        .then(function() {
                            var worksheet = workbook.getWorksheet('Sheet1');
                            const lastRow = worksheet.lastRow || worksheet.addRow([]);
                            var getRowInsert = worksheet.getRow((lastRow._number+1));
                            getRowInsert.getCell('A').value = amount;
                            getRowInsert.getCell('B').value = signature;
                            const rows = [amount, signature]
                            worksheet.addRows(rows);
                            // getRowInsert.commit();
                            return workbook.xlsx.writeFile('output.xlsx');
                        })
                        .catch(function(error) {
                            console.log('An error occurred: ', error);
                        });
                } else {
                    return;
                }
            });

        })();
    })

})();
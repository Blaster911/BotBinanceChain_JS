const ethers = require('ethers');
const prompt = require('prompt-sync')({ sigint: true });
const secret = require('./secret')
const JSSoup = require('jssoup').default;
const axios = require('axios').default;
// installer node.js
//npm install ethers
//npm install prompt-sync
//npm install jssoup 
//node snipe.js

// CHOSES A CHANGER
const privateKey = secret["private_key"];
const myAddress = secret["public_key"];

const amountToSwap = '0.1';// montant en BNB
const gwei = '5';     // 20 c'est beaucoup, 10 c'est devant tout le monde en marché classique, 5 c'est le minimum        7 gwei = ~14% slipage
const slippage = 0;   // 0 = on s'en fout du slippage juste donne moi mes tokens
// FIN CHOSES A CHANGER



// recherche de la liquidité amélioration en cours...

// const BASE_URL = 'https://r.poocoin.app/smartchain/assets/0xdFE6891ce8E5a5c7Cf54fFdE406A6C2C54145F71';

// const getTodoItems = async () => {
//   try {

//     const response = await axios.get(`${BASE_URL}`, {
//       headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)' }
//     });

//     const todoItems = response.data;

//     const soup = new JSSoup(todoItems, false);
//     const tag = soup.find('overflow-auto unpad-3 ps-3');
//     console.log(response);

//     // console.log(`GET: Here's the list of todos`, todoItems); // ici on à tout les éléments de la page web

//     return todoItems;
//   } catch (errors) {
//     console.error(errors);
//   }
// };
// getTodoItems();






const addresses = {
  WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",   // Must have BNB
  router: "0x10ed43c718714eb63d5aa57b78b54704e256024e", // Router pancakeswap
  target: myAddress
}

const BNBAmount = ethers.utils.parseEther(amountToSwap).toHexString();
const gasPrice = ethers.utils.parseUnits(gwei, 'gwei');
const gas = {
  gasPrice: gasPrice,
  gasLimit: 2000000
}

const BSCprovider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
const account = new ethers.Wallet(privateKey, BSCprovider);

const router = new ethers.Contract(
  addresses.router,
  [
    'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
  ],
  account
);

const snipe = async (tokenContract) => {
  if (tokenContract.length < 42 || tokenContract.length > 42) {
    console.error("veuiller saisir un numéro de contract valide");
  }
  else {
    let swappingStat = true;
    while (swappingStat == true) {
      try {
        const tx = await router.swapExactETHForTokens(
          slippage, // Degen ape don't give a fuxk about slippage
          [addresses.WBNB, tokenContract],
          addresses.target,
          Math.floor(Date.now() / 1000) + 60 * 20, // 10 minutes from now
          {
            ...gas,
            value: BNBAmount
          }
        );
        console.log(`Swapping BNB for tokens...`);
        const receipt = await tx.wait();
        console.log(`Transaction hash: ${receipt.transactionHash}`);
        swappingStat = false;
      }
      catch {
        console.log("erreur(s) inconnue");
        swappingStat = false;
      }
    }


  }
}

const tokenContract = prompt('address du contract:');

(async (snipeGo) => {

  snipeGo = await snipe(tokenContract);
})();
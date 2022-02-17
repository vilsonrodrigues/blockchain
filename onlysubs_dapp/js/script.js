// ENDEREÇO EHTEREUM DO CONTRATO
var contractAddress = "0x315CA6f78F95E6D24E8008837FB1B19e5359B5E1";

// Inicializa o objeto DApp
document.addEventListener("DOMContentLoaded", onDocumentLoad);
function onDocumentLoad() {
  DApp.init();
}

// Nosso objeto DApp que irá armazenar a instância web3
const DApp = {
  web3: null,
  contracts: {},
  account: null,

  init: function () {
    return DApp.initWeb3();
  },

  // Inicializa o provedor web3
  initWeb3: async function () {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ // Requisita primeiro acesso ao Metamask
          method: "eth_requestAccounts",
        });
        DApp.account = accounts[0];
        window.ethereum.on('accountsChanged', DApp.updateAccount); // Atualiza se o usuário trcar de conta no Metamaslk
      } catch (error) {
        console.error("Usuário negou acesso ao web3!");
        return;
      }
      DApp.web3 = new Web3(window.ethereum);
    } else {
      console.error("Instalar MetaMask!");
      return;
    }
    return DApp.initContract();
  },

  // Atualiza 'DApp.account' para a conta ativa no Metamask
  updateAccount: async function() {
    DApp.account = (await DApp.web3.eth.getAccounts())[0];
    atualizaInterface();
  },

  // Associa ao endereço do seu contrato
  initContract: async function () {
    DApp.contracts.Onlysubs = new DApp.web3.eth.Contract(abi, contractAddress);
    return DApp.render();
  },

  // Inicializa a interface HTML com os dados obtidos
  render: async function () {
    inicializaInterface();
  },
};


// *** MÉTODOS (de consulta - view) DO CONTRATO ** //

//creator

//function getCreators() external view returns(address[] memory)
function getCreators() { 
    return DApp.contracts.Onlysubs.getCreators().call();
}

//function getNameCreator() view external returns(string)
function getNameCreator() {
    return DApp.contracts.Onlysubs.getNameCreator().call({from: DApp.account});
}

//function getSalesValue(address _creator) public view returns(uint) 
function getSalesValue() {
    let anotherCreator = document.getElementsById("field_input_getSalesValue");
    return DApp.contracts.Onlysubs.methods.getSalesValue(anotherCreator).call();
}

//SUBS

//function getMessages(address _creator) 
//public view returns(string[] memory, string[] memory, uint[] memory)
function getMessages(creator) {
    return DApp.contracts.Onlysubs.methods.getMessages(creator).call()
}

//function getNameSub() external view returns(string)
function getNameSub() {
    return DApp.contracts.Onlysubs.getNameSub().call();
}    

//function getSignatures() external returns(address[] memory)
function getSignatures() {
    return DApp.contracts.Onlysubs.getSignatures().call({from: DApp.account});
}

//function getRemainingDaysSubscription(address _creator) public view returns(uint)
function getRemainingDaysSubscription() {
    let creator_fieldSubs = document.getElementById("creator_fieldSubs");
    return DApp.contracts.Onlysubs.methods.getRemainingDaysSubscription(creator_fieldSubs).call({from: DApp.account});
}

//function getSubscribers() external view returns(address[] memory)
function getSubscribers() {
    return DApp.contracts.Onlysubs.getSubscribers().call();
}

//METODOS DE ESCRITA NO CONTRATO

//CREATOR

//function creatorRegistration(string memory _name, uint _fee, uint _salesValue) external 
function creatorRegistration() {
    let name_CreatorRegistration =  document.getElementById("name_fieldCreatorRegistration");
    let fee_CreatorRegistration =  document.getElementById("field_input_feeCreatorRegistration");
    let salesValue_CreatorRegistration = document.getElementById("field_input_salesValueCreatorRegistration");
    return DApp.contracts.Onlysubs.methods.creatorRegistration(name_CreatorRegistration,
                                                               fee_CreatorRegistration,
                                                               salesValue_CreatorRegistration).send({from: DApp.account}).then(faca_algo);
}

//function createMsg(string memory _body, string memory _author) external 
function createMsg() {
    let titleMsg = document.getElementById("field_input_titleMsg");
    let authorMsg = document.getElementById("field_input_authorMsg");
    return DApp.contracts.Onlysubs.methods.createMsg(titleMsg, authorMsg).send({from: DApp.account});
}
    
//function buyMsgs(address _creator) payable external {                          FALTA
//field_input_buyMsg
function buyMsgs() {
  let address_buy_msg = document.getElementById("field_input_buyMsg");
  return DApps.contracts.Onlysubs.methods.buyMsgs(address_buy_msg).send({from: DApp.account});
}

//function updateFee(uint _fee) external 
function updateFee() {
    let newFeeCreator = document.getElementById("field_input_updateFee");
    return DApp.contracts.Onlysubs.methods.updateFee(newFeeCreator).send({from: DApp.account});
}
    
//function updateSalesValue(uint _salesValue) external 
function updateSalesValue() {
    let newSalesValueCreator = document.getElementById("field_input_updateSalesValue");
    return DApp.contracts.Onlysubs.methods.updateSalesValue(newSalesValueCreator).send({from: DApp.account});
}
    

//SUBS


//function subscriberRegistration(string memory _name) external 
function subscriberRegistration() {
    let nameRegistrationSub = document.getElementById("field_input_nameSubscriberRegistration");
    return DApp.contracts.Onlysubs.methods.subscriberRegistration(nameRegistrationSub).send({from: DApp.account});
}

//function subscribe(address _creator, uint _subscriptionTime) payable external 
function subscribe() {
    let newCreator_sub = document.getElementById("field_input_addressSubscribe");
    let subscriptionTime_sub = document.getElementById("field_input_subscriptionTimeSubscribe");
    let feeSub = feeCreator*subscriptionTime_sub;
    return DApp.contracts.Onlysubs.methods.subscribe(newCreator_sub,subscriptionTime_sub).send({from: DApp.account, value:feeSub});
}

//function renewSubscribe(address _creator, uint _subscriptionTime) payable external 
function renewSubscribe() {
    let creatorRenew = document.getElementById("field_input_addressSubscribe");
    let subscriptionTimeRenew = document.getElementById("field_input_subscriptionTimeRenewSubscribe");
    let valortaxa=1;
    return DApp.contracts.Onlysubs.methods.renewSubscribe(creatorRenew, subscriptionTimeRenew).send({from: DApp.account, value:valortaxa});
}



// *** ATUALIZAÇÃO DO HTML *** //

function inicializaInterface() {
    document.getElementById("btnCreatorRegistration").onclick = creatorRegistration;
    document.getElementById("btnUpdateFee").onclick = updateFee;
    document.getElementById("btnUpdateSalesValue").onclick = updateSalesValue;
    document.getElementById("btnGetSalesValue").onclick = getSalesValue;
    document.getElementById("btnCreateMsg").onclick = createMsg;
    document.getElementById("btnGetCreators").onclick = getCreators;
    document.getElementById("btnBuyMsgs").onclick = buyMsgs;
    document.getElementById("btnGetSignatures").onclick = getSignatures;
    document.getElementById("btnGetRemainingDaysSubscription").onclick = getRemainingDaysSubscription;
    document.getElementById("btnGetSubscribers").onclick = getSubscribers;
    document.getElementById("btnRegistrationSubscriber").onclick = registrationSubscriber;
    document.getElementById("btnSubscribe").onclick = subscribe;
    document.getElementById("btnRenewSubscribe").onclick = renewSubscribe;
    atualizaInterface();
    //DApp.contracts.Rifa.getPastEvents("RifaComprada", { fromBlock: 0, toBlock: "latest" }).then((result) => registraEventos(result));  
    //DApp.contracts.Rifa.events.RifaComprada((error, event) => registraEventos([event]));  
}

function atualizaInterface() {
  document.getElementById("btnBuyMsgs").style.display = "none";
  document.getElementById("btnCreateMsg").style.display = "none";
  document.getElementById("btnCreatorRegistration").style.display = "block";
  getNameCreator().then((result) => { 
    if(result) {
      document.getElementById("output_field_getNameCreator").innerHTML = result;
      document.getElementById("btnBuyMsgs").style.display = "block";
      document.getElementById("btnCreateMsg").style.display = "block";
      document.getElementById("btnCreatorRegistration").style.display = "none";
    }    
  });
  document.getElementById("btnRegistrationSubscriber").style.display = "block";
  document.getElementById("btnRenewSubscribe").style.display = "block";
  getNameSub().then((result) => { 
    if(result) {
      document.getElementById("output_field_getNameSub").innerHTML = result;
      document.getElementById("btnRegistrationSubscriber").style.display = "none";
      document.getElementById("btnRenewSubscribe").style.display = "none";
    }    
  });
  getCreators().then((result) => {
    document.getElementById("output_field_getCreators").innerHTML = result;
  });
  getSignatures().then((result) => {
    document.getElementById("output_field_getSignatures").innerHTML = result;
  });  
  getSubscribers().then((result) => {
    document.getElementById("output_field_getSubscribers").innerHTML = result;
  });
  getSalesValue().then((result) => {
    document.getElementById("output_field_getSalesValue").innerHTML = result;
  });
  

}
/*
function preencheCreators(creators) {
  let tableCretors = document.getElementById("tableCretors");  
  creators.forEach(creator => {
  }
  )
}
*/


/*

function registraEventos(eventos) {
  let table = document.getElementById("events");
  eventos.forEach(evento => {
    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.innerHTML = "<a href='https://ropsten.etherscan.io/address/"+ evento["returnValues"]["comprador"] +"'>" + evento["returnValues"]["comprador"] + "</a>";
    let td2 = document.createElement("td");
    td2.innerHTML = evento["returnValues"]["quant"];
    let td3 = document.createElement("td");  
    td3.innerHTML = "<a href='https://ropsten.etherscan.io/tx/"+ evento["transactionHash"] +"'>" + evento["transactionHash"] + "</a>";
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    table.appendChild(tr);
  });
}
*/

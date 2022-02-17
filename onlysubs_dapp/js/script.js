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
    return DApp.contracts.Onlysubs.getCreators().call({from: DApp.account});;
}

//function getCreatorFee(address _creator) public view returns(uint) 
function getCreatorFee() {
    let creatorFee = document.getElementsById("field_input_getCreatorFee");
    return DApp.contracts.Onlysubs.getCreatorFee(creatorFee).call();
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

//function getAmountCreator() view external returns(uint) 
function getAmountCreator() {
  return DApp.contracts.Onlysubs.methods.getAmountCreator().call({from: DApp.account});
}

//function withdraw() external 
function withdraw() {
  return DApp.contracts.Onlysubs.methods.withdraw().call({from: DApp.account});
}

//SUBS

//function getMessages(address _creator) 
//public view returns(string[] memory, string[] memory, uint[] memory)
function getMessages(creator) {
    return DApp.contracts.Onlysubs.methods.getMessages(creator).call({from: DApp.account});
}

//function getNameSub() external view returns(string)
function getNameSub() {
    return DApp.contracts.Onlysubs.getNameSub().call({from: DApp.account});
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
                                                               salesValue_CreatorRegistration).send({from: DApp.account}).then(atualizaInterface)
}

//function createMsg(string memory _body, string memory _author) external 
function createMsg() {
    let titleMsg = document.getElementById("field_input_titleMsg");
    let authorMsg = document.getElementById("field_input_authorMsg");
    return DApp.contracts.Onlysubs.methods.createMsg(titleMsg, authorMsg).send({from: DApp.account}).then(atualizaInterface);
}
    
//function buyMsgs(address _creator) payable external {                          FALTA
//field_input_buyMsg
function buyMsgs() {
  let address_buy_msg = document.getElementById("field_input_buyMsg");
  return DApps.contracts.Onlysubs.methods.buyMsgs(address_buy_msg).send({from: DApp.account}).then(atualizaInterface);
}

//function updateFee(uint _fee) external 
function updateFee() {
    let newFeeCreator = document.getElementById("field_input_updateFee");
    return DApp.contracts.Onlysubs.methods.updateFee(newFeeCreator).send({from: DApp.account}).then(atualizaInterface);
}
    
//function updateSalesValue(uint _salesValue) external 
function updateSalesValue() {
    let newSalesValueCreator = document.getElementById("field_input_updateSalesValue");
    return DApp.contracts.Onlysubs.methods.updateSalesValue(newSalesValueCreator).send({from: DApp.account}).then(atualizaInterface);
}
    

//SUBS


//function subscriberRegistration(string memory _name) external 
function subscriberRegistration() {
    let nameRegistrationSub = document.getElementById("field_input_nameSubscriberRegistration");
    return DApp.contracts.Onlysubs.methods.subscriberRegistration(nameRegistrationSub).send({from: DApp.account}).then(atualizaInterface);
}

//function subscribe(address _creator, uint _subscriptionTime) payable external 
function subscribe() {
    let newCreator_sub = document.getElementById("field_input_addressSubscribe");
    let subscriptionTime_sub = document.getElementById("field_input_subscriptionTimeSubscribe");
    let feeSub;
    getCreatorFee(newCreator_sub).then((creatorFee) => {
      feeSub = creatorFee * subscriptionTime_sub;
    });
    return DApp.contracts.Onlysubs.methods.subscribe(newCreator_sub,subscriptionTime_sub).send({from: DApp.account, value:feeSub}).then(atualizaInterface);
}

//function renewSubscribe(address _creator, uint _subscriptionTime) payable external 
function renewSubscribe() {
    let creatorRenew = document.getElementById("field_input_addressSubscribe");
    let subscriptionTimeRenew = document.getElementById("field_input_subscriptionTimeRenewSubscribe");  
    let feeRenerSub;
    getCreatorFee(creatorRenew).then((creatorFee) => {
      feeRenerSub = creatorFee * subscriptionTimeRenew;
    });
    return DApp.contracts.Onlysubs.methods.renewSubscribe(creatorRenew, subscriptionTimeRenew).send({from: DApp.account, value:feeRenerSub}).then(atualizaInterface);
}

function setagetSalesValue() {
  document.getElementById("output_field_getSalesValue") = getSalesValue();
}

function setagetCreatorFee(){
  document.getElementById("output_field_getSalesValue") = getCreatorFee();

}


function inicializaInterface() {
    document.getElementById("btnBuyMsgs").style.display = "none";
    document.getElementById("btnCreateMsg").style.display = "none";
    document.getElementById("btnCreatorRegistration").style.display = "block";
    document.getElementById("btnWithdraw").style.display = "none";    
    document.getElementById("btnRegistrationSubscriber").style.display = "block";
    document.getElementById("btnRenewSubscribe").style.display = "block";
    document.getElementById("btnCreatorRegistration").onclick = creatorRegistration;
    document.getElementById("btnUpdateFee").onclick = updateFee;
    document.getElementById("btnUpdateSalesValue").onclick = updateSalesValue;
    document.getElementById("btnGetSalesValue").onclick = setagetSalesValue;
    document.getElementById("btnCreateMsg").onclick = createMsg;    
    document.getElementById("btnBuyMsgs").onclick = buyMsgs;    
    document.getElementById("btnRegistrationSubscriber").onclick = subscriberRegistration;
    document.getElementById("btnSubscribe").onclick = subscribe;
    document.getElementById("btnSubscribe").style.display = "block";
    document.getElementById("btnRenewSubscribe").onclick = renewSubscribe;
    document.getElementById("btnGetCreatorFee").style.display = "block";
    document.getElementById("btnGetCreatorFee").onclick = setagetCreatorFee;  
    atualizaInterface();
    
  
    //DApp.contracts.Rifa.getPastEvents("RifaComprada", { fromBlock: 0, toBlock: "latest" }).then((result) => registraEventos(result));  
    //DApp.contracts.Rifa.events.RifaComprada((error, event) => registraEventos([event]));  
}

function atualizaInterface() {
  getNameCreator().then((result) => { 
    if(result) {
        getAmountCreator().then((amountCretor) => {
          document.getElementById("output_field_getNameCreator").innerHTML = result + " $" + amountCretor;
          if(amountCretor > 0){
              document.getElementById("btnWithdraw").style.display = "block";  
          }
        });
        document.getElementById("btnBuyMsgs").style.display = "block";
        document.getElementById("btnCreateMsg").style.display = "block";
        document.getElementById("btnCreatorRegistration").style.display = "none";
    }    
  });  
  getNameSub().then((result) => { 
    if(result) {
      document.getElementById("output_field_getNameSub").innerHTML = result;
      document.getElementById("btnRegistrationSubscriber").style.display = "none";
      document.getElementById("btnRenewSubscribe").style.display = "none";
      getSignatures().then((assinaturas) => {
        registrarAssinaturas(assinaturas);
        let conteudos = []
        for (let i = 0; i < assinaturas.length; i++){
          getMessages(assinaturas[i]).then((conteudo) => {
            conteudos.append(conteudo);
          });  
          registrarTodosCreators(todosCreators);
        }
      });        
      getExpiredSubscriptions().then((registrarAssinaturasExpiradas) => {
        registrarAssinaturas(registrarAssinaturasExpiradas);
      });        
    }    
  });  
  getCreators().then((todosCreators) => {
    registrarTodosCreators(todosCreators);
  });    
}

function resistarConteudo(conteudos) {
  let tableConteudo = document.getElementById("tableConteudo");
  conteudos.forEach(conteudo => {
    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.innerHTML = conteudo["_title"];
    let td2 = document.createElement("td");
    td2.innerHTML = conteudo["_author"];
    let td3 = document.createElement("td");
    td3.innerHTML = conteudo["_date"];  
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tableConteudo.appendChild(tr);
    });
}

function registrarAssinaturas(assinaturas) {
  let tableInscricoes = document.getElementById("tableInscricoes");
  assinaturas.forEach(assinatura => {
    let tr2 = document.createElement("tr");    
    let td4 = document.createElement("td");
    td4.innerHTML = assinatura;
    tr2.appendChild(td4);
    tableInscricoes.appendChild(tr2);    
  });
}


function registrarAssinaturasExpiradas(assinaturasExpiradas) {
  let tableInscricoesExpiradas = document.getElementById("tableInscricoesExpiradas");
  assinaturasExpiradas.forEach(assinaturaExpirada => {
    let tr3 = document.createElement("tr");
    let td5 = document.createElement("td");
    td5.innerHTML = assinaturaExpirada;
    tr3.appendChild(td5);
    tableInscricoesExpiradas.appendChild(tr3);    
  });
}

function registrarTodosCreators(todosCreators) {
  let tableCreatorsRegistrados = document.getElementById("tableCreatorsRegistrados");
  todosCreators.forEach(creatorRegistrado => {
    let tr4 = document.createElement("tr");
    let td6 = document.createElement("td");
    td6.innerHTML = creatorRegistrado;
    tr4.appendChild(td6);
    tableCreatorsRegistrados.appendChild(tr4);    
  });
}

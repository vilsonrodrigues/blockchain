// Nome: Vilson Rodrigues
// Conta do contrato: 0x315CA6f78F95E6D24E8008837FB1B19e5359B5E1
// SPDX-License-Identifier: MIT

import "./Owned.sol";

pragma solidity >= 0.7.0;
pragma experimental ABIEncoderV2;

contract onlysubs is Owned {

    event Subscribe(address from, address to);
    event RenewSubscribe(address from, address to);
    //Mensagens são imutáveis. Para acessar você terá que
    //ter o index da mensagem
    struct Msg {
        string title;
        string author;
        uint date;
    }
    //adicionar como um array
    Msg[] public msgs;
    
    //Estrutura do criador de conteúdo    
    struct Creator {
        uint[] idMsgs;
        string name;
        uint fee;         
        uint salesValue;
        bool active;        
        uint amount;
    }
    /* 
    Mapeia o endereço do criador para uma estrutura de craidor
    onde no processo de cadastro de mensagem vai ser inserido no
    array idMsg o código identificador da mensagem
    */
    mapping(address => Creator) creator;

    //Um array com todos os criadores inscritos no contrato
    address[] public creators;

    //Assinatura. Vai informar a data de vencimento de uma assinatura
    struct Signature {        
        uint expiration;
    }

    struct Subscriber {
        string name;
        //Mapeia o endereço do inscrito na estrutura de assinatura com a data
        mapping(address => Signature) signatures;
    }

    mapping(address => Subscriber) subscriber;

    address[] public subs;

    //Creator functions
    function creatorRegistration(string memory _name, uint _fee, uint _salesValue) external {
        require(_fee > 0);
        require(_salesValue > 0);
        creator[msg.sender].name = _name;
        creator[msg.sender].fee = _fee;
        creator[msg.sender].salesValue = _salesValue;
        creator[msg.sender].active = true;     
        creators.push(msg.sender);
    }

    function getCreatorFee(address _creator) public view returns(uint) {
        require(creator[_creator].active == true);
        return creator[_creator].fee;
    }

    function createMsg(string memory _title, string memory _author) external {
        creator[msg.sender].idMsgs.push(msgs.length);
        msgs.push(Msg(_title,_author,block.timestamp));                 
    }

    function getCreators() external view returns(address[] memory) {
        return creators;
    } 

    function getSalesValue(address _creator) public view returns(uint) {
        require(creator[_creator].active == true);
        return creator[_creator].salesValue;
    }

    function buyMsgs(address _creator) payable external {
        require(msg.value > getSalesValue(_creator));        
        require(creator[_creator].active == true);
        require(creator[_creator].idMsgs.length > 0);
        for(uint i = 0; i < creator[_creator].idMsgs.length; i++){
            creator[msg.sender].idMsgs.push(creator[_creator].idMsgs[i]);
            creator[_creator].idMsgs.pop(); 
        }        
        //Auto inscreve no assiante que tinha pago pelo conteúdo
        for(uint i = 0; i < subs.length; i++){
            //Se existir um vencimento para esse criador, zere e adicione um novo herdando a data
            if(subscriber[subs[i]].signatures[_creator].expiration > 0){
                subscriber[subs[i]].signatures[msg.sender].expiration = subscriber[subs[i]].signatures[_creator].expiration;
                subscriber[subs[i]].signatures[_creator].expiration = 0;
            } 
        }
        creator[_creator].amount += msg.value;
    }

    function updateFee(uint _fee) external {
        require(creator[msg.sender].active == true);
        creator[msg.sender].fee = _fee;
    }

    function updateSalesValue(uint _salesValue) external {
        require(creator[msg.sender].active == true);
        creator[msg.sender].salesValue = _salesValue;
    }

    function getNameCreator() view external returns(string memory) {
        return creator[msg.sender].name;
    }

    function getAmountCreator() view external returns(uint) {
        return creator[msg.sender].amount;
    }

    function withdraw() external {
        require(creator[msg.sender].amount > 0);
        owner.transfer(creator[msg.sender].amount);
    }

    //------------------------Subscriber Functions -------------

    function subscriberRegistration(string memory _name) external {
        subscriber[msg.sender].name =_name;
        subs.push(msg.sender);
    }

    function checkSubscriptionDependency(address _creator) 
    view internal returns(bool) {
        require(msg.value > getCreatorFee(_creator));
        require(creator[_creator].active == true);
        return true;
    }

    //vai inserir um creator na sua lista e vai inserir a data de vencimento
    function subscribe(address _creator, uint _subscriptionTime) payable external {        
        if(checkSubscriptionDependency(_creator) == true) {
            subscriber[msg.sender].signatures[_creator].expiration = (
                      block.timestamp + (_subscriptionTime * 1 days)            
            );      
        }
        creator[_creator].amount += msg.value;    
        emit Subscribe(msg.sender, _creator);    
    }

    //Dias restantes
    //vencimento menos a data final. se tiver vencido, entao retorne 0
    function getRemainingDaysSubscription(address _creator) public view returns(uint) {
        if ((subscriber[msg.sender].signatures[_creator].expiration - block.timestamp) >= 0){
            return (subscriber[msg.sender].signatures[_creator].expiration - block.timestamp);
        }else{
            return 0;
        }
    }
    //Renova assinatura
    //adiciona o tempo restante, o atual e 
    function renewSubscribe(address _creator, uint _subscriptionTime) payable external {        
        require(msg.value >= creator[_creator].fee);
        if (checkSubscriptionDependency(_creator) == true){
            subscriber[msg.sender].signatures[_creator].expiration = (
                block.timestamp + getRemainingDaysSubscription(_creator) + (_subscriptionTime * 1 days)
            );
        }    
        creator[_creator].amount += msg.value;  
        emit RenewSubscribe(msg.sender, _creator);                 
    }

    
    //Pega o array de criadores, itera sobre ele, verifica para o inscrito qual 
    //ele tem, se a condicao for atingida insere no array os criadores que ele assinou
    function getSignatures() external view returns(address[] memory) {
        uint j = 0;
        address[] memory _subSignatures = new address[](creators.length);        
        for(uint i = 0; i < creators.length; i++) {
            if(subscriber[msg.sender].signatures[creators[i]].expiration > 0) {
                _subSignatures[j] = creators[i];
                j+=1;
            }
        }      
        return _subSignatures;        
    }

    //retorna uma lista de endereços que o usuario deve renovar
    function getExpiredSubscriptions() external view returns(address [] memory) {
        uint j = 0;
        address[] memory _subSignaturesExpired = new address[](creators.length);
        for(uint i = 0; i < creators.length; i++){
            if(
              (subscriber[msg.sender].signatures[creators[i]].expiration > 0) &&
              (subscriber[msg.sender].signatures[creators[i]].expiration < block.timestamp)
              ){
                _subSignaturesExpired[j] = creators[i];
                j+=1;
            }    
        }      
        return _subSignaturesExpired;  
    }

    function getSubscribers() external view returns(address[] memory) {
        return subs;
    }

    function getNameSub() external view returns(string memory) {
        return subscriber[msg.sender].name;
    }

    function getMessages(address _creator) 
    public view returns(string[] memory, string[] memory, uint[] memory) {
        string[] memory _title = new string[](creator[_creator].idMsgs.length);
        string[] memory _author = new string[](creator[_creator].idMsgs.length);
        uint[] memory _date = new uint[](creator[_creator].idMsgs.length);

        for(uint i=0; i < creator[_creator].idMsgs.length; i++) {
            uint index = creator[_creator].idMsgs[i];
            Msg memory message = msgs[index];
            _title[i] = message.title;
            _author[i] = message.author;
            _date[i] = message.date;
        }
        return (_title, _author, _date);
    }

}

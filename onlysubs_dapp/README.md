## Onlysubs

Esse trabalho é uma implementação de um DApp feito na Blockchain da Ethereum, sendo desenvolvido na linguagem Solidity.

O trabalho é um requisito da disciplina Blockchain ministrada pelo professor Danilo Curvelo (IMD/UFRN)

O sistema se oferece como uma plataforma de cadastro de contéudo, os criadores fazem o registro, cadastrando sua fee de inscrição e o valor de venda de todo seu conteúdo. E após isso cadastram uma mensagem. Uma mensagem é composta por: 

* Título
* Autor
* Data

Os subs podem se registrar e pagar para assinar com um creator por uma quantidade de dias. Sendo o valor a ser pago a fee * quantidade de dias. O valor vai ser armazenado no campo amount.

Um creator pode comprar todo conteúdo de outro creator pagando o valor da recisão. Com isso, todo subs do que assinou com o creator que vendeu seu conteúdo passa a ser inscrito do comprador.

A aplicação pode acessada por meio do [link](https://vilsonrodrigues.github.io/blockchain/onlysubs_dapp/)

O contrato desenvolvido tem conta: 0x315CA6f78F95E6D24E8008837FB1B19e5359B5E1

### Principais trechos de código do contrato

#### Structs

```
    struct Creator {
        uint[] idMsgs;
        string name;
        uint fee;         
        uint salesValue;
        bool active;        
        uint amount;
    }
```    
Um criador pode desativar sua conta. Dentro da struct temos um array com os identificadores da mensagem. Ao cadatrar uma nova mensagem, o creator armazena a posição dela na struct de mensagens, que pode ser visto a seguir
```
    struct Msg {
        string title;
        string author;
        uint date;
    }
```
Essa estrutura é persistida dentro de uma arry de Msg chamado Msgs. Logo no processo de transferência de conteúdo, o id das mensagens do creator que vendeu o contéudo é repassado ao do outro creator.

Um sub possui a seguinte estrutura. O nome e um mapeamento do endereço dele é um estrutura chamada Signatures

```
    struct Subscriber {
        string name;        
        mapping(address => Signature) signatures;
    }
```

#### Operações de registro

No registro do creator é pedido o nome, fee e o sales value. Verificando se os valores são positivos
```
 function creatorRegistration(string memory _name, uint _fee, uint _salesValue) external {
        require(_fee > 0);
        require(_salesValue > 0);
        creator[msg.sender].name = _name;
        creator[msg.sender].fee = _fee;
        creator[msg.sender].salesValue = _salesValue;
        creator[msg.sender].active = true;     
        creators.push(msg.sender);
    }
 ```
 
 Para um sub a operação envolve apenas a coleta do nome do usuário 
 
 ```
 
    function subscriberRegistration(string memory _name) external {
        subscriber[msg.sender].name =_name;
        subs.push(msg.sender);
    }
```  

#### Inscrição do sub

Demanda de um endereço de um creator e o tmepo de inscrição. Antes é verificado se o usuário está ativo e o valor da taxa é suficiente
```
    function subscribe(address _creator, uint _subscriptionTime) payable external {        
        if(checkSubscriptionDependency(_creator) == true) {
            subscriber[msg.sender].signatures[_creator].expiration = (
                      block.timestamp + (_subscriptionTime * 1 days)            
            );      
        }
        creator[_creator].amount += msg.value;    
        emit Subscribe(msg.sender, _creator);    
    }
```

#### Compra de mensagens

A troca de conteúdo. Verifica se um usuário está ativo e se ele tem alguma mensagem cadastrada. Após isso ele vai adicionar em todos os subs dele a inscrição do novo dono do conteúdo
```
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
```    



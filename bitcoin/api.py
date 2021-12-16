from flask import Flask, request
from blockchain import Blockchain
import json
import argparse

#Instanciate blockchain
blockchain = Blockchain()

ap = argparse.ArgumentParser()
ap.add_argument("-p", "--port", type=str, default="5000",
	help="API PORT")
args = vars(ap.parse_args())

#Instanciate Flask
app = Flask(__name__)

api_cors_config = {
  'origins':'*',
  'methods':['POST','GET'],
  'allow_headers':['Authorization','Content-Type']
}

@app.route('/', methods=['GET'])
def home():
    return 'CodeBlocks Node '+args['port']

@app.route('/transactions/create', methods = ['POST'])
def create():  
    #request.form
    print(request.json)
    #request.data    
    blockchain.createTransaction(
        sender = request.json['sender'], 
        recipient = request.json['recipient'], 
        amount = request.json['amount'] , 
        timestamp = request.json['timestamp'], 
        privWifKey = request.json['wif']
    )  
    return "Transfer included in Blockchain", 200 

#[GET] /transactions/mempool para retornar a memory pool do nó
@app.route('/transactions/mempool', methods=['GET'])
def mempool():
    return json.dumps(blockchain.memPool), 200


"""
[GET] /mine para informar o nó para criar e minerar um novo bloco. 
Ou seja, um nó que for requisitado a partir desse end-point deve 
pegar todas as transações incluídas em seu memory pool, montar um bloco e minera-lo.
"""
@app.route('/mine', methods=['GET'])
def mine():
    if len(blockchain.memPool) > 0:
        blockchain.createBlock()
        blockchain.mineProofOfWork(blockchain.prevBlock)
        return "Mined Block", 200
    else: 
        return "Empty Mempool", 200

#[GET] /chain para retornar o blockchain completo daquele nó.
@app.route('/chain', methods=['GET'])
def chain():    
    return json.dumps(blockchain.chain), 200

"""
[POST] /nodes/register para aceitar uma lista de novos nós no formato de URLs. Note que 
já existe uma variável do tipo conjunto (set) chamado nodes para armazenar os nós registrados.    
"""
@app.route('/nodes/register', methods = ['POST'])
def register(): 
    if request.json['nodes'] is None:
        return "List of Nodes is empty", 200
    else:    
        for node in request.json['nodes']:
            blockchain.nodes.add(node)
        return "List of Nodes added to Node. Actual list: " +str(blockchain.nodes), 200

"""
[GET] /nodes/resolve para executar o modelo de consenso, resolvendo conflitos e 
garantindo que contém a cadeia de blocos correta. Basicamente o que deve ser feito
pelo nó é solicitar a todos os seus nós registrados os seus respectivos blockchains. 
Então deve-se conferir se o blockchain é válido, e, se for maior (mais longo) que o 
atual, deve substitui-lo.    
"""
@app.route('/nodes/resolve', methods=['GET'])
def resolve():      
    #Se existir 
    if len(blockchain.nodes) > 0:
        blockchain.resolveConflicts()
        return "Converged Blockchains", 200   
    else:
        return "Empty chain friend list", 200    

"""
[POST] /chain/converge recebe do broadcast uma blockchain
mais profunda e devolve ao mempool as transações que tinham
sido confirmadas no ultimo blockchain
"""
@app.route('/chain/converge', methods=['POST'])
def converge():
    print('Iniciando o convergimento da rede')
    #Atualiza sua blockchain e devolve ao mempool as transferencias    
    blockchain.update_blockchain(request.json['deep_blockchain'])
    return 'Blockchain Updated',200       
if __name__ == '__main__':
    app.run(port=int(args['port']))
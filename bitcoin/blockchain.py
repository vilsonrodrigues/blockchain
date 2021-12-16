import hashlib
import json
from time import time
import copy
import random
import bitcoinlib # pip install bitcoin
import urllib3

http = urllib3.PoolManager()

DIFFICULTY = 4 # Quantidade de zeros (em hex) iniciais no hash valido.

class Blockchain(object):

    def __init__(self):
        self.chain = []
        self.memPool = []
        self.nodes = set() # Conjunto para armazenar os nós registrados.
        self.createGenesisBlock()

    def createGenesisBlock(self):
        # Cria o bloco genêsis
        self.createBlock(previousHash='0'*64, nonce=0)
        self.mineProofOfWork(self.prevBlock) 

    def createBlock(self, nonce=0, previousHash=None):
        # Retorna um novo bloco criado e adicionado ao blockchain (ainda não minerado).
        if (previousHash == None):
            previousBlock = self.chain[-1]
            previousBlockCopy = copy.copy(previousBlock)
            previousBlockCopy.pop("transactions", None)

        block = {
            'index': len(self.chain) + 1,
            'timestamp': int(time()),
            'transactions': self.memPool,
            'merkleRoot': self.generateMerkleRoot(self.memPool),
            'nonce': nonce,
            'previousHash': previousHash or self.generateHash(previousBlockCopy),
        }

        self.memPool = []
        self.chain.append(block)
        return block

    def mineProofOfWork(self, prevBlock):
        # Retorna o nonce que satisfaz a dificuldade atual para o bloco passado como argumento.
        nonce = 0
        while self.isValidProof(prevBlock, nonce) is False:
            nonce += 1

        return nonce

    def createTransaction(self, sender, recipient, amount, timestamp, privWifKey):
        # Cria uma nova transação, assinada pela chave privada WIF do remetente.
        tx = {
            'sender': sender,
            'recipient': recipient,
            'amount': amount,
            'timestamp': timestamp
        }
 
        tx['signature'] = Blockchain.sign(privWifKey, json.dumps(tx, sort_keys=True))
        self.memPool.append(tx)

        return self.prevBlock['index'] + 1

    def isValidChain(self, chain):
        # Dado uma chain passada como parâmetro, faz toda a verificação se o blockchain é válido:
        # 1. PoW válido
        # 2. Transações assinadas e válidas
        # 3. Merkle Root válido
        
        #Se tiver apenas o genesis
        if len(chain) == 1:
            return True

        #Indice do Bloco seguinte ao genesis
        current_index =  1
        try:
            while current_index < len(chain):
                #Bloco anterior 
                last_block = chain[current_index-1]
                #Bloco atual
                block = chain[current_index]
                #Nonce do bloco anterior
                nonce = last_block['nonce']
                #1. Verifica o PoW
                Blockchain.isValidProof(block, nonce)
                #Itera sobre as transações e verifica se estão assinadas
                for transaction in block['transactions']:                
                    Blockchain.verifySignature(address = transaction['sender'],
                                                signature = transaction['signature'],
                                                message = json.dumps(transaction,sort_keys=True))
                #Verifica se o merkle root esta correto
                assert(block['merkleRoot'] == Blockchain.generateMerkleRoot(block['transactions']))
                current_index += 1
                return True
        except:
            return False

    @staticmethod
    def request_chain(node):
        return json.loads(http.request('GET', node+'/chain').data)

    #Recebe uma nova blockchain e devolve ao mempool as transferencias
    def update_blockchain(self, deep_blockchain):
        #Antiga blockchain desse Node devolve as transferencias ao mempool    
        #Se não tiver apenas o genesis
        if len(self.chain) > 1:                         
            for block in self.chain:
                for transaction in block.transactions:
                    self.mempool.append(transaction)
        #Atualiza a blockchain para a mais profunda    
        self.chain = deep_blockchain
        print(self.chain)
        return True

    def resolveConflicts(self):
        # Consulta todos os nós registrados, e verifica se algum outro nó tem um blockchain com mais PoW e válido. Em caso positivo,
        # substitui seu próprio chain.
        #Lista para armazenar blockchains validas e outra para armazenar seu tamanho
        valid_blockchain_list = []
        size_blockchain_valid_list = []
        #Itera na lista de nodes amigos que foram registrados
        for node in self.nodes:                        
            #Se a blockchain do node amigo for valida
            blockchain_fork = Blockchain.request_chain(node)            
            if self.isValidChain(blockchain_fork):
                #Adiciona nas listas
                valid_blockchain_list.append(blockchain_fork)
                size_blockchain_valid_list.append(len(blockchain_fork))
        #Maior das blockchains vizinhas
        max_blockchain = max(size_blockchain_valid_list)
        #Indice da maior blockchain
        max_index = size_blockchain_valid_list.index(max_blockchain)
        #A blockchain mais profunda dos vizinhos
        deep_blockchain = valid_blockchain_list[max_index]
        #Se a blockchain desse node for maior que a mais profunda dos vizinhos
        if len(self.chain) >= max_blockchain:
            #Envia para os nós amigos a blockchain desse Node
            #e eles enviam de volta as transações a mempool deles
             self.broadcast_chain()                    
        else:
            #Atualiza sua blockchain e devolve ao mempool as transferencias
            self.update_blockchain(deep_blockchain)                    
        return True
    #Envia para os nodes amigos a blockchain a blockchain desse Node
    def broadcast_chain(self):    
        #Itera na lista de nodes amigos que foram registrados
        print('Disparando broadcast da blockchain desse Node aos Nodes amigos')
        for node in self.nodes:   
            encoded_data = json.dumps({'deep_blockchain':self.chain}).encode('utf-8')
            http.request(
                 'POST',
                  node+'/chain/converge',
                  body=encoded_data,
                  headers={'Content-Type': 'application/json'})                         
        return 


    @staticmethod
    def generateMerkleRoot(transactions):
        # Gera a Merkle Root de um bloco com as respectivas transações.
        if (len(transactions) == 0): # Para o bloco genesis
            return '0'*64

        txHashes = [] 
        for tx in transactions:
            txHashes.append(Blockchain.generateHash(tx))

        return Blockchain.hashTxHashes(txHashes)

    @staticmethod
    def hashTxHashes(txHashes):
        # Função auxiliar recursiva para cálculo do MerkleRoot
        if (len(txHashes) == 1): # Condição de parada.
            return txHashes[0]

        if (len(txHashes)%2 != 0): # Confere se a quantidade de hashes é par.
            txHashes.append(txHashes[-1]) # Se não for, duplica o último hash.

        newTxHashes = []
        for i in range(0,len(txHashes),2):        
            newTxHashes.append(Blockchain.generateHash(Blockchain.generateHash(txHashes[i]) + Blockchain.generateHash(txHashes[i+1])))
        
        return Blockchain.hashTxHashes(newTxHashes)

    @staticmethod
    def isValidProof(block, nonce):
        # Retorna True caso o nonce satisfaça a dificuldade atual para o bloco passado como argumento.
        block['nonce'] = nonce
        guessHash = Blockchain.getBlockID(block)
        return guessHash[:DIFFICULTY] == '0' * DIFFICULTY 

    @staticmethod
    def generateHash(data):
        # Retorna o SHA256 do argumento passado.
        blkSerial = json.dumps(data, sort_keys=True).encode()
        return hashlib.sha256(blkSerial).hexdigest()

    @staticmethod
    def getBlockID(block):
        # Retorna o ID (hash do cabeçalho) do bloco passado como argumento.
        blockCopy = copy.copy(block)
        blockCopy.pop("transactions", None)
        return Blockchain.generateHash(blockCopy)

    @property
    def prevBlock(self):
        # Retorna o último bloco incluído no blockchain.
        return self.chain[-1]

    @staticmethod
    def getWifCompressedPrivateKey(private_key=None):
        # Retorna a chave privada no formato WIF-compressed da chave privada hex.
        if private_key is None:
            private_key = bitcoinlib.random_key()
        return bitcoinlib.encode_privkey(bitcoinlib.decode_privkey((private_key + '01'), 'hex'), 'wif')
        
    @staticmethod
    def getBitcoinAddressFromWifCompressed(wif_pkey):
        # Retorna o endereço Bitcoin da chave privada WIF-compressed.
        return bitcoinlib.pubtoaddr(bitcoinlib.privkey_to_pubkey(wif_pkey))

    @staticmethod
    def sign(wifCompressedPrivKey, message):
        # Retorna a assinatura digital da mensagem e a respectiva chave privada WIF-compressed.
        return bitcoinlib.ecdsa_sign(message, wifCompressedPrivKey)

    @staticmethod
    def verifySignature(address, signature, message):
        # Verifica se a assinatura é correspondente a mensagem e o endereço BTC.
        # Você pode verificar aqui também: https://tools.bitcoin.com/verify-message/
        return bitcoinlib.ecdsa_verify(message, signature, address)
    
    def printChain(self):        
            blockchain = copy.deepcopy(self.chain)        
            print(" ----------------------------- BLOCKCHAIN ---------------------------")
            for block in reversed(blockchain):                                      
                previousHash = Blockchain.getBlockID(block)   
                print("                                   |                             ")
                print("                                   |                             ")
                print("_____________________________________________________________________")
                print("| ", previousHash, " |")
                print("---------------------------------------------------------------------")
                print("| Index:             Timestamp:                     Nonce:           |")
                print("|", block["index"], "                ", block["timestamp"], "                   ", 
                    block["nonce"], "               |")
                print("|                                                                    |")
                print("| Merkle Root:                                                       |")
                print("|", block["merkleRoot"], "  |")
                print("|                                                                    |")
                print("| Transactions:                                                      |")
                print("|", block["transactions"],
                    "                                                                |")
                print("|                                                                    |")
                print("| Previous Hash:                                                     |")
                print("|", block["previousHash"], "  |")
                print("---------------------------------------------------------------------")
            return

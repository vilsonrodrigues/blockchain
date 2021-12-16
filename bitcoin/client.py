from time import time
import urllib3
import requests
import json
import random

http = urllib3.PoolManager()

def mount_transactions(amount):
    transacao = {}
    transacao['sender'] = '19sXoSbfcQD9K66f5hwP5vLwsaRyKLPgXF' 
    transacao['recipient'] = '1MxTkeEP2PmHSMze5tUZ1hAV3YTKu2Gh1N' 
    transacao['amount'] = amount
    transacao['timestamp'] = int(time())
    transacao['wif'] = 'L1US57sChKZeyXrev9q7tFm2dgA2ktJe2NP3xzXRv6wizom5MN1U'
    return transacao

def send_data(PORT, data, endpoint):
    encoded_data = json.dumps(data).encode('utf-8')
    return http.request(
                 'POST',
                 'http://localhost:'+PORT+endpoint,
                  body=encoded_data,
    headers={'Content-Type': 'application/json'})
    

def create_transactions_in_node(PORT, num_transactions):
    for _ in range(num_transactions):
        amount = random.uniform(0.00000001, 100)
        transacao = mount_transactions(amount)
        send_data(PORT, transacao, endpoint='/transactions/create')

def get_in_node(PORT, endpoint):
    return http.request('GET', 'http://localhost:'+PORT+endpoint)    

def register_nodes(PORT, data):
    #Fazendo conhecer outros nodes. Rodando um node extra (5003) que não sera utilizado
    nodes_friends = send_data(PORT = PORT, data = data, endpoint = '/nodes/register')
    return nodes_friends

#Cria transações no Node 5000
print('Gerando transações no Node 5000')
create_transactions_in_node(PORT = "5000", num_transactions = 3)

#Verifica estado do mempool
print("Mempool do Node Port 5000")
print(get_in_node(PORT = "5000", endpoint='/transactions/mempool').data)

#Verifica estado do mempool no Node 5000
print('Mempool no Node 5000')
print(get_in_node(PORT = "5000", endpoint='/transactions/mempool').data)

#minera bloco no Node 5000
get_in_node(PORT = "5000", endpoint='/mine')
print('Minerando bloco no Node 5000')

#Minera bloco no Node 5000 com transacao vazia
print('Minerando bloco no Node 5000')
print(get_in_node(PORT = "5000", endpoint='/mine').data)

#captura a blockchain do Node 5000
print('Blockchain no node 5000')
print(get_in_node(PORT = "5000", endpoint='/chain').data)

#Faz o node 5000 conhecer os outros 2
print('Registrando Nodes no Node 5000')
nodes_5000 = {'nodes':['http://localhost:5001','http://localhost:5003']}
print(register_nodes(PORT = '5000', data = nodes_5000).data)

#Consenso no Node 5000
print('Realizando consenso no Node 5000')
print(get_in_node(PORT = "5000", endpoint='/nodes/resolve').data)

#Cria 7 transações no Node 5001
create_transactions_in_node(PORT = "5001", num_transactions = 7)

#Minera bloco no Node 5001 com transacao vazia
print('Minerando bloco no Node 5001')
print(get_in_node(PORT = "5001", endpoint='/mine').data)

#captura a blockchain do Node 5001
print('Blockchain no node 5001')
print(get_in_node(PORT = "5001", endpoint='/chain').data)

nodes_5001 = {'nodes':['http://localhost:5000','http://localhost:5003']}
nodes_5003 = {'nodes':['http://localhost:5000','http://localhost:5001']}
register_nodes(PORT = '5001', data = nodes_5001)
register_nodes(PORT = '5003', data = nodes_5003)
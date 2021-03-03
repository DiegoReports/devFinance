const Modal = {
  open() {
    // Abrir Modal
    // Adicionar a class active ao modal
    document.querySelector('.modal-overlay')
      .classList // Lista de classes
      .add('active') // adicione a class...
  },
  close() {
    // Fechar o modal
    // Remover a class active do modal
    document.querySelector('.modal-overlay')
      .classList // Lista de classes
      .remove('active')
  }
}

const Storage = {
  get() { //Convertendo String para JSON
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) ||
    []
  },

  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),
  
  //Atalho p/todas as transações (Levando em conta que transactions estará me LocalStorage)
  //=== Função ADICIONAR ==/
  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },

  //=== Função REMOVER ==/
  remove(index) { //Metodo splice: procurar um indice dentro do array
    Transaction.all.splice(index, 1)

    App.reload()
  },

  incomes() {
    let income = 0;
    // Soma de Entradas | Todas as transações
    // para cada
    Transaction.all.forEach(transaction => {
      // SE > 0
      if (transaction.amount > 0) {
        // Somar a uma váriavel e retornar var
        income += transaction.amount;
      }
    })

    return income;
  },
  expenses() {
    // Soma de Saídas
    let expense = 0;
    // Soma de Saidas | Todas as transações
    // para cada
    Transaction.all.forEach(transaction => {
      // SE < 0
      if (transaction.amount < 0) {
        // Somar a uma váriavel e retornar var
        expense += transaction.amount;
      }
    })

    return expense;
  },
  total() {
    // Entradas (-) Saídas

    return Transaction.incomes() + Transaction.expenses();
  }
}

// Substituir Dados do HTML com os Dados do JS
const DOM = {
  // Buscando o Id data-table que contenha o tbody
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },
  // Montando o HTML
  innerHTMLTransaction(transaction, index) {

    // Trocando a classe quando for "Entrada" (Verificação)
    const CSSclass = transaction.amount > 0 ? "income" : "expense"

    // Realizando formatação da Moeda $ (line92)
    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
    
    <td class="description">${transaction.description}</td>
    <td class="${CSSclass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td>
      <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
    </td>
    
    `
    return html
  },

  updateBalance() {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total())

  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ""
  }
}

const Utils = {
  formatAmount(value) {
    value = value * 100
    
    return Math.round(value)
  },

  formatDate(date) {
    // Fazendo a separação da Data AAAA-MM-DD
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    // Variavel p/forçar que o value seja um Number
    const signal = Number(value) < 0 ? "-" : ""
    //Funcionalidade replace que faz a troca
    // \D = encontre tudo que não for valor
    value = String(value).replace(/\D/g, "") // Aqui o tipo de Dado passa a ser STRING

    value = Number(value) / 100

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value
  }
}

//=== FORMULARIO ===/
const Form = {
  // Guardando Elementos inputs para fazer validação
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  //Colentando os valores dos inputs
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validadeFields() {
    // Guardando os valores dentro de Váriaveis
    const { description, amount, date } = Form.getValues()

    // Verificando se estão vazios ou não
    // Usamos trim() p/fazer limpeza de espaços vazios
    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === "") {
      throw new Error("Por favor, preencha todos os campos")
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  saveTransaction(transaction) {
    Transaction.add(transaction)
  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validadeFields() // -> Verifica se os campos são validos
          // Formatar dados para Save
      const transaction = Form.formatValues()
      // Salvar
      Transaction.add(transaction)
      /* Form.saveTransaction(transaction) */
      // Apagar os dados do Form
      Form.clearFields()
      // Fechar o Modal
      Modal.close()

    } catch (error) {
      alert(error.message)
    }
  }
}
/* // Pegando objetos do Array
DOM.addTransaction(transactions[0])
DOM.addTransaction(transactions[1])
DOM.addTransaction(transactions[2]) */




//====== EXECUÇÕES ======//

const App = {
  init() {
    // forEach é uma funcionalidade que funciona p/objeto do tipo Array
    // "Para cada transação rode uma funcionalidade na transação do momento"
    Transaction.all.forEach(DOM.addTransaction)
    // Atualizando os cartões
    DOM.updateBalance()

    Storage.set(Transaction.all)

  },
  // Limpando a pagina e repopulando com o init()
  reload() {
    DOM.clearTransactions()
    App.init()
  },
}

App.init()

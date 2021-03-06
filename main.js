// get the DOM
const budgetType = document.querySelector(".add__type");
const description = document.querySelector(".add__description");
const value = document.querySelector(".add__value");
const inputBtn = document.querySelector(".add__btn");
const incomeContainer = document.querySelector(".income__list");
const expenseContainer = document.querySelector(".expenses__list");
const budgetLAbel = document.querySelector(".budget__value");
const incomeLabel = document.querySelector(".budget__income--value");
const expenseLabel = document.querySelector(".budget__expenses--value");
const percentageLabel = document.querySelector(".budget__expenses--percentage");
const container = document.querySelector(".container");

//APP DATA CONTROLLER
const budgetController = (() => {
  const Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const calculateTotal = type => {
    var sum = 0;
    data.allItems[type].forEach(cur => {
      sum = sum + cur.value;
    });
    data.totals[type] = sum;
  };

  //data
  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    //create new item and add the item to items array
    addItem: (type, des, val) => {
      let newItem, ID;
      //create new id
      // if (data.allItems[type].length > 0) {
      //   ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      // } else {
      //   ID = 0;
      // }

      id = new Date().getTime();

      //create new item based on the type
      if (type === "exp") {
        newItem = new Expense(id, des, val);
      } else if (type === "inc") {
        newItem = new Income(id, des, val);
      }
      //push to data array according to type
      data.allItems[type].push(newItem);
      console.log(data);
      //return new item
      return newItem;
    },

    deleteItem: (type, id) => {
      let ids = data.allItems[type].map(curr => {
        return curr.id;
      });
      let index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: () => {
      // calculate total
      calculateTotal("inc");
      calculateTotal("exp");
      //calcumate budget income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      //calculate the percentage
      if (data.percentage < 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: () => {
      console.log(data);
    }
  };
})();

//UI CONTROLLER
const UIController = (() => {
  return {
    getInput: () => {
      return {
        budgetType: budgetType.value, //will either be inc or exp
        description: description.value,
        value: parseFloat(value.value)
      };
    },

    addListItem: (obj, type) => {
      let html;
      let element;
      //create html string with place holder
      if (type === "inc") {
        element = incomeContainer;
        html = `<div class="item clearfix" id="inc-${obj.id}">
                  <div class="item__description">${obj.description}</div>
                  <div class="right clearfix">
                    <div class="item__value">+ ${obj.value}</div>
                    <div class="item__delete">
                      <button class="item__delete--btn">
                        <i class="ion-ios-close-outline"></i>
                      </button>
                    </div>
                  </div>
                </div>`;
      } else if (type === "exp") {
        element = expenseContainer;
        html = `
          <div class="item clearfix" id="exp-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
              <div class="item__value">- ${obj.value}</div>
              <div class="item__percentage">21%</div>
                <div class="item__delete">
                  <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
          </div>`;
      }
      //insert the html into the DOM
      element.insertAdjacentHTML("beforeend", html);
    },

    displayBudget: obj => {
      //manipulate the dom
      budgetLAbel.innerHTML = obj.budget;
      incomeLabel.innerHTML = obj.totalInc;
      expenseLabel.innerHTML = obj.totalExp;

      if (obj.percentage > 0) {
        percentageLabel.innerHTML = obj.percentage + "%";
      } else {
        percentageLabel.innerHTML = "-";
      }
    },

    deleteListItem: selectorId => {
      let el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    clearfields: () => {
      description.value = "";
      value.value = "";
      //set focus back to the description
      description.focus();
    }
  };
})();

//GLOBAL APP CONTROLLER => link between DATA and UI
const controller = ((budgetCtrl, UICtrl) => {
  //event listeners
  const setUpEventLisetener = () => {
    //click on add button or press enter
    inputBtn.addEventListener("click", addItem);
    document.addEventListener("keypress", e => {
      if (e.keyCode === 13 || e.which === 13) {
        addItem();
      }
    });
    //listen for events on delete button
    container.addEventListener("click", ctrlDeleteItem);
  };

  const updateBudget = () => {
    // calculate total budget
    budgetController.calculateBudget();
    // return the budget
    const budget = budgetController.getBudget();
    // display the budget
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = () => {
    //calculate the percentages
    //read from the budget controller
    // update the user interface
  };

  //add item function
  const addItem = () => {
    let input, newItem;
    //1. get input field data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. add item to the budget controller
      newItem = budgetCtrl.addItem(
        input.budgetType,
        input.description,
        input.value
      );
      //add new item to the user interface
      UICtrl.addListItem(newItem, input.budgetType);
      //clear fields
      UICtrl.clearfields();
      //calculate the budget and display the budget
      updateBudget();
    }
  };

  const ctrlDeleteItem = event => {
    let itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      //inc-{itemId}
      splitId = itemID.split("-");
      type = splitId[0];
      id = parseInt(splitId[1]);

      //delete the item from the data structure
      budgetCtrl.deleteItem(type, id);
      //delete item from the user interface
      UICtrl.deleteListItem(itemID);
      //update and show the new budget
      updateBudget();
    }
  };

  return {
    init: () => {
      console.log("Application Started");
      setUpEventLisetener();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
    }
  };
})(budgetController, UIController);

controller.init();

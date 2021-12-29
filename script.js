class Model {
  // Модель - хранит данные
  constructor() {
    this.todos = JSON.parse(localStorage.getItem("todos")) || [];
  }

  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback; // функция dispayTodo
  }

  _commit(todos) {
    this.onTodoListChanged(todos);
    localStorage.setItem("todos", JSON.stringify(todos));
  } // Перезагрузить страницу и сохранить todo в localStorage

  addTodo(todoText) {
    // Добавить todo. Принимает текст.
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1, // формировка id
      text: todoText, // сюда вставь текст
      complete: false,
    }; // создание todo
    this.todos.push(todo); // запуш в массив todoшек
    this._commit(this.todos);
  }
  editTodo(id, updatedText) {
    this.todos = this.todos.map((todo) => {
      todo.id === id
        ? { id: todo.id, text: updatedText, complete: todo.complete }
        : todo;
    });
    console.log(this.todos);
    this._commit(this.todos);
  }
  deleteTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
    this._commit(this.todos);
  }
  toggleTodo(id) {
    this.todos = this.todos.map((todo) => {
      return todo.id === id
        ? { id: todo.id, text: todo.text, complete: !todo.complete }
        : todo;
    });
    this._commit(this.todos);
  }
}

class View {
  constructor() {
    this.app = this.getElement("#root"); // Найди куда вставить приложение

    this.title = this.createElement("h1"); // Создай h1
    this.title.textContent = "Todos"; // Вставь в h1 текст

    this.form = this.createElement("form"); // Создай form

    this.input = this.createElement("input"); // Создай input
    this.input.type = "text"; // Тип input
    this.input.placeholder = "Add todo"; // Placeholder для input
    this.input.name = "todo"; // Name для input

    this.submitButton = this.createElement("button"); // Создай Button
    this.submitButton.textContent = "Submit"; // Вставь в button текст

    this.todoList = this.createElement("ul", "todo-list"); // Создай ul с классом
    this.form.append(this.input, this.submitButton); // Вставь input и button в form
    this.app.append(this.title, this.form, this.todoList);
  }
  get _todoText() {
    return this.input.value;
  }

  _resetInput() {
    this.input.value = "";
  }

  displayTodos(todos) {
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild);
    }
    if (todos.length === 0) {
      const p = this.createElement("p");
      p.textContent = "Nothing to do! Add a task?";
      this.todoList.append(p);
    } else {
      todos.forEach((todo) => {
        const li = this.createElement("li");
        li.id = todo.id;
        const checkbox = this.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.isComplete;

        const span = this.createElement("span");
        span.contentEditable = true;
        span.classList.add("editable");
        if (todo.isComplete) {
          const strike = this.createElement("s");
          strike.textContent = todo.text;
          span.append(strike);
        } else {
          span.textContent = todo.text;
        }

        const deleteButton = this.createElement("button", "delete");
        deleteButton.textContent = "Delete";
        li.append(checkbox, span, deleteButton);
        this.todoList.append(li);
      });
    }
  }

  bindAddTodo(handler) {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (this._todoText) {
        handler(this._todoText);
        this._resetInput();
      }
    });
  }
  bindDeleteTodo(handler) {
    this.todoList.addEventListener("click", (event) => {
      if (event.target.className === "delete") {
        const id = parseInt(event.target.parentElement.id);

        handler(id);
      }
    });
  }
  bindEditTodo(handler) {
    this.todoList.addEventListener("focusout", (event) => {
      if (this._temporaryTodoText) {
        const id = parseInt(event.target.parentElement.id);

        handler(id, this._temporaryTodoText);
        this._temporaryTodoText = "";
      }
    });
  }

  bindToggleTodo(handler) {
    this.todoList.addEventListener("change", (event) => {
      if (event.target.type === "checkbox") {
        const id = parseInt(event.target.parentElement.id);

        handler(id);
      }
    });
  }

  createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);
    return element;
  } // Создание элемента
  getElement(selector) {
    const element = document.querySelector(selector);
    return element;
  } // Поиск элемента
}

class Controller {
  constructor(model, view) {
    this.model = model; //- определям модель
    this.view = view; // - определяем представление
    this.model.bindTodoListChanged(this.onTodoListChanged); //
    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindEditTodo(this.handleEditTodo);
    this.view.bindDeleteTodo(this.handleDeleteTodo);
    this.view.bindToggleTodo(this.handleToggleTodo);
    this.onTodoListChanged(this.model.todos);
  }

  onTodoListChanged = (todos) => {
    this.view.displayTodos(todos);
  };
  handleAddTodo = (todoText) => {
    this.model.addTodo(todoText);
  };
  handleEditTodo = (id, todoText) => {
    this.model.editTodo(id, todoText);
  };

  handleDeleteTodo = (id) => {
    this.model.deleteTodo(id);
  };

  handleToggleTodo = (id) => {
    this.model.toggleTodo(id);
  };
}

const app = new Controller(new Model(), new View());

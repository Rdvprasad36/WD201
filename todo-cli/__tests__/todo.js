//Sejal todo.....

const todoList = require("../todo");

const { all, markAsComplete, add, overdue, dueToday, dueLater } = todoList();

const formattedDate = (d) => {
  return d.toISOString().split("T")[0];
};

var dateToday = new Date();

const today = formattedDate(dateToday);

const yesterday = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() - 1))
);

const tomorrow = formattedDate(
  new Date(new Date().setDate(dateToday.getDate() + 1))
);

describe("Todolist test Suite", () => {
  beforeAll(() => {
    [
      {
        title: "Summer",
        completed: false,
        dueDate: yesterday,
      },
      {
        title: "Winter",
        completed: false,
        dueDate: today,
      },
      {
        title: "Rainy",
        completed: false,
        dueDate: tomorrow,
      },
    ].forEach(add);
  });
  test("Should add new todo", () => {
    const cnt = all.length;
    expect(all.length).toBe(cnt);
    add({
      title: "todo test",
      completed: false,
      dueDate: today,
    });
    expect(all.length).toBe(cnt + 1);
  });

  test("mark a todo as completed", () => {
    expect(all[1].completed).toBe(false);
    markAsComplete(1);
    expect(all[1].completed).toBe(true);
  });

  test("overdue test", () => {
    expect(overdue().length).toBe(1);
  });

  test("dueToday test", () => {
    expect(dueToday().length).toBe(2);
  });

  test("duelater test", () => {
    expect(dueLater().length).toBe(1);
  });
});

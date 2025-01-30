//import fs from "fs";
import inquirer from "inquirer";
import dotenv from "dotenv";
import pg from "pg";
const { Pool } = pg;

dotenv.config();

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// await connectToDb();

function employeeManager() {
  console.log("**************************************");
  console.log("  ----------------------------------- ");
  console.log("  |                                 | ");
  console.log("  |             EMPLOYEE            | ");
  console.log("  |             MANAGER             | ");
  console.log("  |                                 | ");
  console.log("  ----------------------------------- ");
  console.log("**************************************");

  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "View All Roles",
          "View All Employees",
          "View All Departments",
          "Add Role",
          "Add Department",
          "Add Employee",
          "Update Employee Role",
          "Quit",
        ],
      },
    ])
    .then((answers) => {
      switch (answers.action) {
        case "View All Roles":
          viewAllRoles();
          break;

        case "View All Employees":
          viewAllEmployees();
          break;

        case "View All Departments":
          viewAllDepartments();
          break;

        case "Add Role":
          addRole();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;

        case "Quit":
          console.log("Exiting...");
          break;
      }
    });
}

employeeManager();

//TO DO: Show roles table
function viewAllRoles() {
  pool.query("SELECT * FROM role").then((res) => {
    employeeManager();
  });
}
//TO DO Show employees table
function viewAllEmployees() {}

//TO DO Show dempartments table
function viewAllDepartments() {
  pool.query("SELECT * FROM department").then((res) => {
    console.table(res.rows);
    employeeManager();
  });
}

//TODO Add a row with new Role to the role table
function addRole() {
  pool.query("SELECT * FROM department").then((res) => {
    const departments = res.rows.map((dept) => ({
      name: dept.name,
      value: dept.id,
    }));

    inquirer
      .prompt([
        {
          type: "input",
          name: "roleName",
          message: "What is the name of the role?",
        },
        {
          type: "input",
          name: "roleSalary",
          message: "What is the salary of the role?",
        },
        {
          type: "list",
          name: "roleDepartment",
          message: "Which department does this role belong to?",
          choices: departments,
        },
      ])
      .then((answers) => {
        pool
          .query(
            `INSERT INTO role (title, salary, department_id) VALUES ('${answers.roleName}', '${answers.roleSalary}', ${answers.roleDepartment})`
          )
          .then(() => {
            employeeManager();
          });
      });
  });
}

//TODO Add a row with new department to the department table
function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "departmentName",
        message: "What is the name of the department?",
      },
    ])
    .then((answers) => {
      pool
        .query(
          `INSERT INTO department (name) VALUES ('${answers.departmentName}')`
        )
        .then(() => {
          employeeManager();
        });
    });
}

function addEmployee() {
  pool.query("SELECT * FROM role").then((roles) => {
    pool
      .query("SELECT * FROM employee WHERE manager_id IS NOT NULL")
      .then((employees) => {
        const employeeChoices = employees.rows.map((emp) => ({
          name: `${emp.first_name} ${emp.last_name}`,
          value: emp.id,
        }));

        inquirer
          .prompt([
            {
              type: "input",
              name: "employeeFirstName",
              message: "What is the employee's FIRST name?",
            },
            {
              type: "input",
              name: "employeeLastName",
              message: "What is the employee's LAST name?",
            },
            {
              type: "list",
              name: "employeeRole",
              message: "What is the employee's role?",
              choices: roles.rows.map((role) => ({
                name: role.title,
                value: role.id,
              })),
            },
            {
              type: "list",
              name: "employeeManager",
              message: "Who is the employee's manager?",
              choices: employeeChoices,
            },
          ])
          .then((answers) => {
            pool
              .query(
                `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${answers.employeeFirstName}', '${answers.employeeLastName}', ${answers.employeeRole}, ${answers.employeeManager})`
              )
              .then(() => {
                employeeManager();
              });
          });
      });
  });
}

function updateEmployeeRole() {
  pool.query("SELECT * FROM employee").then((employees) => {
    pool.query("SELECT * FROM role").then((roles) => {
      const employeeChoices = employees.rows.map((emp) => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
      }));

      const roleChoices = roles.rows.map((role) => ({
        name: role.title,
        value: role.id,
      }));

      inquirer
        .prompt([
          {
            type: "list",
            name: "updateEmployee",
            message: "Which employee's role do you want to update?",
            choices: employeeChoices,
          },
          {
            type: "list",
            name: "newRole",
            message:
              "Which role do you want to assign to the selected employee?",
            choices: roleChoices,
          },
        ])
        .then((answers) => {
          pool
            .query(
              `UPDATE employee SET role_id = ${answers.newRole} WHERE id = ${answers.updateEmployee}`
            )
            .then(() => {
              employeeManager();
            });
        });
    });
  });
}

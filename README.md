# 🥛 Milk Attendance Management System

A full-stack web application designed to digitize and automate daily milk record management for small dairy businesses. This project replaces manual registers with a reliable, scalable, and easy-to-use system.


---

## 📌 Project Overview

The **Milk Attendance Management System** is a real-world, full-stack web application built to digitalize and simplify daily milk record management for small and medium-scale dairy businesses. Traditionally, many dairy owners rely on handwritten registers to track daily milk supply, customer consumption, monthly billing, and payments. This manual process is time-consuming, error-prone, and difficult to scale as the number of customers increases.

This application replaces manual bookkeeping with a **centralized, database-driven system** that ensures accuracy, transparency, and efficiency. Dairy owners can easily record daily milk attendance (morning and evening), manage customer profiles, automatically calculate monthly bills, and track payment status — all through a clean web interface.

The idea for this project was inspired by a **real family-run dairy business**, where monthly calculations and payment tracking were done manually. By observing these challenges, this system was designed as a practical solution to a genuine problem, rather than a purely academic exercise.

The project follows a **mono-repository architecture**, with clearly separated `backend` and `frontend` modules. The backend exposes RESTful APIs using Spring Boot and securely stores data in PostgreSQL, while the frontend consumes these APIs using React to provide a responsive and user-friendly experience.

Overall, this project demonstrates end-to-end full-stack development skills, including backend API design, database integration, frontend development, and real-world problem solving.

---

## 🛠 Tech Stack

### Backend

* **Java**
* **Spring Boot**
* **Spring Data JPA**
* **REST APIs**
* **PostgreSQL**
* **Maven**

### Frontend

* **React.js**
* **HTML, CSS, JavaScript**
* **Axios** (API communication)

### Tools & Platforms

* Git & GitHub
* Render (deployment)

---

## 📂 Project Structure

```
milk-attendance-system
├── backend
│   ├── src
│   ├── pom.xml
│   ├── mvnw
│   └── application.properties
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── README.md
│
└── README.md
```

---

## 🚀 Features

* Customer management (add/update/delete)
* Daily milk attendance entry
* Automatic monthly bill calculation
* Payment tracking
* Email reminders for pending dues
* RESTful API architecture
* Clean separation of frontend and backend (mono-repo)

---

## ▶️ How to Run Locally

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🎯 Learning Outcomes

* Built real-world REST APIs using Spring Boot
* Integrated PostgreSQL with JPA/Hibernate
* Designed a clean mono-repo project structure
* Connected React frontend with Java backend
* Understood deployment workflows

---

## 👤 Author

**Shashank Yadav**
Final-year Engineering Student
Aspiring Java Full Stack Developer

---

## 📌 Note

This is a **personal project**, not an academic assignment, built to solve a real-life problem and strengthen full-stack development skills.

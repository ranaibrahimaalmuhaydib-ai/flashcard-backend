# Advanced Flashcard Learning App

## Summary of the Problem
The use of traditional paper flashcards for studying can be difficults and not it is not practical especially if they are not palced in good way or if they are not disorganized. In case are used, students get lost easily and they face difficulties when it comes to update them. At this point, we have think of a solution which is creating an advanced flashcard app that can help fix that problem by giving a simple digital way to study securely. The app is very usefull and will help students create their own question-and-answer cards, organize them, and search them in real-time. With this app, students can can test their information anytime and admins can see what users studied. This is a single-page using modern frontend libraries in which all elements are in one page and that makes it less distracting.

## Technical Stack
* **Frontend:** React (Vite) and React Router for routing.
* **Styling:** Custom CSS (it includes custom modal designs and responsive layout features).
* **Routing / Backend:** Node.js with Express.js (handles API endpoints, JWT authentication and bcrypt for passwords).
* **Data:** MySQL database (connected via the mysql2 Node package) with multiple tables to ensure persistent data storage.
* **Deployment:** Runs locally on local server via `localhost:3000` for backend and `localhost:5173` for React.

## Feature List
* **Registration/login:** User authentication using password hashing and JWT to make the app secure.
* **Live search:** A search bar that filters the flashcards in real-time as the user types in the keyboard.
* **User profile:** An admin can view all users' learning history and see what cards they clicked.
* **Single-Page Application (SPA) Architecture:** All interactions happen in same page and the user does not have to reload the web page.
* **Full CRUD Functionality:** Users can Create, Read, Update, and Delete flashcards in a dynamic way.
* **Interactive Study Mode:** Cards flip to reveal answers on click and automatically hide the answer after 3 seconds to enforce active recall.
* **Custom UI Modals:** Replaced standard, ugly browser prompts with custom-styled HTML/CSS modals for editing, deleting, and form validation alerts.
* **Toggleable Interface:** There is a button named "Show/Hide" which can be used to show or hide the insertion form. This way, the area study remain clean and focused.

## Folder Structure
I have organized teh proejct as follow:

* **`backend/`**: This folder has all server codes.
  * `server.js`: This is where my backend Node/Express server. The file contains codes to handles all MySQL database queries (GET, POST, PUT, DELETE) and also JWT login.
  * `package.json` & `node_modules/`: Created by Node to manage project dependencies like express, cors, bcryptjs, jsonwebtoken, and mysql2.
* **`frontend/`**: This folder has all React codes.
  * `src/App.jsx`: The frontend React that handles the clicks of the user. In this file, I also handeled opens modals, live search, and sends axios requests to the server.
  * `src/index.css`: This is where I placed all styling, layout constraints. I also put some custom CSS for the popup modals.
  * `src/main.jsx`: The main file to run React in the browser.

## How to Run (First Time)
**1. Install Prerequisites:** Ensure there is Node.js and a local MySQL server installed.

**2. Setup Database:** Open Mysql and Execute the sql query to create `flashcard_advanced_db`, `users`, `cards`, and `history` tables.

**3. Update Credentials:** Open `server.js` in the backend folder and change the host, database username and password.
Change these lines:
```javascript
host: 'localhost',
user: 'root',
password: '',

4. Install Packages: Open your terminal in the backend folder and run:
npm install express mysql2 cors bcryptjs jsonwebtoken

Then open another terminal in the frontend folder and run:
npm install react-router-dom axios

5. Start the App: In the backend terminal, run the command:
node server.js

In the frontend terminal, run the command:
npm run dev

6. Open the Browser (e.g., Chrome) and type the link: http://localhost:5173/

Challenges Overcome
One of the main challenges was connecting the React frontend to the backend using axios and JWT tokens. It was diffuclt for us because we had to send the token in every request to keep it secure and everything should work without reloading the page. Another challenge was puttign all codes together and tasks coordonation. That part took us time to put all together. we have also had to carefully manage the React state using useState and useEffect. In simple words, the flashcard list and live search should be updatd instantly on the screen whenever we performed any action (create, edit, delete a card, or type in the search bar). This was difficult and we faced some error in that, but eventually we fixed them and all worked properly. On the other hand, it was also difficult to build a custom CSS modals in React to replace default browser alerts. The final challenge is we had to manage some routing errors with React Router to protect the admin page. It was diffcult in the begenining. However, after learning how to use React correctly, we were able to perform all routes and features correctly.
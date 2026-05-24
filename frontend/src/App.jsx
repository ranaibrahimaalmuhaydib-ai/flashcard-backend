import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';

const srvLnk = "http://localhost:3000/api";

axios.interceptors.request.use(cnf => {
  const tk = localStorage.getItem('token');
  if (tk) cnf.headers.Authorization = `Bearer ${tk}`;
  return cnf;
});

// I started with the Admin page 
function HistAdminPg() {
  const [hstry, setHstry] = useState([]);

  useEffect(() => {
    axios.get(`${srvLnk}/admin/history`)
      .then(rs => setHstry(rs.data))
      .catch(er => alert("OOPS: You are not an admin!"));
  }, []);

  return (
    <div>
      <h2>User Learning History (Admin Only)</h2>
      <table className="history-table">
        <thead>
          <tr><th>Date/Time</th><th>User</th><th>Card Studied</th></tr>
        </thead>
        <tbody>
          {hstry.map((h, i) => (
            <tr key={i}>
              <td>{new Date(h.viewed_at).toLocaleString()}</td>
              <td>{h.username}</td>
              <td>{h.question}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoginRegPage({ setAuthStatus }) {
  const [chkLgn, setChkLgn] = useState(true);
  const [usrNm, setUsrNm] = useState("");
  const [psWd, setPsWd] = useState("");
  const navg = useNavigate();

  const doSubmitForm = async () => {
    try {
      if (chkLgn) {
        const rs = await axios.post(`${srvLnk}/login`, { username: usrNm, password: psWd });
        localStorage.setItem('token', rs.data.token);
        localStorage.setItem('role', rs.data.role);
        localStorage.setItem('username', rs.data.username);
        setAuthStatus(true);
        navg('/dashboard');
      } else {
        await axios.post(`${srvLnk}/register`, { username: usrNm, password: psWd });
        alert("Registered! Please login.");
        setChkLgn(true);
      }
    } catch (er) {
      alert(er.response?.data?.error || "Error occurred");
    }
  };

  return (
    <div className="auth-box">
      <h2>{chkLgn ? "Login" : "Register"}</h2>
      <input placeholder="Username" value={usrNm} onChange={e => setUsrNm(e.target.value)} />
      <input type="password" placeholder="Password" value={psWd} onChange={e => setPsWd(e.target.value)} />
      <br />
      <button onClick={doSubmitForm}>{chkLgn ? "Login" : "Register"}</button>
      <p style={{ cursor: 'pointer', color: 'blue' }} onClick={() => setChkLgn(!chkLgn)}>
        {chkLgn ? "Need an account? Register here." : "Have an account? Login."}
      </p>
    </div>
  );
}
// Here is the main dahsboard 



function MainDash() {
  const [dtLst, setDtLst] = useState([]);
  const [srchTrm, setSrchTrm] = useState("");
  const [qIn, setQIn] = useState("");
  const [aIn, setAIn] = useState("");

  const [shwAns, setShwAns] = useState({});
  const [hdnCrd, setHdnCrd] = useState({});

  const [shFrm, setShFrm] = useState(false);
  const [wrnDt, setWrnDt] = useState(false);

  const [edMdl, setEdMdl] = useState(false);
  const [edId, setEdId] = useState(null);
  const [edQ, setEdQ] = useState("");
  const [edA, setEdA] = useState("");

  const [dlMdl, setDlMdl] = useState(false);
  const [crdId, setCrdId] = useState(null);

  const getTheCrdLst = async () => {
    const rs = await axios.get(`${srvLnk}/cards`);
    setDtLst(mixDtUp(rs.data));
  };

  useEffect(() => { getTheCrdLst(); }, []);

  function opnDelBox(id_num) {
    setCrdId(id_num);
    setDlMdl(true);
  }

  const doDelCnfrm = async () => {
    await axios.delete(`${srvLnk}/cards/${crdId}`);
    clsDelBx();
    getTheCrdLst();
  };

  function clsDelBx() {
    setDlMdl(false);
  }

  function mixDtUp(x) {
    let arr = [...x];
    for (let rIndex = arr.length - 1; rIndex > 0; rIndex--) {
      let jIndex = Math.floor(Math.random() * (rIndex + 1));
      [arr[rIndex], arr[jIndex]] = [arr[jIndex], arr[rIndex]];
    }
    return arr;
  }

  // Your requested Refresh Flashcards button logic!
  const doCDRefresh = () => {
    setHdnCrd({});
  };

  const doMakeNewCard = async () => {
    if (qIn === "" || aIn === "") {
      setWrnDt(true);
      return;
    }
    await axios.post(`${srvLnk}/cards`, { q: qIn, a: aIn });
    setQIn(""); setAIn("");
    getTheCrdLst();
  };

  function toggleFmBtn() {
    setShFrm(!shFrm);
  }

  function openEdBox(c_id, o_Q, o_A) {
    setEdId(c_id);
    setEdQ(o_Q);
    setEdA(o_A);
    setEdMdl(true);
  }

  const clkCrdHndl = async (id, evnt) => {
    if (evnt.target.tagName === "BUTTON") return;
    await axios.post(`${srvLnk}/history`, { card_id: id });
    setShwAns(p => ({ ...p, [id]: true }));
    setTimeout(() => {
      setShwAns(p => ({ ...p, [id]: false }));
      setHdnCrd(p => ({ ...p, [id]: true }));
    }, 3000);
  };

  const doSvEdits = async () => {
    if (edQ === "" || edA === "") {
      setWrnDt(true);
      return;
    }
    await axios.put(`${srvLnk}/cards/${edId}`, { q: edQ, a: edA });
    clsEdBx();
    getTheCrdLst();
  };

  function clsEdBx() {
    setEdMdl(false);
  }

  function clsNotif() {
    setWrnDt(false);
  }

  const fltrdData = dtLst.filter(rw =>
    rw.question.toLowerCase().includes(srchTrm.toLowerCase())
  );

  return (
    <div>
      <button onClick={toggleFmBtn} style={{ marginBottom: '15px', backgroundColor: '#555' }}>
        Show / Hide Add Card Form
      </button>

      {shFrm && (
        <div className="Main_Card">
          <h3>Make a New Flashcard</h3>
          <input placeholder="Write your question" value={qIn} onChange={e => setQIn(e.target.value)} /> <br /><br />
          <input placeholder="Write your answer" value={aIn} onChange={e => setAIn(e.target.value)} /> <br /><br />
          <button onClick={doMakeNewCard}>Add Flashcard</button>
        </div>
      )}

      <hr style={{ marginTop: '20px' }} />

      <button onClick={doCDRefresh} style={{ backgroundColor: '#ff9800', marginRight: '10px' }}>
        Refresh Flashcards
      </button>
      <div>
        <input
          className="search-bar"
          placeholder="🔍 Live Search Flashcards..."
          value={srchTrm}
          onChange={e => setSrchTrm(e.target.value)}
        />
      </div>

      <h2>Your Flashcards:</h2>
      <div id="cardList">
        {fltrdData.map(rw => {
          if (hdnCrd[rw.id]) return null;

          return (
            <div key={rw.id} className="flashcard" onClick={(e) => clkCrdHndl(rw.id, e)}>
              <h3>{rw.question}</h3>
              {shwAns[rw.id] && <p className="answer-text">{rw.answer}</p>}
              <br />
              <button onClick={(e) => { e.stopPropagation(); openEdBox(rw.id, rw.question, rw.answer); }} style={{ backgroundColor: '#4CAF50' }}>Edit Card</button>
              <button onClick={(e) => { e.stopPropagation(); opnDelBox(rw.id); }}>Delete Card</button>
            </div>
          );
        })}
      </div>

      {edMdl && (
        <div className="mymodal" style={{ display: 'flex' }}>
          <div className="mdBody">
            <h3>Edit Flashcard</h3>
            <input value={edQ} onChange={e => setEdQ(e.target.value)} placeholder="Write your question" />
            <br /><br />
            <input value={edA} onChange={e => setEdA(e.target.value)} placeholder="Write your answer" />
            <br /><br />
            <button onClick={doSvEdits} style={{ backgroundColor: '#4CAF50' }}>Save Changes</button>
            <button onClick={clsEdBx} style={{ backgroundColor: 'gray' }}>Cancel</button>
          </div>
        </div>
      )}

      {dlMdl && (
        <div className="mymodal" style={{ display: 'flex' }}>
          <div className="mdBody">
            <h3>Are you sure?</h3>
            <p>Are you sure to delete this flashcard?</p>
            <br />
            <button onClick={doDelCnfrm} style={{ backgroundColor: '#ff4d4d' }}>Yes, Delete</button>
            <button onClick={clsDelBx} style={{ backgroundColor: 'gray' }}>No, Cancel</button>
          </div>
        </div>
      )}

      {wrnDt && (
        <div className="mymodal" style={{ display: 'flex' }}>
          <div className="mdBody">
            <h3>Warning</h3>
            <p>Please fill in all information!</p>
            <br />
            <button onClick={clsNotif} style={{ backgroundColor: '#008CBA' }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}



export default function App() {
  const [isAuthOk, setIsAuthOk] = useState(!!localStorage.getItem('token'));
  const rle = localStorage.getItem('role');
  const usr = localStorage.getItem('username');

  const doLgOut = () => {
    localStorage.clear();
    setIsAuthOk(false);
  };

  return (
    <BrowserRouter>
      {isAuthOk && (
        <div className="nav-bar">
          <h3>Welcome, {usr}</h3>
          <div>
            <a href="/dashboard"><button>Study Cards</button></a>
            {rle === 'admin' && <a href="/admin"><button>Admin History</button></a>}
            <button style={{ backgroundColor: '#ff4d4d' }} onClick={doLgOut}>Logout</button>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={!isAuthOk ? <LoginRegPage setAuthStatus={setIsAuthOk} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthOk ? <MainDash /> : <Navigate to="/" />} />
        <Route path="/admin" element={isAuthOk && rle === 'admin' ? <HistAdminPg /> : <Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
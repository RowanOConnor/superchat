import React, { useState, useRef } from 'react';

import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

if (firebase.apps.length === 0) {
  firebase.initializeApp({
    apiKey: process.env.API_KEY,
    authDomain: 'superchat-9338e.firebaseapp.com',
    projectId: 'superchat-9338e',
    storageBucket: 'superchat-9338e.appspot.com',
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
  });
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className='App'>
      <header className='App-header'>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {
  const messagesCollection = firestore.collection('messages');
  const query = messagesCollection.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, { idField: 'id' });

  const scroll = useRef();

  const [inputValue, setInputValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    setInputValue('');

    const { uid, photoURL } = auth.currentUser;

    await messagesCollection.add({
      text: inputValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: uid,
      photoURL: photoURL
    });

    scroll.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
        <div ref={scroll}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={inputValue}
          placeholder='Share something interesting'
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type='submit'>🕊️</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, photoURL, uid } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt='profile-img' />
      <p>{text}</p>
    </div>
  );
}

export default App;

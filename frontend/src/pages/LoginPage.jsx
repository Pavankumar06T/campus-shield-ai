import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // Adjust path if needed
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Added setDoc here

const LoginPage = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 1. Check Firestore for the user's role
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        // 2. Redirect based on existing role
        if (role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/student');
        }
      } else {
        // 3. NEW USER LOGIC: Create the document in Firestore
        console.log("Creating new student profile...");
        
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'student', // Defaulting every new login to student
          createdAt: new Date()
        });

        navigate('/student');
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Check the console for details.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6' }}>
      <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '10px' }}>🛡️ Campus Shield AI</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Secure Campus Intelligence</p>
        
        <button 
          onClick={handleGoogleLogin}
          style={{ 
            padding: '12px 24px', 
            fontSize: '16px', 
            cursor: 'pointer', 
            backgroundColor: '#4285F4', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '0 auto'
          }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};


export default LoginPage;
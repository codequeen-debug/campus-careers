import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function register(email, password, role, name) {
    // Only allow seeker and recruiter roles
    if (!["seeker", "recruiter"].includes(role)) {
      throw new Error("Invalid role: only 'seeker' and 'recruiter' roles are allowed for registration");
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const userDoc = {
      id: result.user.uid,
      name,
      email,
      role,
      status: role === "recruiter" ? "Pending" : "Active",
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", result.user.uid), userDoc);
    setUserData(userDoc);
    setUserRole(role);
    return result;
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setUserData(null);
    setUserRole(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            const data = snap.data();
            setUserRole(data.role || null);
            setUserData({ id: user.uid, ...data });
          }
        } catch (e) {
          console.error("Error fetching user data:", e);
        }
      } else {
        setUserRole(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userData,
    register,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
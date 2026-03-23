'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInAnonymously, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from './Toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  signIn: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isGuest: false,
  signIn: async () => {},
  signInAsGuest: async () => {},
  logOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Ensure user profile exists in Firestore
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              targetRoles: [],
              preferredIndustries: [],
              academicBackground: '',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (error) {
          console.error("Failed to fetch or create user profile:", error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast('Signed in successfully!', 'success');
    } catch (error: any) {
      console.error('Error signing in', error);
      toast('Failed to sign in. Please try again.', 'error');
    }
  };

  const signInAsGuest = async () => {
    try {
      const result = await signInAnonymously(auth);
      const guestUser = result.user;
      setIsGuest(true);
      await updateProfile(guestUser, { displayName: 'Demo User' });

      // Seed demo data
      const demoSkills = [
        { name: 'React', category: 'Technical', proficiency: 4, evidence: 'Built 3 production apps' },
        { name: 'Python', category: 'Technical', proficiency: 4, evidence: 'ML projects & automation scripts' },
        { name: 'Node.js', category: 'Technical', proficiency: 3, evidence: 'REST API development' },
        { name: 'TypeScript', category: 'Technical', proficiency: 3, evidence: 'Full-stack Next.js apps' },
        { name: 'Communication', category: 'Soft Skill', proficiency: 4, evidence: 'Led team presentations' },
      ];
      const demoProjects = [
        { name: 'AI Career Mentor', description: 'AI-powered career guidance platform with memory', techStack: ['Next.js', 'Firebase', 'LangChain'], role: 'Full Stack Developer', outcome: 'Hackathon submission' },
        { name: 'E-Commerce Platform', description: 'Full-stack online store with payment integration', techStack: ['React', 'Node.js', 'MongoDB'], role: 'Frontend Lead', outcome: '500+ monthly users' },
      ];
      const demoApps = [
        { company: 'Google', role: 'Software Engineering Intern', status: 'Applied', applicationDate: '2026-03-01', notes: 'Applied via university portal' },
        { company: 'Microsoft', role: 'SDE Intern', status: 'Interviewing', applicationDate: '2026-02-15', notes: 'Passed OA, waiting for phone screen' },
        { company: 'Amazon', role: 'SDE Intern', status: 'Rejected', applicationDate: '2026-01-20', notes: 'Failed final round system design' },
      ];

      for (const skill of demoSkills) {
        await setDoc(doc(db, 'users', guestUser.uid, 'skills', skill.name), skill);
      }
      for (const proj of demoProjects) {
        await setDoc(doc(db, 'users', guestUser.uid, 'projects', proj.name), proj);
      }
      for (const app of demoApps) {
        await setDoc(doc(db, 'users', guestUser.uid, 'applications', `${app.company}-${app.role}`), app);
      }
      
      toast('Guest session started with demo data!', 'success');
    } catch (error: any) {
      console.error('Error starting guest session:', error);
      if (error.code === 'permission-denied') {
        toast('Seeding failed: Please update Firestore Security Rules in Firebase Console.', 'error');
      } else if (error.code === 'auth/admin-restricted-operation' || error.code === 'auth/operation-not-allowed') {
        toast('Demo Mode requires Anonymous Auth enabled in Firebase Console.', 'error');
      } else {
        toast('Failed to start demo. Please check Firestore permissions.', 'error');
      }
    }
  };

  const logOut = async () => {
    try {
      setIsGuest(false);
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, signIn, signInAsGuest, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

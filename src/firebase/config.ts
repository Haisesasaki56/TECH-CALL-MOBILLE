import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAut-1id339LgGxQoSgIYnqGrAlE4LJxE",
  authDomain: "techcall-cti.firebaseapp.com",
  projectId: "techcall-cti",
  storageBucket: "techcall-cti.firebasestorage.app",
  messagingSenderId: "99410529837",
  appId: "1:99410529837:web:39b8ad07b39ac85c56c4a4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// Identificador do aluno - usado para isolar os dados de cada
// um dentro do mesmo projeto Firebase compartilhado da turma.
// Cada aluno deve trocar este valor pelo seu RA.
export const ALUNO_ID = 'RA2457008';

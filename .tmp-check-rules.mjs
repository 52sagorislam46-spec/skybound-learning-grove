import { readFileSync } from "node:fs";
const src = readFileSync("/dev-server/src/lib/firebase.ts", "utf8");
const cfg = {};
for (const k of ["apiKey","authDomain","projectId","storageBucket","messagingSenderId","appId"]) {
  const m = src.match(new RegExp(k + ':\\s*"([^"]+)"'));
  if (m) cfg[k] = m[1];
}
const { initializeApp } = await import("firebase/app");
const fa = await import("firebase/auth");
const fs2 = await import("firebase/firestore");
const app = initializeApp(cfg);
const auth = fa.getAuth(app);
const db = fs2.getFirestore(app);
const out = [];
try {
  const c = await fa.signInAnonymously(auth);
  out.push("anonymous sign-in: OK (uid " + c.user.uid.slice(0, 6) + ")");
} catch (e) {
  out.push("anonymous sign-in: FAILED " + (e?.code || e?.message));
}
try {
  const s = await fs2.getDocs(fs2.query(fs2.collection(db, "users"), fs2.limit(1)));
  out.push("logged-out read users: OK, docs=" + s.size);
} catch (e) {
  out.push("logged-out read users: BLOCKED " + (e?.code || e?.message));
}
try {
  const s = await fs2.getDocs(fs2.query(fs2.collection(db, "posts"), fs2.limit(1)));
  out.push("logged-out read posts: OK, docs=" + s.size);
} catch (e) {
  out.push("logged-out read posts: BLOCKED " + (e?.code || e?.message));
}
console.log(out.join("\n"));

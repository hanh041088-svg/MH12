import { doc, onSnapshot, serverTimestamp, setDoc, arrayUnion, collection } from "firebase/firestore";
import { db } from "./firebaseAuth";
import { StudentAccount, TeacherStudentSummary, TestResult } from "../types";

export async function saveStudentResultToCloud(
  student: StudentAccount,
  result: TestResult
): Promise<void> {
  await setDoc(
    doc(db, "studentResults", student.id),
    {
      studentId: student.id,
      studentCode: student.studentCode,
      name: student.name,
      className: student.className,
      email: student.email || `${student.studentCode.toLowerCase()}@student.mhtin12.app`,
      results: arrayUnion(result),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function subscribeStudentSummaries(
  onData: (students: TeacherStudentSummary[]) => void,
  onError?: (error: Error) => void
): () => void {
  return onSnapshot(
    collection(db, "studentResults"),
    (snapshot) => {
      const students = snapshot.docs.map((item) => {
        const data = item.data();
        const results = (data.results || []) as TestResult[];
        const scores = results.map((result) => Number(result.score) || 0);
        const weakTopics = Array.from(
          new Set(results.filter((result) => result.score < 7).map((result) => result.lessonTitle))
        );
        return {
          id: item.id,
          name: data.name || data.studentCode || "Học sinh",
          email: data.email || "",
          className: data.className || "Chưa xếp lớp",
          testsCompleted: results.length,
          averageScore:
            scores.length > 0
              ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1))
              : 0,
          highestScore: scores.length > 0 ? Math.max(...scores) : 0,
          lastActive: data.updatedAt?.toDate?.().toLocaleString("vi-VN") || "Vừa cập nhật",
          weakTopics,
          recentScores: results.slice(0, 5).map((result) => ({
            lessonTitle: result.lessonTitle,
            score: result.score,
          })),
        } satisfies TeacherStudentSummary;
      });
      onData(students);
    },
    (error) => onError?.(error)
  );
}

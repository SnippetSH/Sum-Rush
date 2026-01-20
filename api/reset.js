// api/reset.js (임시 파일 생성)
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    await kv.flushall(); // 모든 데이터 삭제
    return res.status(200).json({ message: "DB Initialized" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 1. GET 요청: 랭킹 조회
  if (req.method === 'GET') {
    try {
      // 'leaderboard' 키에서 점수가 높은 순(rev)으로 0~9등(10명) 가져오기
      // withScores: true 옵션으로 점수와 닉네임을 같이 가져옴
      const ranking = await kv.zrange('leaderboard', 0, 9, {
        rev: true,
        withScores: true
      });

      // Redis 반환값은 [닉네임, 점수, 닉네임, 점수...] 형태이므로
      // 보기 좋게 [{ nickname: 'A', score: 100 }, ...] 형태로 변환
      const result = [];
      for (let i = 0; i < ranking.length; i += 2) {
        result.push({ nickname: ranking[i], score: ranking[i + 1] });
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 2. POST 요청: 점수 등록 (최고 기록 갱신)
  if (req.method === 'POST') {
    try {
      const { nickname, score } = req.body;

      if (!nickname || typeof score !== 'number') {
        return res.status(400).json({ message: '닉네임과 숫자 점수가 필요합니다.' });
      }

      // ZADD 명령어 실행
      // member: 닉네임, score: 점수
      // { gt: true }: "Greater Than" 옵션. 기존 점수보다 클 때만 업데이트함 (Redis 기능)
      await kv.zadd('leaderboard', { score: score, member: nickname }, { gt: true });

      return res.status(200).json({ message: '점수가 처리되었습니다.' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 그 외 메소드 거부
  return res.status(405).json({ message: 'Method Not Allowed' });
}


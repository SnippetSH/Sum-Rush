import { createClient } from 'redis';

// 1. Redis 클라이언트 초기화 (핸들러 외부)
// 이렇게 하면 람다 컨테이너가 살아있는 동안 연결을 재사용할 수 있습니다.
const client = createClient({
  url: process.env.REDIS_URL, // .env에 REDIS_URL 정의 필요
});

client.on('error', (err) => console.error('Redis Client Error', err));

export default async function handler(req, res) {
  // 2. DB 연결 (연결이 닫혀있을 때만 연결 시도)
  if (!client.isOpen) {
    await client.connect();
  }

  // 3. GET 요청: 랭킹 조회
  if (req.method === 'GET') {
    try {
      // zRangeWithScores: 점수와 값을 객체 배열로 반환
      // REV: true (내림차순, 랭킹이므로)
      const { limitTime = '120' } = req.query;
      const allowedTime = ['120', '180', '240'];
      if (!allowedTime.includes(limitTime)) {
        return res.status(400).json({ message: `Invalid limitTime: ${limitTime}` });
      }

      const key = `leaderboard:${limitTime}`;
      const ranking = await client.zRangeWithScores(key, 0, 9, {
        REV: true
      });

      // ranking은 [{value: '닉네임', score: 100}, ...] 형태
      const result = ranking.map(item => ({
        nickname: item.value, // node-redis v4에서는 'value'가 멤버 값
        score: item.score
      }));

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 4. POST 요청: 점수 등록
  if (req.method === 'POST') {
    try {
      // Vercel Function에서 req.body는 자동으로 파싱됩니다 (JSON인 경우)
      const { nickname, score, limitTime } = req.body;

      if (!nickname || typeof score !== 'number' || !limitTime) {
        return res.status(400).json({ message: '닉네임과 숫자 점수가 필요합니다.' });
      }

      const key = `leaderboard:${limitTime}`;
      // GT: true (Greater Than, 신기록일 때만 업데이트)
      await client.zAdd(key, {
        score: score,
        value: nickname,
      }, { GT: true });

      return res.status(200).json({ message: '점수가 처리되었습니다.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }

  // 그 외 메소드
  return res.status(405).json({ message: 'Method Not Allowed' });
}
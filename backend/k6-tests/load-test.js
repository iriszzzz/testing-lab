import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // 30秒內線性增加到 50 人
    { duration: '30s', target: 10 },  // 維持 50 人持續 1 分鐘
    { duration: '30s', target: 0 },  // 30秒內降回 0 人
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% 的請求要在 500ms 內完成
    http_req_failed: ['rate<0.01'],   // 錯誤率要小於 1%
  },
};

export default function () {
  const res = http.get('http://127.0.0.1:8888/api/v1/todos');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
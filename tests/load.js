import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '5m',
};

export default function () {
  http.get('http://localhost:3022/api/health'); // Replace with a real endpoint
  sleep(1);
}

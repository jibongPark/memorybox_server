#!/bin/bash

# 트래픽 한도 (2TB = 2,000,000 MiB)
LIMIT=2000000
# vnstat 사용 월
CUR_MONTH=$(date +'%Y-%m')
# 트래픽 초과시 플래그 파일
FLAG_FILE="/tmp/traffic_blocked.flag"

# vnstat에서 이번달 송수신량(MiB) 합계 추출 (최신 vnstat 기준)
USAGE=$(vnstat --json m | grep -A3 "\"$CUR_MONTH\"" | grep -E '"rx":|"tx":' | awk '{sum+=$2} END {print int(sum/1024)}')

# 플래그 파일에 저장된 차단 시점의 월
BLOCKED_MONTH=""
if [ -f "$FLAG_FILE" ]; then
  BLOCKED_MONTH=$(cat $FLAG_FILE)
fi

if [ "$USAGE" -ge "$LIMIT" ]; then
  echo "$CUR_MONTH" > $FLAG_FILE
  echo "트래픽 초과! ($USAGE MiB), 서비스 차단!"
  sudo systemctl stop nginx
  sudo ufw deny 80/tcp
  sudo ufw deny 443/tcp
  pm2 stop all
else
  # 만약 이전에 차단된 상태였다가, 월이 바뀌면 플래그 해제+서비스 재개
  if [ "$BLOCKED_MONTH" != "" ] && [ "$BLOCKED_MONTH" != "$CUR_MONTH" ]; then
    echo "월초! 트래픽 차단 해제, 서비스 재개!"
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo systemctl start nginx
    pm2 start all
    rm -f $FLAG_FILE
  fi
  echo "정상 사용량 ($USAGE MiB), 서비스 정상 운영."
fi

#!/bin/bash
# Chạy tuần tự các clip. Trước mỗi clip, nếu có file TAM-DUNG thì chờ.
for id in "$@"; do
  while [ -f TAM-DUNG ]; do sleep 10; done
  echo "== clip $id"
  bash gen1.sh $id || { echo "✗ DỪNG ở clip $id"; exit 1; }
  echo "✓ xong clip $id"
done
echo "TẤT CẢ XONG"

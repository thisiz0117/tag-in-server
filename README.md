## Docker 실행
### 기본 실행
백그라운드로 컨테이너를 띄웁니다.
```
docker-compose up -d
```

### 로그 확인
서비스 이름은 compose 파일에 정의한 이름으로 바꿔주세요.
```
docker-compose logs -f ytdlp
```

### 컨테이너 내부 명령 실행 (yt-dlp 실행 등)
```
docker-compose run --rm ytdlp [yt-dlp 옵션]
예: docker-compose run --rm ytdlp -f best https://...
```

### 중지/삭제
```
docker-compose down
```
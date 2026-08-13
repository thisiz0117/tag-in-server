FROM python:3.12-alpine
 
RUN apk add --no-cache ffmpeg
 
RUN pip install --no-cache-dir yt-dlp
 
RUN adduser -D -h /downloads ytdlp
USER ytdlp
WORKDIR /downloads
 
ENTRYPOINT ["yt-dlp"]
CMD ["--help"]
 
import { Injectable } from '@nestjs/common'
import { execFile } from 'child_process'
import { mkdir } from 'fs/promises'
import { promisify } from 'util'
import { ExtractionAudioOption } from './dto/extraction-audio.option'
import { ExtractionThumbnailOption } from './dto/extraction-thumbnail.option'
import { ExtractionVideoOption } from './dto/extraction-video.option'
import { VideoQuality } from './constant/video-quality.enum'

@Injectable()
export class MediaProseccerService {
  private readonly execFileAsync = promisify(execFile)
  private readonly outDir = './downloads'
  private readonly mediaId = 1

  async getThumnail(option: ExtractionThumbnailOption): Promise<void> {
    const outputPath = this.getOutputFilePath(option.userId, 'jpg')

    await mkdir(this.outDir, { recursive: true })

    await this.execFileAsync('yt-dlp', [
      '--write-thumbnail',
      '--skip-download',
      '--convert-thumbnails',
      'jpg',
      '-o',
      outputPath,
      option.url,
    ])
  }

  async getAudio(option: ExtractionAudioOption): Promise<void> {
    const outputPath = this.getOutputFilePath(option.userId, 'mp3')

    await mkdir(this.outDir, { recursive: true })

    await this.execFileAsync('yt-dlp', [
      '-x',
      '--audio-format',
      'mp3',
      '--audio-quality',
      '0',
      '-o',
      outputPath,
      option.url,
    ])
  }

  async getVideo(option: ExtractionVideoOption): Promise<void> {
    const outputPath = this.getOutputFilePath(option.userId, 'mp4')

    await mkdir(this.outDir, { recursive: true })

    const qualityArgs = this.getVideoQualityArgs(option.quality)

    await this.execFileAsync('yt-dlp', [
      ...qualityArgs,
      '--merge-output-format',
      'mp4',
      '-o',
      outputPath,
      option.url,
    ])
  }

  private getOutputFilePath(userId: string, extension: string): string {
    return `${this.outDir}/${userId}-${this.mediaId}.${extension}`
  }

  private getVideoQualityArgs(quality: VideoQuality): string[] {
    switch (quality) {
      case VideoQuality.LOW:
        return ['-f', 'best[height<=360]/best', '-S', 'res:360']
      case VideoQuality.HIGH:
      default:
        return ['-f', 'bestvideo+bestaudio/best', '-S', 'res:1080,ext:mp4']
    }
  }
}

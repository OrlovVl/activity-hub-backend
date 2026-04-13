import { Injectable } from '@nestjs/common';
import * as S3 from 'aws-sdk';

@Injectable()
export class FilesService {
  private readonly endpoint = process.env.MINIO_ENDPOINT;
  private readonly accessKeyId = process.env.MINIO_ACCESS_KEY;
  private readonly secretAccessKey = process.env.MINIO_SECRET_KEY;
  private readonly defaultBucket = process.env.MINIO_BUCKET || 'activity-hub';
  private readonly isStorageConfigured = Boolean(
    this.endpoint && this.accessKeyId && this.secretAccessKey,
  );

  private readonly s3 = new S3.S3({
    endpoint: this.endpoint,
    accessKeyId: this.accessKeyId,
    secretAccessKey: this.secretAccessKey,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  });

  private async ensureBucket(bucket: string) {
    try {
      await this.s3.headBucket({ Bucket: bucket }).promise();
    } catch (e: any) {
      // MinIO/S3 returns 404/NotFound/NoSuchBucket codes when bucket is missing.
      const code = e?.code || e?.name;
      if (code === 'NotFound' || code === 'NoSuchBucket' || code === 404) {
        await this.s3.createBucket({ Bucket: bucket }).promise();
        return;
      }
      throw e;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    bucket: string = this.defaultBucket,
  ) {
    // Fast fallback for environments without object storage (e.g. Render free):
    // keep app behavior working by storing inline image data URL in DB.
    if (!this.isStorageConfigured) {
      const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      return {
        url: dataUrl,
        key: `inline-${Date.now()}-${file.originalname}`,
      };
    }

    await this.ensureBucket(bucket);

    const uploadResult = await this.s3
      .upload({
        Bucket: bucket,
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    return {
      url: uploadResult.Location,
      key: uploadResult.Key,
    };
  }
}

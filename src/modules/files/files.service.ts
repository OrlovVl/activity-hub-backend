import { Injectable } from '@nestjs/common';
import * as S3 from 'aws-sdk';

@Injectable()
export class FilesService {
  private readonly endpoint =
    process.env.MINIO_ENDPOINT || 'http://localhost:9000';
  private readonly accessKeyId = process.env.MINIO_ACCESS_KEY || 'minioadmin';
  private readonly secretAccessKey =
    process.env.MINIO_SECRET_KEY || 'minioadminpassword';
  private readonly defaultBucket = process.env.MINIO_BUCKET || 'activity-hub';

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

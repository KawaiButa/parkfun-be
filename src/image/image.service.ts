import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Image } from "./image.entity";

@Injectable()
export class ImageService {
  constructor(@InjectRepository(Image) private imageRepository: Repository<Image>) {}

  async create(data: Pick<Image, "url">): Promise<Image> {
    const image = this.imageRepository.create(data);
    await this.imageRepository.save(image);
    return image;
  }
  async get(id: number): Promise<Image> {
    return await this.imageRepository.findOne({ where: { id } });
  }
}

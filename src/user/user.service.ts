import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./user.entity";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "./dtos/createUser.dto";
import { RoleService } from "src/role/role.service";
import { ImageService } from "src/image/image.service";
import { constant } from "src/constant";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private roleService: RoleService,
    private imageService: ImageService,
    private dataSource: DataSource
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, role, phoneNumber, image } = createUserDto;
    const [roleEntity, imageEntity] = await Promise.all([
      this.roleService.getOneBy({ name: role }),
      this.imageService.create({ url: image ?? constant.DEFAULT_AVATAR_URL }),
    ]);
    if (!roleEntity) {
      throw new BadRequestException("Role does not exist");
    }
    const isExisted = await this.userRepository.findOne({
      where: [
        {
          email,
        },
        {
          phoneNumber,
        },
      ],
    });
    if (isExisted) {
      if (isExisted.email === email) throw new ConflictException("An account registered with email has already exists");
      throw new ConflictException("The phone number is already been registered");
    }

    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    queryRunner.startTransaction();
    try {
      const user = this.userRepository.create({
        ...createUserDto,
        image: imageEntity,
        role: roleEntity,
      });
      await this.userRepository.save(user);
      return user;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  async getAll(): Promise<User[]> {
    return await this.userRepository.find();
  }
  async delete(id: number): Promise<string> {
    const result = await this.userRepository.delete({ id });
    if (!result.affected) {
      throw new NotFoundException("User not found");
    }
    return "Successfully delete the user";
  }
  async getOneBy(props: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOneBy(props);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async update(id: number, updateDto: Partial<Omit<User, "id" | "image"> & { image: string }>) {
    const oldUser = await this.userRepository.findOne({
      where: { id },
      relations: {
        image: true,
      },
    });
    let image = oldUser.image;
    if (oldUser.image.url.includes("defaultUserAvatar") && updateDto.image) {
      image = await this.imageService.create({ url: updateDto.image });
    }
    const result = await this.userRepository.update(id, { ...updateDto, image });
    if (!result.affected) throw new NotFoundException("Cannot find the user");
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        image: true,
      },
    });
    return user;
  }
  async getOne(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
      relations: {
        role: true,
        image: true,
      },
    });
  }
}

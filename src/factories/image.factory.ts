import { Image } from "src/image/image.entity";
import { setSeederFactory } from "typeorm-extension";

export default setSeederFactory(Image, (faker) => {
  const image = new Image();
  image.url = faker.image.url();
  return image;
});

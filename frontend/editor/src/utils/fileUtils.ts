import { FileRefrence } from "../api";

export function getImageLink(files: FileRefrence[]) {
  // check if file is an image and return the link
  const image = files.find(file => file.mime.startsWith("image"));
  if (image) {
    return image.link;
  }
}
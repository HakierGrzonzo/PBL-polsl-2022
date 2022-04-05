import { FileReference } from "../api";

export function getImageLink(files: FileReference[]) {
  // check if file is an image and return the link
  const image = files.find(file => file.mime.startsWith("image"));
  if (image) {
    return image.link;
  }
  return null
}

export function getFilesTypes(files: FileReference[]) {
  return files.map(file => file.mime);
}

export function checkFiContainAllFiles(files: FileReference[]) {
  if(files.length < 2) {
    return false;
  }
  const filesTypes = getFilesTypes(files).map(file => file.split("/")[0]);
  return filesTypes.includes("image") && filesTypes.includes("audio") && filesTypes.includes("text");
}

